package com.dnex.algorithm.sort;

import java.util.Arrays;

public class SelectionSort {

	  public static void main(String args[]) {
	        //testing our bubble sort method in Java
	        int[] unsorted = {32, 39,21, 45, 23, 3};
	        selectionSort(unsorted);
	      
	        //one more testing of our bubble sort code logic in Java
	        int[] test = { 5, 3, 2, 1};
	        selectionSort(test);
	        
	       // System.out.println("Insertion Sort "+Arrays.toString(insertionSort(test)));
	      
	    }   
	  
	    /*
	     * In bubble sort we need n-1 iteration to sort n elements
	     * at end of first iteration larget number is sorted and subsequently numbers smaller
	     * than that.
	     */
	    public static void selectionSort(int[] unsorted){
	        System.out.println("unsorted array before sorting : " + Arrays.toString(unsorted));
	
	        // Outer loop - need n-1 iteration to sort n elements
	        for(int i=0; i<unsorted.length-1; i++){
	           int min = i;
	            //Inner loop to perform comparision and swapping between adjacent numbers
	            //After each iteration one index from last is sorted
	            for(int j=i+1; j<unsorted.length; j++){
	              
	                //If minimum number is greater than swap those two
	            	System.out.println(unsorted[min]+" < "+unsorted[j]);
	                if(unsorted[j] < unsorted[min]){
	                   min = j;
	                }
	                System.out.println("Swapping "+min +":"+i);
	                swap(unsorted,min,i);
	                
	            }
	            System.out.printf("unsorted array after %d pass %s: %n", i+1, Arrays.toString(unsorted));
	        }
	    }
	    
	    private static void swap(int[] unsorted, int i, int j) {
	    	int temp = unsorted[j];
	        unsorted[j] = unsorted[i];
	        unsorted[i] = temp;
			
		}
}
