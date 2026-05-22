package com.dnex.algorithm.arrays;

import java.util.HashMap;
import java.util.Map;

public class TwoSum {
    public static void main(String[] args){

        System.out.println("Solving two sums");
        int[] input = {2,7,11,15};
        int target = 9;

        System.out.println("Brute Force");
        calculateTwoSum(input, target);
        System.out.println("Two pointers");
        calculateTwoSumTwoPointer(input, target);

        System.out.println("One pass hashmap");
        calculateTwoSumHashMap(input, target);
    }

    private static int [] calculateTwoSumHashMap(int[] input, int target) {

        Map<Integer,Integer> map = new HashMap<>();
        for (int i = 0; i < input.length; i++) {
            int complement = target - input[i];
            if (map.containsKey(complement)) {
                System.out.println(complement + " + "+ input[i]);
                return new int []{complement, input[i]};
            }
            else {
                map.put(input[i], i);
            }

        }
        return new int[] {};

    }

    private static int[] calculateTwoSumTwoPointer(int[] input, int target) {
     int left = 0;
     int right = input.length-1;

     while(left <  right) {
      int currSum = input[left] + input[right];
      if(currSum == target) {
          System.out.println(input[left] + " + "+ input[right]);
          return new int[]{input[left],input[right]};
      } else if (currSum < target) {
          left++;
      } else  right --;

     }
        return new int[]{};
    }

    private static int[] calculateTwoSum(int[] input, int target) {
        // sing for loop
        for (int i = 0; i <= input.length-1 ; i++) {
            System.out.println("Value"+input[i]);
            for (int j = 0; j < input.length ; j++) {
                if(i!=j) {
                    if( input[i] + input[j] == target) {
                        System.out.println(input[i] + " + "+ input[j]);
                        return new int[]{input[i], input[j]};
                    }
                }

            }

        }
        return new int [0];
    }
}
