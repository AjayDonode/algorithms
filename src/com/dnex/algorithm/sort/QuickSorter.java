package com.dnex.algorithm.sort;

import java.util.Arrays;

public class QuickSorter {

	public static int partition(int[] list, int low, int high) {
		int pivot = list[low];
		while (low < high) {
			if (list[high] >= pivot) {
				high--;
			}
			list[low] = list[high];
			
			if (list[low] <= pivot) {
				low++;
			}
		
			list[high] = list[low];
		}

		list[low] = pivot;
		return low;

	}

	public static void quicksort(int[] list, int low, int high) {
		if (low < high) {
			int mid = partition(list, low, high);
			quicksort(list, low, mid - 1);
			quicksort(list, mid + 1, high);
		}
	}

	// Usage: java QuickSort [integer] ...
	// All integers must be distinct
	public static void main(String argv[]) {
		// int A[] = new int[argv.length];
		// for (int i=0 ; i < argv.length ; i++)
		int A[] = { 32, 39, 21, 45, 23, 3 };

		int B[] = { 1, 4, 2, 5, 3, 8 };

		quicksort(A, 0, A.length - 1);
		quicksort(B, 0, B.length - 1);

		System.out.println(Arrays.toString(A));
		System.out.println(Arrays.toString(B));
	}
}