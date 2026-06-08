/* tree.js — SVG binary tree visualizer for BST traversal, Invert, Trie */

const TreeVisualizer = (() => {

  let steps = [];
  let stepIndex = 0;
  let playing = false;
  let speedMs = 700;
  let timer = null;
  let container = null;
  let infoEl = null;

  // ── Build a sample BST from an array ──────────────────────────────────────
  function insertBST(root, val) {
    if (!root) return { val, left: null, right: null };
    if (val < root.val) root.left  = insertBST(root.left,  val);
    else                root.right = insertBST(root.right, val);
    return root;
  }

  function buildBST(arr) {
    let root = null;
    for (const v of arr) root = insertBST(root, v);
    return root;
  }

  // ── Traversal step generation ──────────────────────────────────────────────
  function inOrderSteps(node, visited) {
    if (!node) return;
    inOrderSteps(node.left, visited);
    visited.push(node.val);
    steps.push({ visited: [...visited], current: node.val,
      message: `Visit <b>${node.val}</b> (In-Order: Left → <b>Root</b> → Right)` });
    inOrderSteps(node.right, visited);
  }

  function preOrderSteps(node, visited) {
    if (!node) return;
    visited.push(node.val);
    steps.push({ visited: [...visited], current: node.val,
      message: `Visit <b>${node.val}</b> (Pre-Order: <b>Root</b> → Left → Right)` });
    preOrderSteps(node.left, visited);
    preOrderSteps(node.right, visited);
  }

  function invertSteps(node, depth) {
    if (!node) return;
    steps.push({ visited: [], current: node.val, swapAt: node.val,
      message: `At node <b>${node.val}</b>: swap left ↔ right children` });
    const tmp = node.left;
    node.left = node.right;
    node.right = tmp;
    steps.push({ visited: [node.val], current: node.val, swapAt: null,
      message: `Node <b>${node.val}</b>: children swapped ✓` });
    invertSteps(node.left, depth + 1);
    invertSteps(node.right, depth + 1);
  }

  // ── Assign positions for SVG rendering (in-order x assignment) ────────────
  function assignPositions(node, depth, counter) {
    if (!node) return;
    assignPositions(node.left, depth + 1, counter);
    node._x = counter.x++;
    node._depth = depth;
    assignPositions(node.right, depth + 1, counter);
  }

  // ── Collect all nodes ──────────────────────────────────────────────────────
  function collectNodes(node, nodes = [], edges = []) {
    if (!node) return { nodes, edges };
    nodes.push(node);
    if (node.left) {
      edges.push({ from: node, to: node.left });
      collectNodes(node.left, nodes, edges);
    }
    if (node.right) {
      edges.push({ from: node, to: node.right });
      collectNodes(node.right, nodes, edges);
    }
    return { nodes, edges };
  }

  // ── Render the tree SVG ────────────────────────────────────────────────────
  function renderTree(root, step) {
    if (!container) return;
    const counter = { x: 0 };
    assignPositions(root, 0, counter);
    const { nodes, edges } = collectNodes(root);
    const totalNodes = nodes.length;

    const W = Math.max(400, container.offsetWidth || 600);
    const H = 280;
    const nodeR = 22;
    const levelH = 60;
    const xScale = W / (totalNodes + 1);

    function cx(node) { return (node._x + 1) * xScale; }
    function cy(node) { return 40 + node._depth * levelH; }

    const visited  = step ? step.visited  || [] : [];
    const current  = step ? step.current  : null;
    const swapAt   = step ? step.swapAt   : null;

    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

    // Draw edges first
    for (const e of edges) {
      svg += `<line class="tree-edge"
        x1="${cx(e.from)}" y1="${cy(e.from)}"
        x2="${cx(e.to)}"   y2="${cy(e.to)}"
      />`;
    }

    // Draw nodes
    for (const n of nodes) {
      const isVisited = visited.includes(n.val);
      const isCurrent = n.val === current;
      const isSwap    = n.val === swapAt;

      let fill = '#1e2d4a';
      let stroke = '#243558';
      if (isVisited) { fill = '#059669'; stroke = '#10b981'; }
      if (isCurrent) { fill = '#4f46e5'; stroke = '#818cf8'; }
      if (isSwap)    { fill = '#b45309'; stroke = '#f59e0b'; }

      svg += `<g class="tree-node">
        <circle cx="${cx(n)}" cy="${cy(n)}" r="${nodeR}"
          fill="${fill}" stroke="${stroke}" stroke-width="2.5"
          style="filter: drop-shadow(0 0 6px ${isCurrent ? 'rgba(99,102,241,0.7)' : 'transparent'})"
        />
        <text x="${cx(n)}" y="${cy(n) + 5}" text-anchor="middle">${n.val}</text>
      </g>`;
    }

    svg += `</svg>`;

    // Traversal order display
    if (visited.length > 0) {
      svg += `<div style="margin-top:10px;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-secondary)">
        Visit order: ${visited.map((v,i) => `<span style="color:${i===visited.length-1?'var(--accent-3)':'var(--text-primary)'}">${v}</span>`).join(' → ')}
      </div>`;
    }

    container.innerHTML = svg;
  }

  function renderStep(root, idx) {
    renderTree(root, steps[idx]);
    if (infoEl && steps[idx]) {
      infoEl.innerHTML = `<b>Step ${idx + 1}/${steps.length}:</b> ${steps[idx].message}`;
    }
  }

  function play(root) {
    if (stepIndex >= steps.length - 1) stepIndex = 0;
    playing = true;
    function tick() {
      if (!playing || stepIndex >= steps.length - 1) { playing = false; return; }
      stepIndex++;
      renderStep(root, stepIndex);
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

    // Build a sample tree
    const sampleData = [50, 30, 70, 20, 40, 60, 80];
    let root = buildBST(sampleData);

    if (algo.id === 'bst-traversal') {
      steps.push({ visited: [], current: null, message: 'Starting In-Order traversal (Left → Root → Right)...' });
      inOrderSteps(root, []);
    } else if (algo.id === 'invert-binary-tree') {
      steps.push({ visited: [], current: null, message: 'Starting tree inversion — swapping children at each node...' });
      invertSteps(root, 0);
      steps.push({ visited: sampleData, current: null, message: '🎉 Tree fully inverted — mirror image complete!' });
    } else if (algo.id === 'trie') {
      // Show a static trie visualization message
      container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:240px;flex-direction:column;gap:16px">
        <div style="font-size:2.5rem">🗂️</div>
        <div style="color:var(--text-secondary);text-align:center;max-width:360px;line-height:1.6">
          Trie stores words as paths.<br>
          <span style="color:var(--accent-3);font-family:var(--font-mono)">"cat" "car" "card"</span><br>
          share the path <span style="color:var(--accent-3);font-family:var(--font-mono)">c → a → r</span>
        </div>
      </div>`;
      if (infoEl) infoEl.innerHTML = 'Trie: each path root→leaf spells a stored word. Shared prefixes share nodes.';
      return { play: ()=>{}, pause: ()=>{}, stepBack: ()=>{}, stepForward: ()=>{}, reset: ()=>{}, setSpeed: ()=>{} };
    } else {
      steps.push({ visited: [], current: null, message: 'Starting Pre-Order traversal (Root → Left → Right)...' });
      preOrderSteps(root, []);
    }

    renderStep(root, 0);

    return {
      play: () => play(root),
      pause,
      stepBack:    () => { pause(); if (stepIndex > 0) { stepIndex--; renderStep(root, stepIndex); } },
      stepForward: () => { pause(); if (stepIndex < steps.length-1) { stepIndex++; renderStep(root, stepIndex); } },
      reset: () => { pause(); stepIndex = 0; renderStep(root, 0); },
      setSpeed: (ms) => { speedMs = ms; },
      getStepCount: () => steps.length,
    };
  }

  return { mount };
})();
