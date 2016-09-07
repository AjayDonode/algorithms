package com.dnex.algorithm.search;

public class BinarySearch {
	public static void main(String args[]) {

		int[] data = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
		System.out.println("Result " + binarySearch(5, data));

		System.out.println("Rec Result "+binarySearchRecursion(5, data, 0, data.length));
	}

	public static int binarySearch(int key, int[] data) {
		int size = data.length;
		int low = 0;
		int high = size - 1;

		while (low < high) {
			int middle = low +  (high-low) / 2;
			
			if (data[middle] == key) {
				return middle;
			}
			if (data[middle] < key) {
				low = middle + 1;
			}
			if (data[middle] > key) {
				high = middle - 1;
			}
		}
		return -1;
	}
	
	public static int binarySearchRecursion(int key, int[] data, int low, int high){
		if(low<high){
			int mid = low+(high-low)/2;
			
			if(key< data[mid]){ return binarySearchRecursion(key,data, low , mid);}
			else if (key> data[mid]) {return binarySearchRecursion(key,data, mid+1, high);}
			else {return mid;}
		}
		return -1;
	}
}