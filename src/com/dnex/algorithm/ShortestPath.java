package com.dnex.algorithm;

import java.util.*;

/**
 * ============================================================
 * PROBLEM: Single-Source Shortest Path (Dijkstra's Algorithm)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given a weighted, directed graph of N nodes and a starting node,
 *   find the shortest (minimum-cost) path from the start node to
 *   every other reachable node in the graph.
 *
 *   Edge weights must be NON-NEGATIVE for Dijkstra's to be correct.
 *   (Use Bellman-Ford for graphs with negative weights.)
 *
 * ─────────────────────────────────────────────────────────────
 * GRAPH USED IN main()
 * ─────────────────────────────────────────────────────────────
 *   5 nodes (0–4), directed edges with weights:
 *
 *       (9)
 *   0 ──────► 1
 *   │  (6)  ▲
 *   └──────► 2 ──(2)──► 1
 *   │  (5)  │
 *   └──────► 3 ◄─(4)──┘
 *   │  (3)
 *   └──────► 4
 *
 *   Adjacency list:
 *     0 → [1(9), 2(6), 3(5), 4(3)]
 *     2 → [1(2), 3(4)]
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — Dijkstra's Algorithm (Min-Heap / Priority Queue)
 * ─────────────────────────────────────────────────────────────
 *   KEY IDEA (Greedy): Always extend the unvisited node that currently
 *   has the smallest known distance from the source.
 *
 *   RELAXATION: For each neighbour v of node u:
 *     if dist[u] + weight(u→v) < dist[v]  →  update dist[v]
 *
 *   Step-by-step trace starting from Node 0:
 *
 *     Initial: dist = [0, ∞, ∞, ∞, ∞]   PQ = [(0,0)]
 *
 *     Poll (0, dist=0):
 *       Relax 0→1: 0+9=9  < ∞  → dist[1]=9   PQ add (1,9)
 *       Relax 0→2: 0+6=6  < ∞  → dist[2]=6   PQ add (2,6)
 *       Relax 0→3: 0+5=5  < ∞  → dist[3]=5   PQ add (3,5)
 *       Relax 0→4: 0+3=3  < ∞  → dist[4]=3   PQ add (4,3)
 *       dist = [0, 9, 6, 5, 3]
 *
 *     Poll (4, dist=3)  — node 4 has no outgoing edges, skip.
 *       dist = [0, 9, 6, 5, 3]
 *
 *     Poll (3, dist=5)  — node 3 has no outgoing edges, skip.
 *       dist = [0, 9, 6, 5, 3]
 *
 *     Poll (2, dist=6):
 *       Relax 2→1: 6+2=8  < 9  → dist[1]=8   PQ add (1,8)
 *       Relax 2→3: 6+4=10 > 5  → no update
 *       dist = [0, 8, 6, 5, 3]
 *
 *     Poll (1, dist=8)  — node 1 has no outgoing edges.
 *       dist = [0, 8, 6, 5, 3]
 *
 *     Poll (1, dist=9)  — already visited, skip.
 *
 *     Final shortest distances from Node 0:
 *       To Node 0 → 0
 *       To Node 1 → 8   (via 0→2→1, not the direct edge 0→1 which costs 9)
 *       To Node 2 → 6
 *       To Node 3 → 5
 *       To Node 4 → 3
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Dijkstra's (binary heap / PriorityQueue)
 *     Time  O((V + E) log V)   — V nodes, E edges
 *     Space O(V + E)           — graph + distances + PQ
 *
 *   Dijkstra's (Fibonacci heap — theoretical best)
 *     Time  O(E + V log V)     — rarely used in practice
 *
 *   Bellman-Ford (handles negative weights)
 *     Time  O(V × E)           — significantly slower
 * ============================================================
 */
public class ShortestPath {

    static class Edge {
        int targetNode; // the node this edge points to
        int weight;     // the cost of traversing this edge
        Edge(int targetNode, int weight) {
            this.targetNode = targetNode;
            this.weight     = weight;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // NodeDistance — PriorityQueue entry pairing a node with its current
    //               best-known distance from the source.
    //
    // Implements Comparable so the PriorityQueue is a MIN-heap:
    //   the node with the SMALLEST distance is always polled first.
    // ──────────────────────────────────────────────────────────────────────────
    static class NodeDistance implements Comparable<NodeDistance> {
        int node;     // which node this entry refers to
        int distance; // shortest distance known so far from the source

        NodeDistance(int node, int distance) {
            this.node     = node;
            this.distance = distance;
        }

        // Natural order: ascending by distance → min-heap behaviour
        @Override
        public int compareTo(NodeDistance other) {
            return Integer.compare(this.distance, other.distance);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // dijkstra — Single-source shortest path  O((V+E) log V) / O(V+E)
    //
    // Uses a min-heap (PriorityQueue) to always process the nearest unvisited
    // node first (greedy choice).  For each such node, it attempts to "relax"
    // every outgoing edge — i.e., if we can reach a neighbour more cheaply
    // via the current node, we update that neighbour's distance.
    //
    // @param graph      adjacency list — graph.get(u) = list of edges from u
    // @param startNode  the source node (distance = 0)
    // ──────────────────────────────────────────────────────────────────────────
    public static void dijkstra(List<List<Edge>> graph, int src) {
        int numNodes = graph.size();

        // ── Step 1: Initialise distances ─────────────────────────────────────
        // Set every distance to +∞ (Integer.MAX_VALUE) to indicate "not yet
        // reachable".  The start node's distance is 0 — it costs nothing to
        // stay where we already are.
        int[] distances = new int[numNodes];
        Arrays.fill(distances, Integer.MAX_VALUE);
        distances[src] = 0;

        // ── Step 2: Seed the PriorityQueue with the start node ───────────────
        // The PQ is a min-heap ordered by distance, so the closest node is
        // always at the top.  We add stale entries instead of updating in-place
        // (simpler with Java's PriorityQueue); stale entries are skipped by the
        // visited[] check inside the loop.
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        pq.add(new NodeDistance(src, 0));

        // ── Step 3: Track which nodes have been permanently settled ──────────
        // Once a node is visited (finalised), its distance is guaranteed to be
        // the shortest possible — we never need to revisit it.
        boolean[] visited = new boolean[numNodes];

        // ── Step 4: Main Dijkstra loop ───────────────────────────────────────
        while (!pq.isEmpty()) {

            // Always process the node with the current minimum distance
            NodeDistance current = pq.poll();
            int u = current.node;

            // Skip stale PQ entries — this node was already finalised with a
            // shorter distance in a previous iteration
            if (visited[u]) {
                continue;
            }

            // Finalise (settle) this node — its distance won't improve further
            visited[u] = true;

            // ── Step 5: Relax all outgoing edges from u ───────────────────────
            // For each neighbour v reachable from u, check if going through u
            // gives a shorter path to v than what we currently know.
            for (Edge edge : graph.get(u)) {
                int v      = edge.targetNode;
                int weight = edge.weight;

                // Relaxation: dist[u] + weight < dist[v]  → found a shorter path
                if (!visited[v] && distances[u] + weight < distances[v]) {
                    distances[v] = distances[u] + weight; // update shortest distance
                    pq.add(new NodeDistance(v, distances[v])); // push updated entry
                }
            }
        }

        // ── Step 6: Print the final shortest distances from startNode ─────────
        System.out.println("Shortest distances from Node " + startNode + ":");
        for (int i = 0; i < numNodes; i++) {
            String dist = (distances[i] == Integer.MAX_VALUE) ? "unreachable" : String.valueOf(distances[i]);
            System.out.println("  To Node " + i + " → Distance: " + dist);
        }
    }

    public static void main(String[] args) {

        // ── Step 1: Build the graph as an adjacency list ─────────────────────
        // Index i in the outer list = node i.
        // Each inner list holds all edges that leave node i.
        int numNodes = 5;
        List<List<Edge>> graph = new ArrayList<>();
        for (int i = 0; i < numNodes; i++) {
            graph.add(new ArrayList<>());
        }

        // ── Step 2: Add directed, weighted edges ─────────────────────────────
        // Format: graph.get(FROM).add(new Edge(TO, WEIGHT))
        //
        //   Direct path 0→1 costs 9  (but 0→2→1 costs only 8 — Dijkstra finds this!)
        graph.get(0).add(new Edge(1, 9));
        graph.get(0).add(new Edge(2, 6));
        graph.get(0).add(new Edge(3, 5));
        graph.get(0).add(new Edge(4, 3));

        graph.get(2).add(new Edge(1, 2)); // shortcut: 2→1 costs only 2
        graph.get(2).add(new Edge(3, 4));

        // ── Step 3: Run Dijkstra from Node 0 ─────────────────────────────────
        // Expected output:
        //   To Node 0 → 0
        //   To Node 1 → 8   (0→2→1: 6+2=8, cheaper than direct 0→1=9)
        //   To Node 2 → 6
        //   To Node 3 → 5
        //   To Node 4 → 3
        dijkstra(graph, 0);
    }
}
