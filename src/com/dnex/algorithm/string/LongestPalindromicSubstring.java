package com.dnex.algorithm.string;

/**
 * LeetCode #5 – Longest Palindromic Substring
 *
 * <p><b>Problem:</b> Given a string s, return the longest substring that reads
 * the same forwards and backwards.
 *
 * <p><b>Key insight – Expand Around Center:</b><br>
 * Every palindrome has a center.  There are 2n-1 possible centers in a string
 * of length n: each character (odd-length palindromes) and each gap between
 * two adjacent characters (even-length palindromes).  For each center, expand
 * outward while the characters on both sides match; record the longest window.
 *
 * <pre>
 * Example: s = "babad"
 *
 *   center='b'(0): expand → "b"              len=1
 *   center='a'(1): expand → "bab"            len=3  ← new best
 *   center='b'(2): expand → "aba"            len=3  (tie)
 *   center='a'(3): expand → "a"              len=1
 *   center='d'(4): expand → "d"              len=1
 *   gap(0-1) 'b','a': mismatch immediately
 *   gap(1-2) 'a','b': mismatch immediately
 *   gap(2-3) 'b','a': mismatch immediately
 *   gap(3-4) 'a','d': mismatch immediately
 *
 *   Result: "bab"
 * </pre>
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>Time  : O(n²) – n centers, each expansion up to O(n)</li>
 *   <li>Space : O(1)  – only index variables stored (result returned as substring)</li>
 * </ul>
 *
 * <p><b>Note on Manacher's algorithm:</b><br>
 * There exists an O(n) solution (Manacher's) that preprocesses the string to
 * compute palindrome radii in linear time.  Expand-around-center is the
 * standard interview expectation and is significantly simpler to implement.
 */
public class LongestPalindromicSubstring {

    public static void main(String[] args) {

        // --- Test 1 ---
        String s1 = "babad";
        String r1 = longestPalindrome(s1);
        System.out.println("Input: \"" + s1 + "\"");
        System.out.println("Output  : \"" + r1 + "\"  (len=" + r1.length() + ")");
        System.out.println("Expected: \"bab\" or \"aba\"  => "
                + (r1.equals("bab") || r1.equals("aba") ? "PASS" : "FAIL"));
        System.out.println();

        // --- Test 2 ---
        String s2 = "cbbd";
        String r2 = longestPalindrome(s2);
        System.out.println("Input: \"" + s2 + "\"");
        System.out.println("Output  : \"" + r2 + "\"  (len=" + r2.length() + ")");
        System.out.println("Expected: \"bb\"  => " + (r2.equals("bb") ? "PASS" : "FAIL"));
        System.out.println();

        // --- Test 3 (single char) ---
        String s3 = "a";
        String r3 = longestPalindrome(s3);
        System.out.println("Input: \"" + s3 + "\"");
        System.out.println("Output  : \"" + r3 + "\"");
        System.out.println("Expected: \"a\"  => " + (r3.equals("a") ? "PASS" : "FAIL"));
        System.out.println();

        // --- Test 4 (even-length palindrome) ---
        String s4 = "abacaba";
        String r4 = longestPalindrome(s4);
        System.out.println("Input: \"" + s4 + "\"");
        System.out.println("Output  : \"" + r4 + "\"  (len=" + r4.length() + ")");
        System.out.println("Expected: \"abacaba\"  => " + (r4.equals("abacaba") ? "PASS" : "FAIL"));
    }

    // -------------------------------------------------------------------------
    // Main algorithm – Expand Around Center   O(n²) time | O(1) space
    // -------------------------------------------------------------------------
    private static String longestPalindrome(String s) {
        if (s == null || s.length() < 2) return s;

        int start = 0, maxLen = 1;

        for (int i = 0; i < s.length(); i++) {
            int len1 = expand(s, i, i);// Odd-length palindromes  (single character center)
            int len2 = expand(s, i, i + 1);// Even-length palindromes (gap between i and i+1 as center)
            int best = Math.max(len1, len2);
            if (best > maxLen) {
                maxLen = best;
                start  = i - (best - 1) / 2;  // back-compute left boundary
            }
        }
        return s.substring(start, start + maxLen);
    }

    // -------------------------------------------------------------------------
    // Helper – expand from center (lo, hi) while characters match;
    //          returns the length of the palindrome found
    // -------------------------------------------------------------------------
    private static int expand(String s, int lo, int hi) {
        while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
            lo--;
            hi++;
        }
        // lo and hi have moved one step past the palindrome boundary
        return hi - lo - 1;
    }
}
