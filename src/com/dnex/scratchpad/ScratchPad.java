
package com.dnex.scratchpad;

public class ScratchPad {
     public static void main(String[] args) {
        System.out.println("Liner Search");
         int[] data = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
         int target = 4;
         System.out.println("Input "+ target+ "Found at "+ recursiveBinarySearch(target, data , 0, data.length-1));
    }
private static int binarySearch(int target, int [] arr) {
         int low = 0; int heigh = arr.length-1;

         while (low <= heigh) {

             int mid = low + (heigh-low)/2;

             if(arr[mid] == target) {return mid;}

             else if (arr[mid] < target) {
                  low =  mid+1;
             } else {
                 heigh = mid -1;
             }
         }
return  -1;
}


    private static int recursiveBinarySearch(int target, int [] arr, int low, int heigh) {
            int result = -1;
            int mid = low + (heigh-low)/2;

            if(arr[mid] == target) {return mid;}

            else if (arr[mid] < target) {
                low = mid +1;
                result = recursiveBinarySearch (target, arr, low, heigh);
            } else {
                heigh = mid +-1;
                result = recursiveBinarySearch (target, arr, low, heigh);
            }
    return  result;
    }


    private static int leanerSearch(int target, int [] arr) {
        int result = -1;
        for(int i = 0 ; i<arr.length -1 ; i++ ) {
            if(arr[i] == target) {result = i; break;}
        }
        return  result;
    }
}
