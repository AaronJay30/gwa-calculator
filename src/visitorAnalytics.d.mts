import type { DailyStat } from "./firebase/visitorService";

export type DateRangePreset = "week" | "month";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function getPresetDateRange(
  preset: DateRangePreset,
  today?: Date,
): DateRange;

export function fillDailyStats(
  startDate: string,
  endDate: string,
  records: DailyStat[],
): DailyStat[];

export function getPeakDays(records: DailyStat[]): DailyStat[];
