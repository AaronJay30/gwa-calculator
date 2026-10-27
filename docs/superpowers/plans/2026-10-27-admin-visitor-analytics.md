# Admin Visitor Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add date filters and a responsive two-series line chart to help the admin identify the busiest days and compare daily visits with unique visitors.

**Architecture:** Keep lifetime metrics in `AdminPage`, fetch only daily aggregate records in the selected date range, and normalize them into a continuous chronological series. Use Recharts for the responsive line chart, axes, legend, tooltips, and a highlighted peak visit day.

**Tech Stack:** React 18, TypeScript, Firebase Firestore, Recharts, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-admin-visitor-analytics-design.md`

## Global Constraints

- Last week means the latest seven local calendar dates including today.
- Last 30 days means the latest thirty local calendar dates including today.
- Custom ranges include both selected dates, reject a start date after the end date, and cannot end after today.
- Missing days are represented as zero-valued records.
- All-time visit and unique-visitor totals remain unchanged by chart filters.
- Dates run chronologically from left to right; tied peak days are highlighted.
- The admin page continues to use the existing password gate and current theme palette.

## Review Focus

- Month boundaries and leap days: preset windows must include exactly 7 or 30 local dates.
- Custom ranges: both endpoints are included and invalid or future ranges do not replace active chart data.
- Missing Firestore documents: each absent date appears with zero visits and zero unique visitors.
- Peak ties and all-zero data: all tied peaks are identified; an all-zero series does not imply traffic.
- Range changes during a request: stale responses must not overwrite data for the current selection.

---

### Task 1: Date range and daily-series helpers

**Files:**
- Create: `src/visitorAnalytics.mjs`
- Create: `src/visitorAnalytics.d.mts`
- Create: `tests/visitorAnalytics.test.mjs`

**Interfaces:**
- Produces `getPresetDateRange(preset: "week" | "month", today?: Date): { startDate: string; endDate: string }`.
- Produces `fillDailyStats(startDate: string, endDate: string, records: DailyStat[]): DailyStat[]`, ordered oldest to newest with missing records set to zero.
- Date keys use local calendar dates in `YYYY-MM-DD` form.

- [x] Write focused tests for seven/30 inclusive dates, local month rollover, zero-filled gaps, chronological ordering, and empty/equal ranges.
- [x] Run `node --test tests/visitorAnalytics.test.mjs` and confirm the missing helper behavior fails.
- [x] Implement only the date helpers needed for the tested behavior.
- [x] Run `node --test tests/visitorAnalytics.test.mjs` and confirm it passes.

### Task 2: Date-bounded Firestore query

**Files:**
- Modify: `src/firebase/visitorService.ts`
- Modify: `tests/visitorAnalytics.test.mjs` only if a pure query-argument helper is required.

**Interfaces:**
- Replaces `fetchDailyStats(days?: number)` with `fetchDailyStats(startDate: string, endDate: string): Promise<DailyStat[]>`.
- Fetches `dailyStats` records whose date keys fall inclusively within the supplied bounds, ordered ascending.

- [x] Add `where` constraints for `date >= startDate` and `date <= endDate`, plus ascending date order.
- [x] Preserve the current `DailyStat` result shape and default absent numeric fields to zero.

### Task 3: Responsive visitor line chart

**Files:**
- Create: `src/components/VisitorAnalyticsChart.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- `VisitorAnalyticsChart` consumes `data: DailyStat[]` and `isDark: boolean`.
- Uses Recharts `ResponsiveContainer`, `LineChart`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `Line`, and `ReferenceDot`.
- Plots `visits` and `uniqueVisitors` as separate, theme-aware lines.
- Highlights each date tied for the highest nonzero visit count and exposes the selected point's date and counts through the tooltip.

- [x] Add Recharts using the package manager and update the lockfile.
- [x] Implement a responsive chart with readable date ticks, count axis, legend, and tooltip.
- [x] Render no peak marker when every date has zero visits.

### Task 4: Admin filters, data loading, and documentation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AdminPage.tsx`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-10-27-admin-visitor-analytics-design.md` if implementation details change.

**Interfaces:**
- `AdminPage` keeps all-time summary fetching separate from selected-range daily fetching.
- Preset controls select seven-day or 30-day local ranges. Custom controls collect inclusive start/end dates and apply only valid ranges.
- Daily fetch results pass through `fillDailyStats` before rendering.
- The admin dashboard loads on demand so Recharts stays out of the calculator's initial bundle.

- [x] Add accessible preset controls and labeled custom date inputs with an Apply action.
- [x] Reject reversed or future custom ranges inline without changing the displayed chart data.
- [x] Load daily records when the applied range changes; prevent stale or unmounted requests from setting state.
- [x] Keep all-time cards labeled as all-time and render the peak-day summary with the chart.
- [x] Preserve loading, query-error, empty-range, modal-close, and theme behavior.
- [x] Document the filters and chart in the README.
- [x] Load the admin dashboard on demand to keep its chart out of the initial bundle.

### Task 5: Verification and review

**Files:**
- Review: all files listed above.

- [x] Run `npm test` (32 passing).
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run `git diff --check`.
- [ ] Review the chart at narrow and wide widths and confirm range changes leave lifetime metrics unchanged (source review only; no admin session available for visual interaction).
- [x] Review the final diff for unnecessary dependencies, stale range state, and accessible labeling.
