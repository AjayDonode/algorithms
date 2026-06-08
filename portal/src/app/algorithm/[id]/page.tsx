import { notFound } from 'next/navigation';
import { getAlgorithmById } from '@/data/algorithms';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { DetailView } from '@/components/DetailView';
import styles from '../../page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AlgorithmPage({ params }: Props) {
  const { id } = await params;
  const algo = getAlgorithmById(id);
  if (!algo) notFound();

  return (
    <div className={styles.appShell}>
      <Header />
      <div className={styles.body}>
        <Sidebar activeCategory={algo.category} />
        <main className={styles.main}>
          <DetailView algo={algo} />
        </main>
      </div>
    </div>
  );
}
