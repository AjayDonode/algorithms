package com.dnex.algorithm;

public class MinimumDIstance {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		int arr[] ={13, 5, 4, 2, 6, 3, 9, 4, 8, 3};
	    int n =arr.length;
	    int x = 5;
	    int y = 3;
	  
	    System.out.println("Minimum distance between "+x+" and "+y+" is\n"+
	              minDistance(arr, x, y, n));
	  //  return 0;
	}

	
	private static int minDistance(int[] input, int n1, int n2, int length)
		{
		    int pos1 = 0;
		    int pos2 = length;
		    int distance = length+1;
		    int newDistance;
		    pos1 = pos2 = distance = length;
		 
		    for (int i = 0; i < length; i++)
		    {
		        if (input[i] == n1)
		            pos1 = i;
		        else if (input[i] == n2)
		            pos2 = i;
		 
		        if (pos1 < length && pos2 < length)
		        {
		            newDistance = Math.abs(pos1 - pos2);
		            if (distance > newDistance)
		                distance = newDistance;
		        }
		    }
		 
		    return distance == length+1 ? -1 : distance;
		}
		 
		
}
