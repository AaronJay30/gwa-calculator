export type AcademicStanding =
  | "University Scholar"
  | "College Scholar"
  | "Dean's Lister"
  | "";

export interface CalculatorCourse {
  id: number;
  grades: number;
  units: number;
  name?: string;
}

export interface CalculatorSummary {
  courseCount: number;
  totalUnits: number;
  totalPoints: number;
  gwa: number;
  academicStanding: AcademicStanding;
}

export const VALID_GRADES: readonly number[];
export const MAX_UNITS: 99;
export function getAcademicStanding(
  gwa: number,
  totalUnits: number,
): AcademicStanding;
export function calculateSummary(
  courses: CalculatorCourse[],
): CalculatorSummary;
export function hasCoursesToClear(courses: CalculatorCourse[]): boolean;
export function stepGrade(grade: number, direction: -1 | 1): number;
export function stepUnit(units: number, direction: -1 | 1): number;
