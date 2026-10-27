export type LatinTerm = "first" | "mid" | "second";

export interface LatinHonorsCourse {
  id: number;
  grades: number;
  units: number;
  year: number;
  term: LatinTerm;
  name?: string;
  sourceScholarshipCourseId?: number;
  includeInLatinHonors: boolean;
}

export interface ScholarshipTransferResult {
  courses: LatinHonorsCourse[];
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
}

export type LatinHonor = "Summa Cum Laude" | "Magna Cum Laude" | "Cum Laude" | "";

export interface LatinHonorsSummary {
  courseCount: number;
  totalUnits: number;
  totalPoints: number;
  gwa: number;
  latinHonor: LatinHonor;
}

export interface LatinHonorsTermGroup {
  term: LatinTerm;
  courses: LatinHonorsCourse[];
}

export interface LatinHonorsYearGroup {
  year: number;
  terms: LatinHonorsTermGroup[];
}

export interface LatinHonorsExportCourse {
  id: number;
  year: number;
  term: LatinTerm;
  name: string;
  grades: number;
  units: number;
  points: number;
  includeInLatinHonors: boolean;
}

export interface LatinHonorsExportSemester {
  year: number;
  term: LatinTerm;
  latinHonorsSummary: LatinHonorsSummary;
  scholarshipSummary: import("./gwaCalculator.mjs").CalculatorSummary;
  courses: LatinHonorsCourse[];
}

export interface LatinHonorsExportData {
  overallSummary: LatinHonorsSummary;
  semesterSummaries: LatinHonorsExportSemester[];
  courseDetails: LatinHonorsExportCourse[];
}

export function getLatinHonor(gwa: number, totalUnits: number): LatinHonor;
export function getCoursesForPeriod(
  courses: LatinHonorsCourse[],
  year: number,
  term: LatinTerm,
): LatinHonorsCourse[];
export function getNextScholarshipCourseId(
  scholarshipCourses: import("./gwaCalculator.mjs").CalculatorCourse[],
  latinHonorsCourses: LatinHonorsCourse[],
): number;
export function getLatinHonorsYearGroups(
  courses: LatinHonorsCourse[],
): LatinHonorsYearGroup[];
export function calculateLatinHonorsSummary(
  courses: LatinHonorsCourse[],
): LatinHonorsSummary;
export function parseLatinHonorsCourses(value: unknown): LatinHonorsCourse[];
export function transferScholarshipCourses(
  scholarshipCourses: import("./gwaCalculator.mjs").CalculatorCourse[],
  latinHonorsCourses: LatinHonorsCourse[],
  year: number,
  term: LatinTerm,
): ScholarshipTransferResult;
