package com.dnex.algorithm.string;

import java.util.HashSet;
import java.util.Set;

/**
 * LeetCode #3 – Longest Substring Without Repeating Characters
 *
 * Approach: Sliding Window + HashSet
 *   - left / right pointers define the current window [left, right]
 *   - expand right one step at a time
 *   - if chars[right] is already in the window, shrink from the left
 *     until the duplicate is removed
 *   - track the maximum window size seen so far
 *
 * Time  : O(n)  – each character is added and removed at most once
 * Space : O(min(n, alphabet))  – the set holds at most unique chars
 */
public class LongestSubstringNoRepeat {

    public static void main(String[] args) {

        // --- Test case 1 ---
        // Input : "abcabcbb"
        // Expected output : 3   ("abc")
        String s1 = "abcabcbb";
        int result1 = lengthOfLongestSubstring(s1);
        System.out.println("Input: \"" + s1 + "\"");
        System.out.println("Output  : " + result1);
        System.out.println("Expected: 3  => " + (result1 == 3 ? "PASS" : "FAIL"));
        System.out.println();

        // --- Test case 2 ---
        // Input : "bbbbb"
        // Expected output : 1   ("b")
        String s2 = "bbbbb";
        int result2 = lengthOfLongestSubstring(s2);
        System.out.println("Input: \"" + s2 + "\"");
        System.out.println("Output  : " + result2);
        System.out.println("Expected: 1  => " + (result2 == 1 ? "PASS" : "FAIL"));
        System.out.println();

        // --- Test case 3 ---
        // Input : "pwwkew"
        // Expected output : 3   ("wke")
        String s3 = "pwwkew";
        int result3 = lengthOfLongestSubstring(s3);
        System.out.println("Input: \"" + s3 + "\"");
        System.out.println("Output  : " + result3);
        System.out.println("Expected: 3  => " + (result3 == 3 ? "PASS" : "FAIL"));
    }

    // -------------------------------------------------------------------------
    // TODO: implement this method
    //
    // @param s  the input string
    // @return   length of the longest substring without repeating characters
    // -------------------------------------------------------------------------
    private static int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int left   = 0;
        int maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);

            // Shrink from the left until the duplicate is evicted
            while (window.contains(c)) {
                window.remove(s.charAt(left));
                left++;
            }

            window.add(c);                              // expand window to include c
            maxLen = Math.max(maxLen, right - left + 1); // update best
        }

        return maxLen;
    }
}
