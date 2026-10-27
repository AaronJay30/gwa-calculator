export const VALID_GRADES = [
  1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5,
];
export const MAX_UNITS = 99;

export const getAcademicStanding = (gwa, totalUnits) => {
  if (totalUnits < 9) return "";
  if (gwa < 1.51) return "University Scholar";
  if (gwa < 1.76) return "College Scholar";
  if (gwa <= 2) return "Dean's Lister";
  return "";
};

export const calculateSummary = (courses) => {
  const countedCourses = courses.filter((course) => course.units > 0);
  const totalUnits = countedCourses.reduce(
    (sum, course) => sum + course.units,
    0,
  );
  const totalPoints = countedCourses.reduce(
    (sum, course) => sum + course.grades * course.units,
    0,
  );
  const gwa = totalUnits > 0 ? Number((totalPoints / totalUnits).toFixed(4)) : 0;

  return {
    courseCount: countedCourses.length,
    totalUnits,
    totalPoints,
    gwa,
    academicStanding: getAcademicStanding(gwa, totalUnits),
  };
};

export const hasCoursesToClear = (courses) =>
  courses.length > 1 ||
  courses.some(
    (course) => course.grades !== 0 || course.units > 0 || Boolean(course.name?.trim()),
  );

export const stepGrade = (grade, direction) => {
  const currentIndex = VALID_GRADES.indexOf(grade);
  if (currentIndex === -1) return VALID_GRADES[0];
  const nextIndex = Math.max(
    0,
    Math.min(VALID_GRADES.length - 1, currentIndex + direction),
  );
  return VALID_GRADES[nextIndex];
};

export const stepUnit = (units, direction) =>
  Math.max(1, Math.min(MAX_UNITS, units + direction));
