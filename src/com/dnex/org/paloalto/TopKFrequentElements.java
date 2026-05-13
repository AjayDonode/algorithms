package com.dnex.org.paloalto;

import java.util.*;

/**
 * ============================================================
 * PROBLEM: Top K Frequent Elements  (LeetCode #347)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given an integer array and an integer k, return the k most
 *   frequently occurring elements.  The answer can be in any order.
 *
 *   Example 1:  nums = [1,1,1,2,2,3],  k = 2  →  [1, 2]
 *   Example 2:  nums = [1],             k = 1  →  [1]
 *
 *   Constraints:
 *     1 <= nums.length <= 10^5
 *     -10^4 <= nums[i] <= 10^4
 *     k is in the range [1, number of unique elements]
 *     The answer is guaranteed to be unique.
 *
 * ─────────────────────────────────────────────────────────────
 * THREE APPROACHES
 * ─────────────────────────────────────────────────────────────
 *
 *   APPROACH 1 (Brute Force) — Sort by frequency  O(n log n) / O(n)
 *     1. Count frequencies with a HashMap.
 *     2. Dump unique keys into a list, sort descending by frequency.
 *     3. Return the first k elements.
 *     Easy to code but pays an unnecessary log-n sorting tax.
 *
 *   APPROACH 2 — Min-Heap (Priority Queue)  O(n log k) / O(n + k)
 *     1. Count frequencies with a HashMap.
 *     2. Push each entry into a min-heap of size k keyed by frequency.
 *        When the heap exceeds k, evict the element with the lowest count.
 *     3. Drain the heap into the result array.
 *
 *     Why a MIN-heap?  Because we keep the k largest counts — any new
 *     entry smaller than the current minimum is immediately discarded,
 *     so we never store more than k candidates at once.
 *
 *     Trace for [1,1,1,2,2,3], k=2:
 *       freq map:  {1:3, 2:2, 3:1}
 *       heap after 1: [(3,1)]
 *       heap after 2: [(2,2),(3,1)]   size == k, stop evicting
 *       heap after 3: push (1,3) → size 3 > k → evict min (1,3) → heap stays [(2,2),(3,1)]
 *       result: [1, 2]
 *
 *   APPROACH 3 (Best) — Bucket Sort  O(n) / O(n)
 *     Key insight: frequency can be at most n (if all elements are the same).
 *     Create a "bucket" array of size n+1 where index = frequency.
 *     Place each element into the bucket matching its count.
 *     Walk the bucket array from high to low, collecting elements until we have k.
 *
 *     Trace for [1,1,1,2,2,3], k=2:
 *       freq map: {1:3, 2:2, 3:1}
 *       buckets:  index 0 → []
 *                 index 1 → [3]
 *                 index 2 → [2]
 *                 index 3 → [1]
 *       Scan from index 6 down → collect 1 (freq 3), then 2 (freq 2) → done.
 *       result: [1, 2]
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Brute Force (sort)    Time O(n log n)  Space O(n)
 *   Min-Heap              Time O(n log k)  Space O(n + k)
 *   Bucket Sort (best)    Time O(n)        Space O(n)   ← interview answer
 * ============================================================
 */
public class TopKFrequentElements {

    // ──────────────────────────────────────────────────────────────────────
    // Driver — smoke tests for all three approaches
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Quick smoke-test exercising all three approaches against the same inputs.
     *
     * @param args unused
     */
    public static void main(String[] args) {
        int[] nums1 = {1, 1, 1, 2, 2, 3};
        int[] nums2 = {1};
        int[] nums3 = {4, 4, 4, 6, 6, 1, 1, 9};  // top-2 → [4, 6]

        System.out.println("=== Approach 1: Brute Force Sort ===");
        System.out.println(Arrays.toString(topKBruteForce(nums1, 2))); // [1, 2]
        System.out.println(Arrays.toString(topKBruteForce(nums2, 1))); // [1]
        System.out.println(Arrays.toString(topKBruteForce(nums3, 2))); // [4, 6]

        System.out.println("\n=== Approach 2: Min-Heap (Priority Queue) ===");
        System.out.println(Arrays.toString(topKMinHeap(nums1, 2)));    // [1, 2]
        System.out.println(Arrays.toString(topKMinHeap(nums2, 1)));    // [1]
        System.out.println(Arrays.toString(topKMinHeap(nums3, 2)));    // [4, 6]

        System.out.println("\n=== Approach 3: Bucket Sort (best) ===");
        System.out.println(Arrays.toString(topKBucketSort(nums1, 2))); // [1, 2]
        System.out.println(Arrays.toString(topKBucketSort(nums2, 1))); // [1]
        System.out.println(Arrays.toString(topKBucketSort(nums3, 2))); // [4, 6]
    }

    // ──────────────────────────────────────────────────────────────────────
    // APPROACH 1 (Brute Force): Sort by frequency  O(n log n) / O(n)
    // Count frequencies, sort the unique keys descending by count, slice top k.
    // Simple and readable, but the sort step is wasteful when k << n.
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Returns the {@code k} most frequent elements using a sort-based approach.
     *
     * <p>Steps:
     * <ol>
     *   <li>Build a frequency map over all elements — O(n)</li>
     *   <li>Sort the unique keys by frequency descending — O(n log n)</li>
     *   <li>Return the first {@code k} sorted keys — O(k)</li>
     * </ol>
     *
     * @param nums the input array
     * @param k    number of top-frequent elements to return
     * @return array of the {@code k} most frequent elements
     */
    private static int[] topKBruteForce(int[] nums, int k) {
        // Step 1 — build frequency map
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) {
            freq.put(n, freq.getOrDefault(n, 0) + 1);
        }

        // Step 2 — sort unique keys by frequency (highest first)
        List<Integer> keys = new ArrayList<>(freq.keySet());
        keys.sort((a, b) -> freq.get(b) - freq.get(a));

        // Step 3 — take the first k keys
        int[] result = new int[k];
        for (int i = 0; i < k; i++) {
            result[i] = keys.get(i);
        }
        return result;
    }

    // ──────────────────────────────────────────────────────────────────────
    // APPROACH 2: Min-Heap  O(n log k) / O(n + k)
    // Maintain a min-heap of exactly k entries keyed by frequency.
    // For large n with small k this is faster than sorting all n elements.
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Returns the {@code k} most frequent elements using a min-heap.
     *
     * <p>A min-heap of size {@code k} is maintained so that the element with
     * the lowest frequency is always at the top.  When a new element would push
     * the heap above size {@code k}, the minimum is evicted — guaranteeing only
     * the top-k survivors remain.
     *
     * @param nums the input array
     * @param k    number of top-frequent elements to return
     * @return array of the {@code k} most frequent elements
     */
    private static int[] topKMinHeap(int[] nums, int k) {
        // Step 1 — build frequency map
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) {
            freq.put(n, freq.getOrDefault(n, 0) + 1);
        }

        // Step 2 — min-heap ordered by frequency (lowest frequency at top)
        // Comparator: (a, b) -> freq[a] - freq[b]  → smaller freq = higher priority (evicted first)
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(
                (a, b) -> freq.get(a) - freq.get(b)
        );

        for (int key : freq.keySet()) {
            minHeap.offer(key);
            if (minHeap.size() > k) {
                minHeap.poll();  // evict the element with the smallest frequency
            }
        }

        // Step 3 — drain the heap into the result (order not guaranteed, but valid)
        int[] result = new int[k];
        for (int i = 0; i < k; i++) {
            result[i] = minHeap.poll();
        }
        return result;
    }

    // ──────────────────────────────────────────────────────────────────────
    // APPROACH 3 (Best): Bucket Sort  O(n) / O(n)
    // Since frequency is bounded by n, we can use the frequency value itself
    // as an array index — no comparison-based sorting needed at all.
    // This is the expected interview answer for optimal time complexity.
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Returns the {@code k} most frequent elements using bucket sort.
     *
     * <p>Key insight: the maximum possible frequency of any element is {@code n}
     * (when every element is the same).  We create an array of {@code n + 1}
     * buckets, place each element in the bucket at its frequency index, then
     * sweep from the highest-frequency bucket down, collecting results until we
     * have {@code k} elements.  This avoids any comparison-based sorting and
     * achieves true O(n) time.
     *
     * @param nums the input array
     * @param k    number of top-frequent elements to return
     * @return array of the {@code k} most frequent elements
     */
    @SuppressWarnings("unchecked")
    private static int[] topKBucketSort(int[] nums, int k) {
        // Step 1 — build frequency map
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) {
            freq.put(n, freq.getOrDefault(n, 0) + 1);
        }

        // Step 2 — place each unique element into the bucket at its frequency index.
        //   buckets[i] holds all elements that appear exactly i times.
        //   Maximum frequency is nums.length, so we need n+1 buckets (0..n).
        List<Integer>[] buckets = new List[nums.length + 1];
        for (int key : freq.keySet()) {
            int f = freq.get(key);
            if (buckets[f] == null) {
                buckets[f] = new ArrayList<>();
            }
            buckets[f].add(key);
        }

        // Step 3 — sweep from the highest-frequency bucket downward, collecting
        //   elements until the result array is full (k elements gathered).
        int[] result = new int[k];
        int   idx    = 0;
        for (int f = buckets.length - 1; f >= 1 && idx < k; f--) {
            if (buckets[f] != null) {
                for (int num : buckets[f]) {
                    result[idx++] = num;
                    if (idx == k) break;  // collected enough — stop early
                }
            }
        }
        return result;
    }
}
