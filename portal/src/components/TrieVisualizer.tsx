'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Algorithm } from '@/data/algorithms';
import styles from './TrieVisualizer.module.css';

interface TrieNode {
  id: string;
  char: string;
  isWord: boolean;
  children: Record<string, TrieNode>;
}

interface TrieStep {
  trieSnapshot: TrieNode;
  activeNodeId: string | null;
  visitedNodeIds: string[];
  errorNodeId: string | null;
  message: string;
}

const INITIAL_WORDS = ['cat', 'car', 'dog', 'do'];

// ── Trie Helpers ──────────────────────────────────────────

function createEmptyRoot(): TrieNode {
  return { id: 'root', char: '', isWord: false, children: {} };
}

function cloneTrie(node: TrieNode): TrieNode {
  const clonedChildren: Record<string, TrieNode> = {};
  for (const [char, child] of Object.entries(node.children)) {
    clonedChildren[char] = cloneTrie(child);
  }
  return {
    id: node.id,
    char: node.char,
    isWord: node.isWord,
    children: clonedChildren,
  };
}

// ── Step Generators ───────────────────────────────────────

function generateInsertSteps(root: TrieNode, word: string): TrieStep[] {
  const steps: TrieStep[] = [];
  const trieCopy = cloneTrie(root);
  let curr = trieCopy;
  const visited: string[] = [trieCopy.id];

  steps.push({
    trieSnapshot: cloneTrie(trieCopy),
    activeNodeId: trieCopy.id,
    visitedNodeIds: [...visited],
    errorNodeId: null,
    message: `Start inserting the word "<b>${word}</b>" starting from the ROOT node.`,
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const childId = curr.id + '-' + char;

    if (!curr.children[char]) {
      curr.children[char] = {
        id: childId,
        char,
        isWord: false,
        children: {},
      };

      steps.push({
        trieSnapshot: cloneTrie(trieCopy),
        activeNodeId: childId,
        visitedNodeIds: [...visited],
        errorNodeId: null,
        message: `Character '<b>${char}</b>' not found under Node <b>${curr.char || 'ROOT'}</b>. Create a new TrieNode for '<b>${char}</b>'.`,
      });
    } else {
      steps.push({
        trieSnapshot: cloneTrie(trieCopy),
        activeNodeId: childId,
        visitedNodeIds: [...visited],
        errorNodeId: null,
        message: `Character '<b>${char}</b>' found under Node <b>${curr.char || 'ROOT'}</b>. Traverse down path.`,
      });
    }

    curr = curr.children[char];
    visited.push(curr.id);
  }

  curr.isWord = true;
  steps.push({
    trieSnapshot: cloneTrie(trieCopy),
    activeNodeId: curr.id,
    visitedNodeIds: [...visited],
    errorNodeId: null,
    message: `Reached end of word "<b>${word}</b>". Mark Node <b>${curr.char}</b> as a complete word-end node (isWord = true).`,
  });

  return steps;
}

function generateSearchSteps(root: TrieNode, word: string): TrieStep[] {
  const steps: TrieStep[] = [];
  const trieCopy = cloneTrie(root);
  let curr = trieCopy;
  const visited: string[] = [trieCopy.id];

  steps.push({
    trieSnapshot: cloneTrie(trieCopy),
    activeNodeId: trieCopy.id,
    visitedNodeIds: [...visited],
    errorNodeId: null,
    message: `Start search lookup for word "<b>${word}</b>" from the ROOT node.`,
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const childId = curr.id + '-' + char;

    if (!curr.children[char]) {
      steps.push({
        trieSnapshot: cloneTrie(trieCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        errorNodeId: curr.id,
        message: `❌ Character '<b>${char}</b>' not found under Node <b>${curr.char || 'ROOT'}</b>. Word "<b>${word}</b>" does not exist in the Trie.`,
      });
      return steps;
    }

    curr = curr.children[char];
    visited.push(curr.id);

    steps.push({
      trieSnapshot: cloneTrie(trieCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      errorNodeId: null,
      message: `Character '<b>${char}</b>' found. Move to Node <b>${curr.char}</b>.`,
    });
  }

  if (curr.isWord) {
    steps.push({
      trieSnapshot: cloneTrie(trieCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      errorNodeId: null,
      message: `🎉 Success! Word "<b>${word}</b>" found in the Trie. Node <b>${curr.char}</b> is marked isWord = true.`,
    });
  } else {
    steps.push({
      trieSnapshot: cloneTrie(trieCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      errorNodeId: curr.id,
      message: `⚠️ Prefix "<b>${word}</b>" matches, but it is not marked as a completed word (isWord = false). Search fails!`,
    });
  }

  return steps;
}

function generateStartsWithSteps(root: TrieNode, prefix: string): TrieStep[] {
  const steps: TrieStep[] = [];
  const trieCopy = cloneTrie(root);
  let curr = trieCopy;
  const visited: string[] = [trieCopy.id];

  steps.push({
    trieSnapshot: cloneTrie(trieCopy),
    activeNodeId: trieCopy.id,
    visitedNodeIds: [...visited],
    errorNodeId: null,
    message: `Start prefix checking for "<b>${prefix}</b>" from the ROOT node.`,
  });

  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    const childId = curr.id + '-' + char;

    if (!curr.children[char]) {
      steps.push({
        trieSnapshot: cloneTrie(trieCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        errorNodeId: curr.id,
        message: `❌ Character '<b>${char}</b>' not found under Node <b>${curr.char || 'ROOT'}</b>. Prefix "<b>${prefix}</b>" does not exist in the Trie.`,
      });
      return steps;
    }

    curr = curr.children[char];
    visited.push(curr.id);

    steps.push({
      trieSnapshot: cloneTrie(trieCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      errorNodeId: null,
      message: `Character '<b>${char}</b>' found. Move to Node <b>${curr.char}</b>.`,
    });
  }

  steps.push({
    trieSnapshot: cloneTrie(trieCopy),
    activeNodeId: curr.id,
    visitedNodeIds: [...visited],
    errorNodeId: null,
    message: `🎉 Success! Prefix "<b>${prefix}</b>" exists in the Trie (terminates at Node <b>${curr.char}</b>).`,
  });

  return steps;
}

// ── Component ─────────────────────────────────────────────

export function TrieVisualizer({ algo }: { algo: Algorithm }) {
  const [trie, setTrie] = useState<TrieNode>(() => {
    const root = createEmptyRoot();
    INITIAL_WORDS.forEach(w => {
      let curr = root;
      for (let i = 0; i < w.length; i++) {
        const char = w[i];
        const childId = curr.id + '-' + char;
        if (!curr.children[char]) {
          curr.children[char] = { id: childId, char, isWord: false, children: {} };
        }
        curr = curr.children[char];
      }
      curr.isWord = true;
    });
    return root;
  });

  const [wordsList, setWordsList] = useState<string[]>(INITIAL_WORDS);
  const [inputWord, setInputWord] = useState('');
  const [speed, setSpeed] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [steps, setSteps] = useState<TrieStep[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize generic starting state
  useEffect(() => {
    const initialSteps: TrieStep[] = [{
      trieSnapshot: cloneTrie(trie),
      activeNodeId: null,
      visitedNodeIds: [],
      errorNodeId: null,
      message: 'Trie Prefix Tree initialized. Add or search words to animate traversal paths.',
    }];
    setSteps(initialSteps);
    setStepIdx(0);
  }, [trie]);

  // Animation ticks
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStepIdx(i => i + 1);
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, steps.length, speed]);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Operations
  const handleInsert = () => {
    stop();
    const word = inputWord.trim().toLowerCase();
    if (!word || !/^[a-z]+$/.test(word) || word.length > 8) return;

    // Generate steps using current state
    const newSteps = generateInsertSteps(trie, word);
    setSteps(newSteps);
    setStepIdx(0);
    setPlaying(true);

    // Apply permanent insert to actual state
    const updatedTrie = cloneTrie(trie);
    let curr = updatedTrie;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const childId = curr.id + '-' + char;
      if (!curr.children[char]) {
        curr.children[char] = { id: childId, char, isWord: false, children: {} };
      }
      curr = curr.children[char];
    }
    curr.isWord = true;
    setTrie(updatedTrie);

    if (!wordsList.includes(word)) {
      setWordsList([...wordsList, word]);
    }
    setInputWord('');
  };

  const handleSearch = () => {
    stop();
    const word = inputWord.trim().toLowerCase();
    if (!word || !/^[a-z]+$/.test(word) || word.length > 8) return;

    const newSteps = generateSearchSteps(trie, word);
    setSteps(newSteps);
    setStepIdx(0);
    setPlaying(true);
  };

  const handleStartsWith = () => {
    stop();
    const prefix = inputWord.trim().toLowerCase();
    if (!prefix || !/^[a-z]+$/.test(prefix) || prefix.length > 8) return;

    const newSteps = generateStartsWithSteps(trie, prefix);
    setSteps(newSteps);
    setStepIdx(0);
    setPlaying(true);
  };

  const step = steps[stepIdx] ?? steps[0];
  if (!step) return null;

  // ── Layout Computation ────────────────────────────────────

  const W = 600;
  const H = 280;
  const positions: Record<string, { x: number; y: number }> = {};

  const leafCounter = { count: 0 };
  calculateTrieLayout(step.trieSnapshot, 0, leafCounter, positions);

  function calculateTrieLayout(
    node: TrieNode,
    depth: number,
    counter: { count: number },
    positionsMap: Record<string, { x: number; y: number }>
  ): number {
    const childrenList = Object.values(node.children);

    if (childrenList.length === 0) {
      const x = counter.count++;
      positionsMap[node.id] = { x, y: 40 + depth * 48 };
      return x;
    }

    let xSum = 0;
    childrenList.forEach(child => {
      xSum += calculateTrieLayout(child, depth + 1, counter, positionsMap);
    });

    const x = xSum / childrenList.length;
    positionsMap[node.id] = { x, y: 40 + depth * 48 };
    return x;
  }

  // Scale node positions to fit view area
  const leavesCount = leafCounter.count;
  const xScale = leavesCount > 1 ? W / (leavesCount + 1) : W / 2;

  // Collect flat nodes and edges for drawing
  const flatNodes: { id: string; char: string; isWord: boolean }[] = [];
  const flatEdges: { from: string; to: string }[] = [];
  collectNodesAndEdges(step.trieSnapshot, flatNodes, flatEdges);

  function collectNodesAndEdges(
    node: TrieNode,
    nList: { id: string; char: string; isWord: boolean }[],
    eList: { from: string; to: string }[]
  ) {
    nList.push({ id: node.id, char: node.char, isWord: node.isWord });
    for (const child of Object.values(node.children)) {
      eList.push({ from: node.id, to: child.id });
      collectNodesAndEdges(child, nList, eList);
    }
  }

  const getScaledCoords = (nodeId: string) => {
    const raw = positions[nodeId];
    if (!raw) return { cx: W / 2, cy: 40 };
    return {
      cx: (raw.x + 1) * xScale,
      cy: raw.y,
    };
  };

  return (
    <div className={styles.wrap}>
      {/* Dynamic SVG Canvas */}
      <div className={styles.canvas}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
          {/* Edges */}
          {flatEdges.map((edge, idx) => {
            const pFrom = getScaledCoords(edge.from);
            const pTo = getScaledCoords(edge.to);

            // Active path checks
            const isToVisited = step.visitedNodeIds.includes(edge.to);
            const isToActive = step.activeNodeId === edge.to;
            const isToError = step.errorNodeId === edge.to;

            let edgeCls = styles.edgeLine;
            if (isToError) {
              // Leave default or red link
            } else if (isToActive || (isToVisited && step.activeNodeId !== null)) {
              edgeCls += ' ' + styles.edgeActive;
            }

            return (
              <line
                key={`edge-${idx}`}
                x1={pFrom.cx}
                y1={pFrom.cy}
                x2={pTo.cx}
                y2={pTo.cy}
                className={edgeCls}
              />
            );
          })}

          {/* Nodes */}
          {flatNodes.map(node => {
            const pos = getScaledCoords(node.id);
            const isRoot = node.id === 'root';

            const isActive = step.activeNodeId === node.id;
            const isVisited = step.visitedNodeIds.includes(node.id);
            const isError = step.errorNodeId === node.id;

            let nodeCls = styles.nodeCircle;
            if (isError) {
              nodeCls += ' ' + styles.nodeError;
            } else if (isActive) {
              nodeCls += ' ' + styles.nodeActive;
            } else if (isVisited) {
              nodeCls += ' ' + styles.nodeVisited;
            }

            return (
              <g key={`node-${node.id}`}>
                {/* Outer circle */}
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={16}
                  fill="var(--bg-tertiary)"
                  stroke="var(--border)"
                  strokeWidth={2}
                  className={nodeCls}
                />

                {/* Display ROOT or character label */}
                <text x={pos.cx} y={pos.cy + 4} className={styles.nodeText} style={isRoot ? { fontSize: '7px' } : undefined}>
                  {isRoot ? 'ROOT' : node.char.toUpperCase()}
                </text>

                {/* Word indicator dot if isWord === true */}
                {node.isWord && !isRoot && (
                  <circle
                    cx={pos.cx + 10}
                    cy={pos.cy - 10}
                    r={3.5}
                    className={styles.wordDot}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }} />
            <span>Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }} />
            <span>Word-End</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent)' }} />
            <span>Active Path</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red-bg)', border: '1px solid var(--red)' }} />
            <span>Failed State</span>
          </div>
        </div>
      </div>

      {/* Traversal trace details */}
      <div className={styles.split}>
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Step Trace ({stepIdx + 1} / {steps.length})</div>
          <div className={styles.infoMessage} dangerouslySetInnerHTML={{ __html: step.message }} />
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Trie Words ({wordsList.length})</div>
          <div className={styles.wordsList}>
            {wordsList.map((word, idx) => (
              <span key={`word-${idx}`} className={styles.wordBadge}>
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className={styles.controls}>
        <button className={styles.btn} onClick={() => { stop(); setStepIdx(0); }}>⏮</button>
        <button className={styles.btn} onClick={() => { stop(); setStepIdx(i => Math.max(0, i - 1)); }}>◀</button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => {
            if (playing) {
              stop();
            } else {
              if (stepIdx >= steps.length - 1) setStepIdx(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className={styles.btn} onClick={() => { stop(); setStepIdx(i => Math.min(steps.length - 1, i + 1)); }}>▶</button>

        {/* Speed slider */}
        <div className={styles.speedWrap}>
          <span>Fast</span>
          <input
            type="range"
            min={100}
            max={1500}
            step={100}
            value={1600 - speed}
            onChange={e => setSpeed(1600 - Number(e.target.value))}
            className={styles.slider}
          />
          <span>Slow</span>
        </div>
      </div>

      {/* Operations Input Form Panel */}
      <div className={styles.configCard}>
        <div className={styles.configTitle}>🎮 Perform Operations</div>
        <div className={styles.configRow}>
          <input
            type="text"
            value={inputWord}
            onChange={e => setInputWord(e.target.value)}
            className={styles.configInput}
            placeholder="Enter word (a-z, max 8 chars)"
            maxLength={8}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleInsert}>
            ➕ Insert
          </button>
          <button className={styles.btn} onClick={handleSearch}>
            🔍 Search
          </button>
          <button className={styles.btn} onClick={handleStartsWith}>
            🚩 Starts With
          </button>
        </div>
      </div>
    </div>
  );
}
