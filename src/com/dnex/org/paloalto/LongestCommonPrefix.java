package com.dnex.org.paloalto;

/**
 * ============================================================
 * PROBLEM: Longest Common Prefix  (LeetCode #14)
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given an array of strings, find the longest prefix string
 *   that is common to ALL strings in the array.
 *   If no common prefix exists, return an empty string "".
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — Horizontal Scanning (prefix shrink)
 * ─────────────────────────────────────────────────────────────
 *   KEY IDEA:
 *     Start with the first string as the candidate prefix.
 *     For each subsequent string, keep trimming one character
 *     from the right of the prefix until the current string
 *     starts with it (indexOf returns 0).
 *     If the prefix becomes empty at any point, return "".
 *
 *   TRACE for {"100.100.0.30", "100.100.0.1", "100.100.0.2"}:
 *
 *     prefix = "100.100.0.30"
 *
 *     i=1  "100.100.0.1".indexOf("100.100.0.30") = -1  → trim → "100.100.0.3"
 *          "100.100.0.1".indexOf("100.100.0.3")  = -1  → trim → "100.100.0."
 *          "100.100.0.1".indexOf("100.100.0.")   =  0  → match
 *
 *     i=2  "100.100.0.2".indexOf("100.100.0.")   =  0  → match
 *
 *     i=3  "100.100.0.3".indexOf("100.100.0.")   =  0  → match
 *
 *     Result → "100.100.0."
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Time  O(S)  — S = total number of characters across all strings
 *                 (each char is checked at most once during shrinking)
 *   Space O(1)  — only the prefix string is kept; no extra data structures
 * ============================================================
 */
public class LongestCommonPrefix {

    // ──────────────────────────────────────────────────────────────────────────
    // main — runs the worked example from the class-level trace above.
    // ──────────────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        String[] input = {"100.100.0.30", "100.100.0.1", "100.100.0.2", "100.100.0.3", "100.100.0.3"};
        System.out.println("Longest common prefix: " + getLongestCommonPrefix(input));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // getLongestCommonPrefix — O(S) time / O(1) space
    //
    // Seeds the prefix with the first string, then iterates through the rest.
    // For each string, trims the prefix from the right one character at a time
    // until that string starts with the prefix (indexOf == 0).
    // Returns "" immediately if the prefix is ever fully consumed.
    // ──────────────────────────────────────────────────────────────────────────
    private static String getLongestCommonPrefix(String[] input) {
        String prefix = input[0];

        for (int i = 1; i < input.length; i++) {
            while (input[i].indexOf(prefix) != 0) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }

        return prefix;
    }
}
