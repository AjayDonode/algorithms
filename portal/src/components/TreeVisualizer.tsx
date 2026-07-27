'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Algorithm } from '@/data/algorithms';
import styles from './TreeVisualizer.module.css';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface TreeStep {
  visited: number[];
  current: number | null;
  swapAt: number | null;
  message: string;
  treeSnapshot: TreeNode | null;
}

// ── Tree Helpers ──────────────────────────────────────────

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

function buildBST(arr: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const v of arr) root = insertBST(root, v);
  return root;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    val: node.val,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

// ── Traversals Step Generators ────────────────────────────

function generateInOrder(
  node: TreeNode | null,
  visited: number[],
  steps: TreeStep[],
  root: TreeNode | null
) {
  if (!node) return;
  generateInOrder(node.left, visited, steps, root);
  visited.push(node.val);
  steps.push({
    visited: [...visited],
    current: node.val,
    swapAt: null,
    message: `Visit Node <b>${node.val}</b>. (In-Order: Left → <b>Root</b> → Right)`,
    treeSnapshot: cloneTree(root),
  });
  generateInOrder(node.right, visited, steps, root);
}

function generatePreOrder(
  node: TreeNode | null,
  visited: number[],
  steps: TreeStep[],
  root: TreeNode | null
) {
  if (!node) return;
  visited.push(node.val);
  steps.push({
    visited: [...visited],
    current: node.val,
    swapAt: null,
    message: `Visit Node <b>${node.val}</b>. (Pre-Order: <b>Root</b> → Left → Right)`,
    treeSnapshot: cloneTree(root),
  });
  generatePreOrder(node.left, visited, steps, root);
  generatePreOrder(node.right, visited, steps, root);
}

function generatePostOrder(
  node: TreeNode | null,
  visited: number[],
  steps: TreeStep[],
  root: TreeNode | null
) {
  if (!node) return;
  generatePostOrder(node.left, visited, steps, root);
  generatePostOrder(node.right, visited, steps, root);
  visited.push(node.val);
  steps.push({
    visited: [...visited],
    current: node.val,
    swapAt: null,
    message: `Visit Node <b>${node.val}</b>. (Post-Order: Left → Right → <b>Root</b>)`,
    treeSnapshot: cloneTree(root),
  });
}

// ── Inversion Step Generator ──────────────────────────────

function generateInvert(
  node: TreeNode | null,
  steps: TreeStep[],
  rootCopy: TreeNode | null
) {
  if (!node) return;

  // Step 1: Arrive at node, highlight swap
  steps.push({
    visited: [],
    current: node.val,
    swapAt: node.val,
    message: `Visit Node <b>${node.val}</b>: Prepare to swap its left and right children.`,
    treeSnapshot: cloneTree(rootCopy),
  });

  // Perform swap in place in the copy
  function swapInCopy(root: TreeNode | null, targetVal: number) {
    if (!root) return;
    if (root.val === targetVal) {
      const temp = root.left;
      root.left = root.right;
      root.right = temp;
      return;
    }
    swapInCopy(root.left, targetVal);
    swapInCopy(root.right, targetVal);
  }
  swapInCopy(rootCopy, node.val);

  // Step 2: Swap completed
  steps.push({
    visited: [],
    current: node.val,
    swapAt: null,
    message: `Swapped left and right children of Node <b>${node.val}</b>. Now recurse to children.`,
    treeSnapshot: cloneTree(rootCopy),
  });

  // Store original children since they're swapped in rootCopy
  const originalLeft = node.left;
  const originalRight = node.right;

  generateInvert(originalLeft, steps, rootCopy);
  generateInvert(originalRight, steps, rootCopy);
}

// ── Main Component ────────────────────────────────────────

export function TreeVisualizer({ algo }: { algo: Algorithm }) {
  const isTraversal = algo.id === 'bst-traversal';
  const defaultData = [50, 30, 70, 20, 40, 60, 80];

  const [customArr, setCustomArr] = useState(defaultData.join(', '));
  const [treeData, setTreeData] = useState<number[]>(defaultData);
  const [traversalMode, setTraversalMode] = useState<'in-order' | 'pre-order' | 'post-order'>('in-order');
  const [speed, setSpeed] = useState(700);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [steps, setSteps] = useState<TreeStep[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate steps based on algorithm, tree data, and traversal mode
  const rebuildSteps = useCallback(() => {
    const root = buildBST(treeData);
    if (!root) return;

    const newSteps: TreeStep[] = [];

    if (isTraversal) {
      newSteps.push({
        visited: [],
        current: null,
        swapAt: null,
        message: `Starting ${traversalMode.toUpperCase()} traversal on Binary Search Tree...`,
        treeSnapshot: cloneTree(root),
      });

      if (traversalMode === 'in-order') {
        generateInOrder(root, [], newSteps, root);
      } else if (traversalMode === 'pre-order') {
        generatePreOrder(root, [], newSteps, root);
      } else {
        generatePostOrder(root, [], newSteps, root);
      }

      newSteps.push({
        visited: newSteps[newSteps.length - 1].visited,
        current: null,
        swapAt: null,
        message: `🎉 Traversal complete! Order: [${newSteps[newSteps.length - 1].visited.join(', ')}].`,
        treeSnapshot: cloneTree(root),
      });
    } else {
      // Invert Tree
      const rootCopy = cloneTree(root);
      newSteps.push({
        visited: [],
        current: null,
        swapAt: null,
        message: 'Starting Binary Tree inversion — swapping left and right subtrees recursively...',
        treeSnapshot: cloneTree(root),
      });

      generateInvert(root, newSteps, rootCopy);

      newSteps.push({
        visited: [],
        current: null,
        swapAt: null,
        message: '🎉 Mirror tree inversion complete! Hover elements or rerun to explore.',
        treeSnapshot: cloneTree(rootCopy),
      });
    }

    setSteps(newSteps);
    setStepIdx(0);
  }, [treeData, traversalMode, isTraversal]);

  // Sync rebuild on state change
  useEffect(() => {
    rebuildSteps();
  }, [rebuildSteps]);

  // Timer Tick
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

  const handleCustomRun = () => {
    stop();
    const arr = customArr
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(n => !isNaN(n) && n > 0 && n < 100);

    // Limit array size to be between 3 and 15
    const uniqueArr = Array.from(new Set(arr)).slice(0, 15);
    if (uniqueArr.length >= 3) {
      setTreeData(uniqueArr);
    }
  };

  const step = steps[stepIdx] ?? steps[0];
  if (!step) return null;

  // ── Compute positions dynamically ──────────────────────────

  const W = 600;
  const H = 280;
  const positions: Record<number, { x: number; y: number }> = {};

  function computeLayout(
    node: TreeNode | null,
    x: number,
    y: number,
    dx: number,
    positionsMap: Record<number, { x: number; y: number }>
  ) {
    if (!node) return;
    positionsMap[node.val] = { x, y };
    if (node.left) {
      computeLayout(node.left, x - dx, y + 60, dx * 0.5, positionsMap);
    }
    if (node.right) {
      computeLayout(node.right, x + dx, y + 60, dx * 0.5, positionsMap);
    }
  }

  // Generate nodes list and edges list from snapshot
  const nodesList: number[] = [];
  const edgesList: { from: number; to: number }[] = [];
  collectNodesAndEdges(step.treeSnapshot, nodesList, edgesList);

  function collectNodesAndEdges(
    node: TreeNode | null,
    nList: number[],
    eList: { from: number; to: number }[]
  ) {
    if (!node) return;
    nList.push(node.val);
    if (node.left) {
      eList.push({ from: node.val, to: node.left.val });
      collectNodesAndEdges(node.left, nList, eList);
    }
    if (node.right) {
      eList.push({ from: node.val, to: node.right.val });
      collectNodesAndEdges(node.right, nList, eList);
    }
  }

  // Run position assignment
  computeLayout(step.treeSnapshot, W / 2, 40, W / 4.2, positions);

  return (
    <div className={styles.wrap}>
      {/* Canvas */}
      <div className={styles.canvas}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
          {/* Edges rendered underneath */}
          {edgesList.map((e, idx) => {
            const pFrom = positions[e.from];
            const pTo = positions[e.to];
            if (!pFrom || !pTo) return null;

            // Highlight swapping edges if inversion is active
            const isSwapping = step.swapAt === e.from;

            return (
              <line
                key={`edge-${idx}`}
                x1={pFrom.x}
                y1={pFrom.y}
                x2={pTo.x}
                y2={pTo.y}
                className={`${styles.edgeLine} ${isSwapping ? styles.edgeHighlight : ''}`}
              />
            );
          })}

          {/* Nodes */}
          {nodesList.map(nodeVal => {
            const pos = positions[nodeVal];
            if (!pos) return null;

            const isCurrent = step.current === nodeVal;
            const isVisited = step.visited.includes(nodeVal);
            const isSwap = step.swapAt === nodeVal;

            let nodeCls = styles.nodeCircle;
            if (isSwap) {
              nodeCls += ' ' + styles.nodeSwap;
            } else if (isCurrent) {
              nodeCls += ' ' + styles.nodeActive;
            } else if (isVisited) {
              nodeCls += ' ' + styles.nodeVisited;
            }

            return (
              <g key={`node-${nodeVal}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  fill="var(--bg-tertiary)"
                  stroke="var(--border)"
                  strokeWidth={2.5}
                  className={nodeCls}
                />
                <text x={pos.x} y={pos.y + 5} className={styles.nodeText}>
                  {nodeVal}
                </text>
              </g>
            );
          })}
        </svg>

          {/* Traversal path display */}
          {isTraversal && step.visited.length > 0 && (
            <div className={styles.trailSection}>
              <div className={styles.trailTitle}>Visit trail:</div>
              <div className={styles.trailList}>
                {step.visited.map((val, idx) => (
                  <span key={`trail-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className={`${styles.trailNode} ${val === step.current ? styles.trailNodeActive : ''}`}>
                      {val}
                    </span>
                    {idx < step.visited.length - 1 && <span className={styles.arrowSep}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Info card */}
      <div className={styles.infoCard}>
        <div className={styles.infoTitle}>
          Step Trace ({stepIdx + 1} / {steps.length})
        </div>
        <div
          className={styles.infoMessage}
          dangerouslySetInnerHTML={{ __html: step.message }}
        />
      </div>

      {/* Play Controls bar */}
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

        {/* Traversal Selector for traversal pages */}
        {isTraversal && (
          <div className={styles.modeSelectGroup} style={{ marginLeft: 12 }}>
            <span className={styles.selectLabel}>Traversal:</span>
            <select
              value={traversalMode}
              onChange={e => {
                stop();
                setTraversalMode(e.target.value as any);
              }}
              className={styles.select}
            >
              <option value="in-order">In-Order</option>
              <option value="pre-order">Pre-Order</option>
              <option value="post-order">Post-Order</option>
            </select>
          </div>
        )}

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

      {/* Customizable Tree inputs */}
      <div className={styles.configCard}>
        <div className={styles.configTitle}>🎮 Build Your Own BST</div>
        <div className={styles.configRow}>
          <input
            type="text"
            value={customArr}
            onChange={e => setCustomArr(e.target.value)}
            className={styles.configInput}
            placeholder="Comma-separated integers e.g. 50, 30, 70, 20"
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCustomRun}>
            Build BST →
          </button>
        </div>
      </div>
    </div>
  );
}
