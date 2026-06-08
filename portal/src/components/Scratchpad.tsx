'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Scratchpad.module.css';
import { CodeEditor } from './CodeEditor';

// ── Types ──────────────────────────────────────────────────
type Lang = 'java' | 'python' | 'javascript';
type ExecSource = 'local' | 'piston' | 'browser' | 'pyodide';
interface ExecResult { stdout: string; stderr: string; time: number; source: ExecSource; }

// ── LOCAL API (/api/execute) ────────────────────────────────
// Calls our own Next.js API route which shells out to the local JDK/Python/Node
async function execLocal(lang: Lang, code: string, javaHome?: string): Promise<ExecResult> {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang, code, ...(javaHome ? { javaHome } : {}) }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Local API ${res.status}`);
  const data = await res.json();
  // If the runtime isn't installed, re-throw so fallback kicks in
  if (data.javaAvailable === false) throw new Error('javac not found');
  return { stdout: data.stdout ?? '', stderr: data.stderr ?? '', time: data.time ?? 0, source: 'local' };
}

// ── PISTON API (cloud fallback) ─────────────────────────────
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const PISTON_LANG: Record<Lang, { language: string; version: string }> = {
  java:       { language: 'java',       version: '15.0.2' },
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
};

function wrapJavaCode(code: string): string {
  if (/\bpublic\s+class\b/.test(code)) return code;
  return `import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n${code.split('\n').map(l => '        ' + l).join('\n')}\n    }\n}`;
}

async function execViaPiston(lang: Lang, rawCode: string): Promise<ExecResult> {
  const t0 = performance.now();
  const code = lang === 'java' ? wrapJavaCode(rawCode) : rawCode;
  const { language, version } = PISTON_LANG[lang];
  const ext = lang === 'java' ? 'Main.java' : lang === 'python' ? 'main.py' : 'main.js';

  const res = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, version, files: [{ name: ext, content: code }], stdin: '', compile_timeout: 10000, run_timeout: 5000 }),
    signal: AbortSignal.timeout(18_000),
  });
  if (!res.ok) throw new Error(`Piston ${res.status}`);
  const data = await res.json() as { run: { stdout: string; stderr: string }; compile?: { stdout: string; stderr: string } };
  return {
    stdout: [(data.compile?.stdout ?? ''), (data.run?.stdout ?? '')].filter(Boolean).join(''),
    stderr: [(data.compile?.stderr ?? ''), (data.run?.stderr ?? '')].filter(Boolean).join(''),
    time: Math.round(performance.now() - t0),
    source: 'piston',
  };
}

// ── In-browser JavaScript execution (fast, no API needed) ──
function execJavaScript(code: string): { stdout: string; stderr: string; time: number } {
  const logs: string[] = [];
  const errs: string[] = [];
  const fmt = (...args: unknown[]) =>
    args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');

  const olog = console.log, oerr = console.error,
        owarn = console.warn, oinfo = console.info;
  console.log  = (...a) => logs.push(fmt(...a));
  console.error = (...a) => errs.push(fmt(...a));
  console.warn  = (...a) => logs.push('[warn] ' + fmt(...a));
  console.info  = (...a) => logs.push(fmt(...a));

  const t0 = performance.now();
  try {
    // eslint-disable-next-line no-new-func
    new Function(code)();
  } catch (e: unknown) {
    errs.push(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
  } finally {
    console.log = olog; console.error = oerr;
    console.warn = owarn; console.info = oinfo;
  }
  return { stdout: logs.join('\n'), stderr: errs.join('\n'), time: Math.round(performance.now() - t0) };
}

// ── Pyodide loader (offline Python fallback) ───────────────
const PYODIDE_VER = '0.27.4';
declare global {
  interface Window {
    loadPyodide: (opts?: object) => Promise<unknown>;
    __pyodideInstance: unknown;
  }
}
let pyLoadPromise: Promise<unknown> | null = null;
async function getPyodide(): Promise<unknown> {
  if (window.__pyodideInstance) return window.__pyodideInstance;
  if (!pyLoadPromise) {
    pyLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full/pyodide.js`;
      s.onload = async () => {
        try {
          const py = await window.loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full/`,
            stdout: () => {}, stderr: () => {},
          });
          window.__pyodideInstance = py;
          resolve(py);
        } catch (e) { reject(e); }
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return pyLoadPromise;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function execPyodide(code: string): Promise<{ stdout: string; stderr: string; time: number }> {
  const py = await getPyodide() as any;
  const wrapped = `
import sys, time as _t, traceback as _tb
from io import StringIO as _SIO
_ob = _SIO(); _eb = _SIO()
_os = sys.stdout; _oe = sys.stderr
sys.stdout = _ob; sys.stderr = _eb
_t0 = _t.time()
try:
    exec(${JSON.stringify(code)}, {"__name__":"__main__"})
except Exception:
    _eb.write(_tb.format_exc())
finally:
    sys.stdout = _os; sys.stderr = _oe
_av_out = _ob.getvalue(); _av_err = _eb.getvalue()
_av_ms  = round((_t.time() - _t0) * 1000, 2)
`;
  const t0 = performance.now();
  try {
    py.runPython(wrapped);
    return {
      stdout: py.runPython('_av_out') as string,
      stderr: py.runPython('_av_err') as string,
      time:   py.runPython('_av_ms')  as number,
    };
  } catch (e) {
    return { stdout: '', stderr: String(e), time: Math.round(performance.now() - t0) };
  }
}

// ── Templates ──────────────────────────────────────────────
const TEMPLATES: Record<Lang, string> = {
  java: `// ☕ Java Scratchpad — AlgoVerse
// Single-file mode: write methods directly, no class needed!
// A Main class + main() will be added automatically.

int[] arr = {38, 27, 43, 3, 9, 82, 10};

// Bubble Sort
for (int i = 0; i < arr.length - 1; i++) {
    for (int j = 1; j < arr.length - i; j++) {
        if (arr[j-1] > arr[j]) {
            int tmp = arr[j]; arr[j] = arr[j-1]; arr[j-1] = tmp;
        }
    }
}

System.out.print("Sorted: ");
System.out.println(java.util.Arrays.toString(arr));
`,

  python: `# 🐍 Python Scratchpad — AlgoVerse
# Write any code and click ▶ Run!

def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(1, n - i):
            if arr[j - 1] > arr[j]:
                arr[j - 1], arr[j] = arr[j], arr[j - 1]
    return arr

data = [38, 27, 43, 3, 9, 82, 10]
print("Sorted:", bubble_sort(data))

# Try your own code below ↓
`,

  javascript: `// ⚡ JavaScript Scratchpad — AlgoVerse
// Write any code and click ▶ Run!

function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 1; j < a.length - i; j++) {
      if (a[j-1] > a[j]) [a[j-1], a[j]] = [a[j], a[j-1]];
    }
  }
  return a;
}

const data = [38, 27, 43, 3, 9, 82, 10];
console.log("Sorted:", bubbleSort(data));

// Try your own code below ↓
`,
};

// ── Language UI meta ───────────────────────────────────────
const LANG_META: Record<Lang, { label: string; color: string; hint: string; engine: string }> = {
  java:       { label: '☕ Java',        color: '#e87a1e', hint: 'System.out.println() for output', engine: 'Piston (JDK 15)' },
  python:     { label: '🐍 Python',     color: '#3572A5', hint: 'print() for output',              engine: 'Piston + Pyodide' },
  javascript: { label: '⚡ JavaScript', color: '#f1e05a', hint: 'console.log() for output',        engine: 'Browser-native' },
};

// ── Scratchpad component ───────────────────────────────────
export function Scratchpad() {
  const [open, setOpen]             = useState(false);
  const [lang, setLang]             = useState<Lang>('python');
  const [code, setCode]             = useState(TEMPLATES.python);
  const [stdout, setStdout]         = useState('');
  const [stderr, setStderr]         = useState('');
  const [execMs, setExecMs]         = useState<number | null>(null);
  const [running, setRunning]       = useState(false);
  const [apiStatus, setApiStatus]   = useState<'idle' | 'connecting' | 'ok' | 'error'>('idle');
  const [execSource, setExecSource] = useState<string>('');
  const [violations, setViolations] = useState<string[]>([]);
  const [rateBlocked, setRateBlocked] = useState(false);
  const [retryAfterMs, setRetryAfterMs] = useState(0);
  const [pyState, setPyState]       = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // ── Settings ────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [javaHome, setJavaHome]   = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('av:javaHome') ?? '') : ''
  );
  const [detecting, setDetecting] = useState(false);
  const [detectResult, setDetectResult] = useState<string>('');

  function saveJavaHome(v: string) {
    setJavaHome(v);
    localStorage.setItem('av:javaHome', v);
  }

  async function autoDetect() {
    setDetecting(true);
    setDetectResult('');
    try {
      const res = await fetch('/api/execute/detect');
      const data = await res.json() as {
        java?: { home: string; version: string } | null;
        python?: { bin: string; version: string } | null;
        node?: { bin: string; version: string } | null;
      };
      if (data.java) {
        saveJavaHome(data.java.home);
        setDetectResult(`✓ Found: ${data.java.home} (${data.java.version})`);
      } else {
        setDetectResult('⚠ No JDK found. Install with: brew install openjdk@21');
      }
    } catch {
      setDetectResult('⚠ Detection failed. Check your network or server.');
    } finally {
      setDetecting(false);
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef   = useRef<HTMLDivElement>(null);

  // Listen for "Try in Scratchpad" events from CodePanel
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ code: string; lang: Lang }>;
      setCode(ce.detail.code);
      setLang(ce.detail.lang);
      setStdout(''); setStderr(''); setExecMs(null);
      setOpen(true);
    };
    window.addEventListener('av:scratchpad:load', handler);
    return () => window.removeEventListener('av:scratchpad:load', handler);
  }, []);

  function changeLang(l: Lang) {
    setLang(l);
    setCode(TEMPLATES[l]);
    setStdout(''); setStderr(''); setExecMs(null);
  }

  const handleRun = useCallback(async () => {
    setRunning(true);
    setStdout(''); setStderr(''); setExecMs(null);
    setViolations([]); setRateBlocked(false);
    try {
      let result: { stdout: string; stderr: string; time: number; source?: string };

      if (lang === 'javascript') {
        // JS runs instantly in-browser — fastest, no API call
        result = { ...execJavaScript(code), source: 'browser' };
      } else {
        // Java & Python: try local API first → Piston cloud → Pyodide (Python only)
        setApiStatus('connecting');
        try {
          // Pass javaHome so the API uses the user-configured JDK path
          result = await execLocal(lang, code, lang === 'java' ? javaHome || undefined : undefined);
          setApiStatus('ok');
        } catch {
          // Local API failed (or Java not installed) → fall back to Piston
          try {
            result = await execViaPiston(lang, code);
            setApiStatus('ok');
          } catch {
            if (lang === 'python') {
              // Final fallback: Pyodide (offline-capable)
              setApiStatus('error');
              if (pyState !== 'ready') {
                setPyState('loading');
                await getPyodide()
                  .then(() => setPyState('ready'))
                  .catch(() => setPyState('error'));
              }
              result = { ...await execPyodide(code), source: 'pyodide' };
            } else {
              throw new Error('All execution backends unavailable for Java. Ensure the JDK is installed locally or check your network connection.');
            }
          }
        }
      }

      setStdout(result.stdout);
      setStderr(result.stderr);
      setExecMs(result.time);
      setExecSource(result.source ?? '');
      setTimeout(() => outputRef.current?.scrollTo({ top: 0 }), 50);
    } catch (e: unknown) {
      // Check if it was a rate-limit or security block from the local API
      if (e instanceof Response || (e instanceof Error && e.message.includes('429'))) {
        setRateBlocked(true);
        setRetryAfterMs(60_000);
      } else {
        setStderr(String(e));
      }
    } finally {
      setRunning(false);
    }
  }, [lang, code, pyState]);

  // ⌘+Enter / Ctrl+Enter runs code
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!running) handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, running, handleRun]);

  // Tab key inserts indentation
  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = textareaRef.current!;
    const s = ta.selectionStart, end = ta.selectionEnd;
    const indent = lang === 'python' ? '    ' : lang === 'java' ? '    ' : '  ';
    const next = code.slice(0, s) + indent + code.slice(end);
    setCode(next);
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + indent.length; });
  }

  const runLabel = running ? '⏳ Running…' : '▶  Run';
  const hasOutput = stdout || stderr;
  const lineCount = code.split('\n').length;
  const meta = LANG_META[lang];

  // Status pill for Java/Python (powered by Piston)
  const needsApi = lang === 'java' || lang === 'python';
  const statusPill =
    running && needsApi                      ? { text: '⏳ Calling API…',    cls: styles.pyStatus } :
    apiStatus === 'ok' && needsApi           ? { text: '✓ Piston connected', cls: styles.pyStatusReady } :
    apiStatus === 'error' && lang === 'python' ? { text: '⚠ Pyodide fallback', cls: styles.pyStatus } :
    lang === 'java'                          ? { text: '☁ Runs via Piston API', cls: styles.engineNote } :
    lang === 'python'                        ? { text: '☁ Runs via Piston API', cls: styles.engineNote } :
    null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="scratchpad-fab"
        className={styles.fab}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close Scratchpad' : 'Open Scratchpad'}
        title="Scratchpad — practice & run code"
      >
        <span className={styles.fabEmoji}>{open ? '✕' : '⌨️'}</span>
        {!open && <span className={styles.fabText}>Scratchpad</span>}
      </button>

      {/* Backdrop */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden />}

      {/* Panel */}
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ''}`} aria-label="Scratchpad">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>⌨️ Scratchpad</span>
            <span className={styles.subtitle}>Practice &amp; run code in your browser</span>
          </div>

          {/* Language tabs */}
          <div className={styles.langTabs}>
            {(['python', 'java', 'javascript'] as Lang[]).map(l => (
              <button
                key={l}
                className={`${styles.langTab} ${lang === l ? styles.langTabActive : ''}`}
                onClick={() => changeLang(l)}
                style={lang === l ? { color: LANG_META[l].color, borderColor: LANG_META[l].color } : {}}
              >
                {LANG_META[l].label}
              </button>
            ))}
          </div>

          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            id="scratchpad-run-btn"
            className={styles.runBtn}
            onClick={handleRun}
            disabled={running}
          >
            {runLabel}
          </button>
          <button className={styles.toolBtn} onClick={() => {
            setCode(TEMPLATES[lang]);
            setStdout(''); setStderr(''); setExecMs(null); setApiStatus('idle');
          }}>
            Reset
          </button>
          <button className={styles.toolBtn} onClick={() => {
            setStdout(''); setStderr(''); setExecMs(null);
          }}>
            Clear Output
          </button>
          <span className={styles.hint}>
            {meta.hint}&nbsp;·&nbsp;<kbd>⌘ Enter</kbd> to run
          </span>
          {statusPill && (
            <span className={statusPill.cls}>{statusPill.text}</span>
          )}
          {/* Settings gear button */}
          <button
            className={`${styles.toolBtn} ${showSettings ? styles.toolBtnActive : ''}`}
            onClick={() => setShowSettings(s => !s)}
            title="Runtime settings"
            style={{ marginLeft: 'auto' }}
          >
            ⚙ Settings
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className={styles.settingsPanel}>
            <div className={styles.settingsRow}>
              <label className={styles.settingsLabel} htmlFor="java-home-input">
                ☕ Java Home
                {javaHome && (
                  <span className={styles.settingsActive}>✓ custom</span>
                )}
              </label>
              <div className={styles.settingsInputRow}>
                <input
                  id="java-home-input"
                  className={styles.settingsInput}
                  type="text"
                  value={javaHome}
                  onChange={e => saveJavaHome(e.target.value)}
                  placeholder="e.g. /Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
                  spellCheck={false}
                />
                <button className={styles.detectBtn} onClick={autoDetect} disabled={detecting}>
                  {detecting ? '⏳ Detecting…' : '🔍 Auto-detect'}
                </button>
                {javaHome && (
                  <button className={styles.clearBtn} onClick={() => saveJavaHome('')} title="Clear custom path">
                    ✕
                  </button>
                )}
              </div>
              {detectResult && (
                <span className={detectResult.startsWith('✓')
                  ? styles.detectSuccess
                  : styles.detectWarn
                }>
                  {detectResult}
                </span>
              )}
              <p className={styles.settingsHint}>
                Leave blank to auto-detect from <code>JAVA_HOME</code>, Homebrew, or system paths.
                Path is saved in your browser (localStorage).
              </p>
            </div>
          </div>
        )}

        {/* Java info bar — shows when Java tab is active */}
        {lang === 'java' && (
          <div className={styles.javaBanner}>
            <span className={styles.javaBannerIcon}>☕</span>
            <span>
              Runs on your <strong>local JDK</strong>.
              Write code directly —{' '}
              the <code className={styles.inlineCode}>Main</code> class &amp;{' '}
              <code className={styles.inlineCode}>main()</code> method are added automatically.
              {' '}Falls back to Piston cloud if no JDK is found.
            </span>
          </div>
        )}

        {/* Editor + Output */}
        <div className={styles.split}>
          {/* Editor */}
          <div className={styles.editorPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLang} style={{ color: meta.color }}>{meta.label}</span>
              <span className={styles.paneInfo}>{lineCount} lines</span>
            </div>
            {/* CodeMirror syntax-highlighted editor */}
            <div className={styles.editorWrap}>
              <CodeEditor
                lang={lang}
                value={code}
                onChange={setCode}
                onRunShortcut={() => { if (!running) handleRun(); }}
              />
            </div>
          </div>

          {/* Output */}
          <div className={styles.outputPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLang}>Console Output</span>
              {execMs !== null && (
                <span className={styles.paneInfo}>✓ ran in {execMs}ms</span>
              )}
            </div>
            <div ref={outputRef} className={styles.console}>
              {/* Rate limit warning */}
              {rateBlocked && !running && (
                <div className={styles.securityBlock}>
                  <div className={styles.securityBlockTitle}>🚫 Rate Limit Reached</div>
                  <p className={styles.securityBlockBody}>
                    You&apos;ve hit the execution limit (15 runs/minute).<br />
                    Please wait {Math.ceil(retryAfterMs / 1000)} seconds before running again.
                  </p>
                </div>
              )}

              {/* Security violation panel */}
              {violations.length > 0 && !running && (
                <div className={styles.securityBlock}>
                  <div className={styles.securityBlockTitle}>🛡 Code Blocked by Security Policy</div>
                  <p className={styles.securityBlockBody}>
                    The following patterns are not permitted in the scratchpad:
                  </p>
                  <ul className={styles.violationList}>
                    {violations.map((v, i) => (
                      <li key={i} className={styles.violationItem}>
                        <span className={styles.violationBullet}>✕</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.securityBlockHint}>
                    The scratchpad is for educational algorithm practice only.
                    File I/O, networking, process spawning, and reflection are disabled.
                  </p>
                </div>
              )}

              {running && (
                <div className={styles.consolePlaceholder}>
                  <span className={styles.spinner} />
                  <span>
                    {lang === 'java' ? 'Compiling & running Java…' : 'Executing…'}
                  </span>
                </div>
              )}
              {!running && !rateBlocked && violations.length === 0 && !stdout && !stderr && (
                <div className={styles.consolePlaceholder}>
                  <span className={styles.placeholderIcon}>▶</span>
                  <span>Click <strong>Run</strong> to see output here</span>
                </div>
              )}
              {!running && stdout && (
                <pre className={styles.stdout}>{stdout}</pre>
              )}
              {!running && stderr && (
                <>
                  <div className={styles.errorLabel}>⚠ Error / Traceback</div>
                  <pre className={styles.stderrText}>{stderr}</pre>
                </>
              )}
              {/* Execution source badge */}
              {!running && execSource && execMs !== null && (
                <div className={styles.sourceBadge}>
                  {execSource === 'local'   && '💻 Ran on Local JDK/Python/Node'}
                  {execSource === 'piston'  && '☁ Ran on Piston Cloud Sandbox'}
                  {execSource === 'browser' && '🌐 Ran in Browser (JS engine)'}
                  {execSource === 'pyodide' && '🐍 Ran in Pyodide (browser WASM)'}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

