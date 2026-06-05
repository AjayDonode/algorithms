package com.dnex.threads;

import java.util.*;

/**
 * The Interface for any object that wants to receive messages.
 * In 1.4, we don't have generics, so the message is a simple String.
 */
interface Subscriber {
    void onMessage(String message);
}

/**
 * The Broker acts as the "Monitor" object.
 * It manages thread synchronization using the 'synchronized' keyword,
 * wait(), and notifyAll().
 */
class PubSubBroker {
    // Note: No Generics in 1.4; these hold 'Object' types
    private List subscribers = new ArrayList();
    private List messageQueue = new ArrayList();
    // volatile or synchronized is needed if modified, here used as a thread-safe flag
    private boolean running = true;

    /**
     * Synchronized on 'this' (the broker instance).
     * Ensures only one thread can modify the subscriber list at a time.
     */
    public synchronized void subscribe(Subscriber s) {
        subscribers.add(s);
    }

    /**
     * Adds a message to the queue and wakes up any threads currently
     * parked in the wait() state.
     */
    public synchronized void publish(String message) {
        messageQueue.add(message);
        // notifyAll() wakes up ALL threads waiting on this broker's monitor.
        // One of them will re-acquire the lock and process the message.
        notifyAll();
    }

    /**
     * Creates a dedicated worker thread for a specific subscriber.
     */
    public void startDispatcher(final Subscriber subscriber) {
        // 'final' is required so the anonymous inner class can access 'subscriber'
        new Thread(new Runnable() {
            public void run() {
                while (running) {
                    String msg = null;

                    // We must synchronize on the outer class instance to call wait/remove
                    synchronized (PubSubBroker.this) {
                        // WHILE loop is critical to handle "Spurious Wakeups"
                        // Thread checks if the queue is empty before proceeding
                        while (messageQueue.isEmpty()) {
                            try {
                                // Thread releases the lock and sleeps here
                                PubSubBroker.this.wait();
                            } catch (InterruptedException e) {
                                // Standard way to handle thread interruption in 1.4
                                return;
                            }
                        }
                        // Explicit cast required (no generics)
                        msg = (String) messageQueue.remove(0);
                    }

                    // Execute the callback OUTSIDE the synchronized block.
                    // This prevents a slow subscriber from locking the entire broker.
                    subscriber.onMessage(msg);
                }
            }
        }).start();
    }
}

public class SimplePubSub14 {
    public static void main(String[] args) {
        PubSubBroker broker = new PubSubBroker();

        // Anonymous inner class implementation (standard Java 1.4 style)
        Subscriber s1 = new Subscriber() {
            public void onMessage(String m) {
                System.out.println("Sub1 received: " + m);
            }
        };

        Subscriber s2 = new Subscriber() {
            public void onMessage(String m) {
                System.out.println("Sub2 received: " + m);
            }
        };

        broker.subscribe(s1);
        broker.subscribe(s2);

        // This creates two worker threads that will sit in the wait() state
        // until 'publish' is called.
        broker.startDispatcher(s1);
        broker.startDispatcher(s2);

        // When these are called, notifyAll() triggers the dispatchers to wake up
        broker.publish("Hello World");
        broker.publish("Pub-Sub in 1.4");
        broker.publish("Pub-Sub in EXt");
    }
}
