package com.dnex.algorithm.util;

import java.util.ArrayList;
import java.util.List;

public class FizzBuzz {

	/**
	 * @param args
	 * This question is asked in GE and Service Now
	 * There are lot of ways to do this
	 * @author adonode
	 */
	public static void main(String[] args) {

        List<String> output = new ArrayList<>();
		for(int i = 1; i<=100; i++){
//            output.add(i+":");
            if (i % 3 == 0 && i % 5 == 0) {
                output.add("FizzBuzz");
            }
            else if(i%3 == 0) {
                output.add("fizz");
            }
            else if(i%5 == 0) {
                output.add("buzz");
            }
            else output.add(String.valueOf(i));

		}
        System.out.println(output);
		}
	}
