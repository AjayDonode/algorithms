package com.dnex.algorithm.matrix;

import java.util.Arrays;

public class FindIn2DMatrix {
public static void main(String[] args) {
    System.out.println("Hello 2D Matrix");
    int mat[][] = {
            { 1,  5,  9,  11},
            {14, 20, 21, 26},
            {30, 34, 43, 50}};


    //Search simple linear way / O(n*n)
    System.out.println("Found ? "+ searchMatrix(mat, 21));
    //Array is sorted, we can use binary search in each row
    System.out.println("Found ? "+ searchMatrixHalfBinary(mat, 21));
    //Flatte
    System.out.println("Found ? "+ searchMatrixBinary(mat, 21));

}

    private static boolean searchMatrixBinary(int[][] mat, int target) {

    if (mat == null || mat.length == 0 || mat[0].length == 0) {
        return false;
    }

    int rows = mat.length;
    int cols = mat[0].length;
    int low = 0;
    int hi = (rows * cols)-1;

    while (low <= hi) {
        int mid = low + (hi - low) / 2;
        int midValue = mat[mid/cols] [mid%cols];
        if(midValue == target){ 
            return true;
        } else if (midValue < target) {
            low = mid +1;
        } else {
            hi = mid -1;
        }
    }
    return false;
    }

    private static boolean searchMatrixHalfBinary(int[][] mat, int target) {
     int m = mat.length;
     int n= mat[0].length;
        System.out.println("Input  "+  m + "* "+ n);
        boolean isfound = false;
        for (int i = 0; i < m; i++) {
            System.out.println("mat[i]"+i +" " + Arrays.toString(mat[i]));
            isfound = binarySearch(mat[i], target);
            if (isfound) {
               break;
            }
        }
     return isfound;
    }


    private static boolean binarySearch(int[] mat, int target) {
        int lo = 0;
        int hi = mat.length - 1; // FIXED: - 1 to prevent out of bounds
        boolean isFound = false;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (mat[mid] == target) {
                isFound = true;
                break;
            } else if (mat[mid] < target) { // FIXED: Compare value, not index
                lo = mid + 1;
            } else if (mat[mid] > target) { // FIXED: Compare value, not index
                hi = mid - 1;
            }
        }
        return isFound;
    }

    public static boolean searchMatrix(int[][] matrix, int target) {
        boolean isfound = false;
        for (int i=0 ; i< matrix.length; i++) {
            for (int j=0 ; j< matrix[i].length; j++) {
                if(matrix[i][j] == target) {
                    isfound = true; break;
                }
            }
        }
        return isfound;
    }
}
