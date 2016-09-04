package com.dnex.algorithm.sort;

import java.util.Arrays;

public class QuickSort {


	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		int[] unsorted = { 32, 39, 21, 45, 23, 3 };
		sort(unsorted);

		int[] test = { 5, 3, 2, 1 };
		sort(test);
 
	}

	private static void sort(int[] list) {
   		
		if(list==null || list.length==0) { return; } //Empty check
		quickSort(list, 0 , list.length-1);

	}

	private static void quickSort(int[] list, int first, int last) {
		
		int i = first , 
			j =last;
		int middleIndex = first + (last-first)/2 ; 
		int pivot = list[middleIndex];
		
		while(i <= j){
			while(list[i] < pivot) i++;
			while(list[j] > pivot) j--;
			
			if(i<=j) {
				swap(list, i, j);
				i++;
				j--;
			}
			
			
		}
		
		if(first<j)
		quickSort(list, first, j);
		if(last > i)
		quickSort(list, i, last);
		System.out.println("O/P"+Arrays.toString(list));
		
	}
	
	//In this partition we use Middle element as Pivot 
	//it could be any/random element
	private static int partition(int[] list, int first, int last) {
		int middleIndex = first + (last-first)/2 ; 
		
	int pivot = list[middleIndex];
		while(first<last) {
			if(list[first]==pivot || list[last] == pivot) {
				break;
			}
			while (list[first] < pivot) first++;
			while (list[last] > pivot) last--;
//			if(first<=last){
				swap(list,first,last);
//				first++; last --;
				
//			}
		}
		return first;
	}

	private static void swap(int[] list, int first, int last) {
		int temp = list[first];
		list[first] = list[last];
		list[last] = temp;
		
	}

	
	


}



