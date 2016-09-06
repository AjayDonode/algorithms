package com.dnex.algorithm;

//Reverse Singly Link List 
//Ref : http://www.codeproject.com/Articles/27742/How-To-Reverse-a-Linked-List-Different-Ways
public class SinglyLinkList {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		int[] input = {1, 2, 3, 4, 5};
		System.out.println("Input is "+input);
		SinglyLinkList list = new SinglyLinkList();
		String output = list.printReverse(input);
		System.out.println("\n Reverse "+ output);
	}
	
	
	public  String printReverse(int[] input) {
		Node head = null;
	    
//	    if (head != null) { // base case
//	        head = head.next;
//	        myString.append(head.data);   // line 406
//	        myString.append(", ");         // line 407
//	        printReverse();                // line 408
//	    }
//	    myString = myString.append("]");
	    return  null ; //myString.toString();
	}
	
	//Node Class to use
	public class Node{
		   public int data;
		   public Node next;
		   public Node(int data, Node next){
		      this.data = data;
		      this.next = next;
		   }
		}
}
