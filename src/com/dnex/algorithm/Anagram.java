package com.dnex.algorithm;

import java.io.IOException;

public class Anagram {

	public static void main(String[] args) throws IOException {
		System.out.println("Validating Anagram or not");
		String str1 = "1malyalam";
		String str2 = "lamlamya1";

		System.out.println("is Anagram " + isAnagram(str1, str2));

		System.out.println("is Anagram " + areAnagrams(str1, str2));

	}

	// Simplest way
	public static boolean isAnagram(String str1, String str2) {
		str1 = str1.toLowerCase();
		str2 = str2.toLowerCase();
		boolean anagram = false;
		if (str1.length() == str2.length()) {
			if (str1.equals(str2)) anagram = true;
		}
		return anagram;
	}

	// are Anagram
	public static boolean areAnagrams(String one, String two) {
		String oneLower = one.toLowerCase();
		String twoLower = two.toLowerCase();

		int sumOne = 0;
		for (int x = 0; x < oneLower.length(); x++) {
			Character c = oneLower.charAt(x);
			if (Character.isLetterOrDigit(c)) {
				sumOne += c.charValue();
			}
		}

		int sumTwo = 0;
		for (int x = 0; x < twoLower.length(); x++) {
			Character c = twoLower.charAt(x);
			if (Character.isLetterOrDigit(c)) {
				sumTwo += c.charValue();
			}
		}

		return sumOne == sumTwo;
	}

}
