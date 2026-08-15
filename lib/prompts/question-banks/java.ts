// lib/prompts/question-banks/java.ts

export const javaBank = {
  language: "java",
  displayName: "Java (17+ / LTS)",
  topics: [
    "OOP pillars (Polymorphism, Inheritance, Encapsulation, Abstraction, composition vs inheritance)",
    "Java Collections Framework (HashMap bucket collision resolution, ConcurrentHashMap, ArrayList vs LinkedList, TreeMap)",
    "Exception handling (checked vs unchecked exceptions, try-with-resources, AutoCloseable)",
    "Garbage Collection & JVM memory model (Eden, Survivor, Tenured/Old gen, Metaspace, G1 vs ZGC)",
    "Interfaces vs Abstract classes (default & static methods in interfaces, functional interfaces)",
    "Multithreading & Concurrency (synchronized, volatile, ReentrantLock, ExecutorService, CompletableFuture, Virtual Threads)",
    "Generics & Type Erasure (bounded wildcards <? extends T> / <? super T>, PECS rule)",
    "Modern Java features (Records, Sealed classes, Pattern matching for switch, Stream API)",
  ],
  codingChallenges: {
    junior: {
      title: "First Unique Character in a String",
      description: "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
      starterCode: `import java.util.*;

public class Solution {
    public static int firstUniqChar(String s) {
        // Implement O(N) frequency counting
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqChar("leetcode")); // Output: 0 ('l')
        System.out.println(firstUniqChar("loveleetcode")); // Output: 2 ('v')
        System.out.println(firstUniqChar("aabb")); // Output: -1
    }
}
`,
      testCriteria: [
        "Time complexity O(N), Space complexity O(1) or O(Alphabet)",
        "Handles edge cases like single character, all repeating, empty string",
      ],
    },
    mid: {
      title: "Thread-Safe Custom Bounded Blocking Queue",
      description: "Implement a bounded blocking queue in Java with `put(item)` (blocks if queue is full) and `take()` (blocks if queue is empty) using intrinsic locks / wait and notifyAll, or ReentrantLock and Condition.",
      starterCode: `import java.util.LinkedList;
import java.util.Queue;

public class BoundedBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;

    public BoundedBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    public synchronized void put(T item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait();
        }
        queue.offer(item);
        notifyAll();
    }

    public synchronized T take() throws InterruptedException {
        while (queue.isEmpty()) {
            wait();
        }
        T item = queue.poll();
        notifyAll();
        return item;
    }

    public synchronized int size() {
        return queue.size();
    }

    public static void main(String[] args) throws InterruptedException {
        BoundedBlockingQueue<Integer> bbq = new BoundedBlockingQueue<>(2);
        bbq.put(10);
        bbq.put(20);
        System.out.println("Item taken: " + bbq.take()); // 10
        bbq.put(30);
        System.out.println("Item taken: " + bbq.take()); // 20
        System.out.println("Item taken: " + bbq.take()); // 30
    }
}
`,
      testCriteria: [
        "Prevents spurious wakeups using while loop instead of if check",
        "Uses notifyAll() properly to avoid missed signals between producers and consumers",
        "Proper thread synchronization and safety",
      ],
    },
    senior: {
      title: "Stream API Custom Collector / Word Frequency Top-K",
      description: "Write a high-performance function using Java Streams to take a list of sentences, parse words, filter stop words, and return the top K most frequent words sorted by frequency descending and alphabetically for ties.",
      starterCode: `import java.util.*;
import java.util.stream.Collectors;

public class TopKFrequentWords {
    public static List<String> topKFrequent(String[] words, int k) {
        // Implement using Map frequency counter and PriorityQueue or Stream sorting
        return Collections.emptyList();
    }

    public static void main(String[] args) {
        String[] words = {"i", "love", "leetcode", "i", "love", "coding"};
        System.out.println(topKFrequent(words, 2)); // Expected: ["i", "love"]
    }
}
`,
      testCriteria: [
        "Handles frequency sorting with alphabetical tie-breaking",
        "Uses PriorityQueue min-heap in O(N log K) or Stream groupingBy",
        "Clean, idiomatic modern Java syntax",
      ],
    },
  },
};
