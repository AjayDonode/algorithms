package com.dnex.random;

import java.util.HashMap;
import java.util.Map;

/**
 * LOGIC :
 * 1. Create a map of Roman symbols → values
 * 2. Loop through each character
 * 3. Compare current value with NEXT value
 *    - If current < next  →  SUBTRACT current
 *    - If current >= next →  ADD current
 * 4. Return total
 */

public class RomanToNumbers {

    public static void main(String[] args) {
        System.out.println(romanToInt("III"));   // 3
        System.out.println(intToRoman(3));
        System.out.println(romanToInt("IV"));    // 4
        System.out.println(intToRoman(4));
        System.out.println(romanToInt("XIV"));    // 15
        System.out.println(intToRoman(14));
        System.out.println(romanToInt("LVIII")); // 58
        System.out.println(intToRoman(58));
        System.out.println(romanToInt("MCMXCIV")); // 1994
        System.out.println(intToRoman(1994));
    }

    public static int romanToInt(String s) {
       Map<Character, Integer> romanMap = new HashMap<>();
        romanMap.put('I', 1);
        romanMap.put('V', 5);
        romanMap.put('X', 10);
        romanMap.put('L', 50);
        romanMap.put('C', 100);
        romanMap.put('D', 500);
        romanMap.put('M', 1000);
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int curr = romanMap.get(s.charAt(i));
            if(i+1 < s.length() && curr < romanMap.get(s.charAt(i+1)))
                total -=curr;
            else  total +=curr;
        }
        return total;
    }


    public static String intToRoman(int num) {
         int[] VALUES = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        String[] SYMBOLS = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};

        // StringBuilder is more memory efficient than String concatenation in loops
        StringBuilder result = new StringBuilder();

        // 2. Iterate through each value
        for (int i = 0; i < VALUES.length; i++) {
            // 3. Subtract value while possible and append symbol
            while (num >= VALUES[i]) {
                num -= VALUES[i];
                result.append(SYMBOLS[i]);
            }
        }
        return result.toString();
    }

}