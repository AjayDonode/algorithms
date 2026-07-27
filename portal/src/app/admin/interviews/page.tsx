'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { InterviewCategory, InterviewQuestion } from '@/lib/firestore';
import styles from './interviews-admin.module.css';

// ── API helpers ───────────────────────────────────────────────────────────

async function apiGet(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path: string, body: object) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPatch(path: string, body: object) {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(path: string, body: object) {
  const res = await fetch(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Tab = 'categories' | 'pending' | 'all';

// ── Main component ────────────────────────────────────────────────────────

export default function AdminInterviewsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab,          setTab]          = useState<Tab>('categories');
  const [pending,      setPending]      = useState<InterviewQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [categories,   setCategories]   = useState<InterviewCategory[]>([]);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [toast,        setToast]        = useState('');
  const [seeding,      setSeeding]      = useState(false);

  // ── New category form ──
  const [newName,  setNewName]  = useState('');
  const [newIcon,  setNewIcon]  = useState('');
  const [newColor, setNewColor] = useState('#FF9500');
  const [newDesc,  setNewDesc]  = useState('');
  const [saving,   setSaving]   = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/');
  }, [authLoading, user, isAdmin, router]);

  // ── Data loaders — all via server API ──
  const loadCategories = useCallback(async () => {
    const data = await apiGet('/api/admin/interviews/categories');
    setCategories(data.categories ?? []);
  }, []);

  const loadQuestions = useCallback(async () => {
    const [pendData, allData] = await Promise.all([
      apiGet('/api/admin/interviews/questions?status=pending'),
      apiGet('/api/admin/interviews/questions?status=all'),
    ]);
    setPending(pendData.questions ?? []);
    setAllQuestions(allData.questions ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        await Promise.all([loadCategories(), loadQuestions()]);
      } catch (err) {
        console.error('[admin/interviews] load error:', err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [isAdmin, loadCategories, loadQuestions]);

  if (authLoading || !isAdmin) return null;

  // ── Helpers ──
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function getCatName(categoryId: string) {
    return categories.find(c => c.id === categoryId)?.name ?? categoryId;
  }

  // ── Category actions ──
  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await apiPost('/api/admin/interviews/categories', { action: 'seed' });
      await loadCategories();
      showToast(res.seeded > 0 ? `✅ Seeded ${res.seeded} default categories!` : '⚠ Categories already exist.');
    } catch (err) {
      showToast('❌ Seed failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSeeding(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await apiPost('/api/admin/interviews/categories', {
        name: newName.trim(),
        icon: newIcon.trim() || '📌',
        color: newColor,
        description: newDesc.trim(),
        order: categories.length + 1,
      });
      await loadCategories();
      setNewName(''); setNewIcon(''); setNewColor('#FF9500'); setNewDesc('');
      showToast('✅ Category created!');
    } catch (err) {
      showToast('❌ Failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Questions will not be deleted.`)) return;
    try {
      await apiDelete('/api/admin/interviews/categories', { id });
      setCategories(c => c.filter(x => x.id !== id));
      showToast('🗑 Category deleted.');
    } catch (err) {
      showToast('❌ Delete failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ── Question actions — all via server API ──
  async function handleApprove(id: string) {
    try {
      await apiPatch('/api/admin/interviews/questions', { id, action: 'approve' });
      await loadQuestions();
      showToast('✅ Question approved and published!');
    } catch (err) {
      showToast('❌ Failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleReject(id: string) {
    try {
      await apiPatch('/api/admin/interviews/questions', { id, action: 'reject' });
      await loadQuestions();
      showToast('❌ Question rejected.');
    } catch (err) {
      showToast('❌ Failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this question?')) return;
    try {
      await apiDelete('/api/admin/interviews/questions', { id });
      await loadQuestions();
      showToast('🗑 Question deleted.');
    } catch (err) {
      showToast('❌ Failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ── Question card ──
  function QCard({ q, showApprove }: { q: InterviewQuestion; showApprove: boolean }) {
    return (
      <div className={styles.qCard}>
        <div className={styles.qCardTop}>
          <span className={styles.qText}>{q.question}</span>
          <div className={styles.qActions}>
            {showApprove && <button className={styles.approveBtn} onClick={() => handleApprove(q.id)}>✓ Approve</button>}
            {showApprove && <button className={styles.rejectBtn}  onClick={() => handleReject(q.id)}>✗ Reject</button>}
            <button className={styles.deleteBtn} onClick={() => handleDelete(q.id)}>Delete</button>
          </div>
        </div>
        <div className={styles.qMeta}>
          <span className={styles.catBadge}>{getCatName(q.categoryId)}</span>
          <span className={styles.diffBadge} data-diff={q.difficulty}>{q.difficulty}</span>
          <span>by {q.submittedByName}</span>
          <span>·</span>
          <span>{formatDate(q.createdAt)}</span>
          {q.status !== 'pending' && (
            <>
              <span>·</span>
              <span style={{ color: q.status === 'approved' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                {q.status}
              </span>
            </>
          )}
        </div>
        {q.answer && <div className={styles.qAnswer}>{q.answer}</div>}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>

        <Link href="/admin" className={styles.breadcrumb}>← Admin Panel</Link>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>🎯 Interview Questions</h1>
            <p className={styles.sub}>Review submissions, manage categories, and curate the interview question bank.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={styles.tab} data-active={tab === 'categories' ? 'true' : 'false'} onClick={() => setTab('categories')}>
            Categories
            {categories.length > 0 && <span className={styles.tabBadge}>{categories.length}</span>}
          </button>
          <button className={styles.tab} data-active={tab === 'pending' ? 'true' : 'false'} onClick={() => setTab('pending')}>
            Pending Review
            {pending.length > 0 && <span className={styles.tabBadge}>{pending.length}</span>}
          </button>
          <button className={styles.tab} data-active={tab === 'all' ? 'true' : 'false'} onClick={() => setTab('all')}>
            All Questions
            {allQuestions.length > 0 && <span className={styles.tabBadge}>{allQuestions.length}</span>}
          </button>
        </div>

        {dataLoading ? (
          <p className={styles.loadingText}>Loading…</p>
        ) : (
          <>
            {/* ── Categories tab ── */}
            {tab === 'categories' && (
              <>
                {categories.length === 0 && (
                  <div className={styles.seedBanner}>
                    <div className={styles.seedBannerIcon}>🌱</div>
                    <div className={styles.seedBannerText}>
                      <strong>No categories yet.</strong>
                      <span>Seed the 6 default categories (Java, Python, JavaScript, React, System Design, Data Structures).</span>
                    </div>
                    <button className={styles.seedBtn} onClick={handleSeed} disabled={seeding}>
                      {seeding ? 'Seeding…' : '+ Seed Default Categories'}
                    </button>
                  </div>
                )}

                <div className={styles.sectionTitle}>
                  Manage Categories ({categories.length})
                  {categories.length > 0 && (
                    <button className={styles.seedBtnSmall} onClick={handleSeed} disabled={seeding}>
                      {seeding ? 'Seeding…' : '↺ Seed Defaults'}
                    </button>
                  )}
                </div>

                {categories.length > 0 && (
                  <div className={styles.catGrid}>
                    {categories.map(cat => {
                      const rgb = hexToRgb(cat.color);
                      return (
                        <div key={cat.id} className={styles.catCard} style={{ '--cat-rgb': rgb } as React.CSSProperties}>
                          <div className={styles.catCardIcon}>{cat.icon}</div>
                          <div className={styles.catCardInfo}>
                            <div className={styles.catCardName}>{cat.name}</div>
                            <div className={styles.catCardDesc}>{cat.description || <em style={{opacity:0.5}}>No description</em>}</div>
                          </div>
                          <div className={styles.catCardActions}>
                            <button className={styles.deleteBtn} onClick={() => handleDeleteCategory(cat.id, cat.name)}>Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.newCatCard}>
                  <div className={styles.newCatTitle}>+ Add New Category</div>
                  <form onSubmit={handleAddCategory}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Name *</label>
                        <input className={styles.formInput} placeholder="e.g. TypeScript" value={newName} onChange={e => setNewName(e.target.value)} required />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Icon (emoji)</label>
                        <input className={styles.formInput} placeholder="e.g. 🔷" value={newIcon} onChange={e => setNewIcon(e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Accent Color</label>
                        <input type="color" className={styles.formInput} value={newColor} onChange={e => setNewColor(e.target.value)} style={{ height: '38px', padding: '2px 4px', cursor: 'pointer' }} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        <input className={styles.formInput} placeholder="Short description…" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" className={styles.addCatBtn} disabled={saving || !newName.trim()}>
                      {saving ? 'Creating…' : 'Create Category'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ── Pending tab ── */}
            {tab === 'pending' && (
              <>
                <div className={styles.sectionTitle}>Questions Awaiting Approval ({pending.length})</div>
                {pending.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span>🎉</span>
                    <p>No pending questions — you&apos;re all caught up!</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Check <strong>All Questions</strong> tab to see if submissions arrived with a different status.
                    </p>
                  </div>
                ) : (
                  <div className={styles.qList}>
                    {pending.map(q => <QCard key={q.id} q={q} showApprove={true} />)}
                  </div>
                )}
              </>
            )}

            {/* ── All questions tab ── */}
            {tab === 'all' && (
              <>
                <div className={styles.sectionTitle}>All Questions ({allQuestions.length})</div>
                {allQuestions.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span>📭</span>
                    <p>No questions in Firestore yet.</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Ask a logged-in user to submit one from the <strong>/interviews</strong> page.
                    </p>
                  </div>
                ) : (
                  <div className={styles.qList}>
                    {allQuestions.map(q => <QCard key={q.id} q={q} showApprove={q.status === 'pending'} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
