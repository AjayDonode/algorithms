'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Scratchpad.module.css';
import { CodeEditor } from './CodeEditor';
import { SaveSolutionModal } from './SaveSolutionModal';
import { runCode, formatCode, execJavaScript, ExecLang } from '@/lib/executor';

// ── Types ──────────────────────────────────────────────
type Lang = ExecLang;

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
  java: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}
`,

  python: `# Write your code here
print("Hello, World!")
`,

  javascript: `// Write your code here
console.log("Hello, World!");
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
  const [infoOpen, setInfoOpen]             = useState(false);
  const [showSave, setShowSave]             = useState(false);
  const [readOnly, setReadOnly]             = useState(false);
  const [consoleCollapsed, setConsoleCollapsed]   = useState(false);
  const [mobileConsoleOpen, setMobileConsoleOpen] = useState(false);

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

  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const outputRef       = useRef<HTMLDivElement>(null);
  const mobileOutputRef = useRef<HTMLDivElement>(null);

  // Listen for "Try in Scratchpad" events from CodePanel / Blog
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ code: string; lang: Lang; readonly?: boolean }>;
      setCode(ce.detail.code);
      setLang(ce.detail.lang);
      setStdout(''); setStderr(''); setExecMs(null);
      setReadOnly(!!ce.detail.readonly);
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
    setApiStatus('connecting');
    try {
      let result: { stdout: string; stderr: string; time: number; source?: string };

      if (lang === 'javascript') {
        result = { ...execJavaScript(code), source: 'browser' };
        setApiStatus('idle');
      } else {
        try {
          // shared runCode: local JDK → Piston (with 1 retry)
          result = await runCode(lang, code, lang === 'java' ? javaHome || undefined : undefined);
          setApiStatus('ok');
        } catch {
          if (lang === 'python') {
            // Final offline fallback for Python: Pyodide
            setApiStatus('error');
            if (pyState !== 'ready') {
              setPyState('loading');
              await getPyodide()
                .then(() => setPyState('ready'))
                .catch(() => setPyState('error'));
            }
            result = { ...await execPyodide(code), source: 'pyodide' };
          } else {
            throw new Error('Java could not be executed. Try again or check your network connection.');
          }
        }
      }

      setStdout(result.stdout);
      setStderr(result.stderr);
      setExecMs(result.time);
      setExecSource(result.source ?? '');
      // Auto-open mobile console when there's output
      if (result.stdout || result.stderr) setMobileConsoleOpen(true);
      setTimeout(() => {
        outputRef.current?.scrollTo({ top: 0 });
        mobileOutputRef.current?.scrollTo({ top: 0 });
      }, 50);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('429')) {
        setRateBlocked(true);
        setRetryAfterMs(60_000);
      } else {
        setStderr(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setRunning(false);
    }
  }, [lang, code, javaHome, pyState]);


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
    running && needsApi                        ? { text: '⏳ Calling API…',    cls: styles.pyStatus } :
    apiStatus === 'ok' && needsApi             ? { text: '✓ Connected', cls: styles.pyStatusReady } :
    apiStatus === 'error' && lang === 'python' ? { text: '⚠ Pyodide fallback', cls: styles.pyStatus } :
    lang === 'java'                            ? { text: '☁ Cloud sandbox', cls: styles.engineNote } :
    lang === 'python'                          ? { text: '☁ Cloud sandbox', cls: styles.engineNote } :
    null;

  // ── Shared console content (used by both desktop pane and mobile sheet) ──
  const renderConsoleContent = () => (
    <>
      {rateBlocked && !running && (
        <div className={styles.securityBlock}>
          <div className={styles.securityBlockTitle}>🚫 Rate Limit Reached</div>
          <p className={styles.securityBlockBody}>
            You&apos;ve hit the execution limit (15 runs/minute).<br />
            Please wait {Math.ceil(retryAfterMs / 1000)} seconds before running again.
          </p>
        </div>
      )}
      {violations.length > 0 && !running && (
        <div className={styles.securityBlock}>
          <div className={styles.securityBlockTitle}>🛡 Code Blocked by Security Policy</div>
          <p className={styles.securityBlockBody}>The following patterns are not permitted in the scratchpad:</p>
          <ul className={styles.violationList}>
            {violations.map((v, i) => (
              <li key={i} className={styles.violationItem}>
                <span className={styles.violationBullet}>✕</span>{v}
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
          <span>{lang === 'java' ? 'Compiling & running Java…' : 'Executing…'}</span>
        </div>
      )}
      {!running && !rateBlocked && violations.length === 0 && !stdout && !stderr && (
        <div className={styles.consolePlaceholder}>
          <span className={styles.placeholderIcon}>▶</span>
          <span>Click <strong>Run</strong> to see output here</span>
        </div>
      )}
      {!running && stdout && <pre className={styles.stdout}>{stdout}</pre>}
      {!running && stderr && (
        <>
          <div className={styles.errorLabel}>⚠ Error / Traceback</div>
          <pre className={styles.stderrText}>{stderr}</pre>
        </>
      )}
      {!running && execSource && execMs !== null && (
        <div className={styles.sourceBadge}>
          {execSource === 'local'      && '💻 Ran on Local JDK/Python/Node'}
          {execSource === 'exec-server'&& '☁ Ran on Cloud Run Sandbox'}
          {execSource === 'piston'     && '☁ Ran on Piston Cloud Sandbox'}
          {execSource === 'browser'    && '🌐 Ran in Browser (JS engine)'}
          {execSource === 'pyodide'    && '🐍 Ran in Pyodide (browser WASM)'}
        </div>
      )}
    </>
  );

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
          {/* Reset icon button */}
          <button
            className={styles.iconBtn}
            onClick={() => { setCode(TEMPLATES[lang]); setStdout(''); setStderr(''); setExecMs(null); setApiStatus('idle'); }}
            title="Reset to template"
            aria-label="Reset"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          {/* Format icon button */}
          <button
            className={styles.iconBtn}
            onClick={() => setCode(c => formatCode(c, lang))}
            title={`Auto-format ${lang} code`}
            aria-label="Format"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="15" y2="12"/>
              <line x1="3" y1="18" x2="18" y2="18"/>
              <polyline points="19 15 22 18 19 21"/>
            </svg>
          </button>
          {/* Save button — hidden in read-only mode */}
          {!readOnly && (
            <button
              className={styles.saveBtn2}
              onClick={() => setShowSave(true)}
              title="Save this solution to My Solutions"
            >
              💾 Save
            </button>
          )}
          {/* Read-only badge */}
          {readOnly && (
            <span className={styles.readOnlyBadge}>👁 Read-only</span>
          )}
          <span className={styles.hint}>
            {meta.hint}&nbsp;·&nbsp;<kbd>⌘ Enter</kbd> to run
          </span>
          {statusPill && (
            <span className={statusPill.cls}>{statusPill.text}</span>
          )}
          {/* Java info icon */}
          {lang === 'java' && (
            <span className={styles.infoWrap}>
              <button
                className={styles.infoIcon}
                onClick={() => setInfoOpen(o => !o)}
                title="How Java mode works"
                aria-label="Java mode info"
              >
                ℹ
              </button>
              {infoOpen && (
                <div className={styles.infoTooltip}>
                  <button className={styles.infoClose} onClick={() => setInfoOpen(false)}>✕</button>
                  <strong>☕ Java Mode</strong>
                  <p>
                    Write code directly — <code>Main</code> class &amp; <code>main()</code> are added automatically.
                    Runs on your <strong>local JDK</strong> first, falls back to Piston cloud if none is found.
                  </p>
                  <p className={styles.infoHint}>Need helper methods? Start with <code>public class Main {'{'}</code> to take full control.</p>
                </div>
              )}
            </span>
          )}
          {/* Mobile-only: Console toggle button */}
          <button
            className={`${styles.mobileConsoleBtn} ${hasOutput ? styles.mobileConsoleBtnActive : ''}`}
            onClick={() => setMobileConsoleOpen(o => !o)}
            aria-label={mobileConsoleOpen ? 'Hide Console' : 'Show Console'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            Console
            {hasOutput && !mobileConsoleOpen && <span className={styles.mobileConsoleDot} />}
          </button>
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

        {/* Java info banner REMOVED — now an ℹ icon in toolbar */}

        {/* Editor + Output */}
        <div className={`${styles.split} ${consoleCollapsed ? styles.splitCollapsed : ''}`}>
          {/* Editor */}
          <div className={styles.editorPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLang} style={{ color: meta.color }}>{meta.label}</span>
              <span className={styles.paneInfo}>{lineCount} lines</span>
              {/* Console toggle — lives in editor pane so it's always visible */}
              <button
                className={styles.consoleToggleBtn}
                onClick={() => setConsoleCollapsed(c => !c)}
                title={consoleCollapsed ? 'Expand Console' : 'Collapse Console'}
                aria-label={consoleCollapsed ? 'Expand Console' : 'Collapse Console'}
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: consoleCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            {/* CodeMirror syntax-highlighted editor */}
            <div className={styles.editorWrap}>
              <CodeEditor
                lang={lang}
                value={code}
                onChange={setCode}
                onRunShortcut={() => { if (!running) handleRun(); }}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Output — desktop only (hidden on mobile via CSS) */}
          <div className={`${styles.outputPane} ${consoleCollapsed ? styles.outputPaneCollapsed : ''}`}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLang}>Console Output</span>
              {execMs !== null && (
                <span className={styles.paneInfo}>✓ ran in {execMs}ms</span>
              )}
            </div>
            <div ref={outputRef} className={styles.console}>
              {renderConsoleContent()}
            </div>
          </div>
        </div>

        {/* ── Mobile Console Bottom Sheet ─────────────────────────── */}
        <div className={`${styles.mobileSheet} ${mobileConsoleOpen ? styles.mobileSheetOpen : ''}`}>
          {/* Drag handle / tap-to-close */}
          <button
            className={styles.mobileSheetDragBar}
            onClick={() => setMobileConsoleOpen(false)}
            aria-label="Close console"
          />
          <div className={styles.mobileSheetHeader}>
            <span className={styles.paneLang}>Console Output</span>
            {execMs !== null && (
              <span className={styles.paneInfo}>✓ {execMs}ms</span>
            )}
            <button
              className={styles.mobileSheetClose}
              onClick={() => setMobileConsoleOpen(false)}
              aria-label="Close"
            >✕</button>
          </div>
          <div ref={mobileOutputRef} className={`${styles.console} ${styles.mobileSheetConsole}`}>
            {renderConsoleContent()}
          </div>
        </div>

      </aside>

      {/* Save Solution Modal */}
      {showSave && (
        <SaveSolutionModal
          code={code}
          lang={lang}
          onSaved={title => {
            setShowSave(false);
            setStdout(prev => prev + (prev ? '\n' : '') + `\u2714 Saved: "${title}"`);
          }}
          onClose={() => setShowSave(false)}
        />
      )}
    </>
  );
}

