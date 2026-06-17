import styles from './cheatsheet.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algo Cheat Sheet — AlgoVerse',
  description: 'Quick reference for algorithm patterns, complexities, and decision trees. Your interview prep companion.',
};

export default function CheatsheetPage() {
  return (
    <div className={styles.shell}>
      <div className={styles.frameWrap}>
        <iframe
          src="/cheatsheet.html"
          className={styles.frame}
          title="Algorithm Patterns Cheat Sheet"
          loading="lazy"
        />
      </div>
    </div>
  );
}
