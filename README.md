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

The problem is that we're throwing strings around like all strings are the same. When clearly, some strings represent english and some spanish. Let's define a new structure instead, and update our functions to operate one more specific interfaces:

```typescript
interface English {
  lang: 'en';
  data: string;
}
interface Spanish {
  lang: 'es';
  data: string;
}
interface German {
  lang: 'de';
  data: string;
}

// update these functions to look like
// (and fill out the bodies)
function toEnglish(s: Spanish): English;
function toSpanish(e: English): Spanish;
function toGerman(e: English): German;
```

Code ends up kinda gross, but at least we're getting a type error now:

```
Argument of type 'English' is not assignable to parameter of type 'Spanish'.
  Types of property 'lang' are incompatible.
    Type '"en"' is not assignable to type '"es"'.
```

How can we improve the situation? Let's take stock first:
- the main `translate` function accepts and returns a `string`, even though we just decided that was a mistake for `toEnglish` and friends.
- `toEnglish` only translates from Spanish and not German, `toGerman` only from English and not Spanish, `toSpanish` only from English and not German.

Let's fix the second item first.

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

In fact we can! But it requires a new tool.

## Generic types

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
