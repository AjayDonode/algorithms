'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './StudySlides.module.css';

/* ─── Types ──────────────────────────────────────────────────────── */
interface Slide {
  title: string;
  emoji: string;
  type: 'intro' | 'concept' | 'code' | 'tip' | 'quiz' | 'summary';
  bullets: string[];
  code: string;         // empty string "" when not applicable
  codeLanguage: string; // empty string "" when not applicable
  note: string;         // empty string "" when not applicable
  tags: string[];
}

interface StudySlidesData {
  topic: string;
  slides: Slide[];
}

type Stage = 'input' | 'loading' | 'deck' | 'error';

const QUICK_TOPICS = [
  'Dynamic Programming', 'Binary Search', 'Graph BFS/DFS',
  'System Design', 'React Hooks', 'Kubernetes', 'SQL Joins',
  'Java Concurrency', 'REST vs GraphQL', 'Docker',
];

const TYPE_LABELS: Record<Slide['type'], string> = {
  intro:   'Introduction',
  concept: 'Core Concept',
  code:    'Code Example',
  tip:     'Interview Tip',
  quiz:    'Practice Questions',
  summary: 'Summary',
};

/* ─── Slide Card ─────────────────────────────────────────────────── */
function SlideCard({ slide }: { slide: Slide }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (!slide.code) return;
    navigator.clipboard.writeText(slide.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.slide} role="article">
      {/* Header */}
      <div className={styles.slideHeader}>
        <span className={styles.slideEmoji} aria-hidden="true">{slide.emoji}</span>
        <div className={styles.slideTitleGroup}>
          <div className={styles.slideType} data-type={slide.type}>
            {TYPE_LABELS[slide.type]}
          </div>
          <h2 className={styles.slideTitle}>{slide.title}</h2>
          {slide.tags && slide.tags.length > 0 && (
            <div className={styles.slideTags}>
              {slide.tags.map(tag => (
                <span key={tag} className={styles.slideTag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.slideBody}>
        {/* Bullets */}
        {slide.bullets && slide.bullets.length > 0 && (
          <ul className={styles.slideBullets}>
            {slide.bullets.map((b, i) => (
              <li key={i} className={styles.slideBullet}>
                <span className={styles.bulletDot} aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Code block */}
        {slide.code && (
          <div className={styles.codeBlock}>
            <div className={styles.codeBlockHeader}>
              <span className={styles.codeLang}>{slide.codeLanguage || 'code'}</span>
              <button className={styles.codeCopyBtn} onClick={copyCode} aria-label="Copy code">
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
            <div className={styles.codeBlockBody}>
              <pre><code>{slide.code}</code></pre>
            </div>
          </div>
        )}

        {/* Interviewer note */}
        {slide.note && (
          <div className={styles.slideNote} role="note">
            <span className={styles.slideNoteIcon}>💡</span>
            <span className={styles.slideNoteText}>{slide.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main StudySlides Component ─────────────────────────────────── */
export function StudySlides() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('input');
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<StudySlidesData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-focus input when panel opens */
  useEffect(() => {
    if (overlayOpen && stage === 'input') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [overlayOpen, stage]);

  /* Keyboard nav */
  useEffect(() => {
    if (!overlayOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
      if (stage !== 'deck') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevSlide();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayOpen, stage, currentSlide, data]);

  function openPanel() {
    setOverlayOpen(true);
    setStage('input');
    setData(null);
    setCurrentSlide(0);
    setTopic('');
    setErrorMsg('');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    setOverlayOpen(false);
    document.body.style.overflow = '';
  }

  const nextSlide = useCallback(() => {
    if (data) setCurrentSlide(c => Math.min(c + 1, data.slides.length - 1));
  }, [data]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(c => Math.max(c - 1, 0));
  }, []);

  async function generateSlides(t?: string) {
    const finalTopic = (t || topic).trim();
    if (!finalTopic) return;

    setStage('loading');
    setErrorMsg('');
    setCurrentSlide(0);

    try {
      const res = await fetch('/api/study-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: finalTopic }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const json = await res.json() as StudySlidesData;
      setData(json);
      setStage('deck');
    } catch (err) {
      console.error('generateSlides error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  function handleTopicChip(chip: string) {
    setTopic(chip);
    generateSlides(chip);
  }

  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') generateSlides();
  }

  function resetToInput() {
    setStage('input');
    setData(null);
    setCurrentSlide(0);
  }

  /* ── Render ── */
  return (
    <>
      {/* Entry card shown on homepage */}
      <div
        id="study-slides-entry"
        className={styles.entryCard}
        role="button"
        tabIndex={0}
        aria-label="Open Study Slides panel"
        onClick={openPanel}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openPanel()}
      >
        <div className={styles.entryCardTop}>
          <span className={styles.entryCardIcon}>🧠</span>
          <div className={styles.entryCardMeta}>
            <div className={styles.entryCardTitle}>AI Study Slides</div>
            <div className={styles.entryCardSub}>Enter any topic — get interview-ready slides instantly</div>
          </div>
          <span className={styles.entryCardArrow}>→</span>
        </div>
        <div className={styles.entryCardTags}>
          {['Dynamic Programming', 'System Design', 'React Hooks', 'Any Topic...'].map(t => (
            <span key={t} className={styles.entryCardTag}>{t}</span>
          ))}
        </div>
      </div>

      {/* Full-screen overlay */}
      {overlayOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Study Slides panel"
        >
          {/* Header */}
          <div className={styles.panelHeader}>
            <button
              id="close-study-slides"
              className={styles.closeBtn}
              onClick={closePanel}
              aria-label="Close study slides"
            >
              ✕
            </button>
            <span className={styles.panelTitle}>🧠 AI Study Slides</span>
            <span className={styles.panelBadge}>Interview Prep</span>
          </div>

          {/* Input stage */}
          {stage === 'input' && (
            <div className={styles.inputStage}>
              <div className={styles.inputStageGlow} aria-hidden="true" />
              <span className={styles.inputStageEmoji} aria-hidden="true">📚</span>
              <h1 className={styles.inputStageTitle}>
                Study <span className={styles.inputStageAccent}>Any Topic</span>
              </h1>
              <p className={styles.inputStageSub}>
                Enter a topic and get concise, interview-ready slides generated by AI — perfect for quick prep or deep revision.
              </p>

              <div className={styles.inputRow}>
                <input
                  ref={inputRef}
                  id="study-topic-input"
                  type="text"
                  className={styles.topicInput}
                  placeholder="e.g. Binary Search Trees, React Hooks, System Design..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={handleInputKey}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  id="generate-slides-btn"
                  className={styles.generateBtn}
                  onClick={() => generateSlides()}
                  disabled={!topic.trim()}
                  aria-label="Generate study slides"
                >
                  <span>✨</span>
                  <span>Generate</span>
                </button>
              </div>

              <div className={styles.quickTopics} aria-label="Quick topic suggestions">
                {QUICK_TOPICS.map(t => (
                  <button
                    key={t}
                    className={styles.quickTopic}
                    onClick={() => handleTopicChip(t)}
                    aria-label={`Study ${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading stage */}
          {stage === 'loading' && (
            <div className={styles.loadingStage} role="status" aria-live="polite">
              <div className={styles.loadingOrb} aria-hidden="true" />
              <p className={styles.loadingText}>
                Generating slides for <strong>&ldquo;{topic}&rdquo;</strong>
                <span className={styles.loadingDots} />
              </p>
            </div>
          )}

          {/* Slide deck stage */}
          {stage === 'deck' && data && (
            <div className={styles.deckStage}>
              <div className={styles.deckMeta}>
                <span className={styles.deckTopic}>{data.topic}</span>
                <span className={styles.deckProgress}>
                  {currentSlide + 1} / {data.slides.length}
                </span>
                <button
                  id="new-topic-btn"
                  className={styles.newTopicBtn}
                  onClick={resetToInput}
                  aria-label="Start a new topic"
                >
                  ＋ New Topic
                </button>
              </div>

              {/* Slide viewer */}
              <div
                className={styles.slideViewer}
                role="region"
                aria-label={`Slide ${currentSlide + 1} of ${data.slides.length}`}
              >
                <SlideCard key={currentSlide} slide={data.slides[currentSlide]} />
              </div>

              {/* Navigation */}
              <div className={styles.deckNav} role="navigation" aria-label="Slide navigation">
                <button
                  id="prev-slide-btn"
                  className={styles.navBtn}
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  aria-label="Previous slide"
                >
                  ←
                </button>

                <div className={styles.dotIndicators} role="tablist" aria-label="Slides">
                  {data.slides.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === currentSlide}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`${styles.dot} ${i === currentSlide ? styles.active : ''}`}
                      onClick={() => setCurrentSlide(i)}
                    />
                  ))}
                </div>

                <button
                  id="next-slide-btn"
                  className={styles.navBtn}
                  onClick={nextSlide}
                  disabled={currentSlide === data.slides.length - 1}
                  aria-label="Next slide"
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* Error stage */}
          {stage === 'error' && (
            <div className={styles.errorState} role="alert">
              <span className={styles.errorEmoji} aria-hidden="true">⚠️</span>
              <p className={styles.errorText}>
                {errorMsg || 'Something went wrong while generating slides. Please try again.'}
              </p>
              <button
                id="retry-slides-btn"
                className={styles.retryBtn}
                onClick={resetToInput}
              >
                ← Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
