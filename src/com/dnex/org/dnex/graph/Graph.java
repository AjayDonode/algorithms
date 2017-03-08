package com.dnex.org.dnex.graph;

import com.dnex.org.ge.tree.Node;

import java.util.*;

/**
 * Created by Ajay Donode on 9/18/16.
 */
public class Graph {

    private Map<String, List<Edge>> adjLists;

    public Graph() {
        adjLists = new HashMap<>();
//        myVertices = new HashMap<String, Vertex>();
//        myNumVertices = myNumEdges = 0;
    }



    public void addEdge(String src, String dst) {
        Edge edge = new Edge(src, dst);
        List<Edge> srcNeighbors = this.adjLists.get(src);
        if (srcNeighbors == null) {
            srcNeighbors = new ArrayList<>();
            adjLists.put(src,srcNeighbors);
        }
        srcNeighbors.add(edge);
    }


    public void print(){

        for (Map.Entry<String, List<Edge>> entry : adjLists.entrySet()) {
            List<Edge> edges = entry.getValue();
            String op = "Vertex : " + entry.getKey();
            for (Edge edge: edges) {
                op+= " ==> " + edge.end;
            }
            System.out.println(op);
        }

    }


    /**
     * Performs a breadth-first search, starting from the given node,
     * to target node
     *
     * @return True if a goal node could be found.
     */
     boolean bfs(String src, String target){

         Queue<String> queue = new LinkedList<>();
         List<String> visited = new ArrayList<>();
         queue.add(src);

         while (!queue.isEmpty()) {

            String vertex = queue.poll();
            visited.add(vertex);
             System.out.println("Visited "+vertex);
            List<Edge> edges  =  adjLists.get(vertex);

            if (target.equals(vertex)) {
                return true;
            }

            for (Edge edge: edges) {
                if(!visited.contains(edge.end))
                queue.add(edge.end);
            }


        }
        return false;
    }

    /**
     * Performs a depth-first search, starting from the given node,
     * to target node
     *
     *
     * @return True if a goal node could be found.
     */
     boolean dfs(String src, String target) {
        List<String> visited = new ArrayList<>();
        Stack stack = new Stack();
        stack.push(src);

        while (!stack.isEmpty()) {
            String vertex = (String)stack.pop();
            System.out.println("Visited "+vertex);
            visited.add(vertex);
            List<Edge> edges  =  adjLists.get(vertex);

            if (target.equals(vertex)) {
                return true;
            }
            for (Edge edge: edges) {
                if(!visited.contains(edge.end))
                    stack.add(edge.end);
            }

        }
        return false;
    }
}

