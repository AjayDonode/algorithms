package com.dnex.random;

import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

public class TestGenerics {

	/**
	 * @author adonode
	 * @question Design an API which will return input Arraylist either Vector or Arraylist
	 *           API should support both formats [ANS : He is expecting implementation of Generics and 
	 *            collection APIs]
	 * @param args
	 */
	public static void main(String[] args) {
		List<Employee> employees = new ArrayList<Employee>();
		
		convertType(employees , false);
		
	}

	private static List<Employee>  convertType(List<Employee>  employees, boolean isVector) {
		List convertedResult = null;
		if(isVector){
			convertedResult  = new Vector(employees);
			System.out.println("In Vector Format"+convertedResult.getClass());
		} else {
			convertedResult = employees;
			System.out.println("In ArrayList Format"+convertedResult.getClass());
		}
		return convertedResult;
	}

}
