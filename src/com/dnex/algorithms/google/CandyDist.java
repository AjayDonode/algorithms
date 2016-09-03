package com.dnex.algorithms.google;

/*
 * There are N children standing in a line. Each child is assigned a rating value. 
 * You are giving candies to these children subjected to the following requirements:

1. Each child must have at least one candy.
2. Children with a higher rating get more candies than their neighbors.

What is the minimum candies you must give?
Analysis
This problem can be solved in O(n) time.

We can always assign a neighbor with 1 more if the neighbor has higher a rating value. 
However, to get the minimum total number, we should always start adding 1s in the ascending order. 
We can solve this problem by scanning the array from both sides. First, 
scan the array from left to right, and assign values for all the ascending pairs. 
Then scan from right to left and assign values to descending pairs.
 */

public class CandyDist {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		int[] ratings = {1,3,2,4,5,3,2,6,3,2,1};
		//ans {1,2,1,2,2,1,1,2,1,1,1}
		
		CandyDist dist = new CandyDist();
		System.out.println("Candy Dist: "+ dist.distributeCandy(ratings));

	}

	private int[] distributeCandy(int[] ratings) {
		int[] candies = new int[ratings.length];
		if(ratings==null || ratings.length==0){
			return candies;
		}
		candies[0]=1;
		for(int i=1;i<ratings.length;i++)
		{
			int dist = 1;
			if(ratings[i]>ratings[i-1])
			{	dist++;
				
			}
			candies[i] = dist;
			System.out.println( candies[i] );
			
		}
		System.out.println(""+candies);
		return candies;
		
	}

}
