package com.dnex.algorithm;

public class Palindrome {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
//		Scanner scanner = new Scanner(System.in);     
		int number = 21012;
		
		String inString = "That is si tahT";
		
		System.out.println("Is number : " + number +" is a palindrome? " 
							+ isPalindrome(number));
		

		System.out.println("Is String : " + inString +" is a palindrome? " 
							+ isPalindrome(inString));
	}

	private static boolean isPalindrome(String inString) {
		boolean isPalindrome = false;
		if(inString.equals(reverse(inString)))  isPalindrome = true;			
		return isPalindrome;
	}

	private static boolean isPalindrome(int number) {
		boolean isPalindrome = false;
		if (number == reverse(number))
			isPalindrome =true;
		return isPalindrome;
	}

	private static int reverse(int number) {
		int reverse = 0;
		while(number!=0){
			reverse = reverse*10 + number%10;
			number = number/10;
		}
		return reverse;
	}
	
	private static String reverse(String str) {
		char[] strChars = str.toCharArray();
	    for (int i = 1; i <strChars.length/2; i++) { 
	    	swap(strChars,i,strChars.length-i);
	    }
	    return String.copyValueOf(strChars);
	}

	private static void swap(char[] strChars, int i, int j) {
    	char tmp ; 
    	tmp = strChars[strChars.length-i];
    	strChars[strChars.length-i] = strChars[i-1];
    	strChars[i-1] = tmp;   
		
	}
/*
with recursive
String method2(String str)
{
  if(str.length() == 0)
  {
   return "";
  }
 return str.substring(str.length()-1)+method2(str.substring(0,str.length()-1));
}
*/
}
