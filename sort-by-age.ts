function sortByName(arr: any[]) {
  arr.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
}

const students = [
  { name: 'brian', major: 'math' },
  { name: 'cj', major: 'econ' },
  { name: 'zoe', major: "bein' a dog" },
]

sortByName(students);
