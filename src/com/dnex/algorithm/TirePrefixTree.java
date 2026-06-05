package com.dnex.algorithm;

import java.util.HashMap;

/**
 * Trie (Prefix Tree) – Insert, Search, and StartsWith
 *
 * <p><b>What is a Trie?</b><br>
 * A Trie is a tree-like data structure where each node represents one character.
 * Words are stored by sharing common prefixes, making it extremely efficient for
 * prefix-based lookups such as autocomplete, spell-check, and dictionary search.
 *
 * <p><b>Structure for words "Apple", "Apricot", "April":</b>
 * <pre>
 *   root ('\0')
 *   └── A
 *       └── p
 *           ├── p
 *           │   └── l
 *           │       └── e [END]          ← "Apple"
 *           └── r
 *               ├── i
 *               │   └── c
 *               │       └── o
 *               │           └── t [END]  ← "Apricot"
 *               └── i
 *                   └── l [END]          ← "April"
 *
 *   Note: "Apr" is a shared prefix for both "Apricot" and "April"
 * </pre>
 *
 * <p><b>Operations:</b>
 * <ul>
 *   <li>{@link #insertWord(TrieNode, String)}   – Add a word to the Trie</li>
 *   <li>{@link #search(TrieNode, String)}        – Check if exact word exists</li>
 *   <li>{@link #startsWith(TrieNode, String)}    – Check if any word starts with prefix</li>
 * </ul>
 *
 * <p><b>Complexity per operation:</b>
 * <ul>
 *   <li>Time  : O(m) where m = length of the word / prefix</li>
 *   <li>Space : O(m × n) where n = number of words stored</li>
 * </ul>
 *
 * <p><b>Common interview problems:</b>
 * Autocomplete / Typeahead, Word Search II (LC#212), Replace Words (LC#648),
 * Longest Common Prefix (LC#14), Implement Trie (LC#208)
 *
 * @see <a href="http://www.programcreek.com/2014/05/leetcode-implement-trie-prefix-tree-java/">
 *      programcreek – Trie reference</a>
 */
public class TirePrefixTree {

    public static void main(String[] args) {

        TrieNode root =  new TrieNode('\0');

        // ── Insert words ──────────────────────────────────────────────────────
        System.out.println("=== Inserting words ===");
        insertWord(root, "Apple");
        insertWord(root, "Apricot");
        insertWord(root, "April");
        insertWord(root, "App");
        insertWord(root, "Banana");
        System.out.println("Inserted: Apple, Apricot, April, App, Banana");
        System.out.println();

        // ── Search (exact match) ──────────────────────────────────────────────
        System.out.println("=== Search (exact word) ===");
        String[] searchWords = {"Apple", "App", "Ap", "April", "Banana", "Ban"};
        for (String w : searchWords) {
            System.out.printf("  search(\"%s\")     = %b%n", w, search(root, w));
        }
        System.out.println();

        // ── StartsWith (prefix match) ─────────────────────────────────────────
        System.out.println("=== StartsWith (prefix check) ===");
        String[] prefixes = {"App", "Apr", "Ban", "Cat", "A", "Ap"};
        for (String p : prefixes) {
            System.out.printf("  startsWith(\"%s\")  = %b%n", p, startsWith(root, p));
        }
    }



    // =========================================================================
    // insertWord — adds every character of the word as a chain of TrieNodes.
    //
    // For each character:
    //   - If a child node for that character already exists → move into it
    //   - Otherwise               → create a new node and move into it
    // After the last character, mark the node as a word ending (isEnd = true).
    //
    // Example: inserting "Apr" into a Trie that already has "Apple":
    //   root → A (exists) → p (exists) → r (NEW node created) → mark END
    //
    // Time O(m)  where m = word length
    // =========================================================================
    private static void insertWord(TrieNode root, String word) {
        TrieNode currNode = root;

        for (int i = 0; i < word.length(); i++) {
            char ch = word.charAt(i);
            HashMap<Character, TrieNode> children = currNode.getChildren();

            if (children.containsKey(ch)) {
                currNode = children.get(ch);       // character node already exists
            } else {
                TrieNode newNode = new TrieNode(ch);
                children.put(ch, newNode);         // create new character node
                currNode = newNode;
            }
        }

        currNode.setIsEnd(true);   // mark the final node as a complete word
    }

    // =========================================================================
    // search — returns true ONLY if the EXACT word exists in the Trie.
    //
    // Traverses one character at a time.
    // If any character is missing from the tree → word not found.
    // If all characters found but the last node is NOT marked isEnd → word
    // was never inserted (it may only be a prefix of another word).
    //
    // Example: "App" is inserted. Searching "Ap" → false (not marked as end).
    //
    // Time O(m)  where m = word length
    // =========================================================================
    private static boolean search(TrieNode root, String word) {
        TrieNode currNode = root;

        for (int i = 0; i < word.length(); i++) {
            char ch = word.charAt(i);
            HashMap<Character, TrieNode> children = currNode.getChildren();

            if (!children.containsKey(ch)) {
                return false;           // character path does not exist
            }
            currNode = children.get(ch);
        }

        return currNode.isEnd();        // true only if this is a complete word
    }

    // =========================================================================
    // startsWith — returns true if ANY inserted word begins with the prefix.
    //
    // Same traversal as search() but does NOT check isEnd() at the final node.
    // Any prefix that exists as a path in the Trie returns true.
    //
    // Example: "App", "Apple", "Apricot" inserted.
    //   startsWith("Ap")  → true  (shared prefix of all three)
    //   startsWith("Apr") → true  (prefix of "Apricot")
    //   startsWith("Apt") → false (no word has this prefix)
    //
    // Time O(m)  where m = prefix length
    // =========================================================================
    private static boolean startsWith(TrieNode root, String prefix) {
        TrieNode currNode = root;

        for (int i = 0; i < prefix.length(); i++) {
            char ch = prefix.charAt(i);
            HashMap<Character, TrieNode> children = currNode.getChildren();

            if (!children.containsKey(ch)) {
                return false;           // prefix path does not exist
            }
            currNode = children.get(ch);
        }

        return true;                    // all prefix characters found → match
    }
}


// =============================================================================
// TrieNode — a single node in the Trie
//
// Fields:
//   value    – the character this node represents
//   children – map of child characters to their TrieNode
//   isEnd    – true if this node is the last character of an inserted word
// =============================================================================
class TrieNode {

    private final char value;
    private final HashMap<Character, TrieNode> children;
    private boolean isEnd;

    TrieNode(char letter) {
        this.value    = letter;
        this.children = new HashMap<>();
        this.isEnd    = false;
    }

    public HashMap<Character, TrieNode> getChildren() { return children; }
    public char    getValue()                          { return value;    }
    public boolean isEnd()                             { return isEnd;    }
    public void    setIsEnd(boolean val)               { isEnd = val;     }
}
