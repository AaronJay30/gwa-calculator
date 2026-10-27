# Latin Honors Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a year-and-term based Latin Honors estimator with per-period scholarship summaries and a cumulative weighted GWA, while preserving the existing calculator and allowing up to 99 units per course.

**Architecture:** Keep the current Academic Scholarship course list untouched. Add pure Latin Honors calculation and storage-validation helpers, then a focused calculator component that owns year/term navigation and locally persisted entries. Add a separate labeled computation selector in `App.tsx`; leave the existing icon switch for Original/Modern layout.

**Tech Stack:** React, TypeScript, existing JavaScript calculation modules, Tailwind classes, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-latin-honors-mode-design.md`

## Global Constraints

- Preserve existing Academic Scholarship behavior and its course data.
- Latin Honors uses the GWA thresholds supplied by the user and must be labeled as an estimate.
- Excluded Latin Honors courses do not affect term or cumulative totals.
- Course units must be bounded from 1 through 99.
- Keep result-card total points at the previously requested four decimal places.
- Do not add a dependency or send stored grades to a server.

## Review Focus

- A high-precision GWA just above a cutoff must not qualify due to display rounding; cover in calculation tests.
- Different term unit totals must combine by total points / total units, not by averaging term GWAs; cover in calculation tests.
- Excluded courses must not affect term or cumulative counts, points, units, or GWA; cover in calculation tests.
- Navigating years/terms and switching computation modes must preserve each period's entries; check with component state design and build review.
- Corrupt or outdated local storage must not break the calculator; cover in storage parsing tests.
- The summary must include every saved grade once, grouped under the correct year and term; cover in grouping tests and modal markup review.

---

### Task 1: Latin Honors calculations and saved-data validation

**Files:**
- Create: `src/latinHonors.mjs`
- Create: `src/latinHonors.d.mts`
- Create: `tests/latinHonors.test.mjs`
- Modify: `src/gwaCalculator.mjs`
- Modify: `src/gwaCalculator.d.mts`

**Interfaces:**
- `calculateLatinHonorsSummary(courses)` returns `{ courseCount, totalUnits, totalPoints, gwa, latinHonor }` using only courses with `includeInLatinHonors !== false` and positive units.
- `getLatinHonor(gwa, totalUnits)` returns `"Summa Cum Laude" | "Magna Cum Laude" | "Cum Laude" | ""` and uses the unrounded GWA for thresholds.
- `getLatinHonorsYearGroups(courses)` returns ascending years with only populated terms in First/Mid/Second order.
- `parseLatinHonorsCourses(value)` validates the persisted record array and returns safe course records or an empty array.
- Update `stepUnit(units, direction)` maximum from 10 to 99.

- [x] Write tests for honor boundaries, unrounded comparisons, unit-weighted aggregation, excluded courses, invalid persisted records, year/term grouping, and the 99-unit cap.
- [x] Run the focused tests and confirm they fail for the missing helpers/limit.
- [x] Implement the calculation, parsing, declarations, and cap with minimal code.
- [x] Run the focused tests and confirm they pass.

### Task 2: Latin Honors period calculator

**Files:**
- Create: `src/components/LatinHonorsCalculator.tsx`
- Create: `src/components/LatinHonorsSummaryModal.tsx`
- Modify: `src/components/Input.tsx`
- Modify: `src/components/ModernCalculator.tsx`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- `LatinHonorsCalculator` accepts `isDark`; it owns saved Latin Honors courses, selected year (1–10), and selected term (`first`, `mid`, `second`), and remains mounted while its view is hidden.
- Latin Honors grade entry uses previous/next buttons over the existing valid grade scale.
- Persist Latin Honors entries under `gwa-calculator:latin-honors:v1` in local storage.
- Show cumulative estimate first, then independent year/term arrow controls, selected-term summary, entry controls, and selected-term course list.
- Summary modal groups saved courses under collapsible years and populated terms and shows grade, units, points, and term GWA.
- Each course can be excluded from the Latin Honors computation; its row remains visible and labeled excluded.
- Expand Original unit options and Modern step controls to 99.

- [x] Implement the focused component and unit control updates using existing project styles and icons.
- [x] Confirm navigation retains entries per period and updates term and cumulative summaries from the correct courses.
- [x] Confirm theme changes and narrow mobile layout remain usable.

### Task 3: Computation selector and app integration

**Files:**
- Create: `src/components/ComputationModeSwitch.tsx`
- Modify: `src/App.tsx`
- Modify: `tests/presentation.test.mjs`
- Modify: `src/resultCard.mjs`
- Modify: `tests/resultCard.test.mjs`
- Modify: `tests/themeTokens.test.mjs`

**Interfaces:**
- `ComputationModeSwitch` exposes `"scholarship" | "latin-honors"` through two labeled, accessible buttons.
- The selector appears below the header only when Modern is active. Original retains its current calculator; the Original/Modern icon switch remains unchanged in purpose.
- Keep `LatinHonorsCalculator` mounted while hidden so changing computation modes does not discard state.

- [x] Add the selector and mount/hide the new calculator while retaining existing layout-switch behavior.
- [x] Keep result-card total points at four decimal places and update stale assertions to match the current light theme and light-button text contract.
- [x] Run the full test suite, lint, and production build; resolve any failures.
- [x] Review the final diff against every goal and non-goal in the design spec.

### User refinement: Modern-only mode selector, grade stepper, and Summary modal

- [x] Show the computation selector only in Modern and keep Original's Academic Scholarship calculator visible regardless of the last Modern selection.
- [x] Replace Latin Honors grade dropdown with previous/next grade buttons.
- [x] Add a focus-managed Summary modal with collapsible year and semester groups and saved grade details.
- [x] Verify keyboard access to collapsed year and semester summaries in the modal.
