package com.dnex.algorithm.string;

/**
 * Created by 502664102 on 2/15/17.
 */
public class RemoveAdjuscentDuplicates {
    public static void main(String args[]){

        System.out.println("Hello");
        String inputString =  "aabbcdde";
        System.out.println("Output String "+ filterString(inputString, null));
    }

    private static String filterString(String inputString, String lastElement) {
        if(inputString == null) return null ;
        if(inputString.length() ==1 ) return inputString;

            String firstElement = inputString.substring(0,1);
            String remainingString = inputString.substring(1, inputString.length());

            StringBuffer sb = new StringBuffer(); //First element
        if(!firstElement.equals(lastElement)) {
            sb.append(firstElement);
            lastElement = firstElement;

        }



        return sb.append(filterString(remainingString, lastElement)).toString();

    }
}
