package com.dnex.algorithm;
import java.io.FileNotFoundException;
import java.io.IOException;




public class StringReverseExample {

    public static void main(String args[])  {

        //original string
        String str = "Sony is going to introduce Internet TV soon-";
        System.out.println("Original String: " + str);

        //reversed string using Stringbuffer
        String reverseStr = new StringBuffer(str).reverse().toString();
        System.out.println("Reverse String in Java using StringBuffer: " + reverseStr);

        //iterative method to reverse String in Java
        reverseStr = reverse(str);
        System.out.println("Reverse String in Java using Iteration: " + reverseStr);

        //recursive method to reverse String in Java
        reverseStr = reverseRecursively(str);
        System.out.println("Reverse String in Java using Recursion: " + reverseStr);
        
        reverseStr = reverseStr(str);
        System.out.println("Reverse String in Java using Array Replace: " + reverseStr);
        
    }

    public static String reverse(String str) {
        StringBuilder strBuilder = new StringBuilder();
        char[] strChars = str.toCharArray();
        for (int i = strChars.length - 1; i >= 0; i--) {
            strBuilder.append(strChars[i]);
        }

        return strBuilder.toString();
    }
    
    //**
    //Reverse the string using Array replacement Method
    public static String reverseStr(String str) {
        
        char[] strChars = str.toCharArray();
        for (int i = 1; i <strChars.length/2; i++) {        	
        	char tmp ; 
        	tmp = strChars[strChars.length-i];
        	strChars[strChars.length-i] = strChars[i-1];
        	strChars[i-1] = tmp;     
        }
        return String.copyValueOf(strChars);
    }

    public static String reverseRecursively(String str) {
    	
        //base case to handle one char string and empty string
        if (str.length() < 2) return str;
        return reverseRecursively(str.substring(1)) + str.charAt(0);

    }
}


