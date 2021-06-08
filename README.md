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

## Branded Types

You may have noticed that there's no way to translate directly from
