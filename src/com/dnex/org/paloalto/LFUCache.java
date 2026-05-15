package com.dnex.org.paloalto;

import java.util.HashMap;

/**
 * ============================================================
 * PROBLEM: LFU Cache  (LeetCode #460)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Design a data structure that behaves like a fixed-capacity cache
 *   with a Least-Frequently-Used (LFU) eviction policy.
 *
 *   It must support two operations in O(1) average time:
 *     get(key)        — Return the value if the key exists, else -1.
 *                       Increments the key's access frequency.
 *     put(key, value) — Insert or update the key.
 *                       If the cache is at capacity, evict the
 *                       least-frequently-used entry first.
 *                       Tie-break: evict the least-recently-used
 *                       among entries sharing the lowest frequency.
 *
 * ─────────────────────────────────────────────────────────────
 * HOW LFU DIFFERS FROM LRU
 * ─────────────────────────────────────────────────────────────
 *   LRU  →  "Evict what I haven't touched in the longest time."
 *   LFU  →  "Evict what I have used the fewest times overall."
 *
 *   Example  (capacity = 3)
 *     put(A), put(B), put(C)
 *     get(A)  get(A)  get(B)   ← A used 2×, B used 1× (+ initial), C used 0×
 *     put(D)  →  LFU evicts C (lowest freq)
 *               LRU would have evicted A (longest idle time)
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — Two HashMaps + per-frequency Doubly-Linked Lists
 * ─────────────────────────────────────────────────────────────
 *   We maintain three data structures:
 *
 *   1. keyMap   : key  → Node
 *                 O(1) lookup of any cached entry.
 *
 *   2. freqMap  : freq → DoublyLinkedList of Nodes
 *                 Every node with the same access frequency lives
 *                 in one list, ordered MRU → LRU within that list.
 *
 *   3. minFreq  : integer tracking the current lowest frequency.
 *                 When we must evict, we go to freqMap[minFreq]
 *                 and remove the tail node (LRU within that bucket).
 *
 *   INVARIANT: every Node stores its own frequency so we can
 *   move it from freqMap[f] to freqMap[f+1] in O(1).
 *
 * ─────────────────────────────────────────────────────────────
 *   OPERATIONS:
 *
 *     get(key):
 *       1. Miss → return -1.
 *       2. Hit  → call incrementFreq(node), return node.value.
 *
 *     put(key, value):
 *       1. Key exists  → update value, call incrementFreq(node).
 *       2. New key:
 *            a. If at capacity → evict tail of freqMap[minFreq],
 *               remove from keyMap.
 *            b. Create node with freq=1, add to freqMap[1],
 *               add to keyMap, set minFreq = 1.
 *
 *     incrementFreq(node):
 *       1. Remove node from freqMap[node.freq].
 *       2. If that list is now empty AND node.freq == minFreq,
 *          increment minFreq (the minimum just disappeared).
 *       3. node.freq++.
 *       4. Insert node at the head of freqMap[node.freq] (MRU slot).
 *
 * ─────────────────────────────────────────────────────────────
 * WORKED EXAMPLE  (capacity = 2)
 * ─────────────────────────────────────────────────────────────
 *   put(1,1)  freqMap: {1→[1]}              minFreq=1
 *   put(2,2)  freqMap: {1→[2,1]}            minFreq=1
 *   get(1)    → 1; freq[1]→2  freqMap: {1→[2], 2→[1]}  minFreq=1
 *   put(3,3)  → evict LFU=tail of freq[1]=key 2
 *              freqMap: {1→[3], 2→[1]}      minFreq=1
 *   get(2)    → -1  (evicted)
 *   get(3)    → 3;  freq[3]→2  freqMap: {2→[3,1]}      minFreq=2
 *   put(4,4)  → evict LFU=tail of freq[2]=key 1 (LRU tie-break)
 *              freqMap: {1→[4], 2→[3]}      minFreq=1
 *   get(1)    → -1  (evicted)
 *   get(3)    → 3
 *   get(4)    → 4
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   get   Time O(1)   Space O(1)
 *   put   Time O(1)   Space O(1)
 *   Total Space O(capacity) for the maps + list nodes
 * ============================================================
 */
public class LFUCache {

    // ──────────────────────────────────────────────────────────────────────────
    // Node — one cache entry.
    //
    // Stores key (needed for eviction clean-up in keyMap), value, and the
    // node's current access frequency.  prev/next wire it into its freq-bucket
    // doubly-linked list.
    // ──────────────────────────────────────────────────────────────────────────
    private static class Node {
        int  key;
        int  value;
        int  freq;   // how many times this key has been accessed
        Node prev;
        Node next;

        Node(int key, int value) {
            this.key   = key;
            this.value = value;
            this.freq  = 1;   // every new entry starts with frequency 1
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DoublyLinkedList — one frequency bucket.
    //
    // head.next = most-recently-used node in this bucket  (insertion point)
    // tail.prev = least-recently-used node in this bucket (eviction point)
    //
    // Using sentinel head/tail eliminates all null-edge-case checks.
    // ──────────────────────────────────────────────────────────────────────────
    private static class DoublyLinkedList {
        Node head; // dummy MRU sentinel
        Node tail; // dummy LRU sentinel
        int  size;

        DoublyLinkedList() {
            head      = new Node(0, 0);
            tail      = new Node(0, 0);
            head.next = tail;
            tail.prev = head;
            size      = 0;
        }

        /** Inserts node right after head (MRU position). */
        void addFirst(Node node) {
            node.next      = head.next;
            node.prev      = head;
            head.next.prev = node;
            head.next      = node;
            size++;
        }

        /** Removes a node from wherever it currently sits in this list. */
        void remove(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
            size--;
        }

        /** Removes and returns the LRU node (the one just before tail). */
        Node removeLast() {
            if (size == 0) return null;
            Node lru = tail.prev;
            remove(lru);
            return lru;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Cache state
    // ──────────────────────────────────────────────────────────────────────────
    private final int                          capacity;
    private       int                          minFreq; // current lowest frequency
    private final HashMap<Integer, Node>            keyMap;  // key  → Node
    private final HashMap<Integer, DoublyLinkedList> freqMap; // freq → bucket list

    public LFUCache(int capacity) {
        this.capacity = capacity;
        this.minFreq  = 0;
        this.keyMap   = new HashMap<>();
        this.freqMap  = new HashMap<>();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // get — O(1) lookup; increments the node's frequency on a hit.
    // ──────────────────────────────────────────────────────────────────────────
    public int get(int key) {
        if (!keyMap.containsKey(key)) {
            return -1;
        }
        Node node = keyMap.get(key);
        incrementFreq(node);
        return node.value;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // put — O(1) insert or update; evicts the LFU (LRU tie-break) when full.
    // ──────────────────────────────────────────────────────────────────────────
    public void put(int key, int value) {
        if (capacity <= 0) return;

        if (keyMap.containsKey(key)) {
            // Key already cached — just update value and bump frequency.
            Node node = keyMap.get(key);
            node.value = value;
            incrementFreq(node);
            return;
        }

        // New key: evict the LFU entry if we are at capacity.
        if (keyMap.size() == capacity) {
            DoublyLinkedList minList = freqMap.get(minFreq);
            Node evicted = minList.removeLast();   // LRU within lowest-freq bucket
            keyMap.remove(evicted.key);
        }

        // Insert the new node with frequency = 1.
        Node newNode = new Node(key, value);
        keyMap.put(key, newNode);
        freqMap.computeIfAbsent(1, k -> new DoublyLinkedList()).addFirst(newNode);
        minFreq = 1;   // a brand-new node always resets the minimum to 1
    }

    // ──────────────────────────────────────────────────────────────────────────
    // incrementFreq — moves a node from its current freq bucket to freq+1.
    //
    // This is the core helper shared by both get() and put():
    //   1. Remove from freqMap[node.freq].
    //   2. If that bucket is now empty AND it was the minFreq bucket,
    //      minFreq must go up by 1 (that frequency no longer exists).
    //   3. Increment node.freq.
    //   4. Insert at the head of freqMap[node.freq]  (MRU within new bucket).
    // ──────────────────────────────────────────────────────────────────────────
    private void incrementFreq(Node node) {
        int oldFreq = node.freq;
        DoublyLinkedList oldList = freqMap.get(oldFreq);
        oldList.remove(node);

        if (oldList.size == 0 && oldFreq == minFreq) {
            minFreq++;   // the only bucket with minFreq is now empty
        }

        node.freq++;
        freqMap.computeIfAbsent(node.freq, k -> new DoublyLinkedList()).addFirst(node);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // main — validates the worked example from the class-level comment above.
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        LFUCache cache = new LFUCache(2);

        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println(cache.get(1)); // 1   (freq[1]=2, freq[2]=1)
        cache.put(3, 3);                  // evicts key 2 (lowest freq, LRU)
        System.out.println(cache.get(2)); // -1  (evicted)
        System.out.println(cache.get(3)); // 3   (freq[3]=2, freq[1]=2)
        cache.put(4, 4);                  // evicts key 1 (LRU tie-break among freq=2)
        System.out.println(cache.get(1)); // -1  (evicted)
        System.out.println(cache.get(3)); // 3
        System.out.println(cache.get(4)); // 4
    }
}
