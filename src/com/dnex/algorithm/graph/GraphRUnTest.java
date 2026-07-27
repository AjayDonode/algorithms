package com.dnex.algorithm.graph;

import java.util.*;

public class GraphRUnTest {

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

        Map<String, List<String>> graph = generateGraph(connections);

        print(graph);

        System.out.print("Result BFS "+ bfs(graph,"JFK","MIA"));
    }

    private static Map<String, List<String>> generateGraph(List<String[]> connections) {
        Map<String, List<String>> graph = new HashMap<>();

        for(String[] connection: connections) {
            String src = connection[0];
            String dst = connection[1];
            graph.computeIfAbsent(src, k-> new ArrayList<>()).add(dst);
//            graph.computeIfAbsent(dst, k-> new ArrayList<>()).add(src);
        }
        return graph;
    }

    private static String bfs(Map<String, List<String>> graph, String src, String target) {

        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        Map<String, String> path = new HashMap<>();

        queue.add(src);
        visited.add(src);
        path.put(src, null);

        while(!queue.isEmpty()){

            String current = queue.poll();
            visited.add(current);

            List<String> neighbours = graph.getOrDefault(current, new ArrayList<>());
            for(String neighbour : neighbours) {

                if(visited.contains(neighbour)) {continue;}

                System.out.println(current +"="+ neighbour);
                queue.add(neighbour);
                visited.add(neighbour);
                path.put(neighbour, current);

                if (neighbour.equals(target)) {
                  return  "Found";
                }
            }

        }

    return  "not found";
    }

    private static void  print(Map<String, List<String>> graph){

        for (Map.Entry<String, List<String>> entry : graph.entrySet()) {
            List<String> edges = entry.getValue();
            String op = "Vertex : " + entry.getKey();
            for (String edge: edges) {
                op+= " ==> " + edge;
            }
            System.out.println(op);
        }

    }
}
