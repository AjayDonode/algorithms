'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ALGORITHMS } from '@/data/algorithms';
import styles from './Header.module.css';

export function Header() {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof ALGORITHMS>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setOpen(false); return; }
    const matched = ALGORITHMS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q)
    ).slice(0, 7);
    setResults(matched);
    setOpen(matched.length > 0);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function pickResult(id: string) {
    setQuery('');
    setOpen(false);
    router.push(`/algorithm/${id}`);
  }

  const diffColors: Record<string, string> = {
    beginner: 'var(--green)',
    intermediate: 'var(--accent)',
    advanced: 'var(--red)',
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>⟨ ∑ ⟩</span>
          <span className={styles.logoText}>
            Algo<span className={styles.logoAccent}>Verse</span>
          </span>
        </Link>

        {/* Search */}
        <div className={styles.searchWrap}>
          <div className={styles.searchIcon}>
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search algorithms…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
          {open && (
            <div ref={dropRef} className={styles.dropdown}>
              {results.map(a => (
                <button key={a.id} className={styles.dropItem} onClick={() => pickResult(a.id)}>
                  <span className={styles.dropIcon}>{a.icon}</span>
                  <span className={styles.dropContent}>
                    <span className={styles.dropName}>{a.name}</span>
                    <span className={styles.dropMeta}>
                      <span style={{ color: diffColors[a.difficulty] }}>{a.difficulty}</span>
                      {' · '}
                      <span>{a.category}</span>
                      {' · '}
                      <span className={styles.dropComplexity}>{a.complexity.time.avg}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/category/sorting" className={styles.navLink}>Sort</Link>
          <Link href="/category/graph" className={styles.navLink}>Graph</Link>
          <Link href="/category/trees" className={styles.navLink}>Trees</Link>
          <span className={styles.count}>{ALGORITHMS.length} algorithms</span>

          {/* Theme toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <span className={styles.toggleTrack} data-theme={theme}>
              <span className={styles.toggleThumb}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}
