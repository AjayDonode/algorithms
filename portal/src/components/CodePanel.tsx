'use client';
import { useState, useCallback } from 'react';
import styles from './CodePanel.module.css';

type Lang = 'pseudo' | 'java' | 'python';

interface Props {
  pseudocode: string;
  javaCode: string;
  pythonCode: string;
}

// ── Java highlighting (IntelliJ Darcula palette) ──────────────
const JAVA_KW = new Set([
  'public','private','protected','static','final','void','int','long','double',
  'boolean','char','byte','float','short','return','if','else','while','for',
  'do','new','class','interface','extends','implements','import','package',
  'null','true','false','this','super','break','continue','switch','case',
  'default','throw','throws','try','catch','finally','instanceof','abstract',
]);
const JAVA_TYPES = new Set([
  'String','List','Map','Set','Queue','Deque','Stack','PriorityQueue',
  'Arrays','Integer','Long','Boolean','Character','Double','HashMap',
  'HashSet','LinkedList','ArrayList','TreeNode','ListNode','Collections',
  'Comparator','System','Math','Object',
]);

function tokenizeJava(code: string): string {
  const esc = (s: string) =>
    s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Split by token boundaries, keeping the delimiters
  const tokens = code.split(/(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\w+\b|\s+|[^\w\s])/g);
  return tokens.map(tok => {
    if (!tok) return '';
    if (tok.startsWith('//')) return `<span class="tk-cmt">${esc(tok)}</span>`;
    if (tok.startsWith('"') || tok.startsWith("'")) return `<span class="tk-str">${esc(tok)}</span>`;
    if (JAVA_KW.has(tok)) return `<span class="tk-kw">${esc(tok)}</span>`;
    if (JAVA_TYPES.has(tok)) return `<span class="tk-type">${esc(tok)}</span>`;
    if (/^\d+(\.\d+)?[fFdDlL]?$/.test(tok)) return `<span class="tk-num">${esc(tok)}</span>`;
    if (tok.startsWith('@')) return `<span class="tk-ann">${esc(tok)}</span>`;
    return esc(tok);
  }).join('');
}

// ── Python highlighting (VS Code Dark+ palette) ───────────────
const PY_KW = new Set([
  'def','class','return','if','elif','else','for','while','in','not','and',
  'or','import','from','as','with','try','except','finally','raise','pass',
  'break','continue','yield','lambda','global','nonlocal','del','assert',
  'is','None','True','False',
]);
const PY_BUILTINS = new Set([
  'print','len','range','enumerate','zip','map','filter','sorted','reversed',
  'list','dict','set','tuple','int','float','str','bool','type','isinstance',
  'hasattr','getattr','setattr','open','super','property','staticmethod',
  'classmethod','abs','max','min','sum','any','all','round','input',
]);

function tokenizePython(code: string): string {
  const esc = (s: string) =>
    s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const tokens = code.split(/(#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|@\w+|\b\w+\b|\s+|[^\w\s])/g);
  return tokens.map(tok => {
    if (!tok) return '';
    if (tok.startsWith('#')) return `<span class="tk-cmt">${esc(tok)}</span>`;
    if (tok.startsWith('"""') || tok.startsWith("'''")) return `<span class="tk-str">${esc(tok)}</span>`;
    if (tok.startsWith('"') || tok.startsWith("'")) return `<span class="tk-str">${esc(tok)}</span>`;
    if (tok.startsWith('@')) return `<span class="tk-ann">${esc(tok)}</span>`;
    if (PY_KW.has(tok)) return `<span class="tk-kw">${esc(tok)}</span>`;
    if (PY_BUILTINS.has(tok)) return `<span class="tk-builtin">${esc(tok)}</span>`;
    if (/^\d+(\.\d+)?$/.test(tok)) return `<span class="tk-num">${esc(tok)}</span>`;
    return esc(tok);
  }).join('');
}

function escapePseudo(code: string): string {
  return code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const LANG_META: Record<Lang, { label: string; accent: string; dotColor: string }> = {
  pseudo:  { label: 'Pseudocode',  accent: '#8e8e93', dotColor: '#636366' },
  java:    { label: 'Java',        accent: '#e87a1e', dotColor: '#e87a1e' },
  python:  { label: 'Python',      accent: '#3572A5', dotColor: '#3572A5' },
};

export function CodePanel({ pseudocode, javaCode, pythonCode }: Props) {
  const [lang, setLang] = useState<Lang>('java');
  const [copied, setCopied] = useState(false);

  const code = lang === 'pseudo' ? pseudocode : lang === 'java' ? javaCode : pythonCode;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  // Opens the Scratchpad pre-loaded with the current language's code
  const handleTryInScratchpad = useCallback(() => {
    const scratchLang = lang === 'java' ? 'javascript' : 'python';
    const scratchCode = lang === 'python' ? pythonCode : lang === 'java' ? javaCode : pythonCode;
    window.dispatchEvent(
      new CustomEvent('av:scratchpad:load', {
        detail: { code: scratchCode, lang: scratchLang },
      })
    );
  }, [lang, javaCode, pythonCode]);

  const meta = LANG_META[lang];

  return (
    <div className={styles.card}>
      {/* Header row */}
      <div className={styles.header}>
        {/* Traffic light dots */}
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#febc2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />

        {/* Language tabs */}
        <div className={styles.tabGroup}>
          {(['pseudo','java','python'] as Lang[]).map(l => (
            <button
              key={l}
              className={`${styles.tab} ${lang === l ? styles.tabActive : ''}`}
              onClick={() => setLang(l)}
              style={lang === l ? {
                borderBottomColor: LANG_META[l].accent,
                color: LANG_META[l].accent
              } : {}}
            >
              {LANG_META[l].label}
            </button>
          ))}
        </div>

        {/* Right side: lang badge + try in scratchpad + copy */}
        <div className={styles.actions}>
          <span className={styles.langBadge} style={{ background: meta.accent + '22', color: meta.accent, borderColor: meta.accent + '44' }}>
            <span className={styles.langDot} style={{ background: meta.dotColor }} />
            {meta.label}
          </span>
          {lang !== 'pseudo' && (
            <button className={styles.scratchpadBtn} onClick={handleTryInScratchpad} title="Open this code in the Scratchpad to run it">
              ⌨️ Try in Scratchpad
            </button>
          )}
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className={`${styles.body} ${lang === 'python' ? 'py-ctx' : ''}`}>
        <table className={styles.codeTable}>
          <tbody>
            {code.split('\n').map((line, i) => {
              const hlLine = lang === 'java'
                ? tokenizeJava(line)
                : lang === 'python'
                  ? tokenizePython(line)
                  : escapePseudo(line);
              return (
                <tr key={i} className={styles.codeLine}>
                  <td className={styles.lineNum}>{i + 1}</td>
                  <td className={styles.lineCode} dangerouslySetInnerHTML={{ __html: hlLine || ' ' }} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
