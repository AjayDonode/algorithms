'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPost, updatePost, BlogPost } from '@/lib/firestore';
import styles from './editor.module.css';

interface Props {
  existing?: BlogPost; // when editing
}

export function BlogEditor({ existing }: Props) {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [title,   setTitle]   = useState(existing?.title   ?? '');
  const [slug,    setSlug]    = useState(existing?.slug    ?? '');
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [isDraft, setIsDraft] = useState(existing?.isDraft ?? true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function handleTitleChange(t: string) {
    setTitle(t);
    if (!existing) setSlug(autoSlug(t));
  }

  async function handleSave(draft: boolean) {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('Title, slug, and content are required.');
      return;
    }
    if (!user || !profile) return;
    setError('');
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        authorId: user.uid,
        authorName: profile.name,
        isDraft: draft,
        publishedAt: draft ? null : (existing?.publishedAt ?? new Date().toISOString()),
      };
      if (existing) {
        await updatePost(existing.id, data);
      } else {
        await createPost(data);
      }
      router.push('/admin/blog');
      router.refresh();
    } catch (e) {
      console.error(e);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input
          className={styles.input}
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="e.g. Understanding Big-O Notation"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input
            className={styles.input}
            value={slug}
            onChange={e => setSlug(autoSlug(e.target.value))}
            placeholder="understanding-big-o-notation"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Excerpt / Summary</label>
        <textarea
          className={styles.textarea}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={2}
          placeholder="A brief description shown on the blog listing page…"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Content (Markdown) *</label>
        <textarea
          className={`${styles.textarea} ${styles.contentArea}`}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={24}
          placeholder={`# Your post title here\n\nWrite your content in **Markdown**.\n\n## Section\n\nCode blocks:\n\`\`\`java\npublic static void main(String[] args) { }\n\`\`\``}
          spellCheck
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} type="button" onClick={() => router.back()}>
          Cancel
        </button>
        <button
          className={styles.draftBtn}
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          {saving ? 'Saving…' : '📝 Save as Draft'}
        </button>
        <button
          className={styles.publishBtn}
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? 'Publishing…' : '🚀 Publish'}
        </button>
      </div>
    </div>
  );
}
