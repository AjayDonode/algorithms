package com.dnex.algorithm.util;
/**
 * Swap numbers not using temp variable
 * Asked in VMware 
 * @author adonode
 */
public class AlgorithmsUtility {

	public static void main(String[] args) {
		

		int x = 2, y = 4;
		System.out.println("Before Swap x "+x + " y "+y);
		swapNumbres(x, y);
		
		System.out.println("\nSwaping XOR way");
		System.out.println("Before Swap x "+x + " y "+y);
		swapNumbersXor(x, y);
	}
	
	
	public static void swapNumbres(int x , int y){
		x = x+y;
		y = x-y;
		x = x-y;
		System.out.println("After Swap x "+x + " y "+y);
	}
	
	public static void swapNumbersXor(int x, int y){
		x = x^y;
		y = x^y;
		x = x^y;
		System.out.println("After Swap x "+x + " y "+y);
	}
	
}
