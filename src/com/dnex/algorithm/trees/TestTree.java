package com.dnex.algorithm.trees;

/**
 * Demonstrates binary tree printing and BST validation
 * using the shared {@link TreeNode} from the trees package.
 */
public class TestTree {

    public static void main(String[] args) {

        // ---------------------------------------------------------------
        // Test 1: NOT a valid BST
        //
        //              1
        //            /   \
        //           2     3       ← violates BST: left child (2) > root (1)
        //          / \   / \
        //         4   5 6   7
        //        / \
        //       8   9
        // ---------------------------------------------------------------
        TreeNode invalidRoot    = new TreeNode(1);
        TreeNode aNode          = new TreeNode(2);
        TreeNode bNode          = new TreeNode(3);
        TreeNode cNode          = new TreeNode(4);
        TreeNode dNode          = new TreeNode(5);
        TreeNode eNode          = new TreeNode(6);
        TreeNode fNode          = new TreeNode(7);
        TreeNode gNode          = new TreeNode(8);
        TreeNode hNode          = new TreeNode(9);

        invalidRoot.left  = aNode;
        invalidRoot.right = bNode;
        aNode.left        = cNode;
        aNode.right       = dNode;
        bNode.left        = eNode;
        bNode.right       = fNode;
        cNode.left        = gNode;
        cNode.right       = hNode;

        System.out.println("=== Tree 1 (NOT a valid BST) ===");
        printTree(invalidRoot);
        System.out.println("Is valid BST? " + isValidBST(invalidRoot));

        System.out.println();

        // ---------------------------------------------------------------
        // Test 2: VALID BST
        //
        //              8
        //            /   \
        //           4    12        BST rule: left < parent < right
        //          / \   / \
        //         2   6 10  15
        //
        //  Check:  4 < 8 < 12  ✓
        //          2 < 4 < 6   ✓
        //         10 < 12 < 15 ✓
        // ---------------------------------------------------------------
        TreeNode validRoot       = new TreeNode(8);
        validRoot.left           = new TreeNode(4);
        validRoot.right          = new TreeNode(12);
        validRoot.left.left      = new TreeNode(2);
        validRoot.left.right     = new TreeNode(6);
        validRoot.right.left     = new TreeNode(10);
        validRoot.right.right    = new TreeNode(15);

        System.out.println("=== Tree 2 (Valid BST) ===");
        printTree(validRoot);
        System.out.println("Is valid BST? " + isValidBST(validRoot));
    }

    // ---------------------------------------------------------------
    // BST Validation
    // ---------------------------------------------------------------

    /**
     * Returns true if the binary tree rooted at {@code root} is a valid BST.
     *
     * <p>Strategy — In-Order Traversal:</p>
     * A BST's in-order traversal (left → root → right) always produces
     * a STRICTLY INCREASING sequence. We traverse in-order and compare
     * each node to the one visited just before it; if any node is ≤ its
     * predecessor the BST rule is broken.
     *
     * <pre>
     *   In-order of the valid BST above:
     *   2 → 4 → 6 → 8 → 10 → 12 → 15   (strictly increasing ✓)
     * </pre>
     *
     * @param root the root of the tree to validate
     * @return true if the tree is a valid BST, false otherwise
     */
    public static boolean isValidBST(TreeNode root) {
        // Integer[] lets us share one "previous value" reference across
        // all recursive calls. prev[0] == null means nothing visited yet.
        Integer[] prev = { null };
        return inOrderCheck(root, prev);
    }

    /**
     * In-order traversal helper for BST validation.
     * At each node checks that {@code node.value} is strictly greater
     * than the previously visited value.
     *
     * @param node the current node
     * @param prev single-element array holding the last in-order value seen
     * @return false as soon as a violation is found, true if all nodes pass
     */
    private static boolean inOrderCheck(TreeNode node, Integer[] prev) {
        if (node == null) return true;                     // empty subtree — valid

        if (!inOrderCheck(node.left, prev)) return false;  // 1. recurse left

        // 2. visit — must be strictly greater than the previous value
        if (prev[0] != null && node.value <= prev[0]) {
            System.out.println("  ✗ Node " + node.value
                    + " is not greater than previous in-order value " + prev[0]);
            return false;
        }
        prev[0] = node.value;

        return inOrderCheck(node.right, prev);             // 3. recurse right
    }

    // ---------------------------------------------------------------
    // Tree Printing
    // ---------------------------------------------------------------

    /**
     * Prints the binary tree rooted at {@code root} using box-drawing
     * connectors to visualise the hierarchy.
     *
     * <pre>
     *   8
     *   ├── 4
     *   │   ├── 2
     *   │   └── 6
     *   └── 12
     *       ├── 10
     *       └── 15
     * </pre>
     *
     * @param root the root node to start printing from
     */
    public static void printTree(TreeNode root) {
        if (root == null) { System.out.println("(empty tree)"); return; }
        System.out.println(root.value);
        printTree(root, "");
    }

    /**
     * Recursive helper that draws each child with the correct connector
     * and propagates the updated prefix to deeper levels.
     *
     * <ul>
     *   <li>Left child  → {@code ├── } (when right also exists) or {@code └── }</li>
     *   <li>Right child → always {@code └── } (always the last sibling)</li>
     * </ul>
     *
     * @param node   the current node
     * @param prefix accumulated indentation string from parent levels
     */
    private static void printTree(TreeNode node, String prefix) {
        // --- left child ---
        if (node.left != null) {
            boolean leftIsLast = (node.right == null);
            String connector   = leftIsLast ? "└── " : "├── ";
            System.out.println(prefix + connector + node.left.value);
            printTree(node.left, prefix + (leftIsLast ? "    " : "│   "));
        }
        // --- right child (always the last sibling) ---
        if (node.right != null) {
            System.out.println(prefix + "└── " + node.right.value);
            printTree(node.right, prefix + "    ");
        }
    }
}
