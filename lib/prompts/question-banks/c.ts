// lib/prompts/question-banks/c.ts

export const cBank = {
  language: "c",
  displayName: "C (C11 / C99)",
  topics: [
    "pointers & pointer arithmetic (void*, double pointers, function pointers, array vs pointer decay)",
    "manual memory management (malloc, calloc, realloc, free, memory leaks, use-after-free, valgrind)",
    "structs, unions, bitfields, padding, alignment (#pragma pack)",
    "undefined behavior (dangling pointers, out of bounds access, signed integer overflow, uninitialized reads)",
    "compilation pipeline (preprocessing, compilation, assembly, linking, header guards #ifndef)",
    "string manipulation & buffer security (strcpy vs strncpy, snprintf, null terminator pitfall)",
    "file I/O (fopen, fread, fwrite, fseek, errno)",
    "storage classes (static, extern, auto, register, volatile keyword)",
  ],
  codingChallenges: {
    junior: {
      title: "In-Place String Reversal & Character Counting",
      description: "Write a function `void reverse_string(char *str)` in C that reverses a null-terminated string in place without allocating auxiliary string buffers, and returns the character length.",
      starterCode: `#include <stdio.h>
#include <string.h>

void reverse_string(char *str) {
    if (!str) return;
    int len = 0;
    while (str[len] != '\\0') len++;
    
    int left = 0;
    int right = len - 1;
    while (left < right) {
        char tmp = str[left];
        str[left] = str[right];
        str[right] = tmp;
        left++;
        right--;
    }
}

int main() {
    char greeting[] = "Hello World!";
    printf("Original: %s\\n", greeting);
    reverse_string(greeting);
    printf("Reversed: %s\\n", greeting); // Expected: "!dlroW olleH"
    return 0;
}
`,
      testCriteria: [
        "Reverses in-place with O(1) space complexity",
        "Handles null pointers and empty strings safely",
        "Correct two-pointer swap logic",
      ],
    },
    mid: {
      title: "Dynamic Resizable Array (Vector) in C",
      description: "Implement a dynamic integer vector in C with struct `Vector`, supporting `vector_init`, `vector_push(Vector *v, int val)` (which doubles capacity when full using `realloc`), `vector_get`, and `vector_free`.",
      starterCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} Vector;

void vector_init(Vector *v, size_t initial_capacity) {
    v->size = 0;
    v->capacity = initial_capacity > 0 ? initial_capacity : 4;
    v->data = (int *)malloc(v->capacity * sizeof(int));
}

void vector_push(Vector *v, int value) {
    if (v->size >= v->capacity) {
        v->capacity *= 2;
        int *new_data = (int *)realloc(v->data, v->capacity * sizeof(int));
        if (!new_data) {
            fprintf(stderr, "Memory allocation error\\n");
            return;
        }
        v->data = new_data;
    }
    v->data[v->size++] = value;
}

void vector_free(Vector *v) {
    if (v->data) {
        free(v->data);
        v->data = NULL;
    }
    v->size = 0;
    v->capacity = 0;
}

int main() {
    Vector v;
    vector_init(&v, 2);
    for (int i = 1; i <= 5; i++) {
        vector_push(&v, i * 10);
    }
    printf("Vector size: %zu, capacity: %zu\\n", v.size, v.capacity);
    for (size_t i = 0; i < v.size; i++) {
        printf("v[%zu] = %d\\n", i, v.data[i]);
    }
    vector_free(&v);
    return 0;
}
`,
      testCriteria: [
        "Checks realloc return pointer to prevent memory leaks if realloc fails",
        "Proper capacity growth factor (doubling)",
        "Frees allocated memory cleanly without leaks",
      ],
    },
    senior: {
      title: "Singly-Linked List Cycle Detection & Safe Cleanup",
      description: "Implement Floyd's Tortoise and Hare algorithm in C to detect cycles in a linked list, return the cycle start node if one exists, and safely free all non-cyclic or cyclic node allocations.",
      starterCode: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct Node {
    int val;
    struct Node *next;
} Node;

bool has_cycle(Node *head) {
    Node *slow = head;
    Node *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

Node* create_node(int val) {
    Node *n = (Node *)malloc(sizeof(Node));
    n->val = val;
    n->next = NULL;
    return n;
}

int main() {
    Node *n1 = create_node(1);
    Node *n2 = create_node(2);
    Node *n3 = create_node(3);
    n1->next = n2;
    n2->next = n3;
    n3->next = n2; // Creates cycle: 1 -> 2 -> 3 -> 2...

    printf("Cycle detected: %s\\n", has_cycle(n1) ? "true" : "false");
    // Free non-cyclic test nodes
    return 0;
}
`,
      testCriteria: [
        "O(N) time and O(1) auxiliary space complexity",
        "Checks null head and single-node non-cycles correctly",
        "Correct pointer traversal and termination conditions",
      ],
    },
  },
};
