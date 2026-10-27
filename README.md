# GWA Calculator

A grade average calculator with Original and Modern layouts. Switch layouts at
any time; both use the same courses and calculated standing.

## Layouts

- **Original** keeps the grade and unit dropdown rows.
- **Modern** adds optional subject names, grade and unit controls, a course
  summary, demo courses, and a saved-course list.
- The theme switch works in both layouts. Academic Scholarship entries stay in
  browser memory until the page is refreshed.
- Modern lets you switch between Academic Scholarship and Latin Honors
  computations; Original keeps the existing Academic Scholarship calculator.
  Course units can be entered from 1 to 99.
- When a scholarship standing qualifies, Modern highlights the award and lets
  you download a share card or share your result. Downloading the card opens a
  congratulatory modal.

## GWA and academic standing

The calculator uses `sum(grade × units) / sum(units)` and displays the GWA to
four decimal places. Academic standing is shown when the total exceeds 10 units:

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

## Admin visitor analytics

The admin analytics panel shows all-time visit totals and a daily line chart
for visits and unique visitors. Filter the chart to the last week, the last 30
days, or an inclusive custom date range. The busiest date is called out above
the chart; missing daily records appear as zero. Unique visitor values in the
chart are per-day counts, so the same person may be counted on more than one
day in a selected range.

## Development

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```
