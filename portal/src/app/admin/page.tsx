'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { getAllUsers, getAllPosts, getPendingQuestions } from '@/lib/firestore';
import { ALGORITHMS } from '@/data/algorithms';
import styles from './admin.module.css';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ users: 0, posts: 0, published: 0, pendingQ: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/');
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([getAllUsers(), getAllPosts(), getPendingQuestions()]).then(([users, posts, pending]) => {
      setStats({
        users: users.length,
        posts: posts.length,
        published: posts.filter(p => !p.isDraft).length,
        pendingQ: pending.length,
      });
      setStatsLoading(false);
    });
  }, [isAdmin]);

  if (loading || !isAdmin) return null;

  const statCards = [
    { icon: '📚', label: 'Algorithms', value: ALGORITHMS.length, href: null },
    { icon: '✍️', label: 'Blog Posts', value: statsLoading ? '…' : stats.posts, href: '/admin/blog' },
    { icon: '🚀', label: 'Published', value: statsLoading ? '…' : stats.published, href: '/admin/blog' },
    { icon: '👤', label: 'Users', value: statsLoading ? '…' : stats.users, href: '/admin/users' },
    { icon: '🎯', label: 'Pending Q&A', value: statsLoading ? '…' : stats.pendingQ, href: '/admin/interviews' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>⚙️ Admin Panel</h1>
            <p className={styles.sub}>Manage blog posts, users, and content</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {statCards.map(card => (
            <div key={card.label} className={styles.statCard}>
              <span className={styles.statIcon}>{card.icon}</span>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
              {card.href && <Link href={card.href} className={styles.statLink}>Manage →</Link>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link href="/admin/blog/new" className={styles.actionCard}>
              <span className={styles.actionIcon}>✍️</span>
              <span className={styles.actionLabel}>New Blog Post</span>
              <span className={styles.actionDesc}>Write and publish a new post</span>
            </Link>
            <Link href="/admin/blog" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <span className={styles.actionLabel}>Manage Posts</span>
              <span className={styles.actionDesc}>Edit, publish, or delete posts</span>
            </Link>
            <Link href="/admin/users" className={styles.actionCard}>
              <span className={styles.actionIcon}>👥</span>
              <span className={styles.actionLabel}>Manage Users</span>
              <span className={styles.actionDesc}>View users and manage roles</span>
            </Link>
            <Link href="/blog" className={styles.actionCard}>
              <span className={styles.actionIcon}>🌐</span>
              <span className={styles.actionLabel}>View Blog</span>
              <span className={styles.actionDesc}>See the public blog</span>
            </Link>
            <Link href="/admin/interviews" className={styles.actionCard}>
              <span className={styles.actionIcon}>🎯</span>
              <span className={styles.actionLabel}>Interview Q&amp;A</span>
              <span className={styles.actionDesc}>Review submissions &amp; manage categories</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
