'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getInterviewCategories,
  getApprovedQuestions,
  submitInterviewQuestion,
  InterviewCategory,
  InterviewQuestion,
  QuestionDifficulty,
} from '@/lib/firestore';
import styles from './category.module.css';

// ── helpers ──────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Submit Modal ──────────────────────────────────────────

interface SubmitModalProps {
  category: InterviewCategory;
  categories: InterviewCategory[];
  onClose: () => void;
  onSubmitted: () => void;
  uid: string;
  userName: string;
}

function SubmitModal({ category, categories, onClose, onSubmitted, uid, userName }: SubmitModalProps) {
  const [categoryId,  setCategoryId]  = useState(category.id);
  const [question,    setQuestion]    = useState('');
  const [answer,      setAnswer]      = useState('');
  const [difficulty,  setDifficulty]  = useState<QuestionDifficulty>('medium');
  const [tagsRaw,     setTagsRaw]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSubmitting(true);
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
      await submitInterviewQuestion({
        categoryId,
        question: question.trim(),
        answer: answer.trim(),
        difficulty,
        tags,
        submittedBy: uid,
        submittedByName: userName,
      });
      setDone(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 2200);
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
              <p>It will appear publicly once an admin approves it. Thank you for contributing!</p>
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
              <textarea className={styles.formTextarea} placeholder="e.g. What is the difference between…" value={question} onChange={e => setQuestion(e.target.value)} required rows={3} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Answer / Explanation</label>
              <textarea className={styles.formTextarea} placeholder="Provide a clear, concise answer…" value={answer} onChange={e => setAnswer(e.target.value)} required rows={5} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Tags <span className={styles.tagsHint}>(comma-separated)</span>
              </label>
              <input className={styles.formInput} placeholder="e.g. oop, generics, streams" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} />
            </div>
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

// ── Accordion item ────────────────────────────────────────

interface AccordionItemProps {
  question: InterviewQuestion;
  catColor: string;
}

function AccordionItem({ question: q, catColor }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  const rgb = hexToRgb(catColor);

  return (
    <div
      className={styles.accordion}
      data-open={open ? 'true' : 'false'}
      style={{
        // @ts-expect-error custom CSS props
        '--card-color': catColor,
        '--card-color-bg': `rgba(${rgb}, 0.08)`,
        '--card-color-border': `rgba(${rgb}, 0.2)`,
      }}
    >
      <button
        className={styles.accordionHeader}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className={styles.accordionQ}>{q.question}</span>
        <span className={styles.accordionRight}>
          <span className={styles.diffBadge} data-diff={q.difficulty}>{q.difficulty}</span>
          <span className={styles.chevron} data-open={open ? 'true' : 'false'}>▼</span>
        </span>
      </button>

      {open && (
        <div className={styles.accordionBody}>
          <div className={styles.answerLabel}>Answer</div>
          <div className={styles.answerText}>{q.answer}</div>
          {q.tags.length > 0 && (
            <div className={styles.tags}>
              {q.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
          <div className={styles.submittedBy}>
            Contributed by {q.submittedByName} · {formatDate(q.approvedAt ?? q.createdAt)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

type Diff = 'all' | QuestionDifficulty;

export default function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = use(params);
  const { user, profile } = useAuth();

  const [category,   setCategory]   = useState<InterviewCategory | null>(null);
  const [allCats,    setAllCats]    = useState<InterviewCategory[]>([]);
  const [questions,  setQuestions]  = useState<InterviewQuestion[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<Diff>('all');
  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState('');

  useEffect(() => {
    (async () => {
      const [cats, qs] = await Promise.all([
        getInterviewCategories(),
        getApprovedQuestions(categoryId),
      ]);
      const cat = cats.find(c => c.id === categoryId) ?? null;
      setCategory(cat);
      setAllCats(cats);
      setQuestions(qs);
      setLoading(false);
    })();
  }, [categoryId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const filtered = filter === 'all' ? questions : questions.filter(q => q.difficulty === filter);
  const cat = category;
  const rgb = cat ? hexToRgb(cat.color) : '255,149,0';
  const displayName = profile?.name ?? user?.displayName ?? user?.email ?? 'User';

  if (!loading && !cat) {
    return (
      <>
        <Link href="/interviews" className={styles.back}>← Back to Interviews</Link>
        <div className={styles.empty}><span>🔍</span><p>Category not found.</p></div>
      </>
    );
  }

  return (
    <>
      <Link href="/interviews" className={styles.back}>← All Categories</Link>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          {cat && (
            <div
              className={styles.catIcon}
              style={{
                // @ts-expect-error custom props
                '--card-color-bg': `rgba(${rgb}, 0.1)`,
                '--card-color-border': `rgba(${rgb}, 0.22)`,
              }}
            >
              {cat.icon}
            </div>
          )}
          <div className={styles.catMeta}>
            <div className={styles.catName}>{cat?.name ?? '…'}</div>
            <div className={styles.catDesc}>{cat?.description}</div>
          </div>
        </div>

        {user && (
          <button className={styles.submitBtn} onClick={() => setShowModal(true)}>
            + Submit Question
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => (
          <button
            key={d}
            className={styles.filterBtn}
            data-active={filter === d ? 'true' : 'false'}
            onClick={() => setFilter(d)}
          >
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <span className={styles.filterSep} />
        <span className={styles.questionCount}>
          {loading ? '…' : `${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>📭</span>
          <p>
            {filter === 'all'
              ? 'No approved questions yet — be the first to contribute!'
              : `No ${filter} questions for this filter.`}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(q => (
            <AccordionItem key={q.id} question={q} catColor={cat?.color ?? '#FF9500'} />
          ))}
        </div>
      )}

      {/* Submit modal */}
      {showModal && user && cat && (
        <SubmitModal
          category={cat}
          categories={allCats}
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
