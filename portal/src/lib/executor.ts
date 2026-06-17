// Shared execution engine used by Scratchpad and Solutions viewer
export type ExecLang = 'java' | 'python' | 'javascript';
export type ExecSource = 'local' | 'browser';

export interface ExecResult {
  stdout: string;
  stderr: string;
  time: number;
  source: ExecSource;
}

// ── Wrap bare Java snippets ──────────────────────────────────
export function wrapJavaCode(code: string): string {
  if (/\bpublic\s+class\b/.test(code)) return code;
  return [
    'import java.util.*;',
    'import java.util.stream.*;',
    '',
    'public class Main {',
    '    public static void main(String[] args) throws Exception {',
    ...code.split('\n').map(l => '        ' + l),
    '    }',
    '}',
  ].join('\n');
}

// ── Code formatter ───────────────────────────────────────────
export function formatCode(code: string, lang: ExecLang): string {
  if (lang === 'python') {
    return code
      .split('\n').map(l => l.trimEnd()).join('\n')
      .replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  }
  const INDENT = lang === 'java' ? '    ' : '  ';
  const lines = code.split('\n').map(l => l.trim())
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''));
  const out: string[] = [];
  let depth = 0;
  for (const raw of lines) {
    if (/^[}\])]/.test(raw)) depth = Math.max(0, depth - 1);
    out.push(raw === '' ? '' : INDENT.repeat(depth) + raw);
    let open = 0, close = 0;
    for (const ch of raw) {
      if (ch === '{' || ch === '[' || ch === '(') open++;
      if (ch === '}' || ch === ']' || ch === ')') close++;
    }
    if (!/^[}\])]/.test(raw) && open > close) depth++;
  }
  return out.join('\n').trimEnd() + '\n';
}

// ── Local API (/api/execute) ─────────────────────────────────
export async function execLocal(lang: ExecLang, code: string, javaHome?: string): Promise<ExecResult> {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang, code, ...(javaHome ? { javaHome } : {}) }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    throw new Error(body.detail ?? body.error ?? `Server error ${res.status}`);
  }

  const data = await res.json() as {
    stdout?: string; stderr?: string; time?: number;
    javaAvailable?: boolean; source?: string;
  };

  if (data.javaAvailable === false) {
    throw new Error(
      'javac not found on this machine.\n' +
      'Install a JDK (brew install openjdk@21) or set your JDK path in ⚙ Settings.'
    );
  }

  return {
    stdout: data.stdout ?? '',
    stderr: data.stderr ?? '',
    time:   data.time   ?? 0,
    source: 'local',
  };
}

// ── In-browser JavaScript ────────────────────────────────────
export function execJavaScript(code: string): { stdout: string; stderr: string; time: number } {
  const logs: string[] = [], errs: string[] = [];
  const fmt = (...args: unknown[]) =>
    args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  const olog = console.log, oerr = console.error, owarn = console.warn, oinfo = console.info;
  console.log   = (...a) => logs.push(fmt(...a));
  console.error = (...a) => errs.push(fmt(...a));
  console.warn  = (...a) => logs.push('[warn] ' + fmt(...a));
  console.info  = (...a) => logs.push(fmt(...a));
  const t0 = performance.now();
  try { new Function(code)(); }
  catch (e: unknown) { errs.push(e instanceof Error ? `${e.name}: ${e.message}` : String(e)); }
  finally { console.log = olog; console.error = oerr; console.warn = owarn; console.info = oinfo; }
  return { stdout: logs.join('\n'), stderr: errs.join('\n'), time: Math.round(performance.now() - t0) };
}

// ── High-level runner ────────────────────────────────────────
// JavaScript runs in-browser (instant, no server needed).
// Java + Python use the local server (/api/execute) which spawns
// the locally-installed JDK / Python interpreter.
export async function runCode(
  lang: ExecLang, code: string, javaHome?: string,
): Promise<ExecResult> {
  if (lang === 'javascript') {
    return { ...execJavaScript(code), source: 'browser' };
  }

  try {
    return await execLocal(lang, code, javaHome);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      stdout: '',
      stderr: [
        `⚠ Could not run ${lang} code.`,
        '',
        msg,
        '',
        lang === 'java'
          ? 'Make sure a JDK is installed (brew install openjdk@21) and on your PATH.\nYou can also set a custom JDK path in the Scratchpad ⚙ Settings.'
          : 'Make sure Python 3 is installed (brew install python3) and on your PATH.',
      ].join('\n'),
      time: 0,
      source: 'local',
    };
  }
}
