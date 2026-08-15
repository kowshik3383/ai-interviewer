// lib/prompts/question-banks/javascript.ts

export const javascriptBank = {
  language: "javascript",
  displayName: "JavaScript (ES6+ / TypeScript)",
  topics: [
    "closures & lexical scope (private variables, currying, memory retention)",
    "event loop, microtasks vs macrotasks, async/await, Promise lifecycle (all, race, allSettled, any)",
    "prototypal inheritance vs ES6 classes, __proto__ vs prototype, inheritance chains",
    "'this' binding rules (default, implicit, explicit with call/apply/bind, lexical arrow functions)",
    "hoisting, TDZ (Temporal Dead Zone), var vs let vs const",
    "advanced array & object methods (reduce, flatMap, Proxy, Reflect, Symbol, Map, WeakMap)",
    "generator functions & async iterables (yield, Symbol.asyncIterator, streams)",
    "event bubbling, capturing, delegation, custom events, AbortController",
  ],
  codingChallenges: {
    junior: {
      title: "Array Deduplication & Frequency Map",
      description: "Write a function `countFrequencies(items)` that takes an array of strings/numbers and returns an object mapping each unique item to its occurrence count. Also write `getUnique(items)` returning items in order of first appearance.",
      starterCode: `/**
 * @param {Array<string|number>} items
 * @returns {Record<string, number>}
 */
function countFrequencies(items) {
  // Your code here
  return {};
}

/**
 * @param {Array<string|number>} items
 * @returns {Array<string|number>}
 */
function getUnique(items) {
  // Your code here
  return [];
}

// Test cases
console.log(countFrequencies(['apple', 'banana', 'apple', 'orange', 'banana', 'apple']));
// Expected: { apple: 3, banana: 2, orange: 1 }

console.log(getUnique([1, 2, 2, 3, 4, 4, 5, 1]));
// Expected: [1, 2, 3, 4, 5]
`,
      testCriteria: [
        "Handles empty arrays and single-item arrays",
        "Uses reduce / Map or frequency hashing in O(N) time complexity",
        "Preserves original types without unnecessary string conversions",
      ],
    },
    mid: {
      title: "Custom Promise.all Implementation",
      description: "Implement `myPromiseAll(promises)` which takes an iterable of promises and returns a single Promise that resolves with an array of all resolved values in index order, or rejects immediately on the first rejection.",
      starterCode: `/**
 * Custom polyfill for Promise.all
 * @param {Array<any>} promises
 * @returns {Promise<Array<any>>}
 */
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Implement Promise.all logic
  });
}

// Test cases
const p1 = Promise.resolve(42);
const p2 = new Promise((res) => setTimeout(() => res('delayed'), 50));
const p3 = Promise.resolve(true);

myPromiseAll([p1, p2, p3]).then((results) => {
  console.log('Resolved results:', results); // Expected: [42, 'delayed', true]
});
`,
      testCriteria: [
        "Resolves values in original input index order regardless of fulfillment timing",
        "Handles non-promise values seamlessly via Promise.resolve()",
        "Handles empty iterable by resolving immediately with []",
        "Rejects on the first encountered error",
      ],
    },
    senior: {
      title: "Debounce with Immediate Execution & Cancelation",
      description: "Create an advanced `debounce(fn, waitMs, options)` utility supporting `{ immediate: boolean }`, `.cancel()`, and `.flush()` methods, preserving `this` context and arguments.",
      starterCode: `/**
 * @param {Function} fn
 * @param {number} wait
 * @param {{ immediate?: boolean }} [options]
 * @returns {Function & { cancel: () => void, flush: () => any }}
 */
function debounce(fn, wait, options = {}) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function debounced(...args) {
    // Implement debounce with immediate flag & context preservation
  }

  debounced.cancel = function() {
    // Implement cancel
  };

  debounced.flush = function() {
    // Implement flush
  };

  return debounced;
}

// Test usage
const log = debounce((msg) => console.log('Debounced:', msg), 100);
log('A');
log('B');
log('C'); // Only 'C' should execute after 100ms
`,
      testCriteria: [
        "Correct timer resets and context preservation (fn.apply(this, args))",
        "Handles immediate: true on leading edge vs trailing edge",
        "cancel() clears timer and pending state; flush() triggers immediately",
      ],
    },
  },
};
