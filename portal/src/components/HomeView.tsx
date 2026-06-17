'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ALGORITHMS } from '@/data/algorithms';
import { CATEGORIES } from '@/data/categories';
import { AlgoCard } from './AlgoCard';
import { getPublishedPosts, BlogPost } from '@/lib/firestore';
import styles from './HomeView.module.css';

export function HomeView() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getPublishedPosts(3).then(setPosts).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>
          <span>⚡</span>
          <span>{ALGORITHMS.length} Algorithms · Interactive Visualizations · Real Java Code</span>
        </div>
        <h1 className={styles.heroTitle}>
          Learn Algorithms,{' '}
          <span className={styles.heroAccent}>Visually</span>
        </h1>
        <p className={styles.heroSub}>
          Step-by-step animations, plain-English explanations, and real source code — extracted directly from your Java project.
        </p>
        <div className={styles.heroActions}>
          <Link href="/category/sorting" className={styles.heroCta}>
            Start with Sorting →
          </Link>
          <Link href="/algorithm/binary-search" className={styles.heroSecondary}>
            Binary Search
          </Link>
        </div>
      </section>

      {/* Category quick-links */}
      <div className={styles.catGrid}>
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
          const count = ALGORITHMS.filter(a => a.category === cat.id).length;
          return (
            <Link key={cat.id} href={`/category/${cat.id}`} className={styles.catCard}>
              <span className={styles.catCardIcon}>{cat.icon}</span>
              <span className={styles.catCardName}>{cat.label}</span>
              <span className={styles.catCardCount}>{count}</span>
            </Link>
          );
        })}
      </div>

      {/* Latest Blog Posts */}
      {posts.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>✍️ Latest from the Blog</h2>
            <Link href="/blog" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--r-xl)',
                  padding: '1.25rem',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                   onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{post.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 500 }}>Read More →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All algorithms grid */}
      <div className={styles.sectionHead} style={{ marginTop: '3rem' }}>
        <h2 className={styles.sectionTitle}>All Algorithms</h2>
        <span className={styles.sectionCount}>{ALGORITHMS.length}</span>
      </div>

      <div className={styles.grid}>
        {ALGORITHMS.map(algo => (
          <AlgoCard key={algo.id} algo={algo} />
        ))}
      </div>
    </div>
  );
}
