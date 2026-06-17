'use client';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { BlogEditor } from '../BlogEditor';
import styles from '../../admin.module.css';

export default function NewPostPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <Link href="/admin/blog" className={styles.breadcrumb}>← Back to Posts</Link>
            <h1 className={styles.heading}>New Blog Post</h1>
          </div>
        </div>
        <BlogEditor />
      </main>
    </div>
  );
}
