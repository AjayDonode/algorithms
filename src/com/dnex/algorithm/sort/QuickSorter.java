package com.dnex.algorithm.sort;

import java.util.Arrays;

public class QuickSorter {

	public static int partition(int[] list, int low, int high) {
		int pivot = list[low];
		System.out.println("low "+low + " high "+high+ " Pivot "+low);
		while (low < high) {
			
			if (list[high] >= pivot) high--;
			list[low] = list[high];
			System.out.println(Arrays.toString(list));
			
			if (list[low] <= pivot) low++;
			list[high] = list[low];
			System.out.println(Arrays.toString(list));
		}

		list[low] = pivot;
		return low;

	}

	public static void quicksort(int[] list, int low, int high) {
		if (low < high) {
			int pivot = partition(list, low, high);
			quicksort(list, low, pivot - 1);
			quicksort(list, pivot + 1, high);
		}
	}

	// Usage: java QuickSort [integer] ...
	// All integers must be distinct
	public static void main(String argv[]) {
		int A[] = { 32, 39, 21, 45, 23, 3 };
		int B[] = { 1, 4, 2, 5, 3, 8 };

		quicksort(A, 0, A.length - 1);
		//quicksort(B, 0, B.length - 1);

		System.out.println(Arrays.toString(A));
		//System.out.println(Arrays.toString(B));
	}
}