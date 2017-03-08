package com.dnex.org.ge.tree;

/**
 * Created by 502664102 on 9/16/16.
 */
public class Node {
    int data;
    Node parent;
    Node left;
    Node right;

    public Node(int data) {
        this.data = data;
        parent = null;
        left = null;
        right = null;
    }


    public boolean isLeaf()
    {
        return (left == null && right == null);
    }
}
