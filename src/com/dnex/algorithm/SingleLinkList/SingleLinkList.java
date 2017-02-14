package com.dnex.algorithm.SingleLinkList;

/**
 * Created by 502664102 on 2/13/17.
 */
public class SingleLinkList<T> {

    private Node<T> head;
    private Node<T> tail;

    public void add(T element) {
        Node<T> newNode = new Node<>();
        newNode.setValue(element);

        if (head == null) {
            head = newNode;
            tail = newNode;
        } else {
            tail.setNext(newNode);
            tail = newNode;
        }
    }

    public void addAfter(T element, T after){

        Node<T> tmp = head;
        Node<T> refNode = null;
        System.out.println("Traversing to all nodes..");
        /**
         * Traverse till given element
         */
        while(true){
            if(tmp == null){
                break;
            }
            if(tmp.compareTo(after) == 0){
                //found the target node, add after this node
                refNode = tmp;
                break;
            }
            tmp = tmp.getNext();
        }
        if(refNode != null){
            //add element after the target node
            Node<T> nd = new Node<T>();
            nd.setValue(element);
            nd.setNext(tmp.getNext());
            if(tmp == tail){
                tail = nd;
            }
            tmp.setNext(nd);

        } else {
            System.out.println("Unable to find the given element...");
        }
    }

    public void deleteFront(){

        if(head == null){
            System.out.println("Underflow...");
        }
        Node<T> tmp = head;
        head = tmp.getNext();
        if(head == null){
            tail = null;
        }
        System.out.println("Deleted: "+tmp.getValue());
    }

    public void deleteAfter(T after){

        Node<T> tmp = head;
        Node<T> refNode = null;
        System.out.println("Traversing to all nodes..");
        /**
         * Traverse till given element
         */
        while(true){
            if(tmp == null){
                break;
            }
            if(tmp.compareTo(after) == 0){
                //found the target node, add after this node
                refNode = tmp;
                break;
            }
            tmp = tmp.getNext();
        }
        if(refNode != null){
            tmp = refNode.getNext();
            refNode.setNext(tmp.getNext());
            if(refNode.getNext() == null){
                tail = refNode;
            }
            System.out.println("Deleted: "+tmp.getValue());
        } else {
            System.out.println("Unable to find the given element...");
        }
    }

    public void traverse(){

        Node<T> tmp = head;
        while(true){
            if(tmp == null){
                break;
            }
            System.out.println(tmp.getValue());
            tmp = tmp.getNext();
        }
    }

    public static void main(String a[]){
        SingleLinkList<Integer> sl = new SingleLinkList<Integer>();
        sl.add(3);
        sl.add(32);
        sl.add(54);
        sl.add(89);
        sl.addAfter(76, 54);
        sl.deleteFront();
        sl.deleteAfter(76);
        sl.traverse();

    }
}

class Node<T> implements Comparable<T>{
    private T value;
    private Node<T> next;

    public T getValue() {
        return value;
    }
    public void setValue(T value) {
        this.value = value;
    }
    public Node<T> getNext() {
        return next;
    }
    public void setNext(Node<T> ref) {
        this.next = ref;
    }
  @Override
    public int compareTo(T o){
      if( o == this.value)  return 0;
      else return 1;
  }
}

