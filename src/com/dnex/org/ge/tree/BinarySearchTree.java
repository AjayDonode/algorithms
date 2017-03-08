package com.dnex.org.ge.tree;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

/**
 * Created by ajay donode on 9/15/16.
 * Implement insert,find, delete and display on binary search tree
 * Wiki link for pseudo code https://en.wikipedia.org/wiki/Binary_search_tree
 */
public class BinarySearchTree {

    private Node root;

    public BinarySearchTree() {
        this.root = null;
    }

    /**
     * Insert recursively to BST
     *
     * @param node
     * @param data
     */
    private void insert(Node node, int data) {
        Node newNode = new Node(data);
        if (node == null) {
            root = newNode;

        } else if (data < node.data && node.left == null) {
            node.left = newNode;
            node.left.parent = node;
        } else if (data >= node.data && node.right == null) {
            node.right = newNode;
            node.right.parent = node;
        } else {

            if (data < node.data) {
                insert(node.left, data);
            } else {
                insert(node.right, data);
            }

        }

    }

    private Node delete(Node node, int target){
       // Node parent = null;

        if(node==null) {
            return node;
        }

        if (target < node.data)
            delete (node.left, target);
        else if (target > node.data)
            delete (node.right, target);

        else { //Found match

            if(node.isLeaf()) //No child Node
            {
                node = null;
            }

            else if (node.right == null) { //Node with two child
                node = node.left;
              }
            else if (node.left == null) {
                node = node.right;
            } else {
                Node min  = findMinFromRight(node.right);
                node.data = min.data;
                node.right = delete(node.right, min.data);
            }
      }
        return node;
    }

    private Node findMinFromRight(Node right) {
            while(right.left != null){
                right = right.left;
            }
            return right;
    }

    /**
     * Inorder Print print statement will be @middle
     * for pre order move it to before first call
     * for post order move it to post call
     *
     * @param node
     */
    private void printInOrder(Node node) {
        if (node != null) {
            printInOrder(node.left);
            System.out.print(node.data + " - ");
            printInOrder(node.right);
        }

    }

    /**
     * Simple Search DFS (Recursive approach)
     * @param node
     * @param target
     * @return boolean , true if element found
     */
    private boolean search(Node node, int target) {

        boolean result = false;
        if (node != null) {
            System.out.println("\n Visited "+node.data);
            if (target == node.data) {
                result =  true;
            } else if (target < node.data)
                result = search(node.left, target);
            else {
                result = search(node.right, target);
            }
        }
        return result;

    }


    /**
     * Performs a depth-first search, starting from the given node,
     * to target node
     *
     * @param root The root of the tree or subtree to be searched.
     * @return True if a goal node could be found.
     */
    static boolean dfs(Node root, int target) {
        Stack stack = new Stack();
        stack.push(root);

        while (!stack.isEmpty()) {
            Node node = (Node) stack.pop();
            System.out.println("Visited "+node.data);
            if (target == node.data) {
                return true;
            }
            if(node.left!=null) stack.add(node.left);
            if(node.right!=null) stack.add(node.right);
        }
        return false;
    }


    /**
     * Performs a breadth-first search, starting from the given node,
     * to target node
     *
     * @param root The root of the tree or subtree to be searched.
     * @return True if a goal node could be found.
     */
     static boolean bfs(Node root, int target){
        Queue<Node> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            Node node = queue.poll();
            System.out.println("Visited "+node.data);

            if (target == node.data) {
                return true;
            }
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
         return false;
    }






    public static void main(String[] args) {

        int searchItem = 16;
        BinarySearchTree bst = new BinarySearchTree();
        bst.insert(bst.root, 3);
        bst.insert(bst.root, 8);
        bst.insert(bst.root, 1);
        bst.insert(bst.root, 4);
        bst.insert(bst.root, 6);
        bst.insert(bst.root, 2);
        bst.insert(bst.root, 10);
        bst.insert(bst.root, 9);
        bst.insert(bst.root, 20);
        bst.insert(bst.root, 25);
        bst.insert(bst.root, 15);
        bst.insert(bst.root, 16);

        System.out.println("OutPut is :");
        bst.printInOrder(bst.root);


        System.out.print("\n Search Iterative "+bst.search(bst.root,searchItem));
        System.out.print("\n Search DFS "+bst.dfs(bst.root,searchItem));
        System.out.print("\n Search BFS "+bst.bfs(bst.root,searchItem));

        System.out.print("\n Delete  BFS "+bst.delete(bst.root,searchItem).data);

        System.out.print("\n Search Iterative "+bst.search(bst.root,searchItem));

    }
}

//TODO
//1 : Identify how many leaf nodes in tree