'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { saveScratchpad, updateScratchpad, ScratchpadLang } from '@/lib/firestore';
import { CATEGORIES } from '@/lib/solutions';
import styles from './SaveSolutionModal.module.css';

interface Props {
  code: string;
  lang: ScratchpadLang;
  onSaved: (title: string) => void;
  onClose: () => void;
  /** If set, modal is in edit mode — updates existing scratchpad metadata. */
  editMode?: boolean;
  existingId?: string;
  existingTitle?: string;
  existingCategory?: string;
  existingNotes?: string;
  ownerUid?: string;
}

export function SaveSolutionModal({
  code, lang, onSaved, onClose,
  editMode, existingId, existingTitle, existingCategory, existingNotes, ownerUid,
}: Props) {
  const { user } = useAuth();
  const [title,    setTitle]    = useState(editMode ? (existingTitle ?? '') : '');
  const [category, setCategory] = useState(editMode ? (existingCategory ?? 'Arrays') : 'Arrays');
  const [notes,    setNotes]    = useState(editMode ? (existingNotes ?? '') : '');
  const [saved,    setSaved]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const effectiveUid = ownerUid ?? user?.uid;

  async function handleSave() {
    if (!title.trim()) return;
    if (!effectiveUid) {
      setError('Please log in to save your scratchpad.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editMode && existingId) {
        // Update only metadata fields (title, category, notes)
        await updateScratchpad(effectiveUid, existingId, {
          title: title.trim(),
          category,
          notes: notes.trim(),
        });
      } else {
        await saveScratchpad(effectiveUid, {
          title: title.trim(),
          category,
          lang,
          code,
          notes: notes.trim(),
        });
      }
      setSaved(true);
      setTimeout(() => onSaved(title.trim()), 900);
    } catch (e) {
      console.error(e);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Not logged in state (skip in editMode — owner is always logged in)
  if (!editMode && !user) {
    return (
      <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <span className={styles.headerIcon}>🔐</span>
            <span className={styles.headerTitle}>Sign In to Save</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className={styles.body}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              Your scratchpads are saved to your account and accessible from any device.
            </p>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <a href="/login" className={styles.saveBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                Log In to Save
              </a>
            </div>
            <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No account? <a href="/signup" style={{ color: 'var(--accent)' }}>Sign up free</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>{editMode ? '✏️' : '💾'}</span>
          <span className={styles.headerTitle}>{editMode ? 'Edit Scratchpad' : 'Save Scratchpad'}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {saved ? (
          <div className={styles.successState}>
            <span className={styles.successIcon}>✅</span>
            <p>{editMode ? 'Scratchpad' : 'Saved to'} <strong>{editMode ? 'updated!' : 'My Scratchpads!'}</strong></p>
            {!editMode && <p className={styles.successSub}>Find it in the <em>{category}</em> category.</p>}
          </div>
        ) : (
          <div className={styles.body}>
            {error && (
              <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {error}
              </div>
            )}

            {/* Title */}
            <label className={styles.label}>
              Problem / Solution title <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Two Sum — HashMap approach"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />

            {/* Category */}
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Notes */}
            <label className={styles.label}>Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Key insights, time/space complexity, edge cases…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />

            {/* Code preview — hidden in edit mode since code doesn't change */}
            {!editMode && (
              <>
                <div className={styles.previewLabel}>
                  <span>Code preview</span>
                  <span className={styles.langBadge}>{lang}</span>
                </div>
                <pre className={styles.codePreview}>{code.slice(0, 300)}{code.length > 300 ? '\n…' : ''}</pre>
              </>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!title.trim() || saving}
              >
                {saving ? '⏳ Saving…' : editMode ? '💾 Update' : '💾 Save Scratchpad'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
