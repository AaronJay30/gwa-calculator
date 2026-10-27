# Calculator Layout Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task if Native is chosen, or superpowers:subagent-driven-development if Subagent-driven is chosen. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Original/Modern layout toggle that shares calculator entries and scholarship results.

**Architecture:** Keep one shared course list in `App`, make Original inputs controlled, and add a separate Modern view that edits the same list. Put calculation, standing, and stepper rules in a small pure module that can be exercised with Node's built-in test runner without adding dependencies.

**Tech Stack:** React 18, TypeScript, Vite, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-26-calculator-modes-design.md`

## Global Constraints

- Satisfy every criterion in `MODE1026` spec.
- Preserve `sum(grade * units) / sum(units)` and the existing scholarship thresholds.
- Keep one course list shared between both modes; keep course data in React state only.
- Keep the current valid grades and 1–10 unit range; add no dependencies.
- Leave the user's existing edit in `src/components/AdminPage.tsx` untouched.

## Review Focus

- Grade controls stop at 1.00 and 5.00 and move through only existing grade values; cover with a unit test.
- Unit controls stop at 1 and 10; cover both boundaries with a unit test.
- Empty and zero-unit rows produce zero summary values; cover with a unit test.
- Summary course count, points, and average ignore zero-unit rows; cover with a unit test.
- Scholarship standing keeps the >10-unit gate and all current GWA ranges; cover threshold and unit-boundary cases with unit tests.

---

### Task 1: Extract and test calculator rules

**Files:**
- Create: `src/gwaCalculator.mjs`
- Create: `src/gwaCalculator.d.mts`
- Create: `tests/gwaCalculator.test.mjs`
- Modify: `package.json`

**Interfaces:**
- `calculateSummary(courses)` returns `courseCount`, `totalUnits`, `totalPoints`, `gwa`, and `academicStanding`.
- `stepGrade(grade, direction)` returns the adjacent allowed grade, clamped at the ends of the existing grade list.
- `stepUnit(units, direction)` returns the adjacent integer from 1–10, clamped at the ends.

- [ ] Write Node tests tagged with the relevant AC IDs for empty totals, zero-unit rows, course count/points/average, scholarship thresholds and unit gate, and grade/unit stepper boundaries.
- [ ] Run `node --test tests/gwaCalculator.test.mjs` and confirm the tests fail because the calculator helpers are not implemented.
- [ ] Implement the minimal pure helpers and declaration types in `src/gwaCalculator.mjs` and `src/gwaCalculator.d.mts`.
- [ ] Run `node --test tests/gwaCalculator.test.mjs` and confirm all cases pass.
- [ ] Add the `npm test` script using `node --test` and run `npm test`.

### Task 2: Share entries between Original mode and the mode toggle

**Files:**
- Modify: `src/model.ts`
- Modify: `src/components/Input.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/CalculatorModeSwitch.tsx`

**Interfaces:**
- Extend `GWA` with optional `name?: string`.
- Make `Input` receive a course and change/delete callbacks so its selects reflect shared parent state.
- `CalculatorModeSwitch` receives the active mode and a callback; its selected state is keyboard accessible.

- [ ] Update every `Input` consumer (the current investigation found only `App.tsx`) to use the controlled props.
- [ ] Keep the Original row layout and add behavior while moving calculated summary values to `calculateSummary`.
- [ ] Add the labeled Original/Modern toggle state without unmounting or resetting the shared course list.
- [ ] Run `npm run build` and `npm run lint` to catch type and component integration errors.

### Task 3: Add the Modern layout

**Files:**
- Create: `src/components/ModernCalculator.tsx`
- Modify: `src/App.tsx`
- Modify: `README.md`

**Interfaces:**
- `ModernCalculator` receives shared courses, summary values, theme state, and add/delete/clear/demo callbacks.
- Modern course form draft defaults to grade 1.00 and 3 units; only Add Subject commits it to the shared list.
- Clear All restores the Original starter row; Demo Data appends sample named courses.

- [ ] Add the reference-style GWA summary with course count, units, points, and the qualifying standing label.
- [ ] Add the optional subject field, valid grade and unit steppers, Add Subject action, and responsive saved-course list with deletion.
- [ ] Implement Demo Data and Clear All against the shared course state.
- [ ] Apply the existing light/dark theme to Modern mode and keep the layout usable at mobile widths.
- [ ] Update the README with the two modes and existing scholarship rules.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`.

### Task 4: Final review

**Files:**
- Review: all files changed for `MODE1026`.

- [ ] Confirm all `AC-MODE1026-*` criteria have an implementation location and test coverage or a documented manual UI check.
- [ ] Review the diff for changes to unrelated files; preserve the pre-existing `AdminPage.tsx` edit.
- [ ] Re-run `npm test`, `npm run lint`, and `npm run build` after any review fixes.
