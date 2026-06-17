// ── Solution store (localStorage) ────────────────────────────
export type SolutionLang = 'java' | 'python' | 'javascript';

export interface Solution {
  id: string;
  title: string;
  category: string;
  lang: SolutionLang;
  code: string;
  notes: string;
  savedAt: string; // ISO string
}

const KEY = 'av:solutions';

export const CATEGORIES = [
  'Arrays',
  'Strings',
  'Linked List',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Binary Search',
  'Sliding Window',
  'Two Pointers',
  'Heap / Priority Queue',
  'Backtracking',
  'Math',
  'Other',
];

function load(): Solution[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Solution[];
  } catch {
    return [];
  }
}

function persist(solutions: Solution[]): void {
  localStorage.setItem(KEY, JSON.stringify(solutions));
}

export function getSolutions(): Solution[] {
  return load().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveSolution(
  data: Omit<Solution, 'id' | 'savedAt'>
): Solution {
  const all = load();
  const solution: Solution = {
    ...data,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  all.unshift(solution);
  persist(all);
  return solution;
}

export function updateSolution(id: string, patch: Partial<Omit<Solution, 'id'>>): void {
  const all = load().map(s => s.id === id ? { ...s, ...patch } : s);
  persist(all);
}

export function deleteSolution(id: string): void {
  persist(load().filter(s => s.id !== id));
}

export function getSolutionsByCategory(): Record<string, Solution[]> {
  const all = load().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const map: Record<string, Solution[]> = {};
  for (const s of all) {
    if (!map[s.category]) map[s.category] = [];
    map[s.category].push(s);
  }
  return map;
}
