package com.dnex.threads;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocalAsyncAggregator {

    // 1. Initialize a dedicated thread pool for our I/O bound tasks
    private static final ExecutorService executor = Executors.newFixedThreadPool(10);

    public static void main(String[] args) {
        System.out.println("Starting local async execution...\n");

        // Simulating the input parameters that would normally come from an API request
        String userId = "user_12345";
        String prompt = "Explain the future of AI";

        long startTime = System.currentTimeMillis();

        // 2. Kick off the simulated database fetch asynchronously
        CompletableFuture<String> dbFuture = CompletableFuture.supplyAsync(() -> {
            System.out.println("[" + Thread.currentThread().getName() + "] Fetching from DB...");
            return mockDbCall(userId);
        }, executor);

        // 3. Kick off the simulated AI API call asynchronously
        CompletableFuture<String> aiFuture = CompletableFuture.supplyAsync(() -> {
            System.out.println("[" + Thread.currentThread().getName() + "] Calling AI API...");
            return mockAiApiCall(prompt);
        }, executor);

        // 4. Combine the results when BOTH are done
        CompletableFuture<String> combinedResult = dbFuture.thenCombine(aiFuture, (dbData, aiData) -> {
            return "Profile: " + dbData + " | AI Response: " + aiData;
        }).exceptionally(ex -> {
            System.err.println("Error in pipeline: " + ex.getMessage());
            return "Fallback Response";
        });

        // 5. Block the main thread to wait for the final result (similar to what Lambda requires)
        String finalOutput = combinedResult.join();

        long endTime = System.currentTimeMillis();

        System.out.println("\n--- FINAL RESULT ---");
        System.out.println(finalOutput);
        System.out.println("Total Execution Time: " + (endTime - startTime) + "ms");

        // 6. CRITICAL FOR LOCAL APPS: Shut down the executor so the Java process can exit gracefully
        executor.shutdown();
    }

    // --- Mock External Services ---

    private static String mockDbCall(String id) {
        try {
            // Simulate a 500ms network delay to a database
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "User_" + id;
    }

    private static String mockAiApiCall(String prompt) {
        try {
            // Simulate an 800ms delay to an external AI model
            Thread.sleep(800);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Generated text for: '" + prompt + "'";
    }
}