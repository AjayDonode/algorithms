package com.dnex.org.dnex.graph;

import java.util.List;

/**
 * Created by 502664102 on 9/18/16.
 */
public class Vertex { //Same as Node in tree
    String name;
    List<Edge> connections;

    public Vertex(String name, List<Edge> nbrs){
        this.name = name;
        this.connections = nbrs;
    }
}
