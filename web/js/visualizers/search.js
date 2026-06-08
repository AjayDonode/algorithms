/* search.js — Animated cell visualizer for Linear Search and Binary Search */

const SearchVisualizer = (() => {

  let steps = [];
  let stepIndex = 0;
  let playing = false;
  let speedMs = 600;
  let timer = null;
  let container = null;
  let infoEl = null;

  function addStep(state, message) {
    steps.push({ state: { ...state, cells: [...(state.cells || [])] }, message });
  }

  // Linear Search steps
  function linearSearchSteps(arr, target) {
    let cells = arr.map(() => 'default');
    for (let i = 0; i < arr.length; i++) {
      cells = arr.map((_, j) => j < i ? 'eliminated' : j === i ? 'active' : 'default');
      addStep({ arr, cells, target }, `Checking index ${i}: <b>${arr[i]}</b> ${arr[i] === target ? '== target ✓' : '≠ target'}`);
      if (arr[i] === target) {
        cells = arr.map((_, j) => j === i ? 'found' : j < i ? 'eliminated' : 'default');
        addStep({ arr, cells, target }, `🎉 Found <b>${target}</b> at index <b>${i}</b>!`);
        return;
      }
    }
    cells = arr.map(() => 'eliminated');
    addStep({ arr, cells, target }, `❌ <b>${target}</b> not found in the array`);
  }

  // Binary Search steps
  function binarySearchSteps(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);
      const cells = arr.map((_, i) => {
        if (i < low || i > high) return 'eliminated';
        if (i === mid) return 'active';
        return 'range';
      });
      addStep({ arr, cells, target, low, mid, high },
        `Search window [${low}..${high}], mid=${mid}: checking <b>${arr[mid]}</b>`);

      if (arr[mid] === target) {
        const found = arr.map((_, i) => i === mid ? 'found' : (i < low || i > high ? 'eliminated' : 'range'));
        addStep({ arr, cells: found, target }, `🎉 Found <b>${target}</b> at index <b>${mid}</b>!`);
        return;
      } else if (arr[mid] < target) {
        addStep({ arr, cells, target },
          `<b>${arr[mid]}</b> < <b>${target}</b> → eliminate left half, new low = ${mid + 1}`);
        low = mid + 1;
      } else {
        addStep({ arr, cells, target },
          `<b>${arr[mid]}</b> > <b>${target}</b> → eliminate right half, new high = ${mid - 1}`);
        high = mid - 1;
      }
    }
    const cells = arr.map(() => 'eliminated');
    addStep({ arr, cells, target }, `❌ <b>${target}</b> not found — search space exhausted`);
  }

  function renderStep(idx) {
    if (!container || idx >= steps.length) return;
    const { state, message } = steps[idx];
    const { arr, cells } = state;

    container.innerHTML = `<div class="search-cells">` +
      arr.map((v, i) => `
        <div class="search-cell ${cells[i]}" title="Index: ${i}">
          ${v}
          <span class="cell-index">${i}</span>
        </div>`).join('') +
      `</div>`;

    if (infoEl) infoEl.innerHTML = `<b>Step ${idx + 1}/${steps.length}:</b> ${message}`;
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
  function stepBack()    { pause(); if (stepIndex > 0) { stepIndex--; renderStep(stepIndex); } }
  function stepForward() { pause(); if (stepIndex < steps.length - 1) { stepIndex++; renderStep(stepIndex); } }

  function mount(algo, canvasEl, infoElement, inputData) {
    container = canvasEl;
    infoEl = infoElement;
    steps = [];
    stepIndex = 0;

    const arr    = inputData || algo.defaultData;
    const target = algo.defaultTarget || arr[Math.floor(arr.length / 2)];

    if (algo.id === 'binary-search') binarySearchSteps(arr, target);
    else                              linearSearchSteps(arr, target);

    renderStep(0);

    return {
      play, pause, stepBack, stepForward,
      reset: (d, t) => {
        pause(); steps = []; stepIndex = 0;
        const tar = t !== undefined ? t : algo.defaultTarget;
        if (algo.id === 'binary-search') binarySearchSteps(d || arr, tar);
        else                              linearSearchSteps(d || arr, tar);
        renderStep(0);
      },
      setSpeed: (ms) => { speedMs = ms; },
      getStepCount: () => steps.length,
    };
  }

  return { mount };
})();
