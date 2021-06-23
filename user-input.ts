// type Department = 'Alchemy' | 'Sympathy' | 'Linguistics' | 'Naming' | 'Artificery';
// interface Course {
//   department: Department;
//   crn: string;
//   name: string;
// }
// interface Student {
//   name: string;
//   courses: Course[];
//   anticipatedGraduation: {
//     quarter: 'spring' | 'summer' | 'fall' | 'winter';
//     year: number;
//   };
// }



const goodData: unknown = JSON.parse(`{
  "name": "Kvothe",
  "courses": [{
    "department": "Artificery",
    "name": "Sigaldry",
    "crn": "ART204"
  }],
  "anticipatedGraduation": {
    "quarter": "summer",
    "year": 2024
  }
}`);

const badData: unknown = JSON.parse(`{
  "name": "Ambrose Jackis",
  "courses": [{
    "department": "Sympathy",
    "name": "Advanced Methods"
  }],
  "expectedGraduation": {
    "quarter": "Spring",
    "year": "two hunnerd and five"
  }
}`);

// function isDepartment(d: unknown): d is Department {
//   return d === 'Alchemy' || d === 'Sympathy' || d === 'Linguistics' || d === 'Naming' || d === 'Artificery';
// }
// function isCourse(c: any): c is Course {
//   return (
//     !!c &&
//     isDepartment((c as any).department) &&
//     typeof (c as any).crn === 'string' &&
//     typeof (c as any).name === 'string'
//   );
// }
// function isStudent(s: any): s is Student {
//   return (
//     !!s &&
//     typeof s.name === 'string' &&
//     Array.isArray(s.courses) &&
//     s.courses.every(isCourse) &&
//     !!s.anticipatedGraduation &&
//     (s.anticipatedGraduation.quarter === 'spring' || s.anticipatedGraduation.quarter === 'summer' || s.anticipatedGraduation.quarter === 'fall' || s.anticipatedGraduation.quarter === 'winter') &&
//     typeof s.anticipatedGraduation.year === 'number'
//   );
// }
// if (isStudent(goodData)) {
//   console.log('good data is a student');
//   goodData.name;
// } else {
//   console.log('good data is (surprisingly!) not a student');
// }

// if (isStudent(badData)) {
//   console.log('bad data is (surprisingly!) a student');
// } else {
//   console.log('bad data is not a student');
// }

// import * as z from 'zod';
// const Department = z.enum(['Alchemy', 'Sympathy', 'Linguistics', 'Naming', 'Artificery']);
// type Department = z.infer<typeof Department>;
// const Course = z.object({
//   department: Department,
//   crn: z.string(),
//   name: z.string(),
// });
// type Course = z.infer<typeof Course>;
// const Student = z.object({
//   name: z.string(),
//   courses: z.array(Course),
//   anticipatedGraduation: z.object({
//     quarter: z.enum(['spring', 'summer', 'fall', 'winter']),
//     year: z.number(),
//   }),
// });
// type Student = z.infer<typeof Student>;

// let badStudent = Student.safeParse(badData);
// let goodStudent = Student.safeParse(goodData);
// if (goodStudent.success) {
//   console.log('good data is a student');
//   goodStudent.data.name;
// } else {
//   console.log('good data is (surprisingly!) not a student');
// }

// if (badStudent.success) {
//   console.log('bad data is (surprisingly!) a student');
// } else {
//   console.log('bad data is not a student');
//   console.log(badStudent.error.issues);
// }
