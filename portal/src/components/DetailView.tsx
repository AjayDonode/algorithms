'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Algorithm } from '@/data/algorithms';
import { getCategoryById } from '@/data/categories';
import { Visualizer } from './Visualizer';
import { CodePanel } from './CodePanel';
import styles from './DetailView.module.css';

interface Props { algo: Algorithm; }

type Tab = 'explain' | 'visualizer' | 'code' | 'complexity';

const diffLabel: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function DetailView({ algo }: Props) {
  const [tab, setTab] = useState<Tab>('explain');
  const cat = getCategoryById(algo.category);

  return (
    <div className={styles.wrap}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadLink}>Home</Link>
        <span className={styles.sep}>›</span>
        <Link href={`/category/${algo.category}`} className={styles.breadLink}>
          {cat?.icon} {cat?.label}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.breadCurrent}>{algo.name}</span>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>{algo.icon}</div>
        <div className={styles.headerMeta}>
          <h1 className={styles.title}>{algo.name}</h1>
          <p className={styles.tagline}>{algo.tagline}</p>
          <div className={styles.badges}>
            <span className={`${styles.diffBadge} ${styles[algo.difficulty]}`}>
              {diffLabel[algo.difficulty]}
            </span>
            <code className={styles.badge}>{algo.complexity.time.avg}</code>
            <code className={styles.badge}>Space: {algo.complexity.space}</code>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar} role="tablist">
        {(['explain','visualizer','code','complexity'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'explain' && '📖 '}
            {t === 'visualizer' && '🎬 '}
            {t === 'code' && '💻 '}
            {t === 'complexity' && '📊 '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Explanation panel */}
      {tab === 'explain' && (
        <div className={styles.panel}>
          <div className={styles.explainBody}>
            {algo.explanation.split('\n\n').map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{
                __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} className={styles.explainP} />
            ))}

            <div className={styles.insight}>
              <div className={styles.insightLabel}>💡 Key Insight</div>
              <p className={styles.insightText}>{algo.keyInsight}</p>
            </div>

            <h3 className={styles.subhead}>Step-by-Step</h3>
            <ol className={styles.steps}>
              {algo.steps.map((s, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span dangerouslySetInnerHTML={{
                    __html: s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </li>
              ))}
            </ol>

            {algo.useCases.length > 0 && (
              <>
                <h3 className={styles.subhead}>Real-World Use Cases</h3>
                <div className={styles.useCases}>
                  {algo.useCases.map((u, i) => (
                    <span key={i} className={styles.useCase}>✓ {u}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Visualizer panel */}
      {tab === 'visualizer' && (
        <div className={styles.panel}>
          <Visualizer algo={algo} />
        </div>
      )}

      {/* Code panel */}
      {tab === 'code' && (
        <div className={styles.panel}>
          <CodePanel
            pseudocode={algo.pseudocode}
            javaCode={algo.javaCode}
            pythonCode={algo.pythonCode}
          />
        </div>
      )}

      {/* Complexity panel */}
      {tab === 'complexity' && (
        <div className={styles.panel}>
          <div className={styles.cplxCards}>
            {[
              { label: 'Best Case',    val: algo.complexity.time.best,  color: 'var(--green)' },
              { label: 'Average Case', val: algo.complexity.time.avg,   color: 'var(--accent)' },
              { label: 'Worst Case',   val: algo.complexity.time.worst, color: 'var(--red)' },
              { label: 'Space',        val: algo.complexity.space,      color: 'var(--text-secondary)' },
            ].map(c => (
              <div key={c.label} className={styles.cplxCard}>
                <span className={styles.cplxLabel}>{c.label}</span>
                <code className={styles.cplxVal} style={{ color: c.color }}>{c.val}</code>
              </div>
            ))}
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Case / Operation</th>
                  <th>Complexity</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {algo.complexityRows.map((r, i) => (
                  <tr key={i}>
                    <td className={styles.tdBold}>{r.label}</td>
                    <td><code className={styles.mono}>{r.value}</code></td>
                    <td className={styles.tdNote}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
