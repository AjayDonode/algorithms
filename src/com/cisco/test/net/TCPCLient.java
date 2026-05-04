package com.cisco.test.net;

import java.io.*;
import java.net.*;

/**
 * TCP Client that connects to a server.
 * Sends a message to the server and receives the processed response.
 * 
 * Server Address: localhost
 * Server Port: 6789
 * Behavior: Sends text to server and displays the uppercase response
 */
public class TCPCLient {
    
    // Server Configuration
    private static final String SERVER_HOST = "localhost";
    private static final int SERVER_PORT = 6789;
    
    public static void main(String[] args) throws Exception {
        try {
            System.out.println("\n=== TCP Client Started ===");
            System.out.println("Connecting to server at " + SERVER_HOST + ":" + SERVER_PORT + "\n");
            
            // Step 1: Create input stream to read from user console
            BufferedReader userInput = new BufferedReader(
                new InputStreamReader(System.in));
            
            // Step 2: Create socket and connect to server
            Socket clientSocket = new Socket(SERVER_HOST, SERVER_PORT);
            System.out.println("[Connected] Successfully connected to server\n");
            
            // Step 3: Set up output stream to send data to server
            DataOutputStream outToServer = new DataOutputStream(
                clientSocket.getOutputStream());
            
            // Step 4: Set up input stream to receive data from server
            BufferedReader inFromServer = new BufferedReader(
                new InputStreamReader(clientSocket.getInputStream()));
            
            // Step 5: Read message from user
            System.out.print("[Input] Enter message to send to server: ");
            String userMessage = userInput.readLine();
            
            // Step 6: Send message to server
            System.out.println("[Sending] " + userMessage);
            outToServer.writeBytes(userMessage + '\n');
            
            // Step 7: Receive processed message from server
            String serverResponse = inFromServer.readLine();
            System.out.println("[Response] Server returned: " + serverResponse);
            System.out.println();
            
            // Step 8: Close connection
            clientSocket.close();
            System.out.println("[Closed] Connection terminated\n");
            
        } catch (ConnectException e) {
            System.err.println("[Error] Unable to connect to server. Make sure server is running on " 
                + SERVER_HOST + ":" + SERVER_PORT);
        } catch (IOException e) {
            System.err.println("[Error] Connection error: " + e.getMessage());
        }
    }
}