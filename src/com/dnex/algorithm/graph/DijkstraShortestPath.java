package com.dnex.algorithm.graph;

import java.util.*;

/**
 * Dijkstra's Shortest Path Algorithm
 *
 * <p>Finds the shortest path from a source node to every other node in a
 * weighted, undirected graph with non-negative edge weights.
 *
 * <p><b>Graph used (same as DIJKSTRA_GUIDE.html):</b>
 * <pre>
 *        4         5
 *   A ─────── B ─────── D
 *   │       1 │       8 │ 2
 *   │ 2     └─┤         └──── F
 *   │         C               │
 *   └─────────┘ 8             │ 3
 *               └──────── E ──┘
 *                    2
 *               D ─────── E
 *
 *  Edges:  A-B(4)  A-C(2)  B-C(1)  B-D(5)
 *          C-D(8)  C-E(8)  D-E(2)  D-F(2)  E-F(3)
 *
 *  Shortest path A → F:
 *    A →(2)→ C →(1... wait, B)
 *    A →(4)→ B →(1... shortest via):
 *    A(0) → C(2) → B(3) → D(8) → F(10)   ← actual shortest
 *
 *  All distances from A:
 *    A=0  B=3  C=2  D=8  E=10  F=10
 * </pre>
 *
 * <p><b>Algorithm — three steps every iteration:</b>
 * <ol>
 *   <li>Pick the unvisited node with the smallest known distance (min-heap).</li>
 *   <li>Mark it as visited (distance is now final — cannot improve).</li>
 *   <li>Relax all its neighbours: if going through this node is cheaper, update.</li>
 * </ol>
 *
 * <p><b>Complexity:</b> Time O((V + E) log V) · Space O(V + E)
 */
public class DijkstraShortestPath {

    // ── Graph setup ────────────────────────────────────────────────────────────
    // Nodes: A=0  B=1  C=2  D=3  E=4  F=5
    private static final int NODES    = 6;
    private static final String[] LABEL = {"A", "B", "C", "D", "E", "F"};

    public static void main(String[] args) {

        // Build adjacency list: graph.get(u) = list of [neighbour, weight]
        List<List<int[]>> graph = buildGraph();

        System.out.println("=== Dijkstra's Shortest Path ===");
        System.out.println("Graph (same as DIJKSTRA_GUIDE.html):");
        System.out.println("  A-B(4)  A-C(2)  B-C(1)  B-D(5)");
        System.out.println("  C-D(8)  C-E(8)  D-E(2)  D-F(2)  E-F(3)");
        System.out.println("Source: A");
        System.out.println();

        // Run Dijkstra from node A (index 0)
        int source = 0;
        int[] dist = dijkstra(graph, source);

        // Print all shortest distances
        System.out.println("=== Shortest Distances from A ===");
        for (int i = 0; i < NODES; i++) {
            String d = dist[i] == Integer.MAX_VALUE ? "∞" : String.valueOf(dist[i]);
            System.out.printf("  A → %s  =  %s%n", LABEL[i], d);
        }

        // Print shortest path to each node
        System.out.println();
        System.out.println("=== Shortest Paths from A ===");
        int[] prev = dijkstraWithPath(graph, source);
        for (int i = 0; i < NODES; i++) {
            System.out.printf("  A → %s  [dist=%d]  path: %s%n",
                    LABEL[i], dist[i], buildPath(prev, source, i));
        }
    }

    // =========================================================================
    // dijkstra() — returns the shortest distance array from source to all nodes
    //
    // How it works step by step:
    //   1. dist[] = infinity for all, except dist[source] = 0
    //   2. Push (source, 0) into a min-heap (PriorityQueue sorted by cost)
    //   3. While heap is not empty:
    //        a. Poll the cheapest [node, cost] entry
    //        b. If already visited → skip (a shorter path already confirmed it)
    //        c. Mark as visited → this distance is now FINAL
    //        d. For every neighbour: if dist[node] + weight < dist[neighbour]
    //             → RELAX: update dist[neighbour] and push to heap
    //   4. Return dist[]
    // =========================================================================
    private static int[] dijkstra(List<List<int[]>> graph, int src) {

        int[] dist = new int[NODES];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;

        // Min-heap: int[]{node, distance}  — ordered by distance (index 1)
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.offer(new int[]{src, 0});

        boolean[] visited = new boolean[NODES];

        while (!pq.isEmpty()) {
            int[] current  = pq.poll();
            int   node = current[0];
            int   currentDist = current[1];

            if (visited[node]) continue;       // already confirmed — skip
            visited[node] = true;

            System.out.printf("  [Visit] %s  confirmed dist=%d%n", LABEL[node], currentDist);

            for (int[] edge : graph.get(node)) {
                int nb     = edge[0];
                int weight = edge[1];

                if (currentDist + weight < dist[nb]) {   // ← RELAXATION
                    dist[nb] = currentDist + weight;
                    pq.offer(new int[]{nb, dist[nb]});
                    System.out.printf("    [Relax] %s→%s  new dist=%d%n",
                            LABEL[node], LABEL[nb], dist[nb]);
                }
            }
        }

        System.out.println();
        return dist;
    }

    // =========================================================================
    // dijkstraWithPath() — same algorithm but also records prev[] so we can
    // reconstruct the actual shortest path, not just the distance.
    // =========================================================================
    private static int[] dijkstraWithPath(List<List<int[]>> graph, int src) {

        int[] dist = new int[NODES];
        int[] prev = new int[NODES];
        Arrays.fill(dist, Integer.MAX_VALUE);
        Arrays.fill(prev, -1);               // -1 = no predecessor
        dist[src] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.offer(new int[]{src, 0});

        boolean[] visited = new boolean[NODES];

        while (!pq.isEmpty()) {
            int[] cur  = pq.poll();
            int   node = cur[0];
            int   d    = cur[1];

            if (visited[node]) continue;
            visited[node] = true;

            for (int[] edge : graph.get(node)) {
                int nb     = edge[0];
                int weight = edge[1];

                if (d + weight < dist[nb]) {
                    dist[nb] = d + weight;
                    prev[nb] = node;           // ← remember predecessor
                    pq.offer(new int[]{nb, dist[nb]});
                }
            }
        }

        return prev;
    }

    // =========================================================================
    // buildPath() — walks backward through prev[] to reconstruct the path
    //               from source → target as a readable string like "A → C → B"
    // =========================================================================
    private static String buildPath(int[] prev, int src, int target) {
        if (target == src) return LABEL[src];

        // Walk backwards: target → ... → source
        Deque<Integer> path = new ArrayDeque<>();
        int cur = target;
        while (cur != -1) {
            path.addFirst(cur);
            cur = prev[cur];
        }

        // If we never reached source, there's no path
        if (path.isEmpty() || path.peekFirst() != src) return "no path";

        StringBuilder sb = new StringBuilder();
        for (int node : path) {
            if (sb.length() > 0) sb.append(" → ");
            sb.append(LABEL[node]);
        }
        return sb.toString();
    }

    // =========================================================================
    // buildGraph() — constructs the undirected weighted adjacency list
    //
    // Node index mapping:  A=0  B=1  C=2  D=3  E=4  F=5
    //
    // Edges (matching the guide):
    //   A-B(4)  A-C(2)  B-C(1)  B-D(5)
    //   C-D(8)  C-E(8)  D-E(2)  D-F(2)  E-F(3)
    // =========================================================================
    private static List<List<int[]>> buildGraph() {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i < NODES; i++) graph.add(new ArrayList<>());

        // addEdge(graph, u, v, weight) — undirected, so add both directions
        addEdge(graph, 0, 1, 4);   // A-B
        addEdge(graph, 0, 2, 2);   // A-C
        addEdge(graph, 1, 2, 1);   // B-C
        addEdge(graph, 1, 3, 5);   // B-D
        addEdge(graph, 2, 3, 8);   // C-D
        addEdge(graph, 2, 4, 8);   // C-E
        addEdge(graph, 3, 4, 2);   // D-E
        addEdge(graph, 3, 5, 2);   // D-F
        addEdge(graph, 4, 5, 3);   // E-F

        return graph;
    }

    private static void addEdge(List<List<int[]>> graph, int src, int dest, int w) {
        graph.get(src).add(new int[]{dest, w});   // src → v
        graph.get(dest).add(new int[]{src, w});   // v → src  (undirected)
    }
}
