package com.dnex.algorithm;

import java.util.Scanner;

/**
 * ============================================================
 * PROBLEM: Prime Numbers
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   A prime number is a natural number greater than 1 that has
 *   no positive divisors other than 1 and itself.
 *   Goal: print every prime from 1 up to a user-supplied limit.
 *
 *   Examples of primes:  2, 3, 5, 7, 11, 13, 17, 19, 23 ...
 *   Non-primes:          4 (2×2), 6 (2×3), 9 (3×3), 15 (3×5)
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 1 (Classic / Trial Division) — used here
 * ─────────────────────────────────────────────────────────────
 *   For each candidate number, try dividing it by every integer
 *   from 2 up to number-1.  If any division is exact, the number
 *   is composite; otherwise it is prime.
 *
 *   Trace for number = 7:
 *     i=2  7%2=1  not divisible
 *     i=3  7%3=1  not divisible
 *     i=4  7%4=3  not divisible
 *     i=5  7%5=2  not divisible
 *     i=6  7%6=1  not divisible
 *     loop ends → return true  (7 is prime)
 *
 *   Trace for number = 9:
 *     i=2  9%2=1  not divisible
 *     i=3  9%3=0  divisible! → return false  (9 is NOT prime)
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 2 (Optimised Trial Division — improvement idea)
 * ─────────────────────────────────────────────────────────────
 *   Only check divisors up to √number instead of number-1.
 *   If number has a factor larger than its square root, the
 *   complementary factor must be smaller than the square root
 *   — so we would already have caught it.
 *
 *   Change: for(int i=2; i <= Math.sqrt(number); i++)
 *   This cuts the inner loop from O(n) down to O(√n) per candidate.
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Classic trial division (this code)  Time O(n²)    Space O(1)
 *   Optimised trial division (√n trick) Time O(n√n)   Space O(1)
 *   Sieve of Eratosthenes               Time O(n log log n)  Space O(n)  ← best for range queries
 * ============================================================
 */
public class PrimeNumbers {

    public static void main(String[] args) {

        // ── Step 1: Read the upper limit from the user ──────────────────────
        // Ask how far to search.  All primes from 1 up to this value will print.
        System.out.println("Enter the number till which prime number to be printed: ");
        int limit = new Scanner(System.in).nextInt();

        // ── Step 2: Iterate every candidate in the range [2, limit] ─────────
        // We start at 2 because 1 is not considered a prime by definition.
        System.out.println("Printing prime numbers from 1 to " + limit);
        for (int number = 2; number <= limit; number++) {

            // ── Step 3: Delegate the primality check to isPrime() ───────────
            // Only print numbers that pass the trial-division test.
            if (isPrime(number)) {
                System.out.println(number);
            }
        }
    }


    public static boolean isPrime(int number) {
        for (int i = 2; i < number; i++) {
            if (number % i == 0) {
                return false; // Found a factor → number is composite
            }
        }
        return true;
    }
}
