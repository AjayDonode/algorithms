package com.dnex.algorithm;

import java.util.Random;

/**
 * Shortest Distance Between Points in 3D Space.
 *
 * <p>Given N random points in 3D space, this class demonstrates two independent
 * operations, each extracted into its own method:
 *
 * <p><b>Function 1 – findClosestPair()  O(n²) time | O(1) space</b><br>
 * Brute-force: compare every unique pair (i, j) where j > i.
 * Returns the pair with the minimum 3D Euclidean distance.
 *
 * <p><b>Function 2 – sortByDistanceFromOrigin()  O(n²) time | O(1) space</b><br>
 * Selection sort: arrange all points in ascending order of their distance
 * from the origin (0, 0, 0), so the nearest point is at index 0.
 *
 * <p><b>3D Euclidean distance formula:</b>
 * <pre>
 *   distance = √( (x2-x1)² + (y2-y1)² + (z2-z1)² )
 *
 *   Example: P1=(1,2,3)  P2=(4,6,3)
 *     dx=3, dy=4, dz=0
 *     distance = √(9+16+0) = √25 = 5.0
 * </pre>
 */
public class ShortestDistance {

    public static void main(String[] args) {

        // ── Generate 5 random 3D points ──────────────────────────────────────
        final ThreeDPoint[] points = new ThreeDPoint[5];
        final Random random = new Random();
        for (int i = 0; i < points.length; i++) {
            points[i] = new ThreeDPoint(
                    random.nextInt(100),
                    random.nextInt(100),
                    random.nextInt(100));
        }

        System.out.println("=== Input Points ===");
        for (int i = 0; i < points.length; i++) {
            System.out.println("  PT" + i + " " + points[i]);
        }

        // ── Function 1: Find the closest pair ────────────────────────────────
        System.out.println("\n=== Function 1: Closest Pair (Brute Force O(n²)) ===");
        findClosestPair(points);

        // ── Function 2: Sort all points by distance from origin ──────────────
        System.out.println("\n=== Function 2: Sort by Distance from Origin (Selection Sort O(n²)) ===");
        System.out.println("Before sort:");
        for (int i = 0; i < points.length; i++) {
            System.out.println("  PT" + i + " " + points[i]);
        }

        sortByDistanceFromOrigin(points);

        System.out.println("After sort (nearest to origin first):");
        for (int i = 0; i < points.length; i++) {
            System.out.println("  PT" + i + " " + points[i]);
        }
    }

    // =========================================================================
    // Function 1 – findClosestPair
    //
    // Compare every unique pair (i, j) where j > i to avoid duplicates.
    // Track the minimum distance and the indices of the two closest points.
    //
    // Trace example for 3 points P0, P1, P2:
    //   i=0, j=1  d(P0,P1)=12.5 → new min, pair=(0,1)
    //   i=0, j=2  d(P0,P2)= 8.3 → new min, pair=(0,2)
    //   i=1, j=2  d(P1,P2)=20.1 → not smaller, skip
    //   Result: closest pair is P0 and P2, distance=8.3
    //
    // Time O(n²)  |  Space O(1)
    // =========================================================================
    private static void findClosestPair(ThreeDPoint[] points) {
        double minDist = Double.POSITIVE_INFINITY;
        int    pairA   = -1;
        int    pairB   = -1;

        for (int i = 0; i < points.length; i++) {
            for (int j = i + 1; j < points.length; j++) {   // j > i avoids same pair twice
                double d = points[i].distanceTo(points[j]);
                if (d < minDist) {
                    minDist = d;
                    pairA   = i;
                    pairB   = j;
                }
            }
        }

        System.out.println("  Closest pair : PT" + pairA + " and PT" + pairB);
        System.out.println("  PT" + pairA + " = " + points[pairA]);
        System.out.println("  PT" + pairB + " = " + points[pairB]);
        System.out.printf ("  Distance      : %.4f%n", minDist);
    }

    // =========================================================================
    // Function 2 – sortByDistanceFromOrigin  (Bubble Sort)
    //
    // Sorts all points in ascending order of their distance from origin (0,0,0)
    // so that points[0] is the nearest and points[n-1] is the farthest.
    //
    // How bubble sort works — each outer pass bubbles the LARGEST unsorted
    // element to its final position at the end:
    //
    //   Pass 1: compare [0]↔[1], [1]↔[2], [2]↔[3], [3]↔[4]  → largest at [4]
    //   Pass 2: compare [0]↔[1], [1]↔[2], [2]↔[3]           → 2nd largest at [3]
    //   ...until fully sorted
    //
    // Example (origin distances):  [85, 6, 44, 12, 110]
    //   Pass 1: [6, 44, 12, 85, 110]
    //   Pass 2: [6, 12, 44, 85, 110]  ← sorted!
    //
    // Time O(n²)  |  Space O(1)
    // =========================================================================
    private static void sortByDistanceFromOrigin(ThreeDPoint[] points) {
        ThreeDPoint origin = new ThreeDPoint(0, 0, 0);
        int n = points.length;

        for (int i = 0; i < n - 1; i++) {
            // After each pass the last (i+1) elements are in their final place
            for (int j = 0; j < n - 1 - i; j++) {
                double dj   = points[j].distanceTo(origin);
                double djNext = points[j + 1].distanceTo(origin);

                // If the left neighbour is farther than the right, swap them
                if (dj > djNext) {
                    ThreeDPoint tmp = points[j];
                    points[j]       = points[j + 1];
                    points[j + 1]   = tmp;
                }
            }
        }
    }

    // =========================================================================
    // ThreeDPoint — immutable value type for a point in 3D space
    //
    // Provides:
    //   distanceTo(other) — 3D Euclidean distance to another point  O(1)
    //   toString()        — "{X=.., Y=.., Z=..} | origin-dist=.."
    // =========================================================================
    private static final class ThreeDPoint {

        final double x;
        final double y;
        final double z;

        ThreeDPoint(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        // 3D Euclidean distance: √( dx² + dy² + dz² )
        double distanceTo(ThreeDPoint other) {
            double dx = other.x - x;
            double dy = other.y - y;
            double dz = other.z - z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        @Override
        public String toString() {
            return String.format("{X=%.0f, Y=%.0f, Z=%.0f} | origin-dist=%.2f",
                    x, y, z, Math.sqrt(x * x + y * y + z * z));
        }
    }
}
