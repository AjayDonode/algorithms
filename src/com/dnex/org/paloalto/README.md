# Palo Alto Networks — Interview Prep

> **Target Role:** Solutions Engineering / Architecture (Cortex)
> Palo Alto Networks leans heavily toward **practical data structures** and
> **system-design-adjacent** coding problems rather than obscure math puzzles.
> The focus is on managing memory, state, and data streams efficiently.

---

## 📁 Problems in This Package

| File | Topic | LeetCode | Difficulty |
|------|-------|----------|------------|
| `BasicHashMap.java` | Design HashMap (Separate Chaining) | [#706](https://leetcode.com/problems/design-hashmap/) | 🟢 Easy |
| `SubarraySumEqualsK.java` | Subarray Sum Equals K | [#560](https://leetcode.com/problems/subarray-sum-equals-k/) | 🟡 Medium |
| `FractionToRecurringDecimal.java` | Fraction to Recurring Decimal | [#166](https://leetcode.com/problems/fraction-to-recurring-decimal/) | 🟡 Medium |
| `SumRootOfLeaf.java` | Sum Root to Leaf Numbers | [#129](https://leetcode.com/problems/sum-root-to-leaf-numbers/) | 🟡 Medium |
| `TopKFrequentElements.java` | Top K Frequent Elements | [#347](https://leetcode.com/problems/top-k-frequent-elements/) | 🟡 Medium |
| `ReverseInteger.java` | Reverse Integer | [#7](https://leetcode.com/problems/reverse-integer/) | 🟡 Medium |

---

## 1. What to Expect in the Interview

### 🗂️ Core Data Structures & Algorithms *(LeetCode Easy → Medium)*

#### Hash Maps & Dictionaries
- Implement a Hash Table **from scratch** without built-in libraries
- Use maps to solve **frequency** and **counting** problems
- LRU Cache — among the **most frequently reported** Palo Alto questions;
  tests your ability to combine a doubly-linked list + hash map for O(1) retrieval and eviction

#### Arrays, Strings & Sliding Windows
- Longest common prefix, sliding window maximums
- Parsing and manipulating strings
  *(directly applicable to parsing security logs)*

#### Trees & Graphs
- Validate a Binary Search Tree (BST)
- Find the Lowest Common Ancestor
- Graph traversal — e.g., Pacific and Atlantic Water Flow

---

### 🏗️ Applied "Machine Coding" *(Especially for Solutions/Architecture roles)*

Since you are targeting Solutions Engineering and Architecture, the coding round
may shift from "solve this LeetCode problem" to "build this mini-system."

| Theme | What to Expect |
|-------|---------------|
| **API & Data Parsing** | Given a large JSON payload (simulating endpoint telemetry), extract, transform, and aggregate specific threat indicators |
| **Concurrency & Threading** | Code that handles multiple simultaneous requests or processes data streams in parallel |

---

## 2. Practice Roadmap

### Step 1 — Choose Your Language and Stick to It
Do not context-switch between languages during prep.
- **Python** → fastest for data parsers and API integrations
- **Java** → preferred for strict typing and architectural patterns (e.g., LRU Cache)

---

### Step 2 — The "Think Out Loud" Drill
A common reason senior engineers fail these rounds is silently jumping into code.
Palo Alto interviewers explicitly look for **how you communicate trade-offs**.

> **Practice technique:** Spend the first **3–5 minutes** outlining your approach,
> writing pseudocode, and explicitly stating Time and Space Complexity (Big O)
> *before* you write a single line of real code. Talk to your monitor while you practice.

---

### Step 3 — Curated Problem Grinding

Don't grind randomly. Focus on these specific categories:

| Category | Key Problems |
|----------|-------------|
| **Design** | LRU Cache, LFU Cache, Design a Rate Limiter, Implement Trie (Prefix Tree) |
| **String / Log Parsing** | Group Anagrams, Longest Substring Without Repeating Characters, Regular Expression Matching |
| **Graph / Tree Traversals** | Number of Islands, Validate BST, Course Schedule (cycle detection) |

---

### Step 4 — The "Scale" Follow-Up
For Cortex architecture roles, the moment your code compiles the interviewer
will likely pivot to system design.

> **Practice technique:** After you solve a coding problem, ask yourself:
> *"How would this code break if I fed it 10 GB of data per second?"*
> Be prepared to discuss refactoring a single-threaded script into a distributed
> cloud architecture using message queues (**Kafka**, **SQS**) and scalable databases.

---

## 💡 Your Edge

Your background in automated algorithmic trading maps directly to this domain.
The logic required to manage data structures for high-frequency trading is
very similar to the logic required to **parse and automate threat responses** in Cortex.

---

## 🔮 Suggested Next Problem

> **Design an LRU Cache** — one of the most frequently asked Palo Alto problems.
> Combines a **doubly-linked list** (O(1) eviction) + **HashMap** (O(1) lookup).
> Target: solve it in under 25 minutes with full Big O analysis.