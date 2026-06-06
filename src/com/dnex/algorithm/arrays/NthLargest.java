package com.dnex.algorithm.arrays;

import java.util.Arrays;
import java.util.HashSet;
import java.util.PriorityQueue;
import java.util.Set;

/**
 * Find the N-th Largest unique element in an array.
 * 
 * Key Requirements:
 * 1. Ignore duplicate values (e.g., in [12, 35, 1, 34, 10, 35], 
 *    the 1st largest is 35, 2nd largest is 34, 3rd largest is 12).
 * 2. Handle edge cases (null, empty arrays, or n larger than unique elements).
 */
public class NthLargest {

    public static void main(String[] args) {
        int[] arr = { 12, 35, 1, 34, 10, 35 };

        System.out.println("--- Finding N-th Largest ---");
        System.out.println("Input Array: " + Arrays.toString(arr));
        
        for (int n = 1; n <= 6; n++) {
            System.out.printf("%d-th Largest (Heap):    %d%n", n, getNthLargest(arr, n));
            System.out.printf("%d-th Largest (Sorting): %d%n", n, getNthLargestSorting(arr.clone(), n));
        }
    }

    /**
     * Finds the N-th largest unique element using a Min-Heap.
     * 
     * Time Complexity: O(K log N) where K is the array length.
     * Space Complexity: O(K) to track unique elements in the Set.
     * 
     * @param arr Input array of integers
     * @param n The rank (1-indexed, e.g. n=1 for largest, n=2 for second largest)
     * @return The N-th largest unique element, or Integer.MIN_VALUE if not found
     */
    public static int getNthLargest(int[] arr, int n) {
        if (arr == null || arr.length == 0 || n <= 0) {
            return Integer.MIN_VALUE;
        }

        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        Set<Integer> uniqueElements = new HashSet<>();

        for (int num : arr) {
            if (uniqueElements.add(num)) {
                minHeap.offer(num);
                if (minHeap.size() > n) {
                    minHeap.poll();
                }
            }
        }

        // If we don't have enough unique elements, return MIN_VALUE
        if (minHeap.size() < n) {
            return Integer.MIN_VALUE;
        }

        return minHeap.peek();
    }

    /**
     * Finds the N-th largest unique element using sorting.
     * 
     * Time Complexity: O(K log K) where K is the array length.
     * Space Complexity: O(1) auxiliary space (excluding clone).
     * 
     * @param arr Input array of integers (will be sorted in-place)
     * @param n The rank
     * @return The N-th largest unique element, or Integer.MIN_VALUE if not found
     */
    public static int getNthLargestSorting(int[] arr, int n) {
        if (arr == null || arr.length == 0 || n <= 0) {
            return Integer.MIN_VALUE;
        }

        Arrays.sort(arr);
        int uniqueCount = 0;
        int lastSeen = Integer.MAX_VALUE;

        for (int i = arr.length - 1; i >= 0; i--) {
            if (arr[i] != lastSeen) {
                uniqueCount++;
                lastSeen = arr[i];
                if (uniqueCount == n) {
                    return arr[i];
                }
            }
        }

        return Integer.MIN_VALUE;
    }
}
