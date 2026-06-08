import { notFound } from 'next/navigation';
import { getAlgorithmsByCategory } from '@/data/algorithms';
import { getCategoryById } from '@/data/categories';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AlgoCard } from '@/components/AlgoCard';
import styles from '../../page.module.css';
import catStyles from './category.module.css';

interface Props {
  params: Promise<{ cat: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  const category = getCategoryById(cat);
  if (!category) notFound();

  const algos = getAlgorithmsByCategory(cat);

  return (
    <div className={styles.appShell}>
      <Header />
      <div className={styles.body}>
        <Sidebar activeCategory={cat} />
        <main className={styles.main}>
          <div className={catStyles.catHeader}>
            <span className={catStyles.catIcon}>{category.icon}</span>
            <div>
              <h1 className={catStyles.catTitle}>{category.label} Algorithms</h1>
              <p className={catStyles.catDesc}>{category.description}</p>
            </div>
            <span className={catStyles.catCount}>{algos.length}</span>
          </div>
          <div className={catStyles.grid}>
            {algos.map(algo => <AlgoCard key={algo.id} algo={algo} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
