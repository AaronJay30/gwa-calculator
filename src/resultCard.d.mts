import type { CalculatorSummary } from "./gwaCalculator.mjs";
import type { LatinHonorsSummary } from "./latinHonors.mjs";

export type ShareResultStatus = "shared" | "copied" | "unsupported";

export function getResultCardFilename(
  academicStanding: string,
  gwa: number,
): string;

export function createShareResultSvg(
  summary: CalculatorSummary,
  isDark: boolean,
): string;

export function getLatinHonorCardFilename(latinHonor: string, gwa: number): string;

export function createLatinHonorResultSvg(
  summary: LatinHonorsSummary,
  isDark: boolean,
): string;

export function createShareResultPng(
  svg: string,
  browser?: typeof window,
): Promise<Blob>;

export function downloadPngBlob(
  blob: Blob,
  filename: string,
  browser?: typeof window,
): void;

export function shareResult(
  summary: CalculatorSummary,
  isDark: boolean,
  browser?: typeof window,
): Promise<ShareResultStatus>;
