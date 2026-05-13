package com.dnex.algorithm.trees;

import java.util.LinkedList;
import java.util.Queue;


/**
 * Class to demonstrate different methods of inverting (mirroring) a binary tree.
 */
public class InvertBTree {

    public static void main (String[] args) {
        System.out.println("--- Starting Binary Tree Inversion ---");

        // 1. Build Sample Tree: [4, 2, 7, 1, 3, 6, 9]
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);

        System.out.println("\n[Original Tree Layout]:");
        printTree(root, "Root ", 1);

        // 2. Demonstrate Recursive Inversion (DFS)
        System.out.println("\n--- Performing Recursive Inversion (DFS) ---");
        TreeNode invertedRootRec = invertTreeRec(root);
        printTree(invertedRootRec, "Root", 1);

        // 3. Demonstrate Iterative Inversion (BFS)
        // Note: Running this on an already inverted tree will flip it back to original!
        System.out.println("\n--- Performing Iterative Inversion (BFS) - Returns to Original ---");
        TreeNode originalRoot = invertTree(invertedRootRec);
        printTree(originalRoot, "Root", 1);
    }

    /**
     * Iterative Approach (BFS - Breadth First Search)
     * Uses a Queue to traverse the tree level by level.
     * Best for: Avoiding StackOverflow on very deep trees.
     *
     * Time Complexity: O(N) - visits each node once.
     * Space Complexity: O(W) - where W is the max width of the tree (Queue size).
     */
    private static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);

        while (!queue.isEmpty()) {
            // Remove the node from the front of the queue
            TreeNode current = queue.poll();
            // Swap the left and right pointers of the current node
            TreeNode tmp = current.left;
            current.left = current.right;
            current.right = tmp;

            // Add children to the queue to process them in the next iterations
            if (current.left != null) queue.add(current.left);
            if (current.right != null) queue.add(current.right);
        }
        return root;
    }


    /**
     * Recursive Approach (DFS - Depth First Search)
     * Swaps children by diving to the bottom of the tree first.
     * Best for: Simple, readable code and balanced trees.
     * Time Complexity: O(N) - visits each node once.
     * Space Complexity: O(H) - where H is height of the tree (Recursion Stack).
     */

    private static TreeNode invertTreeRec(TreeNode root) {
        // Base case: If we hit a leaf's child, stop
        if (root == null) return null;

        // Temporary storage for the left child before it gets overwritten
        TreeNode tmp = root.left;

        // Assign the right subtree (inverted) to the left side
        root.left = invertTreeRec(root.right);

        // Assign the stored left subtree (inverted) to the right side
        root.right = invertTreeRec(tmp);

        return root;
    }

    /**
     * Visualizer method to print the tree structure to the console.
     * @param node The node to start printing from.
     * @param prefix String label for the node (Root, L, R).
     * @param level Current depth for indentation spacing.
     */
    public static void printTree(TreeNode node, String prefix, int level) {
        if (node == null) return;

        // Create visual indentation based on tree depth
        String indentation = "    ".repeat(level);
        System.out.println(indentation + prefix + ": " + node.value);

        // Print children recursively
        printTree(node.left, "L--", level + 1);
        printTree(node.right, "R--", level + 1);
    }
}
