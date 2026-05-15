package com.dnex.org.paloalto;

import java.util.ArrayDeque;
import java.util.Arrays;

/**
 * ============================================================
 * PROBLEM: Sliding Window Maximum  (LeetCode #239)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given an integer array nums and a window size k, slide the
 *   window one position to the right across the array.
 *   After each slide, record the maximum value visible inside
 *   the current window.  Return all recorded maximums.
 *
 *   Output length = nums.length - k + 1
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 1 (Brute Force) — Nested loop  O(n·k) / O(1)
 * ─────────────────────────────────────────────────────────────
 *   For every window position i, scan all k elements and track
 *   the maximum.  Simple but too slow for large inputs.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 2 (Best) — Monotonic Deque  O(n) / O(k)
 * ─────────────────────────────────────────────────────────────
 *   KEY IDEA:
 *     Maintain a double-ended queue (deque) that stores INDICES,
 *     not values, in decreasing order of their nums[] values.
 *     This guarantees the front of the deque always holds the
 *     index of the current window's maximum.
 *
 *   Two invariants maintained at every step:
 *     1. OUT-OF-WINDOW:  if deque.front < i - k + 1, pop front.
 *     2. MONOTONICITY:   before adding index i, pop all indices
 *        from the back whose nums value is ≤ nums[i].
 *        (They can never be the maximum while i is in the window.)
 *
 *   TRACE  nums = [1, 3, -1, -3, 5, 3, 6, 7],  k = 3
 *
 *   i  nums[i]  deque (indices)  window         max
 *   0    1      [0]              —              —
 *   1    3      [1]              —              —    (3 > 1 → pop 0)
 *   2   -1      [1, 2]          [1, 3,-1]       3
 *   3   -3      [1, 2, 3]       [3,-1,-3]       3
 *   4    5      [4]             [-1,-3, 5]       5   (5 > all → pop 1,2,3)
 *   5    3      [4, 5]          [-3, 5, 3]       5
 *   6    6      [6]             [5, 3, 6]        6   (6 > 3 and 5 → pop 4,5)
 *   7    7      [7]             [3, 6, 7]        7   (7 > 6 → pop 6)
 *
 *   Result → [3, 3, 5, 5, 6, 7]
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Brute Force       Time O(n·k)   Space O(1)
 *   Monotonic Deque   Time O(n)     Space O(k)   ← interview answer
 *     — each index is added and removed from the deque at most once
 * ============================================================
 */
public class SlidingWindowMaximum {

    // ──────────────────────────────────────────────────────────────────────────
    // main — validates both approaches against the worked example above.
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        int k = 3;

        System.out.println("Brute Force:       " + Arrays.toString(maxSlidingWindowBrute(nums, k)));
        System.out.println("Monotonic Deque:   " + Arrays.toString(maxSlidingWindowDeque(nums, k)));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // maxSlidingWindowBrute — O(n·k) time / O(1) space
    //
    // For each window starting at index i, scan all k elements and pick the max.
    // ──────────────────────────────────────────────────────────────────────────
    private static int[] maxSlidingWindowBrute(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];

        for (int i = 0; i <= n - k; i++) {
            int max = nums[i];
            for (int j = i + 1; j < i + k; j++) {
                max = Math.max(max, nums[j]);
            }
            result[i] = max;
        }

        return result;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // maxSlidingWindowDeque — O(n) time / O(k) space
    //
    // Uses a monotonic deque of indices kept in decreasing order of nums value.
    //   • Pop front  — when the front index slides out of the window.
    //   • Pop back   — when back index's value is ≤ nums[i] (can never win).
    //   • Front      — always holds the index of the current window's maximum.
    // ──────────────────────────────────────────────────────────────────────────
    private static int[] maxSlidingWindowDeque(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        ArrayDeque<Integer> deque = new ArrayDeque<>();

        for (int i = 0; i < n; i++) {
            if (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }

            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
                deque.pollLast();
            }

            deque.offerLast(i);

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }

        return result;
    }
}
