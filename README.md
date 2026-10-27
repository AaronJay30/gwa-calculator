# GWA Calculator

A grade average calculator with Original and Modern layouts. Switch layouts at
any time; both use the same courses and calculated standing.

## Layouts

- **Original** keeps the grade and unit dropdown rows.
- **Modern** adds optional subject names, grade and unit controls, a course
  summary, demo courses, and a saved-course list.
- The theme switch works in both layouts. Course entries, the selected layout,
  and the selected computation type are saved in this browser on this device.
- Modern lets you switch between Academic Scholarship and Latin Honors
  computations; Original keeps the existing Academic Scholarship calculator.
  Course units can be entered from 1 to 99.
- When a scholarship standing qualifies, Modern highlights the award and lets
  you download a share card or share your result. Downloading the card opens a
  congratulatory modal.

## GWA and academic standing

The calculator uses `sum(grade × units) / sum(units)` and displays the GWA to
four decimal places. Academic standing is shown when the total reaches 9 units:

- University Scholar: GWA 1.50 or lower
- College Scholar: GWA 1.51–1.75
- Dean's Lister: GWA 1.76–2.00

## Latin Honors estimate

Latin Honors courses are organized by year (First through Tenth) and term
(First Sem, Mid Sem, or Second Sem). Each selected period has its own GWA and
scholarship summary. The cumulative GWA combines the weighted points and units
from all included courses. Entries can be excluded from the GWA, such as PE or
NSTP, and are saved in this browser's local storage. Use the grade stepper to
choose grades and open Summary to review saved courses in collapsible year and
semester sections. A qualifying cumulative honor can be downloaded as a PNG
result card. The Summary modal also downloads a paginated PDF or an Excel
workbook with `Semester Summary` and `Course Details` sheets. Both detailed
exports list every saved course, show whether it counts toward Latin Honors,
and include the Academic Scholarship standing for each semester.

The displayed GWA ranges are estimates based on the values supplied for the
calculator: Summa Cum Laude up to 1.20, Magna Cum Laude up to 1.45, and Cum
Laude up to 1.75. Official CLSU eligibility may include additional rules.

## Save and transfer grades

Academic Scholarship and Latin Honors course entries are automatically saved
in this browser on this device. Course grades are not sent to the app's servers.
Use **Save copy** to download a JSON backup containing both course lists, then
use **Import copy** on another device to restore it. Importing replaces the
current course lists only after confirmation. The selected layout and
computation type are remembered locally but are not included in the backup.

In Modern Academic Scholarship, choose **Transfer to Latin Honors** to copy
completed courses into a selected year and semester. The scholarship entries
stay in place; transferring the same courses to the same period again updates
their copies instead of duplicating them.

## Visitor analytics

New website traffic is measured by Google Analytics 4 (GA4), so normal page
visits no longer write to Firestore. To connect it, create a GA4 property and
web data stream, copy its `G-...` Measurement ID, and add it as
`VITE_GA_MEASUREMENT_ID` to the environment used for the production build. The
GA4 tag runs only in production. Reports are available from the authenticated
admin panel's **Open GA4** button or at [Google Analytics](https://analytics.google.com/analytics/web/).

GA4 provides page views, active and new users, engagement, traffic sources,
and device reports. Demographic details depend on Google Signals, user consent,
and minimum-data privacy thresholds, so they may not appear for every visitor
or date range.

The admin panel keeps the old Firestore visit and unique-visitor counts as a
read-only historical baseline with its last recorded time. Those counts are
not added to GA4; GA4 starts collecting new data after it is configured and
deployed. The old `siteStats` and `dailyStats` data stay in Firestore unless
deleted manually. The `visits` marker collection can be deleted separately
without deleting the aggregate totals. Firebase continues to store chat
messages.

## Search visibility

The calculator page has a canonical URL and descriptive search/social metadata.
The standalone guide at `public/how-to-compute-gwa/index.html` provides a
static, crawlable explanation of the GWA formula, and `public/sitemap.xml`
lists both public pages. After deployment, verify the GitHub Pages URL in
Google Search Console and submit
`https://aaronjay30.github.io/gwa-calculator/sitemap.xml`. A sitemap helps
Google discover URLs but does not guarantee indexing or a particular ranking.

## Development

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```
