# “What grades do I need?” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a modal-based what-if grade planner to Academic Scholarship and Latin Honors in Modern mode.

**Architecture:** Put the shared weighted-average, target, and balanced-suggestion logic in a small pure module that reuses the current scholarship and Latin Honor classifiers. A shared modal accepts the current mode and course list; each result card provides a small trigger and planned courses stay separate from saved course state.

**Tech Stack:** React 18, TypeScript, existing `.mjs` calculator modules, Tailwind utility classes, React Icons.

**Spec:** `docs/superpowers/specs/2026-10-28-what-grades-needed-design.md`

## Global Constraints

- Keep all planner controls and results inside a modal; add only one small trigger to each result card.
- Use existing grade scales, GWA thresholds, course filters, and the Academic Scholarship 9-unit minimum.
- Keep planner entries temporary and separate from saved courses.
- Add no dependencies.
- Keep the forecast labeled as an estimate, not an official eligibility result.

## Review Focus

- Latin Honor courses excluded from GWA must not affect the planner’s current points or units.
- Academic Scholarship status must respect strict thresholds and the 9-unit minimum.
- A target that cannot be reached with 1.00 planned grades must report that state and the best possible projected GWA.
- Different unit counts must affect projected GWA by weighted points, not by averaging course grades.
- Empty planned rows and invalid unit values must not produce `NaN` or mutate saved records.

## Files

- Create `src/gradeGoalPlanner.mjs` and `src/gradeGoalPlanner.d.mts` for target options, required-average calculation, balanced grade suggestions, and projections.
- Create `src/components/GradeGoalPlannerModal.tsx` for the shared accessible modal and planned-course controls.
- Modify `src/components/ModernCalculator.tsx` to open the modal for Academic Scholarship and pass its existing courses.
- Modify `src/components/LatinHonorsCalculator.tsx` to open the modal for Latin Honors and pass its existing courses.

## Tasks

### Task 1: Add pure planner calculations

**Files:** Create `src/gradeGoalPlanner.mjs`, `src/gradeGoalPlanner.d.mts`.

**Interfaces:**

- `GradePlanMode = "academic" | "latin-honors"`.
- `GradePlanCourse = { grades: number; units: number; includeInLatinHonors?: boolean }`.
- `GradePlanTarget = { id: string; label: string; cutoff: number; strict: boolean }`.
- `GradePlanResult = { target: GradePlanTarget; currentUnits: number; currentPoints: number; currentGwa: number; plannedUnits: number; requiredAverage: number | null; suggestedGrade: number | null; projectedUnits: number; projectedPoints: number; projectedGwa: number; projectedStanding: string; targetMet: boolean; status: "ready" | "no-planned-courses" | "minimum-units-not-met" | "unreachable"; bestCaseGwa: number | null }`.
- `getGradePlanTargets(mode: GradePlanMode): GradePlanTarget[]` returns IDs, labels, and existing GWA boundaries.
- `calculateGradePlan(mode: GradePlanMode, currentCourses: readonly GradePlanCourse[], plannedCourses: readonly GradePlanCourse[], targetId: string): GradePlanResult` returns the estimate and the highest non-failing grade that meets the target when assigned evenly to all planned subjects. A better classification counts as meeting the chosen target.
- Planned-course IDs and names are owned by the modal UI; the calculation module only receives grades, units, and optional Latin inclusion flags. Planned data is never added to current course arrays.

- [x] Implement Academic and Latin target lists from the existing calculator thresholds.
- [x] Filter current courses using the same inclusion and unit rules as each calculator.
- [x] Calculate required weighted average from exact grade points and planned units; use existing classification helpers for strict GWA boundaries. Apply Academic's 9-unit rule separately to projected target status because grades cannot replace missing units.
- [x] Count a stronger standing/honor as meeting a less restrictive selected target while displaying the strongest projected classification.
- [x] Compute projected GWA and target status from planned grade values, and return the all-1.00 best case when the selected target cannot be reached.
- [x] Add TypeScript declarations for the module’s input and output types.

### Task 2: Build and integrate the shared modal

**Files:** Create `src/components/GradeGoalPlannerModal.tsx`; modify `src/components/ModernCalculator.tsx` and `src/components/LatinHonorsCalculator.tsx`.

**Interfaces:** The modal receives `mode`, `isDark`, `currentCourses`, and `onClose`. It owns temporary planned rows, selected target, and per-course grade overrides; it calls `calculateGradePlan` for recommendations and live projections.

- [x] Add target selection and an initially empty list of planned subjects with add/remove, optional name, 1–99 units, and grade selection.
- [x] For Latin Honors, add an include checkbox per planned course; default it on and explain PE stays included while NSTP can be excluded.
- [x] Display a balanced suggested grade per subject; default unmodified grade choices to the suggestion and let students override or restore the suggestion.
- [x] Display required future average, projected GWA, target status, best-case outcome when unreachable, and the Academic Scholarship 9-unit reminder when applicable.
- [x] Match existing light/dark modal styling and support Escape, focus management, and returning focus to the trigger.
- [x] Add one “What grades do I need?” action at the bottom of each result card and render the shared modal for its mode.
- [x] Confirm the modal never calls course update handlers or writes planned rows into localStorage/save-copy data.

### Task 3: Verify and review

**Files:** No additional files.

- [x] Run `npx eslint src/gradeGoalPlanner.mjs src/components/GradeGoalPlannerModal.tsx src/components/ModernCalculator.tsx src/components/LatinHonorsCalculator.tsx --max-warnings 0`.
- [x] Run `npm run build` and resolve TypeScript or build errors.
- [x] Review the diff against the design for target boundaries, empty plans, unreachable goals, accessibility, and separation from saved data.

Automated tests are omitted for this plan because the higher-priority tool policy says not to add or run tests unless the user asks for testing or verification.

## Execution Choice

Use native inline implementation in this session, matching the user’s previously selected execution preference. Keep changes in the approved project checkout; do not commit unless the user asks.
