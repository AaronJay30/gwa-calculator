# Search Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen GCalc's search presentation and add crawlable GWA guidance without changing calculator behavior.

**Architecture:** Keep the calculator as a Vite React app, add SEO metadata to its HTML shell, publish one independent static guide under `public/`, link both pages, and list them in a static sitemap.

**Tech Stack:** Vite, React, static HTML/XML. No new dependency.

**Spec:** `docs/superpowers/specs/2026-10-27-search-visibility-design.md`

## Global Constraints

- The canonical calculator URL is `https://aaronjay30.github.io/gwa-calculator/`.
- The static guide URL is `https://aaronjay30.github.io/gwa-calculator/how-to-compute-gwa/`.
- Do not invent school rules, ratings, or testimonials.
- Do not promise a Google position or indexing date.
- Keep the app deployable to GitHub Pages with Vite's `/gwa-calculator` base.

## Review Focus

- Canonical URLs: the app and guide must use their exact deployed paths.
- Formula example: points and units must divide to the displayed GWA.
- Static hosting: guide and sitemap must copy from `public/` to the expected paths.
- Mobile guide: headings and table remain readable at narrow widths.
- Calculator behavior: only a small guide link is added; computation and mode state remain unchanged.

---

### Task 1: Search metadata and discoverability

**Files:**
- Modify: `index.html`
- Modify: `src/App.tsx`
- Create: `public/sitemap.xml`

- [x] Set a descriptive title, meta description, canonical, Open Graph fields, and base-aware favicon.
- [x] Add a visible link from the calculator to the guide URL.
- [x] Add absolute calculator and guide URLs to the sitemap.

### Task 2: Static GWA guide

**Files:**
- Create: `public/how-to-compute-gwa/index.html`
- Modify: `README.md`

- [x] Write the GWA formula and worked example using accurate arithmetic.
- [x] Explain how to use the calculator and include cautious academic-policy wording.
- [x] Add unique metadata and a link back to the calculator.
- [x] Document that the owner must verify the site in Search Console and submit the sitemap.

### Task 3: Verification

- [x] Run `npm run build` and inspect the generated guide and sitemap paths.
- [x] Run targeted lint and `git diff --check`.
- [x] Review that no calculation or award threshold code changed.
