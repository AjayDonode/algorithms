package com.dnex.algorithm.trees;

import java.util.HashMap;

/**
 * ============================================================
 * PROBLEM: Implement Trie (Prefix Tree)  (LeetCode #208)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Design a data structure called a Trie that supports three
 *   operations on a dynamic set of strings:
 *
 *     insert(word)      — Adds word to the trie.
 *     search(word)      — Returns true if the exact word exists.
 *     startsWith(prefix)— Returns true if any stored word begins
 *                         with the given prefix.
 *
 * ─────────────────────────────────────────────────────────────
 * WHAT IS A TRIE?
 * ─────────────────────────────────────────────────────────────
 *   A Trie (from re-TRIE-val) is a tree where each NODE
 *   represents one character.  Paths from root → leaf spell
 *   out complete words.
 *
 *   Inserting ["Apple", "Apricot", "April", "Banana"]:
 *
 *                  (root)
 *                 /      \
 *                A        B
 *                |        |
 *                p        a
 *                |        |
 *                p        n
 *               / \       |
 *              l   r      a
 *              |   |      |
 *              e  i(c)    n
 *             [*]  |  \   |
 *                  o   l  a
 *                  |   |  [*]
 *                  t   [*]
 *                  [*]
 *
 *   [*] = isEnd marker — signals a complete word ends here.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — HashMap-based children (no fixed 26-array)
 * ─────────────────────────────────────────────────────────────
 *   Each TrieNode stores:
 *     • children : HashMap<Character, TrieNode>
 *       → supports any character set, not just a–z
 *     • isEnd    : boolean
 *       → true when this node is the last letter of a stored word
 *
 *   OPERATIONS:
 *
 *     insert(word):
 *       Walk character by character from root.
 *       If the next child doesn't exist, create it.
 *       After the last character, set isEnd = true.
 *
 *     search(word):
 *       Walk the same path. If we fall off the trie at any
 *       character, return false.  At the end, return isEnd —
 *       ensures we matched a *complete* word, not just a prefix.
 *
 *     startsWith(prefix):
 *       Identical walk to search(), but return true as soon as
 *       we successfully consume every character of the prefix
 *       (we do NOT check isEnd).
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   insert      Time O(L)   Space O(L)   L = length of word
 *   search      Time O(L)   Space O(1)
 *   startsWith  Time O(L)   Space O(1)
 *   Total Space O(N · L)  N = number of words stored
 * ============================================================
 */
public class TriePrefixTree {


    private static class TrieNode {
        HashMap<Character, TrieNode> children;
        boolean                      isEnd;

        TrieNode() {
            this.children = new HashMap<>();
            this.isEnd    = false;
        }
    }

    private final TrieNode root;

    public TriePrefixTree() {
        this.root = new TrieNode();
    }


    public void insert(String word) {
        TrieNode current = root;

        for (char ch : word.toCharArray()) {
            // computeIfAbsent creates a new node only when ch is missing.
            current = current.children.computeIfAbsent(ch, k -> new TrieNode());
        }

        current.isEnd = true;   // mark the last node as a complete word
    }


    public boolean search(String word) {
        TrieNode node = walkTo(word);
        return node != null && node.isEnd;   // node exists AND marks a full word
    }

    
    public boolean startsWith(String prefix) {
        return walkTo(prefix) != null;   // path exists → some word has this prefix
    }

    
    private TrieNode walkTo(String word) {
        TrieNode current = root;

        for (char ch : word.toCharArray()) {
            current = current.children.get(ch);
            if (current == null) return null;   // path breaks — word not present
        }

        return current;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // printTrie — visual helper; mirrors the style of printTree() in this package.
    //
    // Walks the trie recursively and prints each branch with box-drawing chars:
    //   (root)
    //   ├── A
    //   │   └── p
    //   │       └── p
    //   │           ├── l
    //   │           │   └── e [WORD]
    //   │           └── r
    //   │               └── i
    //   │                   ├── c
    //   │                   │   └── o
    //   │                   │       └── t [WORD]
    //   │                   └── l [WORD]
    //   └── B ...
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Prints a visual representation of the trie to standard output.
     * Word-end nodes are labelled {@code [WORD]}.
     */
    public void printTrie() {
        System.out.println("(root)");
        printNode(root, "");
    }


    private void printNode(TrieNode node, String prefix) {
        int total = node.children.size();
        int idx   = 0;

        for (char ch : node.children.keySet()) {
            idx++;
            boolean isLast       = (idx == total);
            String  connector    = isLast ? "└── " : "├── ";
            String  childPrefix  = isLast ? "    " : "│   ";

            TrieNode child = node.children.get(ch);
            String   label = prefix + connector + ch + (child.isEnd ? " [WORD]" : "");
            System.out.println(label);

            printNode(child, prefix + childPrefix);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // main — demonstrates insert, search, startsWith, and the visual trie print.
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        TriePrefixTree trie = new TriePrefixTree();

        // ── Insert words ──────────────────────────────────────────────────────
        String[] words = { "Apple", "Apricot", "April", "App", "Banana" };
        System.out.println("=== Inserting words ===");
        for (String w : words) {
            trie.insert(w);
            System.out.println("  Inserted: " + w);
        }

        // ── Visual trie ───────────────────────────────────────────────────────
        System.out.println("\n=== Trie Structure ===");
        trie.printTrie();

        // ── search() tests ────────────────────────────────────────────────────
        System.out.println("\n=== search() ===");
        System.out.println("  search(\"Apple\")   → " + trie.search("Apple"));    // true
        System.out.println("  search(\"App\")     → " + trie.search("App"));      // true  (inserted)
        System.out.println("  search(\"Ap\")      → " + trie.search("Ap"));       // false (prefix only)
        System.out.println("  search(\"Apricot\") → " + trie.search("Apricot")); // true
        System.out.println("  search(\"Apri\")    → " + trie.search("Apri"));    // false
        System.out.println("  search(\"Mango\")   → " + trie.search("Mango"));   // false

        // ── startsWith() tests ────────────────────────────────────────────────
        System.out.println("\n=== startsWith() ===");
        System.out.println("  startsWith(\"Apr\")  → " + trie.startsWith("Apr")); // true
        System.out.println("  startsWith(\"App\")  → " + trie.startsWith("App")); // true
        System.out.println("  startsWith(\"Ban\")  → " + trie.startsWith("Ban")); // true
        System.out.println("  startsWith(\"Cat\")  → " + trie.startsWith("Cat")); // false
    }
}
