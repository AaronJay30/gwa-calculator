import assert from "node:assert/strict";
import test from "node:test";

const analytics = await import("../src/visitorAnalytics.mjs").catch(() => null);

test("weekly preset includes seven local calendar dates through today", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  assert.deepEqual(
    analytics.getPresetDateRange("week", new Date(2026, 9, 27)),
    { startDate: "2026-10-21", endDate: "2026-10-27" },
  );
});

test("30-day preset crosses month and year boundaries inclusively", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  assert.deepEqual(
    analytics.getPresetDateRange("month", new Date(2025, 0, 3)),
    { startDate: "2024-12-05", endDate: "2025-01-03" },
  );
});

test("30-day preset counts leap day as a local calendar date", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  assert.deepEqual(
    analytics.getPresetDateRange("month", new Date(2024, 2, 1)),
    { startDate: "2024-02-01", endDate: "2024-03-01" },
  );
});

test("daily series fills missing dates with zero counts in chronological order", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  const series = analytics.fillDailyStats("2026-10-24", "2026-10-27", [
    { date: "2026-10-27", visits: 8, uniqueVisitors: 5 },
    { date: "2026-10-24", visits: 3, uniqueVisitors: 2 },
  ]);

  assert.deepEqual(series, [
    { date: "2026-10-24", visits: 3, uniqueVisitors: 2 },
    { date: "2026-10-25", visits: 0, uniqueVisitors: 0 },
    { date: "2026-10-26", visits: 0, uniqueVisitors: 0 },
    { date: "2026-10-27", visits: 8, uniqueVisitors: 5 },
  ]);
});

test("daily series includes a single selected date and returns empty for a reversed range", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  assert.deepEqual(
    analytics.fillDailyStats("2026-10-27", "2026-10-27", []),
    [{ date: "2026-10-27", visits: 0, uniqueVisitors: 0 }],
  );
  assert.deepEqual(analytics.fillDailyStats("2026-10-28", "2026-10-27", []), []);
});

test("peak days include ties and ignore an all-zero range", () => {
  assert.ok(analytics, "visitor analytics date helpers are missing");
  const series = [
    { date: "2026-10-25", visits: 8, uniqueVisitors: 4 },
    { date: "2026-10-26", visits: 12, uniqueVisitors: 7 },
    { date: "2026-10-27", visits: 12, uniqueVisitors: 9 },
  ];

  assert.deepEqual(analytics.getPeakDays(series), [series[1], series[2]]);
  assert.deepEqual(
    analytics.getPeakDays([{ date: "2026-10-27", visits: 0, uniqueVisitors: 0 }]),
    [],
  );
});
