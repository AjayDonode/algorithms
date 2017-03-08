package com.dnex.org;

public class ChristmasTree {

    public static void main(String [] args) {

        printTree(4);

        System.out.println();
        System.out.println();
        System.out.println();


    }

    public static void printTree(int day) {
        if (day  < 2) {
            System.out.println("You cannot generate christmas tree");
            return;
        }

        if (day > 20) {
            System.out.println("Tree is no more");
            return;
        }

        StringBuilder buf = new StringBuilder();

        // first level
        for (int i = 1, j = day; i <= day*2 + 1; i = i+2, j-- ) {
            // space
            for (int a = 0; a <= j; a++) {
                buf.append(' ');
            }

            // star
            for (int a = 0; a < i; a++) {
                buf.append('*');
            }

            buf.append('\n');
        }

        for (int b = 1; b < day-1; b++) {

            for (int i = 3, j = day-1; i <= day*2 + 1 - b*2; i = i+2, j-- ) {
                // space
                for (int a = 0; a <= j; a++) {
                    buf.append(' ');
                }

                // star
                for (int a = 0; a < i; a++) {
                    buf.append('*');
                }

                buf.append('\n');
            }

        }

        for (int j = 0; j < 2; j++) {
            for (int i = 0; i <= day; i++) {
                buf.append(' ');
            }
            buf.append('*').append('\n');
        }


        System.out.println(buf.toString());
    }

}