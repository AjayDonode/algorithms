package com.dnex.threads;

//Java 21+ libs
//import java.util.concurrent.StructuredTaskScope;
//import java.util.concurrent.StructuredTaskScope.Subtask;

public class VirtualThreadAggregator {

    public static void main(String[] args) {
        System.out.println("Starting Virtual Thread execution...\n");
        long startTime = System.currentTimeMillis();
    }
        /**
        try {
            // Execute the scatter-gather workflow
            String result = fetchAndCombineData("user_12345", "Explain the future of AI");
            System.out.println("\n--- FINAL RESULT ---");
            System.out.println(result);

        } catch (Exception e) {
            System.err.println("Pipeline failed: " + e.getMessage());
        }

        long endTime = System.currentTimeMillis();
        System.out.println("Total Execution Time: " + (endTime - startTime) + "ms");
    }

    public static String fetchAndCombineData(String userId, String prompt) throws InterruptedException {
        // ShutdownOnFailure means if ONE task fails, cancel the others immediately.
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {

            // 1. "Fork" kicks off the tasks concurrently on lightweight Virtual Threads
            Subtask<String> dbTask = scope.fork(() -> {
                System.out.println("[" + Thread.currentThread().toString() + "] Fetching DB...");
                return mockDbCall(userId);
            });

            Subtask<String> aiTask = scope.fork(() -> {
                System.out.println("[" + Thread.currentThread().toString() + "] Calling AI...");
                return mockAiApiCall(prompt);
            });

            // 2. Block until BOTH are done (or one fails).
            // Crucially: This only blocks the current Virtual Thread, NOT an OS thread!
            scope.join();

            // 3. Throw an exception if any of the subtasks failed
            scope.throwIfFailed();

            // 4. Safely retrieve the results. No .thenCombine() needed!
            return "Profile: " + dbTask.get() + " | AI Response: " + aiTask.get();
        }
        // The try-with-resources block ensures that all threads created in this scope
        // are strictly contained and cleaned up.
    }

    // --- Mock External Services ---
    private static String mockDbCall(String id) throws InterruptedException {
        Thread.sleep(500); // In a Virtual Thread, this UNMOUNTS from the OS thread.
        return "User_" + id;
    }

    private static String mockAiApiCall(String prompt) throws InterruptedException {
        Thread.sleep(800); // In a Virtual Thread, this UNMOUNTS from the OS thread.
        return "Generated text for: '" + prompt + "'";
    }
         **/

}