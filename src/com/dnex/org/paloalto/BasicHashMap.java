package com.dnex.org.paloalto;

/**
 * ============================================================
 * PROBLEM: Design a Hash Map  (LeetCode #706 — Design HashMap)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Implement a basic HashMap that supports put, get, and remove
 *   without using any built-in hash table libraries.
 *
 *   Constraints (LeetCode #706):
 *     0 <= key, value <= 10^6
 *     At most 10^4 calls to put, get, and remove.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH: Separate Chaining (Array of Linked Lists)
 * ─────────────────────────────────────────────────────────────
 *
 *   Keep a fixed-size array of "buckets".  Each bucket is the
 *   head of a singly-linked list.  All keys that hash to the
 *   same index live in that bucket's chain — this is called a
 *   "collision" and chaining is one classic way to handle it.
 *
 *   Bucket array (CAPACITY = 1000):
 *
 *     index 0  -> null
 *     index 1  -> [key=1001, val=42] -> [key=2001, val=7] -> null   (collision)
 *     index 2  -> [key=2,    val=99] -> null
 *     ...
 *
 *   put(key, value):
 *     1. hash(key) -> index
 *     2. Walk the chain at that index.
 *     3. If the key already exists -> update value in place.
 *     4. If not found -> append a new Node at the tail.
 *
 *   get(key):
 *     1. hash(key) -> index
 *     2. Walk the chain; return value if key matches, else -1.
 *
 *   remove(key):
 *     1. hash(key) -> index
 *     2. Handle head removal separately.
 *     3. Walk the rest of the chain looking for the key; splice it out.
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   put    Time O(n/k)  Space O(1)   n = total entries, k = capacity
 *   get    Time O(n/k)  Space O(1)
 *   remove Time O(n/k)  Space O(1)
 *
 *   With a good hash and reasonable load factor the average chain
 *   length n/k stays small (effectively O(1) per operation).
 * ============================================================
 */
public class BasicHashMap {

    // ──────────────────────────────────────────────────────────────────────
    // Inner class: one node in a singly-linked list (the chain inside a bucket)
    // ──────────────────────────────────────────────────────────────────────
    public class Node {
        int key, value;
        Node next;

        Node(int key, int value) {
            this.key   = key;
            this.value = value;
            // next is implicitly null — no more nodes in the chain yet
        }
    }

    /** Number of buckets in the underlying array. A prime near 1 000 reduces clustering. */
    private static final int CAPACITY = 1000;

    /** The bucket array — each slot is either null or the head of a Node chain. */
    private final Node[] buckets;

  
    public BasicHashMap() {
        buckets = new Node[CAPACITY];
    }

 
    public int get(int key) {
        int index   = getHashCode(key);
        Node current = buckets[index];

        // Empty bucket — key definitely not present
        if (current == null) return -1;

        // Walk every node in this bucket's chain
        while (current != null) {
            if (current.key == key) {
                return current.value;  // found
            }
            current = current.next;
        }

        return -1;  // key not found in the chain
    }

    public void put(int key, int value) {
        int  index   = getHashCode(key);
        Node current = buckets[index];

        // Case 1: Bucket is empty — insert directly as the head node.
        if (current == null) {
            buckets[index] = new Node(key, value);
            return;
        }

        // Case 2: Walk the chain checking every node (including the last one).
        //   - If we find the key, update its value and return early.
        //   - If we exhaust the chain without finding the key, 'current' ends
        //     on the last node, which we then use to append the new entry.
        Node prev = null;
        while (current != null) {
            if (current.key == key) {
                // Key exists — update value in place (no duplicates)
                current.value = value;
                return;
            }
            prev    = current;
            current = current.next;
        }

        // Key not found — append a new node at the tail of the chain.
        prev.next = new Node(key, value);
    }


    public void remove(int key) {
        int  index   = getHashCode(key);
        Node current = buckets[index];

        // Bucket is already empty — nothing to do.
        if (current == null) return;

        // Special case: the head node itself holds the key to remove.
        if (current.key == key) {
            buckets[index] = current.next;  // promote the next node (or null) to head
            return;
        }

        // Walk the rest of the chain, keeping a 'prev' pointer so we can splice out
        // the matching node by re-linking prev.next -> current.next.
        while (current.next != null) {
            if (current.next.key == key) {
                current.next = current.next.next;  // skip (remove) the matched node
                return;
            }
            current = current.next;
        }
        // Key not found — no-op (silent, matches typical Map contract)
    }

  
    public int getHashCode(int key) {
        // Math.abs ensures we never get a negative index (Java % can be negative)
        return Math.abs(Integer.hashCode(key) % CAPACITY);
    }


    @Override
    public String toString() {
        StringBuilder sb      = new StringBuilder("{");
        boolean       first   = true;

        for (Node bucket : buckets) {
            Node current = bucket;
            while (current != null) {
                if (!first) sb.append(", ");
                sb.append(current.key).append("=").append(current.value);
                first   = false;
                current = current.next;  // advance along this bucket's chain
            }
        }

        sb.append("}");
        return sb.toString();
    }

    // ──────────────────────────────────────────────────────────────────────
    // Driver — quick smoke test
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Quick smoke-test exercising put, get, remove, update, and collision
     * handling.  Expected output is shown in the comments beside each call.
     *
     * @param args unused
     */
    public static void main(String[] args) {
        BasicHashMap map = new BasicHashMap();

        // ── basic insert & retrieval ───────────────────────────────────────
        map.put(1, 100);
        map.put(2, 200);
        map.put(3, 300);
        System.out.println(map.get(1));  // 100
        System.out.println(map.get(2));  // 200
        System.out.println(map.get(9));  // -1 (key absent)

        // ── update an existing key ─────────────────────────────────────────
        map.put(1, 999);
        System.out.println(map.get(1));  // 999 (updated, not a duplicate)

        // ── remove head node ──────────────────────────────────────────────
        map.remove(1);
        System.out.println(map.get(1));  // -1 (removed)

        // ── remove a non-existent key (no-op, must not throw) ─────────────
        map.remove(42);

        // ── toString snapshot ─────────────────────────────────────────────
        System.out.println(map);  // {2=200, 3=300}
    }
}
