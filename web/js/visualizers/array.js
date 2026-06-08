/* array.js — Array slot + pointer visualizer for Two Sum, Dutch Flag, TwoSum, Palindrome, etc. */

const ArrayVisualizer = (() => {

  let steps = [];
  let stepIndex = 0;
  let playing = false;
  let speedMs = 700;
  let timer = null;
  let container = null;
  let infoEl = null;

  // ── Two Sum (Hash Map approach) ────────────────────────────────────────────
  function twoSumSteps(arr, target) {
    const map = {};
    steps = [];
    steps.push({ arr, boxes: arr.map(() => 'default'), ptrs: {}, map: {},
      message: `Looking for two numbers that sum to <b>${target}</b>. Hash map approach — one pass.` });

    for (let i = 0; i < arr.length; i++) {
      const complement = target - arr[i];
      steps.push({ arr, boxes: arr.map((_, j) => j === i ? 'left' : 'default'), ptrs: { i },
        map: { ...map },
        message: `Index ${i}: value=<b>${arr[i]}</b>, complement=target−arr[i]=${target}−${arr[i]}=<b>${complement}</b>` });

      if (map.hasOwnProperty(complement)) {
        const j = map[complement];
        steps.push({ arr, boxes: arr.map((_, k) => k === i || k === j ? 'match' : 'default'),
          ptrs: { i, j }, map: { ...map },
          message: `🎉 Found! <b>${arr[j]}</b> (index ${j}) + <b>${arr[i]}</b> (index ${i}) = <b>${target}</b>` });
        return;
      } else {
        map[arr[i]] = i;
        steps.push({ arr, boxes: arr.map((_, j) => j <= i ? 'left' : 'default'), ptrs: { i },
          map: { ...map },
          message: `<b>${complement}</b> not in map. Store <b>${arr[i]}</b>→${i} in map. Continue.` });
      }
    }
    steps.push({ arr, boxes: arr.map(() => 'default'), ptrs: {}, map,
      message: `No two numbers sum to <b>${target}</b>` });
  }

  // ── Dutch National Flag ────────────────────────────────────────────────────
  function dutchFlagSteps(arr) {
    const a = [...arr];
    let low = 0, mid = 0, high = a.length - 1;
    steps = [];

    steps.push({ arr: [...a], low, mid, high,
      message: `Initialize: low=${low}, mid=${mid}, high=${high}. Region [0..low-1]=0s, [low..mid-1]=1s, [high+1..n-1]=2s` });

    while (mid <= high) {
      const boxes = a.map((v, i) => {
        if (i < low) return 'red-group';
        if (i >= low && i < mid) return 'white-group';
        if (i > high) return 'blue-group';
        return 'default';
      });

      if (a[mid] === 0) {
        steps.push({ arr: [...a], low, mid, high, boxes,
          message: `arr[mid=${mid}]=<b>0</b> → swap with low=${low}, advance low and mid` });
        [a[low], a[mid]] = [a[mid], a[low]];
        low++; mid++;
      } else if (a[mid] === 1) {
        steps.push({ arr: [...a], low, mid, high, boxes,
          message: `arr[mid=${mid}]=<b>1</b> → already in correct zone, advance mid` });
        mid++;
      } else {
        steps.push({ arr: [...a], low, mid, high, boxes,
          message: `arr[mid=${mid}]=<b>2</b> → swap with high=${high}, retreat high (don't advance mid!)` });
        [a[mid], a[high]] = [a[high], a[mid]];
        high--;
      }
    }
    const finalBoxes = a.map(v => v === 0 ? 'red-group' : v === 1 ? 'white-group' : 'blue-group');
    steps.push({ arr: [...a], low, mid, high, boxes: finalBoxes,
      message: `🎉 Sorted! All 0s (red) | 1s (white) | 2s (blue)` });
  }

  // ── Generic array display (for Palindrome, Primes, Fibonacci, Anagram etc.) ─
  function genericSteps(arr, message) {
    steps = [];
    steps.push({ arr, boxes: arr.map(() => 'default'), ptrs: {},
      message: message || `Array visualization` });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderStep(idx) {
    if (!container || idx >= steps.length) return;
    const step = steps[idx];
    const { arr, boxes, ptrs, low, mid, high } = step;

    const ptrLabels = {};
    if (ptrs) {
      if (ptrs.i !== undefined) ptrLabels[ptrs.i] = (ptrLabels[ptrs.i] ? ptrLabels[ptrs.i] + ' ' : '') + 'i';
      if (ptrs.j !== undefined) ptrLabels[ptrs.j] = (ptrLabels[ptrs.j] ? ptrLabels[ptrs.j] + ' ' : '') + 'j';
    }
    if (low !== undefined) ptrLabels[low]  = (ptrLabels[low]  ? ptrLabels[low]  + ' ' : '') + 'low';
    if (mid !== undefined) ptrLabels[mid]  = (ptrLabels[mid]  ? ptrLabels[mid]  + ' ' : '') + 'mid';
    if (high !== undefined) ptrLabels[high] = (ptrLabels[high] ? ptrLabels[high] + ' ' : '') + 'high';

    const effectiveBoxes = boxes || arr.map(() => 'default');

    container.innerHTML = `<div class="array-viz">` +
      arr.map((v, i) => `
        <div class="array-cell">
          <div class="array-ptr">${ptrLabels[i] || ''}</div>
          <div class="array-box ${effectiveBoxes[i] || 'default'}">${v}</div>
          <div class="array-idx">${i}</div>
        </div>`).join('') +
      `</div>`;

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

  function mount(algo, canvasEl, infoElement, inputData) {
    container = canvasEl;
    infoEl = infoElement;
    steps = [];
    stepIndex = 0;

    const data   = inputData || algo.defaultData || [1, 2, 3, 4, 5];
    const target = algo.defaultTarget;

    if (algo.id === 'two-sum') {
      twoSumSteps(data, target !== undefined ? target : 9);
    } else if (algo.id === 'dutch-flag') {
      dutchFlagSteps(data);
    } else {
      genericSteps(data, `Values from <b>${algo.name}</b> — see Explanation tab for algorithm details`);
    }

    renderStep(0);

    return {
      play, pause,
      stepBack:    () => { pause(); if (stepIndex > 0) { stepIndex--; renderStep(stepIndex); } },
      stepForward: () => { pause(); if (stepIndex < steps.length-1) { stepIndex++; renderStep(stepIndex); } },
      reset: (d) => {
        pause(); steps = []; stepIndex = 0;
        if (algo.id === 'two-sum') twoSumSteps(d || data, target !== undefined ? target : 9);
        else if (algo.id === 'dutch-flag') dutchFlagSteps(d || data);
        else genericSteps(d || data);
        renderStep(0);
      },
      setSpeed: (ms) => { speedMs = ms; },
      getStepCount: () => steps.length,
    };
  }

  return { mount };
})();
