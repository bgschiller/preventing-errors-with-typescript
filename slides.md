---
marp: true
---

# Preventing Errors with TypeScript

> The types should work for you, not vice versa

Brian Schiller

---

## Prerequisites

* ~Strong working knowledge of TypeScript~
* Have _heard of_ TS
* Good working knowledge of JS, or similar language

---

## Goals for Today

* ~Learn TypeScript entirely~
* Specific patterns to use your TS
  - type annotations and when to use them
  - exhaustiveness checking
  - few things are just `string`s
  - bridge compile-time and runtime with type guards
* Learn to love red squigglies

---

## Type Annotations

```js
let isDone = false;
let lines = 42;
let name = "Anders";
```

---

## Type Annotations

```ts
let isDone: boolean = false;
let lines: number = 42;
let name: string = "Anders";
```

---

## Type Annotations

```ts
let isDone = false;
let lines = 42;
let name = "Anders";
```

---

```ts
function isPrime(candidate: number): boolean {
  if (candidate % 2 === 0) return false;
  let divisor = 3;
  const largestPossibleDivisor = Math.sqrt(candidate);
  while (divisor < largestPossibleDivisor) {
    if (candidate % divisor === 0) return false;
    divisor += 2;
  }
  return true;
}
```

---

```ts
function isPrime(candidate: number): boolean {
  if (candidate % 2 === 0) return false;
  let divisor: number = 3;
  const largestPossibleDivisor: number = Math.sqrt(candidate);
  while (divisor < largestPossibleDivisor) {
    if (candidate % divisor === 0) return false;
    divisor += 2;
  }
  return true;
}
```

---

## Type Annotations

1. Use type annotations.
2. Not too much.
3. Mostly in function signatures.
