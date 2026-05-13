package com.dnex.algorithm.search;

/**
 * Implementation of Binary Search algorithm using both Iterative and Recursive approaches.
 * * <p>Requirements: The input array MUST be sorted in ascending order.
 * Time Complexity: O(log n)
 * Space Complexity: O(1) for iterative, O(log n) for recursive (due to stack frames).
 */
public class BinarySearch {

    public static void main(String args[]) {
        int[] data = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        int target = 8;

        // Iterative approach
        System.out.println("Iterative Result: " + binarySearch(target, data));

        // Recursive approach
        // Note: high must be (length - 1) to represent the last valid index
        System.out.println("Recursive Result: " + binarySearchRecursion(target, data, 0, data.length - 1));
    }

    /**
     * Searches for a key in a sorted array using an iterative while-loop.
     * This is generally the preferred approach in Java for performance and memory safety.
     *
     * @param key  The value to search for.
     * @param data The sorted array to search within.
     * @return The index of the key if found; otherwise -1.
     */
    public static int binarySearch(int key, int[] data) {
        int low = 0;
        int high = data.length - 1;

        // Condition must be <= to ensure the last remaining element is checked
        while (low <= high) {
            // Using (high - low) / 2 prevents potential Integer Overflow bugs
            int mid = low + (high - low) / 2;

            if (data[mid] == key) {
                return mid; // Target found
            }

            if (data[mid] < key) {
                low = mid + 1; // Eliminate left half
            } else {
                high = mid - 1; // Eliminate right half
            }
        }
        return -1; // Target not present in array
    }

    public static int binarySearchRecursion(int key, int[] data, int low, int high) {
        // Base case: If the range is exhausted, the key is not in the array
        if (low <= high) {
            int mid = low + (high - low) / 2;

            if (key == data[mid]) {
                return mid; // Base case: Key found
            }

            if (key < data[mid]) {
                // Search the left sub-array (lower values)
                return binarySearchRecursion(key, data, low, mid - 1);
            } else {
                // Search the right sub-array (higher values)
                return binarySearchRecursion(key, data, mid + 1, high);
            }
        }

        return -1;
    }
}