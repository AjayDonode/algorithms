'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { SaveSolutionModal } from '@/components/SaveSolutionModal';
import { useAuth } from '@/context/AuthContext';
import {
  getScratchpads,
  deleteScratchpad,
  updateScratchpad,
  shareScratchpad,
  unshareScratchpad,
  Scratchpad,
  ScratchpadLang,
} from '@/lib/firestore';
import { CATEGORIES } from '@/lib/solutions';
import { runCode, formatCode } from '@/lib/executor';
import styles from '../../solutions/solutions.module.css';
import tabStyles from './scratchpad-tabs.module.css';

const LANG_COLOR: Record<ScratchpadLang, string> = {
  java: '#e87a1e', python: '#3572A5', javascript: '#f1e05a',
};
const LANG_LABEL: Record<ScratchpadLang, string> = {
  java: '☕ Java', python: '🐍 Python', javascript: '⚡ JS',
};
const CAT_ICONS: Record<string, string> = {
  'Arrays': '📦', 'Strings': '🔤', 'Linked List': '🔗', 'Trees': '🌳',
  'Graphs': '🕸️', 'Dynamic Programming': '🧩', 'Binary Search': '🔭',
  'Sliding Window': '🪟', 'Two Pointers': '👉', 'Heap / Priority Queue': '⛰️',
  'Backtracking': '🔙', 'Math': '🔢', 'Other': '📁',
};

const TEMPLATES: Record<ScratchpadLang, string> = {
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function groupByCategory(items: Scratchpad[]): Record<string, Scratchpad[]> {
  const map: Record<string, Scratchpad[]> = {};
  for (const s of items) {
    if (!map[s.category]) map[s.category] = [];
    map[s.category].push(s);
  }
  return map;
}

export default function ScratchpadsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items,       setItems]       = useState<Scratchpad[]>([]);
  const [selected,    setSelected]    = useState<Scratchpad | null>(null);
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());
  const [search,      setSearch]      = useState('');
  const [toast,       setToast]       = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Active language tab (3 tabs only — console is always visible on the right)
  const [activeLang, setActiveLang] = useState<ScratchpadLang>('python');

  // Per-language code buffers
  const [codeMap, setCodeMap] = useState<Record<ScratchpadLang, string>>({
    java: TEMPLATES.java, python: TEMPLATES.python, javascript: TEMPLATES.javascript,
  });

  // Editor state
  const [editTitle,    setEditTitle]    = useState('');
  const [titleEditing, setTitleEditing] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Run / console state
  const [running,          setRunning]          = useState(false);
  const [stdout,           setStdout]           = useState('');
  const [stderr,           setStderr]           = useState('');
  const [execMs,           setExecMs]           = useState<number | null>(null);
  const [execSrc,          setExecSrc]          = useState('');
  const [deleteConfirm,    setDeleteConfirm]    = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Share / Edit-info state
  const [sharing,      setSharing]      = useState(false);
  const [showEditMeta, setShowEditMeta] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?from=/account/scratchpads');
  }, [authLoading, user, router]);

  const reload = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const data = await getScratchpads(user.uid);
      setItems(data);
      setExpanded(new Set(Object.keys(groupByCategory(data))));
    } finally {
      setPageLoading(false);
    }
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // Reset when selection changes
  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title);
      setCodeMap({
        java:       selected.lang === 'java'       ? selected.code : TEMPLATES.java,
        python:     selected.lang === 'python'     ? selected.code : TEMPLATES.python,
        javascript: selected.lang === 'javascript' ? selected.code : TEMPLATES.javascript,
      });
      setActiveLang(selected.lang);
      setStdout(''); setStderr(''); setExecMs(null); setExecSrc('');
      setDeleteConfirm(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const byCategory = groupByCategory(items);
  const filteredByCategory: Record<string, Scratchpad[]> = {};
  for (const cat of CATEGORIES.filter(c => byCategory[c]?.length)) {
    const filtered = (byCategory[cat] ?? []).filter(s =>
      !search.trim() ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.notes.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length) filteredByCategory[cat] = filtered;
  }

  function toggleCat(cat: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  async function saveTitle() {
    setTitleEditing(false);
    if (!selected || !editTitle.trim() || editTitle === selected.title || !user) return;
    await updateScratchpad(user.uid, selected.id, { title: editTitle.trim() });
    setSelected(s => s ? { ...s, title: editTitle.trim() } : s);
    reload();
    showToast('Title updated');
  }

  const saveCodeTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  function handleCodeChange(newCode: string) {
    setCodeMap(prev => ({ ...prev, [activeLang]: newCode }));
    if (!user || !selected || activeLang !== selected.lang) return;
    clearTimeout(saveCodeTimer.current);
    saveCodeTimer.current = setTimeout(() => {
      updateScratchpad(user.uid, selected.id, { code: newCode });
    }, 1500);
  }

  const handleRun = useCallback(async () => {
    if (!selected) return;
    setRunning(true);
    setStdout(''); setStderr(''); setExecMs(null);
    setConsoleCollapsed(false);
    try {
      const javaHome = typeof window !== 'undefined'
        ? localStorage.getItem('av:javaHome') ?? undefined
        : undefined;
      const result = await runCode(activeLang, codeMap[activeLang], javaHome);
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
  }, [selected, activeLang, codeMap]);

  async function handleDelete() {
    if (!selected || !user) return;
    await deleteScratchpad(user.uid, selected.id);
    setSelected(null);
    setDeleteConfirm(false);
    reload();
    showToast('Scratchpad deleted');
  }

  async function handleShare() {
    if (!selected || !user) return;
    setSharing(true);
    try {
      const ownerName = user.displayName ?? user.email ?? 'Anonymous';
      if (selected.isShared) {
        await unshareScratchpad(user.uid, selected.id);
        setSelected(s => s ? { ...s, isShared: false } : s);
        showToast('Scratchpad unshared');
      } else {
        await shareScratchpad(user.uid, selected.id, ownerName, {
          title: selected.title,
          lang: selected.lang,
          code: codeMap[activeLang],
          notes: selected.notes,
          category: selected.category,
        });
        setSelected(s => s ? { ...s, isShared: true } : s);
        showToast('🌐 Shared to Blog!');
      }
      reload();
    } catch (e) {
      showToast('Failed — please try again.');
      console.error(e);
    } finally {
      setSharing(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

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

  if (authLoading || pageLoading) {
    return (
      <div className={styles.shell}>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh', color: 'var(--text-muted)' }}>
          Loading your scratchpads…
        </div>
      </div>
    );
  }

  const totalCount = items.length;
  const hasOutput  = stdout || stderr;

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.pageBody}>

        {/* LEFT SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>📋 My Scratchpads</span>
            {totalCount > 0 && <span className={styles.totalBadge}>{totalCount}</span>}
          </div>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search scratchpads…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>}
          </div>

          {totalCount === 0 ? (
            <div className={styles.emptyTree}>
              <span>No scratchpads yet.</span>
              <span>Use the <strong>Scratchpad</strong> → <strong>💾 Save</strong></span>
            </div>
          ) : Object.keys(filteredByCategory).length === 0 ? (
            <div className={styles.emptyTree}><span>No matches for &ldquo;{search}&rdquo;</span></div>
          ) : (
            <nav className={styles.tree}>
              {Object.entries(filteredByCategory).map(([cat, catItems]) => {
                const isOpen = expanded.has(cat);
                return (
                  <div key={cat} className={styles.treeGroup}>
                    <button className={styles.treeCat} onClick={() => toggleCat(cat)}>
                      <span className={styles.treeChevron}>{isOpen ? '▾' : '▸'}</span>
                      <span className={styles.treeCatIcon}>{CAT_ICONS[cat] ?? '📁'}</span>
                      <span className={styles.treeCatLabel}>{cat}</span>
                      <span className={styles.treeCatCount}>{catItems.length}</span>
                    </button>
                    {isOpen && (
                      <div className={styles.treeItems}>
                        {catItems.map(s => (
                          <button
                            key={s.id}
                            className={`${styles.treeItem} ${selected?.id === s.id ? styles.treeItemActive : ''}`}
                            onClick={() => setSelected(s)}
                          >
                            <span className={styles.treeItemDot} style={{ background: LANG_COLOR[s.lang] }} />
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

        {/* MAIN viewer */}
        <main className={styles.main}>
          {!selected ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👈</div>
              <h2>Select a scratchpad</h2>
              <p>Pick any scratchpad from the left panel to view and run it.</p>
              {totalCount === 0 && (
                <p className={styles.emptyHint}>
                  Open <strong>⌨️ Scratchpad</strong>, solve a problem, then click <strong>💾 Save</strong>.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.viewer}>

              {/* ── HEADER BAR ────────────────────────────────────── */}
              <div className={styles.viewerHeader}>
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
                    <span>{timeAgo(selected.savedAt)}</span>
                  </div>
                </div>

                <div className={styles.viewerToolbar}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setCodeMap(prev => ({ ...prev, [activeLang]: formatCode(prev[activeLang], activeLang) }))}
                    title="Auto-format"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                      <polyline points="19 15 22 18 19 21"/>
                    </svg>
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => {
                      const resetCode = activeLang === selected.lang ? selected.code : TEMPLATES[activeLang];
                      setCodeMap(prev => ({ ...prev, [activeLang]: resetCode }));
                      setStdout(''); setStderr(''); setExecMs(null);
                    }}
                    title="Reset"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                    </svg>
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setShowEditMeta(true)}
                    title="Edit title, category & notes"
                    style={{ fontSize: '0.78rem', padding: '0 10px', gap: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    ✏️ Info
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={handleShare}
                    disabled={sharing}
                    title={selected.isShared ? 'Unshare from Blog' : 'Share to Blog'}
                    style={{
                      fontSize: '0.78rem', padding: '0 10px', gap: '4px',
                      display: 'flex', alignItems: 'center',
                      color: selected.isShared ? '#30d158' : undefined,
                    }}
                  >
                    {sharing ? '⏳' : selected.isShared ? '🔒 Unshare' : '🌐 Share'}
                  </button>
                  {deleteConfirm ? (
                    <>
                      <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Confirm</button>
                      <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(true)} title="Delete">🗑</button>
                  )}
                </div>
              </div>

              {/* ── 3 LANG TABS + RUN BUTTON ─────────────────────── */}
              <div className={tabStyles.tabBar}>
                {(['python', 'java', 'javascript'] as ScratchpadLang[]).map(lang => (
                  <button
                    key={lang}
                    className={`${tabStyles.tab} ${activeLang === lang ? tabStyles.tabActive : ''}`}
                    onClick={() => setActiveLang(lang)}
                    style={activeLang === lang
                      ? { color: LANG_COLOR[lang], borderBottomColor: LANG_COLOR[lang] }
                      : {}}
                  >
                    <span className={tabStyles.tabIcon}>{LANG_LABEL[lang]}</span>
                    {lang === selected.lang && (
                      <span
                        className={tabStyles.savedBadge}
                        title="Saved language"
                        style={{ background: LANG_COLOR[lang] }}
                      />
                    )}
                  </button>
                ))}

                {/* Run button sits right after the lang tabs */}
                <button
                  className={tabStyles.runTabBtn}
                  onClick={handleRun}
                  disabled={running}
                  title="Run code (⌘ Enter)"
                >
                  {running
                    ? <><span className={tabStyles.tabSpinner} /> Running…</>
                    : <>▶&nbsp; Run</>}
                </button>
              </div>

              {/* ── EDITOR + CONSOLE SPLIT (console always visible) ── */}
              <div className={`${styles.editorConsole} ${consoleCollapsed ? styles.editorConsoleCollapsed : ''}`}>

                {/* Editor pane */}
                <div className={styles.editorPane}>
                  <div className={styles.paneHeader}>
                    <span className={styles.paneLabel} style={{ color: LANG_COLOR[activeLang] }}>
                      {LANG_LABEL[activeLang]}
                    </span>
                    <span className={styles.paneInfo}>
                      {codeMap[activeLang].split('\n').length} lines
                      {activeLang === selected.lang ? ' · auto-saved' : ' · template'}
                    </span>
                    {/* Console collapse toggle */}
                    <button
                      className={styles.consolePaneToggleBtn}
                      onClick={() => setConsoleCollapsed(c => !c)}
                      title={consoleCollapsed ? 'Expand Console' : 'Collapse Console'}
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
                  <div className={styles.editorWrap}>
                    <CodeEditor
                      lang={activeLang}
                      value={codeMap[activeLang]}
                      onChange={handleCodeChange}
                      onRunShortcut={() => { if (!running) handleRun(); }}
                    />
                  </div>
                </div>

                {/* Console pane — always visible, collapsible */}
                <div className={`${styles.consolePane} ${consoleCollapsed ? styles.consolePaneCollapsed : ''}`}>
                  <div className={styles.paneHeader}>
                    <span className={styles.paneLabel}>Console Output</span>
                    {execMs !== null && <span className={styles.paneInfo}>✓ ran in {execMs}ms · {execSrc}</span>}
                    {hasOutput && (
                      <button className={styles.clearConsole} onClick={() => { setStdout(''); setStderr(''); setExecMs(null); }}>
                        Clear
                      </button>
                    )}
                  </div>
                  <div ref={consoleRef} className={styles.console}>
                    {running && (
                      <div className={styles.consolePlaceholder}>
                        <span className={styles.spinner} />
                        <span>{activeLang === 'java' ? 'Compiling & running…' : 'Executing…'}</span>
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

              {/* Notes bar */}
              {selected.notes && (
                <div className={styles.notesBar}>
                  <span className={styles.notesIcon}>📝</span>
                  <span className={styles.notesText}>{selected.notes}</span>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}

      {showEditMeta && selected && (
        <SaveSolutionModal
          code={codeMap[activeLang]}
          lang={selected.lang}
          editMode
          existingId={selected.id}
          existingTitle={selected.title}
          existingCategory={selected.category}
          existingNotes={selected.notes}
          ownerUid={user?.uid}
          onSaved={(newTitle) => {
            setShowEditMeta(false);
            setSelected(s => s ? { ...s, title: newTitle } : s);
            setEditTitle(newTitle);
            reload();
            showToast('Scratchpad info updated');
          }}
          onClose={() => setShowEditMeta(false)}
        />
      )}
    </div>
  );
}
