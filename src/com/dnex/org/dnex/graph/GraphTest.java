package com.dnex.org.dnex.graph;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.util.Iterator;

import static org.junit.Assert.*;


@RunWith(JUnit4.class)
public class GraphTest {

    public static Graph graph1;

    @BeforeClass
    public static void makeGraphs() {
        Graph g = graph1 = new Graph();
        g.addEdge("A", "B");
        g.addEdge("B", "C");
        g.addEdge("B", "D");
        g.addEdge("B", "A");
        g.addEdge("B", "E");
        g.addEdge("B", "F");
        g.addEdge("C", "A");
        g.addEdge("D", "C");
        g.addEdge("E", "B");
        g.addEdge("F", "B");
    }

    private void expectIteration(String answer, Iterator<String> it) {
        StringBuilder sb = new StringBuilder();
        while (it.hasNext()) {
            sb.append(' ').append(it.next());
        }
        assertEquals(answer, sb.substring(1));
    }

    @Test
    public void preOrderIterationOfIsolatedVertex() {
        System.out.print(graph1.toString());
        graph1.print();
    }

   @Test
    public void searchVertex() {
       System.out.print("Result BFS "+ graph1.bfs("A","F"));
       System.out.print("Result DFS "+ graph1.dfs("A","F"));
       // expectIteration("Z", graph1.bfs("A","Z"));
    }

    /*@Test
    public void preOrderIterationFromA() {
        expectIteration("A B C D E F", new PreOrderDFSIterator(graph1, "A"));
    }

    @Test
    public void preOrderIterationFromB() {
        expectIteration("B C A D E F", new PreOrderDFSIterator(graph1, "B"));
    }

    @Test
    public void BreadthFirstIterationOfIsolatedVertex() {
        expectIteration("Z", new BreadthFirstIterator(graph1, "Z"));
    }

    @Test
    public void BreadthFirstIterationFromA() {
        expectIteration("A B C D E F", new BreadthFirstIterator(graph1, "A"));
    }

    @Test
    public void BreadthFirstIterationFromB() {
        expectIteration("B C D A E F", new BreadthFirstIterator(graph1, "B"));
    }*/
}