import type { GWA } from "./model";
import type { LatinHonorsCourse } from "./latinHonors.mjs";

export const SAVE_STORAGE_KEY: string;
export const LEGACY_LATIN_HONORS_STORAGE_KEY: string;
export const PREFERENCES_STORAGE_KEY: string;

export interface CalculatorSaveData {
  scholarshipCourses: GWA[];
  latinHonorsCourses: LatinHonorsCourse[];
}

export interface CalculatorPreferences {
  mode: "original" | "modern";
  computationMode: "scholarship" | "latin-honors";
}

export interface StorageReader {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function parseScholarshipCourses(value: unknown): GWA[];
export function createCourseBackup(data: CalculatorSaveData): string;
export function parseCourseBackup(text: string): CalculatorSaveData;
export function loadCalculatorData(storage: StorageReader): CalculatorSaveData;
export function saveCalculatorData(
  storage: StorageReader,
  data: CalculatorSaveData,
): void;
export function loadCalculatorPreferences(
  storage: StorageReader,
): CalculatorPreferences;
export function saveCalculatorPreferences(
  storage: StorageReader,
  preferences: CalculatorPreferences,
): void;
