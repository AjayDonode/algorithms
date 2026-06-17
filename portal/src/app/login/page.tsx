'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import styles from './auth.module.css';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred  = await signInWithEmailAndPassword(getAuthInstance(), email, password);
      const token = await cred.user.getIdToken();

      // Try to create a server session cookie (best-effort — not required for client auth)
      const sessRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!sessRes.ok) {
        const errData = await sessRes.json().catch(() => ({}));
        console.warn('[login] Session cookie not created:', errData.detail ?? sessRes.status);
      }

      // Redirect regardless — client auth state is the source of truth
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg === 'auth/invalid-credential' || msg === 'auth/user-not-found' || msg === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (msg === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoArea}>
        <span className={styles.logoMark}>⟨ ∑ ⟩</span>
        <span className={styles.logoText}>
          Algo<span className={styles.logoAccent}>Verse</span>
        </span>
      </div>

      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subheading}>Sign in to access your scratchpads &amp; more</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          id="login-submit"
          className={styles.submitBtn}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className={styles.footerLink}>Sign up for free</Link>
      </p>

      <Link href="/" className={styles.backLink}>← Back to AlgoVerse</Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.card} style={{ minHeight: 340 }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
