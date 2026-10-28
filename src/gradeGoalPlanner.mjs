import {
  calculateSummary,
  getAcademicStanding,
  MAX_UNITS,
  VALID_GRADES,
} from "./gwaCalculator.mjs";
import { getLatinHonor } from "./latinHonors.mjs";

const TARGETS = {
  academic: [
    { id: "university", label: "University Scholar", cutoff: 1.51, strict: true },
    { id: "college", label: "College Scholar", cutoff: 1.76, strict: true },
    { id: "deans", label: "Dean's Lister", cutoff: 2, strict: false },
  ],
  "latin-honors": [
    { id: "summa", label: "Summa Cum Laude", cutoff: 1.2, strict: false },
    { id: "magna", label: "Magna Cum Laude", cutoff: 1.45, strict: false },
    { id: "cum", label: "Cum Laude", cutoff: 1.75, strict: false },
  ],
};
const PASSING_GRADES = VALID_GRADES.filter((grade) => grade <= 3).sort(
  (left, right) => right - left,
);

const isValidCourse = (course, mode) =>
  course &&
  Number.isInteger(course.units) &&
  course.units >= 1 &&
  course.units <= MAX_UNITS &&
  VALID_GRADES.includes(course.grades) &&
  (mode !== "latin-honors" || course.includeInLatinHonors !== false);

const getSummary = (mode, courses) => {
  const summary = calculateSummary(
    courses.map((course, id) => ({ id, grades: course.grades, units: course.units })),
  );
  const exactGwa = summary.totalUnits > 0
    ? summary.totalPoints / summary.totalUnits
    : 0;

  return {
    ...summary,
    exactGwa,
    standing: mode === "academic"
      ? getAcademicStanding(summary.gwa, summary.totalUnits)
      : getLatinHonor(exactGwa, summary.totalUnits),
  };
};

const meetsGwaTarget = (mode, summary, target) => {
  const gwa = mode === "latin-honors" ? summary.exactGwa : summary.gwa;
  return target.strict ? gwa < target.cutoff : gwa <= target.cutoff;
};

const hasRequiredUnits = (mode, units) =>
  mode === "academic" ? units >= 9 : units > 0;

export const getGradePlanTargets = (mode) => TARGETS[mode] ?? [];

export const calculateGradePlan = (
  mode,
  currentCourses,
  plannedCourses,
  targetId,
) => {
  const targets = getGradePlanTargets(mode);
  const target = targets.find((item) => item.id === targetId) ?? targets[0];
  const includedCurrentCourses = currentCourses.filter((course) =>
    isValidCourse(course, mode),
  );
  const current = getSummary(mode, includedCurrentCourses);
  const planned = plannedCourses.filter((course) => isValidCourse(course, mode));
  const plannedUnits = planned.reduce((sum, course) => sum + course.units, 0);
  const requiredAverage = plannedUnits > 0
    ? (target.cutoff * (current.totalUnits + plannedUnits) - current.totalPoints) /
      plannedUnits
    : null;
  const projected = getSummary(mode, [...includedCurrentCourses, ...planned]);
  const targetGwaMet = meetsGwaTarget(mode, projected, target);
  const targetMet = targetGwaMet && hasRequiredUnits(mode, projected.totalUnits);

  const suggestedGrade = plannedUnits > 0
    ? PASSING_GRADES.find((grade) => {
        const suggestion = getSummary(mode, [
          ...includedCurrentCourses,
          ...planned.map((course) => ({ ...course, grades: grade })),
        ]);
        return meetsGwaTarget(mode, suggestion, target);
      }) ?? null
    : null;
  const bestCaseGwa = plannedUnits > 0 && suggestedGrade === null
    ? getSummary(mode, [
        ...includedCurrentCourses,
        ...planned.map((course) => ({ ...course, grades: 1 })),
      ]).gwa
    : null;
  let status = "ready";
  if (plannedUnits <= 0) {
    status = "no-planned-courses";
  } else if (mode === "academic" && projected.totalUnits < 9) {
    status = "minimum-units-not-met";
  } else if (suggestedGrade === null) {
    status = "unreachable";
  }

  return {
    target,
    currentUnits: current.totalUnits,
    currentPoints: current.totalPoints,
    currentGwa: current.gwa,
    plannedUnits,
    requiredAverage,
    suggestedGrade,
    projectedUnits: projected.totalUnits,
    projectedPoints: projected.totalPoints,
    projectedGwa: projected.gwa,
    projectedStanding: projected.standing,
    targetGwaMet,
    targetMet,
    status,
    bestCaseGwa,
  };
};
