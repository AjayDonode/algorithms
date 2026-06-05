package com.dnex.threads;

import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class ExplicitVirtualThreadAggregator {

    public static void main(String[] args) {
        // 1. Create an Executor that spins up a NEW Virtual Thread for EVERY task
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {

            // 2. Submit the tasks. These instantly run on Virtual Threads.
            Future<String> dbFuture = executor.submit(() -> mockDbCall("user_123"));
            Future<String> aiFuture = executor.submit(() -> mockAiApiCall("prompt"));

            // 3. .get() normally blocks a heavy OS thread.
            // But here, it just unmounts the Virtual Thread! It is perfectly safe.
            String dbResult = dbFuture.get();
            String aiResult = aiFuture.get();

            System.out.println("Profile: " + dbResult + " | AI Response: " + aiResult);

        } catch (Exception e) {
            e.printStackTrace();
        }
        // The try-with-resources block automatically waits for all Virtual Threads
        // to finish and then cleanly shuts down the executor.
    }

    private static String mockDbCall(String id) throws InterruptedException {
        Thread.sleep(500);
        return "User_" + id;
    }

    private static String mockAiApiCall(String prompt) throws InterruptedException {
        Thread.sleep(800);
        return "Generated text";
    }
}