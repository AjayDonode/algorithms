package com.dnex.algorithm;

import java.util.Random;

/**
 * ============================================================
 * PROBLEM: Shortest Distance Between Points in 3D Space
 * ============================================================
 *
 * WHAT THE PROBLEM ASKS:
 *   Given N points in 3-dimensional space (each with X, Y, Z
 *   coordinates), find the pair of points that are closest to
 *   each other — i.e., the pair with the minimum Euclidean distance.
 *
 *   Here N = 5, with coordinates randomly generated in [0, 99].
 *
 * ─────────────────────────────────────────────────────────────
 * CORE FORMULA — 3D Euclidean Distance
 * ─────────────────────────────────────────────────────────────
 *   Given two points P1(x1, y1, z1) and P2(x2, y2, z2):
 *
 *     distance = √( (x2-x1)² + (y2-y1)² + (z2-z1)² )
 *
 *   Example:
 *     P1 = (1, 2, 3)  P2 = (4, 6, 3)
 *     dx=3, dy=4, dz=0
 *     distance = √(9 + 16 + 0) = √25 = 5.0
 *
 * ─────────────────────────────────────────────────────────────
 * APPROACH — Brute-Force All Pairs  O(n²)
 * ─────────────────────────────────────────────────────────────
 *   Compare every unique pair (i, j) where j > i to avoid
 *   counting the same pair twice (e.g. skip (1,0) if (0,1) checked).
 *   Track the minimum distance seen so far and the indices of
 *   the two points that produced it.
 *
 *   Trace for 3 points — P0, P1, P2:
 *     i=0, j=1  d(P0,P1) = 12.5  → new min, first=0, last=1
 *     i=0, j=2  d(P0,P2) = 8.3   → new min, first=0, last=2
 *     i=1, j=2  d(P1,P2) = 20.1  → not smaller, skip
 *     Result: closest pair is P0 and P2 with distance 8.3
 *
 * ─────────────────────────────────────────────────────────────
 * SECOND LOOP — Bubble Sort by Distance (partial / ascending)
 * ─────────────────────────────────────────────────────────────
 *   After finding the minimum, the code does a second O(n²) pass
 *   that swaps points[i] and points[j] whenever their distance
 *   is less than the stored minimum.
 *   NOTE: 'min' is never updated in this loop, so the swap
 *   condition rarely triggers after the first pass has already
 *   found the true minimum.  This loop attempts a sort but does
 *   not fully order the array — it is a known limitation.
 *
 * ─────────────────────────────────────────────────────────────
 * COMPLEXITY SUMMARY
 * ─────────────────────────────────────────────────────────────
 *   Brute-force all pairs   Time O(n²)          Space O(1)
 *   Optimised (divide & conquer closest pair)
 *                           Time O(n log n)      Space O(n)
 * ============================================================
 */
public class ShortestDistance {

    public static void main(String[] args) {

        // ── Step 1: Generate 5 random 3D points ─────────────────────────────
        // Each coordinate is a random integer in [0, 99].
        // Print each point immediately so we can see the input set.
        final ThreeDPoint[] points = new ThreeDPoint[5];
        final Random random = new Random();
        for (int i = 0; i < points.length; ++i) {
            points[i] = new ThreeDPoint(
                    random.nextInt(100),
                    random.nextInt(100),
                    random.nextInt(100));
            System.out.println("PT "+i+ " - " + points[i].toString());
        }

        // ── Step 2: Brute-force find the closest pair ────────────────────────
        // Start min at +∞ so the very first distance always becomes the new min.
        // first / last track the indices of the closest pair found so far.
        double min = Double.POSITIVE_INFINITY;
        int first = -1;
        int last  = -1;

        for (int i = 0; i < points.length; ++i) {
            // j starts at i+1 to avoid comparing a point to itself
            // and to avoid checking the same pair twice (i,j) == (j,i).
            for (int j = i + 1; j < points.length; ++j) {
                final double d = points[i].distanceto(points[j]);
                if (d < min) {
                    min   = d;      // new minimum distance found
                    first = i;      // record index of the first point
                    last  = j;      // record index of the second point
                }
            }
        }

        // ── Step 3: Print the result ─────────────────────────────────────────
        System.out.println("The minimum distance is between point "
                + first + " and " + last
                + " (" + points[first] + " and " + points[last]
                + "). This distance is " + min + ".");

        // ── Step 4: Second pass — swap points closer than current min ────────
        // This attempts to bubble the closest points toward the front of the
        // array.  Note: 'min' is NOT updated here, so the swap only triggers
        // for pairs whose distance is strictly less than the overall minimum
        // (which means this loop typically does nothing after Step 2 has
        // already found the true minimum).
        for (int i = 0; i < points.length; ++i) {
            for (int j = i + 1; j < points.length; ++j) {
                final double d = points[i].distanceto(points[j]);
                if (d < min) {
                    // Swap points[i] and points[j] using a temporary variable
                    ThreeDPoint tp = points[j];
                    points[j]      = points[i];
                    points[i]      = tp;
                }
            }
        }

        // ── Step 5: Print the array after the swap pass ──────────────────────
        for (int i = 0; i < points.length; ++i) {
            System.out.println(points[i].toString());
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ThreeDPoint — immutable value type for a point in 3D space
    //
    // Holds (x, y, z) coordinates and provides:
    //   distanceto(other) — 3D Euclidean distance to another point
    //   toString()        — human-readable "{X=...,Y=...,Z=...}<origin-dist>"
    // ──────────────────────────────────────────────────────────────────────────
    private static final class ThreeDPoint {

        final double x; // X-axis coordinate
        final double y; // Y-axis coordinate
        final double z; // Z-axis coordinate

        /**
         * Constructs a point at the given (x, y, z) coordinates.
         */
        public ThreeDPoint(final double x, final double y, final double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        // ──────────────────────────────────────────────────────────────────────
        // distanceto — 3D Euclidean distance  O(1) time / O(1) space
        //
        // Formula: √( (ox-x)² + (oy-y)² + (oz-z)² )
        //   dx, dy, dz = signed differences on each axis
        //   squaring removes the sign, summing gives squared distance,
        //   Math.sqrt() converts back to actual distance.
        //
        // @param other  the target point to measure distance to
        // @return       Euclidean distance between this point and other
        // ──────────────────────────────────────────────────────────────────────
        public double distanceto(final ThreeDPoint other) {
            final double dx = other.x - x; // difference on X axis
            final double dy = other.y - y; // difference on Y axis
            final double dz = other.z - z; // difference on Z axis

            // Apply the 3D Pythagorean theorem: √(dx² + dy² + dz²)
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        // ──────────────────────────────────────────────────────────────────────
        // toString — human-readable representation
        //
        // Format: {X=<x>,Y=<y>,Z=<z>}<distance-from-origin>
        // The trailing value is this point's distance from the origin (0,0,0),
        // computed as √(x² + y² + z²).
        // ──────────────────────────────────────────────────────────────────────
        @Override
        public String toString() {
            return "{X=" + x + ",Y=" + y + ",Z=" + z + "} Sqrt: "
                    + Math.sqrt(x * x + y * y + z * z);
        }
    }
}
