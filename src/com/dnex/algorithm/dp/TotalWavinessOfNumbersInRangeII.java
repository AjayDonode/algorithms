package com.dnex.algorithm.dp;

import java.util.Arrays;

/**
 * 3753. Total Waviness of Numbers in Range II
 * 
 * The waviness of a number is defined as the total count of its peaks and valleys:
 * - A digit is a peak if it is strictly greater than both of its immediate neighbors.
 * - A digit is a valley if it is strictly less than both of its immediate neighbors.
 * - The first and last digits of a number cannot be peaks or valleys.
 * - Any number with fewer than 3 digits has a waviness of 0.
 * 
 * This class provides two solutions:
 * 1. Brute Force Approach: Iterates through each number in the range [num1, num2] (suitable for smaller inputs).
 * 2. Optimized Approach (Best): Digit Dynamic Programming (Digit DP) which solves the problem in O(log10(num2)) time.
 */
public class TotalWavinessOfNumbersInRangeII {

    // ==========================================
    // Approach 2: Best Approach (Digit DP)
    // Time Complexity: O(log10(num2) * 10 * 10) ~ O(1) for constraints up to 10^15
    // Space Complexity: O(log10(num2) * 10 * 10) for memoization arrays
    // ==========================================
    public static long totalWaviness(long num1, long num2) {
        return count(num2) - count(num1 - 1);
    }

    private static long count(long x) {
        if (x < 100) {
            return 0;
        }
        String s = String.valueOf(x);
        int n = s.length();

        // dpTotalNumbers[curr][prevPrev][prev]
        long[][][] dpTotalNumbers = new long[n][10][10];
        long[][][] dpTotalWaviness = new long[n][10][10];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < 10; j++) {
                Arrays.fill(dpTotalNumbers[i][j], -1);
                Arrays.fill(dpTotalWaviness[i][j], -1);
            }
        }

        long[] result = solve(0, -1, -1, true, true, s, n, dpTotalNumbers, dpTotalWaviness);
        return result[1];
    }

    private static long[] solve(int curr, int prevPrev, int prev, boolean isLimited, boolean isLeadingZero,
                                 String s, int n, long[][][] dpTotalNumbers, long[][][] dpTotalWaviness) {
        // Base case: we finished placing all digits
        if (curr == n) {
            return new long[]{isLeadingZero ? 0 : 1, 0};
        }

        // Return memoized result if available (only memoize states that are not bound by the upper limit
        // and have started placing digits, so prevPrev and prev are valid digits in [0, 9])
        if (!isLimited && !isLeadingZero && prevPrev >= 0 && prev >= 0) {
            if (dpTotalNumbers[curr][prevPrev][prev] != -1) {
                return new long[]{
                    dpTotalNumbers[curr][prevPrev][prev],
                    dpTotalWaviness[curr][prevPrev][prev]
                };
            }
        }

        long totalNumbers = 0;
        long totalWaveScore = 0;

        int limitDigit = isLimited ? (s.charAt(curr) - '0') : 9;

        for (int d = 0; d <= limitDigit; d++) {
            boolean nextLimited = isLimited && (d == limitDigit);
            boolean nextLeadingZero = isLeadingZero && (d == 0);

            long[] res = solve(curr + 1,
                               nextLeadingZero ? -1 : prev,
                               nextLeadingZero ? -1 : d,
                               nextLimited,
                               nextLeadingZero,
                               s, n, dpTotalNumbers, dpTotalWaviness);

            totalNumbers += res[0];
            totalWaveScore += res[1];

            // If we have placed at least two digits before this position and we are not in leading zeros
            if (!isLeadingZero && prevPrev != -1 && prev != -1) {
                // Check if the previous digit is a peak or valley relative to its neighbors
                if ((prev > prevPrev && prev > d) || (prev < prevPrev && prev < d)) {
                    totalWaveScore += res[0];
                }
            }
        }

        // Cache the computed state
        if (!isLimited && !isLeadingZero && prevPrev >= 0 && prev >= 0) {
            dpTotalNumbers[curr][prevPrev][prev] = totalNumbers;
            dpTotalWaviness[curr][prevPrev][prev] = totalWaveScore;
        }

        return new long[]{totalNumbers, totalWaveScore};
    }

    // ==========================================
    // Approach 1: Brute Force Approach
    // Time Complexity: O((num2 - num1) * log10(num2))
    // Space Complexity: O(log10(num2)) for string conversion
    // ==========================================
    public static long totalWavinessBruteForce(long num1, long num2) {
        long total = 0;
        for (long i = num1; i <= num2; i++) {
            total += calculateWaviness(i);
        }
        return total;
    }

    private static int calculateWaviness(long num) {
        if (num < 100) {
            return 0;
        }
        String s = String.valueOf(num);
        int waviness = 0;
        int len = s.length();
        for (int i = 1; i < len - 1; i++) {
            int prev = s.charAt(i - 1) - '0';
            int curr = s.charAt(i) - '0';
            int next = s.charAt(i + 1) - '0';
            if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
                waviness++;
            }
        }
        return waviness;
    }

    // ==========================================
    // Main method to verify correctness & performance
    // ==========================================
    public static void main(String[] args) {
        System.out.println("--- Testing Total Waviness of Numbers in Range II ---");

        // Test Case 1: Example 1 from description
        long num1 = 120, num2 = 130;
        long bfAns1 = totalWavinessBruteForce(num1, num2);
        long dpAns1 = totalWaviness(num1, num2);
        System.out.printf("Test 1 [%d, %d]:%n", num1, num2);
        System.out.println("  Brute Force Answer: " + bfAns1);
        System.out.println("  Digit DP Answer:    " + dpAns1);
        System.out.println("  Correct? " + (bfAns1 == dpAns1));

        // Test Case 2: Validation on a wider range
        long num3 = 100, num4 = 5000;
        long bfAns2 = totalWavinessBruteForce(num3, num4);
        long dpAns2 = totalWaviness(num3, num4);
        System.out.printf("%nTest 2 [%d, %d]:%n", num3, num4);
        System.out.println("  Brute Force Answer: " + bfAns2);
        System.out.println("  Digit DP Answer:    " + dpAns2);
        System.out.println("  Correct? " + (bfAns2 == dpAns2));

        // Test Case 3: Performance on huge constraints (Digit DP only)
        long num5 = 1, num6 = 1000000000000000L; // 10^15
        System.out.printf("%nTest 3 [%d, %d] (Large constraint performance):%n", num5, num6);
        long startTime = System.nanoTime();
        long dpAns3 = totalWaviness(num5, num6);
        long endTime = System.nanoTime();
        System.out.println("  Digit DP Answer:    " + dpAns3);
        System.out.printf("  Execution Time: %.2f ms%n", (endTime - startTime) / 1e6);
    }
}
