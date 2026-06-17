'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { getAllPosts, deletePost, updatePost, BlogPost } from '@/lib/firestore';
import styles from '../admin.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminBlogPage() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    getAllPosts().then(p => { setPosts(p); setLoading(false); });
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deletePost(id);
    setPosts(p => p.filter(x => x.id !== id));
    showToast('Post deleted');
  }

  async function togglePublish(post: BlogPost) {
    const nowDraft = !post.isDraft;
    await updatePost(post.id, {
      isDraft: nowDraft,
      publishedAt: nowDraft ? null : new Date().toISOString(),
    });
    setPosts(p => p.map(x => x.id === post.id ? { ...x, isDraft: nowDraft, publishedAt: nowDraft ? null : new Date().toISOString() } : x));
    showToast(nowDraft ? 'Post unpublished' : 'Post published');
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <Link href="/admin" className={styles.breadcrumb}>← Admin</Link>
            <h1 className={styles.heading}>Blog Posts</h1>
            <p className={styles.sub}>{posts.length} total · {posts.filter(p => !p.isDraft).length} published</p>
          </div>
          <Link href="/admin/blog/new" className={styles.primaryBtn}>+ New Post</Link>
        </div>

        {loading ? (
          <div className={styles.loadingText}>Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <span>📝</span>
            <p>No posts yet. <Link href="/admin/blog/new">Create the first one →</Link></p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Title</span>
              <span>Status</span>
              <span>Published</span>
              <span>Actions</span>
            </div>
            {posts.map(post => (
              <div key={post.id} className={styles.tableRow}>
                <div className={styles.postTitle}>
                  <Link href={`/blog/${post.slug}`} className={styles.postTitleLink}>{post.title}</Link>
                  <span className={styles.postSlug}>/{post.slug}</span>
                </div>
                <span className={post.isDraft ? styles.badgeDraft : styles.badgeLive}>
                  {post.isDraft ? 'Draft' : 'Live'}
                </span>
                <span className={styles.tableCell}>{formatDate(post.publishedAt)}</span>
                <div className={styles.rowActions}>
                  <button className={styles.toggleBtn} onClick={() => togglePublish(post)}>
                    {post.isDraft ? '🚀 Publish' : '📝 Unpublish'}
                  </button>
                  <Link href={`/admin/blog/edit/${post.id}`} className={styles.editBtn}>Edit</Link>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(post.id, post.title)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
