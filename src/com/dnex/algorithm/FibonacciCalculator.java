package com.dnex.algorithm;

/**
 * ============================================================
 * PROBLEM: Fibonacci Number / Series  (LeetCode #509)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   The Fibonacci sequence is defined by the recurrence relation:
 *
 *       F(1) = 1
 *       F(2) = 1
 *       F(n) = F(n-1) + F(n-2)   for n > 2
 *
 *   Sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
 *
 *   Two common tasks:
 *     1. Find the nth Fibonacci number
 *     2. Print the first n Fibonacci numbers
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 1 (fibonacci) — Recursion  O(2^n) time / O(n) space
 * ─────────────────────────────────────────────────────────────
 *   Directly translate the recurrence into recursive calls.
 *   Clean and easy to understand, but VERY slow for large n.
 *
 *   Note: the comment in the original says "tail recursion" but this
 *   is actually NOT tail recursion — it makes TWO recursive calls and
 *   adds their results, so the call stack cannot be optimized away.
 *   True tail recursion has a single recursive call as the last operation.
 *
 *   Why it is slow — call tree for F(5):
 *
 *             F(5)
 *            /    \
 *          F(4)   F(3)
 *         /  \    /  \
 *       F(3) F(2) F(2) F(1)
 *       /  \
 *     F(2) F(1)
 *
 *   F(3) is computed TWICE, F(2) three times — massive redundancy.
 *   Time complexity: O(2^n) — exponential.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 2 (fibonacci2) — Iterative / Bottom-Up  O(n) / O(1)
 * ─────────────────────────────────────────────────────────────
 *   Keep only the last two numbers and slide a window forward.
 *   No recursion, no extra space.
 *
 *   Trace for n=6:
 *     start:  fibo1=0  fibo2=1  fibonacci=1
 *     i=3:    fibonacci = 0+1 = 1,  fibo1=1, fibo2=1
 *     i=4:    fibonacci = 1+1 = 2,  fibo1=1, fibo2=2
 *     i=5:    fibonacci = 1+2 = 3,  fibo1=2, fibo2=3
 *     i=6:    fibonacci = 2+3 = 5,  fibo1=3, fibo2=5
 *     return 5  (F(6) = 8 — wait, let's verify: 1,1,2,3,5,8 → F(6)=8)
 *
 *   Note: the initial values fibo1=0, fibo2=1 with a base case of
 *   returning 1 for n=1 and n=2 mean the iteration starts correctly
 *   at i=3, producing F(3)=1, F(4)=2, F(5)=3, F(6)=5, etc.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 3 (Best) — Memoization / Top-Down DP  O(n) / O(n)
 * ─────────────────────────────────────────────────────────────
 *   Keep the recursive structure but cache results in a HashMap.
 *   Each unique F(n) is computed only ONCE — eliminates the
 *   exponential redundancy of plain recursion.
 *
 *   F(n)  → check cache first
 *         → if not cached: compute F(n-1) + F(n-2), store, return
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Recursion (fibonacci)       : Time O(2^n)  Space O(n)   slow!
 *   Iterative (fibonacci2)      : Time O(n)    Space O(1)   good
 *   Memoization (fibonacciMemo) : Time O(n)    Space O(n)   good
 *
 *   For interviews: iterative (O(n) / O(1)) is the expected answer.
 *   Memoization is great if you need to query F(n) many times.
 * ============================================================
 */
public class FibonacciCalculator {

    public static void main(String[] args) {
        int n = 20;

        System.out.println("=== Fibonacci series up to " + n + " numbers ===");
        System.out.print("Recursive : ");
        for (int i = 1; i <= n; i++) {
            System.out.print(fibonacci(i) + " ");
        }

        System.out.print("\nIterative : ");
        for (int i = 1; i <= n; i++) {
            System.out.print(fibonacci2(i) + " ");
        }

        System.out.print("\nMemoized  : ");
        java.util.Map<Integer, Integer> cache = new java.util.HashMap<>();
        for (int i = 1; i <= n; i++) {
            System.out.print(fibonacciMemo(i, cache) + " ");
        }

        System.out.println("\n\n=== F(20) from each approach ===");
        System.out.println("Recursive  F(20) = " + fibonacci(20));
        System.out.println("Iterative  F(20) = " + fibonacci2(20));
        System.out.println("Memoized   F(20) = " + fibonacciMemo(20, new java.util.HashMap<>()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 1: Recursion  O(2^n) time / O(n) space
    // Directly applies the recurrence F(n) = F(n-1) + F(n-2).
    // Simple but exponentially slow — each call branches into two more.
    // NOT tail-recursive despite the original comment: it adds two return values.
    // ─────────────────────────────────────────────────────────────────────────
    public static int fibonacci(int number) {
        if (number == 1 || number == 2) {
            return 1;   // base cases: F(1) = F(2) = 1
        }
        return fibonacci(number - 1) + fibonacci(number - 2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 2: Iterative (Bottom-Up)  O(n) time / O(1) space
    // Slides a two-variable window forward — no call stack overhead.
    // fibo1 and fibo2 track the previous two values; fibonacci is the current.
    // ─────────────────────────────────────────────────────────────────────────
    public static int fibonacci2(int number) {
        if (number == 1 || number == 2) {
            return 1;
        }
        int fibo1 = 1, fibo2 = 1, fibonacci = 1;  // F(1)=1, F(2)=1, start computing from F(3)
        for (int i = 3; i <= number; i++) {
            fibonacci = fibo1 + fibo2;  // next = sum of previous two
            fibo1 = fibo2;              // slide window: old fibo2 becomes new fibo1
            fibo2 = fibonacci;          // slide window: new fibonacci becomes new fibo2
        }
        return fibonacci;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 3 (Best): Memoization / Top-Down DP  O(n) time / O(n) space
    // Same recursive structure as Approach 1 but caches each F(n) in a HashMap.
    // Every unique subproblem is solved exactly once — no exponential blowup.
    // ─────────────────────────────────────────────────────────────────────────
    public static int fibonacciMemo(int number, java.util.Map<Integer, Integer> cache) {
        if (number == 1 || number == 2) {
            return 1;
        }
        if (cache.containsKey(number)) {
            return cache.get(number);   // return cached result — O(1) lookup
        }
        int result = fibonacciMemo(number - 1, cache) + fibonacciMemo(number - 2, cache);
        cache.put(number, result);      // store before returning
        return result;
    }

}