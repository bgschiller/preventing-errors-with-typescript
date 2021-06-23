---
marp: true
---

# Preventing Errors with TypeScript

> The types should work for you, not vice versa

Brian Schiller

---

## Prerequisites

* ~~Strong working knowledge of TypeScript~~
* Have _heard of_ TS
* Good working knowledge of JS, or similar language

---

## Goals for Today

* ~~Learn TypeScript entirely~~
* Specific patterns to use your TS
  - type annotations and when to use them
  - few things are just `string`s
  - exhaustiveness checking
  - bridge compile-time and runtime with type guards
* Learn to love red squigglies

---

## How to think about types

1) Types are sets.
  * Some are infinite, like `string`
  * Some are finite, like `boolean`
2) Use the smallest set that makes sense
  * see `sort-by-age.ts`
  * see `temperature.ts`

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

1. Use type annotations.
2. Not too much.
3. Mostly in function signatures.

see `is-prime.ts`

---

## Exhaustiveness Checking

Like a reminder for your future self: "Make sure you cover every case here"

see `temperature.ts`

---

## Type Guards

Convert a broader type to a narrower one.

see `type-guards.ts`

---

## Type Guards and User Input

Convert a totally unknown type to a convenient internal one

see `user-input.ts`

---

## Livecoding

see `translate.ts`

---

## Further Reading

- The TypeScript Handbook: typescriptlang.org/docs/handbook/intro.html
- TypeScript Deep Dive: basarat.gitbook.io/typescript/
- zod, for type-checking runtime input: github.com/colinhacks/zod

---

# Thanks!

github.com/bgschiller/preventing-errors-with-typescript
