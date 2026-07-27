package com.dnex.algorithm.matrix;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 * LeetCode #417 – Pacific Atlantic Water Flow
 *
 * <p><b>Problem:</b><br>
 * Given an m×n matrix of non-negative heights representing an island:
 * <ul>
 *   <li>The Pacific Ocean  touches the TOP  and LEFT  edges.</li>
 *   <li>The Atlantic Ocean touches the BOTTOM and RIGHT edges.</li>
 *   <li>Water flows from a cell to a 4-directional neighbour only if the
 *       neighbour's height is ≤ the current cell's height.</li>
 * </ul>
 * Return all cells from which water can reach BOTH oceans.
 *
 * <p><b>Naive approach (too slow – O(m²n²)):</b><br>
 * For every cell, DFS downhill and check if both oceans are reachable.
 * This is too slow for large grids.
 *
 * <p><b>Optimal approach – Reverse BFS from ocean borders (O(m×n)):</b><br>
 * <em>Key insight:</em> Instead of going downhill from each cell to the ocean,
 * start FROM the ocean and climb UPHILL (neighbour height ≥ current height).
 * Any cell we can reach this way "could have sent water to that ocean".
 *
 * <pre>
 * Step 1 — Seed Pacific  BFS with all top-row + left-column cells.
 * Step 2 — Seed Atlantic BFS with all bottom-row + right-column cells.
 * Step 3 — For each BFS, expand to neighbours whose height ≥ current.
 * Step 4 — Result = cells marked reachable by BOTH BFS passes.
 *
 * Visual for heights = [[1,2,2,3,5],
 *                        [3,2,3,4,4],
 *                        [2,4,5,3,1],
 *                        [6,7,1,4,5],
 *                        [5,1,1,2,4]]:
 *
 *   P=Pacific reachable   A=Atlantic reachable   *=both
 *
 *   P  P  P  P  P       .  .  .  .  A       P  P  P  P  *
 *   P  .  .  P  P       .  .  .  A  A       P  .  .  *  *
 *   P  .  P  .  .       .  .  A  A  A       P  .  *  *  .
 *   P  P  .  .  P       A  A  A  A  A       *  *  .  .  *
 *   P  .  .  .  P       A  A  A  A  A       *  .  .  .  *
 * </pre>
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>Time  : O(m × n) – each cell is enqueued at most twice (once per ocean)</li>
 *   <li>Space : O(m × n) – visited arrays + queue</li>
 * </ul>
 */
public class PacificAtlanticWaterFlow {

    // 4-directional movement: right, left, down, up
    private static final int[][] DIRS = {{0,1},{0,-1},{1,0},{-1,0}};

    public static void main(String[] args) {

        // --- Test 1 ---
        int[][] h1 = {
            {1, 2, 2, 3, 5},
            {3, 2, 3, 4, 4},
            {2, 4, 5, 3, 1},
            {6, 7, 1, 4, 5},
            {5, 1, 1, 2, 4}
        };
        System.out.println("=== Test 1 ===");
        System.out.println("Input:");
        printMatrix(h1);
        List<List<Integer>> r1 = pacificAtlantic(h1);
        System.out.println("Cells reaching both oceans: " + r1);
        System.out.println("Expected: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]");
        System.out.println();

        // --- Test 2 ---
        int[][] h2 = {{2, 1}, {1, 2}};
        System.out.println("=== Test 2 ===");
        System.out.println("Input:");
        printMatrix(h2);
        List<List<Integer>> r2 = pacificAtlantic(h2);
        System.out.println("Cells reaching both oceans: " + r2);
        System.out.println("Expected: [[0,0],[0,1],[1,0],[1,1]]");
        System.out.println();

        // --- Test 3 (single cell) ---
        int[][] h3 = {{1}};
        System.out.println("=== Test 3 (single cell) ===");
        List<List<Integer>> r3 = pacificAtlantic(h3);
        System.out.println("Result: " + r3);
        System.out.println("Expected: [[0,0]]");
    }

    // -------------------------------------------------------------------------
    // Main solution – Reverse BFS from both ocean borders
    // -------------------------------------------------------------------------
    public static List<List<Integer>> pacificAtlantic(int[][] heights) {
        int rows = heights.length;
        int cols = heights[0].length;

        // Visited arrays — true means "this ocean can reach this cell going uphill"
        boolean[][] pacific  = new boolean[rows][cols];
        boolean[][] atlantic = new boolean[rows][cols];

        Queue<int[]> pacQueue = new LinkedList<>();
        Queue<int[]> atlQueue = new LinkedList<>();

        // ── Seed the queues with ocean border cells ──────────────────────────
        for (int r = 0; r < rows; r++) {
            // Left column  → Pacific;  Right column → Atlantic
            pacQueue.add(new int[]{r, 0});        
            pacific[r][0]        = true;
            atlQueue.add(new int[]{r, cols - 1}); 
            atlantic[r][cols-1]  = true;
        }
        for (int c = 0; c < cols; c++) {
            // Top row → Pacific;  Bottom row → Atlantic
            pacQueue.add(new int[]{0, c});        pacific[0][c]        = true;
            atlQueue.add(new int[]{rows - 1, c}); atlantic[rows-1][c]  = true;
        }

        // ── BFS uphill from each ocean ────────────────────────────────────────
        bfs(heights, pacQueue, pacific);
        bfs(heights, atlQueue, atlantic);

        // ── Collect cells reachable by BOTH oceans ───────────────────────────
        List<List<Integer>> result = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (pacific[r][c] && atlantic[r][c]) {
                    result.add(Arrays.asList(r, c));
                }
            }
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // BFS helper – expands to neighbours whose height >= current cell's height
    // (reverse of "water flows downhill" = we climb uphill from the ocean)
    // -------------------------------------------------------------------------
    private static void bfs(int[][] heights, Queue<int[]> queue, boolean[][] visited) {
        int rows = heights.length;
        int cols = heights[0].length;

        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            int r = cell[0], c = cell[1];

            for (int[] d : DIRS) {
                int nr = r + d[0];
                int nc = c + d[1];

                // Skip out-of-bounds, already visited, or cells lower than current
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { continue; }
                if (visited[nr][nc]) { continue; }
                if (heights[nr][nc] < heights[r][c]) { continue; } // can't flow downhill back

                visited[nr][nc] = true;
                queue.add(new int[]{nr, nc});
            }
        }
    }

    // -------------------------------------------------------------------------
    // Helper – pretty-print the height matrix
    // -------------------------------------------------------------------------
    private static void printMatrix(int[][] m) {
        for (int[] row : m) {
            System.out.println("  " + Arrays.toString(row));
        }
    }
}
