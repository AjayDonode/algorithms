package com.dnex.algorithm;

import java.util.HashMap;
/**
 * Refer following link to undestand more
 * http://www.programcreek.com/2014/05/leetcode-implement-trie-prefix-tree-java/
 * */
public class TirePrefixTree {

	
	public static void main(String args[]) {
		TrieNode root = createTree();
		insertWord(root,"Apple");
		insertWord(root,"Apricot");
		insertWord(root,"April");
		
	}

	private static TrieNode createTree() {
		TrieNode tNode = new TrieNode('\0');
		return tNode;
	}

	private static void insertWord(TrieNode root, String word) {
		int l = word.length();
		TrieNode currNode = root;
		
		for(int i = 0 ; i <l ; i++){
			char charkey = word.charAt(i);
			HashMap<Character,TrieNode> child = currNode.getChildren();
			System.out.println(child.containsKey(charkey)+" Word "+word.charAt(i));
			if(child.containsKey(charkey))
			{	
				currNode = child.get(charkey);
			} else {
				TrieNode tNode = new TrieNode(charkey);
				child.put(charkey, tNode);
				currNode = tNode;
			}
		//Validate it	child = currNode.getChildren();
		}
		currNode.setIsEnd(true);		
	}
}


class TrieNode
{
    private char value;
    private HashMap<Character, TrieNode> children;
    private boolean isLeaf;
    
    TrieNode(char letter)
    {
        this.value = letter;
        this.children = new HashMap<Character, TrieNode>();
        this.isLeaf = false;
    }
    
    
    public HashMap<Character,TrieNode> getChildren() {   return children;  }    
    public char getValue()                           {   return value;     }    
    public void setIsEnd(boolean val)                {   isLeaf = val;     }    
    public boolean isEnd()                           {   return isLeaf;    }

}
