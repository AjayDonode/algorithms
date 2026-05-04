package com.dnex.array;

import java.lang.reflect.Array;
import java.util.Arrays;

public class SecondLargest {
    public static void main (String[] args ){
        int[] arr = { 12, 35, 1, 10, 34, 35 };
        System.out.println("Hello send largest "+ getNthLargest(arr));

        int[] arr_1 = { 12, 35, 1, 10, 34, 35 };
        System.out.println("Hello send largest "+ getNthLargestFor(arr_1));

    }

    private static String getNthLargest(int[] arr) {
        Arrays.sort(arr);
        int element = 0;
        for (int i = arr.length-1; i > 0 ; i--) {
            System.out.println(arr[i] +" "+arr[i-1]);
            if(arr[i-1]< arr[i]) {
                element = arr[i - 1]; break;
            }
        }
        return ""+ element;
    }

    private static int getNthLargestFor(int[] arr) {
        int largest = 0;
        int secondLarge =0;
        if(arr == null || arr.length < 2)
             return -1;

       for(int num : arr)
       {
           if(num > largest) {
               secondLarge = largest;
               largest = num;
           } else if (num > secondLarge && num != largest) {
               secondLarge = num;
           }

       }
        return  secondLarge;
    }
}
