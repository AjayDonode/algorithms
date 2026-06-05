package com.dnex.algorithm;

import java.util.Arrays;

/**
 * Minimum Distance Problems – two closely related problems.
 *
 * ─────────────────────────────────────────────────────────────────────
 * Problem 1 – Minimum Distance Between Two Elements  (custom / LC #243)
 *   Given an array and two values x, y, find the minimum index-gap
 *   between any occurrence of x and any occurrence of y.
 *   Approach : single-pass, track last-seen index of each value.
 *   Complexity: Time O(n) · Space O(1)
 *
 * ─────────────────────────────────────────────────────────────────────
 * Problem 2 – Shortest Distance to a Character  (LC #821)  ← NEAREST PROBLEM
 *   Given a string s and a character c, return an int[] where each
 *   element is the minimum distance from that position to the NEAREST
 *   occurrence of c anywhere in the string.
 *
 *   Example:
 *     s = "loveleetcode",  c = 'e'
 *     index:  0 1 2 3 4 5 6 7 8 9 10 11
 *     chars:  l o v e l e e t c o  d  e
 *     output: 3 2 1 0 1 0 0 1 2 2  1  0
 *
 *   Approach : two-pass sweep
 *     Pass 1 (left→right) : fill distance from nearest c seen to the LEFT.
 *     Pass 2 (right→left) : update with distance from next c seen to the RIGHT.
 *     Taking min of both passes gives the true nearest distance.
 *   Complexity: Time O(n) · Space O(n)
 *
 * ─────────────────────────────────────────────────────────────────────
 * Connection between the two:
 *   Both track "how far am I from the nearest matching position?"
 *   Problem 1 answers it for two specific values in one array.
 *   Problem 2 answers it for EVERY position relative to one character.
 */
public class MinimumDIstance {

    public static void main(String[] args) {

        // ── Problem 1 ─────────────────────────────────────────────────────────
        System.out.println("=== Problem 1: Min Distance Between Two Elements ===");
        int[] arr = {13, 5, 4, 2, 6, 3, 9, 4, 8, 3};
        int x = 5, y = 3;
        System.out.println("Array  : " + Arrays.toString(arr));
        System.out.println("x=" + x + "  y=" + y + "  → distance : " + minDistance(arr, x, y));  // 4
        System.out.println("x=99 (missing)         → distance : " + minDistance(arr, 99, y));     // -1
        System.out.println("x=y=3 (same element)   → distance : " + minDistance(arr, 3, 3));      // 4

        System.out.println();

        // ── Problem 2 ─────────────────────────────────────────────────────────
        System.out.println("=== Problem 2: Shortest Distance to a Character (LC #821) ===");

        String s1 = "loveleetcode";
        System.out.println("s=\"" + s1 + "\"  c='e'");
        System.out.println("Result  : " + Arrays.toString(shortestToChar(s1, 'e')));
        System.out.println("Expected: [3, 2, 1, 0, 1, 0, 0, 1, 2, 2, 1, 0]");
        System.out.println();

        String s2 = "aaba";
        System.out.println("s=\"" + s2 + "\"  c='b'");
        System.out.println("Result  : " + Arrays.toString(shortestToChar(s2, 'b')));
        System.out.println("Expected: [2, 1, 0, 1]");
    }

    // =========================================================================
    // Problem 1 – Minimum Distance Between Two Elements
    //
    // Single pass: track last seen index of n1 (pos1) and n2 (pos2).
    // Update the running minimum whenever both have been seen at least once.
    // =========================================================================
    private static int minDistance(int[] input, int n1, int n2) {
        int pos1     = Integer.MAX_VALUE;   // "not yet found" sentinel
        int pos2     = Integer.MAX_VALUE;
        int distance = Integer.MAX_VALUE;

        for (int i = 0; i < input.length; i++) {
            if (input[i] == n1) { pos1 = i; }
            if (input[i] == n2) { pos2 = i; }   // if/if (not else-if) correctly handles n1==n2

            if (pos1 != Integer.MAX_VALUE && pos2 != Integer.MAX_VALUE) {
                distance = Math.min(distance, Math.abs(pos1 - pos2));
            }
        }

        return distance == Integer.MAX_VALUE ? -1 : distance;
    }

    // =========================================================================
    // Problem 2 – Shortest Distance to a Character  (LeetCode #821)
    //
    // Two-pass sweep:
    //   Pass 1 left→right : dist[i] = i - lastSeen      (left  distance)
    //   Pass 2 right→left : dist[i] = min(dist[i], nextSeen - i)  (right distance)
    //
    // Visual for "loveleetcode", c='e':
    //   After pass 1:  [big, big, big,  0,  1,  0,  0,  1,  2,  3,  4,  0]
    //   After pass 2:  [  3,   2,   1,  0,  1,  0,  0,  1,  2,  2,  1,  0]  ← answer
    // =========================================================================
    private static int[] shortestToChar(String s, char c) {
        int n      = s.length();
        int[] dist = new int[n];

        // Pass 1: left → right  (distance from nearest c to the LEFT)
        int last = Integer.MIN_VALUE / 2;    // large negative so subtraction stays safe
        for (int i = 0; i < n; i++) {
            if (s.charAt(i) == c) { last = i; }
            dist[i] = i - last;              // how far right of the last seen 'c'
        }

        // Pass 2: right → left  (update with distance from nearest c to the RIGHT)
        last = Integer.MAX_VALUE / 2;        // large positive
        for (int i = n - 1; i >= 0; i--) {
            if (s.charAt(i) == c) { last = i; }
            dist[i] = Math.min(dist[i], last - i);   // keep the closer of left or right
        }

        return dist;
    }
}
