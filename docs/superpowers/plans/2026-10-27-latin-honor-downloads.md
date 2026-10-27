# Latin Honor Emphasis and Downloads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emphasize the Latin Honor and per-semester scholarship standing, and let students download an overall PNG plus a complete year-and-semester record as PDF or Excel.

**Architecture:** Reuse the existing SVG-to-PNG download flow for the overall honor card. Add a pure report-data builder, then separate PDF and `.xlsx` generators that are dynamically imported from the Summary modal so their libraries load only when requested.

**Tech Stack:** React, TypeScript, existing JavaScript helpers, jsPDF, SheetJS CE, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-latin-honor-downloads-design.md`

## Global Constraints

- Preserve the existing Latin Honor and Academic Scholarship thresholds.
- The Latin Honor is a GWA estimate and retains its eligibility caveat.
- Include all saved grades in detailed exports, with excluded courses visibly marked.
- Excluded courses do not affect Latin Honors GWA or per-semester Academic Scholarship computation.
- Generate downloads in the browser from local storage data; never upload grades.
- Keep PDF and Excel code out of the initial bundle until a download is requested.
- Use existing theme colors and support reduced-motion preferences.

## Review Focus

- A non-qualifying or empty overall result must not offer a Latin Honor card download.
- Excluded courses must appear in exports but not affect the GWA, totals, or scholarship indicator.
- Long subjects and many terms must not overlap or disappear across PDF page breaks.
- Workbook sheets must preserve all courses, one row per course, and accurately repeat the correct semester standing.
- Export failure must show an error while preserving saved courses and leaving the modal usable.

---

### Task 1: Report data and honor result card

**Files:**
- Modify: `src/resultCard.mjs` and `src/resultCard.d.mts`
- Create: `src/latinHonorsExports.mjs` and `src/latinHonorsExports.d.mts`
- Modify: `tests/resultCard.test.mjs` and `tests/latinHonors.test.mjs`

**Interfaces:**
- `createLatinHonorResultSvg(summary, isDark)` returns the 1200×630 SVG for a qualifying Latin Honor.
- `getLatinHonorCardFilename(latinHonor, gwa)` returns a safe `.png` filename.
- `buildLatinHonorsExportData(courses)` returns `{ overallSummary, semesterSummaries, courseDetails }`; each populated semester carries its Latin GWA summary, Academic Scholarship summary, and saved course rows including inclusion status and points.

- [x] Add failing tests for the Latin Honor card contents/filename and report grouping, empty periods, and excluded-course handling.
- [x] Run the focused tests and confirm the new behavior is missing.
- [x] Implement the card SVG and pure grouped report data using existing calculation helpers.
- [x] Run focused tests and confirm they pass.

### Task 2: PDF and Excel generators

**Files:**
- Create: `src/latinHonorsPdf.mjs`
- Create: `src/latinHonorsWorkbook.mjs`
- Create: `tests/latinHonorsPdf.test.mjs`
- Create: `tests/latinHonorsWorkbook.test.mjs`
- Modify: `package.json` and `package-lock.json`

**Interfaces:**
- `createLatinHonorsPdf(data)` returns a PDF Blob with the cumulative result and populated year/semester course tables, including each semester's scholarship badge label.
- `createLatinHonorsWorkbook(data)` returns an `.xlsx` Blob with `Semester Summary` and `Course Details` sheets.
- The PDF uses page breaks for long course lists and repeats each period heading after a break.

- [x] Add failing tests for a readable PDF signature/content, page handling, workbook sheet names, and complete term/course rows.
- [x] Add jsPDF and SheetJS CE as production dependencies.
- [x] Implement the PDF and workbook generators with browser download APIs kept in the Summary modal.
- [x] Run focused generator tests and confirm PDF and workbook data match the report builder.

### Task 3: Latin Honors UI and downloads

**Files:**
- Modify: `src/components/LatinHonorsCalculator.tsx`
- Modify: `src/components/LatinHonorsSummaryModal.tsx`
- Modify: `src/App.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Show the overall honor as a gold-accented badge with a brief reduced-motion-aware entrance emphasis.
- Show per-semester University Scholar, College Scholar, or Dean's Lister as a compact theme-aware badge.
- The overall card download uses `createLatinHonorResultSvg`, `createShareResultPng`, and `downloadPngBlob`.
- The Summary modal exposes PDF and Excel download actions, loading state, and a readable error state; disable both detailed exports when there are no saved courses.
- Show the honor download only when a counted GWA has a listed Latin Honor.

- [x] Add failing presentation checks for badges, honor download availability, and both Summary export controls.
- [x] Implement the badge emphasis, card action, and dynamically loaded PDF/Excel actions.
- [x] Verify reduced-motion behavior, light/dark colors, accessible action labels, and export failure feedback.

### Task 4: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: this plan to record completed steps

- [x] Document the PNG, PDF, and Excel exports and where each includes scholarship standing.
- [x] Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.
- [x] Review PDF page breaks, workbook rows, empty-state behavior, and the final diff against the design spec.
