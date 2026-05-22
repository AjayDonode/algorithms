package com.dnex.algorithm.arrays;

/**
 * Singly-linked list node used by AddTwoLinkList.
 */
public class ListNode {
    int val;
    ListNode next;

    ListNode() {}

    ListNode(int val) {
        this.val = val;
    }

    ListNode(int val, ListNode next) {
        this.val  = val;
        this.next = next;
    }

    /** Pretty-prints the list starting at this node, e.g. 2 -> 4 -> 3. */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        ListNode cur = this;
        while (cur != null) {
            sb.append(cur.val);
            if (cur.next != null) sb.append(" -> ");
            cur = cur.next;
        }
        return sb.toString();
    }
}
