package com.dnex.algorithm.search;

//Linear search to find element using simple for loop
// work on any random array
public class LinearSearch {

	public static void main(String args[]){
		int[] arr1 = {23,45,21,55,234,1,34,90};
		int searchKey = 55;
		System.out.println("Key "+searchKey+ " found at index: "+linearSearch(arr1,searchKey));
	}

	private static int linearSearch(int[] arr1,int searchKey) {
		for(int i=0 ; i<arr1.length; i++){
			if(arr1[i]==searchKey) return i;
		}
		return -1;//if not found
	}
}
