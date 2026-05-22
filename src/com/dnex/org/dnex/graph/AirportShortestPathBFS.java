package com.dnex.org.dnex.graph;

import java.util.*;

/**
 * @author ajaydonode
 *
 * ============================================================
 * PROBLEM: Airport Shortest Path (Unweighted Graph — BFS)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given a list of airport connections  [ [src, dest], [src, dest], … ]
 *   and a query pair [src, dest], return the shortest path (fewest hops)
 *   from src → dest.
 *
 *   Because every edge has equal cost (one hop), BFS guarantees the
 *   shortest path in terms of number of stops.
 *
 * ─────────────────────────────────────────────────────────────
 * EXAMPLE GRAPH
 * ─────────────────────────────────────────────────────────────
 *
 *   Connections (undirected):
 *     JFK ── LAX
 *     JFK ── ORD
 *     LAX ── DFW
 *     ORD ── DFW
 *     DFW ── MIA
 *     MIA ── ATL
 *
 *   Query: JFK → ATL
 *
 *   BFS explores:
 *     Level 0: JFK
 *     Level 1: LAX, ORD
 *     Level 2: DFW          (reachable from both LAX and ORD)
 *     Level 3: MIA
 *     Level 4: ATL  ✓
 *
 *   Shortest path: JFK → LAX → DFW → MIA → ATL  (4 hops)
 *                  JFK → ORD → DFW → MIA → ATL  (also 4 hops — BFS returns first found)
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — BFS with parent-tracking
 * ─────────────────────────────────────────────────────────────
 *   1. Build an undirected adjacency list (HashMap<String, List<String>>).
 *   2. BFS from src, storing each node's parent so we can reconstruct the path.
 *   3. When dest is reached, walk back through parent pointers to build the path.
 *   4. Return the reversed list (src → … → dest).
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY
 * ─────────────────────────────────────────────────────────────
 *   Time  O(V + E)   — every node/edge visited at most once
 *   Space O(V + E)   — adjacency list + visited set + parent map
 * ============================================================
 */
public class AirportShortestPathBFS {

    // ──────────────────────────────────────────────────────────────────────────
    // buildGraph — converts a flat list of [src, dest] pairs into an
    //              undirected adjacency list.
    //
    // Undirected: a flight route is bidirectional by default.
    //             Remove the reverse-edge line if the routes are one-way.
    //
    // @param connections  list of [src, dest] string pairs
    // @return             adjacency list keyed by airport code
    // ──────────────────────────────────────────────────────────────────────────
    private static Map<String, List<String>> buildGraph(List<String[]> connections) {
        Map<String, List<String>> graph = new HashMap<>();

        for (String[] edge : connections) {
            String src  = edge[0];
            String dest = edge[1];

            // Add src → dest
            graph.computeIfAbsent(src,  k -> new ArrayList<>()).add(dest);
            // Add dest → src  (remove this line for directed/one-way routes)
            graph.computeIfAbsent(dest, k -> new ArrayList<>()).add(src);
        }

        return graph;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // shortestPath — BFS-based shortest path between two airport codes.
    //
    // BFS is preferred over DFS here because it visits nodes level-by-level
    // (hop-by-hop), so the FIRST time it reaches dest it has found the
    // minimum number of hops — no need to explore further.
    //
    // @param connections  list of [src, dest] airport pairs (the full network)
    // @param src          starting airport code
    // @param dest         target airport code
    // @return             ordered list of airports from src to dest,
    //                     or an empty list if no path exists
    // ──────────────────────────────────────────────────────────────────────────
    public static List<String> shortestPath(List<String[]> connections, String src, String dest) {
        Map<String, List<String>> graph = buildGraph(connections);

        // ── Edge case: src and dest are the same airport ─────────────────────
        if (src.equals(dest)) {
            return Collections.singletonList(src);
        }

        // ── BFS data structures ───────────────────────────────────────────────
        // visited : prevents re-processing already-seen airports
        // parent  : remembers how we arrived at each airport (for path rebuild)
        // queue   : BFS frontier — FIFO ordering ensures level-by-level traversal
        Set<String>         visited = new HashSet<>();
        Map<String, String> parent  = new HashMap<>();
        Queue<String>       queue   = new LinkedList<>();

        // ── Seed BFS with the source airport ─────────────────────────────────
        queue.add(src);
        visited.add(src);
        parent.put(src, null); // src has no predecessor

        // ── Main BFS loop ─────────────────────────────────────────────────────
        while (!queue.isEmpty()) {
            String current = queue.poll();
            // Explore all direct neighbours of current airport
            for (String neighbour : graph.getOrDefault(current, Collections.emptyList())) {

                if (visited.contains(neighbour)) {
                    continue; // already explored — skip to avoid cycles
                }

                visited.add(neighbour);
                parent.put(neighbour, current); // record how we reached neighbour

                // ── Destination reached — reconstruct path and return ──────────
                if (neighbour.equals(dest)) {
                    return reconstructPath(parent, dest);
                }

                queue.add(neighbour); // enqueue for further exploration
            }
        }

        // No path found between src and dest
        return Collections.emptyList();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // reconstructPath — walks the parent map backwards from dest → src,
    //                   then reverses the result to get src → dest order.
    //
    // @param parent  map of airport → the airport we came from during BFS
    // @param dest    the destination airport where BFS terminated
    // @return        ordered path list from src to dest
    // ──────────────────────────────────────────────────────────────────────────
    private static List<String> reconstructPath(Map<String, String> parent, String dest) {
        List<String> path = new ArrayList<>();
        String current = dest;

        // Walk backwards through parent pointers until we reach src (parent == null)
        while (current != null) {
            path.add(current);
            current = parent.get(current);
        }

        Collections.reverse(path); // flip from [dest…src] to [src…dest]
        return path;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // main — demonstration with a sample airport network
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {

        // ── Step 1: Define the airport connection network ─────────────────────
        //
        //   JFK ── LAX ── DFW ── MIA ── ATL
        //    \             /
        //     ── ORD ─────
        //
        List<String[]> connections = Arrays.asList(
            new String[]{"JFK", "LAX"},
            new String[]{"JFK", "ORD"},
            new String[]{"LAX", "DFW"},
            new String[]{"ORD", "DFW"},
            new String[]{"DFW", "MIA"},
            new String[]{"MIA", "ATL"}
        );

        // ── Step 2: Query 1 — JFK to ATL ─────────────────────────────────────
        runQuery(connections, "JFK", "ATL");
        // Expected: JFK → LAX → DFW → MIA → ATL  (or via ORD, both are 4 hops)

        // ── Step 3: Query 2 — LAX to MIA ─────────────────────────────────────
        runQuery(connections, "LAX", "MIA");
        // Expected: LAX → DFW → MIA  (2 hops)

        // ── Step 4: Query 3 — same airport ───────────────────────────────────
        runQuery(connections, "ORD", "ORD");
        // Expected: ORD  (0 hops)

        // ── Step 5: Query 4 — unreachable airport ────────────────────────────
        runQuery(connections, "JFK", "SFO");
        // Expected: No path found
    }

    // Helper to print a formatted query result
    private static void runQuery(List<String[]> connections, String src, String dest) {
        List<String> path = shortestPath(connections, src, dest);
        System.out.print("Query [" + src + " → " + dest + "]: ");
        if (path.isEmpty()) {
            System.out.println("No path found");
        } else {
            System.out.println(String.join(" → ", path) + "  (" + (path.size() - 1) + " hops)");
        }
    }
}
