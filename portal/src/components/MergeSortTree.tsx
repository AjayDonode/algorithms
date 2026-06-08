'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './MergeSortTree.module.css';

// ── Types ─────────────────────────────────────────────────────
interface TreeNode {
  id: string;
  arr: number[];
  left?: TreeNode;
  right?: TreeNode;
  depth: number;
  posX: number; // 0..1 relative horizontal position
  width: number; // 0..1 relative width of the subtree
  isMerged: boolean;
}

// ── Step type for animation ───────────────────────────────────
interface MergeStep {
  // Set of node IDs that are "merged" (green) at this step
  mergedIds: Set<string>;
  // The currently active node ID (being processed)
  activeId: string | null;
  // Status text
  message: string;
  // The arrays at each node (may be partially merged)
  nodeArrays: Record<string, number[]>;
}

// ── Build the static tree structure ──────────────────────────
function buildTree(arr: number[], depth = 0, posX = 0, width = 1, id = 'root'): TreeNode {
  if (arr.length <= 1) {
    return { id, arr, depth, posX, width, isMerged: false };
  }
  const mid = Math.floor(arr.length / 2);
  const left  = buildTree(arr.slice(0, mid), depth + 1, posX, width / 2, id + 'L');
  const right = buildTree(arr.slice(mid),     depth + 1, posX + width / 2, width / 2, id + 'R');
  return { id, arr, left, right, depth, posX, width, isMerged: false };
}

// ── Generate animation steps ──────────────────────────────────
function generateSteps(root: TreeNode): MergeStep[] {
  const steps: MergeStep[] = [];
  const mergedIds = new Set<string>();
  const nodeArrays: Record<string, number[]> = {};

  // Initialise all node arrays
  function initArrays(node: TreeNode) {
    nodeArrays[node.id] = [...node.arr];
    if (node.left)  initArrays(node.left);
    if (node.right) initArrays(node.right);
  }
  initArrays(root);

  function snap(activeId: string | null, message: string) {
    steps.push({
      mergedIds: new Set(mergedIds),
      activeId,
      message,
      nodeArrays: Object.fromEntries(Object.entries(nodeArrays).map(([k, v]) => [k, [...v]])),
    });
  }

  function process(node: TreeNode) {
    if (!node.left && !node.right) {
      // Leaf — single element, immediately sorted
      mergedIds.add(node.id);
      snap(node.id, `Base case: [${node.arr}] — single element, already sorted ✓`);
      return;
    }

    snap(node.id, `Split [${node.arr}] → left half [${node.left!.arr}] and right half [${node.right!.arr}]`);

    if (node.left)  process(node.left);
    if (node.right) process(node.right);

    // Merge step
    snap(node.id, `Merging [${nodeArrays[node.left!.id]}] + [${nodeArrays[node.right!.id]}]…`);

    // Simulate the merge
    const left  = [...nodeArrays[node.left!.id]];
    const right = [...nodeArrays[node.right!.id]];
    const merged: number[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) merged.push(left[i++]);
      else                      merged.push(right[j++]);
    }
    while (i < left.length)  merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);

    nodeArrays[node.id] = merged;
    mergedIds.add(node.id);
    snap(node.id, `Merged → [${merged}] ✓`);
  }

  snap(null, 'Merge Sort: recursively split the array in half, sort each half, then merge.');
  process(root);
  snap(null, `🎉 Array fully sorted: [${nodeArrays[root.id]}]`);
  return steps;
}

// ── Collect all nodes in order (BFS) ─────────────────────────
function collectNodes(root: TreeNode): TreeNode[] {
  const result: TreeNode[] = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    if (node.left)  queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

// ── Collect edges ─────────────────────────────────────────────
interface Edge { from: TreeNode; to: TreeNode }
function collectEdges(root: TreeNode): Edge[] {
  const edges: Edge[] = [];
  function walk(node: TreeNode) {
    if (node.left)  { edges.push({ from: node, to: node.left  }); walk(node.left);  }
    if (node.right) { edges.push({ from: node, to: node.right }); walk(node.right); }
  }
  walk(root);
  return edges;
}

// ── Compute node visual positions ─────────────────────────────
// Returns absolute {x, y} in SVG-coordinate space
function getNodePos(node: TreeNode, totalDepth: number, svgW: number, svgH: number) {
  const PADDING = 40;
  const usableW = svgW - PADDING * 2;
  const usableH = svgH - PADDING * 2;
  const x = PADDING + (node.posX + node.width / 2) * usableW;
  const y = PADDING + (node.depth / Math.max(totalDepth, 1)) * usableH;
  return { x, y };
}

// ── Node renderer ─────────────────────────────────────────────
function TreeNodeBox({
  node, step, totalDepth, svgW, svgH, boxW = 44, boxH = 28,
}: {
  node: TreeNode;
  step: MergeStep;
  totalDepth: number;
  svgW: number;
  svgH: number;
  boxW?: number;
  boxH?: number;
}) {
  const { x, y } = getNodePos(node, totalDepth, svgW, svgH);
  const arr       = step.nodeArrays[node.id] ?? node.arr;
  const isMerged  = step.mergedIds.has(node.id);
  const isActive  = step.activeId === node.id;
  const cellW     = Math.min(boxW, Math.max(22, Math.floor((boxW * Math.max(5, arr.length)) / Math.max(arr.length, 5))));
  const totalW    = cellW * arr.length + 4;
  const rx        = x - totalW / 2;
  const ry        = y - boxH / 2;

  const bg      = isMerged ? '#1a3a1a' : isActive ? '#2a2a1a' : '#1c1c1e';
  const border  = isMerged ? '#30d158' : isActive ? '#ffd60a' : '#3a3a3c';
  const textCol = isMerged ? '#30d158' : isActive ? '#ffd60a' : '#aeaeb2';

  return (
    <g>
      {/* Shadow */}
      <rect x={rx + 2} y={ry + 2} width={totalW} height={boxH} rx={6} fill="rgba(0,0,0,0.4)" />
      {/* Box */}
      <rect
        x={rx} y={ry} width={totalW} height={boxH} rx={6}
        fill={bg} stroke={border} strokeWidth={isActive ? 2 : 1.5}
        style={{ transition: 'fill 0.3s, stroke 0.3s' }}
      />
      {/* Pulse ring on active */}
      {isActive && (
        <rect
          x={rx - 3} y={ry - 3} width={totalW + 6} height={boxH + 6} rx={8}
          fill="none" stroke="#ffd60a" strokeWidth={1} opacity={0.4}
        />
      )}
      {/* Numbers */}
      {arr.map((v, i) => (
        <text
          key={i}
          x={rx + 2 + i * cellW + cellW / 2}
          y={ry + boxH / 2 + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          fill={textCol}
          style={{ transition: 'fill 0.3s' }}
        >
          {v}
        </text>
      ))}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────
export function MergeSortTree({ initialData }: { initialData: number[] }) {
  const [data, setData]           = useState(initialData);
  const [customInput, setCustomInput] = useState(initialData.join(', '));
  const [stepIdx, setStepIdx]     = useState(0);
  const [playing, setPlaying]     = useState(false);
  const [speed, setSpeed]         = useState(800);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const root  = buildTree(data);
  const steps = generateSteps(root);
  const nodes = collectNodes(root);
  const edges = collectEdges(root);
  const maxDepth = Math.max(...nodes.map(n => n.depth));

  const step = steps[Math.min(stepIdx, steps.length - 1)];

  // Dynamic SVG size based on array length and depth
  const svgW = Math.max(700, data.length * 90);
  const svgH = Math.max(300, (maxDepth + 1) * 90 + 60);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStepIdx(i => i + 1), speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stepIdx, steps.length, speed]);

  function applyCustom() {
    const arr = customInput.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
    if (arr.length >= 2 && arr.length <= 12) {
      stop();
      setData(arr);
      setStepIdx(0);
    }
  }

  function restart() { stop(); setStepIdx(0); }

  // Edge color: green if both endpoints are merged
  function edgeColor(edge: Edge): string {
    const fromMerged = step.mergedIds.has(edge.from.id);
    const toMerged   = step.mergedIds.has(edge.to.id);
    return (fromMerged && toMerged) ? '#30d158' : '#3a3a3c';
  }

  return (
    <div className={styles.wrap}>
      {/* SVG Tree */}
      <div className={styles.treeScroll}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className={styles.svg}
          style={{ minWidth: svgW }}
        >
          {/* Connector lines */}
          {edges.map((edge, i) => {
            const from = getNodePos(edge.from, maxDepth, svgW, svgH);
            const to   = getNodePos(edge.to,   maxDepth, svgW, svgH);
            const color = edgeColor(edge);
            // Curved connector using quadratic bezier
            const midY = (from.y + to.y) / 2;
            return (
              <path
                key={i}
                d={`M ${from.x} ${from.y + 14} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y - 14}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={step.mergedIds.has(edge.to.id) ? 'none' : '4 3'}
                opacity={0.7}
                style={{ transition: 'stroke 0.4s' }}
              />
            );
          })}

          {/* Node boxes */}
          {nodes.map(node => (
            <TreeNodeBox
              key={node.id}
              node={node}
              step={step}
              totalDepth={maxDepth}
              svgW={svgW}
              svgH={svgH}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#3a3a3c', border: '1.5px solid #636366' }} />
          Unsorted
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#2a2a1a', border: '1.5px solid #ffd60a' }} />
          Active
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#1a3a1a', border: '1.5px solid #30d158' }} />
          Sorted / Merged
        </span>
        <span className={styles.legendItem} style={{ marginLeft: 'auto', color: '#48484a', fontSize: '0.7rem' }}>
          Step {stepIdx + 1} / {steps.length}
        </span>
      </div>

      {/* Step message */}
      <div
        className={styles.message}
        dangerouslySetInnerHTML={{ __html: step.message }}
      />

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.btn} onClick={restart} title="Restart">⏮</button>
        <button className={styles.btn} onClick={() => { stop(); setStepIdx(i => Math.max(0, i - 1)); }}>◀</button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => {
            if (playing) { stop(); }
            else { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(true); }
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className={styles.btn} onClick={() => { stop(); setStepIdx(i => Math.min(steps.length - 1, i + 1)); }}>▶</button>

        <div className={styles.speedWrap}>
          <span>Fast</span>
          <input
            type="range" min={100} max={2000} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className={styles.slider}
          />
          <span>Slow</span>
        </div>
      </div>

      {/* Custom input */}
      <div className={styles.tryIt}>
        <span className={styles.tryLabel}>🎮 Try your own array</span>
        <div className={styles.tryRow}>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            className={styles.tryInput}
            placeholder="e.g. 5, 3, 8, 1, 9, 2 (2–12 numbers)"
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={applyCustom}>
            Run →
          </button>
        </div>
        <p className={styles.tryHint}>Max 12 numbers for a clear tree. Tip: use 6–8 numbers.</p>
      </div>
    </div>
  );
}
