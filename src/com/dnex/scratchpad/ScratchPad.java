
package com.dnex.scratchpad;

import java.util.*;

public class ScratchPad {


    private static final int NODES    = 6;
    private static final String[] LABEL = {"A", "B", "C", "D", "E", "F"};

    public static void main(String[] args) {


            System.out.println("Welcome to Online Java!! Happy Coding :)");
            TireNode root = new TireNode('/');
            insertWord(root, "Apple");
            insertWord(root, "Apricot");
            insertWord(root, "April");

        }

        static void insertWord(TireNode root, String word){
            TireNode currNode = root;
            for(int i = 0; i< word.length(); i++ ) {
                Character c = word.charAt(i);
                HashMap<Character, TireNode> childNode = currNode.getChildren();
                if(childNode.containsKey(c)) {
                    currNode = childNode.get(c);
                }else {
                    TireNode tNode = new TireNode(c);
                    childNode.put(c, tNode);
                    currNode = tNode;
                }
            }
            currNode.setLeaf(true);
        }

    }


    class TireNode {
        private Character value;
        private HashMap<Character, TireNode> children;
        private boolean isLeaf;

        TireNode(Character value){
            this.value = value;
            this.children = new HashMap<>();
            this.isLeaf = false;
        }

        public Character getValue() {
            return value;
        }

        public void setValue(Character value) {
            this.value = value;
        }

        public HashMap<Character, TireNode> getChildren() {
            return children;
        }

        public void setChildren(HashMap<Character, TireNode> children) {
            this.children = children;
        }

        public boolean isLeaf() {
            return isLeaf;
        }

        public void setLeaf(boolean leaf) {
            isLeaf = leaf;
        }
    }

