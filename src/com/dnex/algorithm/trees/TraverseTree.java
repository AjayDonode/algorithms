package com.dnex.algorithm.trees;

import java.util.ArrayList;

/**
 * Demonstrates In-Order, Pre-Order, and Post-Order traversals
 * using the shared {@link TreeNode} from the trees package.
 */
public class TraverseTree {

    public static void main(String[] args) {

        /*
         * Build this BST:
         *
         *         8
         *        / \
         *       4  12
         *      / \ / \
         *     2  6 10 15
         */
        TreeNode root        = new TreeNode(8);
        root.left            = new TreeNode(4);
        root.right           = new TreeNode(12);
        root.left.left       = new TreeNode(2);
        root.left.right      = new TreeNode(6);
        root.right.left      = new TreeNode(10);
        root.right.right     = new TreeNode(15);

        InorderTreeData traversal = new InorderTreeData();

        System.out.println("In-Order   (Left → Node → Right): " + traversal.inorder(root));
        System.out.println("Pre-Order  (Node → Left → Right): " + traversal.preorder(root));
        System.out.println("Post-Order (Left → Right → Node): " + traversal.postorder(root));
    }

    // ── Traversal implementations ────────────────────────────────────

    /**
     * Provides inorder, preorder, and postorder traversals
     * over a binary tree built with {@link TreeNode}.
     */
    public static class InorderTreeData {

        // ── In-Order: Left → Node → Right ───────────────────────────
        // Result for a BST is always SORTED (ascending).
        //
        //         8          Visit order: 2, 4, 6, 8, 10, 12, 15
        //        / \
        //       4  12
        //      / \ / \
        //     2  6 10 15
        //
        public ArrayList<Integer> inorder(TreeNode node) {
            ArrayList<Integer> output = new ArrayList<>();
            inorderHelper(node, output);
            return output;
        }

        private void inorderHelper(TreeNode node, ArrayList<Integer> output) {
            if (node == null) return;           // base case
            inorderHelper(node.left,  output);  // 1. go left
            output.add(node.value);             // 2. visit node
            inorderHelper(node.right, output);  // 3. go right
        }

        // ── Pre-Order: Node → Left → Right ──────────────────────────
        // Visits the root FIRST — useful for copying/serialising a tree.
        //
        //         8          Visit order: 8, 4, 2, 6, 12, 10, 15
        //        / \
        //       4  12
        //      / \ / \
        //     2  6 10 15
        //
        public ArrayList<Integer> preorder(TreeNode node) {
            ArrayList<Integer> output = new ArrayList<>();
            preorderHelper(node, output);
            return output;
        }

        private void preorderHelper(TreeNode node, ArrayList<Integer> output) {
            if (node == null) return;           // base case
            output.add(node.value);             // 1. visit node
            preorderHelper(node.left,  output); // 2. go left
            preorderHelper(node.right, output); // 3. go right
        }

        // ── Post-Order: Left → Right → Node ─────────────────────────
        // Visits the root LAST — useful for deleting/evaluating a tree.
        //
        //         8          Visit order: 2, 6, 4, 10, 15, 12, 8
        //        / \
        //       4  12
        //      / \ / \
        //     2  6 10 15
        //
        public ArrayList<Integer> postorder(TreeNode node) {
            ArrayList<Integer> output = new ArrayList<>();
            postorderHelper(node, output);
            return output;
        }

        private void postorderHelper(TreeNode node, ArrayList<Integer> output) {
            if (node == null) return;            // base case
            postorderHelper(node.left,  output); // 1. go left
            postorderHelper(node.right, output); // 2. go right
            output.add(node.value);              // 3. visit node
        }
    }
}
