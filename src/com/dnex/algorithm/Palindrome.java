package com.dnex.org.paloalto;

/**
 * ============================================================
 * PROBLEM: Palindrome Check  (LeetCode #9 for numbers, #125 for strings)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Determine whether a value reads the same forwards and backwards.
 *   Two flavours:
 *     String  — e.g. "racecar", "That is si tahT"
 *     Integer — e.g. 121, 21012    (-121 is NOT, 10 is NOT)
 *
 * ─────────────────────────────────────────────────────────────
 * STRING PALINDROME — 3 APPROACHES
 * ─────────────────────────────────────────────────────────────
 *
 *   APPROACH 1 (Old / Classic) — Manual char-array swap  O(n) / O(n)
 *     Convert to char array, swap outside-in, rebuild, compare.
 *
 *   APPROACH 2 — StringBuilder.reverse()  O(n) / O(n)
 *     One-liner using built-in reverse. Easy, but uses extra space.
 *
 *   APPROACH 3 (Best) — Two Pointers  O(n) / O(1)
 *     Walk L and R inward comparing chars. No extra allocation.
 *
 *     "racecar"
 *      L     R   r == r  move inward
 *       L   R    a == a  move inward
 *        L R     c == c  move inward
 *         M      single center — done, all matched, is palindrome
 *
 * ─────────────────────────────────────────────────────────────
 * INTEGER PALINDROME — 2 APPROACHES
 * ─────────────────────────────────────────────────────────────
 *
 *   Edge cases to handle first:
 *     Negative numbers — always false  (-121 reversed is 121-)
 *     Numbers ending in 0 — false unless the number is 0 itself
 *       (10 reversed = 01 = 1, which != 10)
 *
 *   APPROACH 1 (Old / Classic) — Full digit reverse  O(log n) / O(1)
 *     Reverse ALL digits, compare to original.
 *     Risk: overflow if reversed number > Integer.MAX_VALUE.
 *     Matches the logic in the original Palindrome.java.
 *
 *   APPROACH 2 (Best) — Reverse only HALF  O(log n) / O(1)
 *     Peel digits from the right until reversedHalf >= remaining.
 *     No overflow risk — only processes half the digits.
 *
 *     Trace for 121:
 *       step 1: x=12,  reversedHalf=1
 *       step 2: x=1,   reversedHalf=12
 *       odd length  -> x == reversedHalf/10  -> 1 == 1  palindrome
 *
 *     Trace for 1221:
 *       step 1: x=122, reversedHalf=1
 *       step 2: x=12,  reversedHalf=12
 *       even length -> x == reversedHalf     -> 12 == 12 palindrome
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   String char-swap (old)      Time O(n)      Space O(n)
 *   String StringBuilder        Time O(n)      Space O(n)
 *   String two-pointer (best)   Time O(n)      Space O(1)  <- interview answer
 *   Integer full reverse (old)  Time O(log n)  Space O(1)  overflow risk
 *   Integer half reverse (best) Time O(log n)  Space O(1)  <- interview answer
 * ============================================================
 */
public class PalindromeCheck {

    public static void main(String[] args) {
        // ── String tests ───────────────────────────────────────────────────
        System.out.println("=== String: Old (char array swap) ===");
        System.out.println(isPalindromeStringOld("racecar"));          // true
        System.out.println(isPalindromeStringOld("That is si tahT"));  // true
        System.out.println(isPalindromeStringOld("hello"));            // false

        System.out.println("\n=== String: StringBuilder reverse ===");
        System.out.println(isPalindromeStringBuilder("racecar"));      // true
        System.out.println(isPalindromeStringBuilder("hello"));        // false

        System.out.println("\n=== String: Two Pointers (best) ===");
        System.out.println(isPalindromeStringTwoPointer("racecar"));   // true
        System.out.println(isPalindromeStringTwoPointer("abcba"));     // true
        System.out.println(isPalindromeStringTwoPointer("hello"));     // false
        System.out.println(isPalindromeStringTwoPointer("a"));         // true
        System.out.println(isPalindromeStringTwoPointer(""));          // true

        // ── Integer tests ──────────────────────────────────────────────────
        System.out.println("\n=== Integer: Old (full reverse) ===");
        System.out.println(isPalindromeIntOld(21012));  // true
        System.out.println(isPalindromeIntOld(121));    // true
        System.out.println(isPalindromeIntOld(123));    // false

        System.out.println("\n=== Integer: Half reverse (best) ===");
        System.out.println(isPalindromeIntHalf(121));   // true
        System.out.println(isPalindromeIntHalf(1221));  // true
        System.out.println(isPalindromeIntHalf(-121));  // false (negative)
        System.out.println(isPalindromeIntHalf(10));    // false (trailing zero)
        System.out.println(isPalindromeIntHalf(0));     // true
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STRING APPROACH 1 (Old): Manual char-array swap  O(n) time / O(n) space
    // Convert to char array, swap from both ends inward, compare with original.
    // Fixed the off-by-one from the original — loop now starts at i=0.
    // ──────────────────────────────────────────────────────────────────────────
    private static boolean isPalindromeStringOld(String s) {
        char[] chars = s.toCharArray();
        for (int i = 0; i < chars.length / 2; i++) {
            char tmp = chars[i];
            chars[i] = chars[chars.length - 1 - i];
            chars[chars.length - 1 - i] = tmp;
        }
        return s.equals(String.valueOf(chars));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STRING APPROACH 2: StringBuilder.reverse()  O(n) time / O(n) space
    // Uses the built-in reverse. Concise, but allocates an extra object.
    // ──────────────────────────────────────────────────────────────────────────
    private static boolean isPalindromeStringBuilder(String s) {
        return s.equals(new StringBuilder(s).reverse().toString());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STRING APPROACH 3 (Best): Two Pointers  O(n) time / O(1) space
    // Walk L and R toward the center. First mismatch returns false.
    // No extra allocation — this is the expected interview answer.
    // ──────────────────────────────────────────────────────────────────────────
    private static boolean isPalindromeStringTwoPointer(String s) {
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // INTEGER APPROACH 1 (Old): Full reverse  O(log n) time / O(1) space
    // Reverse all digits, compare to original. Matches legacy Palindrome.java.
    // Caveat: could overflow for very large numbers.
    // ──────────────────────────────────────────────────────────────────────────
    private static boolean isPalindromeIntOld(int number) {
        return number == reverseAllDigits(number);
    }

    private static int reverseAllDigits(int number) {
        int reversed = 0;
        while (number != 0) {
            reversed = reversed * 10 + number % 10;
            number = number / 10;
        }
        return reversed;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // INTEGER APPROACH 2 (Best): Reverse only half  O(log n) time / O(1) space
    // Peel digits from the right until reversedHalf >= remaining x.
    // No overflow risk because we only go halfway. Interview-preferred solution.
    // ──────────────────────────────────────────────────────────────────────────
    private static boolean isPalindromeIntHalf(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int reversedHalf = 0;
        while (x > reversedHalf) {
            reversedHalf = reversedHalf * 10 + x % 10;
            x /= 10;
        }
        // even digit count: x == reversedHalf       (e.g. 1221 -> 12 == 12)
        // odd digit count:  x == reversedHalf / 10  (e.g. 121  -> 1  == 12/10)
        return x == reversedHalf || x == reversedHalf / 10;
    }

}
