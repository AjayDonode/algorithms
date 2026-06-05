package com.dnex.algorithm;

import java.util.Arrays;

/**
 * Singly linked list built by appending to a tail.
 *
 * <p>This implementation constructs the list directly in the same order as the
 * supplied int array, using a constant‑time tail insertion. No extra reversal
 * pass is required. The class also contains an optional helper to reverse the
 * list if you need to see the reversed order.
 *
 * <p>Reference: http://www.codeproject.com/Articles/27742/How-To-Reverse-a-Linked-List-Different-Ways
 */
public class SinglyLinkList {

    /** Entry point – simple demo of building, printing, and optional reversal. */
    public static void main(String[] args) {
        int[] input = {1, 2, 3, 4, 5};
        System.out.println("Input is " + Arrays.toString(input));

        SinglyLinkList list = new SinglyLinkList();
        Node head = list.buildFromArray(input);

        System.out.println("\nList (forward)  : " + list.toString(head));
        System.out.println("List (reversed) : " + list.reverseAndPrint(head));
    }

    /**
     * Build a singly linked list that preserves the order of {@code arr}.
     *
     * @param arr array of integers; may be empty or null
     * @return the head of the newly created linked list, or {@code null} if the
     *         array is empty
     */
    public Node buildFromArray(int[] arr) {
        if (arr == null || arr.length == 0) {
            return null; // empty list
        }

        // First element becomes both head and tail.
        Node head = new Node(arr[0], null);
        Node tail = head;

        // Append each subsequent element to the tail.
        for (int i = 1; i < arr.length; i++) {
            Node newNode = new Node(arr[i], null);
            tail.next = newNode; // link after current tail
            tail = newNode;      // move tail forward
        }
        return head;
    }

    /** Convert the linked list starting at {@code head} to a readable string. */
    public String toString(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) {
            sb.append(cur.data);
            if (cur.next != null) sb.append(" → ");
        }
        return sb.toString();
    }

    /**
     * Reverse the list in‑place (iterative O(n) algorithm) and return a string
     * representation of the reversed list. The original {@code head} reference
     * is not modified for the caller.
     */
    public String reverseAndPrint(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        // `prev` now points to the new head of the reversed list.
        return toString(prev);
    }

    /** Simple node class for the singly linked list. */
    private static class Node {
        int data;
        Node next;
        Node(int data, Node next) {
            this.data = data;
            this.next = next;
        }
    }
}
