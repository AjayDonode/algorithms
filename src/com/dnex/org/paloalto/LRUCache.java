package com.dnex.org.paloalto;

import java.util.HashMap;

/**
 * ============================================================
 * PROBLEM: LRU Cache  (LeetCode #146)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Design a data structure that behaves like a fixed-capacity cache
 *   with a Least-Recently-Used (LRU) eviction policy.
 *
 *   It must support two operations in O(1) average time:
 *     get(key)        — Return the value if the key exists, else -1.
 *                       Marks the entry as "most recently used".
 *     put(key, value) — Insert or update the key.
 *                       If the cache is at capacity, evict the
 *                       least-recently-used entry first.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — HashMap + Doubly-Linked List
 * ─────────────────────────────────────────────────────────────
 *   KEY IDEA:
 *     Combine a HashMap (O(1) lookup by key) with a Doubly-Linked
 *     List (O(1) insertion and removal at any position).
 *
 *   The list is kept in Most-Recently-Used → Least-Recently-Used order:
 *     HEAD.next  ← most recently used
 *     TAIL.prev  ← least recently used  (eviction candidate)
 *
 *   SENTINEL NODES:
 *     head and tail are dummy boundary nodes so we never have to
 *     handle null checks when inserting or removing at the edges.
 *
 *   OPERATIONS:
 *     get(key):
 *       1. Miss → return -1.
 *       2. Hit  → remove the node from its current position,
 *                 re-insert it right after head (MRU position),
 *                 return its value.
 *
 *     put(key, value):
 *       1. Key already exists → update value, move node to MRU position.
 *       2. New key:
 *            a. If at capacity → remove the node just before tail (LRU),
 *               delete it from the map.
 *            b. Create a new node, insert after head, add to map.
 *
 * ─────────────────────────────────────────────────────────────
 * WORKED EXAMPLE  (capacity = 2)
 * ─────────────────────────────────────────────────────────────
 *   put(1,1)  →  [1]
 *   put(2,2)  →  [2, 1]          (2 is MRU)
 *   get(1)    →  1, list [1, 2]  (1 promoted to MRU)
 *   put(3,3)  →  evict 2 (LRU) → [3, 1]
 *   get(2)    →  -1              (2 was evicted)
 *   put(4,4)  →  evict 1 (LRU) → [4, 3]
 *   get(1)    →  -1
 *   get(3)    →  3
 *   get(4)    →  4
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   get   Time O(1)   Space O(1)
 *   put   Time O(1)   Space O(1)
 *   Total Space O(capacity) for the map + list nodes
 * ============================================================
 */
public class LRUCache {

    // ──────────────────────────────────────────────────────────────────────────
    // Node — a single doubly-linked-list entry holding one key-value pair.
    //
    // The key is stored alongside the value so that when a node is evicted
    // from the tail we can look it up and remove it from the HashMap in O(1).
    // ──────────────────────────────────────────────────────────────────────────
    private static class Node {
        int key;
        int value;
        Node prev;
        Node next;

        Node(int key, int value) {
            this.key   = key;
            this.value = value;
        }
    }

    private final int              capacity;
    private final HashMap<Integer, Node> map;
    private final Node             head; // dummy MRU sentinel
    private final Node             tail; // dummy LRU sentinel

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map      = new HashMap<>();
        this.head     = new Node(0, 0);
        this.tail     = new Node(0, 0);
        head.next     = tail;
        tail.prev     = head;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // get — O(1) lookup; promotes the hit node to the MRU position.
    // ──────────────────────────────────────────────────────────────────────────
    public int get(int key) {
        if (!map.containsKey(key)) {
            return -1;
        }
        Node node = map.get(key);
        remove(node);
        insertAfterHead(node);
        return node.value;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // put — O(1) insert or update; evicts the LRU entry when at capacity.
    // ──────────────────────────────────────────────────────────────────────────
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.value = value;
            remove(node);
            insertAfterHead(node);
            return;
        }

        if (map.size() == capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }

        Node newNode = new Node(key, value);
        insertAfterHead(newNode);
        map.put(key, newNode);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // remove — unlinks a node from its current position in the list.
    // ──────────────────────────────────────────────────────────────────────────
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // insertAfterHead — places a node right after the head sentinel (MRU slot).
    // ──────────────────────────────────────────────────────────────────────────
    private void insertAfterHead(Node node) {
        node.next      = head.next;
        node.prev      = head;
        head.next.prev = node;
        head.next      = node;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // main — validates the worked example from the class-level comment above.
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        LRUCache cache = new LRUCache(2);

        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println(cache.get(1)); // 1
        cache.put(3, 3);                  // evicts key 2
        System.out.println(cache.get(2)); // -1
        cache.put(4, 4);                  // evicts key 1
        System.out.println(cache.get(1)); // -1
        System.out.println(cache.get(3)); // 3
        System.out.println(cache.get(4)); // 4
    }
}
