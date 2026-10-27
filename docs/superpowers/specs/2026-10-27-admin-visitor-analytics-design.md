# Admin Visitor Analytics Design

> Superseded on 2026-10-27 by `2026-10-27-ga4-visitor-analytics-design.md`.
> This document describes the earlier Firestore chart implementation.

## Intent

Help the admin identify traffic peaks by showing daily visits and unique
visitors on a line graph for a chosen date range.

## Goals

- Add Last week, Last 30 days, and Custom date range filters.
- Plot daily visits and unique visitors as separate lines and highlight the
  date with the most visits.
- Keep the lifetime totals, labeled All-time Visits and All-time Unique
  Visitors, separate from the filtered graph.
- Use the existing dark/light palette and admin dialog.

## Non-goals

- Changing visit collection, deduplication, or Firestore document structure.
- Changing how the lifetime unique-visitor counter is calculated.
- Exporting chart data or displaying user-level visitor data.

## Constraints and Behavior

- Daily records are stored in `dailyStats/{YYYY-MM-DD}` with `visits` and
  `uniqueVisitors`; the current fetch is used only by `AdminPage`.
- Query the selected inclusive start/end date keys and fill missing dates with
  zero-valued daily entries to keep the graph continuous.
- Last week means the latest seven local calendar dates including today. Last
  30 days means the latest thirty local calendar dates including today.
- Custom ranges include both selected dates, reject a start date after the end
  date, and cannot end after today.
- Dates run chronologically from left to right. The peak callout and emphasized
  graph point identify the day with the most visits; ties are highlighted.
- Daily unique visitor values are the stored per-day counts, not a distinct
  person count summed across the whole selected range.
- The graph follows the selected range; the summary cards remain all-time
  values.

## Approaches

1. **Recharts responsive line chart — selected.** Use the React chart package
   for axes, legend, and hover tooltips. It handles the line graph without
   hand-building chart geometry and allows the peak day to be emphasized.
2. **Hand-built responsive SVG.** Avoids a package, but requires custom axes,
   scales, labels, and interaction behavior.

The user requested a chart package rather than a hand-built chart. Recharts is
the implementation choice because it provides composable React chart parts.
The app remains on React 18, so the package lock scopes Recharts' React Redux
peer to version 8 to keep its React type definitions on the same major version.

## Acceptance Criteria

- **[AC-ANALYTICS1027-F1]** Admin can switch between Last week, Last 30 days,
  and Custom date range.
- **[AC-ANALYTICS1027-F2]** The responsive line graph shows visits and unique
  visitors as separate series for every date in the selected inclusive range;
  absent days show zero.
- **[AC-ANALYTICS1027-F3]** The day with the highest visit count is clearly
  identified, with tied peak days handled consistently.
- **[AC-ANALYTICS1027-F4]** All-time visit and unique visitor summary values do
  not change when the graph range changes.
- **[AC-ANALYTICS1027-E1]** Invalid custom ranges show inline validation and do
  not replace the currently displayed graph data.
- **[AC-ANALYTICS1027-E2]** Loading, empty, and query-error states remain clear
  and accessible.

## Change Surface

- `package.json` and its lockfile: add Recharts.
- `src/firebase/visitorService.ts`: fetch daily records for inclusive date keys.
- `src/components/AdminPage.tsx`: date filters, range state, and peak summary.
- `src/components/VisitorAnalyticsChart.tsx`: responsive Recharts line graph.
- `src/App.tsx`: load the admin dashboard on demand so the chart is not in the
  calculator's initial bundle.
- `tests/`: update existing analytics-facing tests if present; add focused
  coverage for date-range behavior.
- `README.md`: document the admin analytics filters.
