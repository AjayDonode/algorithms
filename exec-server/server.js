/**
 * AlgoVerse Execution Server
 * --------------------------
 * A lightweight HTTP server that compiles and runs Java / Python / JavaScript
 * code in isolated temp directories. Deploy this anywhere that has a JDK and
 * Python 3 installed (VPS, Cloud Run, Railway, Render, etc.)
 *
 * POST /execute
 *   Body: { lang: "java"|"python"|"javascript", code: string }
 *   Response: { stdout, stderr, time, source }
 *
 * GET /health  →  { status: "ok" }
 */

const http     = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');
const { writeFile, mkdir, rm, access } = require('fs/promises');
const { tmpdir } = require('os');
const { join }   = require('path');
const { randomUUID } = require('crypto');

const execAsync = promisify(exec);

// ── Config ─────────────────────────────────────────────────────
const PORT            = process.env.PORT || 3001;
const API_SECRET      = process.env.EXEC_API_SECRET || '';   // optional shared secret
const COMPILE_TIMEOUT = 15_000;
const RUN_TIMEOUT     =  8_000;
const MAX_OUT_CHARS   = 50_000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',');

// ── Helpers ────────────────────────────────────────────────────
function cap(s) {
  return s.length > MAX_OUT_CHARS
    ? s.slice(0, MAX_OUT_CHARS) + `\n\n[... output truncated at ${MAX_OUT_CHARS} chars]`
    : s;
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function commandExists(cmd) {
  try { await execAsync(`which ${cmd}`, { timeout: 2000 }); return true; }
  catch { return false; }
}

function stripJvmNoise(s) {
  return s
    .split('\n')
    .filter(line => !/^(NOTE:\s+)?Picked up [A-Z_]+:/.test(line.trim()))
    .join('\n')
    .trim();
}

function wrapJava(code) {
  if (/\bpublic\s+class\b/.test(code)) return code;
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

function safeEnv() {
  const allowed = new Set(['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP',
    'LANG', 'LC_ALL', 'LC_CTYPE', 'USER', 'LOGNAME', 'SHELL',
    'JAVA_HOME', 'JDK_HOME']);
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (allowed.has(k)) env[k] = v;
  }
  return env;
}

async function resolveJavaBinDir() {
  const candidates = [];
  if (process.env.JAVA_HOME)  candidates.push(process.env.JAVA_HOME);
  if (process.env.JDK_HOME)   candidates.push(process.env.JDK_HOME);

  // macOS java_home helper
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await execAsync('/usr/libexec/java_home 2>/dev/null', { timeout: 3000 });
      if (stdout.trim()) candidates.push(stdout.trim());
    } catch { /* skip */ }
  }

  // Common locations
  candidates.push(
    '/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home',
    '/usr/lib/jvm/java-21-openjdk-amd64',
    '/usr/lib/jvm/java-17-openjdk-amd64',
    '/usr/lib/jvm/java-11-openjdk-amd64',
    '/usr/local/lib/jvm/java-21-openjdk',
  );

  for (const home of candidates) {
    if (!home) continue;
    const javac = join(home.trim(), 'bin', 'javac');
    if (await fileExists(javac)) return join(home.trim(), 'bin');
  }

  try {
    const { stdout } = await execAsync('which javac', { timeout: 2000 });
    const p = stdout.trim();
    if (p) return p.replace('/javac', '');
  } catch { /* not on PATH */ }

  return null;
}

// ── Core execution logic ───────────────────────────────────────
async function executeCode(lang, code) {
  const runId  = randomUUID();
  const tmpDir = join(tmpdir(), `algoverse-${runId}`);
  const env    = safeEnv();
  const t0     = Date.now();

  try {
    await mkdir(tmpDir, { recursive: true });

    // ── Java ───────────────────────────────────────────────
    if (lang === 'java') {
      const binDir = await resolveJavaBinDir();
      if (!binDir) {
        return {
          stdout: '',
          stderr: '⚠ javac not found.\n\nInstall a JDK:\n  apt install default-jdk\n  brew install openjdk@21',
          time: Date.now() - t0,
          source: 'exec-server',
        };
      }

      const javacBin = join(binDir, 'javac');
      const javaBin  = join(binDir, 'java');
      const wrapped  = wrapJava(code);
      await writeFile(join(tmpDir, 'Main.java'), wrapped, 'utf-8');

      try {
        await execAsync(`"${javacBin}" Main.java`, { cwd: tmpDir, timeout: COMPILE_TIMEOUT, env });
      } catch (e) {
        return {
          stdout: '',
          stderr: cap(stripJvmNoise(e.stderr || e.message || 'Compilation failed')),
          time: Date.now() - t0,
          source: 'exec-server',
        };
      }

      const jvmFlags = '-Xmx128m -Xss512k -XX:+UseSerialGC -XX:TieredStopAtLevel=1';
      let stdout = '', stderr = '';
      try {
        const r = await execAsync(`"${javaBin}" ${jvmFlags} -cp . Main`, { cwd: tmpDir, timeout: RUN_TIMEOUT, env });
        stdout = r.stdout;
        stderr = stripJvmNoise(r.stderr);
      } catch (e) {
        stdout = e.stdout || '';
        stderr = e.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s — infinite loop or OutOfMemoryError.`
          : cap(stripJvmNoise(e.stderr || e.message || 'Runtime error'));
      }

      return { stdout: cap(stdout), stderr: cap(stderr), time: Date.now() - t0, source: 'exec-server' };
    }

    // ── Python ─────────────────────────────────────────────
    if (lang === 'python') {
      const pyBin = (await commandExists('python3')) ? 'python3'
                  : (await commandExists('python'))  ? 'python'
                  : null;
      if (!pyBin) {
        return {
          stdout: '',
          stderr: '⚠ python3 not found.\n\nInstall Python:\n  apt install python3\n  brew install python3',
          time: Date.now() - t0,
          source: 'exec-server',
        };
      }

      await writeFile(join(tmpDir, 'main.py'), code, 'utf-8');
      const fullCmd = `ulimit -v 262144 2>/dev/null; ${pyBin} main.py`;

      let stdout = '', stderr = '';
      try {
        const r = await execAsync(fullCmd, { cwd: tmpDir, timeout: RUN_TIMEOUT, shell: '/bin/bash', env });
        stdout = r.stdout;
        stderr = r.stderr;
      } catch (e) {
        stdout = e.stdout || '';
        stderr = e.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s — infinite loop.`
          : cap(e.stderr || e.message || 'Runtime error');
      }

      return { stdout: cap(stdout), stderr: cap(stderr), time: Date.now() - t0, source: 'exec-server' };
    }

    // ── JavaScript ─────────────────────────────────────────
    if (lang === 'javascript') {
      await writeFile(join(tmpDir, 'main.js'), code, 'utf-8');
      let stdout = '', stderr = '';
      try {
        const r = await execAsync('node --max-old-space-size=64 main.js', { cwd: tmpDir, timeout: RUN_TIMEOUT, env });
        stdout = r.stdout;
        stderr = r.stderr;
      } catch (e) {
        stdout = e.stdout || '';
        stderr = e.killed
          ? `⏱ Process killed after ${RUN_TIMEOUT / 1000}s.`
          : cap(e.stderr || e.message || 'Runtime error');
      }
      return { stdout: cap(stdout), stderr: cap(stderr), time: Date.now() - t0, source: 'exec-server' };
    }

    return { stdout: '', stderr: `Unsupported language: ${lang}`, time: 0, source: 'exec-server' };

  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── HTTP Server ────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '*';
  const allowedOrigin = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : '');

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-secret');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Health check ─────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }));
    return;
  }

  // ── Execute ───────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/execute') {

    // Optional shared secret check
    if (API_SECRET && req.headers['x-api-secret'] !== API_SECRET) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let parsed;
      try { parsed = JSON.parse(body); }
      catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const { lang, code } = parsed;
      if (!lang || !code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing lang or code' }));
        return;
      }

      try {
        const result = await executeCode(lang, code);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ stdout: '', stderr: String(e), time: 0, source: 'exec-server' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ AlgoVerse Exec Server running on port ${PORT}`);
  console.log(`   Secret auth: ${API_SECRET ? 'enabled' : 'disabled (set EXEC_API_SECRET to enable)'}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
