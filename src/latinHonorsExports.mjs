import { calculateSummary } from "./gwaCalculator.mjs";
import {
  calculateLatinHonorsSummary,
  getLatinHonorsYearGroups,
} from "./latinHonors.mjs";

export const buildLatinHonorsExportData = (courses) => {
  const courseDetails = [];
  const semesterSummaries = getLatinHonorsYearGroups(courses).flatMap(
    ({ year, terms }) =>
      terms.map(({ term, courses: termCourses }) => {
        const includedCourses = termCourses.filter(
          (course) => course.includeInLatinHonors !== false,
        );
        const latinHonorsSummary = calculateLatinHonorsSummary(termCourses);

        courseDetails.push(
          ...termCourses.map((course, index) => ({
            id: course.id,
            year,
            term,
            name: course.name?.trim() || `Subject ${index + 1}`,
            grades: course.grades,
            units: course.units,
            points: course.grades * course.units,
            includeInLatinHonors: course.includeInLatinHonors !== false,
          })),
        );

        return {
          year,
          term,
          latinHonorsSummary,
          scholarshipSummary: calculateSummary(includedCourses),
          courses: termCourses,
        };
      }),
  );

  return {
    overallSummary: calculateLatinHonorsSummary(courses),
    semesterSummaries,
    courseDetails,
  };
};
