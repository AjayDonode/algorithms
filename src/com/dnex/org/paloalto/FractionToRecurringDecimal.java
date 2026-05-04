package com.dnex.org.paloalto;

import java.util.HashMap;
import java.util.Map;

/**
 * ============================================================
 * PROBLEM: Fraction to Recurring Decimal  (LeetCode #166)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given a numerator and denominator, return the result as a string.
 *   If the decimal part repeats, wrap the repeating block in parentheses.
 *
 * EXAMPLES:
 *   fractionToDecimal(1, 2)    →  "0.5"
 *   fractionToDecimal(1, 3)    →  "0.(3)"
 *   fractionToDecimal(4, 333)  →  "0.(012)"
 *   fractionToDecimal(1, 6)    →  "0.1(6)"
 *   fractionToDecimal(2, 1)    →  "2"
 *   fractionToDecimal(-1, 2)   →  "-0.5"
 *
 * ─────────────────────────────────────────────────────────────
 * ALGORITHM  (Long Division Simulation)
 * ─────────────────────────────────────────────────────────────
 *
 *   We simulate the grade-school long division process step by step.
 *   The KEY insight is:
 *
 *       A remainder that has been seen before means we have a cycle.
 *       The repeating block starts exactly where that remainder first appeared.
 *
 *   Step-by-step trace for  1 ÷ 6 = "0.1(6)":
 *
 *     integer part  : 1 / 6 = 0         →  result = "0."
 *     remainder     : 1 % 6 = 1
 *
 *     iteration 1   : remainder * 10 = 10
 *                     digit = 10 / 6 = 1  →  result = "0.1"
 *                     remainder = 10 % 6 = 4
 *                     map: { 4 → index 3 }          (new remainder, store it)
 *
 *     iteration 2   : remainder * 10 = 40
 *                     digit = 40 / 6 = 6  →  result = "0.16"
 *                     remainder = 40 % 6 = 4
 *                     map already has 4 at index 3! → CYCLE DETECTED
 *                     insert "(" at index 3, append ")"
 *                     result = "0.1(6)"  ← done
 *
 * ─────────────────────────────────────────────────────────────
 * EDGE CASES TO HANDLE
 * ─────────────────────────────────────────────────────────────
 *   1. SIGN  — result is negative if EXACTLY ONE of num/den is negative.
 *              Use XOR on their signs to detect this:
 *              (numerator < 0) ^ (denominator < 0)
 *
 *   2. OVERFLOW — Integer.MIN_VALUE / -1 overflows int.
 *                 Cast both to long before any arithmetic.
 *
 *   3. NO DECIMAL — if remainder reaches 0 after integer division, stop.
 *
 *   4. ZERO NUMERATOR — return "0" immediately.
 *
 * ─────────────────────────────────────────────────────────────
 * DATA STRUCTURE
 * ─────────────────────────────────────────────────────────────
 *   HashMap<Long, Integer>
 *     key   = remainder seen during long division
 *     value = index in the result StringBuilder where that remainder first appeared
 *
 *   When we see a remainder that already exists in the map, we:
 *     - Insert "(" at the stored index
 *     - Append ")" at the current end
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY
 * ─────────────────────────────────────────────────────────────
 *   Time  : O(D)  — D = denominator; at most D distinct remainders before a cycle.
 *   Space : O(D)  — HashMap stores at most D remainders.
 * ============================================================
 */
public class FractionToRecurringDecimal {

    public static void main(String[] args) {
        System.out.println(fractionToDecimal(1, 2));    // expected: 0.5
        System.out.println(fractionToDecimal(1, 3));    // expected: 0.(3)
        System.out.println(fractionToDecimal(4, 333));  // expected: 0.(012)
        System.out.println(fractionToDecimal(1, 6));    // expected: 0.1(6)
        System.out.println(fractionToDecimal(2, 1));    // expected: 2
        System.out.println(fractionToDecimal(-1, 2));   // expected: -0.5
    }

    private static String fractionToDecimal(int numerator, int denominator) {
        StringBuilder result = new StringBuilder();

        // Edge case: zero numerator
        if (numerator == 0) return "0";

        // Bug fix 1: use XOR to detect sign — avoids int overflow from multiplication
        if ((numerator < 0) ^ (denominator < 0)) {
            result.append("-");
        }

        // Bug fix 2: cast to long BEFORE abs to handle Integer.MIN_VALUE safely
        long num = Math.abs((long) numerator);
        long den = Math.abs((long) denominator);

        // Append the integer part
        result.append(num / den);

        long remainder = num % den;

        // No fractional part — we are done
        if (remainder == 0) return result.toString();

        // There is a fractional part — append the decimal point
        // Bug fix 3: "." was never appended in the original code
        result.append(".");

        // Map: remainder → index in result where this remainder first appeared
        Map<Long, Integer> map = new HashMap<>();

        // Bug fix 4: loop condition must check remainder, not den (den never changes)
        while (remainder != 0) {

            // Bug fix 5: check containsKey(remainder), not containsKey(den)
            if (map.containsKey(remainder)) {
                // Cycle detected — insert "(" at the stored index, close with ")"
                int cycleStart = map.get(remainder);
                result.insert(cycleStart, "(");
                result.append(")");
                break;
            }

            // Store current position before appending the next digit
            // Bug fix 6: map value must be result.length() (position), not den
            map.put(remainder, result.length());

            remainder *= 10;
            result.append(remainder / den);
            remainder = remainder % den;
        }   // Bug fix 7: closing brace for while was missing

        return result.toString();
    }

}
