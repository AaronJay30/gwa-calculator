# Latin Honor Emphasis and Downloads

## Intent

Make the Latin Honors result and the existing per-semester scholarship result
clearer to read and easier to save or share. Students can download an image of
their overall Latin Honor and export a complete year-and-semester record as
either PDF or Excel.

## Goals

- Emphasize Summa Cum Laude, Magna Cum Laude, and Cum Laude with the existing
  gold accent and a restrained entrance animation that respects reduced-motion
  settings.
- Show the per-semester University Scholar, College Scholar, or Dean's Lister
  standing as a compact badge matching the Academic Scholarship result style.
- Download the overall Latin Honor result as a PNG card using the existing
  result-card colors and visual language.
- Offer PDF and Excel downloads from the Latin Honors Summary.
- Group the exports by academic year and populated semester; show each saved
  course's grade, units, points, and whether it counts toward Latin Honors.
- Show each semester's GWA and Academic Scholarship standing in both exports.
- Generate every file locally from the saved browser data; do not send grades to
  a server.

## Non-goals and limits

- Do not add share actions or celebratory confetti to the Latin Honors result.
- Do not change the existing honor or scholarship thresholds.
- The Latin Honor remains a GWA estimate and must retain its eligibility caveat.
- The detailed exports include excluded courses for record-keeping, clearly
  labeled as excluded; those courses do not affect Latin Honors calculations.

## Approaches

1. **PNG-only exports.** Reuse the current SVG-to-PNG result card for both the
   main award and the full academic history. Rejected because a long history
   becomes a tall, hard-to-read image and is not editable in Excel.
2. **PNG result card plus PDF and Excel workbook.** Keep the current PNG export
   flow for the overall award, and use browser-side PDF and workbook libraries
   for a paginated report and a two-sheet `.xlsx` file. Chosen because the main
   result remains shareable while the detailed record is readable and useful
   in spreadsheets.
3. **Print-to-PDF and CSV.** Avoid document-generation libraries but require a
   print dialog and provide a plain CSV instead of a formatted Excel workbook.
   Rejected because the requested downloads should be direct and offer both
   formats.

## Design and behavior

- The overall result presents the Latin Honor in a prominent gold-accented
  badge. Its appearance animation is brief and does not move surrounding
  content. Reduced-motion settings disable the animation.
- The selected semester's scholarship standing appears in a compact badge,
  consistent with the Academic Scholarship result card.
- A Download button saves a 1200-by-630 PNG containing the honor, four-decimal
  GWA, and course, unit, and point totals. The control is unavailable when no
  Latin Honor range is reached or there are no counted units.
- The Summary modal offers **Download PDF** and **Download Excel** controls.
- The PDF is a styled, multi-page report. It begins with the cumulative Latin
  Honor and GWA, then lists each populated year and semester, the semester GWA
  and scholarship standing badge, and the full course table.
- The `.xlsx` workbook has a semester-summary sheet and a course-details
  sheet. The summary sheet has one row per populated semester, including its
  GWA and scholarship standing. The course sheet has every saved grade,
  academic year, semester, unit count, points, and inclusion status.
- Semester GWA, totals, and scholarship standing use the same included courses
  as the current per-semester computation. Excluded courses remain visible in
  the detailed record, marked excluded.
- PDF and workbook code load only when the user requests an export. Export
  failures keep the modal open and show a readable error message.

## Acceptance criteria

- A Latin Honor result is visually emphasized in both the page and PNG card,
  while screen readers can read the same honor label without relying on motion.
- The mini semester view shows the same scholarship badge style as the main
  Academic Scholarship result.
- PNG download includes the current cumulative result and the existing theme.
- PDF and Excel downloads include every saved course exactly once, grouped by
  year and semester, with inclusion state and semester scholarship standing.
- Empty or invalid stored data produces a usable empty summary and no misleading
  honor download.
- Export generation errors are reported without erasing saved grades.
