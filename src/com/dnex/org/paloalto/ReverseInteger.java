package com.dnex.org.paloalto;

public class ReverseInteger {
    // The standard main method that runs when you start your program
    public static void main(String[] args) {
        System.out.println("Reversed number is "+  reverseInteger(12345));

    }

    private static int reverseInteger(int num) {
        int reversed = 0;
        //System.out.println("Value = "+12345%100);
        while (num != 0) {
            int digit = num % 10; //take last number
            reversed = reversed * 10 + digit;
            num /= 10;  // num = num / 10
        }
        return reversed;
    }
}