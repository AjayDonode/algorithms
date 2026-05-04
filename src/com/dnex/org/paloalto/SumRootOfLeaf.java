package com.dnex.org.paloalto;

import com.dnex.common.TreeNode;

/**
 * ============================================================
 * PROBLEM: Sum Root to Leaf Numbers  (LeetCode #129)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given a binary tree where each node holds a single digit (0–9),
 *   every root-to-leaf path spells out a number.
 *   Return the TOTAL SUM of all such numbers.
 *
 * EXAMPLE TREE:
 *
 *          1
 *         / \
 *        2   3
 *       / \
 *      4   5
 *
 *   Root-to-leaf paths:
 *     1 → 2 → 4   forms the number  124
 *     1 → 2 → 5   forms the number  125
 *     1 → 3       forms the number   13
 *
 *   Total sum = 124 + 125 + 13 = 262
 *
 * ─────────────────────────────────────────────────────────────
 * ALGORITHM  (DFS — Depth-First Search, Pre-order)
 * ─────────────────────────────────────────────────────────────
 *
 *   We carry a running "currentSum" as we travel DOWN the tree.
 *   At every node we apply:
 *
 *       currentSum = currentSum * 10 + nodeValue
 *
 *   This "shifts" the existing digits left by one decimal place
 *   and appends the new digit — exactly how a number is built
 *   digit-by-digit.
 *
 *   Example trace on the tree above:
 *
 *     visit node 1 : currentSum = 0  * 10 + 1 = 1
 *     visit node 2 : currentSum = 1  * 10 + 2 = 12
 *     visit node 4 : currentSum = 12 * 10 + 4 = 124  ← LEAF → return 124
 *     visit node 5 : currentSum = 12 * 10 + 5 = 125  ← LEAF → return 125
 *     node 2 returns 124 + 125 = 249
 *     visit node 3 : currentSum = 1  * 10 + 3 = 13   ← LEAF → return 13
 *     node 1 returns 249 + 13 = 262
 *
 *   BASE CASES:
 *     • node == null  → return 0  (went past a missing child; adds nothing)
 *     • LEAF node     → return currentSum  (one complete path-number)
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY
 * ─────────────────────────────────────────────────────────────
 *   Time  : O(N)  — every node is visited exactly once.
 *   Space : O(H)  — call-stack depth = tree height H.
 *                   O(log N) for a balanced tree,
 *                   O(N)     for a fully skewed tree.
 * ============================================================
 */
public class SumRootOfLeaf {

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.setLeftNode(new TreeNode(2));
        root.setRightNode(new TreeNode(3));
        root.getLeftNode().setLeftNode(new TreeNode(4));
        root.getLeftNode().setRightNode(new TreeNode(5));

        System.out.println("Sum of root to leaf numbers: " + sumNumbers(root, 0));
        // Expected: 262
    }

    /**
     * Recursively computes the sum of all root-to-leaf numbers.
     *
     * @param node       current node being visited
     * @param currentSum number formed by digits on the path so far
     * @return sum of all path-numbers in the subtree rooted at this node
     */
    private static int sumNumbers(TreeNode node, int currentSum) {
        // Base case: null node contributes nothing
        if (node == null) {
            return 0;
        }

        // Append this node's digit to the running number
        currentSum = currentSum * 10 + (int) node.getValue();

        // Base case: leaf node — currentSum IS the complete path-number
        if (node.getLeftNode() == null && node.getRightNode() == null) {
            return currentSum;
        }

        // Recursive case: sum results from both subtrees
        return sumNumbers(node.getLeftNode(), currentSum)
                + sumNumbers(node.getRightNode(), currentSum);
    }
}