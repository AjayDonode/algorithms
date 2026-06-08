/* graph.js — SVG node/edge visualizer for Dijkstra and BFS */

const GraphVisualizer = (() => {

  let steps = [];
  let stepIndex = 0;
  let playing = false;
  let speedMs = 800;
  let timer = null;
  let container = null;
  let infoEl = null;

  // ── Sample graph (same as ShortestPath.java example) ──────────────────────
  const SAMPLE_GRAPH = {
    nodes: [
      { id: 0, label: '0', x: 0.15, y: 0.5  },
      { id: 1, label: '1', x: 0.85, y: 0.15 },
      { id: 2, label: '2', x: 0.55, y: 0.5  },
      { id: 3, label: '3', x: 0.40, y: 0.82 },
      { id: 4, label: '4', x: 0.72, y: 0.80 },
    ],
    edges: [
      { from: 0, to: 1, w: 9 },
      { from: 0, to: 2, w: 6 },
      { from: 0, to: 3, w: 5 },
      { from: 0, to: 4, w: 3 },
      { from: 2, to: 1, w: 2 },
      { from: 2, to: 3, w: 4 },
    ],
  };

  function dijkstraSteps(graph) {
    const INF = Infinity;
    const n = graph.nodes.length;
    const dist = Array(n).fill(INF);
    const visited = new Set();
    dist[0] = 0;
    const heap = [[0, 0]]; // [dist, node]
    steps = [];

    steps.push({
      dist: [...dist], visited: new Set(), current: null, relaxed: null,
      message: 'Initialize: all distances = ∞, source (0) = 0. Add source to min-heap.'
    });

    while (heap.length > 0) {
      heap.sort((a, b) => a[0] - b[0]);
      const [d, u] = heap.shift();
      if (visited.has(u)) {
        steps.push({ dist: [...dist], visited: new Set(visited), current: u, relaxed: null,
          message: `Node <b>${u}</b> already visited (stale heap entry) — skip` });
        continue;
      }
      visited.add(u);
      steps.push({ dist: [...dist], visited: new Set(visited), current: u, relaxed: null,
        message: `Poll node <b>${u}</b> (dist=${d}) — it's the nearest unvisited node` });

      for (const e of graph.edges.filter(e => e.from === u)) {
        const newDist = dist[u] + e.w;
        steps.push({ dist: [...dist], visited: new Set(visited), current: u, relaxed: [e.from, e.to],
          message: `Relax edge ${e.from}→${e.to} (weight=${e.w}): ${dist[u]} + ${e.w} = ${newDist} ${newDist < dist[e.to] ? `< ${dist[e.to] === INF ? '∞' : dist[e.to]} → UPDATE ✓` : `≥ ${dist[e.to] === INF ? '∞' : dist[e.to]} → no update`}` });
        if (newDist < dist[e.to]) {
          dist[e.to] = newDist;
          heap.push([newDist, e.to]);
        }
      }
    }
    steps.push({ dist: [...dist], visited: new Set(visited), current: null, relaxed: null,
      message: `🎉 Done! Shortest distances from node 0: [${dist.map((d,i) => `${i}:${d}`).join(', ')}]` });
  }

  function renderStep(idx) {
    if (!container || idx >= steps.length) return;
    const step = steps[idx];
    const { nodes, edges } = SAMPLE_GRAPH;
    const W = Math.max(500, container.offsetWidth || 600);
    const H = 320;

    function px(node) { return node.x * (W - 60) + 30; }
    function py(node) { return node.y * (H - 60) + 30; }

    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4a5a7a"/>
        </marker>
        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b"/>
        </marker>
      </defs>`;

    // Draw edges
    for (const e of edges) {
      const from = nodes[e.from];
      const to   = nodes[e.to];
      const isRelaxed = step.relaxed && step.relaxed[0] === e.from && step.relaxed[1] === e.to;
      const strokeColor = isRelaxed ? '#f59e0b' : '#243558';
      const strokeW     = isRelaxed ? 3 : 1.5;

      // Shorten edge to avoid overlapping with node circles
      const dx = px(to) - px(from);
      const dy = py(to) - py(from);
      const len = Math.sqrt(dx*dx + dy*dy);
      const R = 22;
      const x1 = px(from) + (dx/len)*R;
      const y1 = py(from) + (dy/len)*R;
      const x2 = px(to)   - (dx/len)*R;
      const y2 = py(to)   - (dy/len)*R;

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="${strokeColor}" stroke-width="${strokeW}"
        marker-end="url(#${isRelaxed ? 'arrowhead-active' : 'arrowhead'})"
      />`;

      // Weight label
      const mx = (px(from) + px(to)) / 2;
      const my = (py(from) + py(to)) / 2;
      svg += `<rect x="${mx-10}" y="${my-10}" width="20" height="16" rx="4"
        fill="${isRelaxed ? 'rgba(245,158,11,0.2)' : 'var(--bg-surface)'}" />`;
      svg += `<text x="${mx}" y="${my+2}" text-anchor="middle" font-size="11"
        fill="${isRelaxed ? '#f59e0b' : '#4a5a7a'}" font-family="JetBrains Mono,monospace">${e.w}</text>`;
    }

    // Draw nodes
    for (const n of nodes) {
      const isVisited = step.visited.has(n.id);
      const isCurrent = n.id === step.current;
      const dist = step.dist[n.id];

      let fill = '#1e2d4a';
      let stroke = '#243558';
      let glow = 'none';
      if (isVisited) { fill = '#065f46'; stroke = '#10b981'; }
      if (isCurrent) { fill = '#3730a3'; stroke = '#818cf8'; glow = 'drop-shadow(0 0 8px rgba(99,102,241,0.8))'; }

      svg += `<circle cx="${px(n)}" cy="${py(n)}" r="22"
        fill="${fill}" stroke="${stroke}" stroke-width="2.5"
        style="filter:${glow}"
      />`;
      svg += `<text x="${px(n)}" y="${py(n)+5}" text-anchor="middle" font-size="13"
        fill="white" font-family="JetBrains Mono,monospace" font-weight="700">${n.label}</text>`;

      // Distance badge
      const distLabel = dist === Infinity ? '∞' : dist;
      svg += `<rect x="${px(n)-14}" y="${py(n)-38}" width="28" height="16" rx="8"
        fill="${isVisited ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}" />`;
      svg += `<text x="${px(n)}" y="${py(n)-27}" text-anchor="middle" font-size="10"
        fill="${isVisited ? '#10b981' : '#818cf8'}" font-family="JetBrains Mono,monospace" font-weight="700">${distLabel}</text>`;
    }

    svg += `</svg>`;
    container.innerHTML = svg;
    if (infoEl) infoEl.innerHTML = `<b>Step ${idx + 1}/${steps.length}:</b> ${step.message}`;
  }

  function play() {
    if (stepIndex >= steps.length - 1) stepIndex = 0;
    playing = true;
    function tick() {
      if (!playing || stepIndex >= steps.length - 1) { playing = false; return; }
      stepIndex++;
      renderStep(stepIndex);
      timer = setTimeout(tick, speedMs);
    }
    tick();
  }

  function pause() { playing = false; clearTimeout(timer); }

  function mount(algo, canvasEl, infoElement) {
    container = canvasEl;
    infoEl = infoElement;
    steps = [];
    stepIndex = 0;
    dijkstraSteps(SAMPLE_GRAPH);
    renderStep(0);

    return {
      play, pause,
      stepBack:    () => { pause(); if (stepIndex > 0) { stepIndex--; renderStep(stepIndex); } },
      stepForward: () => { pause(); if (stepIndex < steps.length-1) { stepIndex++; renderStep(stepIndex); } },
      reset: () => { pause(); stepIndex = 0; renderStep(0); },
      setSpeed: (ms) => { speedMs = ms; },
      getStepCount: () => steps.length,
    };
  }

  return { mount };
})();
