package com.dnex.org.facebook;

/**
 * Created by 502664102 on 11/8/16.
 */
public class NumberCalculator {

    public static void main(String[] args) {
        NumberCalculator obj = new NumberCalculator();
        System.out.println("*** " + obj.convert(10));
        System.out.println("*** " + obj.convert(123456789));
        System.out.println("*** " + obj.convert(-55));
    }

    private String convert(int numberValue) {
        String english = "";
        String current = "";
        int place = 0;
        if (numberValue == 0) {
            return english + "Zero";
        } else if (numberValue < 0) {
            numberValue *= -1;
            english += "Minus";
        }

        do {
            int n = numberValue % 1000;
            if(n != 0) {
              String s = convertLessThanThousands(n);
               current =  s + NumberConstants.specialNames[place] + current;
            }
            place++;
            numberValue /= 1000;
        } while (numberValue>=0);



        return english + " " + current;
    }

    private String convertLessThanThousands(int number) {
        String current;

        if (number % 100 < 20){
            current = NumberConstants.numNames[number % 100];
            number /= 100;
        }
        else {
            current = NumberConstants.numNames[number % 10];
            number /= 10;

            current = NumberConstants.tensNames[number % 10] + current;
            number /= 10;
        }
        if (number == 0) return current;
        return NumberConstants.numNames[number] + " hundred" + current;
    }

    private String recursiveConvert(int numberValue, int power) {
        String returnVal = "";
        if(numberValue == 0) return "";
        if(numberValue / 100 == 0) returnVal += englishTens(numberValue % 100 );

        return returnVal;
    }

    private String englishTens(int numberValue) {

        return NumberConstants.tensNames[numberValue];
        //return ""+numberValue;
    }


}
