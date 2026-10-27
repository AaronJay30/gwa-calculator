# GA4 Visitor Analytics Design

## Intent

Move new website traffic measurement to Google Analytics 4 so routine page
visits no longer write to Firestore, while keeping Firestore chat and retaining
the existing aggregate visitor totals as a historical baseline.

## Goals

- Load the GA4 web tag only in production when `VITE_GA_MEASUREMENT_ID` is set.
- Remove the page-load Firestore visitor write path.
- Keep the admin password gate, show the last saved Firestore totals as a
  clearly labeled legacy baseline, and link to the GA4 dashboard for new data.
- Keep Firebase chat collection and behavior unchanged.
- Explain the one-time GA4 setup and the historical-data boundary in the README.

## Non-goals

- Querying GA4 reports from the static site. That requires a secure server-side
  Data API connection and credential management.
- Replaying old aggregate visits into GA4 as if they were real user sessions.
- Deleting existing `visits`, `dailyStats`, or `siteStats` Firestore data.

## Approaches

1. **GA4 web tag with dashboard link — selected.** Add the public Measurement
   ID through a Vite environment variable, let GA4 collect new traffic, and link
   admins to its report UI. This fits the existing static GitHub Pages hosting
   and needs no new dependency or server.
2. **Keep Firestore analytics and optimize writes.** This retains the existing
   chart, but still spends Firestore quota on routine visits and does not provide
   GA4 acquisition and engagement reports.
3. **GA4 tag plus a server-side GA Data API proxy.** This could embed GA4 charts
   in the admin page, but adds a deployed service and protected credentials,
   outside the current static app setup.

## Behavior and constraints

- GA4 sends its standard page-view event when the tag is configured.
- Do not initialize tracking in development; this avoids polluting published
  traffic reports with local work.
- The Measurement ID is public configuration, not a secret. The tag is absent
  when the ID is missing or malformed.
- Firestore analytics writes are removed from the app. Admin may make a single
  read of `siteStats/global` after password entry to show the frozen baseline.
- `siteStats/global` and `dailyStats` remain untouched. The `visits` marker
  collection can be deleted manually later without removing aggregate totals.
- GA4 starts a new reporting history after it is configured. Historical
  aggregate Firestore values remain separate and are not presented as GA4 data.
- Firebase remains configured for chat messaging.

## Acceptance criteria

- **AC-GA4-MIGRATION-F1**: A production build with a valid `G-...` ID loads one
  GA4 tag; missing or malformed IDs load none.
- **AC-GA4-MIGRATION-F2**: Normal app visits no longer call Firestore visitor
  write APIs or recreate visit marker documents.
- **AC-GA4-MIGRATION-F3**: The authenticated admin panel labels prior Firestore
  totals as a legacy baseline, shows their last update time when available, and
  links to the GA4 dashboard.
- **AC-GA4-MIGRATION-F4**: Firebase chat code and behavior remain unchanged.
- **AC-GA4-MIGRATION-F5**: README explains the Measurement ID setup, where to
  view GA4 reports, and the distinction between the frozen baseline and new
  GA4 data.

## Change surface

- `src/googleAnalytics.ts`: optional production-only GA4 tag initialization.
- `src/App.tsx`: initialize GA4 and remove Firestore page-visit recording.
- `src/firebase/visitorService.ts`: retain legacy aggregate reads and remove
  visitor write functions.
- `src/components/AdminPage.tsx`: replace live Firestore charts with the
  read-only baseline and GA4 dashboard link.
- `src/vite-env.d.ts`, `.env.example`, and `README.md`: configuration and usage.
