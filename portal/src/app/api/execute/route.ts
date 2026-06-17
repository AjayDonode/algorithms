/**
 * POST /api/execute
 *
 * Hybrid execution strategy:
 *  - LOCAL DEV (NODE_ENV=development):
 *      Java, Python, JS all run via child_process on the host machine.
 *      Security layers: rate limiting, static analysis, size limits,
 *      resource limits (JVM flags, ulimit), timeout, output cap, temp-dir isolation.
 *
 *  - PRODUCTION (NODE_ENV=production, e.g. Firebase App Hosting):
 *      JavaScript → runs via Node.js (available in the serverless runtime)
 *      Java, Python → proxied to the Piston API (free, open-source sandbox)
 *      No child_process spawning needed; Piston handles sandboxing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec }                      from 'child_process';
import { promisify }                 from 'util';
import { writeFile, mkdir, rm, access } from 'fs/promises';
import { tmpdir }                    from 'os';
import { join }                      from 'path';
import { randomUUID }                from 'crypto';

import { validate, type Lang }       from './validator';
import { checkRateLimit }            from './rateLimiter';

const execAsync = promisify(exec);
const IS_PROD   = process.env.NODE_ENV === 'production';

// ── Self-hosted execution server (preferred for production) ──
// Set EXEC_SERVER_URL in your Firebase App Hosting env vars, e.g.:
//   https://your-exec-server.railway.app
// Leave unset to fall back to the Piston public API.
const EXEC_SERVER_URL = process.env.EXEC_SERVER_URL || '';
const EXEC_API_SECRET = process.env.EXEC_API_SECRET || '';

// ── Piston API (fallback when EXEC_SERVER_URL is not set) ────
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const PISTON_LANG_MAP: Record<string, { language: string; version: string }> = {
  java:   { language: 'java',   version: '15.0.2' },
  python: { language: 'python', version: '3.10.0' },
};

// ── Self-hosted exec server proxy ──────────────────────────
async function runViaExecServer(
  lang: 'java' | 'python' | 'javascript',
  code: string,
): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (EXEC_API_SECRET) headers['x-api-secret'] = EXEC_API_SECRET;

  const res = await fetch(`${EXEC_SERVER_URL}/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ lang, code }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    return NextResponse.json({
      stdout: '',
      stderr: `⚠ Exec server error: ${res.status} ${res.statusText}`,
      time: 0,
      source: 'exec-server',
    });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// ── Piston fallback ──────────────────────────────────────────
async function runViaPiston(
  lang: 'java' | 'python',
  code: string,
  t0: number,
): Promise<Response> {
  const { language, version } = PISTON_LANG_MAP[lang];
  const filename = lang === 'java' ? 'Main.java' : 'main.py';

  // For Java, wrap bare code the same way as local execution
  const finalCode = lang === 'java' ? wrapJava(code) : code;

  const pistonRes = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      version,
      files: [{ name: filename, content: finalCode }],
      stdin: '',
      args: [],
      compile_timeout: 15000,
      run_timeout: 8000,
      compile_memory_limit: -1,
      run_memory_limit: 65536, // 64MB
    }),
  });

  if (!pistonRes.ok) {
    return NextResponse.json({
      stdout: '',
      stderr: `⚠ Piston API error: ${pistonRes.status} ${pistonRes.statusText}`,
      time: Date.now() - t0,
      source: 'piston',
    });
  }

  const result = await pistonRes.json() as {
    compile?: { stdout: string; stderr: string; code: number };
    run:      { stdout: string; stderr: string; code: number };
  };

  // Compile errors take priority for Java
  if (result.compile && result.compile.code !== 0) {
    return NextResponse.json({
      stdout: '',
      stderr: result.compile.stderr || 'Compilation failed',
      time: Date.now() - t0,
      source: 'piston',
      phase: 'compile',
    });
  }

  return NextResponse.json({
    stdout: result.run.stdout,
    stderr: result.run.stderr,
    time: Date.now() - t0,
    source: 'piston',
  });
}




// ── Limits ─────────────────────────────────────────────────
const COMPILE_TIMEOUT = 15_000;  // ms  (javac cold-start can be slow)
const RUN_TIMEOUT     =  8_000;  // ms  (hard kill on infinite loops)
const MAX_OUT_CHARS   = 50_000;  // truncate huge output

// ── Helpers ─────────────────────────────────────────────────
function cap(s: string): string {
  return s.length > MAX_OUT_CHARS
    ? s.slice(0, MAX_OUT_CHARS) + `\n\n[... output truncated at ${MAX_OUT_CHARS} chars]`
    : s;
}

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

async function commandExists(cmd: string): Promise<boolean> {
  try { await execAsync(`which ${cmd}`, { timeout: 2000 }); return true; }
  catch { return false; }
}

// ── Validate a user-supplied filesystem path ─────────────────
// Must be absolute and contain only safe characters — no shell metacharacters.
function isValidPath(p: string): boolean {
  return (
    typeof p === 'string' &&
    p.startsWith('/') &&
    /^[\/a-zA-Z0-9._\-\s]+$/.test(p) &&
    !p.includes('..') // no directory traversal
  );
}

// ── Resolve the javac/java bin directory ─────────────────────
// Priority: custom javaHome from request → ALGOVERSE_JAVA_HOME env →
//           JAVA_HOME env → /usr/libexec/java_home → common paths → which
async function resolveJavaBinDir(customHome?: string): Promise<string | null> {
  const candidates: string[] = [];

  // 1. Custom path provided by the user in the Scratchpad settings
  if (customHome && isValidPath(customHome)) candidates.push(customHome);

  // 2. Env var overrides
  if (process.env.ALGOVERSE_JAVA_HOME) candidates.push(process.env.ALGOVERSE_JAVA_HOME);
  if (process.env.JAVA_HOME)           candidates.push(process.env.JAVA_HOME);

  // 3. macOS /usr/libexec/java_home — finds the active JDK
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await execAsync('/usr/libexec/java_home 2>/dev/null', { timeout: 3000 });
      if (stdout.trim()) candidates.push(stdout.trim());
    } catch { /* not available */ }
  }

  // 4. Common Homebrew + system locations
  candidates.push(
    '/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home',
    '/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home',
    // Azul Zulu (popular macOS JDK)
    '/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home',
    '/Library/Java/JavaVirtualMachines/zulu-11.jdk/Contents/Home',
    '/usr/lib/jvm/java-21-openjdk-amd64',
    '/usr/lib/jvm/java-17-openjdk-amd64',
  );

  // Check each JAVA_HOME candidate for bin/javac
  for (const home of candidates) {
    if (!home) continue;
    const javacBin = join(home.trim(), 'bin', 'javac');
    if (await fileExists(javacBin)) return join(home.trim(), 'bin');
  }

  // 5. Last resort: resolve `which javac` to get bin directory
  try {
    const { stdout } = await execAsync('which javac', { timeout: 2000 });
    const p = stdout.trim();
    if (p) return p.replace('/javac', '');
  } catch { /* not on PATH */ }

  return null;
}


// ── Sanitise environment passed to child processes ──────────
// Strip any secrets/tokens that happen to be in the parent env.
// NOTE: do NOT set JAVA_TOOL_OPTIONS / _JAVA_OPTIONS / JDK_JAVA_OPTIONS to
// empty strings — the JVM still prints "Picked up X: " for any set variable,
// even an empty one.  Simply omitting them prevents the noise entirely.
function safeEnv(): NodeJS.ProcessEnv {
  const allowed = new Set([
    'PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP',
    'LANG', 'LC_ALL', 'LC_CTYPE',
    'USER', 'LOGNAME', 'SHELL',
    'JAVA_HOME', 'JDK_HOME',
  ]);
  const env: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (allowed.has(k)) env[k] = v;
  }
  // Explicitly exclude JVM noise-generating vars — do NOT set them to ''
  // (setting to '' still causes "Picked up X: " to appear in stderr)
  return env as NodeJS.ProcessEnv;
}

// ── Strip JVM diagnostic noise from stderr ───────────────────
// Filters lines like:
//   "NOTE: Picked up JDK_JAVA_OPTIONS: "
//   "Picked up JAVA_TOOL_OPTIONS: "
//   "Picked up _JAVA_OPTIONS: "
function stripJvmNoise(s: string): string {
  return s
    .split('\n')
    .filter(line => !/^(NOTE:\s+)?Picked up [A-Z_]+:/.test(line.trim()))
    .join('\n')
    .trim();
}

// ── Java code wrapper ────────────────────────────────────────
// Lets users write bare code without a class definition
function wrapJava(code: string): string {
  if (/\bpublic\s+class\b/.test(code)) return code; // already a full class
  return [
    'import java.util.*;',
    'import java.util.stream.*;',
    'import java.util.function.*;',
    '',
    'public class Main {',
    '    public static void main(String[] args) throws Exception {',
    ...code.split('\n').map(l => '        ' + l),
    '    }',
    '}',
  ].join('\n');
}

// ── Main handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {

  // ── Layer 1: Rate limiting ────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        detail: `Too many executions. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`,
        retryAfterMs: rl.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // ── Parse body ────────────────────────────────────────────
  let body: { lang: Lang; code: string; javaHome?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { lang, code, javaHome } = body;
  if (!lang || !code) {
    return NextResponse.json({ error: 'Missing lang or code' }, { status: 400 });
  }

  // ── Layer 2 & 3: Static analysis + size limits ────────────
  const { safe, violations } = validate(lang, code);
  if (!safe) {
    return NextResponse.json(
      {
        error: 'Code blocked by security policy',
        violations,
        hint: 'The scratchpad is for educational algorithm practice only.',
      },
      { status: 422 },
    );
  }

  // ── Production: proxy to self-hosted server OR Piston fallback ───
  if (IS_PROD && (lang === 'java' || lang === 'python')) {
    if (EXEC_SERVER_URL) {
      return runViaExecServer(lang, code) as unknown as Response;
    }
    // No self-hosted server configured — fall back to Piston
    return runViaPiston(lang, code, Date.now()) as unknown as Response;
  }

  // ── Layer 7: Isolated temp directory ─────────────────────
  const runId  = randomUUID();
  const tmpDir = join(tmpdir(), `algoverse-${runId}`);
  const t0     = Date.now();

  const env    = safeEnv();

  try {
    await mkdir(tmpDir, { recursive: true });

    // ── Java ─────────────────────────────────────────────
    if (lang === 'java') {
      // Resolve bin directory: custom path → env vars → auto-detect → which
      const binDir = await resolveJavaBinDir(javaHome);
      if (!binDir) {
        return NextResponse.json({
          stdout: '',
          stderr: [
            '⚠ Could not find javac.',
            '',
            'Options:',
            '  1. Install a JDK:  brew install openjdk@21',
            '  2. Set JAVA_HOME in portal/.env.local',
            '  3. Enter your JDK path in the Scratchpad Settings (⚙ icon)',
          ].join('\n'),
          time: Date.now() - t0,
          source: 'local',
          javaAvailable: false,
        });
      }

      const javacBin = join(binDir, 'javac');
      const javaBin  = join(binDir, 'java');
      await writeFile(join(tmpDir, 'Main.java'), wrapJava(code), 'utf-8');

      // Compile using resolved javac binary
      try {
        await execAsync(`"${javacBin}" Main.java`, {
          cwd: tmpDir,
          timeout: COMPILE_TIMEOUT,
          env,
        });
      } catch (e: unknown) {
        const err = e as { stderr?: string; message?: string };
        return NextResponse.json({
          stdout: '',
          stderr: cap(stripJvmNoise(err.stderr || err.message || 'Compilation failed')),
          time: Date.now() - t0,
          source: 'local',
          javaAvailable: true,
          phase: 'compile',
          resolvedBin: binDir,
        });
      }

      // Run with JVM resource caps using resolved java binary
      const jvmFlags = [
        '-Xmx64m',
        '-Xss512k',
        '-XX:+UseSerialGC',
        '-XX:TieredStopAtLevel=1',
      ].join(' ');

      let stdout = '', stderr = '';
      try {
        const r = await execAsync(`"${javaBin}" ${jvmFlags} -cp . Main`, {
          cwd: tmpDir,
          timeout: RUN_TIMEOUT,
          env,
        });
        stdout = r.stdout;
        stderr = stripJvmNoise(r.stderr); // strip "Picked up X:" noise
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; killed?: boolean; message?: string };
        stdout = err.stdout || '';
        stderr = err.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s — possible infinite loop or OutOfMemoryError.`
          : cap(stripJvmNoise(err.stderr || err.message || 'Runtime error'));
      }

      return NextResponse.json({
        stdout: cap(stdout),
        stderr: cap(stderr),  // already noise-stripped above
        time: Date.now() - t0,
        source: 'local',
        javaAvailable: true,
        resolvedBin: binDir,
        remaining: rl.remaining,
      });
    }

    // ── Python ────────────────────────────────────────────
    if (lang === 'python') {
      const pyBin = (await commandExists('python3')) ? 'python3'
                  : (await commandExists('python'))  ? 'python'
                  : null;
      if (!pyBin) {
        return NextResponse.json({
          stdout: '',
          stderr: '⚠ python3 not found. Install Python 3 or use the Pyodide fallback.',
          time: Date.now() - t0,
          source: 'local',
        });
      }

      await writeFile(join(tmpDir, 'main.py'), code, 'utf-8');

      // ulimit -v caps virtual memory (best-effort on macOS, reliable on Linux)
      const fullCmd = `ulimit -v 131072 2>/dev/null; ${pyBin} main.py`;

      let stdout = '', stderr = '';
      try {
        const r = await execAsync(fullCmd, {
          cwd: tmpDir,
          timeout: RUN_TIMEOUT,
          shell: '/bin/bash',
          env,
        });
        stdout = r.stdout;
        stderr = r.stderr;
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; killed?: boolean; message?: string };
        stdout = err.stdout || '';
        stderr = err.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s — possible infinite loop.`
          : cap(err.stderr || err.message || 'Runtime error');
      }

      return NextResponse.json({
        stdout: cap(stdout),
        stderr: cap(stderr),
        time: Date.now() - t0,
        source: 'local',
        remaining: rl.remaining,
      });
    }

    // ── JavaScript (Node.js) ─────────────────────────────
    if (lang === 'javascript') {
      if (!(await commandExists('node'))) {
        return NextResponse.json({
          stdout: '',
          stderr: '⚠ node not found. Install Node.js or the browser fallback will run instead.',
          time: Date.now() - t0,
          source: 'local',
        });
      }

      await writeFile(join(tmpDir, 'main.js'), code, 'utf-8');

      let stdout = '', stderr = '';
      try {
        const r = await execAsync(
          'node --max-old-space-size=64 main.js', // Layer 4: heap cap
          { cwd: tmpDir, timeout: RUN_TIMEOUT, env },
        );
        stdout = r.stdout;
        stderr = r.stderr;
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; killed?: boolean; message?: string };
        stdout = err.stdout || '';
        stderr = err.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s.`
          : cap(err.stderr || err.message || 'Runtime error');
      }

      return NextResponse.json({
        stdout: cap(stdout),
        stderr: cap(stderr),
        time: Date.now() - t0,
        source: 'local',
        remaining: rl.remaining,
      });
    }

    return NextResponse.json({ error: `Unsupported language: ${lang}` }, { status: 400 });

  } finally {
    // Layer 7: Always delete the temp directory, even on crash/timeout
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
