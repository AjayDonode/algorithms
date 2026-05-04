package com.java.threads;

import java.util.LinkedList;

public class ThreadSample_1_4 {

    private LinkedList list = new LinkedList();
    private final int LIMIT = 5;

    // Producer calls this
    public synchronized void produce(Object item) throws InterruptedException {
        // Rule: Always wait in a loop, not an 'if'
        while (list.size() == LIMIT) {
            System.out.println("Buffer full, producer waiting...");
            wait(); // Releases lock, thread sleeps
        }
        list.add(item);
        System.out.println("Produced: " + item);
        notifyAll(); // Wakes up consumers
    }

    // Consumer calls this
    public synchronized Object consume() throws InterruptedException {
        while (list.isEmpty()) {
            System.out.println("Buffer empty, consumer waiting...");
            wait(); // Releases lock, thread sleeps
        }
        Object item = list.removeFirst();
        System.out.println("Consumed: " + item);
        notifyAll(); // Wakes up producer
        return item;
    }
}
