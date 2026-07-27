'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getInterviewCategories,
  getApprovedQuestions,
  InterviewCategory,
  QuestionDifficulty,
} from '@/lib/firestore';
import styles from './interviews.module.css';

// ── helpers ──────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ── Submit Modal ──────────────────────────────────────────

interface SubmitModalProps {
  categories: InterviewCategory[];
  onClose: () => void;
  onSubmitted: () => void;
  uid: string;
  userName: string;
}

function SubmitModal({ categories, onClose, onSubmitted, uid: _uid, userName }: SubmitModalProps) {
  const [categoryId,  setCategoryId]  = useState(categories[0]?.id ?? '');
  const [question,    setQuestion]    = useState('');
  const [answer,      setAnswer]      = useState('');
  const [difficulty,  setDifficulty]  = useState<QuestionDifficulty>('medium');
  const [tagsRaw,     setTagsRaw]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !categoryId) return;
    setSubmitting(true);
    setError('');
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
      // Use server API — bypasses Firestore client rules entirely
      const res = await fetch('/api/interviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          question: question.trim(),
          answer: answer.trim(),
          difficulty,
          tags,
          submittedByName: userName,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Submission failed.');
      }
      setDone(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>💡 Submit an Interview Question</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {done ? (
          <div className={styles.modalBody}>
            <div className={styles.successMsg}>
              <span className={styles.successIcon}>🎉</span>
              <h3>Question submitted!</h3>
              <p>It will appear publicly once an admin reviews and approves it. Thank you for contributing!</p>
            </div>
          </div>
        ) : (
          <form className={styles.modalBody} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select className={styles.formSelect} value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty</label>
                <div className={styles.difficultyGroup}>
                  {(['easy', 'medium', 'hard'] as QuestionDifficulty[]).map(d => (
                    <button key={d} type="button" className={styles.diffBtn}
                      data-active={difficulty === d ? 'true' : 'false'} data-diff={d}
                      onClick={() => setDifficulty(d)}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Question</label>
              <textarea className={styles.formTextarea} placeholder="e.g. What is the difference between HashMap and Hashtable in Java?" value={question} onChange={e => setQuestion(e.target.value)} required rows={3} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Answer / Explanation</label>
              <textarea className={styles.formTextarea} placeholder="Provide a clear, concise answer. Markdown is welcome." value={answer} onChange={e => setAnswer(e.target.value)} required rows={5} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags <span className={styles.tagsHint}>(comma-separated)</span></label>
              <input className={styles.formInput} placeholder="e.g. collections, concurrency, java8" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} />
            </div>
            {error && (
              <div className={styles.submitError}>⚠ {error}</div>
            )}
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.confirmBtn} disabled={submitting || !question.trim() || !answer.trim()}>
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function InterviewsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [categories,     setCategories]     = useState<InterviewCategory[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [pageLoading,    setPageLoading]    = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [toast,          setToast]          = useState('');

  useEffect(() => {
    (async () => {
      const cats = await getInterviewCategories();
      setCategories(cats);
      const counts = await Promise.all(
        cats.map(c => getApprovedQuestions(c.id).then(qs => ({ id: c.id, count: qs.length })))
      );
      const map: Record<string, number> = {};
      counts.forEach(({ id, count }) => { map[id] = count; });
      setQuestionCounts(map);
      setPageLoading(false);
    })();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);
  const displayName = profile?.name ?? user?.displayName ?? user?.email ?? 'User';

  return (
    <>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTag}>🎯 Interview Prep Hub</div>
        <h1 className={styles.heroTitle}>
          Ace Your Next <span className={styles.heroAccent}>Technical Interview</span>
        </h1>
        <p className={styles.heroSub}>
          Community-curated questions across Java, Python, JavaScript, React, System Design and more.
          Browse a topic from the sidebar, or contribute your own questions.
        </p>
        <div className={styles.heroActions}>
          {!authLoading && (
            user ? (
              <button id="submit-question-btn" className={styles.submitBtn} onClick={() => setShowModal(true)}>
                + Submit a Question
              </button>
            ) : (
              <span className={styles.loginHint}>
                <Link href="/login">Log in</Link> to submit interview questions
              </span>
            )
          )}
        </div>
      </div>

      {/* Stats bar */}
      {!pageLoading && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{categories.length}</span>
            <span className={styles.statLbl}>Categories</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal}>{totalQuestions}</span>
            <span className={styles.statLbl}>Questions</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal}>∞</span>
            <span className={styles.statLbl}>More Coming</span>
          </div>
        </div>
      )}

      {/* Category grid */}
      <div className={styles.sectionHeading}>Browse by Category</div>

      {pageLoading ? (
        <div className={styles.loadingGrid}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.empty}>
          <span>📂</span>
          <p>No categories yet — an admin will set them up shortly.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map(cat => {
            const rgb = hexToRgb(cat.color);
            return (
              <a
                key={cat.id}
                href={`/interviews/${cat.id}`}
                className={styles.categoryCard}
                style={{
                  // @ts-expect-error custom CSS props
                  '--card-color': cat.color,
                  '--card-color-bg': `rgba(${rgb}, 0.10)`,
                  '--card-color-border': `rgba(${rgb}, 0.22)`,
                }}
              >
                <div className={styles.cardIconWrap}>{cat.icon}</div>
                <div className={styles.cardName}>{cat.name}</div>
                <div className={styles.cardDesc}>{cat.description}</div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCount}>
                    {questionCounts[cat.id] ?? 0} question{(questionCounts[cat.id] ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.cardArrow}>→</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Submit modal */}
      {showModal && user && (
        <SubmitModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmitted={() => showToast('✅ Question submitted for review!')}
          uid={user.uid}
          userName={displayName}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
