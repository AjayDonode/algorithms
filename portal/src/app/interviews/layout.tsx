import { Header } from '@/components/Header';
import { InterviewSidebar } from '@/components/InterviewSidebar';
import styles from './interviews-layout.module.css';

/**
 * Layout for all /interviews pages.
 * - Provides the sidebar + main shell (same pattern as the home page)
 * - Does NOT include the Scratchpad (not relevant for interview Q&A)
 */
export default function InterviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.appShell}>
      <Header />
      <div className={styles.body}>
        <InterviewSidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
