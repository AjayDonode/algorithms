'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { getPublishedPosts, getAllPosts, BlogPost, getSharedScratchpads, SharedScratchpad } from '@/lib/firestore';
import styles from './blog.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return 'Draft';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const { isAdmin } = useAuth();
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [shared,  setShared]  = useState<SharedScratchpad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [data, sharedData] = await Promise.all([
        isAdmin ? getAllPosts() : getPublishedPosts(),
        getSharedScratchpads(),
      ]);
      setPosts(data);
      setShared(sharedData);
      setLoading(false);
    })();
  }, [isAdmin]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroTag}>✍️ AlgoVerse Blog</div>
          <h1 className={styles.heroTitle}>Insights &amp; <span className={styles.heroAccent}>Deep Dives</span></h1>
          <p className={styles.heroSub}>Algorithm breakdowns, interview tips, and CS concepts — written by the AlgoVerse team.</p>
          {isAdmin && (
            <Link href="/admin/blog/new" className={styles.newPostBtn}>+ New Post</Link>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingRow}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <span>📝</span>
            <p>No posts yet. {isAdmin && <Link href="/admin/blog/new">Create the first one →</Link>}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {posts.map(post => (
              <article key={post.id} className={`${styles.card} ${post.isDraft ? styles.draftCard : ''}`}>
                {post.isDraft && <span className={styles.draftBadge}>Draft</span>}
                <div className={styles.cardMeta}>
                  <span className={styles.cardAuthor}>by {post.authorName}</span>
                  <span className={styles.cardDot}>·</span>
                  <span className={styles.cardDate}>{formatDate(post.publishedAt)}</span>
                </div>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <div className={styles.cardFooter}>
                  <Link href={`/blog/${post.slug}`} className={styles.readBtn}>Read More →</Link>
                  {isAdmin && (
                    <Link href={`/admin/blog/edit/${post.id}`} className={styles.editBtn}>Edit</Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Community Scratchpads ── */}
        <div className={styles.communitySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>⌨️ Community Scratchpads</div>
            <h2 className={styles.sectionTitle}>Shared by the <span className={styles.heroAccent}>Community</span></h2>
            <p className={styles.heroSub}>Runnable code shared by AlgoVerse users. Click Run to try it in your browser.</p>
          </div>
          {loading ? (
            <div className={styles.loadingRow}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : shared.length === 0 ? (
            <div className={styles.empty}>
              <span>⌨️</span>
              <p>No shared scratchpads yet. Own a scratchpad? Share it from <Link href="/account/scratchpads">My Scratchpads →</Link></p>
            </div>
          ) : (
            <div className={styles.grid}>
              {shared.map(s => (
                <article key={s.id} className={`${styles.card} ${styles.scratchCard}`}>
                  <div className={styles.scratchCardBadge}>
                    <span className={styles.langPill} data-lang={s.lang}>{s.lang}</span>
                    <span className={styles.catPill}>{s.category}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardAuthor}>by {s.ownerName}</span>
                    <span className={styles.cardDot}>·</span>
                    <span className={styles.cardDate}>{formatDate(s.sharedAt)}</span>
                  </div>
                  <h2 className={styles.cardTitle}>{s.title}</h2>
                  {s.notes && <p className={styles.cardExcerpt}>{s.notes}</p>}
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.runScratchBtn}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('av:scratchpad:load', {
                          detail: { code: s.code, lang: s.lang, readonly: true },
                        }));
                      }}
                    >
                      ▶ Run
                    </button>
                    <span className={styles.readOnlyHint}>👁 Read-only</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
