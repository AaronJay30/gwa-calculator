# Latin Honors Mode Design

## Intent

Add a separate Latin Honors computation mode so students can record courses by academic year and term, view each term's scholarship-style computation, and estimate their cumulative Latin Honors range.

## Goals

- Keep the existing Original/Modern controls dedicated to page layout.
- Show a clearly labeled Academic Scholarship / Latin Honors selector below the header only in the Modern layout. Keep Original's existing scholarship calculator unchanged.
- In Latin Honors mode, navigate First Year through Tenth Year and First Sem, Mid Sem, and Second Sem with compact arrow controls.
- Save courses separately for each year and term, retain them while navigating, and store Latin Honors entries in this browser across reloads.
- Show a term GWA, totals, and the existing Academic Scholarship standing for the selected period.
- Show one cumulative, unit-weighted GWA and a GWA-based Latin Honors estimate across all included periods.
- Use previous/next grade buttons in Latin Honors instead of a grade dropdown.
- Add a Summary modal with collapsible academic years and populated semesters, showing each saved grade and period totals.
- Allow courses to be excluded from the Latin Honors GWA so PE/NSTP or other non-counted courses can be entered without affecting totals.
- Allow course units from 1 through 99 in both calculator modes.

## Non-goals and limits

- Latin Honors results are estimates based on GWA ranges, not determinations of official CLSU eligibility.
- No account, cloud sync, transcript import, or additional eligibility checks will be added.
- Existing Academic Scholarship courses and Latin Honors history remain separate.

## Calculation assumptions

- Use the user-provided GWA thresholds: Summa Cum Laude at or below 1.20; Magna Cum Laude at or below 1.45; Cum Laude at or below 1.75. Values above 1.75 have no listed honor range.
- Evaluate thresholds using the unrounded weighted average; display the GWA to four decimal places.
- A course marked excluded remains visible in its term but contributes no grade points, units, or course count to term or cumulative Latin Honors summaries.
- The official CLSU handbook could not be retrieved during design. The UI must identify the result as a GWA estimate and state that official eligibility may include additional requirements.

## Approaches considered

1. Add a third icon beside the Original/Modern icons. Rejected because it mixes calculator computation with page layout and is hard to understand.
2. Add a labeled, full-width computation selector below the Modern header, followed by year and term arrow navigators in Latin Honors mode. Chosen because the computation choice is distinct from layout and stays out of the Original view.
3. Render all 30 period forms at once. Rejected because it creates a long, crowded page; users can move through periods while each period's saved courses and summary remain available.

## Layout and interaction

The computation selector sits immediately below the title/layout/theme header in Modern and above results. The Original layout keeps its existing calculator without the computation selector. In Latin Honors mode, an overall summary appears first. Below it, independent year and term arrow controls identify the active period. The active period's small computation, course entry form, and course list follow. A Summary button opens a modal with nested collapsible year and populated semester sections showing every saved course. Moving to another period changes the visible term data without clearing it.

## Persistence and privacy

Latin Honors courses are stored in browser local storage on the current device. They are not sent to a server or synchronized to other devices. Invalid stored data is ignored safely.
