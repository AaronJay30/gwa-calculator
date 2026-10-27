import { MAX_UNITS, VALID_GRADES } from "./gwaCalculator.mjs";

const VALID_TERMS = new Set(["first", "mid", "second"]);
const TERM_ORDER = ["first", "mid", "second"];

export const getCoursesForPeriod = (courses, year, term) =>
  courses.filter((course) => course.year === year && course.term === term);

export const getNextScholarshipCourseId = (scholarshipCourses, latinHonorsCourses) =>
  Math.max(
    -1,
    ...scholarshipCourses.map((course) => course.id),
    ...latinHonorsCourses.map((course) => course.sourceScholarshipCourseId ?? -1),
  ) + 1;

export const getLatinHonorsYearGroups = (courses) => {
  const years = [...new Set(courses.map((course) => course.year))].sort(
    (left, right) => left - right,
  );

  return years.map((year) => ({
    year,
    terms: TERM_ORDER.flatMap((term) => {
      const termCourses = getCoursesForPeriod(courses, year, term);
      return termCourses.length ? [{ term, courses: termCourses }] : [];
    }),
  }));
};

export const getLatinHonor = (gwa, totalUnits) => {
  if (totalUnits <= 0) return "";
  if (gwa <= 1.2) return "Summa Cum Laude";
  if (gwa <= 1.45) return "Magna Cum Laude";
  if (gwa <= 1.75) return "Cum Laude";
  return "";
};

export const calculateLatinHonorsSummary = (courses) => {
  const countedCourses = courses.filter(
    (course) => course.includeInLatinHonors !== false && course.units > 0,
  );
  const totalUnits = countedCourses.reduce(
    (sum, course) => sum + course.units,
    0,
  );
  const totalPoints = countedCourses.reduce(
    (sum, course) => sum + course.grades * course.units,
    0,
  );
  const exactGwa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    courseCount: countedCourses.length,
    totalUnits,
    totalPoints,
    gwa: Number(exactGwa.toFixed(4)),
    latinHonor: getLatinHonor(exactGwa, totalUnits),
  };
};

export const parseLatinHonorsCourses = (value) => {
  let records = value;

  if (typeof value === "string") {
    try {
      records = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(records)) return [];

  return records.flatMap((course) => {
    if (
      !course ||
      !Number.isInteger(course.id) ||
      course.id < 0 ||
      !VALID_GRADES.includes(course.grades) ||
      !Number.isInteger(course.units) ||
      course.units < 1 ||
      course.units > MAX_UNITS ||
      !Number.isInteger(course.year) ||
      course.year < 1 ||
      course.year > 10 ||
      !VALID_TERMS.has(course.term) ||
      (course.name !== undefined && typeof course.name !== "string") ||
      (course.sourceScholarshipCourseId !== undefined &&
        (!Number.isInteger(course.sourceScholarshipCourseId) ||
          course.sourceScholarshipCourseId < 0)) ||
      (course.includeInLatinHonors !== undefined &&
        typeof course.includeInLatinHonors !== "boolean")
    ) {
      return [];
    }

    return [
      {
        id: course.id,
        grades: course.grades,
        units: course.units,
        year: course.year,
        term: course.term,
        ...(course.name !== undefined ? { name: course.name } : {}),
        ...(course.sourceScholarshipCourseId !== undefined
          ? { sourceScholarshipCourseId: course.sourceScholarshipCourseId }
          : {}),
        includeInLatinHonors: course.includeInLatinHonors !== false,
      },
    ];
  });
};

export const transferScholarshipCourses = (
  scholarshipCourses,
  latinHonorsCourses,
  year,
  term,
) => {
  if (!Number.isInteger(year) || year < 1 || year > 10 || !VALID_TERMS.has(term)) {
    return {
      courses: latinHonorsCourses,
      addedCount: 0,
      updatedCount: 0,
      skippedCount: scholarshipCourses.length,
    };
  }

  const completedCourses = scholarshipCourses.filter(
    (course) =>
      Number.isInteger(course.id) &&
      course.id >= 0 &&
      VALID_GRADES.includes(course.grades) &&
      Number.isInteger(course.units) &&
      course.units > 0 &&
      course.units <= MAX_UNITS,
  );
  const courses = [...latinHonorsCourses];
  let nextId = Math.max(-1, ...courses.map((course) => course.id));
  let addedCount = 0;
  let updatedCount = 0;

  for (const source of completedCourses) {
    const existingIndex = courses.findIndex(
      (course) =>
        course.sourceScholarshipCourseId === source.id &&
        course.year === year &&
        course.term === term,
    );

    if (existingIndex >= 0) {
      const existing = courses[existingIndex];
      courses[existingIndex] = {
        ...existing,
        ...(source.name !== undefined ? { name: source.name } : {}),
        grades: source.grades,
        units: source.units,
      };
      updatedCount += 1;
      continue;
    }

    courses.push({
      id: ++nextId,
      sourceScholarshipCourseId: source.id,
      ...(source.name !== undefined ? { name: source.name } : {}),
      grades: source.grades,
      units: source.units,
      year,
      term,
      includeInLatinHonors: true,
    });
    addedCount += 1;
  }

  return {
    courses,
    addedCount,
    updatedCount,
    skippedCount: scholarshipCourses.length - completedCourses.length,
  };
};
