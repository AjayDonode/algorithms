'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import {
  getSolutionsByCategory,
  deleteSolution,
  updateSolution,
  Solution,
  SolutionLang,
  CATEGORIES,
} from '@/lib/solutions';
import { runCode, formatCode } from '@/lib/executor';
import styles from './solutions.module.css';

const LANG_COLOR: Record<SolutionLang, string> = {
  java: '#e87a1e', python: '#3572A5', javascript: '#f1e05a',
};
const LANG_LABEL: Record<SolutionLang, string> = {
  java: '☕ Java', python: '🐍 Python', javascript: '⚡ JS',
};
const CAT_ICONS: Record<string, string> = {
  'Arrays': '📦', 'Strings': '🔤', 'Linked List': '🔗', 'Trees': '🌳',
  'Graphs': '🕸️', 'Dynamic Programming': '🧩', 'Binary Search': '🔭',
  'Sliding Window': '🪟', 'Two Pointers': '👉', 'Heap / Priority Queue': '⛰️',
  'Backtracking': '🔙', 'Math': '🔢', 'Other': '📁',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SolutionsPage() {
  const [byCategory, setByCategory] = useState<Record<string, Solution[]>>({});
  const [selected, setSelected]     = useState<Solution | null>(null);
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [search, setSearch]         = useState('');
  const [toast, setToast]           = useState('');

  // ── Editor state ─────────────────────────────────────────
  const [editCode, setEditCode]       = useState('');
  const [editTitle, setEditTitle]     = useState('');
  const [titleEditing, setTitleEditing] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Run state ─────────────────────────────────────────────
  const [running, setRunning]   = useState(false);
  const [stdout, setStdout]     = useState('');
  const [stderr, setStderr]     = useState('');
  const [execMs, setExecMs]     = useState<number | null>(null);
  const [execSrc, setExecSrc]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    const data = getSolutionsByCategory();
    setByCategory(data);
    setExpanded(new Set(Object.keys(data)));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Reset editor/console when selection changes
  useEffect(() => {
    if (selected) {
      setEditCode(selected.code);
      setEditTitle(selected.title);
      setStdout(''); setStderr(''); setExecMs(null); setExecSrc('');
      setDeleteConfirm(false);
    }
  }, [selected?.id]);

  const totalCount = Object.values(byCategory).flat().length;

  // Filter by search
  const filteredByCategory: Record<string, Solution[]> = {};
  for (const cat of CATEGORIES.filter(c => byCategory[c]?.length)) {
    const items = (byCategory[cat] ?? []).filter(s =>
      !search.trim() ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.notes.toLowerCase().includes(search.toLowerCase())
    );
    if (items.length) filteredByCategory[cat] = items;
  }

  function toggleCat(cat: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function handleSelect(s: Solution) {
    setSelected(s);
    setDeleteConfirm(false);
  }

  // ── Save title on blur/enter ─────────────────────────────
  function saveTitle() {
    setTitleEditing(false);
    if (!selected || !editTitle.trim() || editTitle === selected.title) return;
    updateSolution(selected.id, { title: editTitle.trim() });
    setSelected(s => s ? { ...s, title: editTitle.trim() } : s);
    reload();
    showToast('Title updated');
  }

  // ── Save code changes ────────────────────────────────────
  function saveCode(newCode: string) {
    setEditCode(newCode);
    if (selected) updateSolution(selected.id, { code: newCode });
  }

  // ── Run ──────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!selected) return;
    setRunning(true);
    setStdout(''); setStderr(''); setExecMs(null);
    try {
      const javaHome = typeof window !== 'undefined'
        ? localStorage.getItem('av:javaHome') ?? undefined
        : undefined;
      const result = await runCode(selected.lang, editCode, javaHome);
      setStdout(result.stdout);
      setStderr(result.stderr);
      setExecMs(result.time);
      setExecSrc(result.source);
      setTimeout(() => consoleRef.current?.scrollTo({ top: 0 }), 50);
    } catch (e) {
      setStderr(String(e));
    } finally {
      setRunning(false);
    }
  }, [selected, editCode]);

  // ── Delete ───────────────────────────────────────────────
  function handleDelete() {
    if (!selected) return;
    deleteSolution(selected.id);
    setSelected(null);
    setDeleteConfirm(false);
    reload();
    showToast('Solution deleted');
  }

  // ── Load in Scratchpad ───────────────────────────────────
  function loadInScratchpad() {
    if (!selected) return;
    window.dispatchEvent(new CustomEvent('av:scratchpad:load', {
      detail: { code: editCode, lang: selected.lang },
    }));
    showToast(`Opened in Scratchpad ⌨️`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  // ⌘+Enter runs code when viewer is focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && selected && !running) {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, running, handleRun]);

  const hasOutput = stdout || stderr;

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.pageBody}>

        {/* ── LEFT SIDEBAR: tree navigator ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>💾 My Solutions</span>
            {totalCount > 0 && <span className={styles.totalBadge}>{totalCount}</span>}
          </div>

          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search solutions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {totalCount === 0 ? (
            <div className={styles.emptyTree}>
              <span>No solutions yet.</span>
              <span>Use the <strong>Scratchpad</strong> → <strong>💾 Save</strong></span>
            </div>
          ) : Object.keys(filteredByCategory).length === 0 ? (
            <div className={styles.emptyTree}><span>No matches for "{search}"</span></div>
          ) : (
            <nav className={styles.tree}>
              {Object.entries(filteredByCategory).map(([cat, items]) => {
                const isOpen = expanded.has(cat);
                return (
                  <div key={cat} className={styles.treeGroup}>
                    <button className={styles.treeCat} onClick={() => toggleCat(cat)}>
                      <span className={styles.treeChevron}>{isOpen ? '▾' : '▸'}</span>
                      <span className={styles.treeCatIcon}>{CAT_ICONS[cat] ?? '📁'}</span>
                      <span className={styles.treeCatLabel}>{cat}</span>
                      <span className={styles.treeCatCount}>{items.length}</span>
                    </button>
                    {isOpen && (
                      <div className={styles.treeItems}>
                        {items.map(s => (
                          <button
                            key={s.id}
                            className={`${styles.treeItem} ${selected?.id === s.id ? styles.treeItemActive : ''}`}
                            onClick={() => handleSelect(s)}
                          >
                            <span
                              className={styles.treeItemDot}
                              style={{ background: LANG_COLOR[s.lang] }}
                            />
                            <span className={styles.treeItemTitle}>{s.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </aside>

        {/* ── MAIN: interactive viewer ── */}
        <main className={styles.main}>
          {!selected ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👈</div>
              <h2>Select a solution</h2>
              <p>Pick any solution from the left panel to view and run it here.</p>
              {totalCount === 0 && (
                <p className={styles.emptyHint}>
                  Open <strong>⌨️ Scratchpad</strong>, solve a problem, then click <strong>💾 Save</strong>.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.viewer}>

              {/* ── Header bar ── */}
              <div className={styles.viewerHeader}>
                {/* Editable title */}
                <div className={styles.viewerTitleArea}>
                  <span className={styles.viewerCatIcon}>{CAT_ICONS[selected.category] ?? '📁'}</span>
                  {titleEditing ? (
                    <input
                      ref={titleRef}
                      className={styles.titleInput}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setTitleEditing(false); }}
                      autoFocus
                    />
                  ) : (
                    <button
                      className={styles.titleDisplay}
                      onClick={() => { setTitleEditing(true); setTimeout(() => titleRef.current?.select(), 10); }}
                      title="Click to rename"
                    >
                      {editTitle}
                      <span className={styles.titleEditIcon}>✎</span>
                    </button>
                  )}
                  <div className={styles.viewerMeta}>
                    <span style={{ color: LANG_COLOR[selected.lang] }}>{LANG_LABEL[selected.lang]}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{selected.category}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{editCode.split('\n').length} lines</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{timeAgo(selected.savedAt)}</span>
                  </div>
                </div>

                {/* Toolbar buttons */}
                <div className={styles.viewerToolbar}>
                  <button
                    className={styles.runBtn}
                    onClick={handleRun}
                    disabled={running}
                    title="Run code (⌘ Enter)"
                  >
                    {running ? '⏳ Running…' : '▶  Run'}
                  </button>
                  {/* Format icon */}
                  <button
                    className={styles.iconBtn}
                    onClick={() => setEditCode(c => formatCode(c, selected.lang))}
                    title="Auto-format code"
                    aria-label="Format"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="15" y2="12"/>
                      <line x1="3" y1="18" x2="18" y2="18"/>
                      <polyline points="19 15 22 18 19 21"/>
                    </svg>
                  </button>
                  {/* Reset icon */}
                  <button
                    className={styles.iconBtn}
                    onClick={() => { setEditCode(selected.code); setStdout(''); setStderr(''); setExecMs(null); }}
                    title="Reset to saved version"
                    aria-label="Reset"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                  </button>
                  {deleteConfirm ? (
                    <>
                      <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Confirm</button>
                      <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(true)} title="Delete solution">🗑</button>
                  )}
                </div>
              </div>

              {/* Notes bar */}
              {selected.notes && (
                <div className={styles.notesBar}>
                  <span className={styles.notesIcon}>📝</span>
                  <span className={styles.notesText}>{selected.notes}</span>
                </div>
              )}

              {/* ── Editor + Console split ── */}
              <div className={styles.editorConsole}>
                {/* Code editor */}
                <div className={styles.editorPane}>
                  <div className={styles.paneHeader}>
                    <span className={styles.paneLabel} style={{ color: LANG_COLOR[selected.lang] }}>
                      {LANG_LABEL[selected.lang]}
                    </span>
                    <span className={styles.paneInfo}>{editCode.split('\n').length} lines</span>
                  </div>
                  <div className={styles.editorWrap}>
                    <CodeEditor
                      lang={selected.lang}
                      value={editCode}
                      onChange={saveCode}
                      onRunShortcut={() => { if (!running) handleRun(); }}
                    />
                  </div>
                </div>

                {/* Console output */}
                <div className={styles.consolePane}>
                  <div className={styles.paneHeader}>
                    <span className={styles.paneLabel}>Console Output</span>
                    {execMs !== null && (
                      <span className={styles.paneInfo}>✓ ran in {execMs}ms · {execSrc}</span>
                    )}
                    {hasOutput && (
                      <button
                        className={styles.clearConsole}
                        onClick={() => { setStdout(''); setStderr(''); setExecMs(null); }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div ref={consoleRef} className={styles.console}>
                    {running && (
                      <div className={styles.consolePlaceholder}>
                        <span className={styles.spinner} />
                        <span>{selected.lang === 'java' ? 'Compiling & running…' : 'Executing…'}</span>
                      </div>
                    )}
                    {!running && !hasOutput && (
                      <div className={styles.consolePlaceholder}>
                        <span className={styles.placeholderIcon}>▶</span>
                        <span>Click <strong>Run</strong> or press <kbd>⌘ Enter</kbd></span>
                      </div>
                    )}
                    {!running && stdout && <pre className={styles.stdout}>{stdout}</pre>}
                    {!running && stderr && (
                      <>
                        <div className={styles.errorLabel}>⚠ Error / Traceback</div>
                        <pre className={styles.stderrText}>{stderr}</pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
