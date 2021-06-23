// lifted from https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types

// function printId(id: string | number) {
//   console.log(id.toUpperCase());
// }

function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Here: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Here: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}

