package com.dnex.algorithm.util;

public class FizzBuzz {

	/**
	 * @param args
	 * This question is asked in GE and Service Now
	 * There are lot of ways to do this
	 * @author adonode
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		for(int i = 1; i<100; i++){
		String output = new String();
		int inputNumber = i; 
		
		if(inputNumber%3==0)
			output += "fizz";
		if(inputNumber%5==0)
			output += "buzz";
		else if (output == ""){
			 output =  ""+inputNumber;
		}
		System.out.println(i+" "+output);
		}
	}

	
}
