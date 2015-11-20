package com.dnex.algorithm;

import java.util.Random;

public class ShortestDistance {
	public static void main(String args[]) {
		final ThreeDPoint[] points = new ThreeDPoint[5];
		final Random random = new Random();
		for (int i = 0; i < points.length; ++i) {
			points[i] = new ThreeDPoint(random.nextInt(100),
					random.nextInt(100), random.nextInt(100));
			System.out.println(points[i].toString());
		}
		// store min
		double min = Double.POSITIVE_INFINITY;
		int first = -1;
		int last = -1;
		for (int i = 0; i < points.length; ++i) {
			for (int j = i + 1; j < points.length; ++j) {
				final double d = points[i].distanceto(points[j]);
				if (d < min) {
					min = d;
					first = i;
					last = j;
				}
			}
		}
		System.out.println("The minimum distance is between point " + first
				+ " and " + last + "(" + points[first] + " and " + points[last]
				+ "). This distance is " + min + ".");
		
		for (int i = 0; i < points.length; ++i) {
			for (int j = i + 1; j < points.length; ++j) {
				final double d = points[i].distanceto(points[j]);
				if (d < min) {
					ThreeDPoint tp = points[j];
					points[j] = points[i];
					points[i] = tp;

				}
			}
		}
		
		for (int i = 0; i < points.length; ++i) {
			System.out.println(points[i].toString());
		}
		
		
	}

	private static final class ThreeDPoint {

		final double x;
		final double y;
		final double z;

		public ThreeDPoint(final double x, final double y, final double z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		public double distanceto(final ThreeDPoint other) {
			final double dx = other.x - x;
			final double dy = other.y - y;
			final double dz = other.z - z;

			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}

		@Override
		public String toString() {
			return "{X=" + x + ",Y=" + y + ",Z=" + z + "}" + Math.sqrt(x*x+y*y+z*z);
		}
	}
}
