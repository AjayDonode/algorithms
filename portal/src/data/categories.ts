// src/data/categories.ts
export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all',        label: 'All',              icon: '⊞',  description: 'All algorithms' },
  { id: 'sorting',    label: 'Sorting',          icon: '↕',  description: 'Comparison and non-comparison sorting algorithms' },
  { id: 'searching',  label: 'Searching',        icon: '⌕',  description: 'Efficient lookup algorithms' },
  { id: 'graph',      label: 'Graph',            icon: '◉',  description: 'Graph traversal and shortest path algorithms' },
  { id: 'trees',      label: 'Trees',            icon: '⚶',  description: 'Binary trees, BSTs, and Tries' },
  { id: 'arrays',     label: 'Arrays',           icon: '⊟',  description: 'Array manipulation and two-pointer techniques' },
  { id: 'strings',    label: 'Strings',          icon: 'Aa', description: 'String processing and pattern matching' },
  { id: 'math',       label: 'Math',             icon: '∑',  description: 'Mathematical algorithms and number theory' },
  { id: 'matrix',     label: 'Matrix',           icon: '⊞',  description: '2D grid and matrix traversal algorithms' },
  { id: 'linkedlist', label: 'Linked List',      icon: '⇔',  description: 'Singly and doubly linked list algorithms' },
  { id: 'design',     label: 'System Design',    icon: '⚙',  description: 'Data structure design — caches, hash maps, and custom collections' },
  { id: 'dp',         label: 'Dynamic Prog.',    icon: '◈',  description: 'Overlapping sub-problems solved with memoization or tabulation' },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}
