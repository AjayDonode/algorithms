import Link from 'next/link';
import { Algorithm } from '@/data/algorithms';
import styles from './AlgoCard.module.css';

interface Props { algo: Algorithm; }

const diffLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function AlgoCard({ algo }: Props) {
  return (
    <Link href={`/algorithm/${algo.id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.icon}>{algo.icon}</span>
        <span className={`${styles.diff} ${styles[algo.difficulty]}`}>
          {diffLabel[algo.difficulty]}
        </span>
      </div>
      <h3 className={styles.name}>{algo.name}</h3>
      <p className={styles.tagline}>{algo.tagline}</p>
      <div className={styles.footer}>
        <div className={styles.cplx}>
          <span className={styles.cplxLabel}>avg</span>
          <code className={styles.cplxVal}>{algo.complexity.time.avg}</code>
        </div>
        <div className={styles.cplx}>
          <span className={styles.cplxLabel}>space</span>
          <code className={styles.cplxVal}>{algo.complexity.space}</code>
        </div>
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  );
}
