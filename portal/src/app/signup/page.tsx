'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { setUserProfile } from '@/lib/firestore';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const router = useRouter();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
      await updateProfile(cred.user, { displayName: name.trim() });

      // Save Firestore profile
      await setUserProfile(cred.user.uid, {
        name: name.trim(),
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      // Create session cookie
      const token = await cred.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (msg === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (msg === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <span className={styles.logoMark}>⟨ ∑ ⟩</span>
          <span className={styles.logoText}>
            Algo<span className={styles.logoAccent}>Verse</span>
          </span>
        </div>

        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subheading}>Save scratchpads, track progress across devices</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Ada Lovelace"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="signup-submit"
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.footerLink}>Sign in</Link>
        </p>
        <Link href="/" className={styles.backLink}>← Back to AlgoVerse</Link>
      </div>
    </div>
  );
}
