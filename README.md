# GWA Calculator

A grade average calculator with Original and Modern layouts. Switch layouts at
any time; both use the same courses and calculated standing.

## Layouts

- **Original** keeps the grade and unit dropdown rows.
- **Modern** adds optional subject names, grade and unit controls, a course
  summary, demo courses, and a saved-course list.
- The theme switch works in both layouts. Modern course entries are kept in
  browser memory until the page is refreshed.
- When a scholarship standing qualifies, Modern highlights the award and lets
  you download a share card or share your result. Downloading the card opens a
  congratulatory modal.

## GWA and academic standing

The calculator uses `sum(grade × units) / sum(units)` and displays the GWA to
four decimal places. Academic standing is shown when the total exceeds 10 units:

- University Scholar: GWA 1.50 or lower
- College Scholar: GWA 1.51–1.75
- Dean's Lister: GWA 1.76–2.00

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
