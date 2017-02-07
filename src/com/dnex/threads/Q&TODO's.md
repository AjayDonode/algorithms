
Implement Blocking Queue using Threads? 

<code>
public class BlockingQueue implements Queue {
    private java.util.Queue queue = new java.util.LinkedList();
    /**
     * Make a blocking Dequeue call so that we'll only return when the queue has
     * something on it, otherwise we'll wait until something is put on it.
     * 
     * @returns This will return null if the thread wait() call is interrupted.
     */
    public synchronized Object dequeue() {
        Object msg = null;
        while (queue.isEmpty()) {
            try {
                wait();
            } catch (InterruptedException e) {
                // Error return the client a null item
                return msg;
            }
        }
        msg = queue.remove();
        return msg;
    }
    /**
     * Enqueue will add an object to this queue, and will notify any waiting
     * threads that there is an object available.
     */
    public synchronized void enqueue(Object o) {
        queue.add(o);
        // Wake up anyone waiting for something to be put on the queue.
        notifyAll();
    }
}
</code>
