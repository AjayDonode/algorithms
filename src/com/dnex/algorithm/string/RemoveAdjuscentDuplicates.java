package com.dnex.algorithm.string;

/**
 * Removes adjacent duplicate characters from a string.
 * e.g. "aabbcdde" → "abcde"
 *
 * <p><b>Current approach – Recursion:</b><br>
 * {@code filterString} carries the last seen character through recursive calls.
 * At each frame it slices off the first character with {@code substring(0,1)} and
 * recurses on the remainder, then concatenates results via a new {@code StringBuffer}.
 *
 * <p><b>Complexity (current):</b>
 * <ul>
 *   <li>Time  : O(n²) — {@code substring()} copies characters at every level, so
 *       total work is n + (n-1) + ... + 1 = O(n²).</li>
 *   <li>Space : O(n) call-stack depth + O(n²) temporary {@code String} /
 *       {@code StringBuffer} allocations per frame.</li>
 * </ul>
 *
 * <p><b>Optimal approach – Single-pass iteration (O(n) time, O(n) space):</b><br>
 * Walk the string once with a {@code StringBuilder}.  Before appending each
 * character check whether it equals the last character already appended; if so,
 * skip it.  No recursion, no intermediate string copies.
 * <pre>
 *   StringBuilder sb = new StringBuilder();
 *   for (char c : s.toCharArray()) {
 *       if (sb.length() == 0 || sb.charAt(sb.length() - 1) != c)
 *           sb.append(c);
 *   }
 *   return sb.toString();
 * </pre>
 *
 * Created by Ajay Donode on 2/15/17.
 */
public class RemoveAdjuscentDuplicates {
    public static void main(String args[]){
        System.out.println("Hello");
        String inputString =  "aabbcdde";
        System.out.println("Output String "+ filterString(inputString, null));
    }

    private static String filterString(String inputString, String lastElement) {
        
        // Base case: empty or null string returns itself
        if(inputString == null || inputString.length() == 0 ) return inputString;
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