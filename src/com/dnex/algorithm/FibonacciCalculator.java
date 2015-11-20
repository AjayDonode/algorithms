package com.dnex.algorithm;

//**
//The Fibonacci numbers are the sequence of numbers Fn defined by the following recurrence relation:
//Fn = Fn-1 + Fn-2
//
//**//
public class FibonacciCalculator {

    public static void main(String args[]) {
        int number = 20;
      
        System.out.println("Fibonacci series upto " + number +" numbers : ");
        for(int i=1; i<=number; i++){
            System.out.print(fibonacci(i) +" ");
        }
        System.out.println("\n Fibonacci numbers "+fibonacci2(20));
    } 
  
    /*
     * Java program for Fibonacci number using recursion.
     * This program uses tail recursion to calculate Fibonacci number for a given number
     * @return Fibonacci number
     */
    public static int fibonacci(int number){
        if(number == 1 || number == 2){
            return 1;
        }
      
        return fibonacci(number-1) + fibonacci(number-2); //tail recursion
    }
  
    /*
     * Java program to calculate Fibonacci number using loop or Iteration.
     * @return Fibonacci number
     */
    public static int fibonacci2(int number){
        if(number == 1 || number == 2){
            return 1;
        }
        int fibo1=0, fibo2=1, fibonacci=1;
        for(int i= 3; i<= number; i++){
            fibonacci = fibo1 + fibo2; //Fibonacci number is sum of previous two Fibonacci number
            fibo1 = fibo2;
            fibo2 = fibonacci;
            System.out.println("Fibo "+ fibonacci);
        }
        
        return fibonacci; //Fibonacci number
      
    }   
  
}