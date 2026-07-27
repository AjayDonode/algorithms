package com.dnex.algorithm.matrix;

import java.util.ArrayList;
import java.util.List;

/**
 * LeetCode #54 – Spiral Matrix
 *
 * <p><b>Problem:</b><br>
 * Given an $m \times n$ matrix, return all its elements in spiral order (clockwise,
 * starting from top-left).</p>
 *
 * <pre>
 * Example:
 * Input: [[1,2,3],
 *         [4,5,6],
 *         [7,8,9]]
 * Output: [1,2,3,6,9,8,7,4,5]
 * </pre>
 *
 * <p><b>Solution:</b><br>
 * Use four pointers (top, bottom, left, right) to shrink the boundary inward.
 * Traverse four segments repeatedly until the boundaries cross:</p>
 *
 * <pre>
 * 1. Move right  across the current top row.
 * 2. Move down   along the current rightmost column.
 * 3. Move left   across the current bottom row. (if top ≤ bottom)
 * 4. Move up     along the current leftmost column. (if left ≤ right)
 * </pre>
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>Time  : O(m × n) – each element is visited exactly once.</li>
 *   <li>Space : O(1)     – excluding the result list.</li>
 * </ul>
 */
public class SpiralMatrix {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Spiral/Rotation of matrix!");
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        System.out.println(spiralOrder(matrix));
    }

    static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();

        //init  top-> right \/ bottom <- left \?
        int top = 0;
        int bottom = matrix.length-1;
        int left = 0;
        int right = matrix[0].length-1;

        while(top <= bottom && left <= right) {
            //1 row top : left->right
            for(int i=left; i<= right; i++) {
                result.add(matrix[top][i]);
            }
            top++;

            //2 col right: top->bottom
            for(int i=top; i<= bottom; i++) {
                result.add(matrix[i][right]);
            }
            right--;
            //3 row bottom -> left
            if (top <= bottom) {
                for(int i=right; i>= left; i--) {
                    result.add(matrix[bottom][i]);
                }
                bottom--;
            }
            //4 col left: bottom->top
            if(left<=right){
                for(int i=bottom; i>= top; i--) {
                    result.add(matrix[i][left]);
                }
                left++;
            }
        }

        return result;
    }

}
