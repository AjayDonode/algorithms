package com.dnex.org.paloalto;

import java.util.HashMap;
import java.util.Map;

/**
 * ============================================================ PROBLEM: Subarray Sum Equals K (LeetCode #560) ============================================================
 *
 * WHAT THE PROBLEM ASKS: Given an integer array nums and an integer k, return the count of contiguous subarrays whose elements sum to exactly k.
 *
 * EXAMPLES: subarraySum([1, 1, 1], 2) → 2 ([1,1] at idx 0-1, [1,1] at idx 1-2) subarraySum([1, 2, 3], 3) → 2 ([1,2] and [3]) subarraySum([3], 3) → 1 ([3] itself)
 *
 * ───────────────────────────────────────────────────────────── APPROACH 1 — Brute Force O(n²) time, O(1) space ───────────────────────────────────────────────────────────── Fix a start index i. Expand j rightward, accumulating a running sum. Count every window [i..j] whose sum == k.
 *
 * NOTE: you MUST accumulate a running sum — you cannot just check nums[i] + nums[j] because that misses all elements between i and j.
 *
 * for i in 0..n: sum = 0 for j in i..n: sum += nums[j] ← running sum, not just two elements if sum == k → count++
 *
 * ───────────────────────────────────────────────────────────── APPROACH 2 — Prefix Sum + HashMap O(n) time, O(n) space ─────────────────────────────────────────────────────────────
 *
 * KEY MATH: sum(i..j) = prefixSum[j] - prefixSum[i-1]
 *
 * sum(i..j) == k ⟺ prefixSum[j] - prefixSum[i-1] == k ⟺ prefixSum[i-1] == prefixSum[j] - k
 *
 * So at each index j, we ask: "how many EARLIER prefix sums equal (currentSum - k)?" The HashMap gives this in O(1).
 *
 * Step-by-step trace on [1, 2, 3], k = 3:
 *
 * Initialize: map = {0:1} ← seed for subarrays starting at index 0 currentSum = 0, count = 0
 *
 * index 0, num=1: currentSum=1 look for (1-3)=-2 → miss map={0:1, 1:1}
 *
 * index 1, num=2: currentSum=3 look for (3-3)= 0 → HIT count=1 map={0:1, 1:1, 3:1}
 *
 * index 2, num=3: currentSum=6 look for (6-3)= 3 → HIT count=2 map={0:1, 1:1, 3:1, 6:1}
 *
 * Answer: 2 ✅
 *
 * WHY SEED {0:1}? Handles subarrays that start at index 0. Without it, subarraySum([3], 3) would return 0 instead of 1.
 *
 * ───────────────────────────────────────────────────────────── EDGE CASES ───────────────────────────────────────────────────────────── • Negative numbers in the array — prefix sum approach handles them naturally. • k = 0 — subarrays that sum to zero (e.g. [1, -1]) must be counted. • Single-element subarray equals k — caught by the seed {0:1}.
 *
 * ───────────────────────────────────────────────────────────── COMPLEXITY ───────────────────────────────────────────────────────────── Brute Force — Time: O(n²) Space: O(1) Prefix + Map — Time: O(n) Space: O(n) ============================================================
 */
public class SubarraySumEqualsK {

    public static void main(String[] args) {
        int[] test1 = { 1, 1, 1 };
        int[] test2 = { 1, 2, 3 };

        System.out.println("=== Test 1: [1,1,1]  k=2  (expected 2) ===");
        System.out.println("Optimal    : " + subarraySum(test1, 2));
        System.out.println("Brute Force: " + subarraySumBruteForce(test1, 2));

        System.out.println("=== Test 2: [1,2,3]  k=3  (expected 2) ===");
        System.out.println("Optimal    : " + subarraySum(test2, 3));
        System.out.println("Brute Force: " + subarraySumBruteForce(test2, 3));
    }

    // ── APPROACH 2 (Optimal): Prefix Sum + HashMap  O(n) time / O(n) space ──
    //
    // Key insight: sum(i..j) = prefixSum[j] - prefixSum[i-1]
    // Rearranged:  prefixSum[i-1] = prefixSum[j] - k
    //
    // At each index, ask "how many earlier prefix sums equal (currentSum - k)?"
    // The HashMap answers this in O(1) — no need for a nested loop.
    //
    // We seed the map with {0:1} to handle subarrays that start at index 0.
    private static int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);       // seed: empty prefix has sum 0

        int prefixSum = 0;
        int count = 0;

        for (int num : nums) {
            prefixSum += num;                           // grow the running prefix sum
            int complement = prefixSum - k;             // earlier prefix sum that would form a valid subarray
            count += map.getOrDefault(complement, 0);   // count how many times that complement appeared
            map.put(prefixSum, map.getOrDefault(prefixSum, 0) + 1); // record current prefix sum
        }

        return count;
    }

    // ── APPROACH 1 (Brute Force): nested loops  O(n²) time / O(1) space ─────
    //
    // Fix a start index i, then expand j rightward accumulating a running sum.
    // Count every window [i..j] whose sum equals k.
    // Simple but slow — will time-out on large inputs.
    private static int subarraySumBruteForce(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];     // accumulate — do NOT just check nums[i]+nums[j]
                if (sum == k) {
                    count++;
                }
            }
        }
        return count;
    }

}
