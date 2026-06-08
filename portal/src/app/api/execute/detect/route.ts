/**
 * GET /api/execute/detect
 *
 * Scans the local machine for installed Java / Python / Node runtimes
 * and returns their paths. Used by the Scratchpad settings panel.
 */

import { NextResponse } from 'next/server';
import { exec }         from 'child_process';
import { promisify }    from 'util';
import { access }       from 'fs/promises';
import { join }         from 'path';

const execAsync = promisify(exec);

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; }
  catch { return false; }
}

async function readCmd(cmd: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(cmd, { timeout: 3000 });
    return stdout.trim() || null;
  } catch { return null; }
}

// ── Java detection ────────────────────────────────────────────
async function detectJava(): Promise<{ home: string; version: string } | null> {
  const candidates: string[] = [];

  // 1. JAVA_HOME env var
  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  if (process.env.ALGOVERSE_JAVA_HOME) candidates.push(process.env.ALGOVERSE_JAVA_HOME);

  // 2. macOS /usr/libexec/java_home utility
  if (process.platform === 'darwin') {
    const detected = await readCmd('/usr/libexec/java_home 2>/dev/null');
    if (detected) candidates.push(detected);

    // List all JVMs available
    const list = await readCmd('/usr/libexec/java_home -V 2>&1 | grep -oE "/[^\"]+\\.jdk/Contents/Home"');
    if (list) candidates.push(...list.split('\n').filter(Boolean));
  }

  // 3. Common Homebrew / system paths
  candidates.push(
    '/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home',
    '/opt/homebrew/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home',
    '/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home',
    '/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home',
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
    '/usr/lib/jvm/java-11-openjdk-amd64',
  );

  // 4. Try which javac as last resort
  const which = await readCmd('which javac');
  if (which) {
    // Resolve symlinks and go up to JAVA_HOME
    const real = await readCmd(`readlink -f ${which} 2>/dev/null || realpath ${which} 2>/dev/null`);
    if (real) candidates.push(join(real, '..', '..'));
  }

  // Try each candidate
  for (const home of candidates) {
    if (!home) continue;
    const javacPath = join(home, 'bin', 'javac');
    if (await fileExists(javacPath)) {
      const version = await readCmd(`${javacPath} -version 2>&1`);
      return { home, version: version ?? 'unknown' };
    }
  }

  return null;
}

// ── Python detection ──────────────────────────────────────────
async function detectPython(): Promise<{ bin: string; version: string } | null> {
  for (const bin of ['python3', 'python']) {
    const which = await readCmd(`which ${bin} 2>/dev/null`);
    if (which) {
      const version = await readCmd(`${which} --version 2>&1`);
      return { bin: which, version: version ?? 'unknown' };
    }
  }
  return null;
}

// ── Node detection ────────────────────────────────────────────
async function detectNode(): Promise<{ bin: string; version: string } | null> {
  const which = await readCmd('which node 2>/dev/null');
  if (which) {
    const version = await readCmd(`${which} --version 2>&1`);
    return { bin: which, version: version ?? 'unknown' };
  }
  return null;
}

// ── Handler ───────────────────────────────────────────────────
export async function GET() {
  const [java, python, node] = await Promise.all([
    detectJava(),
    detectPython(),
    detectNode(),
  ]);

  return NextResponse.json({ java, python, node });
}
