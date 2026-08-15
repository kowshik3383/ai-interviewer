// lib/prompts/question-banks/cpp.ts

export const cppBank = {
  language: "cpp",
  displayName: "C++ (C++17 / C++20)",
  topics: [
    "RAII (Resource Acquisition Is Initialization) pattern & smart pointers (unique_ptr, shared_ptr, weak_ptr)",
    "const-correctness, constexpr, consteval, mutable keyword",
    "virtual functions, vtable & vptr, virtual destructors, pure virtual interfaces",
    "move semantics & rvalue references (std::move, std::forward, perfect forwarding, Rule of 5 / Rule of 0)",
    "STL containers & algorithms (vector, unordered_map, set, std::sort, iterators, custom allocators)",
    "templates & metaprogramming (type traits, SFINAE, concepts & requires in C++20)",
    "memory alignment, cache friendliness, std::string_view, std::span",
    "multithreading (std::thread, std::mutex, std::atomic, std::lock_guard, std::jthread)",
  ],
  codingChallenges: {
    junior: {
      title: "Valid Parentheses Checker using std::stack",
      description: "Implement `bool isValid(const std::string& s)` in C++ that checks if bracket pairs '()', '[]', '{}' are closed in the correct order using the STL stack.",
      starterCode: `#include <iostream>
#include <stack>
#include <string>
#include <unordered_map>

bool isValid(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return st.empty();
}

int main() {
    std::cout << std::boolalpha;
    std::cout << "isValid(\"()[]{}\"): " << isValid("()[]{}") << " (Expected: true)\\n";
    std::cout << "isValid(\"(]\"): " << isValid("(]") << " (Expected: false)\\n";
    return 0;
}
`,
      testCriteria: [
        "Time complexity O(N), space complexity O(N)",
        "Handles edge cases: empty string, unbalanced openings, leading closures",
      ],
    },
    mid: {
      title: "Custom Smart Pointer (Simplified unique_ptr) with Move Semantics",
      description: "Implement a lightweight template class `UniquePtr<T>` adhering to RAII that owns a dynamically allocated object, prohibits copying, supports move construction and move assignment, and cleans up in the destructor.",
      starterCode: `#include <iostream>
#include <utility>

template <typename T>
class UniquePtr {
private:
    T* ptr;

public:
    explicit UniquePtr(T* p = nullptr) : ptr(p) {}

    ~UniquePtr() {
        delete ptr;
    }

    // Delete copy constructor & copy assignment
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    // Move constructor
    UniquePtr(UniquePtr&& other) noexcept : ptr(other.ptr) {
        other.ptr = nullptr;
    }

    // Move assignment operator
    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            delete ptr;
            ptr = other.ptr;
            other.ptr = nullptr;
        }
        return *this;
    }

    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
    T* get() const { return ptr; }
};

int main() {
    UniquePtr<int> u1(new int(42));
    std::cout << "Value: " << *u1 << std::endl;
    UniquePtr<int> u2 = std::move(u1);
    std::cout << "Moved Value: " << *u2 << std::endl;
    return 0;
}
`,
      testCriteria: [
        "Strictly deletes copy operations to prevent double-free",
        "Move constructor and move assignment null out the source pointer",
        "Destructor safely invokes delete",
      ],
    },
    senior: {
      title: "Lock-Free / Atomic SpinLock or Thread-Safe Queue in C++20",
      description: "Implement a lightweight SpinLock using `std::atomic_flag` and RAII `std::lock_guard` compatibility, or a thread-safe Producer-Consumer queue with `std::condition_variable`.",
      starterCode: `#include <iostream>
#include <atomic>
#include <thread>
#include <vector>

class SpinLock {
    std::atomic_flag flag = ATOMIC_FLAG_INIT;
public:
    void lock() {
        while (flag.test_and_set(std::memory_order_acquire)) {
            // Spin / yield
        }
    }

    void unlock() {
        flag.clear(std::memory_order_release);
    }
};

int counter = 0;
SpinLock lock;

void worker() {
    for (int i = 0; i < 10000; ++i) {
        lock.lock();
        counter++;
        lock.unlock();
    }
}

int main() {
    std::thread t1(worker);
    std::thread t2(worker);
    t1.join();
    t2.join();
    std::cout << "Final counter: " << counter << " (Expected: 20000)\\n";
    return 0;
}
`,
      testCriteria: [
        "Correct memory order semantics (acquire / release)",
        "Thread synchronization without race conditions",
      ],
    },
  },
};
