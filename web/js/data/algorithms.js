/* algorithms.js — AlgoVerse algorithm content database
   All content is derived from the Java source files in src/com/dnex/algorithm/
*/

const ALGORITHMS = [

  /* ══════════════════════════════════════════
     SORTING
  ══════════════════════════════════════════ */
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'beginner',
    icon: '🫧',
    tagline: 'Repeatedly swap adjacent elements that are in the wrong order',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on2' },
    explanation: `Bubble Sort is the simplest sorting algorithm. It works by scanning the array from left to right and swapping any two adjacent elements that are out of order. After one full scan (called a "pass"), the largest element has "bubbled up" to the end of the array.

We repeat this process, but each time we can skip the last position because it's already in its final place. We need at most n−1 passes to fully sort n elements.`,
    keyInsight: 'After every pass, the next largest unsorted element settles into its correct position at the end — so each pass gets one position shorter.',
    steps: [
      'Compare element at index 0 with element at index 1. Swap if out of order.',
      'Move one position right and compare the next pair. Swap if needed.',
      'Continue until the end of the unsorted section — the largest element is now in place.',
      'Repeat from the beginning, but stop one position earlier each time.',
      'After n−1 passes the array is fully sorted.',
    ],
    pseudocode: `for i from 0 to n-2:
  for j from 1 to n-1-i:
    if arr[j-1] > arr[j]:
      swap(arr[j-1], arr[j])`,
    javaCode: `public static void bubbleSort(int[] arr) {
  for (int i = 0; i < arr.length - 1; i++) {
    // Each pass bubbles the max of unsorted portion to the end
    for (int j = 1; j < arr.length - i; j++) {
      if (arr[j-1] > arr[j]) {
        // Swap adjacent elements
        int temp = arr[j];
        arr[j] = arr[j-1];
        arr[j-1] = temp;
      }
    }
  }
}`,
    useCases: ['Educational / learning sorting basics', 'Nearly-sorted data (optimised variant)', 'Very small arrays (< 10 elements)'],
    visualizer: 'sorting',
    defaultData: [38, 27, 43, 3, 9, 82, 10],
    complexityRows: [
      ['Best case', 'O(n)', 'Array already sorted — no swaps needed'],
      ['Average case', 'O(n²)', 'Random order — roughly n²/2 comparisons'],
      ['Worst case', 'O(n²)', 'Array is reverse sorted — max comparisons and swaps'],
      ['Space', 'O(1)', 'Sorts in-place, no extra array needed'],
    ],
  },

  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    difficulty: 'beginner',
    icon: '🎯',
    tagline: 'Find the minimum element and place it at the front, repeat',
    complexity: {
      time: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on2' },
    explanation: `Selection Sort divides the array into two parts: a sorted section at the front and an unsorted section at the back. On each iteration it scans the entire unsorted section to find the minimum element, then swaps that minimum to the first position of the unsorted section.

Unlike Bubble Sort, Selection Sort makes at most n−1 swaps total, which makes it useful when swap cost is high (e.g., writing to flash storage).`,
    keyInsight: 'Selection Sort always makes exactly n−1 swaps — compare this to Bubble Sort which can make O(n²) swaps in the worst case.',
    steps: [
      'Find the minimum element in the entire array.',
      'Swap it with the element at index 0 — the sorted section now has 1 element.',
      'Find the minimum in arr[1..n-1]. Swap it to index 1.',
      'Repeat: grow the sorted section by 1 each time.',
      'After n−1 iterations the whole array is sorted.',
    ],
    pseudocode: `for i from 0 to n-2:
  minIdx = i
  for j from i+1 to n-1:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
    javaCode: `public static void selectionSort(int[] arr) {
  for (int i = 0; i < arr.length - 1; i++) {
    int minIndex = i;
    // Find index of minimum in unsorted section
    for (int j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    // Swap minimum to front of unsorted section
    int temp = arr[minIndex];
    arr[minIndex] = arr[i];
    arr[i] = temp;
  }
}`,
    useCases: ['When write operations are expensive (minimises swaps)', 'Small arrays', 'Embedded systems with limited write cycles'],
    visualizer: 'sorting',
    defaultData: [64, 25, 12, 22, 11],
    complexityRows: [
      ['Best case', 'O(n²)', 'No early exit — always scans the full unsorted section'],
      ['Average case', 'O(n²)', '~n²/2 comparisons regardless of input order'],
      ['Worst case', 'O(n²)', 'Same as best — no adaptive behaviour'],
      ['Space', 'O(1)', 'In-place, constant extra memory'],
    ],
  },

  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    icon: '🔀',
    tagline: 'Divide the array in half, sort each half, then merge them back',
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
    },
    complexityClass: { avg: 'onlogn' },
    explanation: `Merge Sort uses the Divide & Conquer strategy. It recursively splits the array into two halves until each half has only one element (which is trivially sorted), then merges adjacent pairs of sorted halves into a larger sorted array.

The merge step is where the work happens: two sorted sub-arrays are compared element-by-element and assembled into a single sorted array. This merge always runs in O(n) time, and there are O(log n) levels of recursion, giving the famous O(n log n) complexity.`,
    keyInsight: 'Merging two sorted arrays is O(n) — far cheaper than sorting from scratch. Merge Sort exploits this by recursively creating sorted sub-arrays, then merging upward.',
    steps: [
      'Split the array into two equal halves.',
      'Recursively sort the left half.',
      'Recursively sort the right half.',
      'Merge the two sorted halves: compare front elements, always pick the smaller one.',
      'The merged result is the fully sorted array.',
    ],
    pseudocode: `mergeSort(arr):
  if len(arr) <= 1: return arr
  mid = len(arr) / 2
  left  = mergeSort(arr[0..mid])
  right = mergeSort(arr[mid..n])
  return merge(left, right)

merge(L, R):
  result = []
  while L and R not empty:
    if L[0] <= R[0]: append L.pop(0)
    else:            append R.pop(0)
  append remaining L or R`,
    javaCode: `public static void mergeSort(int[] arr, int left, int right) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);       // sort left half
    mergeSort(arr, mid + 1, right);  // sort right half
    merge(arr, left, mid, right);    // merge sorted halves
  }
}

private static void merge(int[] arr, int l, int m, int r) {
  int[] temp = new int[r - l + 1];
  int i = l, j = m + 1, k = 0;
  while (i <= m && j <= r)
    temp[k++] = arr[i] <= arr[j] ? arr[i++] : arr[j++];
  while (i <= m)  temp[k++] = arr[i++];
  while (j <= r)  temp[k++] = arr[j++];
  System.arraycopy(temp, 0, arr, l, temp.length);
}`,
    useCases: ['Large datasets', 'Linked lists (no random access needed)', 'External sorting (data on disk)', 'Stable sort required'],
    visualizer: 'sorting',
    defaultData: [38, 27, 43, 3, 9, 82, 10],
    complexityRows: [
      ['Best case', 'O(n log n)', 'Divide is always log n levels; merge is always O(n)'],
      ['Average case', 'O(n log n)', 'Consistent regardless of input'],
      ['Worst case', 'O(n log n)', 'No degradation — guaranteed O(n log n)'],
      ['Space', 'O(n)', 'Needs a temporary array of size n for merging'],
    ],
  },

  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    icon: '⚡',
    tagline: 'Pick a pivot, partition the array around it, recurse on both sides',
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
      space: 'O(log n)',
    },
    complexityClass: { avg: 'onlogn' },
    explanation: `Quick Sort picks a "pivot" element and rearranges the array so everything smaller than the pivot moves to its left and everything larger moves to its right. The pivot is now in its final sorted position. Quick Sort then recursively sorts the left and right sub-arrays.

In practice Quick Sort is usually faster than Merge Sort because it has better cache locality and requires no auxiliary array. The classic weakness is its O(n²) worst case when the pivot is always the smallest or largest element (e.g., on an already-sorted array). This is avoided by using a random or median-of-three pivot strategy.`,
    keyInsight: 'The partition step puts the pivot in its exact final position in O(n). If we consistently pick a good pivot, each recursive call halves the problem — giving O(n log n) total.',
    steps: [
      'Choose a pivot element (last element in the classic version).',
      'Partition: scan from left. Move elements ≤ pivot to the left side, elements > pivot to the right.',
      'Swap the pivot into its correct final position.',
      'Recursively apply Quick Sort to the left sub-array (elements < pivot).',
      'Recursively apply Quick Sort to the right sub-array (elements > pivot).',
    ],
    pseudocode: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)

partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j from low to high-1:
    if arr[j] <= pivot:
      i++; swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i + 1`,
    javaCode: `public static void quickSort(int[] arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

private static int partition(int[] arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
  }
  int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;
  return i + 1;
}`,
    useCases: ['General-purpose in-memory sorting', 'When average-case performance matters', 'Arrays (better cache performance than Merge Sort)', 'System library sort implementations'],
    visualizer: 'sorting',
    defaultData: [10, 80, 30, 90, 40, 50, 70],
    complexityRows: [
      ['Best case', 'O(n log n)', 'Pivot splits array perfectly in half each time'],
      ['Average case', 'O(n log n)', 'Expected for random pivot on random input'],
      ['Worst case', 'O(n²)', 'Pivot is always min or max — one side always empty'],
      ['Space', 'O(log n)', 'In-place, but recursion stack uses O(log n) frames'],
    ],
  },

  /* ══════════════════════════════════════════
     SEARCHING
  ══════════════════════════════════════════ */
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    difficulty: 'beginner',
    icon: '👁️',
    tagline: 'Scan every element from left to right until you find the target',
    complexity: {
      time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Linear Search is the most straightforward search algorithm. It iterates through every element of the array one by one from the beginning, comparing each element to the target value. If a match is found, the index is returned. If the end of the array is reached without a match, -1 is returned.

Linear Search works on any array, sorted or unsorted. Its simplicity makes it the go-to choice for small or unordered datasets where more complex algorithms would add unnecessary overhead.`,
    keyInsight: 'No setup required — Linear Search works on any array regardless of order. But it examines every element in the worst case, making it slow for large datasets.',
    steps: [
      'Start at index 0.',
      'Compare the current element to the target.',
      'If they match, return the current index — done!',
      'If no match, move to the next index.',
      'If you reach the end without a match, return -1.',
    ],
    pseudocode: `linearSearch(arr, target):
  for i from 0 to n-1:
    if arr[i] == target:
      return i
  return -1`,
    javaCode: `public static int linearSearch(int[] arr, int target) {
  for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
      return i;   // Found — return index
    }
  }
  return -1;      // Not found
}`,
    useCases: ['Unsorted arrays', 'Small arrays (< 50 elements)', 'One-time searches (not worth sorting first)', 'Linked lists (no random access)'],
    visualizer: 'search',
    defaultData: [4, 2, 7, 1, 9, 3, 8, 5],
    defaultTarget: 9,
    complexityRows: [
      ['Best case', 'O(1)', 'Target is the first element'],
      ['Average case', 'O(n)', 'Target is somewhere in the middle on average'],
      ['Worst case', 'O(n)', 'Target is last element or not present'],
      ['Space', 'O(1)', 'No extra data structures needed'],
    ],
  },

  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    difficulty: 'beginner',
    icon: '🎯',
    tagline: 'Halve the search space each step — requires a sorted array',
    complexity: {
      time: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'ologn' },
    explanation: `Binary Search exploits the sorted order of an array to dramatically reduce the number of comparisons. It maintains a search window [low, high] and checks the middle element each time. If the middle element equals the target, we're done. If the target is smaller, we discard the right half; if larger, we discard the left half. Each step halves the search space.

For an array of 1,000,000 elements, Binary Search finds the target in at most 20 comparisons (log₂ 1,000,000 ≈ 20), versus up to 1,000,000 comparisons for Linear Search.`,
    keyInsight: 'Each comparison eliminates half the remaining elements. After k steps, you've ruled out 2^k elements. That's why it's O(log n) — doubling the array only adds ONE extra step.',
    steps: [
      'Set low = 0, high = n−1.',
      'Compute mid = low + (high − low) / 2 (avoids integer overflow).',
      'If arr[mid] == target → found! Return mid.',
      'If arr[mid] < target → target must be in the right half, set low = mid + 1.',
      'If arr[mid] > target → target must be in the left half, set high = mid − 1.',
      'Repeat until low > high (not found) → return −1.',
    ],
    pseudocode: `binarySearch(arr, target):
  low = 0, high = n - 1
  while low <= high:
    mid = low + (high - low) / 2
    if arr[mid] == target: return mid
    if arr[mid] < target:  low = mid + 1
    else:                  high = mid - 1
  return -1`,
    javaCode: `public static int binarySearch(int key, int[] data) {
  int low = 0;
  int high = data.length - 1;

  while (low <= high) {
    // Avoids potential Integer overflow vs (low + high) / 2
    int mid = low + (high - low) / 2;

    if (data[mid] == key)  return mid;    // found
    if (data[mid] < key)   low = mid + 1; // search right
    else                   high = mid - 1;// search left
  }
  return -1; // not found
}`,
    useCases: ['Sorted arrays', 'Dictionary / phonebook lookups', 'Finding insertion point', 'Database index lookups', 'Debugging: bisect-search for the first failing version'],
    visualizer: 'search',
    defaultData: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    defaultTarget: 13,
    complexityRows: [
      ['Best case', 'O(1)', 'Target is exactly at the midpoint on first probe'],
      ['Average case', 'O(log n)', '~log₂ n comparisons on random input'],
      ['Worst case', 'O(log n)', 'Target not present or at far end — full log n iterations'],
      ['Space (iterative)', 'O(1)', 'Only low, high, mid variables'],
      ['Space (recursive)', 'O(log n)', 'Recursion call stack depth is log n'],
    ],
  },

  /* ══════════════════════════════════════════
     GRAPH
  ══════════════════════════════════════════ */
  {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    category: 'graph',
    difficulty: 'advanced',
    icon: '🗺️',
    tagline: 'Greedily expand the nearest unvisited node to find shortest paths from a source',
    complexity: {
      time: { best: 'O((V+E) log V)', avg: 'O((V+E) log V)', worst: 'O((V+E) log V)' },
      space: 'O(V+E)',
    },
    complexityClass: { avg: 'velog' },
    explanation: `Dijkstra's algorithm solves the Single-Source Shortest Path (SSSP) problem: given a weighted graph and a starting node, find the shortest distance to every other node.

It uses a min-heap (priority queue) to always process the nearest unvisited node. For that node, it "relaxes" all outgoing edges — if going through the current node makes a neighbor cheaper to reach, we update that neighbor's distance and add it to the priority queue.

The algorithm terminates when all reachable nodes have been processed. All edge weights must be non-negative (use Bellman-Ford for negative weights).`,
    keyInsight: 'The greedy property: once a node is polled from the min-heap, its distance is finalized forever. We never need to revisit it — because no future path can be shorter (all weights ≥ 0).',
    steps: [
      'Initialize all distances to ∞, except the source which is 0.',
      'Add the source node to a min-heap with distance 0.',
      'Poll the node with the smallest distance from the heap.',
      'For each neighbor, check if going through the current node is cheaper (relaxation).',
      'If cheaper, update the neighbor\'s distance and push it to the heap.',
      'Repeat until the heap is empty — all shortest paths are found.',
    ],
    pseudocode: `dijkstra(graph, source):
  dist[source] = 0, all others = ∞
  minHeap = [(0, source)]

  while minHeap not empty:
    (d, u) = poll minHeap
    if d > dist[u]: skip (stale entry)
    for each edge (u → v, weight w):
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
        push (dist[v], v) to minHeap`,
    javaCode: `public static void dijkstra(List<List<Edge>> graph, int src) {
  int n = graph.size();
  int[] dist = new int[n];
  Arrays.fill(dist, Integer.MAX_VALUE);
  dist[src] = 0;

  // Min-heap: [distance, node]
  PriorityQueue<int[]> pq = new PriorityQueue<>(
    Comparator.comparingInt(a -> a[0])
  );
  pq.offer(new int[]{0, src});

  while (!pq.isEmpty()) {
    int[] curr = pq.poll();
    int d = curr[0], u = curr[1];

    if (d > dist[u]) continue; // stale entry

    for (Edge e : graph.get(u)) {
      int newDist = dist[u] + e.weight;
      if (newDist < dist[e.targetNode]) {
        dist[e.targetNode] = newDist;
        pq.offer(new int[]{newDist, e.targetNode});
      }
    }
  }
}`,
    useCases: ['GPS navigation & maps', 'Network routing protocols (OSPF)', 'Game AI pathfinding', 'Flight/travel itinerary planning'],
    visualizer: 'graph',
    complexityRows: [
      ['Time', 'O((V+E) log V)', 'Each vertex is polled once; each edge may push to heap'],
      ['Space', 'O(V + E)', 'Distance array (V) + adjacency list (E) + heap (V)'],
      ['Limitation', 'Non-negative weights only', 'Use Bellman-Ford if negative edge weights exist'],
    ],
  },

  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    category: 'graph',
    difficulty: 'intermediate',
    icon: '🌊',
    tagline: 'Explore all neighbors at the current depth before going deeper',
    complexity: {
      time: { best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)' },
      space: 'O(V)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Breadth-First Search explores a graph level by level. Starting from a source node, it first visits all direct neighbors (distance 1), then all nodes at distance 2, then distance 3, and so on. A queue is used to track the next nodes to explore.

BFS guarantees the shortest path in an unweighted graph — the first time BFS reaches a node is via the shortest path. Your codebase uses BFS to find the shortest flight connection between airports.`,
    keyInsight: 'BFS discovers nodes in order of their distance from the source. When BFS first reaches a target, it has found the shortest (fewest-hops) path.',
    steps: [
      'Enqueue the source node and mark it visited.',
      'Dequeue a node. Process it.',
      'Enqueue all of its unvisited neighbors and mark them visited.',
      'Repeat from step 2 until the queue is empty or target is found.',
    ],
    pseudocode: `BFS(graph, source):
  queue = [source]
  visited = {source}
  while queue not empty:
    u = queue.dequeue()
    for each neighbor v of u:
      if v not in visited:
        visited.add(v)
        queue.enqueue(v)`,
    javaCode: `public static int shortestPath(Map<String,List<String>> graph,
                                    String src, String dst) {
  Queue<String> queue = new LinkedList<>();
  Set<String> visited  = new HashSet<>();
  queue.add(src);
  visited.add(src);
  int hops = 0;

  while (!queue.isEmpty()) {
    int size = queue.size();
    for (int i = 0; i < size; i++) {
      String curr = queue.poll();
      if (curr.equals(dst)) return hops;
      for (String neighbor : graph.getOrDefault(curr, List.of())) {
        if (!visited.contains(neighbor)) {
          visited.add(neighbor);
          queue.add(neighbor);
        }
      }
    }
    hops++;
  }
  return -1; // unreachable
}`,
    useCases: ['Shortest path in unweighted graphs', 'Social network friend suggestions', 'Web crawler', 'Finding connected components', 'Airport/transit routing'],
    visualizer: 'graph',
    complexityRows: [
      ['Time', 'O(V + E)', 'Every vertex and edge visited exactly once'],
      ['Space', 'O(V)', 'Queue can hold up to V nodes; visited set size V'],
    ],
  },

  /* ══════════════════════════════════════════
     TREES
  ══════════════════════════════════════════ */
  {
    id: 'bst-traversal',
    name: 'BST Traversal',
    category: 'trees',
    difficulty: 'intermediate',
    icon: '🌲',
    tagline: 'Visit every node in a Binary Search Tree using In/Pre/Post-Order',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
    },
    complexityClass: { avg: 'on' },
    explanation: `A Binary Search Tree (BST) stores values such that for every node: all values in its left subtree are smaller, and all values in its right subtree are larger. Tree traversal means visiting every node exactly once.

Three classic orders exist:
• **In-Order (Left → Root → Right)**: Visits nodes in ascending sorted order — great for printing BST values sorted.
• **Pre-Order (Root → Left → Right)**: Root first — useful for copying or serializing a tree.
• **Post-Order (Left → Right → Root)**: Root last — useful for deleting a tree or computing directory sizes.`,
    keyInsight: 'In-Order traversal of a BST always produces a sorted sequence — this is why BST lookup is so efficient: it exploits the left < root < right invariant at every node.',
    steps: [
      'IN-ORDER: Recursively traverse the left subtree, then visit the root, then the right subtree.',
      'PRE-ORDER: Visit the root first, then recursively traverse left, then right.',
      'POST-ORDER: Recursively traverse left, then right, then visit the root last.',
    ],
    pseudocode: `inOrder(node):
  if node is null: return
  inOrder(node.left)
  print(node.value)
  inOrder(node.right)

preOrder(node):
  if node is null: return
  print(node.value)
  preOrder(node.left)
  preOrder(node.right)`,
    javaCode: `// In-Order: Left → Root → Right  (gives sorted output)
public static void inOrder(TreeNode node) {
  if (node == null) return;
  inOrder(node.left);
  System.out.print(node.val + " ");
  inOrder(node.right);
}

// Pre-Order: Root → Left → Right
public static void preOrder(TreeNode node) {
  if (node == null) return;
  System.out.print(node.val + " ");
  preOrder(node.left);
  preOrder(node.right);
}

// Post-Order: Left → Right → Root
public static void postOrder(TreeNode node) {
  if (node == null) return;
  postOrder(node.left);
  postOrder(node.right);
  System.out.print(node.val + " ");
}`,
    useCases: ['In-Order: sorted output from BST', 'Pre-Order: tree serialization / copy', 'Post-Order: delete tree, compute folder sizes', 'Expression tree evaluation'],
    visualizer: 'tree',
    complexityRows: [
      ['Time', 'O(n)', 'Every node is visited exactly once'],
      ['Space', 'O(h)', 'h = tree height; recursion stack depth. O(log n) balanced, O(n) skewed'],
    ],
  },

  {
    id: 'invert-binary-tree',
    name: 'Invert Binary Tree',
    category: 'trees',
    difficulty: 'beginner',
    icon: '🔄',
    tagline: 'Swap the left and right children of every node recursively',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Inverting a binary tree (also called mirroring) means swapping the left and right children of every node throughout the entire tree. The resulting tree is a mirror image of the original.

The recursive solution is elegant: to invert a tree, swap the root's left and right children, then recursively invert each child subtree. The base case is a null node.`,
    keyInsight: 'The problem is perfectly self-similar — inverting a tree is just swapping two children and then solving the same problem on two smaller trees. Classic recursion.',
    steps: [
      'Base case: if the node is null, return null.',
      'Swap the left and right children of the current node.',
      'Recursively invert the left subtree.',
      'Recursively invert the right subtree.',
      'Return the (now inverted) node.',
    ],
    pseudocode: `invertTree(node):
  if node == null: return null
  swap(node.left, node.right)
  invertTree(node.left)
  invertTree(node.right)
  return node`,
    javaCode: `public static TreeNode invertTree(TreeNode root) {
  if (root == null) return null;

  // Swap left and right children
  TreeNode temp = root.left;
  root.left  = root.right;
  root.right = temp;

  // Recursively invert each subtree
  invertTree(root.left);
  invertTree(root.right);

  return root;
}`,
    useCases: ['Image/UI mirroring', 'Tree comparison problems', 'Classic recursion interview question'],
    visualizer: 'tree',
    complexityRows: [
      ['Time', 'O(n)', 'Every node is visited and its children are swapped — n operations'],
      ['Space', 'O(h)', 'h is the height: O(log n) balanced, O(n) worst (linked list)'],
    ],
  },

  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'trees',
    difficulty: 'intermediate',
    icon: '🗂️',
    tagline: 'A tree where each path from root to leaf spells out a word',
    complexity: {
      time: { best: 'O(L)', avg: 'O(L)', worst: 'O(L)' },
      space: 'O(ALPHABET × N × L)',
    },
    complexityClass: { avg: 'on' },
    explanation: `A Trie (pronounced "try") is a special tree structure where each node represents a single character. A path from the root to a leaf spells out a word stored in the trie. Tries are also called Prefix Trees because they efficiently group words by shared prefixes.

For example, "cat", "car", "card", "care" would share the path c→a→r. Each node has up to 26 children (for lowercase English letters). A boolean flag marks nodes where a complete word ends.

Operations insert, search, and startsWith all run in O(L) time where L is the length of the word — independent of how many words are stored!`,
    keyInsight: 'Tries share prefixes between words, making them extremely memory-efficient for dictionaries and prefix queries. Finding all words with a given prefix is instant.',
    steps: [
      'INSERT: Start at root. For each character in the word, follow or create the corresponding child node. Mark the last node as end-of-word.',
      'SEARCH: Follow child nodes character by character. If any character is missing, the word is not in the trie. If all characters found and end-of-word is set, return true.',
      'STARTS WITH: Same as search but don\'t require end-of-word flag — just the prefix path must exist.',
    ],
    pseudocode: `insert(word):
  node = root
  for char in word:
    if char not in node.children:
      node.children[char] = new TrieNode()
    node = node.children[char]
  node.isEnd = true

search(word):
  node = root
  for char in word:
    if char not in node.children: return false
    node = node.children[char]
  return node.isEnd`,
    javaCode: `class TrieNode {
  Map<Character, TrieNode> children = new HashMap<>();
  boolean isEnd = false;
}

public void insert(String word) {
  TrieNode node = root;
  for (char c : word.toCharArray()) {
    node.children.putIfAbsent(c, new TrieNode());
    node = node.children.get(c);
  }
  node.isEnd = true;
}

public boolean search(String word) {
  TrieNode node = root;
  for (char c : word.toCharArray()) {
    if (!node.children.containsKey(c)) return false;
    node = node.children.get(c);
  }
  return node.isEnd;
}`,
    useCases: ['Autocomplete / search suggestions', 'Spell checkers', 'IP routing tables', 'Word games (Boggle, Scrabble)', 'DNA sequence matching'],
    visualizer: 'tree',
    complexityRows: [
      ['Insert', 'O(L)', 'L = length of word — traverse/create one node per character'],
      ['Search', 'O(L)', 'Follow at most L nodes to verify the word'],
      ['Starts With', 'O(L)', 'Same as search but without the end-of-word check'],
      ['Space', 'O(N × L × Σ)', 'N words of avg length L, Σ = alphabet size (26 for English)'],
    ],
  },

  /* ══════════════════════════════════════════
     ARRAYS
  ══════════════════════════════════════════ */
  {
    id: 'two-sum',
    name: 'Two Sum',
    category: 'arrays',
    difficulty: 'beginner',
    icon: '➕',
    tagline: 'Find two numbers that add up to a target — three approaches',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Two Sum asks: given an array of integers and a target, find two elements whose sum equals the target and return their indices. There are three progressively better approaches in your codebase:

**Brute Force O(n²)**: Try every pair (i, j) where i ≠ j. Simple but slow.

**Two Pointers O(n)**: Sort the array. Use two pointers — one at each end. If the sum is too small, move the left pointer right. If too big, move the right pointer left. Runs in O(n) after sorting (which is O(n log n)).

**Hash Map O(n)**: For each element, compute the complement (target − current). Look up the complement in a hash map. If found, we have our pair. If not, store the current element. Single pass — O(n) time and space.`,
    keyInsight: 'The Hash Map approach turns a search problem into a lookup problem. Instead of searching for the complement, we pre-store every element and look it up in O(1).',
    steps: [
      'For each element arr[i], compute complement = target − arr[i].',
      'Check if complement is already in the hash map.',
      'If yes → found the pair! Return {complement_index, i}.',
      'If no → store arr[i] → i in the map and continue.',
    ],
    pseudocode: `twoSum(arr, target):
  map = {}
  for i from 0 to n-1:
    complement = target - arr[i]
    if complement in map:
      return [map[complement], i]
    map[arr[i]] = i
  return []`,
    javaCode: `public static int[] twoSumHashMap(int[] input, int target) {
  Map<Integer, Integer> map = new HashMap<>();
  for (int i = 0; i < input.length; i++) {
    int complement = target - input[i];
    if (map.containsKey(complement)) {
      // Complement found — return the pair
      return new int[]{map.get(complement), i};
    }
    map.put(input[i], i); // store current element
  }
  return new int[]{};     // no pair found
}`,
    useCases: ['Database query optimization', 'Financial calculations', 'Classic interview warmup question', 'Foundation for 3Sum, 4Sum variants'],
    visualizer: 'array',
    defaultData: [2, 7, 11, 15],
    defaultTarget: 9,
    complexityRows: [
      ['Brute Force', 'O(n²) time / O(1) space', 'Try all pairs — nested loops'],
      ['Two Pointers', 'O(n log n) / O(1)', 'Sort + two-pointer scan; modifies original array order'],
      ['Hash Map ★', 'O(n) time / O(n) space', 'Single pass with O(1) lookup — best approach'],
    ],
  },

  {
    id: 'dutch-flag',
    name: 'Dutch National Flag',
    category: 'arrays',
    difficulty: 'intermediate',
    icon: '🇳🇱',
    tagline: 'Sort an array of 0s, 1s, and 2s in one pass using three pointers',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `The Dutch National Flag problem (LeetCode #75 "Sort Colors") asks you to sort an array containing only three distinct values (0, 1, 2) in-place, in a single pass.

The elegant three-pointer solution maintains three regions:
• **[0..low-1]** → all 0s (red)
• **[low..mid-1]** → all 1s (white)
• **[high+1..n-1]** → all 2s (blue)
• **[mid..high]** → unexplored territory

The mid pointer scans forward. When it sees a 0, swap with low and advance both. When it sees a 2, swap with high and retreat high. When it sees a 1, just advance mid.`,
    keyInsight: 'Three pointers create three "buckets" in the array simultaneously. The unexplored region between mid and high shrinks by 1 on every step — guaranteeing O(n) termination.',
    steps: [
      'Initialize: low = 0, mid = 0, high = n−1.',
      'While mid ≤ high: check arr[mid].',
      'arr[mid] == 0 → swap arr[low] and arr[mid], advance low and mid.',
      'arr[mid] == 1 → already in correct zone, advance mid.',
      'arr[mid] == 2 → swap arr[mid] and arr[high], retreat high (do NOT advance mid).',
    ],
    pseudocode: `dutchFlag(arr):
  low = 0, mid = 0, high = n - 1
  while mid <= high:
    if arr[mid] == 0:
      swap(arr[low], arr[mid])
      low++; mid++
    elif arr[mid] == 1:
      mid++
    else:  // arr[mid] == 2
      swap(arr[mid], arr[high])
      high--   // don't advance mid!`,
    javaCode: `public static void sortColors(int[] arr) {
  int low = 0, mid = 0, high = arr.length - 1;
  while (mid <= high) {
    if (arr[mid] == 0) {
      swap(arr, low++, mid++);
    } else if (arr[mid] == 1) {
      mid++;
    } else {
      swap(arr, mid, high--);
      // Don't advance mid — swapped element is unexamined
    }
  }
}`,
    useCases: ['Sort array of 3 distinct values in one pass', '3-way partition in QuickSort', 'Partitioning data into three categories'],
    visualizer: 'array',
    defaultData: [2, 0, 2, 1, 1, 0],
    complexityRows: [
      ['Time', 'O(n)', 'Single pass — mid advances on every step'],
      ['Space', 'O(1)', 'In-place, only three pointer variables'],
    ],
  },

  {
    id: 'nth-largest',
    name: 'Nth Largest Element',
    category: 'arrays',
    difficulty: 'intermediate',
    icon: '🏆',
    tagline: 'Find the Nth largest element using a min-heap of size N',
    complexity: {
      time: { best: 'O(n log k)', avg: 'O(n log k)', worst: 'O(n log k)' },
      space: 'O(k)',
    },
    complexityClass: { avg: 'onlogn' },
    explanation: `Finding the Nth largest element in an array has multiple approaches. The optimal approach uses a min-heap (priority queue) of size k (where k is the desired rank).

**Key idea**: Maintain a min-heap of the k largest elements seen so far. For each new element: if the heap has fewer than k elements, add it. If the new element is larger than the heap's minimum (root), replace the minimum with the new element. At the end, the root of the heap IS the kth largest element.

This avoids fully sorting the array — instead of O(n log n), we get O(n log k) where k ≤ n.`,
    keyInsight: 'A min-heap of size k is a sliding "window" that always holds the top-k largest elements seen. The root (minimum of this heap) is always the kth-largest element overall.',
    steps: [
      'Create an empty min-heap.',
      'For each element in the array:',
      '  • If heap size < k: add the element.',
      '  • Else if element > heap root: remove root, add element.',
      'After processing all elements, the root of the heap is the kth largest.',
    ],
    pseudocode: `nthLargest(arr, k):
  minHeap = new MinHeap()
  for num in arr:
    if minHeap.size() < k:
      minHeap.add(num)
    elif num > minHeap.peek():
      minHeap.poll()
      minHeap.add(num)
  return minHeap.peek()`,
    javaCode: `public static int findKthLargest(int[] arr, int k) {
  // Min-heap of size k
  PriorityQueue<Integer> minHeap = new PriorityQueue<>();

  for (int num : arr) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
      minHeap.poll(); // remove the smallest
    }
  }
  return minHeap.peek(); // root is kth largest
}`,
    useCases: ['Top-K results in search engines', 'Leaderboard ranking', 'Streaming data (can\'t store everything)', 'Database top-N queries'],
    visualizer: 'array',
    defaultData: [3, 2, 1, 5, 6, 4],
    defaultTarget: 2,
    complexityRows: [
      ['Time', 'O(n log k)', 'Each of n elements may trigger a heap push/pop — each O(log k)'],
      ['Space', 'O(k)', 'Heap holds at most k elements at any time'],
      ['Alternative', 'O(n log n)', 'Sort descending and return arr[k-1] — simpler but slower'],
    ],
  },

  /* ══════════════════════════════════════════
     STRINGS
  ══════════════════════════════════════════ */
  {
    id: 'anagram',
    name: 'Anagram Check',
    category: 'strings',
    difficulty: 'beginner',
    icon: '🔡',
    tagline: 'Check if two strings contain the same characters in any order',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Two strings are anagrams if one can be rearranged to form the other — they contain exactly the same characters with the same frequencies. For example, "listen" and "silent" are anagrams.

The optimal approach uses a character frequency count:
1. If the strings have different lengths → not anagrams.
2. Count occurrences of each character in string 1 (increment) and string 2 (decrement).
3. If all counts are zero at the end → they are anagrams.

This runs in O(n) time and O(1) space (the frequency array has fixed size 26 for lowercase English letters).`,
    keyInsight: 'Using a single frequency array (increment for string1, decrement for string2) eliminates the need to sort. If all frequencies are zero, both strings have identical character distributions.',
    steps: [
      'Check if lengths are equal — if not, return false immediately.',
      'Create a frequency array of size 26 (for a-z).',
      'For each character in string1: increment its count.',
      'For each character in string2: decrement its count.',
      'If any count is non-zero, they are NOT anagrams. Otherwise, they are.',
    ],
    pseudocode: `isAnagram(s1, s2):
  if len(s1) != len(s2): return false
  freq = [0] * 26
  for c in s1: freq[c - 'a']++
  for c in s2: freq[c - 'a']--
  return all(freq[i] == 0)`,
    javaCode: `public static boolean isAnagram(String s1, String s2) {
  if (s1.length() != s2.length()) return false;

  int[] freq = new int[26]; // frequency of each letter a-z
  for (char c : s1.toCharArray()) freq[c - 'a']++;
  for (char c : s2.toCharArray()) freq[c - 'a']--;

  for (int count : freq) {
    if (count != 0) return false; // mismatch found
  }
  return true;
}`,
    useCases: ['Spell checking', 'Word scramble games', 'Cryptography', 'Grouping words by anagram families'],
    visualizer: 'array',
    defaultData: [108,105,115,116,101,110], // "listen" char codes
    complexityRows: [
      ['Time', 'O(n)', 'Two passes over the strings — O(n + n) = O(n)'],
      ['Space', 'O(1)', 'Frequency array of fixed size 26 — constant space'],
    ],
  },

  {
    id: 'palindrome',
    name: 'Palindrome Check',
    category: 'strings',
    difficulty: 'beginner',
    icon: '🪞',
    tagline: 'Check if a string reads the same forwards and backwards',
    complexity: {
      time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `A palindrome is a string that reads the same forward and backward — like "racecar", "madam", or "level". The two-pointer approach is the most efficient: compare characters from both ends working inward, stopping as soon as a mismatch is found.

Your codebase also includes a recursive approach and a string-reversal approach, but the two-pointer method is best: O(n/2) comparisons and O(1) extra space.`,
    keyInsight: 'Two pointers starting from opposite ends of the string — if they always agree as they meet in the middle, the string is a palindrome. Short-circuit on the first mismatch.',
    steps: [
      'Set left = 0, right = length − 1.',
      'While left < right:',
      '  Compare str[left] and str[right].',
      '  If they differ → NOT a palindrome, return false.',
      '  If they match → advance left, retreat right.',
      'All pairs matched → IS a palindrome, return true.',
    ],
    pseudocode: `isPalindrome(s):
  left = 0, right = len(s) - 1
  while left < right:
    if s[left] != s[right]: return false
    left++, right--
  return true`,
    javaCode: `public static boolean isPalindrome(String s) {
  int left  = 0;
  int right = s.length() - 1;

  while (left < right) {
    if (s.charAt(left) != s.charAt(right)) {
      return false; // mismatch found
    }
    left++;
    right--;
  }
  return true; // all pairs matched
}`,
    useCases: ['Input validation', 'DNA palindrome sequences in bioinformatics', 'Number palindromes (121, 12321)', 'Classic interview question'],
    visualizer: 'array',
    defaultData: [114,97,99,101,99,97,114], // "racecar"
    complexityRows: [
      ['Best case', 'O(1)', 'First and last characters differ — returns immediately'],
      ['Average / Worst', 'O(n)', 'Must compare up to n/2 character pairs'],
      ['Space', 'O(1)', 'Only two pointer variables'],
    ],
  },

  {
    id: 'longest-palindrome-substring',
    name: 'Longest Palindromic Substring',
    category: 'strings',
    difficulty: 'intermediate',
    icon: '📏',
    tagline: 'Find the longest substring that is a palindrome using expand-around-center',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on2' },
    explanation: `Finding the longest palindromic substring means finding the contiguous part of a string that is itself a palindrome and is as long as possible. For "babad", the answer is "bab" or "aba" (both length 3).

The **Expand Around Center** approach treats every character (and every gap between characters) as the center of a potential palindrome, then expands outward as long as characters match. There are 2n−1 possible centers (n single-character centers + n−1 gaps), and each expansion takes O(n) in the worst case, giving O(n²) total.

(Manacher's algorithm can solve this in O(n) but is significantly more complex.)`,
    keyInsight: 'Every palindrome has a center. Instead of checking every substring (O(n³)), expand from every possible center — this reduces it to O(n²) with O(1) space.',
    steps: [
      'For each position i from 0 to n−1:',
      '  Expand around center i (handles odd-length palindromes).',
      '  Expand around center between i and i+1 (handles even-length palindromes).',
      'After each expansion, update the longest palindrome found if this one is longer.',
    ],
    pseudocode: `longestPalindrome(s):
  start = 0, maxLen = 1
  for i in 0..n-1:
    // odd length: center at i
    l1 = expand(s, i, i)
    // even length: center between i and i+1
    l2 = expand(s, i, i+1)
    maxLen = max(l1, l2, maxLen)
  return s[start..start+maxLen]

expand(s, l, r):
  while l >= 0 and r < n and s[l] == s[r]:
    l--; r++
  return r - l - 1`,
    javaCode: `public static String longestPalindrome(String s) {
  int start = 0, maxLen = 1;
  for (int i = 0; i < s.length(); i++) {
    int odd  = expand(s, i, i);       // odd-length
    int even = expand(s, i, i + 1);   // even-length
    int len  = Math.max(odd, even);
    if (len > maxLen) {
      maxLen = len;
      start = i - (len - 1) / 2;
    }
  }
  return s.substring(start, start + maxLen);
}

private static int expand(String s, int l, int r) {
  while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
    l--; r++;
  }
  return r - l - 1; // palindrome length
}`,
    useCases: ['DNA sequence analysis', 'Text processing', 'Classic DP / string interview question'],
    visualizer: 'array',
    complexityRows: [
      ['Time', 'O(n²)', '2n−1 centers, each expansion O(n) worst case'],
      ['Space', 'O(1)', 'Only start/maxLen/pointer variables'],
      ['Manacher\'s', 'O(n)', 'Linear but complex — not commonly asked in interviews'],
    ],
  },

  {
    id: 'longest-substring-no-repeat',
    name: 'Longest Substring Without Repeating',
    category: 'strings',
    difficulty: 'intermediate',
    icon: '🎻',
    tagline: 'Sliding window tracks the longest window with all unique characters',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(min(n, Σ))',
    },
    complexityClass: { avg: 'on' },
    explanation: `Given a string, find the length of the longest contiguous substring that contains no repeated characters. For "abcabcbb" the answer is "abc" (length 3); for "pwwkew" it's "wke" (length 3).

The **Sliding Window** approach maintains a window [left, right] that always contains unique characters. A hash map (or set) stores the last-seen index of each character. When we encounter a character already in the window, we shrink the left boundary to just past its previous occurrence — this ensures the window is always repeat-free.`,
    keyInsight: 'The sliding window never needs to restart from scratch. When a repeat is found, only the left boundary jumps — the right boundary always keeps moving forward. Each character is processed at most twice: once when it enters the window and once when it exits.',
    steps: [
      'Maintain a [left, right] window and a map of {character → last seen index}.',
      'Expand right by adding the next character.',
      'If the character is already in the window (index ≥ left): move left to just after the previous occurrence.',
      'Update the map with the current character\'s index.',
      'Track the maximum window size seen.',
    ],
    pseudocode: `lengthOfLongestSubstring(s):
  lastSeen = {}
  left = 0, maxLen = 0
  for right from 0 to n-1:
    if s[right] in lastSeen and lastSeen[s[right]] >= left:
      left = lastSeen[s[right]] + 1
    lastSeen[s[right]] = right
    maxLen = max(maxLen, right - left + 1)
  return maxLen`,
    javaCode: `public static int lengthOfLongestSubstring(String s) {
  Map<Character, Integer> lastSeen = new HashMap<>();
  int left = 0, maxLen = 0;

  for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    // If character seen and within current window: shrink left
    if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1;
    }
    lastSeen.put(c, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    useCases: ['Session token generation', 'Text compression', 'Sliding window template problem', 'Finding unique subsequences'],
    visualizer: 'array',
    complexityRows: [
      ['Time', 'O(n)', 'Each character is added/removed from window at most once'],
      ['Space', 'O(min(n,Σ))', 'Map stores at most Σ characters (e.g. 128 for ASCII)'],
    ],
  },

  /* ══════════════════════════════════════════
     MATH
  ══════════════════════════════════════════ */
  {
    id: 'prime-numbers',
    name: 'Prime Numbers',
    category: 'math',
    difficulty: 'beginner',
    icon: '🔢',
    tagline: 'Check primality with trial division — and the √n optimization trick',
    complexity: {
      time: { best: 'O(√n) per check', avg: 'O(n√n) total', worst: 'O(n√n) total' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'osqrtn' },
    explanation: `A prime number is a natural number greater than 1 that has no divisors other than 1 and itself. Classic examples: 2, 3, 5, 7, 11, 13, 17...

**Classic Trial Division O(n)**: Check every divisor from 2 up to n−1. Correct but slow.

**√n Trick O(√n)**: If n has a factor f > √n, then n/f < √n must also be a factor — so we'd have already caught it. Therefore we only need to check divisors up to √n. Additionally, skip all even numbers (after checking 2) — this halves the work again.

Your updated PrimeNumbers.java implements both isPrime() and isPrimeOptimized().`,
    keyInsight: 'If n = a × b and a > √n, then b = n/a < √n. So every composite number has a factor ≤ √n. We never need to look further.',
    steps: [
      'Handle edge cases: n ≤ 1 is not prime. n == 2 is prime.',
      'If n is even (n % 2 == 0), return false (all even numbers > 2 are composite).',
      'Check odd divisors from 3 up to √n, stepping by 2.',
      'If any divisor evenly divides n → composite.',
      'If no divisor found → n is prime.',
    ],
    pseudocode: `isPrimeOptimized(n):
  if n <= 1: return false
  if n == 2: return true
  if n % 2 == 0: return false
  i = 3
  while i * i <= n:    // i <= √n
    if n % i == 0: return false
    i += 2             // skip even divisors
  return true`,
    javaCode: `public static boolean isPrimeOptimized(int number) {
  if (number <= 1) return false;      // 0 and 1 are not prime
  if (number == 2) return true;       // 2 is the only even prime
  if (number % 2 == 0) return false;  // all other evens are composite

  // Only check odd divisors up to √number
  for (int i = 3; i <= Math.sqrt(number); i += 2) {
    if (number % i == 0) return false;
  }
  return true;
}`,
    useCases: ['Cryptography (RSA key generation)', 'Hash table sizing', 'Number theory problems', 'Sieve of Eratosthenes base'],
    visualizer: 'array',
    complexityRows: [
      ['Classic (isPrime)', 'O(n) per number', 'Checks all divisors from 2 to n−1'],
      ['Optimized (√n trick)', 'O(√n) per number', 'Only check up to √n, skip evens'],
      ['All primes up to N', 'O(n√n)', 'Apply optimized check to each candidate'],
      ['Sieve of Eratosthenes', 'O(n log log n)', 'Better when generating ALL primes up to N'],
    ],
  },

  {
    id: 'fibonacci',
    name: 'Fibonacci',
    category: 'math',
    difficulty: 'beginner',
    icon: '🌀',
    tagline: 'Three approaches: recursive O(2ⁿ) → iterative O(n) → memoized O(n)',
    complexity: {
      time: { best: 'O(n)', avg: 'O(n)', worst: 'O(2ⁿ)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `The Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21... where F(n) = F(n−1) + F(n−2). Your codebase implements all three classic approaches, showing the evolution from naive to optimal.

**Approach 1 — Recursion O(2ⁿ)**: Directly translates the recurrence. Elegant, but F(3) is computed twice, F(2) three times, etc. The call tree grows exponentially.

**Approach 2 — Iterative O(n) / O(1)**: Use two variables tracking the previous two values, slide the window forward. No recursion, constant space.

**Approach 3 — Memoization O(n) / O(n)**: Same recursive structure as Approach 1, but cache each F(n) in a HashMap. Each sub-problem is solved exactly once.`,
    keyInsight: 'The recursive tree shows why O(2ⁿ) is so bad: F(40) requires ~2.2 billion calls! Memoization caches each unique F(n) — reducing it to exactly n calls. The iterative version goes further: only 2 variables needed.',
    steps: [
      'RECURSIVE: F(n) = F(n-1) + F(n-2). Base case: F(1) = F(2) = 1.',
      'ITERATIVE: Start with fib1=1, fib2=1. Each step: next = fib1 + fib2, slide the window.',
      'MEMOIZED: Before computing F(n), check the cache. Store result before returning.',
    ],
    pseudocode: `// Iterative (best for interviews)
fibonacci(n):
  if n <= 2: return 1
  fib1 = 1, fib2 = 1
  for i from 3 to n:
    next = fib1 + fib2
    fib1 = fib2
    fib2 = next
  return fib2`,
    javaCode: `// Approach 2: Iterative — O(n) time, O(1) space ★ Best
public static int fibonacci(int n) {
  if (n == 1 || n == 2) return 1;
  int fib1 = 1, fib2 = 1, result = 1;
  for (int i = 3; i <= n; i++) {
    result = fib1 + fib2; // next Fibonacci number
    fib1 = fib2;          // slide window forward
    fib2 = result;
  }
  return result;
}

// Approach 3: Memoized — O(n) time, O(n) space
public static int fibMemo(int n, Map<Integer,Integer> cache) {
  if (n <= 2) return 1;
  if (cache.containsKey(n)) return cache.get(n);
  int result = fibMemo(n-1, cache) + fibMemo(n-2, cache);
  cache.put(n, result);
  return result;
}`,
    useCases: ['Dynamic programming introduction', 'Growth modeling in biology', 'Golden ratio / spiral geometry', 'Algorithm complexity analysis teaching'],
    visualizer: 'array',
    complexityRows: [
      ['Recursive', 'O(2ⁿ) time / O(n) space', 'Exponential — impractical for n > 40'],
      ['Iterative ★', 'O(n) time / O(1) space', 'Best for interviews — minimal memory'],
      ['Memoized', 'O(n) time / O(n) space', 'Great when querying F(n) many times'],
    ],
  },

  /* ══════════════════════════════════════════
     MATRIX
  ══════════════════════════════════════════ */
  {
    id: 'find-in-2d-matrix',
    name: 'Search in 2D Matrix',
    category: 'matrix',
    difficulty: 'intermediate',
    icon: '🔢',
    tagline: 'Binary search on a row-sorted, column-sorted matrix in O(m+n)',
    complexity: {
      time: { best: 'O(1)', avg: 'O(m+n)', worst: 'O(m+n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on' },
    explanation: `Given an m×n matrix where each row is sorted and each column is sorted, find whether a target value exists. A naive approach checks every element in O(m×n). 

The elegant staircase search starts at the top-right corner. From there: if the current element equals the target, found! If the current element is greater than the target, move left (entire current column is eliminated). If smaller, move down (entire current row is eliminated). Each step eliminates a full row or column, giving O(m+n) time.`,
    keyInsight: 'Starting from the top-right corner gives us a "pivot" property: every element to the left is smaller, every element below is larger. This makes binary-search-like elimination possible.',
    steps: [
      'Start at top-right corner: row=0, col=n-1.',
      'If matrix[row][col] == target → found!',
      'If matrix[row][col] > target → move left (col--).',
      'If matrix[row][col] < target → move down (row++).',
      'If row or col goes out of bounds → not found.',
    ],
    pseudocode: `searchMatrix(matrix, target):
  row = 0, col = n - 1
  while row < m and col >= 0:
    if matrix[row][col] == target: return true
    if matrix[row][col] > target:  col--
    else:                          row++
  return false`,
    javaCode: `public static boolean searchMatrix(int[][] matrix, int target) {
  int row = 0;
  int col = matrix[0].length - 1; // Start top-right

  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] == target) return true;
    if (matrix[row][col] > target) col--;  // eliminate column
    else                           row++;  // eliminate row
  }
  return false;
}`,
    useCases: ['Database 2D range queries', 'Image processing', 'Spreadsheet search'],
    visualizer: 'array',
    complexityRows: [
      ['Time', 'O(m + n)', 'Each step eliminates one row or one column — at most m+n steps'],
      ['Space', 'O(1)', 'Only two pointer variables'],
    ],
  },

  /* ══════════════════════════════════════════
     LINKED LIST
  ══════════════════════════════════════════ */
  {
    id: 'singly-linked-list',
    name: 'Singly Linked List',
    category: 'linkedlist',
    difficulty: 'beginner',
    icon: '🔗',
    tagline: 'A chain of nodes where each node points to the next',
    complexity: {
      time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    complexityClass: { avg: 'on' },
    explanation: `A Singly Linked List is a linear data structure where each element (node) contains a value and a pointer to the next node. Unlike arrays, linked list nodes are not stored contiguously in memory — they are connected by pointers.

**Key operations**:
• **Prepend (insert at head)**: O(1) — just update the head pointer
• **Append (insert at tail)**: O(n) — must traverse to find the tail
• **Search**: O(n) — must scan from head
• **Delete**: O(n) — find the previous node, update its pointer

Linked lists excel when frequent insertions/deletions at the front are needed and when the total size is unpredictable.`,
    keyInsight: 'The power of a linked list is that insertion/deletion at the head is O(1) — no shifting required. But random access is O(n) because you must traverse from the head.',
    steps: [
      'HEAD pointer stores the reference to the first node.',
      'PREPEND: Create new node, set its next = head, update head = new node. O(1).',
      'APPEND: Traverse to the last node, set its next = new node. O(n).',
      'DELETE: Find the node before the target, set its next = target.next. O(n).',
      'SEARCH: Traverse from head comparing each node\'s value. O(n).',
    ],
    pseudocode: `class Node:
  value, next = null

prepend(value):
  node = new Node(value)
  node.next = head
  head = node

append(value):
  node = new Node(value)
  curr = head
  while curr.next != null: curr = curr.next
  curr.next = node`,
    javaCode: `class Node {
  int value;
  Node next;
  Node(int value) { this.value = value; }
}

// O(1) — insert at head
public void prepend(int value) {
  Node newNode = new Node(value);
  newNode.next = head;
  head = newNode;
}

// O(n) — insert at tail
public void append(int value) {
  Node newNode = new Node(value);
  if (head == null) { head = newNode; return; }
  Node curr = head;
  while (curr.next != null) curr = curr.next;
  curr.next = newNode;
}`,
    useCases: ['Implementing stacks and queues', 'Browser history (back button)', 'Undo/redo functionality', 'Music playlist'],
    visualizer: 'array',
    complexityRows: [
      ['Prepend', 'O(1)', 'Only head pointer is updated — instant'],
      ['Append', 'O(n)', 'Must traverse to find the tail'],
      ['Search', 'O(n)', 'Linear scan from head to target'],
      ['Delete (given node)', 'O(n)', 'Find previous node, then O(1) pointer update'],
      ['Space', 'O(n)', 'One node object per stored element'],
    ],
  },

  {
    id: 'add-two-linked-lists',
    name: 'Add Two Linked Lists',
    category: 'linkedlist',
    difficulty: 'intermediate',
    icon: '🔢',
    tagline: 'Simulate digit-by-digit addition like long addition, using linked list digits',
    complexity: {
      time: { best: 'O(max(m,n))', avg: 'O(max(m,n))', worst: 'O(max(m,n))' },
      space: 'O(max(m,n))',
    },
    complexityClass: { avg: 'on' },
    explanation: `Two linked lists represent two non-negative integers stored in reverse order (least significant digit first). Each node contains one digit. The task is to add these two numbers and return the sum as a linked list.

For example: [2→4→3] represents 342, [5→6→4] represents 465. Their sum is 807, represented as [7→0→8].

The approach mimics long addition: process both lists simultaneously digit by digit, tracking a carry. When one list is exhausted, continue with the remaining digits of the longer list plus any carry.`,
    keyInsight: 'Storing digits in reverse order makes this problem elegant — we naturally add from least-significant to most-significant, which is how carry propagation works.',
    steps: [
      'Initialize a dummy head node and a carry = 0.',
      'While either list has nodes OR carry > 0:',
      '  Add the current digits from both lists (0 if exhausted) plus carry.',
      '  New digit = sum % 10, new carry = sum / 10.',
      '  Create a new node with the digit, append to result.',
      'Return dummy.next.',
    ],
    pseudocode: `addTwoNumbers(l1, l2):
  dummy = new Node(0)
  curr = dummy, carry = 0
  while l1 or l2 or carry:
    sum = carry
    if l1: sum += l1.val; l1 = l1.next
    if l2: sum += l2.val; l2 = l2.next
    carry = sum / 10
    curr.next = new Node(sum % 10)
    curr = curr.next
  return dummy.next`,
    javaCode: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
  ListNode dummy = new ListNode(0);
  ListNode curr = dummy;
  int carry = 0;

  while (l1 != null || l2 != null || carry != 0) {
    int sum = carry;
    if (l1 != null) { sum += l1.val; l1 = l1.next; }
    if (l2 != null) { sum += l2.val; l2 = l2.next; }
    carry = sum / 10;
    curr.next = new ListNode(sum % 10);
    curr = curr.next;
  }
  return dummy.next;
}`,
    useCases: ['Arbitrary-precision arithmetic', 'Cryptographic big number addition', 'LeetCode #2 classic'],
    visualizer: 'array',
    complexityRows: [
      ['Time', 'O(max(m, n))', 'Process both lists simultaneously, one node per step'],
      ['Space', 'O(max(m, n))', 'Result list has at most max(m,n)+1 nodes (carry)'],
    ],
  },

  {
    id: 'spiral-matrix',
    name: 'Spiral Matrix',
    category: 'matrix',
    difficulty: 'intermediate',
    icon: '🌀',
    tagline: 'Traverse a 2D matrix in spiral order using shrinking boundary pointers',
    complexity: {
      time: { best: 'O(m×n)', avg: 'O(m×n)', worst: 'O(m×n)' },
      space: 'O(1)',
    },
    complexityClass: { avg: 'on2' },
    explanation: `Spiral matrix traversal visits all elements of a 2D matrix in a clockwise spiral starting from the top-left. The standard approach uses four boundary pointers (top, bottom, left, right) that shrink inward as each layer is peeled off.

Each "layer" consists of: traverse the top row → traverse the right column → traverse the bottom row (right-to-left) → traverse the left column (bottom-to-top). After each direction, shrink the corresponding boundary. Repeat until boundaries cross.`,
    keyInsight: 'Think of the matrix as concentric rectangular rings. After visiting one complete ring, shrink all four boundaries by 1. The pointers naturally stop when they cross.',
    steps: [
      'Initialize: top=0, bottom=m-1, left=0, right=n-1.',
      'Traverse top row left→right, then increment top.',
      'Traverse right column top→bottom, then decrement right.',
      'If top ≤ bottom: traverse bottom row right→left, then decrement bottom.',
      'If left ≤ right: traverse left column bottom→top, then increment left.',
      'Repeat until top > bottom or left > right.',
    ],
    pseudocode: `spiral(matrix):
  top=0, bottom=m-1, left=0, right=n-1
  while top<=bottom and left<=right:
    for col in left..right: add matrix[top][col]; top++
    for row in top..bottom: add matrix[row][right]; right--
    if top<=bottom:
      for col in right..left: add matrix[bottom][col]; bottom--
    if left<=right:
      for row in bottom..top: add matrix[row][left]; left++`,
    javaCode: `public static List<Integer> spiralOrder(int[][] matrix) {
  List<Integer> result = new ArrayList<>();
  int top = 0, bottom = matrix.length - 1;
  int left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (int col = left; col <= right; col++)  result.add(matrix[top][col]);   top++;
    for (int row = top; row <= bottom; row++)  result.add(matrix[row][right]); right--;
    if (top <= bottom)
      for (int col = right; col >= left; col--) result.add(matrix[bottom][col]); bottom--;
    if (left <= right)
      for (int row = bottom; row >= top; row--) result.add(matrix[row][left]);  left++;
  }
  return result;
}`,
    useCases: ['Image processing (convolution layers)', 'Game grid traversal', 'Memory layout in hardware', 'Classic interview matrix problem'],
    visualizer: 'array',
    complexityRows: [
      ['Time', 'O(m × n)', 'Every element is visited exactly once'],
      ['Space', 'O(1)', 'Only four boundary pointer variables (excluding output list)'],
    ],
  },
];
