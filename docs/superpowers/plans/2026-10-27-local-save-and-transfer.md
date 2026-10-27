# Local Save and Course Transfer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve calculator courses and mode preferences locally, provide a portable full course backup, and copy Academic Scholarship courses into a chosen Latin Honors period.

**Architecture:** Keep both course lists in shared React state and persist them in one versioned localStorage record. Keep layout and computation preferences in a separate localStorage record. A validated JSON backup contains both course lists; import confirms before replacing them. A Latin Honors helper copies complete scholarship courses and tracks source IDs so a repeated transfer updates those entries.

**Tech Stack:** React 18, TypeScript, native localStorage and File APIs, existing Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-local-save-and-transfer-design.md`

## Global Constraints

- Course grades remain in browser localStorage and are not sent to the app's servers.
- Backup import supports only its declared format/version and rejects malformed course data as a whole.
- Import replaces both course lists only after the user confirms.
- Existing Latin Honors data under `gwa-calculator:latin-honors:v1` is migrated when the new shared save is absent.
- No cloud sync, account, or new dependency.

## Review Focus

- Malformed or unsupported backup: reject without changing either course list (Task 1 tests).
- Existing Latin Honors browser data with no shared save: restore and migrate it (Task 1 tests).
- Blank Academic Scholarship rows with zero units: preserve them locally but exclude them from transfer (Tasks 1 and 3 tests).
- Repeated course transfer to one year/semester: update its linked copy and preserve any Latin Honors exclusion choice (Task 3 tests).
- Browser storage read/write failures: retain current session state and display the storage limitation (Task 2 manual verification).

---

### Task 1: Save data, backup format, and transfer rules

**Files:**
- Create: `src/calculatorSave.mjs`
- Create: `src/calculatorSave.d.mts`
- Modify: `src/latinHonors.mjs`
- Modify: `src/latinHonors.d.mts`
- Test: `tests/calculatorSave.test.mjs`
- Test: `tests/latinHonors.test.mjs`

**Interfaces:**
- `parseScholarshipCourses(value)` returns valid `GWA[]` records, including zero-unit draft rows.
- `createCourseBackup({ scholarshipCourses, latinHonorsCourses })` returns a version-1 JSON string.
- `parseCourseBackup(text)` returns both validated course arrays or throws a readable validation error.
- `loadCalculatorData(storage)` returns `{ scholarshipCourses, latinHonorsCourses }` from the shared save or migrates the existing Latin Honors key.
- `loadCalculatorPreferences(storage)` returns a validated `{ mode, computationMode }`, defaulting to Original/Academic Scholarship.
- `transferScholarshipCourses(scholarshipCourses, latinHonorsCourses, year, term)` returns `{ courses, addedCount, updatedCount, skippedCount }`. Add optional `sourceScholarshipCourseId` to linked Latin courses; preserve the Latin Honors include/exclude choice when updating a linked course.

- [x] **Step 1: Write failing tests for scholarship parsing, backup round trips/rejection, storage migration, and mode preference parsing.** Verify zero-unit drafts are preserved, unsupported versions and partial-invalid files are rejected, and legacy Latin courses migrate.
- [x] **Step 2: Run `npm test -- tests/calculatorSave.test.mjs` and confirm the new tests fail because the save helpers are missing.**
- [x] **Step 3: Implement the save and preference helpers in `src/calculatorSave.mjs` and declare their types in `src/calculatorSave.d.mts`.**
- [x] **Step 4: Run `npm test -- tests/calculatorSave.test.mjs` and confirm the tests pass.**
- [x] **Step 5: Write failing tests for transfer copying, incomplete-course skipping, collision-free IDs, idempotent updates, and preservation of a linked course's Latin Honors include/exclude choice.**
- [x] **Step 6: Run `npm test -- tests/latinHonors.test.mjs` and confirm the transfer tests fail for the missing helper.**
- [x] **Step 7: Implement `transferScholarshipCourses` in `src/latinHonors.mjs` and its type declaration; extend Latin course parsing for the optional source ID.**
- [x] **Step 8: Run `npm test -- tests/latinHonors.test.mjs` and confirm all Latin Honors tests pass.**

### Task 2: Local autosave, mode restore, and portable backup controls

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/LatinHonorsCalculator.tsx`
- Create: `src/components/SaveCopyControls.tsx`
- Modify: `README.md` (if it documents calculator usage)

**Interfaces:**
- App owns scholarship courses, Latin Honors courses, layout mode, computation mode, and the active Latin Honors period.
- `LatinHonorsCalculator` receives its courses and active period through props and reports edits through callbacks.
- `SaveCopyControls` receives both course arrays, storage status, and an import callback; it downloads a JSON backup and confirms before a valid import replaces both lists.

- [x] **Step 1: Wire both course arrays and both mode preferences to the tested storage helpers in `App.tsx`; update `LatinHonorsCalculator` to accept controlled course/period props and remove its component-owned localStorage effect.**
- [x] **Step 2: Run `npm run build` and `npm run lint`; confirm the controlled-state integration type-checks and lints before adding the UI.**
- [x] **Step 3: Add the low-profile privacy notice, Save copy and Import copy controls, whole-file validation, replacement confirmation, and user-facing error/status messages in `SaveCopyControls.tsx`.**
- [x] **Step 4: Run `npm run build` and `npm run lint`; fix any errors before proceeding.**
- [x] **Step 5: Update the README with local save behavior, backup restore behavior, and the transfer flow.**

### Task 3: Scholarship-to-Latin-Honors transfer flow

**Files:**
- Modify: `src/components/ModernCalculator.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/LatinHonorsCalculator.tsx`

- [x] **Step 1: Add a transfer dialog beside Academic Scholarship's added courses, with year 1–10 and First/Mid/Second Sem choices; disable transfer when no complete scholarship courses exist.**
- [x] **Step 2: Connect the dialog to the transfer helper, persist the resulting Latin Honors list, switch to Latin Honors, and open it at the selected year and semester.**
- [x] **Step 3: Run `npm test`, `npm run lint`, and `npm run build`; confirm the full project checks pass.**
- [x] **Step 4: Review the final diff and acceptance criteria. In the local browser, verify refresh restores the selected Modern/Latin Honors modes and saved result, and confirm transfer is disabled when there are no completed scholarship courses. Automated tests cover transfer, backup parsing/replacement validation, and repeated-transfer behavior.**

**Verification note:** Interactive transfer and import were not triggered against the existing browser profile because it contains saved course data and a separate local browser session could not connect to the development server. This kept the existing grades untouched; automated checks cover transfer rules and backup parsing/rejection.

## Execution Notes

- The user already selected the native implementation approach for this project.
- Do not commit or publish unless the user asks.
