#Description

##Searching 
  *Linear Search  
  *Binary Search   
  

##Sorting 
  * Selection Sort  
  * Insertion Sort  
    `public static int[] selectionSort(int[] list) {  
        for (int i = 0; i < list.length - 1; i++) {  
            // Find the index of the minimum value  
            int minPos = i;  
            for (int j = i + 1; j < list.length; j++) {  
                if (list[j] < list[minPos]) {  
                    minPos = j;  
                }  
            }  
            swap(list, minPos, i);  
        }
        return list;  
    }`  
  * Bubble Sort
  * Quick Sort
  * Merge Sort
  
  ![alt tag](https://s-media-cache-ak0.pinimg.com/originals/80/9c/26/809c2690dbab49cf87536d588d2a9923.gif)
  
