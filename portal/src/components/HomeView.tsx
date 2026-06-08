import Link from 'next/link';
import { ALGORITHMS } from '@/data/algorithms';
import { CATEGORIES } from '@/data/categories';
import { AlgoCard } from './AlgoCard';
import styles from './HomeView.module.css';

export function HomeView() {
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

      {/* All algorithms grid */}
      <div className={styles.sectionHead}>
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
