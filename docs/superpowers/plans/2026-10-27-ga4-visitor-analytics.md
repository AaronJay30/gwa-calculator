# GA4 Visitor Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move new traffic tracking from Firestore to GA4 while preserving the existing Firestore totals as a read-only historical baseline and leaving Firebase chat unchanged.

**Architecture:** Add a small production-only GA4 tag loader configured by the public Vite Measurement ID. Remove visitor writes from the app, keep only the aggregate stats read needed for a legacy baseline in admin, and link the admin panel to GA4’s report UI.

**Tech Stack:** React 18, TypeScript, Vite, Firebase Firestore, Google Analytics gtag.js. No new package.

**Spec:** `docs/superpowers/specs/2026-10-27-ga4-visitor-analytics-design.md`

## Global Constraints

- Do not initialize GA4 outside production.
- Do not load GA4 when the Measurement ID is missing or malformed.
- Do not delete historical `siteStats`, `dailyStats`, or `visits` data.
- Keep Firebase chat unchanged.
- Do not import old aggregate counts into GA4 as user or session data.
- Do not add a server-side GA4 Data API integration.

## Review Focus

- Missing or malformed Measurement ID: tracking is not loaded.
- React StrictMode or repeated initialization: only one tag/config is installed.
- Old sessions after deployment: the new code has no Firestore visitor write path.
- Missing legacy stats document or timestamp: admin still renders a clear zero/unknown state.
- Chat: its Firestore subscription and send operation remain untouched.

---

### Task 1: Optional GA4 tag and disable visitor writes

**Files:**
- Create: `src/googleAnalytics.ts`
- Modify: `src/App.tsx`
- Modify: `src/vite-env.d.ts`
- Modify: `.env.example`
- Modify: `src/firebase/visitorService.ts`

**Interfaces:**
- `initializeGoogleAnalytics(): void` reads `VITE_GA_MEASUREMENT_ID` and is safe to call more than once.
- `fetchGlobalStats(): Promise<VisitorStats>` remains a read-only fetch for the legacy baseline.

- [x] Add the optional environment type and documented placeholder.
- [x] Add guarded, deduplicated production GA4 initialization.
- [x] Replace `recordVisit()` with GA4 initialization and remove the Firestore visitor writer.
- [x] Confirm by source inspection that no application path calls Firestore visitor writes.

### Task 2: Admin baseline and GA4 navigation

**Files:**
- Modify: `src/components/AdminPage.tsx`
- Modify: `src/firebase/visitorService.ts`

**Interfaces:**
- The password gate remains unchanged.
- After authentication, admin sees the legacy totals, their last update time when available, GA4 setup state, and a link to the GA4 dashboard.

- [x] Remove chart, date filter, and daily-query state from the admin screen.
- [x] Read the aggregate baseline once after authentication and label it as pre-GA4 data.
- [x] Add a GA4 dashboard link and a missing-ID setup message.

### Task 3: Documentation and verification

**Files:**
- Modify: `README.md`

- [x] Document GA4 setup, report location, supported report categories, and the frozen historical baseline.
- [x] Run targeted lint, `npm run build`, and `git diff --check`.
- [x] Review the final diff and confirm chat service files are unchanged.
