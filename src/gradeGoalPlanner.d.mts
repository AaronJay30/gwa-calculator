export type GradePlanMode = "academic" | "latin-honors";

export interface GradePlanCourse {
  grades: number;
  units: number;
  includeInLatinHonors?: boolean;
}

export interface GradePlanTarget {
  id: string;
  label: string;
  cutoff: number;
  strict: boolean;
}

export interface GradePlanResult {
  target: GradePlanTarget;
  currentUnits: number;
  currentPoints: number;
  currentGwa: number;
  plannedUnits: number;
  requiredAverage: number | null;
  suggestedGrade: number | null;
  projectedUnits: number;
  projectedPoints: number;
  projectedGwa: number;
  projectedStanding: string;
  targetGwaMet: boolean;
  targetMet: boolean;
  status:
    | "ready"
    | "no-planned-courses"
    | "minimum-units-not-met"
    | "unreachable";
  bestCaseGwa: number | null;
}

export function getGradePlanTargets(mode: GradePlanMode): GradePlanTarget[];

export function calculateGradePlan(
  mode: GradePlanMode,
  currentCourses: readonly GradePlanCourse[],
  plannedCourses: readonly GradePlanCourse[],
  targetId: string,
): GradePlanResult;
