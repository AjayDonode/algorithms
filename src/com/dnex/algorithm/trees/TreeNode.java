package com.dnex.algorithm.trees;

/**
 * Shared binary tree node for the {@code com.dnex.algorithm.trees} package.
 *
 * <p>Structure:</p>
 * <pre>
 *        [value]
 *        /     \
 *     [left] [right]
 * </pre>
 *
 * <p>Used by all tree classes in this package so the node definition
 * lives in exactly one place.</p>
 */
public class TreeNode {

    /** The integer value stored in this node. */
    public int value;

    /** Reference to the left child (null if none). */
    public TreeNode left;

    /** Reference to the right child (null if none). */
    public TreeNode right;

    /**
     * Creates a leaf node with the given value.
     * Both children default to {@code null}.
     *
     * @param value the integer value stored in this node
     */
    public TreeNode(int value) {
        this.value = value;
        this.left  = null;
        this.right = null;
    }
}
