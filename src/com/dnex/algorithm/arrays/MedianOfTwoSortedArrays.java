package com.dnex.algorithm.arrays;

/**
 * LeetCode #4 – Median of Two Sorted Arrays
 *
 * <p><b>Problem:</b> Given two sorted arrays, return the median in O(log(m+n)).
 *
 * <p><b>Approach 1 – Merge then pick middle (O(m+n) time, O(m+n) space):</b><br>
 * Merge both arrays using two pointers (like merge-sort), then pick the
 * middle element(s).  Simple and correct, but does not meet the O(log) target.
 *
 * <p><b>Approach 2 – Binary search on partition (O(log(min(m,n))) time, O(1) space):</b><br>
 * Instead of merging, find the correct "cut" in the smaller array so that the
 * combined left half contains exactly half the total elements and every
 * left-half value ≤ every right-half value.  Binary search drives the cut.
 *
 * <pre>
 * Visual for nums1=[1,3], nums2=[2,4,6], total=5 (odd):
 *
 *   cut1=1 → left1=[1]    right1=[3]
 *   cut2=2 → left2=[2,4]  right2=[6]      ← max(left2)=4 > min(right1)=3  ✗
 *
 *   cut1=1 → left1=[1]    right1=[3]
 *   cut2=1 → left2=[2]    right2=[4,6]    ← max(left1,left2)=2 ≤ min(right1,right2)=3  ✓
 *
 *   median = max(left1, left2) = 2
 * </pre>
 */
public class MedianOfTwoSortedArrays {

    public static void main(String[] args) {

        // --- Test 1 ---
        int[] n1 = {1, 3};
        int[] n2 = {2};
        System.out.println("=== Test 1: nums1=[1,3], nums2=[2] ===");
        System.out.printf("Naive   : %.5f%n", findMedianNaive(n1, n2));
        System.out.printf("Optimal : %.5f%n", findMedianOptimal(n1, n2));
        System.out.println("Expected: 2.00000");
        System.out.println();

        // --- Test 2 ---
        int[] n3 = {1, 2};
        int[] n4 = {3, 4};
        System.out.println("=== Test 2: nums1=[1,2], nums2=[3,4] ===");
        System.out.printf("Naive   : %.5f%n", findMedianNaive(n3, n4));
        System.out.printf("Optimal : %.5f%n", findMedianOptimal(n3, n4));
        System.out.println("Expected: 2.50000");
        System.out.println();

        // --- Test 3 (edge: different sizes) ---
        int[] n5 = {0, 0};
        int[] n6 = {0, 0};
        System.out.println("=== Test 3: nums1=[0,0], nums2=[0,0] ===");
        System.out.printf("Optimal : %.5f%n", findMedianOptimal(n5, n6));
        System.out.println("Expected: 0.00000");
    }

    // -------------------------------------------------------------------------
    // Approach 1 – Merge arrays, then pick median   O(m+n) time | O(m+n) space
    // -------------------------------------------------------------------------
    private static double findMedianNaive(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int[] merged = new int[m + n];
        int i = 0, j = 0, k = 0;

        // Two-pointer merge (same idea as merge-sort)
        while (i < m && j < n) {
            merged[k++] = (nums1[i] <= nums2[j]) ? nums1[i++] : nums2[j++];
        }
        while (i < m) merged[k++] = nums1[i++];
        while (j < n) merged[k++] = nums2[j++];

        int total = m + n;
        if (total % 2 == 1) {
            return merged[total / 2];                              // odd  → single middle
        } else {
            return (merged[total / 2 - 1] + merged[total / 2]) / 2.0; // even → avg of two
        }
    }

    // -------------------------------------------------------------------------
    // Approach 2 – Binary search on partition       O(log(min(m,n))) | O(1)
    //
    // Always binary-search on the SMALLER array (nums1).
    // cut1 = number of elements taken from nums1 into the left half.
    // cut2 = (m+n+1)/2 - cut1  (fills up the left half from nums2).
    //
    // Valid partition: maxLeft1 <= minRight2  AND  maxLeft2 <= minRight1
    // -------------------------------------------------------------------------
    private static double findMedianOptimal(int[] nums1, int[] nums2) {

        // Ensure nums1 is the smaller array so we binary-search less
        if (nums1.length > nums2.length) {
            return findMedianOptimal(nums2, nums1);
        }

        int m    = nums1.length;
        int n    = nums2.length;
        int half = (m + n + 1) / 2;   // size of the combined left half

        int lo = 0, hi = m;

        while (lo <= hi) {
            int cut1 = lo + (hi - lo) / 2;   // elements from nums1 in left half
            int cut2 = half - cut1;           // elements from nums2 in left half

            // Edge values: use ±Infinity when the cut is at the boundary
            int maxLeft1  = (cut1 == 0) ? Integer.MIN_VALUE : nums1[cut1 - 1];
            int minRight1 = (cut1 == m) ? Integer.MAX_VALUE : nums1[cut1];
            int maxLeft2  = (cut2 == 0) ? Integer.MIN_VALUE : nums2[cut2 - 1];
            int minRight2 = (cut2 == n) ? Integer.MAX_VALUE : nums2[cut2];

            if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
                // ✅ Perfect partition found
                if ((m + n) % 2 == 1) {
                    return Math.max(maxLeft1, maxLeft2);           // odd total
                } else {
                    return (Math.max(maxLeft1, maxLeft2)
                          + Math.min(minRight1, minRight2)) / 2.0; // even total
                }
            } else if (maxLeft1 > minRight2) {
                hi = cut1 - 1;   // cut1 too far right → move left
            } else {
                lo = cut1 + 1;   // cut1 too far left  → move right
            }
        }

        throw new IllegalArgumentException("Input arrays are not sorted.");
    }
}
