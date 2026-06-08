/* app.js — AlgoVerse main application: routing, rendering, search, filters */

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
const State = {
  activeCategory: 'all',
  activeDifficulty: 'all',
  searchQuery: '',
  currentViz: null,
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function $(id) { return document.getElementById(id); }

function complexityClass(val) {
  if (!val) return '';
  if (val.includes('n²') || val.includes('n^2') || val.includes('n2')) return 'on2';
  if (val.includes('n log') || val.includes('nlogn') || val.includes('n√n')) return 'onlogn';
  if (val.includes('log'))  return 'ologn';
  if (val.includes('√n'))   return 'osqrtn';
  if (val.includes('V') || val.includes('E')) return 'velog';
  if (val.includes('2^'))   return 'on2';
  if (val === 'O(1)')       return 'o1';
  if (val.includes('O(n)')) return 'on';
  return 'on';
}

function filteredAlgorithms() {
  return ALGORITHMS.filter(a => {
    const catMatch  = State.activeCategory   === 'all' || a.category === State.activeCategory;
    const diffMatch = State.activeDifficulty === 'all' || a.difficulty === State.activeDifficulty;
    const q = State.searchQuery.toLowerCase().trim();
    const searchMatch = !q ||
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      (a.useCases || []).some(u => u.toLowerCase().includes(q));
    return catMatch && diffMatch && searchMatch;
  });
}

function getCategoryLabel(id) {
  return (CATEGORIES.find(c => c.id === id) || {}).label || id;
}
function getCategoryIcon(id) {
  return (CATEGORIES.find(c => c.id === id) || {}).icon || '📦';
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR BUILD
// ═══════════════════════════════════════════════════════════
function buildSidebar() {
  const nav = $('category-nav');
  if (!nav) return;
  nav.innerHTML = CATEGORIES.map(cat => {
    const count = cat.id === 'all'
      ? ALGORITHMS.length
      : ALGORITHMS.filter(a => a.category === cat.id).length;
    return `<li class="cat-item${State.activeCategory === cat.id ? ' active' : ''}"
              data-cat="${cat.id}" role="button" tabindex="0">
      <span class="cat-icon">${cat.icon}</span>
      <span>${cat.label}</span>
      <span class="cat-count">${count}</span>
    </li>`;
  }).join('');

  nav.querySelectorAll('.cat-item').forEach(el => {
    el.addEventListener('click', () => {
      State.activeCategory = el.dataset.cat;
      window.location.hash = State.activeCategory === 'all' ? '#/' : `#/category/${State.activeCategory}`;
    });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
  });
}

// ═══════════════════════════════════════════════════════════
// CARD RENDERER
// ═══════════════════════════════════════════════════════════
function renderCard(algo) {
  const avgClass = complexityClass(algo.complexity?.time?.avg || '');
  return `<div class="algo-card" data-id="${algo.id}" role="button" tabindex="0" id="card-${algo.id}">
    <div class="card-header">
      <div class="card-icon">${algo.icon || '📦'}</div>
      <span class="difficulty-badge ${algo.difficulty}">${algo.difficulty}</span>
    </div>
    <div class="card-name">${algo.name}</div>
    <div class="card-tagline">${algo.tagline}</div>
    <div class="card-footer">
      <div class="complexity-pill">
        <span class="cplx-label">avg</span>
        <span class="cplx-value ${avgClass}">${algo.complexity?.time?.avg || '—'}</span>
      </div>
      <span class="card-arrow">→</span>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════
function renderHome() {
  const main = $('main-content');
  const algos = filteredAlgorithms();
  const isFiltered = State.activeCategory !== 'all' || State.activeDifficulty !== 'all' || State.searchQuery;

  const heroHtml = isFiltered ? '' : `
    <div class="hero">
      <div class="hero-tag">⚡ 25 Algorithms · Interactive Visualizations</div>
      <h1>Learn Algorithms,<br><span class="gradient-text">Visually</span></h1>
      <p class="hero-sub">Step-by-step animations, plain-English explanations, and real Java source code from your own codebase.</p>
      <button class="hero-cta" id="hero-start-btn">🚀 Start Learning</button>
    </div>`;

  const categoryTabsHtml = `
    <div class="category-tabs" id="cat-tabs">
      ${CATEGORIES.map(c => `
        <button class="cat-tab${State.activeCategory === c.id ? ' active' : ''}" data-cat="${c.id}" id="tab-${c.id}">
          ${c.icon} ${c.label}
        </button>`).join('')}
    </div>`;

  const sectionTitle = isFiltered
    ? `<div class="section-heading"><h2>${getCategoryIcon(State.activeCategory)} ${getCategoryLabel(State.activeCategory)} Algorithms</h2><span class="count">${algos.length} found</span></div>`
    : `<div class="section-heading"><h2>All Algorithms</h2><span class="count">${algos.length}</span></div>`;

  const cardsHtml = algos.length > 0
    ? `<div class="cards-grid" id="cards-grid">${algos.map(renderCard).join('')}</div>`
    : `<div class="empty-state"><div class="emoji">🔍</div><h3>No algorithms match your filters</h3><p>Try adjusting the search or category.</p></div>`;

  main.innerHTML = heroHtml + categoryTabsHtml + sectionTitle + cardsHtml;

  // Attach card click handlers
  main.querySelectorAll('.algo-card').forEach(el => {
    el.addEventListener('click', () => navigate(`#/algorithm/${el.dataset.id}`));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
  });

  // Category tabs
  main.querySelectorAll('.cat-tab').forEach(el => {
    el.addEventListener('click', () => {
      State.activeCategory = el.dataset.cat;
      updateSidebarActive();
      renderHome();
    });
  });

  // Hero CTA
  const heroBtn = $('hero-start-btn');
  if (heroBtn) heroBtn.addEventListener('click', () => {
    main.querySelector('.cards-grid')?.scrollIntoView({ behavior: 'smooth' });
  });

  buildSidebar();
}

// ═══════════════════════════════════════════════════════════
// DETAIL VIEW
// ═══════════════════════════════════════════════════════════
function renderDetail(algoId) {
  const algo = ALGORITHMS.find(a => a.id === algoId);
  if (!algo) {
    $('main-content').innerHTML = `<div class="empty-state"><div class="emoji">😕</div><h3>Algorithm not found</h3></div>`;
    return;
  }

  const avgClass = complexityClass(algo.complexity?.time?.avg || '');

  const breadcrumb = `<div class="breadcrumb">
    <a href="#/">Home</a>
    <span class="sep">›</span>
    <a href="#/category/${algo.category}">${getCategoryIcon(algo.category)} ${getCategoryLabel(algo.category)}</a>
    <span class="sep">›</span>
    <span class="current">${algo.name}</span>
  </div>`;

  const header = `<div class="detail-header">
    <div class="detail-icon">${algo.icon || '📦'}</div>
    <div class="detail-meta">
      <h1>${algo.name}</h1>
      <p class="detail-tagline">${algo.tagline}</p>
      <div class="detail-badges">
        <span class="difficulty-badge ${algo.difficulty}">${algo.difficulty}</span>
        <span class="cplx-value ${avgClass}" style="padding:4px 12px;border-radius:99px;font-size:0.8rem">${algo.complexity?.time?.avg || ''}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);background:var(--bg-card);padding:4px 12px;border-radius:99px">Space: ${algo.complexity?.space || '—'}</span>
      </div>
    </div>
  </div>`;

  const tabs = `<div class="detail-tabs" id="detail-tabs">
    <button class="tab-btn active" data-tab="explain" id="tab-explain">📖 Explanation</button>
    <button class="tab-btn" data-tab="visualizer" id="tab-visualizer">🎬 Visualizer</button>
    <button class="tab-btn" data-tab="code" id="tab-code">💻 Code</button>
    <button class="tab-btn" data-tab="complexity" id="tab-complexity">📊 Complexity</button>
  </div>`;

  // Explanation panel
  const explanationPanel = `<div class="tab-panel active" id="panel-explain">
    <div class="explanation-body">
      ${algo.explanation.split('\n\n').map(p =>
        p.startsWith('**') ? `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>` :
        `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
      ).join('')}

      <div class="key-insight">
        <div class="key-insight-label">💡 Key Insight</div>
        <div class="key-insight-text">${algo.keyInsight}</div>
      </div>

      <h3>Step-by-Step</h3>
      <div class="steps-list">
        ${(algo.steps || []).map((s, i) => `
          <div class="step-item">
            <div class="step-num">${i+1}</div>
            <div class="step-text">${s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
          </div>`).join('')}
      </div>

      ${algo.useCases?.length ? `
        <h3>Real-World Use Cases</h3>
        <div class="use-cases">
          ${algo.useCases.map(u => `<span class="use-case-tag">✓ ${u}</span>`).join('')}
        </div>` : ''}
    </div>
  </div>`;

  // Visualizer panel
  const vizPanel = `<div class="tab-panel" id="panel-visualizer">
    <div class="viz-wrap">
      <div class="viz-canvas-area" id="viz-canvas"></div>
      <div class="viz-step-info" id="viz-info">Press ▶ Play to start the animation…</div>
      <div class="viz-controls" id="viz-controls">
        <button class="viz-btn" id="viz-reset">⏮ Reset</button>
        <button class="viz-btn" id="viz-back">◀ Step</button>
        <button class="viz-btn primary" id="viz-play">▶ Play</button>
        <button class="viz-btn" id="viz-fwd">Step ▶</button>
        <div class="viz-speed">
          🐇 <input type="range" id="viz-speed" min="100" max="1500" value="600" step="100"> 🐢
          <span id="viz-speed-label" style="font-size:0.7rem;min-width:36px">600ms</span>
        </div>
      </div>
    </div>

    ${['two-sum', 'linear-search', 'binary-search'].includes(algo.id) ? `
    <div class="try-it-section">
      <p class="try-it-label">🎮 Try It — Enter your own values</p>
      <div class="try-it-row">
        <input type="text" id="try-it-arr" class="try-it-input"
          placeholder="Array (comma-separated, e.g. 3, 7, 1, 5)"
          value="${(algo.defaultData || []).join(', ')}" />
        ${algo.defaultTarget !== undefined ? `<input type="number" id="try-it-target" class="try-it-input" style="max-width:120px" placeholder="Target" value="${algo.defaultTarget}" />` : ''}
        <button class="viz-btn primary" id="try-it-run">▶ Run</button>
      </div>
    </div>` : ''}
  </div>`;

  // Code panel
  const codePanel = `<div class="tab-panel" id="panel-code">
    <div class="code-panel">
      <div class="code-block-wrap">
        <div class="code-block-header">
          <span class="code-block-title">Pseudocode</span>
          <span class="code-lang-badge">pseudo</span>
        </div>
        <div class="code-block-body">
          <pre>${escHtml(algo.pseudocode || '')}</pre>
        </div>
      </div>
      <div class="code-block-wrap">
        <div class="code-block-header">
          <span class="code-block-title">Java Implementation</span>
          <span class="code-lang-badge">Java</span>
        </div>
        <div class="code-block-body">
          <pre>${highlightJava(algo.javaCode || '')}</pre>
        </div>
      </div>
    </div>
  </div>`;

  // Complexity panel
  const complexityPanel = buildComplexityPanel(algo);

  $('main-content').innerHTML = `<div class="detail-view">
    ${breadcrumb}
    ${header}
    ${tabs}
    ${explanationPanel}
    ${vizPanel}
    ${codePanel}
    ${complexityPanel}
  </div>`;

  // Wire tabs
  $('detail-tabs').querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('detail-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`panel-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'visualizer') initVisualizer(algo);
    });
  });

  // Initialize visualizer immediately so it's ready
  setTimeout(() => initVisualizer(algo), 100);
}

// ── Visualizer init & controls ─────────────────────────────
function initVisualizer(algo) {
  if (State.currentViz) { try { State.currentViz.pause(); } catch(e) {} }

  const canvas = $('viz-canvas');
  const info   = $('viz-info');
  if (!canvas) return;

  let viz;
  const vizType = algo.visualizer;

  if (vizType === 'sorting') {
    viz = SortingVisualizer.mount(algo, canvas, info);
  } else if (vizType === 'search') {
    viz = SearchVisualizer.mount(algo, canvas, info);
  } else if (vizType === 'tree') {
    viz = TreeVisualizer.mount(algo, canvas, info);
  } else if (vizType === 'graph') {
    viz = GraphVisualizer.mount(algo, canvas, info);
  } else {
    viz = ArrayVisualizer.mount(algo, canvas, info);
  }

  State.currentViz = viz;

  // Bind playback buttons
  const btn = (id, fn) => { const el = $(id); if (el) { el.onclick = fn; } };
  btn('viz-play',  () => {
    const playBtn = $('viz-play');
    if (!playBtn) return;
    if (playBtn.textContent.includes('▶')) {
      viz.play();
      playBtn.textContent = '⏸ Pause';
    } else {
      viz.pause();
      playBtn.textContent = '▶ Play';
    }
  });
  btn('viz-back',  () => { viz.stepBack(); });
  btn('viz-fwd',   () => { viz.stepForward(); });
  btn('viz-reset', () => {
    viz.reset();
    const playBtn = $('viz-play');
    if (playBtn) playBtn.textContent = '▶ Play';
  });

  const speedEl = $('viz-speed');
  const speedLabel = $('viz-speed-label');
  if (speedEl) {
    speedEl.addEventListener('input', () => {
      const ms = parseInt(speedEl.value);
      viz.setSpeed(ms);
      if (speedLabel) speedLabel.textContent = ms + 'ms';
    });
  }

  // Try-It
  const tryBtn = $('try-it-run');
  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      const arrInput    = $('try-it-arr');
      const targetInput = $('try-it-target');
      const arr = arrInput?.value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
      const target = targetInput ? parseInt(targetInput.value) : undefined;
      if (arr && arr.length > 1) {
        viz.reset(arr, target);
        const playBtn = $('viz-play');
        if (playBtn) playBtn.textContent = '▶ Play';
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════
// COMPLEXITY PANEL BUILDER
// ═══════════════════════════════════════════════════════════
function buildComplexityPanel(algo) {
  const { time, space } = algo.complexity || {};
  const colors = {
    best: '#10b981', avg: '#f59e0b', worst: '#ef4444', space: '#3b82f6'
  };

  const cards = [
    { label: 'Best Case',    val: time?.best,  color: colors.best  },
    { label: 'Average Case', val: time?.avg,   color: colors.avg   },
    { label: 'Worst Case',   val: time?.worst, color: colors.worst },
    { label: 'Space',        val: space,       color: colors.space },
  ].filter(c => c.val);

  const cardsHtml = cards.map(c => `
    <div class="cplx-card">
      <div class="cplx-card-label">${c.label}</div>
      <div class="cplx-card-value" style="color:${c.color}">${c.val}</div>
    </div>`).join('');

  const rowsHtml = (algo.complexityRows || []).map(row => `
    <tr>
      ${row.map((cell, i) => `<td>${cell}</td>`).join('')}
    </tr>`).join('');

  return `<div class="tab-panel" id="panel-complexity">
    <div class="complexity-grid">${cardsHtml}</div>
    ${rowsHtml ? `<div class="complexity-table-wrap">
      <table class="complexity-table">
        <thead><tr><th>Case / Operation</th><th>Complexity</th><th>Why</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>` : ''}
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTING (lightweight)
// ═══════════════════════════════════════════════════════════
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightJava(code) {
  let s = escHtml(code);

  // Comments
  s = s.replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');

  // String literals
  s = s.replace(/(&quot;[^&]*&quot;)/g, '<span class="st">$1</span>');

  // Keywords
  const kws = ['public','private','static','void','int','boolean','return','if','else','while',
                'for','new','class','null','true','false','this','final','break','continue',
                'import','package'];
  for (const kw of kws) {
    s = s.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="kw">$1</span>');
  }

  // Types
  const types = ['String','List','Map','Set','PriorityQueue','Queue','Arrays','Integer',
                 'HashMap','HashSet','LinkedList','ArrayList','TreeNode','ListNode','TrieNode'];
  for (const t of types) {
    s = s.replace(new RegExp(`\\b(${t})\\b`, 'g'), '<span class="ty">$1</span>');
  }

  // Numbers
  s = s.replace(/\b(\d+)\b/g, '<span class="nm">$1</span>');

  return s;
}

// ═══════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════
function initSearch() {
  const input = $('global-search');
  const results = $('search-results');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    State.searchQuery = q;
    if (!q) { results.hidden = true; return; }

    const matches = ALGORITHMS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) { results.hidden = true; return; }

    results.hidden = false;
    results.innerHTML = matches.map(a => `
      <div class="search-result-item" data-id="${a.id}" role="button" tabindex="0">
        <span>${a.icon || '📦'}</span>
        <div>
          <div class="search-result-name">${a.name}</div>
          <div class="search-result-cat">${getCategoryLabel(a.category)} · ${a.difficulty}</div>
        </div>
      </div>`).join('');

    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        results.hidden = true;
        input.value = '';
        State.searchQuery = '';
        navigate(`#/algorithm/${el.dataset.id}`);
      });
    });
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.hidden = true;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// DIFFICULTY FILTER
// ═══════════════════════════════════════════════════════════
function initDifficultyFilter() {
  const pills = document.querySelectorAll('#difficulty-filter .pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      State.activeDifficulty = p.dataset.diff;
      if (!window.location.hash.includes('/algorithm/')) renderHome();
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR ACTIVE STATE SYNC
// ═══════════════════════════════════════════════════════════
function updateSidebarActive() {
  document.querySelectorAll('.cat-item').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === State.activeCategory);
  });
}

// ═══════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════
function navigate(hash) {
  window.location.hash = hash;
}

function router() {
  const hash = window.location.hash || '#/';

  if (State.currentViz) { try { State.currentViz.pause(); } catch(e) {} }

  if (hash.startsWith('#/algorithm/')) {
    const id = hash.replace('#/algorithm/', '');
    renderDetail(id);
    $('sidebar').style.display = '';
  } else if (hash.startsWith('#/category/')) {
    const cat = hash.replace('#/category/', '');
    State.activeCategory = cat;
    updateSidebarActive();
    renderHome();
    $('sidebar').style.display = '';
  } else {
    State.activeCategory = 'all';
    updateSidebarActive();
    renderHome();
    $('sidebar').style.display = '';
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  initSearch();
  initDifficultyFilter();
  router();

  window.addEventListener('hashchange', router);

  // Modal close
  const overlay = $('modal-overlay');
  const closeBtn = $('modal-close');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) overlay.hidden = true; });
  if (closeBtn) closeBtn.addEventListener('click', () => { overlay.hidden = true; });
});
