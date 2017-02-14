package com.dnex.algorithm;

public class TesterClass {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		int input = 12;
		//System.out.println("Fibonancy Series "+printFiboniciSeries(20));
		
		for (int i=1; i<=input; i++)
		System.out.print(fibonancysimple(i)+" ,");
		System.out.println("-------");
		for (int i=1; i<=input; i++)
		System.out.print(fibonancy(i)+" ,");
		 // Test Comment
		}

	private static int fibonancy(int i) {
		if(i==1 || i==2) return 1;
		return fibonancy(i-1)+fibonancy(i-2);
	}

	private static int fibonancysimple(int i) {
		if(i==1 || i==2) return 1;
		
		int fibo1=1; int fibo2=1;int fibonancy=1;
		for (int j = 3; j<=i ; j++)
		{
			fibonancy = fibo1+fibo2;
			fibo1=fibo2;
			fibo2= fibonancy;
		}
		return fibonancy;
	}

	
	
	
}
