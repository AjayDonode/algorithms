'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { getAllUsers, UserProfile } from '@/lib/firestore';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users,   setUsers]   = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  async function promoteAdmin(uid: string, name: string) {
    if (!confirm(`Promote ${name} to Admin?`)) return;
    const res = await fetch('/api/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    if (res.ok) {
      setUsers(u => u.map(x => x.uid === uid ? { ...x, role: 'admin' } : x));
      showToast(`${name} is now an admin`);
    } else {
      showToast('Failed to promote user');
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <Link href="/admin" className={styles.breadcrumb}>← Admin</Link>
            <h1 className={styles.heading}>Users</h1>
            <p className={styles.sub}>{users.length} registered users</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingText}>Loading users…</div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>
            {users.map(u => (
              <div key={u.uid} className={styles.tableRow}>
                <span className={styles.tableCell}>{u.name}</span>
                <span className={styles.tableCell} style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                <span className={u.role === 'admin' ? styles.badgeLive : styles.badgeDraft}>
                  {u.role}
                </span>
                <span className={styles.tableCell}>
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className={styles.rowActions}>
                  {u.role !== 'admin' && u.uid !== me?.uid && (
                    <button className={styles.toggleBtn} onClick={() => promoteAdmin(u.uid, u.name)}>
                      ⬆ Promote to Admin
                    </button>
                  )}
                  {u.uid === me?.uid && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
