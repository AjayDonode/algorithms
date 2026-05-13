# 🌳 Tree Data Structure

> **Source:** [GeeksForGeeks – Introduction to Tree Data Structure](https://www.geeksforgeeks.org/dsa/introduction-to-tree-data-structure/)

A **tree** is a hierarchical (non-linear) data structure that organizes data in a **parent–child relationship**. Think of it like a real tree — there's a single trunk (root) from which branches (edges) grow out to leaves (leaf nodes).

---

## 📌 Table of Contents

1. [What is a Tree?](#what-is-a-tree)
2. [Basic Terminology](#basic-terminology)
3. [Key Properties](#key-properties)
4. [Why Non-Linear?](#why-non-linear)
5. [Types of Trees](#types-of-trees)
6. [Tree Traversals](#tree-traversals)
7. [Common Operations](#common-operations)
8. [Node Representation (Java)](#node-representation-java)
9. [Real-World Applications](#real-world-applications)

---

## What is a Tree?

A tree is a collection of **nodes** connected by **edges**, with the following rules:
- There is exactly **one root** node (no parent).
- Every other node has **exactly one parent**.
- There are **no cycles** — you can't loop back.

```
              [15]          ← Root (Level 0)
             /    \
          [35]    [12]      ← Level 1
          /  \
        [3]  [10]           ← Level 2  (Leaf nodes)
       /   \
     [1]   [6]              ← Level 3  (Leaf nodes)
```

---

## Basic Terminology

The diagram below uses a concrete example to label key parts:

```
                    [15]  ← Root Node
                   /    \
               [35]      [12] ← Siblings
              /    \
           [3]     [10]       ← Children of 35
          /   \
        [1]   [6]             ← Leaf Nodes (no children)
```

| Term | Definition | Example (from diagram above) |
|------|-----------|------------------------------|
| **Root Node** | Topmost node with no parent | `15` |
| **Parent Node** | Immediate predecessor of a node | `35` is the parent of `3` and `10` |
| **Child Node** | Immediate successor of a node | `3` and `10` are children of `35` |
| **Leaf Node** | Node with no children | `1`, `6`, `10`, `12` |
| **Internal Node** | Node with at least one child | `15`, `35`, `3` |
| **Sibling** | Nodes sharing the same parent | `3` and `10` are siblings |
| **Ancestor** | Any node on path from root → node | `15` and `35` are ancestors of `10` |
| **Descendant** | All nodes below a given node | `3`, `10`, `1`, `6` are descendants of `35` |
| **Subtree** | A node + all its descendants | `35`, `3`, `10`, `1`, `6` form a subtree |
| **Level** | Number of edges from root to node | Root is Level 0; `35` is Level 1 |
| **Degree of a node** | Number of children a node has | Degree of `35` = 2; Degree of `3` = 2 |
| **Height of tree** | Longest path from root to a leaf | Height of the above tree = 3 |
| **Depth of a node** | Number of edges from root to node | Depth of `6` = 3 |

---

## Key Properties

```
A tree with N nodes always has exactly N - 1 edges.
```

| Property | Formula / Rule |
|----------|---------------|
| Edges | `N - 1` (where N = number of nodes) |
| Path between any 2 nodes | Exactly **1 unique path** |
| Root depth | Always `0` |
| Leaf degree | Always `0` |

---

## Why Non-Linear?

Unlike arrays or linked lists where data is stored **sequentially** (one after another in a line), tree data is organized across **multiple levels**. There is no single "next" element — instead, a node can branch to multiple children.

```
Linear (Array / Linked List):
  [1] → [2] → [3] → [4] → [5]

Non-Linear (Tree):
         [1]
        /   \
      [2]   [3]
      / \
    [4] [5]
```

This multi-level structure makes trees ideal for representing **hierarchies**.

---

## Types of Trees

### Binary Tree
Each node has **at most 2 children** (left and right).

```
         [1]
        /   \
      [2]   [3]
      / \
    [4] [5]
```

#### Subtypes of Binary Tree

```
Full Binary Tree           Complete Binary Tree        Balanced Binary Tree
(0 or 2 children only)     (filled left to right)      (height difference ≤ 1)

       [1]                       [1]                         [1]
      /   \                     /   \                        /   \
    [2]   [3]                 [2]   [3]                   [2]   [3]
    / \                       / \   /                     /
  [4] [5]                   [4][5][6]                   [4]
```

---

### Ternary Tree
Each node can have **at most 3 children**: left, middle, right.

```
              [1]
           /   |   \
         [2]  [3]  [4]
```

---

### N-ary Tree (Generic Tree)
Each node can have **any number of children**. A list of child references is stored.

```
              [A]
           /  |  |  \
         [B] [C] [D] [E]
         / \       \
       [F] [G]     [H]
```

---

## Tree Traversals

There are two major strategies to visit every node in a tree:

### Depth-First Search (DFS)
Go **deep** into one branch before backtracking.

#### In-Order (Left → Root → Right) — Binary Trees only
```
       [4]
      /   \
    [2]   [6]
    / \   / \
  [1][3][5] [7]

In-Order: 1 → 2 → 3 → 4 → 5 → 6 → 7  ✅ (sorted for BST!)
```

#### Pre-Order (Root → Left → Right)
```
Pre-Order: 4 → 2 → 1 → 3 → 6 → 5 → 7
```

#### Post-Order (Left → Right → Root)
```
Post-Order: 1 → 3 → 2 → 5 → 7 → 6 → 4
```

---

### Breadth-First Search (BFS) / Level-Order
Visit nodes **level by level**, left to right.

```
         [1]          ← Visit level 0
        /   \
      [2]   [3]       ← Visit level 1
      / \
    [4] [5]           ← Visit level 2

BFS Order: 1 → 2 → 3 → 4 → 5
```

---

## Common Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Initialize a tree with a root node |
| **Insert** | Add a new node (as a child of an existing node) |
| **Search** | Find whether a specific value exists in the tree |
| **Delete** | Remove a node and handle its children |
| **Traverse** | Visit all nodes (DFS or BFS) |

---

## Node Representation (Java)

A generic tree node in Java stores the value and a **list of children** (since any number of children is possible):

```java
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single node in a generic (N-ary) tree.
 */
class Node {
    int data;
    List<Node> children;

    Node(int x) {
        data = x;
        children = new ArrayList<>();
    }
}
```

### Building and Printing a Tree (Java)

```java
import java.util.ArrayList;
import java.util.List;

class Node {
    int data;
    List<Node> children;

    Node(int x) {
        data = x;
        children = new ArrayList<>();
    }
}

class TreeDemo {

    // Add a child node to a parent
    static void addChild(Node parent, Node child) {
        parent.children.add(child);
    }

    // Print parent of each node
    static void printParents(Node node, Node parent) {
        if (parent == null)
            System.out.println(node.data + " -> NULL (root)");
        else
            System.out.println(node.data + " -> " + parent.data);

        for (Node child : node.children)
            printParents(child, node);
    }

    // Print children of each node
    static void printChildren(Node node) {
        System.out.print(node.data + " -> ");
        for (Node child : node.children)
            System.out.print(child.data + " ");
        System.out.println();
        for (Node child : node.children)
            printChildren(child);
    }

    // Print leaf nodes (nodes with no children)
    static void printLeafNodes(Node node) {
        if (node.children.isEmpty()) {
            System.out.print(node.data + " ");
            return;
        }
        for (Node child : node.children)
            printLeafNodes(child);
    }

    // Print degree of each node
    static void printDegrees(Node node, Node parent) {
        int degree = node.children.size();
        if (parent != null) degree++;   // count the edge to parent too
        System.out.println(node.data + " -> degree: " + degree);
        for (Node child : node.children)
            printDegrees(child, node);
    }

    public static void main(String[] args) {
        // Build the tree:
        //       1
        //      / \
        //     2   3
        //    / \
        //   4   5

        Node root = new Node(1);
        Node n2   = new Node(2);
        Node n3   = new Node(3);
        Node n4   = new Node(4);
        Node n5   = new Node(5);

        addChild(root, n2);
        addChild(root, n3);
        addChild(n2,   n4);
        addChild(n2,   n5);

        System.out.println("=== Parents of each node ===");
        printParents(root, null);

        System.out.println("\n=== Children of each node ===");
        printChildren(root);

        System.out.print("\n=== Leaf nodes ===\n");
        printLeafNodes(root);
        System.out.println();

        System.out.println("\n=== Degrees of each node ===");
        printDegrees(root, null);
    }
}
```

### Expected Output

```
=== Parents of each node ===
1 -> NULL (root)
2 -> 1
4 -> 2
5 -> 2
3 -> 1

=== Children of each node ===
1 -> 2 3
2 -> 4 5
4 ->
5 ->
3 ->

=== Leaf nodes ===
4 5 3

=== Degrees of each node ===
1 -> degree: 2
2 -> degree: 3
4 -> degree: 1
5 -> degree: 1
3 -> degree: 1
```

---

## Real-World Applications

| Domain | How Trees Are Used |
|--------|-------------------|
| **File Systems** | Folders and files form a tree (root `/`, subfolders as children) |
| **DOM (Web)** | HTML document is a tree; `<html>` is root, `<head>` and `<body>` are children |
| **Databases** | B-Trees and B+ Trees power efficient disk-based indexing |
| **Compilers** | Abstract Syntax Trees (AST) represent code structure |
| **AI / Game Dev** | Decision trees, Minimax trees for game-playing agents |
| **Networking** | Routing tables, spanning trees in network graphs |
| **Autocomplete** | Tries (prefix trees) enable fast word lookup |

---

## Quick Summary Diagram

```
                          TREE
                         /    \
              Structure         Operations
             /          \       /       \
          Nodes        Edges  Search  Traverse
         /  |  \                      /     \
       Root Leaf Internal            DFS    BFS
                                   / | \
                               Pre  In  Post
                               Order Order Order
```

---

> 📖 **Further Reading:**
> - [Types of Trees in Data Structures – GFG](https://www.geeksforgeeks.org/dsa/types-of-trees-in-data-structures/)
> - [Depth-First Search – GFG](https://www.geeksforgeeks.org/dsa/depth-first-search-or-dfs-for-a-graph/)
> - [Breadth-First Search – GFG](https://www.geeksforgeeks.org/dsa/breadth-first-search-or-bfs-for-a-graph/)