package com.dnex.random;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class DegreeOfArraySubarray {


    public static void main(String[] args) {
        int[] nums1 = {1, 2, 2, 3, 1};
        // Use Arrays.toString to print the whole array instead of memory address
        System.out.println(Arrays.toString(getShortestSubArray(nums1)));
        // Output: [2, 2]
        int[] nums2 = {1, 2, 2, 3, 1, 4, 2};
        System.out.println(Arrays.toString(getShortestSubArray(nums2)));
        // Output: [2, 2, 3, 1, 4, 2]
    }

    private static int[] getShortestSubArray(int[] nums) {

        Map<Integer, Integer> counts = new HashMap<>();
        Map<Integer, Integer> firstSeen = new HashMap<>();

        int maxDegree = 0;
        int minLength = 0;

        // NEW: Keep track of exact coordinates of the best box
        int bestStart = 0;
        int bestEnd = 0;

        for (int i = 0; i < nums.length; i++) {
            int currentNum = nums[i];
            firstSeen.putIfAbsent(currentNum, i);
            counts.put(currentNum , counts.getOrDefault(currentNum, 0)+1);
            int currentCount = counts.get(currentNum);
            //Find the highest frequency
            if(currentCount > maxDegree){
                maxDegree = currentCount;
                bestStart = firstSeen.get(currentNum);
                bestEnd = i;
                minLength = bestEnd - bestStart +1;
            }
            

        }
        System.out.println(minLength);
        System.out.println(counts);
        System.out.println(firstSeen);
        return null;
    }
}
