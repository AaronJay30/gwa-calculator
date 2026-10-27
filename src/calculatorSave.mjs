import { MAX_UNITS, VALID_GRADES } from "./gwaCalculator.mjs";
import { parseLatinHonorsCourses } from "./latinHonors.mjs";

export const SAVE_STORAGE_KEY = "gwa-calculator:save:v1";
export const LEGACY_LATIN_HONORS_STORAGE_KEY = "gwa-calculator:latin-honors:v1";
export const PREFERENCES_STORAGE_KEY = "gwa-calculator:preferences:v1";

const SAVE_FORMAT = "gwa-calculator-save";
const SAVE_VERSION = 1;
const DEFAULT_PREFERENCES = {
  mode: "original",
  computationMode: "scholarship",
};
const VALID_MODES = new Set(["original", "modern"]);
const VALID_COMPUTATION_MODES = new Set(["scholarship", "latin-honors"]);

const hasUniqueIds = (courses) =>
  new Set(courses.map((course) => course.id)).size === courses.length;

const parseJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const parseScholarshipCourses = (value) => {
  const records = parseJson(value);
  if (!Array.isArray(records)) return [];

  const courses = records.map((course) => {
    if (
      !course ||
      !Number.isInteger(course.id) ||
      course.id < 0 ||
      (course.grades !== 0 && !VALID_GRADES.includes(course.grades)) ||
      !Number.isInteger(course.units) ||
      course.units < 0 ||
      course.units > MAX_UNITS ||
      (course.name !== undefined && typeof course.name !== "string")
    ) {
      return null;
    }

    return {
      id: course.id,
      grades: course.grades,
      units: course.units,
      ...(course.name !== undefined ? { name: course.name } : {}),
    };
  });

  return courses.every(Boolean) && hasUniqueIds(courses) ? courses : [];
};

const validateCourseLists = (scholarshipCourses, latinHonorsCourses) => {
  const parsedScholarship = parseScholarshipCourses(scholarshipCourses);
  const parsedLatinHonors = parseLatinHonorsCourses(latinHonorsCourses);

  if (
    !Array.isArray(scholarshipCourses) ||
    parsedScholarship.length !== scholarshipCourses.length ||
    !hasUniqueIds(parsedScholarship) ||
    !Array.isArray(latinHonorsCourses) ||
    parsedLatinHonors.length !== latinHonorsCourses.length ||
    !hasUniqueIds(parsedLatinHonors)
  ) {
    throw new Error("The save copy contains invalid course data.");
  }

  return { scholarshipCourses: parsedScholarship, latinHonorsCourses: parsedLatinHonors };
};

export const createCourseBackup = ({ scholarshipCourses, latinHonorsCourses }) => {
  const courseLists = validateCourseLists(scholarshipCourses, latinHonorsCourses);
  return JSON.stringify(
    {
      format: SAVE_FORMAT,
      version: SAVE_VERSION,
      exportedAt: new Date().toISOString(),
      ...courseLists,
    },
    null,
    2,
  );
};

export const parseCourseBackup = (text) => {
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error("This file is not a valid GWA Calculator save copy.");
  }

  if (!backup || backup.format !== SAVE_FORMAT) {
    throw new Error("This file is not a GWA Calculator save copy.");
  }
  if (backup.version !== SAVE_VERSION) {
    throw new Error(`This save copy version is not supported (version ${backup.version}).`);
  }

  return validateCourseLists(backup.scholarshipCourses, backup.latinHonorsCourses);
};

export const loadCalculatorData = (storage) => {
  const saved = storage.getItem(SAVE_STORAGE_KEY);
  if (saved !== null) return parseCourseBackup(saved);

  return {
    scholarshipCourses: [],
    latinHonorsCourses: parseLatinHonorsCourses(
      storage.getItem(LEGACY_LATIN_HONORS_STORAGE_KEY),
    ),
  };
};

export const saveCalculatorData = (storage, data) => {
  storage.setItem(SAVE_STORAGE_KEY, createCourseBackup(data));
};

export const loadCalculatorPreferences = (storage) => {
  const preferences = parseJson(storage.getItem(PREFERENCES_STORAGE_KEY));
  if (!preferences || typeof preferences !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    mode: VALID_MODES.has(preferences.mode)
      ? preferences.mode
      : DEFAULT_PREFERENCES.mode,
    computationMode: VALID_COMPUTATION_MODES.has(preferences.computationMode)
      ? preferences.computationMode
      : DEFAULT_PREFERENCES.computationMode,
  };
};

export const saveCalculatorPreferences = (storage, preferences) => {
  storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
};
