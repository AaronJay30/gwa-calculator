# Calculator Layout Modes

**Feature SLUG:** `MODE1026`

## Intent

Add an Original/Modern layout toggle to the GWA calculator. Modern keeps the reference image's form and course-list structure, but uses the Original layout's colors and responsive width. Both layouts edit the same courses and show the same weighted average and academic standing.

## Goals

- Let users switch between Original and Modern without losing their course entries or result.
- Give Modern mode a compact GWA summary, optional subject name, grade and unit steppers, an add-course action, and an added-courses list.
- Show course count, total units, total grade points, and the qualifying academic standing in Modern mode.
- Preserve the current light/dark theme and the existing scholarship rules.
- Keep Modern at the Original layout's responsive width and visual scale so the alternate layout feels compact.
- Provide the Demo Data and Clear All actions shown in the reference.

## Non-goals

- Changing the GWA formula or scholarship thresholds.
- Saving course data between page visits or sending it to Firebase.
- Replacing or removing Original mode.
- Adding new dependencies.

## Constraints and behavior

- This is a client-side React/Vite app. Course data remains in React state.
- The weighted average remains `sum(grade * units) / sum(units)`, displayed to four decimal places in both modes. The four-decimal value also drives scholarship eligibility.
- Academic standing requires more than 10 total units: University Scholar at GWA `<= 1.50`, College Scholar at `1.51–1.75`, and Dean's Lister at `1.76–2.00`. Other results have no standing label.
- Modern grade controls step through the current valid grade options: `1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00`. Units step by one from 1 through 10.
- A course is counted in the Modern summary when it has units greater than zero. Grade points are the sum of each course's grade multiplied by its units.
- The subject name is optional. Demo Data appends sample courses to the shared list; Clear All restores an empty calculator state (with the Original layout retaining its starter input row).
- Both layouts remain usable in light and dark themes and on narrow screens.

## Approaches

1. **Shared courses with two layouts — selected.** Use one course list and calculation, with Original retaining its row-based controls and Modern providing the reference-style form and list. This matches the requested mode switch and preserves entries across mode changes. Original inputs need to become controlled so changes made in either layout stay synchronized.
2. **Independent course lists.** Keep the current Original implementation untouched and create a separate Modern calculator. This is a smaller change to the existing input component, but switching modes would show different data and lose the continuity the user requested.

## Acceptance criteria

- **[AC-MODE1026-F1]** An icon-only, accessibly labeled Original/Modern toggle switches layouts while preserving the same course entries and calculated GWA.
- **[AC-MODE1026-F2]** Modern mode displays the GWA, course count, total units, total points, optional subject field, valid grade/unit controls, an Add Subject action, and the added-courses list.
- **[AC-MODE1026-F3]** Adding or deleting a Modern course updates the shared list, summary, GWA, and academic standing.
- **[AC-MODE1026-F4]** Demo Data adds example courses and Clear All clears entered courses; the summary returns to zero.
- **[AC-MODE1026-F5]** Modern mode displays University Scholar, College Scholar, or Dean's Lister when the existing unit and GWA thresholds qualify.
- **[AC-MODE1026-E1]** Grade and unit controls cannot move beyond the existing valid values, and empty courses do not inflate Modern summary totals.
- **[AC-MODE1026-F6]** Both layouts honor the current light/dark theme and remain usable on mobile-width screens.
- **[AC-MODE1026-F7]** The mode toggle displays two icons without visible text, exposes accessible names and selected state, and appears above the theme control.
- **[AC-MODE1026-F8]** Modern uses the Original layout's responsive width, result size, and configured theme colors in both light and dark themes.
- **[AC-MODE1026-F9]** The mode and theme controls stack vertically, with the mode control first.

## Security considerations

Security priority is Standard: this change handles grades and optional subject names in client state only. It adds no authentication, persistence, external requests, or new personal data collection.

## Implementation choices left to the builder

- Keep the icon-only mode toggle keyboard-accessible and expose each layout name and selected state to assistive technology.
- Reuse the Original layout's color tokens and responsive width, while preserving Modern's distinct form and course-list structure.
- Preserve the existing Original layout and calculator behavior outside changes needed to keep shared course state synchronized.
