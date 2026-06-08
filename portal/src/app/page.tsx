import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HomeView } from '@/components/HomeView';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.appShell}>
      <Header />
      <div className={styles.body}>
        <Sidebar activeCategory="all" />
        <main className={styles.main}>
          <HomeView />
        </main>
      </div>
    </div>
  );
}
