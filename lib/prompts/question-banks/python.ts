// lib/prompts/question-banks/python.ts

export const pythonBank = {
  language: "python",
  displayName: "Python (3.10+)",
  topics: [
    "GIL (Global Interpreter Lock), threading vs multiprocessing vs asyncio",
    "lists vs tuples vs sets vs generators (memory footprint, lazy evaluation, time complexities)",
    "decorators & closures (functools.wraps, parameterized decorators, class decorators)",
    "context managers (with statement, __enter__ and __exit__, contextlib.contextmanager)",
    "mutable default arguments pitfall, parameter passing (pass-by-object-reference)",
    "*args and **kwargs unpacking, keyword-only arguments, structural pattern matching",
    "OOP & dunder methods (__init__, __str__, __repr__, __eq__, __hash__, __slots__, __getitem__)",
    "metaclasses, type hints, dataclasses, descriptors (__get__, __set__)",
  ],
  codingChallenges: {
    junior: {
      title: "Anagram Groups & Palindrome Checking",
      description: "Write a function `group_anagrams(words: list[str]) -> list[list[str]]` that groups strings that are anagrams of each other.",
      starterCode: `from typing import List
from collections import defaultdict

def group_anagrams(words: List[str]) -> List[List[str]]:
    """
    Groups words that are anagrams together.
    Time Complexity target: O(N * K log K) or O(N * K)
    """
    # Your implementation here
    return []

# Test cases
words = ["eat", "tea", "tan", "ate", "nat", "bat"]
result = group_anagrams(words)
print("Grouped anagrams:", result)
# Expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
`,
      testCriteria: [
        "Groups words correctly using sorted tuple or char count tuple as dictionary key",
        "Handles empty lists and single-letter words",
        "Optimal time complexity O(N * K)",
      ],
    },
    mid: {
      title: "Rate Limiter / Execution Timer Decorator with Metadata Preservation",
      description: "Create a Python decorator `@retry(max_attempts=3, delay_seconds=0.1, exceptions=(Exception,))` that automatically retries the decorated function on failure with exponential backoff, preserving function docstrings and annotations.",
      starterCode: `import time
import functools
from typing import Callable, Any, Tuple, Type

def retry(
    max_attempts: int = 3,
    delay_seconds: float = 0.1,
    backoff_factor: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    Decorator that retries a function upon catching specified exceptions.
    """
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Implement retry with exponential backoff
            pass
        return wrapper
    return decorator

# Test
attempts = 0
@retry(max_attempts=3, delay_seconds=0.05)
def unstable_api():
    global attempts
    attempts += 1
    if attempts < 3:
        raise ValueError("Temporary failure")
    return "Success on attempt " + str(attempts)

print(unstable_api())
`,
      testCriteria: [
        "Uses functools.wraps to preserve docstring and __name__",
        "Retries up to max_attempts before raising the final exception",
        "Applies delay and backoff correctly",
      ],
    },
    senior: {
      title: "Thread-Safe LRU Cache with Context Manager",
      description: "Implement a robust `LRUCache(capacity)` from scratch using a Doubly Linked List + Hash Map (or OrderedDict) with `get(key)` and `put(key, value)` operating in strict O(1) time complexity.",
      starterCode: `from typing import Any, Optional

class Node:
    def __init__(self, key: int, val: Any):
        self.key = key
        self.val = val
        self.prev: Optional['Node'] = None
        self.next: Optional['Node'] = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {} # key -> Node
        self.head = Node(0, 0) # Dummy head
        self.tail = Node(0, 0) # Dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> Any:
        # Return value if present and mark most recently used; return -1 if missing
        pass

    def put(self, key: int, value: Any) -> None:
        # Insert or update; if capacity exceeded, evict least recently used
        pass

# Test
lru = LRUCache(2)
lru.put(1, "one")
lru.put(2, "two")
print(lru.get(1)) # returns "one"
lru.put(3, "three") # evicts key 2
print(lru.get(2)) # returns -1 (not found)
`,
      testCriteria: [
        "get and put operate in strict O(1) time",
        "Evicts exact least recently used item on capacity overflow",
        "Correct pointer updates in doubly linked list",
      ],
    },
  },
};
