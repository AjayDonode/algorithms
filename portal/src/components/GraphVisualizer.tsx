'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Algorithm } from '@/data/algorithms';
import styles from './GraphVisualizer.module.css';

interface Edge {
  from: number;
  to: number;
  weight: number;
}

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface DijkstraStep {
  dist: Record<number, number>;
  prev: Record<number, number | null>;
  visited: number[];
  pq: { node: number; dist: number }[];
  current: number | null;
  relaxingEdge: { from: number; to: number; weight: number } | null;
  message: string;
}

const DEFAULT_NODES: Node[] = [
  { id: 0, label: '0', x: 80, y: 175 },
  { id: 1, label: '1', x: 220, y: 80 },
  { id: 2, label: '2', x: 220, y: 270 },
  { id: 3, label: '3', x: 380, y: 80 },
  { id: 4, label: '4', x: 380, y: 270 },
  { id: 5, label: '5', x: 520, y: 175 },
];

const DEFAULT_EDGES: Edge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 2 },
  { from: 2, to: 1, weight: 1 },
  { from: 1, to: 3, weight: 5 },
  { from: 2, to: 3, weight: 8 },
  { from: 2, to: 4, weight: 10 },
  { from: 3, to: 4, weight: 2 },
  { from: 3, to: 5, weight: 6 },
  { from: 4, to: 5, weight: 3 },
];

function generateDijkstraSteps(nodes: Node[], edges: Edge[], startNode: number): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const INF = Infinity;

  // Initialize
  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  nodes.forEach(n => {
    dist[n.id] = INF;
    prev[n.id] = null;
  });
  dist[startNode] = 0;

  const visited: number[] = [];
  const pq: { node: number; dist: number }[] = [{ node: startNode, dist: 0 }];

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: [...visited],
    pq: [...pq],
    current: null,
    relaxingEdge: null,
    message: `Initialize: Set distance to source Node <b>${startNode}</b> as 0, and all other nodes as ∞. Push source Node <b>${startNode}</b> (dist: 0) to priority queue.`,
  });

  while (pq.length > 0) {
    // Sort priority queue by distance (greedy step)
    pq.sort((a, b) => a.dist - b.dist);
    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: [...visited],
      pq: [...pq],
      current: null,
      relaxingEdge: null,
      message: `Sort priority queue by distance to identify nearest unvisited node. Active queue: [${pq.map(item => `Node ${item.node} (d:${item.dist})`).join(', ')}].`,
    });

    const currItem = pq.shift()!;
    const u = currItem.node;

    if (visited.includes(u)) {
      steps.push({
        dist: { ...dist },
        prev: { ...prev },
        visited: [...visited],
        pq: [...pq],
        current: u,
        relaxingEdge: null,
        message: `Poll Node <b>${u}</b> (dist: ${currItem.dist}) from queue. It has already been visited (stale heap entry) — skip.`,
      });
      continue;
    }

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: [...visited],
      pq: [...pq],
      current: u,
      relaxingEdge: null,
      message: `Poll Node <b>${u}</b> (dist: ${currItem.dist}) from queue. It is the closest unvisited node. Now checking all outgoing edges.`,
    });

    // Relax neighbors
    const outgoing = edges.filter(e => e.from === u);
    for (const edge of outgoing) {
      const v = edge.to;
      const w = edge.weight;

      steps.push({
        dist: { ...dist },
        prev: { ...prev },
        visited: [...visited],
        pq: [...pq],
        current: u,
        relaxingEdge: { from: u, to: v, weight: w },
        message: `Evaluate outgoing edge <b>${u} → ${v}</b> (weight: ${w}). Compare new path distance: <b>${dist[u]} + ${w} = ${dist[u] + w}</b> against current <b>dist[${v}] = ${dist[v] === INF ? '∞' : dist[v]}</b>.`,
      });

      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        const oldVal = dist[v];
        dist[v] = newDist;
        prev[v] = u;
        pq.push({ node: v, dist: newDist });

        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: [...visited],
          pq: [...pq],
          current: u,
          relaxingEdge: { from: u, to: v, weight: w },
          message: `Relax edge <b>${u} → ${v}</b>: new distance <b>${newDist}</b> < current <b>${oldVal === INF ? '∞' : oldVal}</b>. Update <b>dist[${v}] = ${newDist}</b>, set parent to <b>${u}</b>, and push to priority queue.`,
        });
      } else {
        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: [...visited],
          pq: [...pq],
          current: u,
          relaxingEdge: { from: u, to: v, weight: w },
          message: `Relax edge <b>${u} → ${v}</b>: new distance <b>${newDist}</b> is not shorter than current <b>${dist[v]}</b>. No update needed.`,
        });
      }
    }

    visited.push(u);
    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: [...visited],
      pq: [...pq],
      current: null,
      relaxingEdge: null,
      message: `Finalize Node <b>${u}</b>. Add to visited set. Its shortest path distance is permanently locked at <b>${dist[u]}</b>.`,
    });
  }

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: [...visited],
    pq: [],
    current: null,
    relaxingEdge: null,
    message: `🎉 Dijkstra's algorithm complete! The shortest paths from source Node <b>${startNode}</b> are finalized. Hover over any node to trace its shortest path back to the source.`,
  });

  return steps;
}

export function GraphVisualizer({ algo }: { algo: Algorithm }) {
  const [startNode, setStartNode] = useState(0);
  const [speed, setSpeed] = useState(600); // milliseconds step interval
  const [playing, setPlaying] = useState(false);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const [steps, setSteps] = useState<DijkstraStep[]>(() =>
    generateDijkstraSteps(DEFAULT_NODES, DEFAULT_EDGES, 0)
  );
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const startParam = params.get('start');
      if (startParam) {
        const val = parseInt(startParam, 10);
        if (!isNaN(val) && val >= 0 && val < DEFAULT_NODES.length) {
          setStartNode(val);
        }
      }
      const speedParam = params.get('speed');
      if (speedParam) {
        const val = parseInt(speedParam, 10);
        if (!isNaN(val) && val >= 1 && val <= 10) {
          // Map speed scale 1-10 to ms:
          // Level 1: 1500ms (slow)
          // Level 5: 700ms (medium)
          // Level 10: 100ms (fast)
          const ms = 1600 - val * 150;
          setSpeed(Math.max(100, ms));
        }
      }
    }
  }, []);

  // Stop running timer on change or unmount
  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Re-run step generation whenever edges or start node changes
  useEffect(() => {
    stop();
    const newSteps = generateDijkstraSteps(DEFAULT_NODES, edges, startNode);
    setSteps(newSteps);
    setStepIdx(0);
  }, [edges, startNode, stop]);

  // Main playing interval tick
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStepIdx(prevIdx => prevIdx + 1);
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, steps.length, speed]);

  const step = steps[stepIdx] ?? steps[0];

  // Helper function to reconstruct path using prev pointers
  const getReconstructedPath = useCallback((nodeId: number, prevMap: Record<number, number | null>): number[] => {
    const path: number[] = [];
    let curr: number | null = nodeId;
    const visitedSet = new Set<number>(); // safety check to prevent cycles

    while (curr !== null && !visitedSet.has(curr)) {
      path.push(curr);
      visitedSet.add(curr);
      if (curr === startNode) break;
      curr = prevMap[curr] ?? null;
    }

    if (path.length > 0 && path[path.length - 1] === startNode) {
      return path.reverse();
    }
    return [];
  }, [startNode]);

  // Determine path nodes and edges to highlight on hover
  const activePathNodes = hoveredNode !== null ? getReconstructedPath(hoveredNode, step.prev) : [];
  const isEdgeInPath = useCallback((from: number, to: number) => {
    if (activePathNodes.length < 2) return false;
    for (let i = 0; i < activePathNodes.length - 1; i++) {
      if (activePathNodes[i] === from && activePathNodes[i + 1] === to) {
        return true;
      }
    }
    return false;
  }, [activePathNodes]);

  // Handle single edge weight update
  const handleWeightChange = (from: number, to: number, weightStr: string) => {
    let weight = parseInt(weightStr, 10);
    if (isNaN(weight) || weight < 0) weight = 0;
    const newEdges = edges.map(e => (e.from === from && e.to === to ? { ...e, weight } : e));
    setEdges(newEdges);
  };

  // Node radius styling constants
  const R = 22;

  return (
    <div className={styles.wrap}>
      {/* Interactive SVG Canvas */}
      <div className={styles.canvas}>
        <svg viewBox="0 0 600 350" className={styles.svg}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--text-muted)" />
            </marker>
            <marker id="arrow-relaxing" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)" />
            </marker>
            <marker id="arrow-path" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--green)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((e, index) => {
            const fromNode = DEFAULT_NODES[e.from];
            const toNode = DEFAULT_NODES[e.to];
            const isRelaxing = step.relaxingEdge?.from === e.from && step.relaxingEdge?.to === e.to;
            const inPath = isEdgeInPath(e.from, e.to);

            // Compute shortened line endpoints to not overlap node boundary circles
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const x1 = fromNode.x + (dx / len) * (R + 3);
            const y1 = fromNode.y + (dy / len) * (R + 3);
            const x2 = toNode.x - (dx / len) * (R + 8);
            const y2 = toNode.y - (dy / len) * (R + 8);

            let strokeColor = 'var(--border)';
            let strokeWidth = 1.5;
            let markerId = 'arrow';

            if (inPath) {
              strokeColor = 'var(--green)';
              strokeWidth = 3.5;
              markerId = 'arrow-path';
            } else if (isRelaxing) {
              strokeColor = 'var(--accent)';
              strokeWidth = 3;
              markerId = 'arrow-relaxing';
            }

            // Text weight label coordinates
            const mx = (fromNode.x + toNode.x) / 2;
            const my = (fromNode.y + toNode.y) / 2;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={`url(#${markerId})`}
                  className={styles.edgeLine}
                />
                {/* Weight badge background */}
                <rect
                  x={mx - 12}
                  y={my - 10}
                  width={24}
                  height={18}
                  className={`${styles.edgeWeightBg} ${isRelaxing ? styles.weightRelaxingBg : ''}`}
                />
                {/* Weight badge text */}
                <text
                  x={mx}
                  y={my - 1}
                  className={`${styles.edgeWeightText} ${isRelaxing ? styles.weightRelaxingText : ''}`}
                >
                  {e.weight}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {DEFAULT_NODES.map(n => {
            const isCurrent = step.current === n.id;
            const isVisited = step.visited.includes(n.id);
            const isRelaxingTo = step.relaxingEdge?.to === n.id;
            const inPath = activePathNodes.includes(n.id);
            const distance = step.dist[n.id];

            let fillColor = 'var(--bg-tertiary)';
            let strokeColor = 'var(--border)';
            let filter = 'none';

            if (inPath) {
              fillColor = 'var(--green-bg)';
              strokeColor = 'var(--green)';
            } else if (isCurrent) {
              fillColor = 'rgba(175, 82, 222, 0.15)';
              strokeColor = '#af52de';
              filter = 'drop-shadow(0 0 6px rgba(175, 82, 222, 0.6))';
            } else if (isRelaxingTo) {
              fillColor = 'var(--accent-muted)';
              strokeColor = 'var(--accent)';
            } else if (isVisited) {
              fillColor = 'rgba(52, 199, 89, 0.08)';
              strokeColor = 'var(--green)';
            }

            return (
              <g
                key={`node-${n.id}`}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Circle */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={R}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  style={{ filter }}
                  className={styles.nodeCircle}
                />
                {/* Node Identifier */}
                <text x={n.x} y={n.y + 5} className={styles.nodeText}>
                  {n.label}
                </text>

                {/* Distance Badge above node */}
                <g transform={`translate(${n.x}, ${n.y - 38})`}>
                  <rect
                    x={-18}
                    y={-8}
                    width={36}
                    height={16}
                    className={styles.distBadgeBg}
                    fill={isVisited ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.12)'}
                  />
                  <text
                    y={3}
                    className={styles.distBadgeText}
                    fill={isVisited ? 'var(--green)' : 'var(--accent)'}
                  >
                    {distance === Infinity ? '∞' : distance}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }} />
            <span>Unvisited</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'rgba(175, 82, 222, 0.15)', border: '1px solid #af52de' }} />
            <span>Active / Pop</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)' }} />
            <span>Relaxing Edge</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'rgba(52, 199, 89, 0.08)', border: '1px solid var(--green)' }} />
            <span>Visited / Done</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'var(--green-bg)', border: '2px solid var(--green)' }} />
            <span>Shortest Path (Hover Node)</span>
          </div>
        </div>
      </div>

      {/* Tracing columns */}
      <div className={styles.split}>
        {/* Step Tracer Explanation */}
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>
            Step Trace ({stepIdx + 1} / {steps.length})
          </div>
          <div
            className={styles.infoMessage}
            dangerouslySetInnerHTML={{ __html: step.message }}
          />

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Priority Queue (Min-Heap dist order):
            </div>
            <div className={styles.pqList}>
              {step.pq.length === 0 ? (
                <span className={styles.pqEmpty}>Queue is empty</span>
              ) : (
                step.pq.map((item, index) => (
                  <span
                    key={`pq-${index}-${item.node}`}
                    className={`${styles.pqBadge} ${index === 0 ? styles.pqActiveBadge : ''}`}
                  >
                    Node <b>{item.node}</b> <span style={{ opacity: 0.7 }}>(d: {item.dist})</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Path Distances Table */}
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Shortest Path Table</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Distance</th>
                  <th>Parent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_NODES.map(n => {
                  const isCurrent = step.current === n.id;
                  const isVisited = step.visited.includes(n.id);
                  const distance = step.dist[n.id];
                  const parent = step.prev[n.id];

                  let rowCls = '';
                  let statusCls = styles.badgeUnvisited;
                  let statusText = 'Unvisited';

                  if (isCurrent) {
                    rowCls = styles.tableRowCurrent;
                    statusCls = styles.badgeCurrent;
                    statusText = 'Active';
                  } else if (isVisited) {
                    rowCls = styles.tableRowVisited;
                    statusCls = styles.badgeVisited;
                    statusText = 'Done';
                  }

                  return (
                    <tr key={`table-row-${n.id}`} className={rowCls}>
                      <td style={{ fontWeight: 600 }}>Node {n.id}</td>
                      <td>{distance === Infinity ? '∞' : distance}</td>
                      <td>{parent === null ? '-' : `Node ${parent}`}</td>
                      <td>
                        <span className={`${styles.badge} ${statusCls}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Control Buttons Panel */}
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

        {/* Start node selector dropdown */}
        <div className={styles.startSelectGroup} style={{ marginLeft: 12 }}>
          <span className={styles.selectLabel}>Start:</span>
          <select
            value={startNode}
            onChange={e => setStartNode(parseInt(e.target.value, 10))}
            className={styles.select}
          >
            {DEFAULT_NODES.map(n => (
              <option key={`opt-${n.id}`} value={n.id}>Node {n.id}</option>
            ))}
          </select>
        </div>

        {/* Speed Slider */}
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

      {/* Customizable Weights Form */}
      <div className={styles.configCard}>
        <div className={styles.configTitle}>⚙️ Customize Edge Weights</div>
        <div className={styles.configGrid}>
          {edges.map((e, index) => (
            <div key={`input-${index}`} className={styles.weightInputGroup}>
              <span className={styles.weightLabel}>Edge {e.from} → {e.to}</span>
              <input
                type="number"
                min={0}
                max={99}
                value={e.weight}
                onChange={ev => handleWeightChange(e.from, e.to, ev.target.value)}
                className={styles.weightInput}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
