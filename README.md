Preventing Errors with TypeScript
=================================

Many guides will teach you how to add type annotations to your code. In this presentation, we'll start with a codebase that typechecks perfectly without error. From there, we'll discover all the problems typescript _could_ have found for us, if we'd been able to help it a bit.

## String literal unions

Run the translate file using ts-node:

```bash
npx ts-node translate.ts
```

Notice that it typechecks without error, but crashes at runtime. What gives??

Take a look at the `translate` function. It accepts two string parameters, but there's really only a couple of possible values for the `toLang` one. Define a new type to be the allowable values for that parameter.

```typescript
type SupportedLang = 'en' | 'es';
```

Update the signature of translate to make use of this new type, and you should get a typescript warning pointing the way to why the code is crashing. Nice!

## Exhaustiveness checking

Suppose we add another language, german. Uncomment the `toGerman` function definition and add `'de'` to the `SupportedLang` definition. Don't fix `translate` yet though.

If we try to invoke `translate('de', 'watermelon')`, it will fail at runtime because there's no case for `if (toLang === 'de')` in the translate function. Can we convince typescript to warn us for errors like this?

TypeScript has a type called `never` where no values are allowed to be assigned to it. We can take advantage of `never` to add "exhaustiveness checking", ensuring at compile-time that we're covering every `SupportedLang` case.

Add the following definition to utils.ts

```typescript
function assertUnreachable(x: never): never {
  throw new Error(`Expected to never reach this case: ${x}`);
}
```

Add a line to the bottom of the translate function:

```diff
   if (toLang === 'es') return toSpanish(word);
+  assertUnreachable(toLang);
 }
```

This should give us a warning, indicating that the line _is_ reachable, despite our claim otherwise.

> (parameter) toLang: "de"
> Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)

Add the fix, and the error should go away. Play with adding another case to `SupportedLang`, and seeing if the error reappears. Remove a handled case from `SupportedLang` and you should get a new, also helpful error.

In this example, you might have been able to predict where the error was before the types helped to point it out. The Exhautiveness Checking pattern is most valuable when the possible options (`SupportedLang` in this case) are defined farther away from where they're being used.

## Tagged types

Here's a strange bit of code. What do you think it will do?

```typescript
console.log(toEnglish(toEnglish('pollo')));
```

We could make an argument for it being nonsense: "I can't convert english to english!". Or a no-op: "done". Regardless, neither of those is the current behavior which is to output "(chicken in english)".

The problem is that we're throwing strings around like all strings are the same. When clearly, some strings represent English and some Spanish. Let's define a new structure instead, and update our functions to operate on more specific interfaces:

```typescript
interface Word {
  lang: SupportedLang;
  data: string;
}
// update these functions to look like
// (and fill out the bodies)
function toEnglish(w: Word): Word;
function toSpanish(w: Word): Word;
function toGerman(w: Word): Word;
```

Code ends up kinda gross, but at least we're getting a type error now:

```
Argument of type 'English' is not assignable to parameter of type 'Spanish'.
  Types of property 'lang' are incompatible.
    Type '"en"' is not assignable to type '"es"'.
```

The heart of the issue is that `toEnglish` only translates from Spanish and not from German, `toGerman` only from English and not Spanish, `toSpanish` only from English and not German. Let's enable those functions to accept a word from any language. First, we'll need a type for it.

```typescript
type Word = English | Spanish | German;

function toEnglish(w: Word): English {
 if (w.lang === 'en') return w;
 const word = translations.find(t => t[w.lang] === w.data);
 if (!word) return { lang: 'en', data: `(${w.data} in english)` };
 return { data: word.en, lang: 'en' };
}

// and make the similar transformation for each of toSpanish, toGerman.
```

Does this feel strangely repetitive to anyone else? These functions are all the same! For that matter, the `English`, `Spanish`, and `German` interfaces are all the same too... 🤔 It seems like we should be able to write
- an interface that captured "A word in some supported language" without the repetition, and
- a function that translates from "a word in some language" to "a word in a specific language".

Let's warm up by defining that interface. We said it was going to be "a word in some supported language." How about

```diff
-interface English {
-  lang: 'en';
-  data: string;
-}
-interface Spanish {
-  lang: 'es';
-  data: string;
-}
-interface German {
-  lang: 'de';
-  data: string;
-}
-type Word = English | Spanish | German;

+interface Word {
+  lang: SupportedLang;
+  data: string;
+}
```

That certainly _looks_ okay, but we've actually lost something compared to our old definition of `type Word = English | Spanish | German`. We've lost the ability to specify that `toEnglish` _always_ has a `lang` of `'en'`. Back when that was encoded in the type system, we could have written functions that only accepted `English` or only `Spanish` and had that requirement enforced by the type system. Can we avoid the repetition and still keep track that information in the type system?

In fact we can! But it requires a new tool—Generic types. We'll come back to this if we have time, but in the meantime, let's put the code back how it was before.

```diff
+interface English {
+  lang: 'en';
+  data: string;
+}
+interface Spanish {
+  lang: 'es';
+  data: string;
+}
+interface German {
+  lang: 'de';
+  data: string;
+}
+type Word = English | Spanish | German;

-interface Word {
-  lang: SupportedLang;
-  data: string;
-}
```

## Refactoring: `translate` function

Our `to*` functions are now very capable. They accept any supported language and produce words of the desired language. But `translate` hasn't kept pace and is still making assumptions about the language of the incoming words. Update it to include a `fromLang` parameter.

While we're at it, I'm never going to remember the order. Is it `fromLang` then `toLang`? The opposite? Use keyword parameters instead.

```ts
interface TranslateParams {
  to: SupportedLang;
  from: SupportedLang;
  word: string;
}
function translate({ to, from, word }: TranslateParams): string {
  // ...
```

### Type Declarations

Navigate over to the console.ts file. Let's make sure it's working before we make changes.

```bash
$ npx ts-node console-starting-point.ts
translate to: en
message: manzana manzana naranja
Promise { <pending> }
```

Uh oh. `Promise { <pending> }` doesn't look like English to me! We're treating `result` as if it's a value, but it's just a _Promise_ for a value. This is a case where a type declaration can help us.

```diff
-const result = translateAPI({
+const result: string[] = translateAPI({
```

> Type `Promise<string[]>` is missing the following properties from type `string[]`: length, pop, push, concat, and 28 more.

TypeScript rarely needs explicit type annotations, aside from function parameters and return types. It can usually figure out from context what the type will be. However, the code we wrote doesn't always match our expectations. Adding a type declaration is a way of telling TypeScript "I believe this to be the case, but please check me."


We can fix this by `await`ing the promise. Another way to catch this error would be if we used result in a way that wouldn't be allowed for a Promise. `console.log` is willing to accept any type, even promises. But we'd have caught the error by doing something like

```ts
console.log(result.join(' '));
```

> Property 'join' does not exist on type `Promise<string[]>`.

## Accepting input

It's great to have type-safety within our program, but any useful program will eventually need to communicate with the outside world. How can we ensure that data from "outside" matches the shape described by our types?

If you change the import for the translate api to point at our updated file, you should see a new error

```diff
-import translateAPI from './translate-starting-point';
+import translateAPI from './translate';
```

> Type `string` is not assignable to type `SupportedLang`.

We're passing `endLang` in a position where `translateAPI` wants to be given a `SupportedLang`. But `endLang` came from `question()`, which returns a (Promise of a) `string`. Maybe we can cross our fingers and hope? Let's use a type assertion. Add `fromLang` as well.

```diff
 async function main() {
+  const startLang = await question("translate from: ");
   const endLang = await question("translate to: ");
   const message = await question("message: ");
   const result = translateAPI({
+    fromLang: startLang as SupportedLang,
+    toLang: endLang as SupportedLang,
-    toLang: endLang,
     words: message.split(/\s+/),
   });
```

Let's try it out!

```bash
npx ts-node console.ts
translate from: en
translate to: de
message: naranja naranja manzana
orange orange apple
```

It works! But what if we misbehave?

```bash
npx ts-node console.ts
translate from: pig latin
translate to: gibberish
message: is-ay is-thay ight-ray

/Users/brian/code/preventing-errors-with-typescript/utils.ts:6
  throw new Error(`Expected to never reach this case: ${x}`);
        ^
Error: Expected to never reach this case: gibberish
```

That's unfortunate. In TypeScript's defense, by writing `startLang as SupportedLang` we were saying "I pinky-swear that `startLang` can be safely treated as a `SupportedLang`, and I'm willing to accept the consequences if that turns out to be false". It did turn out to be false.

We need to somehow link the compile-time notion of a `SupportedLang` with a check we can perform at runtime. Luckily, TypeScript has this ability, in a feature called Type Guards.

## Type Guards

Type guards are useful when you want to go from a broad type to a more narrow type. We've actually already been using some built-in type guards without knowing about it!

```ts
interface German {
  lang: 'de';
  data: string;
}
type Word = English | Spanish | German;

function toGerman(w: Word): German {
  if (w.lang === 'de') return w;
  // if (w.lang === 'de') acts as a type guard.
  // within that
```
`w` is any `Word`—English, Spanish, or German. But we're committed to returning only German words. `if (w.lang === 'de')` acts as a type guard. Any `w`s that pass the test, TypeScript can be sure are not just any `Word`, but are really `German` ones.

Instead of a type assertion, let's try using an if-statement like that.

```ts
  if (
    (startLang === 'en' || startLang === 'es' || startLang === 'de') &&
    (endLang === 'en' || endLang === 'es' || endLang === 'de')
  ) {
```

So that works. But... gross, right? It's a lot of repetition and the knowledge of which languages are supported is spread across two files. Can we do better?

In addition to the built-in type guards, TypeScript lets us define our own by writing a function. Let's go back to translate.ts and add one.

```ts
function isSupportedLang(lang: string): lang is SupportedLang {
  return lang === 'en' || lang === 'es' || lang === 'de';
}
```

Like type assertions, this is another place where it's totally possible to lie to the compiler. No one is checking (except during code review). Be careful when writing these by hand.

Libraries can also help you bridge the gap between compile-time checks and runtime reality. I recommend `zod`, but `Runtypes` and `io-ts` are also good.

## Generic types

We said we'd come back if we had time. If you're reading this, we must have time!

```typescript
interface Word<T extends SupportedLang = SupportedLang> {
  lang: T;
  data: string;
}
```

This lets us say "`toEnglish` turns a word in any language into a word in English":

```typescript
function toEnglish(w: Word): Word<'en'>;
```

After fixing up the rest of the function, we end up with

```typescript
function toEnglish(w: Word): Word<'en'> {
  if (w.lang === 'en') return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { lang: 'en', data: `(${w.data} in english)` };
  return { data: word.en, lang: 'en' };
}
```

Unfortunately, there's still one error sticking around that doesn't seem easy to get rid of.

```
Type 'Word<SupportedLang>' is not assignable to type 'Word<"en">'.
  Type 'SupportedLang' is not assignable to type '"en"'.
    Type '"es"' is not assignable to type '"en"'.ts(2322)
```

Let's unpack that error a bit, because it's useful to know how to interpret the errors Typescript gives us. We'll start with the first line.

> Type 'Word<SupportedLang>' is not assignable to type 'Word<"en">'.

The first line is saying that
- `w` is typed as a `Word<SupportedLang>`.
- By returning it, we're saying it should count as a `Word<'en'>` ("is assignable to")
- But `Word<SupportedLang>` is a "bigger" type than `Word<'en'>`. It contains values that aren't allowed in `Word<'en'>`.

The following lines are typescript offering a justification for it's claim on the first line.

> Type 'SupportedLang' is not assignable to type '"en"'.

`SupportedLang` is a "bigger" type than `'en'`. Not difficult, the type `'en'` contains only the one value `'en'`.

> Type '"es"' is not assignable to type '"en"'.

Finally, we arrive at the root of the argument. Typescript is giving a specific example of a value allowable for `SupportedLang` but not for the `'en'` type.

But, that error seems a bit strange. In context of the code, we've _just_ checked that `w.lang` is `'en'`. Back when we had `type Word = English | Spanish | German`, it seemed to do okay. So why can't Typescript tell anymore?

We're running up against the boundaries of Typescript's type narrowing capabilities. New versions of Typescript often improve on these capabilities, but for now it can't tell what's going on without help. So, let's help it!

## Type guards

Typescript "compiles away" before runtime, so there's not generally a way to interrogate the type of a value. Instead, we define a regular javascript function `isEnglish`. Then we use a Typescript feature called "type predicates" to say "if this function returns true, the `w` is a `Word<'en'>`"

```typescript
function isEnglish(w: Word): w is Word<'en'> {
  return w.lang === 'en';
}
```

It's worth noting here that Typescript will not check if your type predicate makes sense. This is a place where you can totally lie and say "All words are English words! `return true`".

> If you lie to the compiler, it will get its revenge.

Defining type predicates for `isSpanish` and `isGerman` isn't difficult, but we didn't become programmers to do drudgery. Let's make a generic version. It's a bit complicated though, and you would be forgiven for taking several stabs at it and getting some help from a friend.

```typescript
function isLang<T extends SupportedLang>(w: Word, lang: T): w is Word<T> {
  return w.lang === lang;
}
```

Finally, we can get rid of that last stubborn error in `toEnglish`.

```diff
 function toEnglish(w: Word): Word<'en'> {
-  if (w.lang === 'en') return w;
+  if (isLang(w, 'en')) return w;
```
