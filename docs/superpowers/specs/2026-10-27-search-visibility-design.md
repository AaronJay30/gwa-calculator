# Search Visibility Design

## Intent

Improve GCalc's eligibility and relevance for searches such as “GWA
calculator” and “GWA calculator Philippines” by describing the existing
calculator accurately and adding useful, crawlable supporting content.

## Current state

- The live page is indexed, but its result title is “GCalc” and its page is a
  JavaScript-rendered calculator shell.
- The site is deployed as a Vite static project on GitHub Pages at
  `https://aaronjay30.github.io/gwa-calculator/`.
- There is no sitemap or search-focused guide page.
- The app supports unit-weighted GWA, Academic Scholarship standing, and
  estimated Latin Honors tracking; official academic policies vary by school.

## Goals

- Add a concise, descriptive title, search snippet, canonical URL, and social
  metadata to the calculator page.
- Add one static, responsive guide explaining the GWA formula with a verified
  worked example and school-policy caveat.
- Add a sitemap containing only the calculator and guide URLs.
- Add a normal HTML link between the calculator and guide.
- Preserve the calculator's existing workflow and avoid new dependencies.

## Non-goals

- Guarantee a first-page ranking or promise a ranking timeline.
- Invent student ratings, school eligibility rules, or official CLSU policies.
- Add a server-rendering framework to the existing static app.
- Submit Search Console verification or indexing requests without the owner's
  Search Console access.

## Approaches

1. **Metadata only.** Low effort, but adds little topical content beyond the
   calculator controls.
2. **Metadata plus a static GWA guide — selected.** Keeps the calculator
   unchanged, gives search crawlers useful HTML without waiting for React, and
   creates a second relevant URL for the sitemap. This fits GitHub Pages.
3. **Server-render or pre-render the full React app.** Could improve the HTML
   available to more crawlers, but requires added build complexity and is not
   necessary for a focused first improvement.

The user asked to improve search visibility and delegated SEO judgment. The
balanced static-guide approach is the implementation choice.

## Content rules

- Explain `GWA = sum(grade × units) / sum(included units)`.
- Use a small arithmetic example that matches the formula.
- State that only courses included by the student's school policy should be
  counted.
- Describe Scholarship and Latin Honors features as estimates; direct students
  to their institution's current handbook or registrar for official rules.
- Do not add fake review/rating markup or keyword-stuffed copy.

## Acceptance criteria

- **AC-SEO1027-F1**: The calculator HTML has a descriptive title, meta
  description, canonical URL, and Open Graph metadata for the public URL.
- **AC-SEO1027-F2**: The guide is a standalone HTML page with unique metadata,
  semantic headings, useful GWA instructions, and an accurate worked example.
- **AC-SEO1027-F3**: The calculator links to the guide and the guide links back
  to the calculator with crawlable anchor links.
- **AC-SEO1027-F4**: `sitemap.xml` lists the absolute URLs for the calculator and
  guide under the GitHub Pages project path.
- **AC-SEO1027-F5**: No calculator features, academic thresholds, ratings, or
  Firebase behavior are changed.

## Change surface

- `index.html`: calculator metadata and project-base-aware favicon.
- `src/App.tsx`: visible guide link.
- `public/how-to-compute-gwa/index.html`: static guide page.
- `public/sitemap.xml`: absolute canonical URLs.
- `README.md`: concise deployment/Search Console note.
