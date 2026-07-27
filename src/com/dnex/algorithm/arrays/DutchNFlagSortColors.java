package com.dnex.algorithm.arrays;

import java.util.Arrays;

/**
 * LeetCode #75 – Sort Colors (Dutch National Flag Problem)
 *
 * <p><b>Problem:</b> Sort an array of 0s (red), 1s (white), and 2s (blue) in-place
 * without using a library sort.  Output order must be: all 0s, then 1s, then 2s.
 *
 * <p><b>Approach 1 – Counting Sort (Brute Force)  O(n) time | O(1) space | 2 passes:</b><br>
 * First pass: count how many 0s, 1s, and 2s exist.<br>
 * Second pass: overwrite the array using the counts.
 *
 * <p><b>Approach 2 – Dutch National Flag  O(n) time | O(1) space | 1 pass:</b><br>
 * Maintain three pointers that define three regions:
 * <pre>
 *   [0 .. lo-1]   → all 0s  (confirmed)
 *   [lo .. mid-1] → all 1s  (confirmed)
 *   [mid .. hi]   → unknown (to be processed)
 *   [hi+1 .. end] → all 2s  (confirmed)
 *
 * Walk mid from left to right:
 *   nums[mid] == 0 → swap(lo, mid), lo++, mid++
 *   nums[mid] == 1 → mid++  (already in the right region)
 *   nums[mid] == 2 → swap(mid, hi), hi--  (don't advance mid, need to re-check)
 * </pre>
 */
public class DutchNFlagSortColors {

    public static void main(String[] args) {

        // --- Test 1 ---
        int[] t1a = {2, 0, 2, 1, 1, 0};
        int[] t1b = t1a.clone();
        System.out.println("Input   : " + Arrays.toString(t1a));
        sortColorsBruteForce(t1a);
        sortColorsOptimal(t1b);
        System.out.println("Brute   : " + Arrays.toString(t1a));
        System.out.println("Optimal : " + Arrays.toString(t1b));
        System.out.println("Expected: [0, 0, 1, 1, 2, 2]");
        System.out.println();

        // --- Test 2 ---
        int[] t2a = {2, 0, 1};
        int[] t2b = t2a.clone();
        System.out.println("Input   : " + Arrays.toString(t2a));
        sortColorsBruteForce(t2a);
        sortColorsOptimal(t2b);
        System.out.println("Brute   : " + Arrays.toString(t2a));
        System.out.println("Optimal : " + Arrays.toString(t2b));
        System.out.println("Expected: [0, 1, 2]");
        System.out.println();

        // --- Test 3 (all same) ---
        int[] t3a = {1, 1, 1};
        int[] t3b = t3a.clone();
        System.out.println("Input   : " + Arrays.toString(t3a));
        sortColorsOptimal(t3b);
        System.out.println("Optimal : " + Arrays.toString(t3b));
        System.out.println("Expected: [1, 1, 1]");
        System.out.println();

        // --- Test 4 (already sorted) ---
        int[] t4a = {0, 0, 1, 2, 2};
        int[] t4b = t4a.clone();
        System.out.println("Input   : " + Arrays.toString(t4a));
        sortColorsOptimal(t4b);
        System.out.println("Optimal : " + Arrays.toString(t4b));
        System.out.println("Expected: [0, 0, 1, 2, 2]");
    }

    // -------------------------------------------------------------------------
    // Approach 1 – Counting Sort   O(n) time | O(1) space | 2 passes
    //
    // Pass 1: tally how many 0s, 1s, 2s are in the array.
    // Pass 2: fill the array back using those counts.
    // -------------------------------------------------------------------------
    private static void sortColorsBruteForce(int[] nums) {
        int count0 = 0, count1 = 0, count2 = 0;

        for (int n : nums) {
            if      (n == 0) count0++;
            else if (n == 1) count1++;
            else             count2++;
        }

        int i = 0;
        while (count0-- > 0) { nums[i++] = 0; }
        while (count1-- > 0) { nums[i++] = 1; }
        while (count2-- > 0) { nums[i++] = 2; }
    }

    // -------------------------------------------------------------------------
    // Approach 2 – Dutch National Flag   O(n) time | O(1) space | 1 pass
    //
    // Three pointers partition the array into four regions at all times:
    //   lo   = boundary between confirmed-0s and unknown
    //   mid  = current element being inspected
    //   hi   = boundary between unknown and confirmed-2s
    // -------------------------------------------------------------------------
    private static void sortColorsOptimal(int[] nums) {
        int lo  = 0;
        int mid = 0;
        int hi  = nums.length - 1;

        while (mid <= hi) {
            if (nums[mid] == 0) {
                swap(nums, lo, mid);
                lo++;
                mid++;                  // swapped-in value must be 1 (safe to advance)
            } else if (nums[mid] == 1) {
                mid++;                  // already in the right region
            } else {                    // nums[mid] == 2
                swap(nums, mid, hi);
                hi--;                   // don't advance mid – swapped-in value unknown
            }
        }
    }

    // -------------------------------------------------------------------------
    // Helper – swap two elements in-place
    // -------------------------------------------------------------------------
    private static void swap(int[] nums, int i, int j) {
        int tmp  = nums[i];
        nums[i]  = nums[j];
        nums[j]  = tmp;
    }
}
