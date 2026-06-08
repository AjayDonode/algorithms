// src/data/algorithms.ts

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type VisualizerType = 'sorting' | 'search' | 'tree' | 'graph' | 'array';

export interface ComplexityInfo {
  time: { best: string; avg: string; worst: string };
  space: string;
}

export interface ComplexityRow {
  label: string;
  value: string;
  note: string;
}

export interface Algorithm {
  id: string;
  name: string;
  category: string;
  difficulty: Difficulty;
  icon: string;
  tagline: string;
  complexity: ComplexityInfo;
  explanation: string;
  keyInsight: string;
  steps: string[];
  pseudocode: string;
  javaCode: string;
  pythonCode: string;
  useCases: string[];
  visualizer: VisualizerType;
  defaultData?: number[];
  defaultTarget?: number;
  complexityRows: ComplexityRow[];
}

export const ALGORITHMS: Algorithm[] = [
  // ── SORTING ────────────────────────────────────────────
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'beginner',
    icon: '🫧',
    tagline: 'Repeatedly swap adjacent elements that are in the wrong order',
    complexity: { time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
    explanation: `Bubble Sort is the simplest sorting algorithm. It works by scanning the array from left to right and swapping any two adjacent elements that are out of order. After one full scan (a "pass"), the largest element has "bubbled up" to the end.\n\nWe repeat this process, but each time we can skip the last position because it's already in its final place. We need at most n−1 passes to sort n elements.`,
    keyInsight: 'After every pass, the next largest unsorted element settles into its correct position at the end — so each pass gets one position shorter.',
    steps: [
      'Compare element at index 0 with element at index 1. Swap if out of order.',
      'Move one position right and compare the next pair. Swap if needed.',
      'Continue until the end of the unsorted section — the largest element is now in place.',
      'Repeat from the beginning, but stop one position earlier each time.',
      'After n−1 passes the array is fully sorted.',
    ],
    pseudocode: `for i from 0 to n-2:\n  for j from 1 to n-1-i:\n    if arr[j-1] > arr[j]:\n      swap(arr[j-1], arr[j])`,
    javaCode: `public static void bubbleSort(int[] arr) {\n  for (int i = 0; i < arr.length - 1; i++) {\n    for (int j = 1; j < arr.length - i; j++) {\n      if (arr[j-1] > arr[j]) {\n        int temp = arr[j];\n        arr[j] = arr[j-1];\n        arr[j-1] = temp;\n      }\n    }\n  }\n}`,
    pythonCode: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(1, n - i):\n            if arr[j - 1] > arr[j]:\n                arr[j - 1], arr[j] = arr[j], arr[j - 1]\n    return arr\n\n# Example\ndata = [38, 27, 43, 3, 9, 82, 10]\nprint(bubble_sort(data))  # [3, 9, 10, 27, 38, 43, 82]`,
    useCases: ['Educational purposes', 'Nearly-sorted data (optimised variant)', 'Very small arrays'],
    visualizer: 'sorting',
    defaultData: [38, 27, 43, 3, 9, 82, 10],
    complexityRows: [
      { label: 'Best case', value: 'O(n)', note: 'Array already sorted — no swaps needed' },
      { label: 'Average case', value: 'O(n²)', note: 'Random order — roughly n²/2 comparisons' },
      { label: 'Worst case', value: 'O(n²)', note: 'Array is reverse sorted — max comparisons and swaps' },
      { label: 'Space', value: 'O(1)', note: 'Sorts in-place, no extra array needed' },
    ],
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    difficulty: 'beginner',
    icon: '🎯',
    tagline: 'Find the minimum element and place it at the front, repeat',
    complexity: { time: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
    explanation: `Selection Sort divides the array into two parts: a sorted section at the front and an unsorted section at the back. On each iteration it scans the unsorted section to find the minimum element, then swaps that minimum to the front.\n\nUnlike Bubble Sort, Selection Sort makes at most n−1 swaps total, which makes it useful when swap cost is high.`,
    keyInsight: 'Selection Sort always makes exactly n−1 swaps — compare this to Bubble Sort which can make O(n²) swaps in the worst case.',
    steps: [
      'Find the minimum element in the entire array.',
      'Swap it with the element at index 0 — sorted section has 1 element.',
      'Find the minimum in arr[1..n-1]. Swap it to index 1.',
      'Repeat: grow the sorted section by 1 each time.',
      'After n−1 iterations the whole array is sorted.',
    ],
    pseudocode: `for i from 0 to n-2:\n  minIdx = i\n  for j from i+1 to n-1:\n    if arr[j] < arr[minIdx]:\n      minIdx = j\n  swap(arr[i], arr[minIdx])`,
    javaCode: `public static void selectionSort(int[] arr) {\n  for (int i = 0; i < arr.length - 1; i++) {\n    int minIndex = i;\n    for (int j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[minIndex]) minIndex = j;\n    }\n    int temp = arr[minIndex];\n    arr[minIndex] = arr[i];\n    arr[i] = temp;\n  }\n}`,
    pythonCode: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        min_idx = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr\n\n# Example\ndata = [64, 25, 12, 22, 11]\nprint(selection_sort(data))  # [11, 12, 22, 25, 64]`,
    useCases: ['When write operations are expensive', 'Small arrays', 'Embedded systems with limited write cycles'],
    visualizer: 'sorting',
    defaultData: [64, 25, 12, 22, 11],
    complexityRows: [
      { label: 'Best case', value: 'O(n²)', note: 'No early exit — always scans the full unsorted section' },
      { label: 'Average case', value: 'O(n²)', note: '~n²/2 comparisons regardless of input order' },
      { label: 'Worst case', value: 'O(n²)', note: 'Same as best — no adaptive behaviour' },
      { label: 'Space', value: 'O(1)', note: 'In-place, constant extra memory' },
    ],
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    icon: '🔀',
    tagline: 'Divide the array in half, sort each half, then merge them back',
    complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' },
    explanation: `Merge Sort uses the Divide & Conquer strategy. It recursively splits the array into two halves until each half has one element (trivially sorted), then merges pairs of sorted halves.\n\nThe merge step compares elements from two sorted sub-arrays and assembles them into a single sorted array. This always runs in O(n), and there are O(log n) levels, giving the famous O(n log n) complexity.`,
    keyInsight: 'Merging two sorted arrays is O(n). Merge Sort exploits this by recursively creating sorted sub-arrays, then merging upward — guaranteed O(n log n) with no worst-case degradation.',
    steps: [
      'Split the array into two equal halves.',
      'Recursively sort the left half.',
      'Recursively sort the right half.',
      'Merge: compare front elements of both halves, always pick the smaller one.',
      'The merged result is the fully sorted array.',
    ],
    pseudocode: `mergeSort(arr):\n  if len(arr) <= 1: return arr\n  mid = len(arr) / 2\n  left  = mergeSort(arr[0..mid])\n  right = mergeSort(arr[mid..n])\n  return merge(left, right)`,
    javaCode: `public static void mergeSort(int[] arr, int l, int r) {\n  if (l < r) {\n    int mid = l + (r - l) / 2;\n    mergeSort(arr, l, mid);\n    mergeSort(arr, mid + 1, r);\n    merge(arr, l, mid, r);\n  }\n}\n\nprivate static void merge(int[] arr, int l, int m, int r) {\n  int[] tmp = new int[r - l + 1];\n  int i = l, j = m + 1, k = 0;\n  while (i <= m && j <= r)\n    tmp[k++] = arr[i] <= arr[j] ? arr[i++] : arr[j++];\n  while (i <= m)  tmp[k++] = arr[i++];\n  while (j <= r)  tmp[k++] = arr[j++];\n  System.arraycopy(tmp, 0, arr, l, tmp.length);\n}`,
    pythonCode: `def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left  = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return _merge(left, right)\n\ndef _merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\n# Example\nprint(merge_sort([38, 27, 43, 3, 9, 82, 10]))\n# [3, 9, 10, 27, 38, 43, 82]`,
    useCases: ['Large datasets', 'Linked lists', 'External sorting (data on disk)', 'Stable sort required'],
    visualizer: 'sorting',
    defaultData: [38, 27, 43, 3, 9, 82, 10],
    complexityRows: [
      { label: 'Best case', value: 'O(n log n)', note: 'Divide is always log n levels; merge is always O(n)' },
      { label: 'Average case', value: 'O(n log n)', note: 'Consistent regardless of input' },
      { label: 'Worst case', value: 'O(n log n)', note: 'No degradation — guaranteed' },
      { label: 'Space', value: 'O(n)', note: 'Needs a temporary array of size n for merging' },
    ],
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    icon: '⚡',
    tagline: 'Pick a pivot, partition the array around it, recurse on both sides',
    complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' }, space: 'O(log n)' },
    explanation: `Quick Sort picks a "pivot" element and rearranges the array so everything smaller than the pivot moves to its left and everything larger moves to its right. The pivot is now in its final position. Quick Sort then recursively sorts left and right sub-arrays.\n\nIn practice Quick Sort is usually faster than Merge Sort due to better cache locality. The weakness is its O(n²) worst case when the pivot is always the smallest or largest element.`,
    keyInsight: 'The partition step puts the pivot in its exact final position in O(n). If we consistently pick a good pivot, each recursive call halves the problem — giving O(n log n) total.',
    steps: [
      'Choose a pivot element (last element in the classic version).',
      'Partition: scan from left, move elements ≤ pivot to the left side.',
      'Swap the pivot into its correct final position.',
      'Recursively apply Quick Sort to the left sub-array.',
      'Recursively apply Quick Sort to the right sub-array.',
    ],
    pseudocode: `quickSort(arr, low, high):\n  if low < high:\n    pi = partition(arr, low, high)\n    quickSort(arr, low, pi - 1)\n    quickSort(arr, pi + 1, high)`,
    javaCode: `public static void quickSort(int[] arr, int low, int high) {\n  if (low < high) {\n    int pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}\n\nprivate static int partition(int[] arr, int low, int high) {\n  int pivot = arr[high];\n  int i = low - 1;\n  for (int j = low; j < high; j++) {\n    if (arr[j] <= pivot) {\n      i++;\n      int t = arr[i]; arr[i] = arr[j]; arr[j] = t;\n    }\n  }\n  int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;\n  return i + 1;\n}`,
    pythonCode: `def quick_sort(arr, low=0, high=None):\n    if high is None:\n        high = len(arr) - 1\n    if low < high:\n        pi = _partition(arr, low, high)\n        quick_sort(arr, low, pi - 1)\n        quick_sort(arr, pi + 1, high)\n    return arr\n\ndef _partition(arr, low, high):\n    pivot = arr[high]\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[high] = arr[high], arr[i+1]\n    return i + 1\n\n# Example\nprint(quick_sort([10, 80, 30, 90, 40, 50, 70]))\n# [10, 30, 40, 50, 70, 80, 90]`,
    useCases: ['General-purpose in-memory sorting', 'When average-case performance matters', 'System library sort implementations'],
    visualizer: 'sorting',
    defaultData: [10, 80, 30, 90, 40, 50, 70],
    complexityRows: [
      { label: 'Best case', value: 'O(n log n)', note: 'Pivot splits array perfectly in half each time' },
      { label: 'Average case', value: 'O(n log n)', note: 'Expected for random pivot on random input' },
      { label: 'Worst case', value: 'O(n²)', note: 'Pivot is always min or max — one side always empty' },
      { label: 'Space', value: 'O(log n)', note: 'In-place, but recursion stack uses O(log n) frames' },
    ],
  },

  // ── SEARCHING ──────────────────────────────────────────
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    difficulty: 'beginner',
    icon: '👁️',
    tagline: 'Scan every element from left to right until you find the target',
    complexity: { time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    explanation: `Linear Search iterates through every element of the array one by one from the beginning, comparing each element to the target value. If a match is found, the index is returned. If the end of the array is reached without a match, −1 is returned.\n\nLinear Search works on any array, sorted or unsorted. Its simplicity makes it the go-to choice for small or unordered datasets.`,
    keyInsight: 'No setup required — Linear Search works on any array regardless of order. But it examines every element in the worst case, making it slow for large datasets.',
    steps: [
      'Start at index 0.',
      'Compare the current element to the target.',
      'If they match → return the current index.',
      'If no match → move to the next index.',
      'If you reach the end without a match → return −1.',
    ],
    pseudocode: `linearSearch(arr, target):\n  for i from 0 to n-1:\n    if arr[i] == target:\n      return i\n  return -1`,
    javaCode: `public static int linearSearch(int[] arr, int target) {\n  for (int i = 0; i < arr.length; i++) {\n    if (arr[i] == target) return i;\n  }\n  return -1;\n}`,
    pythonCode: `def linear_search(arr, target):\n    for i, val in enumerate(arr):\n        if val == target:\n            return i\n    return -1\n\n# Example\ndata = [4, 2, 7, 1, 9, 3, 8, 5]\nprint(linear_search(data, 9))   # 4\nprint(linear_search(data, 99))  # -1`,
    useCases: ['Unsorted arrays', 'Small arrays (< 50 elements)', 'One-time searches', 'Linked lists'],
    visualizer: 'search',
    defaultData: [4, 2, 7, 1, 9, 3, 8, 5],
    defaultTarget: 9,
    complexityRows: [
      { label: 'Best case', value: 'O(1)', note: 'Target is the first element' },
      { label: 'Average case', value: 'O(n)', note: 'Target is somewhere in the middle on average' },
      { label: 'Worst case', value: 'O(n)', note: 'Target is last element or not present' },
      { label: 'Space', value: 'O(1)', note: 'No extra data structures needed' },
    ],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    difficulty: 'beginner',
    icon: '🎯',
    tagline: 'Halve the search space each step — requires a sorted array',
    complexity: { time: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' }, space: 'O(1)' },
    explanation: `Binary Search exploits the sorted order of an array to dramatically reduce comparisons. It maintains a search window [low, high] and checks the middle element. If the middle equals the target, done. If the target is smaller, discard the right half; if larger, discard the left half.\n\nFor an array of 1,000,000 elements, Binary Search finds the target in at most 20 comparisons (log₂ 1,000,000 ≈ 20), versus up to 1,000,000 for Linear Search.`,
    keyInsight: 'Each comparison eliminates half the remaining elements. After k steps, you\'ve ruled out 2^k elements. Doubling the array only adds ONE extra step.',
    steps: [
      'Set low = 0, high = n−1.',
      'Compute mid = low + (high − low) / 2 (avoids integer overflow).',
      'If arr[mid] == target → found! Return mid.',
      'If arr[mid] < target → search right half, set low = mid + 1.',
      'If arr[mid] > target → search left half, set high = mid − 1.',
      'Repeat until low > high → return −1.',
    ],
    pseudocode: `binarySearch(arr, target):\n  low = 0, high = n - 1\n  while low <= high:\n    mid = low + (high - low) / 2\n    if arr[mid] == target: return mid\n    if arr[mid] < target:  low = mid + 1\n    else:                  high = mid - 1\n  return -1`,
    javaCode: `public static int binarySearch(int key, int[] data) {\n  int low = 0, high = data.length - 1;\n  while (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (data[mid] == key)  return mid;\n    if (data[mid] < key)   low = mid + 1;\n    else                   high = mid - 1;\n  }\n  return -1;\n}`,
    pythonCode: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\n# Example — array must be sorted!\ndata = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]\nprint(binary_search(data, 13))   # 6\nprint(binary_search(data, 10))   # -1`,
    useCases: ['Sorted arrays', 'Dictionary lookups', 'Finding insertion point', 'Database index lookups'],
    visualizer: 'search',
    defaultData: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    defaultTarget: 13,
    complexityRows: [
      { label: 'Best case', value: 'O(1)', note: 'Target is exactly at the midpoint on first probe' },
      { label: 'Average case', value: 'O(log n)', note: '~log₂ n comparisons on random input' },
      { label: 'Worst case', value: 'O(log n)', note: 'Full log n iterations' },
      { label: 'Space (iterative)', value: 'O(1)', note: 'Only low, high, mid variables' },
    ],
  },

  // ── GRAPH ──────────────────────────────────────────────
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    difficulty: 'advanced',
    icon: '🗺️',
    tagline: 'Greedily expand the nearest unvisited node to find shortest paths',
    complexity: { time: { best: 'O((V+E) log V)', avg: 'O((V+E) log V)', worst: 'O((V+E) log V)' }, space: 'O(V+E)' },
    explanation: `Dijkstra's algorithm solves the Single-Source Shortest Path (SSSP) problem: given a weighted graph and a starting node, find the shortest distance to every other node.\n\nIt uses a min-heap to always process the nearest unvisited node. For that node, it "relaxes" all outgoing edges — if going through the current node makes a neighbor cheaper to reach, update that neighbor's distance. All edge weights must be non-negative.`,
    keyInsight: 'The greedy property: once a node is polled from the min-heap, its distance is finalized forever. No future path can be shorter because all weights ≥ 0.',
    steps: [
      'Initialize all distances to ∞, except the source (distance = 0).',
      'Add the source to a min-heap with distance 0.',
      'Poll the node with the smallest distance from the heap.',
      'For each neighbor, check if going through the current node is cheaper (relaxation).',
      'If cheaper, update the neighbor\'s distance and push it to the heap.',
      'Repeat until the heap is empty.',
    ],
    pseudocode: `dijkstra(graph, source):\n  dist[source] = 0, all others = ∞\n  minHeap = [(0, source)]\n  while minHeap not empty:\n    (d, u) = poll minHeap\n    if d > dist[u]: skip\n    for each edge (u→v, weight w):\n      if dist[u] + w < dist[v]:\n        dist[v] = dist[u] + w\n        push (dist[v], v)`,
    javaCode: `public static void dijkstra(List<List<Edge>> graph, int src) {\n  int[] dist = new int[graph.size()];\n  Arrays.fill(dist, Integer.MAX_VALUE);\n  dist[src] = 0;\n  PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n  pq.offer(new int[]{0, src});\n  while (!pq.isEmpty()) {\n    int[] curr = pq.poll();\n    if (curr[0] > dist[curr[1]]) continue;\n    for (Edge e : graph.get(curr[1])) {\n      int nd = dist[curr[1]] + e.weight;\n      if (nd < dist[e.targetNode]) {\n        dist[e.targetNode] = nd;\n        pq.offer(new int[]{nd, e.targetNode});\n      }\n    }\n  }\n}`,
    pythonCode: `import heapq\n\ndef dijkstra(graph, src):\n    """\n    graph: dict of {node: [(neighbor, weight), ...]}\n    Returns dict of shortest distances from src.\n    """\n    dist = {node: float('inf') for node in graph}\n    dist[src] = 0\n    heap = [(0, src)]   # (distance, node)\n\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist[u]:\n            continue    # stale heap entry\n        for v, weight in graph[u]:\n            new_dist = dist[u] + weight\n            if new_dist < dist[v]:\n                dist[v] = new_dist\n                heapq.heappush(heap, (new_dist, v))\n    return dist\n\n# Example\ngraph = {0: [(1,9),(2,6),(3,5),(4,3)], 1: [], 2: [(1,2),(3,4)], 3: [], 4: []}\nprint(dijkstra(graph, 0))`,
    useCases: ['GPS navigation & maps', 'Network routing protocols (OSPF)', 'Game AI pathfinding', 'Flight itinerary planning'],
    visualizer: 'graph',
    complexityRows: [
      { label: 'Time', value: 'O((V+E) log V)', note: 'Each vertex is polled once; each edge may push to heap' },
      { label: 'Space', value: 'O(V + E)', note: 'Distance array + adjacency list + heap' },
      { label: 'Limitation', value: 'Non-negative weights only', note: 'Use Bellman-Ford for negative weights' },
    ],
  },
  {
    id: 'bfs',
    name: 'BFS — Breadth-First Search',
    category: 'graph',
    difficulty: 'intermediate',
    icon: '🌊',
    tagline: 'Explore all neighbors at the current depth before going deeper',
    complexity: { time: { best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)' }, space: 'O(V)' },
    explanation: `Breadth-First Search explores a graph level by level. Starting from a source node, it visits all direct neighbors first (distance 1), then all nodes at distance 2, and so on. A queue tracks the next nodes to explore.\n\nBFS guarantees the shortest path in an unweighted graph — the first time BFS reaches a node is via the shortest path.`,
    keyInsight: 'BFS discovers nodes in order of their distance from the source. When BFS first reaches a target, it has found the shortest (fewest-hops) path.',
    steps: [
      'Enqueue the source node and mark it visited.',
      'Dequeue a node and process it.',
      'Enqueue all unvisited neighbors and mark them visited.',
      'Repeat until the queue is empty or target is found.',
    ],
    pseudocode: `BFS(graph, source):\n  queue = [source]\n  visited = {source}\n  while queue not empty:\n    u = queue.dequeue()\n    for each neighbor v of u:\n      if v not visited:\n        visited.add(v)\n        queue.enqueue(v)`,
    javaCode: `public static int shortestPath(Map<String,List<String>> graph,\n                               String src, String dst) {\n  Queue<String> queue = new LinkedList<>();\n  Set<String> visited = new HashSet<>();\n  queue.add(src); visited.add(src);\n  int hops = 0;\n  while (!queue.isEmpty()) {\n    int size = queue.size();\n    for (int i = 0; i < size; i++) {\n      String curr = queue.poll();\n      if (curr.equals(dst)) return hops;\n      for (String nb : graph.getOrDefault(curr, List.of()))\n        if (visited.add(nb)) queue.add(nb);\n    }\n    hops++;\n  }\n  return -1;\n}`,
    pythonCode: `from collections import deque\n\ndef bfs_shortest_path(graph, src, dst):\n    """Returns hop count to dst, or -1 if unreachable."""\n    if src == dst: return 0\n    visited = {src}\n    queue   = deque([(src, 0)])\n    while queue:\n        node, hops = queue.popleft()\n        for nb in graph.get(node, []):\n            if nb == dst: return hops + 1\n            if nb not in visited:\n                visited.add(nb)\n                queue.append((nb, hops + 1))\n    return -1`,
    useCases: ['Shortest path in unweighted graphs', 'Social network friend suggestions', 'Web crawlers', 'Airport routing'],
    visualizer: 'graph',
    complexityRows: [
      { label: 'Time', value: 'O(V + E)', note: 'Every vertex and edge visited exactly once' },
      { label: 'Space', value: 'O(V)', note: 'Queue can hold up to V nodes' },
    ],
  },

  // ── TREES ──────────────────────────────────────────────
  {
    id: 'bst-traversal',
    name: 'BST Traversal',
    category: 'trees',
    difficulty: 'intermediate',
    icon: '🌲',
    tagline: 'Visit every node in a BST using In-Order, Pre-Order, or Post-Order',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(h)' },
    explanation: `A Binary Search Tree (BST) stores values such that for every node: all values in its left subtree are smaller, and all values in its right subtree are larger. Tree traversal means visiting every node exactly once.\n\n**In-Order (Left→Root→Right)**: Visits nodes in ascending sorted order.\n**Pre-Order (Root→Left→Right)**: Root first — useful for copying or serializing a tree.\n**Post-Order (Left→Right→Root)**: Root last — useful for deleting a tree.`,
    keyInsight: 'In-Order traversal of a BST always produces a sorted sequence — this is why BST lookup is efficient: it exploits the left < root < right invariant at every node.',
    steps: [
      'IN-ORDER: Traverse left subtree, then visit root, then right subtree.',
      'PRE-ORDER: Visit root first, then traverse left, then right.',
      'POST-ORDER: Traverse left, then right, then visit root last.',
    ],
    pseudocode: `inOrder(node):\n  if node is null: return\n  inOrder(node.left)\n  print(node.value)\n  inOrder(node.right)`,
    javaCode: `public static void inOrder(TreeNode node) {\n  if (node == null) return;\n  inOrder(node.left);\n  System.out.print(node.val + " ");\n  inOrder(node.right);\n}\n\npublic static void preOrder(TreeNode node) {\n  if (node == null) return;\n  System.out.print(node.val + " ");\n  preOrder(node.left);\n  preOrder(node.right);\n}`,
    pythonCode: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val; self.left = left; self.right = right\n\ndef in_order(node, res=None):\n    if res is None: res = []\n    if node:\n        in_order(node.left, res)\n        res.append(node.val)\n        in_order(node.right, res)\n    return res`,
    useCases: ['Sorted output from BST', 'Tree serialization', 'Delete tree', 'Expression tree evaluation'],
    visualizer: 'tree',
    complexityRows: [
      { label: 'Time', value: 'O(n)', note: 'Every node is visited exactly once' },
      { label: 'Space', value: 'O(h)', note: 'h = tree height. O(log n) balanced, O(n) skewed' },
    ],
  },
  {
    id: 'invert-binary-tree',
    name: 'Invert Binary Tree',
    category: 'trees',
    difficulty: 'beginner',
    icon: '🔄',
    tagline: 'Swap the left and right children of every node recursively',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(h)' },
    explanation: `Inverting a binary tree means swapping the left and right children of every node throughout the entire tree. The resulting tree is a mirror image of the original.\n\nThe recursive solution is elegant: swap the root's left and right children, then recursively invert each child subtree.`,
    keyInsight: 'The problem is perfectly self-similar — inverting a tree is just swapping two children and then solving the same problem on two smaller trees. Classic recursion.',
    steps: [
      'Base case: if the node is null, return null.',
      'Swap the left and right children of the current node.',
      'Recursively invert the left subtree.',
      'Recursively invert the right subtree.',
      'Return the (now inverted) node.',
    ],
    pseudocode: `invertTree(node):\n  if node == null: return null\n  swap(node.left, node.right)\n  invertTree(node.left)\n  invertTree(node.right)\n  return node`,
    javaCode: `public static TreeNode invertTree(TreeNode root) {\n  if (root == null) return null;\n  TreeNode temp = root.left;\n  root.left  = root.right;\n  root.right = temp;\n  invertTree(root.left);\n  invertTree(root.right);\n  return root;\n}`,
    pythonCode: `def invert_tree(root):\n    if not root: return None\n    root.left, root.right = root.right, root.left\n    invert_tree(root.left)\n    invert_tree(root.right)\n    return root`,
    useCases: ['Image/UI mirroring', 'Tree comparison problems', 'Classic recursion interview question'],
    visualizer: 'tree',
    complexityRows: [
      { label: 'Time', value: 'O(n)', note: 'Every node is visited and its children are swapped' },
      { label: 'Space', value: 'O(h)', note: 'Recursion stack depth is tree height' },
    ],
  },

  // ── ARRAYS ─────────────────────────────────────────────
  {
    id: 'two-sum',
    name: 'Two Sum',
    category: 'arrays',
    difficulty: 'beginner',
    icon: '➕',
    tagline: 'Find two numbers that add up to a target — three approaches',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(n)' },
    explanation: `Two Sum: given an array and a target, find two elements whose sum equals the target.\n\n**Brute Force O(n²)**: Try every pair (i, j). Simple but slow.\n**Two Pointers O(n)**: Sort the array. Use left/right pointers meeting in the middle.\n**Hash Map O(n)**: For each element, look up the complement (target − current) in a hash map. Single pass — the best approach.`,
    keyInsight: 'The Hash Map approach turns a search problem into a lookup problem. Instead of searching for the complement, we pre-store every element and look it up in O(1).',
    steps: [
      'For each element arr[i], compute complement = target − arr[i].',
      'Check if complement is already in the hash map.',
      'If yes → found the pair!',
      'If no → store arr[i] → i in the map and continue.',
    ],
    pseudocode: `twoSum(arr, target):\n  map = {}\n  for i from 0 to n-1:\n    complement = target - arr[i]\n    if complement in map:\n      return [map[complement], i]\n    map[arr[i]] = i\n  return []`,
    javaCode: `public static int[] twoSum(int[] input, int target) {\n  Map<Integer, Integer> map = new HashMap<>();\n  for (int i = 0; i < input.length; i++) {\n    int complement = target - input[i];\n    if (map.containsKey(complement))\n      return new int[]{map.get(complement), i};\n    map.put(input[i], i);\n  }\n  return new int[]{};\n}`,
    pythonCode: `def two_sum(nums, target):\n    seen = {}\n    for i, v in enumerate(nums):\n        if target - v in seen:\n            return [seen[target - v], i]\n        seen[v] = i\n    return []`,
    useCases: ['Foundation for 3Sum, 4Sum', 'Financial calculations', 'Classic interview warmup'],
    visualizer: 'array',
    defaultData: [2, 7, 11, 15],
    defaultTarget: 9,
    complexityRows: [
      { label: 'Brute Force', value: 'O(n²) / O(1)', note: 'Try all pairs — nested loops' },
      { label: 'Two Pointers', value: 'O(n log n) / O(1)', note: 'Sort + two-pointer scan' },
      { label: 'Hash Map ★', value: 'O(n) / O(n)', note: 'Single pass with O(1) lookup' },
    ],
  },
  {
    id: 'dutch-flag',
    name: 'Dutch National Flag',
    category: 'arrays',
    difficulty: 'intermediate',
    icon: '🇳🇱',
    tagline: 'Sort 0s, 1s, and 2s in one pass using three pointers',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    explanation: `The Dutch National Flag problem asks you to sort an array containing only 0, 1, 2 in-place in a single pass.\n\nThree pointers maintain three regions: [0..low−1] = all 0s (red), [low..mid−1] = all 1s (white), [high+1..n−1] = all 2s (blue), [mid..high] = unexplored. The mid pointer scans forward, making decisions at each step.`,
    keyInsight: 'Three pointers create three "buckets" simultaneously. The unexplored region between mid and high shrinks by 1 on every step — guaranteeing O(n) termination.',
    steps: [
      'Initialize: low = 0, mid = 0, high = n−1.',
      'While mid ≤ high: check arr[mid].',
      'arr[mid] == 0 → swap with low, advance low and mid.',
      'arr[mid] == 1 → already correct, advance mid only.',
      'arr[mid] == 2 → swap with high, retreat high (do NOT advance mid).',
    ],
    pseudocode: `dutchFlag(arr):\n  low = 0, mid = 0, high = n - 1\n  while mid <= high:\n    if arr[mid] == 0:   swap(low,mid); low++; mid++\n    elif arr[mid] == 1: mid++\n    else:               swap(mid,high); high--`,
    javaCode: `public static void sortColors(int[] arr) {\n  int low = 0, mid = 0, high = arr.length - 1;\n  while (mid <= high) {\n    if (arr[mid] == 0) { swap(arr, low++, mid++); }\n    else if (arr[mid] == 1) { mid++; }\n    else { swap(arr, mid, high--); }\n  }\n}`,
    pythonCode: `def sort_colors(arr):\n    low = mid = 0\n    high = len(arr) - 1\n    while mid <= high:\n        if arr[mid] == 0:\n            arr[low], arr[mid] = arr[mid], arr[low]\n            low += 1; mid += 1\n        elif arr[mid] == 1:\n            mid += 1\n        else:\n            arr[mid], arr[high] = arr[high], arr[mid]\n            high -= 1\n    return arr`,
    useCases: ['Sort 3 distinct values in one pass', '3-way partition in QuickSort', 'Partitioning data into three categories'],
    visualizer: 'array',
    defaultData: [2, 0, 2, 1, 1, 0],
    complexityRows: [
      { label: 'Time', value: 'O(n)', note: 'Single pass — mid advances on every step' },
      { label: 'Space', value: 'O(1)', note: 'In-place, only three pointer variables' },
    ],
  },

  // ── STRINGS ────────────────────────────────────────────
  {
    id: 'anagram',
    name: 'Anagram Check',
    category: 'strings',
    difficulty: 'beginner',
    icon: '🔡',
    tagline: 'Check if two strings contain the same characters in any order',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    explanation: `Two strings are anagrams if one can be rearranged to form the other. The optimal approach uses a character frequency count: increment for string1, decrement for string2. If all counts are zero, they are anagrams.\n\nThis runs in O(n) time and O(1) space (the frequency array has fixed size 26).`,
    keyInsight: 'Using a single frequency array (increment for string1, decrement for string2) eliminates the need to sort. If all frequencies are zero, both strings have identical character distributions.',
    steps: [
      'Check if lengths are equal — if not, return false immediately.',
      'Create a frequency array of size 26.',
      'For each character in string1: increment its count.',
      'For each character in string2: decrement its count.',
      'If any count is non-zero → NOT anagrams. Otherwise → anagrams.',
    ],
    pseudocode: `isAnagram(s1, s2):\n  if len(s1) != len(s2): return false\n  freq = [0] * 26\n  for c in s1: freq[c - 'a']++\n  for c in s2: freq[c - 'a']--\n  return all(freq[i] == 0)`,
    javaCode: `public static boolean isAnagram(String s1, String s2) {\n  if (s1.length() != s2.length()) return false;\n  int[] freq = new int[26];\n  for (char c : s1.toCharArray()) freq[c - 'a']++;\n  for (char c : s2.toCharArray()) freq[c - 'a']--;\n  for (int count : freq) if (count != 0) return false;\n  return true;\n}`,
    pythonCode: `from collections import Counter\ndef is_anagram(s1, s2):\n    return Counter(s1) == Counter(s2)`,
    useCases: ['Spell checking', 'Word scramble games', 'Grouping words by anagram families'],
    visualizer: 'array',
    defaultData: [108, 105, 115, 116, 101, 110],
    complexityRows: [
      { label: 'Time', value: 'O(n)', note: 'Two passes over the strings' },
      { label: 'Space', value: 'O(1)', note: 'Frequency array of fixed size 26' },
    ],
  },
  {
    id: 'palindrome',
    name: 'Palindrome Check',
    category: 'strings',
    difficulty: 'beginner',
    icon: '🪞',
    tagline: 'Check if a string reads the same forwards and backwards',
    complexity: { time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    explanation: `A palindrome reads the same forward and backward — "racecar", "madam", "level". The two-pointer approach is most efficient: compare characters from both ends, stopping on the first mismatch.`,
    keyInsight: 'Two pointers starting from opposite ends — if they always agree as they meet in the middle, the string is a palindrome. Short-circuit on the first mismatch.',
    steps: [
      'Set left = 0, right = length − 1.',
      'While left < right: compare str[left] and str[right].',
      'If they differ → NOT a palindrome.',
      'If they match → advance left, retreat right.',
      'All pairs matched → IS a palindrome.',
    ],
    pseudocode: `isPalindrome(s):\n  left = 0, right = len(s) - 1\n  while left < right:\n    if s[left] != s[right]: return false\n    left++, right--\n  return true`,
    javaCode: `public static boolean isPalindrome(String s) {\n  int left = 0, right = s.length() - 1;\n  while (left < right) {\n    if (s.charAt(left) != s.charAt(right)) return false;\n    left++; right--;\n  }\n  return true;\n}`,
    pythonCode: `def is_palindrome(s):\n    return s == s[::-1]`,
    useCases: ['Input validation', 'DNA palindrome sequences', 'Number palindromes', 'Classic interview question'],
    visualizer: 'array',
    defaultData: [114, 97, 99, 101, 99, 97, 114],
    complexityRows: [
      { label: 'Best case', value: 'O(1)', note: 'First and last characters differ' },
      { label: 'Average / Worst', value: 'O(n)', note: 'Must compare up to n/2 pairs' },
      { label: 'Space', value: 'O(1)', note: 'Only two pointer variables' },
    ],
  },

  // ── MATH ───────────────────────────────────────────────
  {
    id: 'prime-numbers',
    name: 'Prime Numbers',
    category: 'math',
    difficulty: 'beginner',
    icon: '🔢',
    tagline: 'Check primality with trial division — and the √n optimization trick',
    complexity: { time: { best: 'O(√n)', avg: 'O(n√n)', worst: 'O(n√n)' }, space: 'O(1)' },
    explanation: `A prime number is a natural number > 1 with no divisors other than 1 and itself.\n\n**Classic O(n)**: Check every divisor from 2 to n−1. Correct but slow.\n**√n Trick O(√n)**: If n has a factor f > √n, then n/f < √n is also a factor. So we only need to check up to √n. Additionally, skip all even numbers after checking 2 — halves the work again.`,
    keyInsight: 'If n = a × b and a > √n, then b = n/a < √n. So every composite number has a factor ≤ √n. We never need to look further.',
    steps: [
      'Handle edge cases: n ≤ 1 → not prime. n == 2 → prime.',
      'If n is even (n % 2 == 0) → not prime.',
      'Check odd divisors from 3 up to √n, stepping by 2.',
      'If any divisor evenly divides n → composite.',
      'If no divisor found → prime.',
    ],
    pseudocode: `isPrime(n):\n  if n <= 1: return false\n  if n == 2: return true\n  if n % 2 == 0: return false\n  i = 3\n  while i * i <= n:\n    if n % i == 0: return false\n    i += 2\n  return true`,
    javaCode: `public static boolean isPrimeOptimized(int number) {\n  if (number <= 1) return false;\n  if (number == 2) return true;\n  if (number % 2 == 0) return false;\n  for (int i = 3; i <= Math.sqrt(number); i += 2) {\n    if (number % i == 0) return false;\n  }\n  return true;\n}`,
    pythonCode: `import math\ndef is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(math.sqrt(n)) + 1):\n        if n % i == 0: return False\n    return True`,
    useCases: ['Cryptography (RSA key generation)', 'Hash table sizing', 'Number theory problems'],
    visualizer: 'array',
    complexityRows: [
      { label: 'Classic (isPrime)', value: 'O(n) per number', note: 'Checks all divisors from 2 to n−1' },
      { label: 'Optimized (√n trick)', value: 'O(√n) per number', note: 'Only check up to √n, skip evens' },
      { label: 'Sieve of Eratosthenes', value: 'O(n log log n)', note: 'Better when generating ALL primes up to N' },
    ],
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    category: 'math',
    difficulty: 'beginner',
    icon: '🌀',
    tagline: 'Three approaches: recursive O(2ⁿ) → iterative O(n) → memoized O(n)',
    complexity: { time: { best: 'O(n)', avg: 'O(n)', worst: 'O(2ⁿ)' }, space: 'O(1)' },
    explanation: `Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21... where F(n) = F(n−1) + F(n−2).\n\n**Recursion O(2ⁿ)**: Elegant but F(3) is computed twice, F(2) three times — exponential blowup.\n**Iterative O(n) / O(1)**: Two variables track the previous two values. No recursion.\n**Memoization O(n) / O(n)**: Same recursive structure but cache results — each sub-problem solved once.`,
    keyInsight: 'The recursive tree shows why O(2ⁿ) is so bad: F(40) requires ~2.2 billion calls! Memoization caches each unique F(n) — reducing it to exactly n calls.',
    steps: [
      'RECURSIVE: F(n) = F(n-1) + F(n-2). Base case: F(1) = F(2) = 1.',
      'ITERATIVE: Start with fib1=1, fib2=1. Each step: next = fib1 + fib2, slide the window.',
      'MEMOIZED: Before computing F(n), check the cache. Store result before returning.',
    ],
    pseudocode: `fibonacci(n):  // Iterative — best for interviews\n  if n <= 2: return 1\n  fib1 = 1, fib2 = 1\n  for i from 3 to n:\n    next = fib1 + fib2\n    fib1 = fib2; fib2 = next\n  return fib2`,
    javaCode: `// Iterative — O(n) time, O(1) space ★\npublic static int fibonacci(int n) {\n  if (n <= 2) return 1;\n  int fib1 = 1, fib2 = 1, result = 1;\n  for (int i = 3; i <= n; i++) {\n    result = fib1 + fib2;\n    fib1 = fib2;\n    fib2 = result;\n  }\n  return result;\n}`,
    pythonCode: `def fib(n):\n    a, b = 1, 1\n    for _ in range(n-2): a, b = b, a+b\n    return b`,
    useCases: ['Dynamic programming introduction', 'Growth modeling in biology', 'Algorithm complexity analysis'],
    visualizer: 'array',
    complexityRows: [
      { label: 'Recursive', value: 'O(2ⁿ) / O(n)', note: 'Exponential — impractical for n > 40' },
      { label: 'Iterative ★', value: 'O(n) / O(1)', note: 'Best for interviews — minimal memory' },
      { label: 'Memoized', value: 'O(n) / O(n)', note: 'Great when querying F(n) many times' },
    ],
  },

  // ── MATRIX ─────────────────────────────────────────────
  {
    id: 'find-in-2d-matrix',
    name: 'Search in 2D Matrix',
    category: 'matrix',
    difficulty: 'intermediate',
    icon: '🔢',
    tagline: 'Staircase search eliminates a full row or column in each step — O(m+n)',
    complexity: { time: { best: 'O(1)', avg: 'O(m+n)', worst: 'O(m+n)' }, space: 'O(1)' },
    explanation: `Given an m×n matrix where each row and column is sorted, find if a target value exists. Naive: O(m×n). The staircase search starts at the top-right corner and eliminates a full row or column at each step.`,
    keyInsight: 'Starting from the top-right corner: every element to the left is smaller, every element below is larger. This enables binary-search-like elimination.',
    steps: [
      'Start at top-right corner: row=0, col=n-1.',
      'If matrix[row][col] == target → found!',
      'If matrix[row][col] > target → move left (col--).',
      'If matrix[row][col] < target → move down (row++).',
      'If row or col goes out of bounds → not found.',
    ],
    pseudocode: `searchMatrix(matrix, target):\n  row = 0, col = n - 1\n  while row < m and col >= 0:\n    if matrix[row][col] == target: return true\n    if matrix[row][col] > target:  col--\n    else:                          row++\n  return false`,
    javaCode: `public static boolean searchMatrix(int[][] matrix, int target) {\n  int row = 0, col = matrix[0].length - 1;\n  while (row < matrix.length && col >= 0) {\n    if (matrix[row][col] == target) return true;\n    if (matrix[row][col] > target) col--;\n    else                           row++;\n  }\n  return false;\n}`,
    pythonCode: `def search_matrix(mat, target):\n    r, c = 0, len(mat[0])-1\n    while r < len(mat) and c >= 0:\n        if mat[r][c] == target: return True\n        if mat[r][c] > target: c -= 1\n        else: r += 1\n    return False`,
    useCases: ['Database 2D range queries', 'Image processing', 'Spreadsheet search'],
    visualizer: 'array',
    complexityRows: [
      { label: 'Time', value: 'O(m + n)', note: 'Each step eliminates one row or column' },
      { label: 'Space', value: 'O(1)', note: 'Only two pointer variables' },
    ],
  },

  // ── LINKED LIST ────────────────────────────────────────
  {
    id: 'singly-linked-list',
    name: 'Singly Linked List',
    category: 'linkedlist',
    difficulty: 'beginner',
    icon: '🔗',
    tagline: 'A chain of nodes where each node points to the next',
    complexity: { time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(n)' },
    explanation: `A Singly Linked List is a linear data structure where each node contains a value and a pointer to the next node. Unlike arrays, nodes are not contiguous in memory.\n\nPrepend is O(1) — just update the head pointer. Append and search are O(n) — must traverse from head. Linked lists excel when frequent insertions at the front are needed.`,
    keyInsight: 'The power of a linked list is that insertion/deletion at the head is O(1) — no shifting required. But random access is O(n) because you must traverse from the head.',
    steps: [
      'HEAD pointer stores reference to the first node.',
      'PREPEND: Create new node, set next = head, update head = new node. O(1).',
      'APPEND: Traverse to last node, set its next = new node. O(n).',
      'DELETE: Find the node before target, set its next = target.next. O(n).',
    ],
    pseudocode: `prepend(value):\n  node = new Node(value)\n  node.next = head\n  head = node\n\nappend(value):\n  node = new Node(value)\n  curr = head\n  while curr.next != null: curr = curr.next\n  curr.next = node`,
    javaCode: `public void prepend(int value) {\n  Node newNode = new Node(value);\n  newNode.next = head;\n  head = newNode;\n}\n\npublic void append(int value) {\n  Node newNode = new Node(value);\n  if (head == null) { head = newNode; return; }\n  Node curr = head;\n  while (curr.next != null) curr = curr.next;\n  curr.next = newNode;\n}`,
    pythonCode: `class Node:\n    def __init__(self, v, n=None): self.val=v; self.next=n\n\ndef prepend(head, val):\n    return Node(val, head)`,
    useCases: ['Implementing stacks and queues', 'Browser history', 'Undo/redo functionality', 'Music playlist'],
    visualizer: 'array',
    complexityRows: [
      { label: 'Prepend', value: 'O(1)', note: 'Only head pointer is updated' },
      { label: 'Append', value: 'O(n)', note: 'Must traverse to find the tail' },
      { label: 'Search', value: 'O(n)', note: 'Linear scan from head to target' },
      { label: 'Space', value: 'O(n)', note: 'One node object per stored element' },
    ],
  },
];

export function getAlgorithmById(id: string): Algorithm | undefined {
  return ALGORITHMS.find(a => a.id === id);
}

export function getAlgorithmsByCategory(cat: string): Algorithm[] {
  if (cat === 'all') return ALGORITHMS;
  return ALGORITHMS.filter(a => a.category === cat);
}
