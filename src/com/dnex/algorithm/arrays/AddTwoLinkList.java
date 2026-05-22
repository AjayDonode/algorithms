package com.dnex.algorithm.arrays;

/**
 * LeetCode #2 – Add Two Numbers
 *
 * Digits are stored in reverse order inside each linked list
 * (least-significant digit first), mirroring the classic LeetCode problem.
 *
 * Two approaches are shown side-by-side:
 *   1. calculateSum            – plain int[] with a carry loop
 *   2. calculateSumLinkdList   – true singly-linked list traversal
 */
public class AddTwoLinkList {

    public static void main(String[] args) {

        // Input arrays (least-significant digit first, matching the LeetCode convention)
        int[] a1 = {2, 4, 3};   // represents 342
        int[] a2 = {5, 6, 4};   // represents 465  →  sum = 807

        System.out.println("=== Array approach ===");
        calculateSum(a1, a2);

        // Build linked lists from the same arrays
        ListNode l1 = buildList(a1);
        ListNode l2 = buildList(a2);
        System.out.println("\nl1 : " + l1);
        System.out.println("l2 : " + l2);

        System.out.println("\n=== Linked-list approach ===");
        ListNode result = calculateSumLinkdList(l1, l2);
        System.out.println("sum (raw list): " + result);
        System.out.println("sum (number)  : " + toNumber(result));
    }

    // -------------------------------------------------------------------------
    // Approach 1 – int[] (original, fixed-size)
    // -------------------------------------------------------------------------
    private static void calculateSum(int[] l1, int[] l2) {
        int carry = 0;
        int[] result = new int[l1.length];
        for (int i = l1.length - 1; i >= 0; i--) {
            int cal = carry + l1[i] + l2[i];
            result[i] = cal % 10;
            carry     = cal / 10;
        }
        // Print digits in natural order (most-significant first)
        StringBuilder sb = new StringBuilder();
        for (int d : result) sb.append(d);
        System.out.println("sum: " + sb);
    }

    // -------------------------------------------------------------------------
    // Approach 2 – Linked list (O(max(m,n)) time, O(max(m,n)) space)
    //
    // Walk both lists simultaneously, digit by digit (already in reverse order),
    // propagating the carry.  A dummy head node avoids special-casing the first
    // node, which keeps the loop clean and easy to follow.
    // -------------------------------------------------------------------------
    private static ListNode calculateSumLinkdList(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);   // sentinel – result built after this
        ListNode cur   = dummy;
        int carry = 0;

        while (l1 != null || l2 != null || carry != 0) {
            int val1 = (l1 != null) ? l1.val : 0;
            int val2 = (l2 != null) ? l2.val : 0;

            int sum  = val1 + val2 + carry;
            carry    = sum / 10;

            cur.next = new ListNode(sum % 10);  // append digit to result list
            cur      = cur.next;

            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }

        return dummy.next;  // skip the sentinel
    }

    // -------------------------------------------------------------------------
    // Helper – convert an int[] to a singly-linked list (same order)
    // -------------------------------------------------------------------------
    private static ListNode buildList(int[] digits) {
        ListNode dummy = new ListNode(0);
        ListNode cur   = dummy;
        for (int d : digits) {
            cur.next = new ListNode(d);
            cur      = cur.next;
        }
        return dummy.next;
    }

    // -------------------------------------------------------------------------
    // Helper – convert an LSB-first linked list back to a readable integer
    // e.g.  7 -> 0 -> 8  ==>  807
    // -------------------------------------------------------------------------
    private static int toNumber(ListNode head) {
        int result   = 0;
        int place    = 1;        // 1, 10, 100, ...
        ListNode cur = head;
        while (cur != null) {
            result += cur.val * place;
            place  *= 10;
            cur     = cur.next;
        }
        return result;
    }
}
