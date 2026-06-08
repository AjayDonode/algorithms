'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { ALGORITHMS } from '@/data/algorithms';
import styles from './Sidebar.module.css';

interface Props {
  activeCategory: string;
}

export function Sidebar({ activeCategory }: Props) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <p className={styles.label}>Categories</p>
        <ul className={styles.list}>
          {CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? ALGORITHMS.length
              : ALGORITHMS.filter(a => a.category === cat.id).length;
            const href = cat.id === 'all' ? '/' : `/category/${cat.id}`;
            const isActive = cat.id === activeCategory ||
              (cat.id === 'all' && pathname === '/');

            return (
              <li key={cat.id}>
                <Link href={href} className={`${styles.catItem} ${isActive ? styles.active : ''}`}>
                  <span className={styles.icon}>{cat.icon}</span>
                  <span className={styles.catName}>{cat.label}</span>
                  <span className={styles.badge}>{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.section}>
        <p className={styles.label}>Difficulty</p>
        <div className={styles.chips}>
          <span className={`${styles.chip} ${styles.chipBeginner}`}>Beginner</span>
          <span className={`${styles.chip} ${styles.chipIntermediate}`}>Intermediate</span>
          <span className={`${styles.chip} ${styles.chipAdvanced}`}>Advanced</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{ALGORITHMS.length}</span>
          <span className={styles.statLabel}>Algorithms</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{CATEGORIES.length - 1}</span>
          <span className={styles.statLabel}>Categories</span>
        </div>
      </div>
    </aside>
  );
}
