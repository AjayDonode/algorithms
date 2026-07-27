'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getInterviewCategories, InterviewCategory } from '@/lib/firestore';
import styles from './InterviewSidebar.module.css';

export function InterviewSidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<InterviewCategory[]>([]);

  useEffect(() => {
    getInterviewCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <p className={styles.label}>Categories</p>
        <ul className={styles.list}>
          {/* All categories link */}
          <li>
            <Link
              href="/interviews"
              className={`${styles.catItem} ${pathname === '/interviews' ? styles.active : ''}`}
            >
              <span className={styles.icon}>🎯</span>
              <span className={styles.catName}>All Topics</span>
            </Link>
          </li>

          {categories.map(cat => {
            const isActive = pathname === `/interviews/${cat.id}`;
            return (
              <li key={cat.id}>
                <Link
                  href={`/interviews/${cat.id}`}
                  className={`${styles.catItem} ${isActive ? styles.active : ''}`}
                  style={isActive ? { '--cat-color': cat.color } as React.CSSProperties : undefined}
                >
                  <span className={styles.icon}>{cat.icon}</span>
                  <span className={styles.catName}>{cat.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{categories.length}</span>
          <span className={styles.statLabel}>Categories</span>
        </div>
      </div>
    </aside>
  );
}
