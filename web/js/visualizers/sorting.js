/* sorting.js — Animated bar-chart visualizer for Bubble, Selection, Merge, Quick Sort */

const SortingVisualizer = (() => {

  let steps = [];
  let stepIndex = 0;
  let playing = false;
  let speedMs = 400;
  let timer = null;
  let container = null;
  let infoEl = null;

  // ── Generate all animation steps for the chosen algorithm ──────────────────
  function generateSteps(data, algoId) {
    const arr = [...data];
    steps = [];
    if (algoId === 'bubble-sort')    bubbleSortSteps(arr);
    else if (algoId === 'selection-sort') selectionSortSteps(arr);
    else if (algoId === 'merge-sort')    mergeSortSteps(arr, 0, arr.length - 1);
    else if (algoId === 'quick-sort')    quickSortSteps(arr, 0, arr.length - 1);
    return steps;
  }

  function addStep(arr, highlights, message) {
    steps.push({ arr: [...arr], highlights: { ...highlights }, message });
  }

  // Bubble Sort
  function bubbleSortSteps(arr) {
    const n = arr.length;
    const sorted = new Set();
    for (let i = 0; i < n - 1; i++) {
      for (let j = 1; j < n - i; j++) {
        addStep(arr, { compare: [j-1, j] }, `Comparing <b>${arr[j-1]}</b> and <b>${arr[j]}</b>`);
        if (arr[j-1] > arr[j]) {
          [arr[j-1], arr[j]] = [arr[j], arr[j-1]];
          addStep(arr, { swap: [j-1, j] }, `Swapping <b>${arr[j-1]}</b> ↔ <b>${arr[j]}</b>`);
        }
      }
      sorted.add(n - 1 - i);
      addStep(arr, { sorted: [...sorted] }, `Pass ${i+1} complete — <b>${arr[n-1-i]}</b> is in its final position ✓`);
    }
    sorted.add(0);
    addStep(arr, { sorted: [...sorted] }, '🎉 Array is fully sorted!');
  }

  // Selection Sort
  function selectionSortSteps(arr) {
    const n = arr.length;
    const sorted = new Set();
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        addStep(arr, { compare: [minIdx, j], sorted: [...sorted] }, `Scanning for minimum in unsorted section — comparing <b>${arr[minIdx]}</b> with <b>${arr[j]}</b>`);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          addStep(arr, { compare: [minIdx, j], sorted: [...sorted] }, `New minimum found: <b>${arr[minIdx]}</b> at index ${minIdx}`);
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        addStep(arr, { swap: [i, minIdx], sorted: [...sorted] }, `Swapping minimum <b>${arr[i]}</b> to position ${i}`);
      }
      sorted.add(i);
      addStep(arr, { sorted: [...sorted] }, `Position ${i} filled with <b>${arr[i]}</b> ✓`);
    }
    sorted.add(n - 1);
    addStep(arr, { sorted: [...sorted] }, '🎉 Array is fully sorted!');
  }

  // Merge Sort
  function mergeSortSteps(arr, l, r) {
    if (l >= r) return;
    const mid = Math.floor((l + r) / 2);
    mergeSortSteps(arr, l, mid);
    mergeSortSteps(arr, mid + 1, r);
    mergeSteps(arr, l, mid, r);
  }

  function mergeSteps(arr, l, m, r) {
    const left  = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    addStep(arr, { compare: Array.from({length: r-l+1}, (_,x)=>l+x) },
      `Merging sub-arrays [${left}] and [${right}]`);
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        arr[k++] = left[i++];
      } else {
        arr[k++] = right[j++];
      }
      addStep(arr, { swap: [k-1] }, `Placed <b>${arr[k-1]}</b> into merged array`);
    }
    while (i < left.length) { arr[k++] = left[i++]; addStep(arr, { swap: [k-1] }, `Copying remaining: <b>${arr[k-1]}</b>`); }
    while (j < right.length) { arr[k++] = right[j++]; addStep(arr, { swap: [k-1] }, `Copying remaining: <b>${arr[k-1]}</b>`); }
  }

  // Quick Sort
  function quickSortSteps(arr, low, high) {
    if (low < high) {
      const pi = partitionSteps(arr, low, high);
      quickSortSteps(arr, low, pi - 1);
      quickSortSteps(arr, pi + 1, high);
    }
  }

  function partitionSteps(arr, low, high) {
    const pivot = arr[high];
    addStep(arr, { pivot: [high] }, `Pivot selected: <b>${pivot}</b> (index ${high})`);
    let i = low - 1;
    for (let j = low; j < high; j++) {
      addStep(arr, { compare: [j, high], pivot: [high] }, `Comparing <b>${arr[j]}</b> with pivot <b>${pivot}</b>`);
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (i !== j) addStep(arr, { swap: [i, j], pivot: [high] }, `<b>${arr[i]}</b> ≤ pivot — swapping to left partition`);
      }
    }
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    addStep(arr, { sorted: [i+1] }, `Pivot <b>${arr[i+1]}</b> placed in final position ${i+1} ✓`);
    return i + 1;
  }

  // ── Render a single step ───────────────────────────────────────────────────
  function renderStep(idx) {
    if (!container || idx >= steps.length) return;
    const step = steps[idx];
    const { arr, highlights, message } = step;
    const maxVal = Math.max(...arr);
    const barWidth = Math.max(20, Math.floor((container.offsetWidth - 40) / arr.length) - 4);
    const maxBarH  = 220;

    container.innerHTML = arr.map((v, i) => {
      let cls = 'bar-default';
      if (highlights.sorted && highlights.sorted.includes(i)) cls = 'bar-sorted';
      if (highlights.compare && highlights.compare.includes(i)) cls = 'bar-compare';
      if (highlights.swap && highlights.swap.includes(i)) cls = 'bar-swap';
      if (highlights.pivot && highlights.pivot.includes(i)) cls = 'bar-pivot';
      const h = Math.max(12, Math.round((v / maxVal) * maxBarH));
      return `<div class="sort-bar ${cls}" style="width:${barWidth}px;height:${h}px" title="${v}">
                <span class="sort-bar-label">${v}</span>
              </div>`;
    }).join('');

    if (infoEl) infoEl.innerHTML = `<b>Step ${idx + 1}/${steps.length}:</b> ${message}`;
  }

  // ── Playback controls ──────────────────────────────────────────────────────
  function play() {
    if (stepIndex >= steps.length - 1) { stepIndex = 0; }
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
  function stepBack() { pause(); if (stepIndex > 0) { stepIndex--; renderStep(stepIndex); } }
  function stepForward() { pause(); if (stepIndex < steps.length - 1) { stepIndex++; renderStep(stepIndex); } }
  function reset(data, algoId) {
    pause(); stepIndex = 0;
    generateSteps(data, algoId);
    renderStep(0);
  }

  // ── Mount ──────────────────────────────────────────────────────────────────
  function mount(algo, canvasEl, infoElement, inputData) {
    container = canvasEl;
    infoEl = infoElement;
    const data = inputData || algo.defaultData;
    generateSteps(data, algo.id);
    stepIndex = 0;
    renderStep(0);

    return {
      play, pause, stepBack, stepForward,
      reset: (d) => reset(d, algo.id),
      setSpeed: (ms) => { speedMs = ms; },
      getStepCount: () => steps.length,
    };
  }

  return { mount };
})();
