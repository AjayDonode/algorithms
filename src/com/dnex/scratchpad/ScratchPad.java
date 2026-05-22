
package com.dnex.scratchpad;

import java.util.*;

public class ScratchPad {
     public static void main(String[] args) {
         System.out.println("Liner Search");

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
         findShortestPath(connections, "JFK", "ATL");

    }

    private static void findShortestPath(List<String[]> connections, String src, String dst) {
         System.out.println("Src => "+src +" Dest " +dst);
         Map<String, List<String>> graph =  createGraph(connections);
         System.out.println("Graph => \n"+ printGraph(graph));
         System.out.println("Distance "+ findShortedPath(graph, src, dst));
    }

    private static List<String> findShortedPath(Map<String, List<String>> graph, String src, String dst) {

         if(src.equals(dst)) return new ArrayList<>(); //same src and dest

        Set<String> visited = new HashSet<>();
        Map<String, String> parents = new HashMap<>();
        Queue<String> queue = new LinkedList<>();

        visited.add(src);
        parents.put(src, null);
        queue.add(src);

        while (!queue.isEmpty())
        {
            String current = queue.poll();
            for (String neighbour : graph.getOrDefault(current, new ArrayList<>())) {

                if(visited.contains(neighbour)) {
                    continue;
                }
                
               visited.add(neighbour);
               parents.put(neighbour, current);
               if(neighbour.equals(dst)) {
                   return reconstructPath(parents, dst);
               }
               queue.add(neighbour);
            }

        }


         return  Collections.emptyList();
    }

    private static List<String> reconstructPath(Map<String, String> parents, String dst) {

        List<String> path = new ArrayList<>();
         String current = dst;

         while (current != null) {
             path.add(current);
             current = parents.get(current);

         }
        Collections.reverse(path);
         return path;
    }

    private static String printGraph(Map<String, List<String>> graph) {
         StringBuilder result =  new StringBuilder();
        for (Map.Entry<String,List<String>> entry : graph.entrySet()) {
            result.append(entry.getKey() +"=> "+ entry.getValue());
            result.append("\n");
        }
         return result.toString();
    }

    private static Map<String, List<String>> createGraph(List<String[]> connections) {
        Map<String, List<String>> graph = new HashMap<>();

        for (String[] connection : connections) {
            String src = connection[0];
            String dst = connection[1];

            graph.computeIfAbsent(src, k-> new ArrayList<>()).add(dst);
            graph.computeIfAbsent(dst, k-> new ArrayList<>()).add(src);

        }
        return  graph;
    }


}
