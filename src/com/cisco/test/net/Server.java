package com.cisco.test.net;

import java.io.*;
import java.net.*;

/**
 * TCP Server that listens for client connections.
 * Receives text from client and sends it back in UPPERCASE.
 * 
 * Port: 6789
 * Protocol: TCP
 * Behavior: Converts all received messages to uppercase
 */
public class Server {
    
    // Server Configuration
    private static final int PORT = 6789;
    
    public static void main(String[] args) throws Exception {
        // Create server socket to listen for incoming connections
        ServerSocket welcomeSocket = new ServerSocket(PORT);
        System.out.println("\n=== TCP Server Started ===");
        System.out.println("Server listening on port: " + PORT);
        System.out.println("Waiting for client connections...\n");
        
        // Accept connections indefinitely
        while (true) {
            try {
                // Step 1: Accept incoming client connection
                Socket connectionSocket = welcomeSocket.accept();
                System.out.println("[Connection Established] Client connected from: " 
                    + connectionSocket.getInetAddress().getHostAddress());
                
                // Step 2: Set up input stream to receive data from client
                BufferedReader inFromClient = new BufferedReader(
                    new InputStreamReader(connectionSocket.getInputStream()));
                
                // Step 3: Set up output stream to send data back to client
                DataOutputStream outToClient = new DataOutputStream(
                    connectionSocket.getOutputStream());
                
                // Step 4: Read message from client
                String clientMessage = inFromClient.readLine();
                System.out.println("[Received] " + clientMessage);
                
                // Step 5: Process message (convert to uppercase)
                String processedMessage = clientMessage.toUpperCase() + '\n';
                
                // Step 6: Send processed message back to client
                outToClient.writeBytes(processedMessage);
                System.out.println("[Sent] " + processedMessage.trim());
                System.out.println("---\n");
                
                // Close connection
                connectionSocket.close();
                
            } catch (IOException e) {
                System.err.println("Error handling client: " + e.getMessage());
            }
        }
    }
}