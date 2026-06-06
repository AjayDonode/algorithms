package com.dnex.algorithm.arrays;

import java.util.Arrays;

/**
 * Find the Second Largest element in an array.
 * 
 * Key Requirements:
 * 1. Ignore duplicate values (e.g., in [12, 35, 1, 34, 10, 35], 
 *    the 1st largest is 35, and the 2nd largest is 34).
 * 2. Handle edge cases (null, empty arrays, or fewer than 2 unique elements).
 */
public class SecondLargest {

    public static void main(String[] args) {
        int[] arr = { 12, 35, 1, 34, 10, 35 };

        System.out.println("--- Finding Second Largest ---");
        System.out.println("Input Array: " + Arrays.toString(arr));
        System.out.println("Second Largest (Single Pass): " + getSecondLargest(arr));
    }

    /**
     * Finds the second largest unique element in a single pass.
     * 
     * Time Complexity: O(N) where N is the length of the array.
     * Space Complexity: O(1).
     * 
     * @param arr Input array of integers
     * @return The second largest unique element, or Integer.MIN_VALUE if not found
     */
    public static int getSecondLargest(int[] arr) {
        if (arr == null || arr.length < 2) {
            return Integer.MIN_VALUE;
        }

        int largest = Integer.MIN_VALUE;
        int secondLargest = Integer.MIN_VALUE;

        for (int num : arr) {
            if (num > largest) {
                secondLargest = largest;
                largest = num;
            } else if (num > secondLargest && num < largest) {
                secondLargest = num;
            }
        }

        return secondLargest;
    }
}
