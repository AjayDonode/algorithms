package com.dnex.algorithm.dp;

/**
 * ============================================================
 * PROBLEM: Climbing Stairs
 * ============================================================
 * LeetCode: https://leetcode.com/problems/climbing-stairs/
 * LeetCode #: 70
 * Difficulty: Easy
 * Topic Tags: Dynamic Programming, Memoization, Math, Fibonacci
 *
 * ------------------------------------------------------------
 * PROBLEM STATEMENT:
 * ------------------------------------------------------------
 * You are climbing a staircase. It takes `n` steps to reach the top.
 * Each time you can either climb 1 or 2 steps.
 * In how many distinct ways can you climb to the top?
 *
 * ------------------------------------------------------------
 * EXAMPLES:
 * ------------------------------------------------------------
 * Example 1:
 *   Input:  n = 2
 *   Output: 2
 *   Explanation: [1+1], [2]
 *
 * Example 2:
 *   Input:  n = 3
 *   Output: 3
 *   Explanation: [1+1+1], [1+2], [2+1]
 *
 * Example 3:
 *   Input:  n = 5
 *   Output: 8
 *   Explanation: [1+1+1+1+1], [1+1+1+2], [1+1+2+1], [1+2+1+1],
 *                [2+1+1+1], [1+2+2], [2+1+2], [2+2+1]
 *
 * ------------------------------------------------------------
 * KEY INSIGHT — IT'S FIBONACCI:
 * ------------------------------------------------------------
 * To reach step n, you must have come from:
 *   - Step (n-1)  →  took 1 step up, OR
 *   - Step (n-2)  →  took 2 steps up
 *
 * So: ways(n) = ways(n-1) + ways(n-2)
 *
 * Base cases:
 *   ways(0) = 1  (one way to stand at bottom — do nothing)
 *   ways(1) = 1  (only one way: take 1 step)
 *
 * This is exactly the Fibonacci sequence!
 *   n:    1  2  3  4  5  6  7 ...
 *   ways: 1  2  3  5  8  13 21 ...
 *
 * ------------------------------------------------------------
 * APPROACHES SUMMARY:
 * ------------------------------------------------------------
 * 1. Recursive (Naive)        → O(2^n) time, O(n) space   ❌ Too slow
 * 2. Memoization (Top-Down DP)→ O(n)   time, O(n) space   ✅ Good
 * 3. Bottom-Up DP (Iterative) → O(n)   time, O(1) space   ✅ BEST
 *
 * ------------------------------------------------------------
 * CONSTRAINTS:
 * ------------------------------------------------------------
 *   1 <= n <= 45
 * ============================================================
 */
public class ClimbingStairs {

    public static void main(String[] args) {
        int[] testCases = {1, 2, 3, 4, 5, 10, 45};

        System.out.println("=== Climbing Stairs ===\n");
        System.out.printf("%-6s %-18s %-20s %-18s%n",
                "n", "Naive Recursive", "Memoization (DP)", "Bottom-Up DP");
        System.out.println("-".repeat(65));

        for (int n : testCases) {
            int[] memo = new int[n + 1];  // fresh memo for each test
            System.out.printf("%-6d %-18d %-20d %-18d%n",
                    n,
                    climbRecursive(n),
                    climbMemo(n, memo),
                    climbBottomUp(n));
        }
    }

    // ----------------------------------------------------------
    // APPROACH 1: Naive Recursion
    // ----------------------------------------------------------
    // Strategy: Recursively branch into two choices at every step.
    //
    // Time Complexity:  O(2^n) — each call branches into 2 sub-calls,
    //                   forming a binary tree of depth n.
    // Space Complexity: O(n)   — recursion call stack depth.
    //
    // Drawback: Recomputes the same subproblems repeatedly.
    //           e.g., climbRecursive(3) is called multiple times.
    //           NOT suitable for large n.
    //
    // Recurrence:
    //   f(n) = f(n-1) + f(n-2)
    //   f(0) = 1, f(1) = 1
    // ----------------------------------------------------------
    private static int climbRecursive(int n) {
        if (n <= 1) return 1;                            // base case
        return climbRecursive(n - 1) + climbRecursive(n - 2);
    }

    // ----------------------------------------------------------
    // APPROACH 2: Memoization (Top-Down Dynamic Programming)
    // ----------------------------------------------------------
    // Strategy: Same as recursion, but cache results in a memo array
    //           so each subproblem is solved only ONCE.
    //
    // Time Complexity:  O(n) — each value computed exactly once.
    // Space Complexity: O(n) — memo array + recursion stack.
    //
    // How it works:
    //   Before computing f(n), check if memo[n] is already set.
    //   If yes, return it directly (cache hit).
    //   If no, compute it, store in memo[n], then return.
    // ----------------------------------------------------------
    private static int climbMemo(int n, int[] memo) {
        if (n <= 1) return 1;                            // base case
        if (memo[n] != 0) return memo[n];                // cache hit
        memo[n] = climbMemo(n - 1, memo) + climbMemo(n - 2, memo);
        return memo[n];
    }

    // ----------------------------------------------------------
    // APPROACH 3: Bottom-Up Dynamic Programming (Iterative) ✅ BEST
    // ----------------------------------------------------------
    // Strategy: Build the solution iteratively from the smallest
    //           subproblem up. No recursion, no extra array needed.
    //
    // Time Complexity:  O(n) — single loop from 2 to n.
    // Space Complexity: O(1) — only two variables (prev1, prev2).
    //
    // Trace for n=5:
    //   prev2=1 (ways to reach step 0)
    //   prev1=1 (ways to reach step 1)
    //
    //   i=2: curr = 1+1 = 2  → prev2=1,  prev1=2
    //   i=3: curr = 2+1 = 3  → prev2=2,  prev1=3
    //   i=4: curr = 3+2 = 5  → prev2=3,  prev1=5
    //   i=5: curr = 5+3 = 8  → prev2=5,  prev1=8
    //
    //   Answer = 8 ✅
    // ----------------------------------------------------------
    private static int climbBottomUp(int n) {
        if (n <= 1) return 1;

        int prev2 = 1;  // ways(0)
        int prev1 = 1;  // ways(1)

        for (int i = 2; i <= n; i++) {
            int curr = prev1 + prev2;   // ways(i) = ways(i-1) + ways(i-2)
            prev2 = prev1;
            prev1 = curr;
        }

        return prev1;
    }
}
