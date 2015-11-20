package com.dnex.threads;

public class RunnableImpl {

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		RunnableTest R1 = new RunnableTest("Thread-1");
		R1.start();
		
		RunnableTest R2 = new RunnableTest("Thread-2");
		R2.start();

	}

}

class RunnableTest implements Runnable {
	private Thread t;
	private String threadName;

	public RunnableTest(String threadName) {
		this.threadName = threadName;
		System.out.println("Created thread "+threadName);
	}

	public void start() {
		
		System.out.println("Starting " +  threadName );
	      if (t == null)
	      {
	         t = new Thread (this, threadName);
	         t.start ();
	      }
		
	}

	@Override
	public void run() {
		System.out.println("Running " +  t.getName() );
		try{
			for(int i=0; i<=4; i++){
				System.out.println("Thread: " + threadName + ", " + i);
	            // Let the thread sleep for a while.
				
				Thread.sleep(5000);
			}
		}catch (InterruptedException e){
			System.out.println("Error: " +  threadName + " interrupted.");
		}
		 System.out.println("Thread " +  threadName + " exiting.");
	}

}
