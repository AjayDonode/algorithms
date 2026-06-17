'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { getPostBySlug, BlogPost } from '@/lib/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './post.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post,    setPost]    = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostBySlug(params.slug).then(p => {
      setPost(p);
      setLoading(false);
    });
  }, [params.slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} style={{ height: '2rem', width: '60%' }} />
          <div className={styles.skeleton} style={{ height: '1rem', width: '40%' }} />
        </main>
      </div>
    );
  }

  if (!post || (post.isDraft)) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link href="/blog" className={styles.backLink}>← Back to Blog</Link>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span>by <strong>{post.authorName}</strong></span>
              <span className={styles.dot}>·</span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
          </header>

          <div className={styles.content}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
