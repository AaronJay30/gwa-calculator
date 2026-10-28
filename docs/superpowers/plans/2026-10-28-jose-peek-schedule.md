# Scheduled Jose Peek Implementation Plan

> **For agentic workers:** Use the native implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin schedule a one-time 30-second repeated Jose peek for all visitors.

**Architecture:** Store the scheduled timestamp in one Firestore settings document and expose a subscription plus schedule/clear helpers. A small app-level component listens for the event, triggers the local animation once per browser, and leaves visitor data out of Firestore.

**Tech Stack:** React 18, TypeScript, Firebase Firestore, existing CSS animation and Tailwind styles.

**Spec:** `docs/superpowers/specs/2026-10-28-jose-peek-schedule-design.md`

## Global Constraints

- Use one Firestore document at `siteSettings/josePeek` for schedule state.
- Perform no Firestore writes from visitor clients.
- Smoothly rise higher to random heights, hold for 2–3 seconds, hide for 3–5 seconds, and repeat within a 30-second run that includes all waits; play once per browser, including if the visitor opens the page after the scheduled time.
- Respect `prefers-reduced-motion` and do not block clicks on existing floating controls.
- Add no dependencies.

## Review Focus

- Invalid or past schedule input must not be saved.
- Visitors with the page open before the schedule and visitors arriving afterward must each see the event once.
- Clearing a future schedule must stop it from appearing.
- Storage or Firestore errors must not claim a schedule was saved.
- The image must not intercept clicks or obscure the FAQ/chat controls.
- Reduced-motion users must not receive the movement animation.

## Tasks

### Task 1: Firestore schedule service

**Files:** Create `src/firebase/josePeekService.ts`.

- [x] Add a typed listener for `siteSettings/josePeek` that returns the scheduled timestamp or `null` and surfaces Firestore errors.
- [x] Add schedule and clear helpers that update only that document and use server timestamps for `updatedAt`.
- [x] Validate timestamps before writing; do not allow a past schedule.

### Task 2: Visitor peek behavior

**Files:** Create `src/components/ScheduledJosePeek.tsx`; modify `src/App.css`.

- [x] Subscribe to the schedule and trigger for future timestamps with a timeout; trigger immediately for past timestamps not yet seen in this browser.
- [x] Use a timestamp-keyed localStorage marker to keep each event to one playback per browser without any visitor Firestore writes.
- [x] Load `public/jose.png` using the Vite base URL. Smoothly animate higher random-height peeks with 2–3 second holds and 3–5 second hidden gaps for 30 seconds total.
- [x] Keep the visual pointer-transparent and above modals; add a reduced-motion static-peek treatment.

### Task 3: Admin scheduling UI and app integration

**Files:** Modify `src/components/AdminPage.tsx` and `src/App.tsx`.

- [x] Add a schedule section after admin authentication, with a local date/time field, schedule button, displayed schedule, clear action, and a Firebase action to show the peek for everyone now.
- [x] Load the saved schedule after admin unlock; show actionable feedback for permission or network errors.
- [x] Mount the visitor peek component once at the app root.
- [x] Keep controls compatible with light and dark themes and keyboard use.

### Task 4: Verify and review

- [x] Run targeted ESLint on changed TypeScript files and `npm run build`.
- [x] Review Firestore call sites to confirm visitors only subscribe/read and the Admin writes only on schedule/clear.
- [x] Review reduced-motion, late-visitor, pending cancellation, and one-play-per-browser behavior.

Automated tests are omitted because the higher-priority tool policy says not to add or run tests unless the user asks for testing or verification.
