package com.dnex.algorithm;

import java.util.Arrays;

/**
 * ============================================================
 * PROBLEM: Valid Anagram  (LeetCode #242)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given two strings, determine if one is an anagram of the other.
 *   An anagram uses ALL the same characters with the SAME frequencies,
 *   just in a different order.
 *
 * EXAMPLES:
 *   "listen"    and "silent"    → true
 *   "1malyalam" and "lamlamya1" → true
 *   "hello"     and "world"     → false
 *   "rat"       and "car"       → false  (same length, different chars)
 *   "ab"        and "a"         → false  (different lengths)
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 1 (isAnagram) — Sort and Compare  O(n log n) / O(n)
 * ─────────────────────────────────────────────────────────────
 *   If two strings are anagrams, sorting both will produce
 *   identical character arrays.
 *
 *   Steps:
 *     1. Quick-reject: if lengths differ → not an anagram
 *     2. Convert both strings to lowercase char arrays
 *     3. Sort both arrays
 *     4. Compare with Arrays.equals()
 *
 *   Trace for "listen" vs "silent":
 *     sorted "listen" → e i l n s t
 *     sorted "silent" → e i l n s t
 *     Arrays.equals → true ✅
 *
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 2 (areAnagrams) — Character Sum  O(n) / O(1)
 * ─────────────────────────────────────────────────────────────
 *   Sum the ASCII (char) values of all alphanumeric characters in
 *   each string.  If the sums match → likely an anagram.
 *
 *   Steps:
 *     1. Convert both to lowercase
 *     2. Iterate each, summing charValue() for letters and digits only
 *     3. Return sumOne == sumTwo
 *
 *   IMPORTANT CAVEAT — this approach has a well-known flaw:
 *   Different character combinations can produce the same sum.
 *   Example:  "ac" → 97+99=196   "bb" → 98+98=196
 *   They are NOT anagrams but this method returns true for them.
 *
 *   It works for the current test case but is NOT reliable in general.
 *   Approach 1 (sort) or a frequency map (below) are more correct.
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH 3 (Best) — Frequency Count Map  O(n) / O(1)
 * ─────────────────────────────────────────────────────────────
 *   Use a HashMap<Character, Integer> to count character frequencies.
 *   Increment for each char in str1, decrement for each char in str2.
 *   If all counts end at 0 → every character is perfectly balanced → anagram.
 *
 *   Steps:
 *     1. Quick-reject: if lengths differ → false
 *     2. HashMap<Character, Integer> freq
 *     3. For each char in str1: freq[c]++
 *        For each char in str2: freq[c]--
 *     4. If any value != 0 → false, else true
 *
 *   Using a HashMap (vs a fixed int[26]) handles digits, symbols,
 *   and any Unicode characters safely — no index-out-of-bounds risk.
 *   O(n) time and O(k) space where k = unique character count.
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Sort + compare  (isAnagram)  : Time O(n log n)  Space O(n)
 *   Char sum        (areAnagrams): Time O(n)        Space O(1)  — unreliable
 *   Frequency array (best)       : Time O(n)        Space O(1)  <- interview answer
 * ============================================================
 */
public class Anagram {

    public static void main(String[] args) {
        String str1 = "1malyalam";
        String str2 = "lamlamya1";

        System.out.println("=== Approach 1: Sort and Compare ===");
        System.out.println(str1 + " vs " + str2 + " → " + isAnagram(str1, str2));         // true

        System.out.println("\n=== Approach 2: Character Sum (unreliable — see caveat) ===");
        System.out.println(str1 + " vs " + str2 + " → " + areAnagrams(str1, str2));       // true
        System.out.println("ac vs bb → " + areAnagrams("ac", "bb"));                       // true (false positive!)

        System.out.println("\n=== Approach 3: Frequency Count (best) ===");
        System.out.println(str1 + " vs " + str2 + " → " + isAnagramFreq(str1, str2));     // true
        System.out.println("ac vs bb → " + isAnagramFreq("ac", "bb"));                     // false (correct)
        System.out.println("listen vs silent → " + isAnagramFreq("listen", "silent"));     // true
        System.out.println("rat vs car → " + isAnagramFreq("rat", "car"));                 // false
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 1: Sort and Compare  O(n log n) time / O(n) space
    // Sort both strings' char arrays — anagrams produce identical sorted arrays.
    // Note: toLowerCase() is called redundantly inside the if; cleaned up here.
    // ─────────────────────────────────────────────────────────────────────────
    public static boolean isAnagram(String str1, String str2) {
        // quick-reject: different lengths can never be anagrams
        if (str1.length() != str2.length()) {
            return false;
        }

        char[] strArr1 = str1.toLowerCase().toCharArray();
        Arrays.sort(strArr1);

        char[] strArr2 = str2.toLowerCase().toCharArray();
        Arrays.sort(strArr2);

        return Arrays.equals(strArr1, strArr2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 2: Character Sum  O(n) time / O(1) space
    // Sum ASCII values of alphanumeric characters in each string, compare sums.
    // CAVEAT: different combos can give the same sum ("ac"=196, "bb"=196).
    //         Use frequency count (Approach 3) for correctness.
    // ─────────────────────────────────────────────────────────────────────────
    public static boolean areAnagrams(String one, String two) {
        String oneLower = one.toLowerCase();
        String twoLower = two.toLowerCase();

        int sumOne = 0;
        for (int i = 0; i < oneLower.length(); i++) {
            char c = oneLower.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                sumOne += c;    // add ASCII value of the character
            }
        }

        int sumTwo = 0;
        for (int i = 0; i < twoLower.length(); i++) {
            char c = twoLower.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                sumTwo += c;    // add ASCII value of the character
            }
        }

        return sumOne == sumTwo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPROACH 3 (Best): Frequency Count HashMap  O(n) time / O(k) space
    // Increment freq for each char in str1, decrement for each char in str2.
    // If all counts reach 0 → perfect balance → anagram.
    // HashMap handles letters, digits, and any character safely.
    // No collision risk. This is the expected interview answer.
    // ─────────────────────────────────────────────────────────────────────────
    public static boolean isAnagramFreq(String str1, String str2) {
        if (str1.length() != str2.length()) {
            return false;
        }

        java.util.Map<Character, Integer> freq = new java.util.HashMap<>();

        for (char c : str1.toLowerCase().toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);  // count chars in str1
        }
        for (char c : str2.toLowerCase().toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) - 1);  // subtract chars in str2
        }

        // every char that was incremented must have been decremented the same times
        for (int count : freq.values()) {
            if (count != 0) {
                return false;   // imbalance → not an anagram
            }
        }
        return true;
    }

}
