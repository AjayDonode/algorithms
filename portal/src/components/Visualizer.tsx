'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Algorithm } from '@/data/algorithms';
import styles from './Visualizer.module.css';
import { MergeSortTree } from './MergeSortTree';

interface Step {
  arr: number[];
  highlights: Record<string, number[]>;
  message: string;
}

// ── Step generators ─────────────────────────────────────────

function bubbleSortSteps(data: number[]): Step[] {
  const arr = [...data]; const steps: Step[] = []; const sorted = new Set<number>();
  steps.push({ arr: [...arr], highlights: {}, message: 'Starting Bubble Sort — compare adjacent pairs and swap if out of order.' });
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 1; j < arr.length - i; j++) {
      steps.push({ arr: [...arr], highlights: { compare: [j-1, j], sorted: [...sorted] }, message: `Pass ${i+1}: Comparing <b>${arr[j-1]}</b> and <b>${arr[j]}</b>` });
      if (arr[j-1] > arr[j]) {
        [arr[j-1], arr[j]] = [arr[j], arr[j-1]];
        steps.push({ arr: [...arr], highlights: { swap: [j-1, j], sorted: [...sorted] }, message: `Swapping → <b>${arr[j-1]}</b> ↔ <b>${arr[j]}</b>` });
      }
    }
    sorted.add(arr.length - 1 - i);
    steps.push({ arr: [...arr], highlights: { sorted: [...sorted] }, message: `Pass ${i+1} done — <b>${arr[arr.length-1-i]}</b> is now in its final position ✓` });
  }
  sorted.add(0);
  steps.push({ arr: [...arr], highlights: { sorted: [...sorted] }, message: '🎉 Array fully sorted!' });
  return steps;
}

function selectionSortSteps(data: number[]): Step[] {
  const arr = [...data]; const steps: Step[] = []; const sorted = new Set<number>();
  steps.push({ arr: [...arr], highlights: {}, message: 'Starting Selection Sort — find the minimum and place it at the front.' });
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ arr: [...arr], highlights: { compare: [minIdx, j], sorted: [...sorted] }, message: `Finding min: <b>${arr[j]}</b> vs current min <b>${arr[minIdx]}</b>` });
      if (arr[j] < arr[minIdx]) { minIdx = j; steps.push({ arr: [...arr], highlights: { compare: [minIdx], sorted: [...sorted] }, message: `New minimum: <b>${arr[minIdx]}</b> at index ${minIdx}` }); }
    }
    if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; steps.push({ arr: [...arr], highlights: { swap: [i, minIdx], sorted: [...sorted] }, message: `Swap min <b>${arr[i]}</b> → position ${i}` }); }
    sorted.add(i);
  }
  sorted.add(arr.length - 1);
  steps.push({ arr: [...arr], highlights: { sorted: [...sorted] }, message: '🎉 Array fully sorted!' });
  return steps;
}

function quickSortSteps(data: number[]): Step[] {
  const arr = [...data]; const steps: Step[] = [];
  steps.push({ arr: [...arr], highlights: {}, message: 'Starting Quick Sort — pick pivot, partition, recurse.' });
  function partition(low: number, high: number): number {
    const pivot = arr[high];
    steps.push({ arr: [...arr], highlights: { pivot: [high] }, message: `Pivot selected: <b>${pivot}</b>` });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ arr: [...arr], highlights: { compare: [j, high], pivot: [high] }, message: `<b>${arr[j]}</b> vs pivot <b>${pivot}</b>` });
      if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; if (i !== j) steps.push({ arr: [...arr], highlights: { swap: [i, j], pivot: [high] }, message: `<b>${arr[i]}</b> ≤ pivot → swap` }); }
    }
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    steps.push({ arr: [...arr], highlights: { sorted: [i+1] }, message: `Pivot <b>${arr[i+1]}</b> at final position ${i+1} ✓` });
    return i + 1;
  }
  function qs(low: number, high: number) {
    if (low < high) { const pi = partition(low, high); qs(low, pi-1); qs(pi+1, high); }
  }
  qs(0, arr.length - 1);
  steps.push({ arr: [...arr], highlights: { sorted: arr.map((_, i) => i) }, message: '🎉 Array fully sorted!' });
  return steps;
}

function mergeSortSteps(data: number[]): Step[] {
  const arr = [...data]; const steps: Step[] = [];
  steps.push({ arr: [...arr], highlights: {}, message: 'Starting Merge Sort — divide, sort halves, merge.' });
  function merge(l: number, m: number, r: number) {
    const left = arr.slice(l, m+1); const right = arr.slice(m+1, r+1);
    steps.push({ arr: [...arr], highlights: { compare: Array.from({length: r-l+1}, (_,x) => l+x) }, message: `Merging [${left}] + [${right}]` });
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) { arr[k++] = left[i] <= right[j] ? left[i++] : right[j++]; steps.push({ arr: [...arr], highlights: { swap: [k-1] }, message: `Placed <b>${arr[k-1]}</b>` }); }
    while (i < left.length) { arr[k++] = left[i++]; steps.push({ arr: [...arr], highlights: { swap: [k-1] }, message: `Copying <b>${arr[k-1]}</b>` }); }
    while (j < right.length) { arr[k++] = right[j++]; steps.push({ arr: [...arr], highlights: { swap: [k-1] }, message: `Copying <b>${arr[k-1]}</b>` }); }
  }
  function ms(l: number, r: number) { if (l < r) { const m = Math.floor((l+r)/2); ms(l,m); ms(m+1,r); merge(l,m,r); } }
  ms(0, arr.length-1);
  steps.push({ arr: [...arr], highlights: { sorted: arr.map((_,i)=>i) }, message: '🎉 Merge Sort complete!' });
  return steps;
}

function linearSearchSteps(data: number[], target: number): Step[] {
  const steps: Step[] = [];
  steps.push({ arr: data, highlights: {}, message: `Searching for <b>${target}</b> using Linear Search…` });
  for (let i = 0; i < data.length; i++) {
    steps.push({ arr: data, highlights: { active: [i], eliminated: Array.from({length:i},(_,x)=>x) }, message: `Checking index ${i}: <b>${data[i]}</b> ${data[i]===target ? '== target ✓' : '≠ target'}` });
    if (data[i] === target) { steps.push({ arr: data, highlights: { found: [i] }, message: `🎉 Found <b>${target}</b> at index <b>${i}</b>!` }); return steps; }
  }
  steps.push({ arr: data, highlights: { eliminated: data.map((_,i)=>i) }, message: `❌ <b>${target}</b> not found in the array` });
  return steps;
}

function binarySearchSteps(data: number[], target: number): Step[] {
  const steps: Step[] = [];
  steps.push({ arr: data, highlights: {}, message: `Searching for <b>${target}</b> using Binary Search on sorted array…` });
  let lo = 0, hi = data.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const elim: number[] = []; for (let i=0;i<data.length;i++) if(i<lo||i>hi) elim.push(i);
    steps.push({ arr: data, highlights: { active: [mid], range: Array.from({length:hi-lo+1},(_,x)=>lo+x).filter(x=>x!==mid), eliminated: elim }, message: `Window [${lo}..${hi}], mid=${mid}: checking <b>${data[mid]}</b>` });
    if (data[mid] === target) { steps.push({ arr: data, highlights: { found: [mid] }, message: `🎉 Found <b>${target}</b> at index <b>${mid}</b>!` }); return steps; }
    if (data[mid] < target) { steps.push({ arr: data, highlights: { active: [mid] }, message: `<b>${data[mid]}</b> < <b>${target}</b> → search right, new low = ${mid+1}` }); lo = mid + 1; }
    else { steps.push({ arr: data, highlights: { active: [mid] }, message: `<b>${data[mid]}</b> > <b>${target}</b> → search left, new high = ${mid-1}` }); hi = mid - 1; }
  }
  steps.push({ arr: data, highlights: { eliminated: data.map((_,i)=>i) }, message: `❌ <b>${target}</b> not found` });
  return steps;
}

function twoSumSteps(data: number[], target: number): Step[] {
  const steps: Step[] = []; const map: Record<number,number> = {};
  steps.push({ arr: data, highlights: {}, message: `Finding two numbers that sum to <b>${target}</b>` });
  for (let i = 0; i < data.length; i++) {
    const comp = target - data[i];
    steps.push({ arr: data, highlights: { active: [i] }, message: `Index ${i}: value=<b>${data[i]}</b>, complement=<b>${comp}</b>` });
    if (map.hasOwnProperty(comp)) { steps.push({ arr: data, highlights: { found: [map[comp], i] }, message: `🎉 Found! <b>${data[map[comp]]}</b>+<b>${data[i]}</b>=<b>${target}</b>` }); return steps; }
    map[data[i]] = i;
    steps.push({ arr: data, highlights: { compare: Array.from({length:i+1},(_,x)=>x) }, message: `Store <b>${data[i]}</b>→${i} in map` });
  }
  return steps;
}

function dutchFlagSteps(data: number[]): Step[] {
  const arr = [...data]; const steps: Step[] = [];
  let lo = 0, mid = 0, hi = arr.length - 1;
  steps.push({ arr: [...arr], highlights: { lo: [lo], mid: [mid], hi: [hi] }, message: `Init: low=${lo}, mid=${mid}, high=${hi}` });
  while (mid <= hi) {
    if (arr[mid] === 0) {
      steps.push({ arr: [...arr], highlights: { compare: [mid], lo: [lo], hi: [hi] }, message: `arr[mid=${mid}]=<b>0</b> → swap with low=${lo}, advance both` });
      [arr[lo], arr[mid]] = [arr[mid], arr[lo]]; lo++; mid++;
      steps.push({ arr: [...arr], highlights: { swap: [lo-1, mid-1], lo: [lo], mid: [mid], hi: [hi] }, message: `After swap: low=${lo}, mid=${mid}` });
    } else if (arr[mid] === 1) {
      steps.push({ arr: [...arr], highlights: { active: [mid], lo: [lo], hi: [hi] }, message: `arr[mid=${mid}]=<b>1</b> → already correct, advance mid` });
      mid++;
    } else {
      steps.push({ arr: [...arr], highlights: { compare: [mid], lo: [lo], hi: [hi] }, message: `arr[mid=${mid}]=<b>2</b> → swap with high=${hi}, retreat high` });
      [arr[mid], arr[hi]] = [arr[hi], arr[mid]]; hi--;
      steps.push({ arr: [...arr], highlights: { swap: [mid, hi+1], lo: [lo], mid: [mid], hi: [hi] }, message: `After swap: high=${hi}` });
    }
  }
  steps.push({ arr: [...arr], highlights: { sorted: arr.map((_,i)=>i) }, message: '🎉 Sorted! 0s | 1s | 2s' });
  return steps;
}

function genericSteps(data: number[], name: string): Step[] {
  return [{ arr: data, highlights: {}, message: `Values from <b>${name}</b> — see Explanation tab for details.` }];
}

function getSteps(algo: Algorithm, data: number[]): Step[] {
  const t = algo.defaultTarget ?? 0;
  switch (algo.id) {
    case 'bubble-sort':    return bubbleSortSteps(data);
    case 'selection-sort': return selectionSortSteps(data);
    case 'merge-sort':     return mergeSortSteps(data);
    case 'quick-sort':     return quickSortSteps(data);
    case 'linear-search':  return linearSearchSteps(data, t);
    case 'binary-search':  return binarySearchSteps(data, t);
    case 'two-sum':        return twoSumSteps(data, t);
    case 'dutch-flag':     return dutchFlagSteps(data);
    default:               return genericSteps(data, algo.name);
  }
}

// ── Bar colours ─────────────────────────────────────────────
const BAR_COLORS: Record<string, string> = {
  default:    'var(--bg-tertiary)',
  compare:    'var(--accent)',
  swap:       'var(--red)',
  sorted:     'var(--green)',
  pivot:      '#af52de',
  active:     'var(--accent)',
  found:      'var(--green)',
  eliminated: 'var(--bg-tertiary)',
  range:      'var(--accent-muted)',
  lo:         '#af52de',
  mid:        'var(--accent)',
  hi:         'var(--red)',
};

function barColor(i: number, h: Record<string, number[]>): string {
  for (const [key, idxs] of Object.entries(h)) {
    if (idxs.includes(i)) return BAR_COLORS[key] ?? BAR_COLORS.default;
  }
  return BAR_COLORS.default;
}

export function Visualizer({ algo }: { algo: Algorithm }) {
  const defaultData = algo.defaultData ?? [38,27,43,3,9,82,10];

  // ── Merge Sort gets its own tree visualizer ──────────────────────
  if (algo.id === 'merge-sort') {
    return <MergeSortTree initialData={defaultData} />;
  }

  const [steps, setSteps] = useState<Step[]>(() => getSteps(algo, defaultData));
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [customArr, setCustomArr] = useState(defaultData.join(', '));
  const [customTarget, setCustomTarget] = useState(String(algo.defaultTarget ?? ''));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[idx] ?? steps[0];

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setIdx(i => i + 1), speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, idx, steps.length, speed]);

  function rebuild(arr: number[]) {
    stop();
    const newSteps = getSteps(algo, arr);
    setSteps(newSteps);
    setIdx(0);
  }

  function handleRun() {
    const arr = customArr.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
    if (arr.length >= 2) rebuild(arr);
  }

  const maxVal = Math.max(...step.arr);
  const barW = Math.max(18, Math.floor(560 / step.arr.length) - 4);

  const isSorting = ['bubble-sort','selection-sort','merge-sort','quick-sort'].includes(algo.id);
  const isSearch  = ['linear-search','binary-search'].includes(algo.id);

  return (
    <div className={styles.wrap}>
      {/* Canvas */}
      <div className={styles.canvas}>
        {isSorting && (
          <div className={styles.bars}>
            {step.arr.map((v, i) => {
              const h = Math.max(12, Math.round((v / maxVal) * 200));
              const color = barColor(i, step.highlights);
              return (
                <div key={i} className={styles.bar} style={{ height: h, width: barW, background: color }} title={String(v)}>
                  <span className={styles.barLabel}>{v}</span>
                </div>
              );
            })}
          </div>
        )}

        {isSearch && (
          <div className={styles.cells}>
            {step.arr.map((v, i) => {
              let cls = styles.cell;
              if (step.highlights.found?.includes(i))      cls += ' ' + styles.cellFound;
              else if (step.highlights.active?.includes(i)) cls += ' ' + styles.cellActive;
              else if (step.highlights.eliminated?.includes(i)) cls += ' ' + styles.cellElim;
              else if (step.highlights.range?.includes(i))  cls += ' ' + styles.cellRange;
              return (
                <div key={i} className={cls}>
                  <span className={styles.cellVal}>{v}</span>
                  <span className={styles.cellIdx}>{i}</span>
                </div>
              );
            })}
          </div>
        )}

        {!isSorting && !isSearch && (
          <div className={styles.arrViz}>
            {step.arr.map((v, i) => {
              let cls = styles.arrBox;
              const h = step.highlights;
              if (h.found?.includes(i))   cls += ' ' + styles.arrFound;
              else if (h.swap?.includes(i))    cls += ' ' + styles.arrSwap;
              else if (h.compare?.includes(i)) cls += ' ' + styles.arrCompare;
              else if (h.active?.includes(i))  cls += ' ' + styles.arrActive;
              return (
                <div key={i} className={styles.arrCell}>
                  <div className={styles.arrPtr}>
                    {h.lo?.includes(i) && <span style={{color:'#af52de'}}>lo</span>}
                    {h.mid?.includes(i) && <span style={{color:'var(--accent)'}}>mid</span>}
                    {h.hi?.includes(i) && <span style={{color:'var(--red)'}}>hi</span>}
                  </div>
                  <div className={cls}>{v}</div>
                  <span className={styles.arrIdx}>{i}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step info */}
      <div className={styles.info}
        dangerouslySetInnerHTML={{ __html: `<b>Step ${idx+1}/${steps.length}:</b> ${step.message}` }}
      />

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.btn} onClick={() => { stop(); setIdx(0); }}>⏮</button>
        <button className={styles.btn} onClick={() => { stop(); setIdx(i => Math.max(0, i-1)); }}>◀</button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => {
          if (playing) { stop(); } else { if (idx >= steps.length-1) setIdx(0); setPlaying(true); }
        }}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className={styles.btn} onClick={() => { stop(); setIdx(i => Math.min(steps.length-1, i+1)); }}>▶</button>
        <div className={styles.speedWrap}>
          <span>Fast</span>
          <input type="range" min={100} max={1200} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className={styles.slider} />
          <span>Slow</span>
        </div>
      </div>

      {/* Custom input */}
      <div className={styles.tryIt}>
        <p className={styles.tryLabel}>🎮 Try your own values</p>
        <div className={styles.tryRow}>
          <input
            type="text" value={customArr}
            onChange={e => setCustomArr(e.target.value)}
            className={styles.tryInput}
            placeholder="Comma-separated numbers, e.g. 5, 3, 8, 1"
          />
          {algo.defaultTarget !== undefined && (
            <input type="number" value={customTarget}
              onChange={e => setCustomTarget(e.target.value)}
              className={`${styles.tryInput} ${styles.trySmall}`}
              placeholder="Target"
            />
          )}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleRun}>Run →</button>
        </div>
      </div>
    </div>
  );
}
