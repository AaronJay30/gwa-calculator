# “What grades do I need?” planner

## Intent

Help students estimate the grades they need in remaining or ungraded subjects to reach an Academic Scholarship or Latin Honor GWA target. Keep the main calculator uncluttered by placing the planner controls and results in a modal.

## Goals

- Add one small “What grades do I need?” action at the bottom of each Academic Scholarship and Latin Honor result card in Modern mode.
- In the modal, let students choose a target standing appropriate to the selected calculator and enter each planned or ungraded subject and its units.
- For planned Latin Honor subjects, let students include or exclude each course from the GWA, using the same rule as saved courses: PE is included and NSTP can be excluded.
- Show a balanced suggested grade for each planned subject, using the existing grade scale and the selected target’s rules.
- Let students adjust each planned grade and see the projected GWA and whether it reaches the selected target.
- For Latin Honors, use all saved Latin Honor courses currently included in the calculation. For Academic Scholarship, use the Academic Scholarship course list.
- Keep planned subjects separate from actual saved course records.

## Non-goals

- Decide official CLSU scholarship or honor eligibility or account for requirements beyond the GWA/standing rules already used by GCalc.
- Add a separate page or expose planner inputs on the main calculator screen.

## Approaches

1. **Course-by-course modal in both calculators (selected):** Open the planner from the relevant result card, enter planned subjects and units, receive a balanced grade suggestion, then adjust grades for a live what-if projection. Latin Honors uses its cumulative course data and honor targets. Academic Scholarship uses its current course list and University Scholar, College Scholar, or Dean’s Lister targets. This matches both the last-year/four-subject scenario and the pending-grade scenario while keeping the main view clean.
2. **Single remaining-units estimate:** Enter only total remaining units and get one required average. This is simpler, but does not show a recommendation for each subject.
3. **Separate planner page:** Provides room for more controls, but adds navigation and duplicates the existing Latin Honor context.

## Behavior and calculation

- For Latin Honors, use courses included by the current Latin Honor calculation (`includeInLatinHonors` and positive units), with targets Summa ≤1.20, Magna ≤1.45, and Cum ≤1.75.
- For Academic Scholarship, use the existing Academic Scholarship course list and standing rules: University Scholar <1.51, College Scholar <1.76, Dean’s Lister ≤2.00, with the existing 9-unit minimum applied to completed plus planned courses.
- For either calculator, let `P` be current grade points, `U` current units, `T` the selected target boundary, and `R` planned units. Calculate the required remaining weighted average as `(T × (U + R) − P) ÷ R`, respecting strict upper bounds for Academic Scholarship categories.
- Show a balanced baseline suggestion: the same highest non-failing grade from GCalc’s grade scale across planned courses that reaches the selected GWA cutoff. Reuse the existing summary/classification rules to check strict GWA boundaries. Apply Academic Scholarship’s 9-unit minimum separately to projected target status because changing grades cannot replace missing units. Students may set different grades per course; the projected GWA and target status update from those values.
- Reaching a stronger classification also counts as meeting the selected target (for example, University Scholar meets a College Scholar target, and Summa Cum Laude meets a Cum Laude target). Show the best projected classification separately from the selected target status.
- If projected Academic Scholarship units remain below 9, explain that the minimum unit requirement is not met and include that in the projection status.
- If even a 1.00 average across planned courses cannot reach the selected target, show that the target is out of reach by GWA and show the best possible projected GWA with all 1.00 grades.
- If planned courses are missing, prompt the student to add a subject and units. Recalculate suggestions when target or planned units change.
- Use unrounded points for calculations and show projected GWA to four decimals. Clearly label the result as a calculator estimate; it does not determine official scholarship or Latin Honor eligibility.

## Constraints and implementation calls

- Each trigger appears only in its corresponding result card. The subject rows, target choice, recommendations, and projection stay inside the modal.
- Planned subject data is temporary planner input and never changes the actual Latin Honor course list or its saved GWA. Persisting planner drafts is outside this first version.
- Reuse the grade scale, honor cutoffs, saved course data, visual tokens, and modal/accessibility conventions already in the project; add no dependency.

## Acceptance criteria

- Students can open the planner from either result card without changing actual courses or GWA.
- Students can add/remove planned subjects, set units, select an honor/standing target, and adjust each projected grade.
- Suggested grades and projected GWA respond to planned units and grade changes, including different subject unit counts.
- Academic Scholarship projections respect the existing 9-unit minimum and standing cutoffs; Latin Honor projections respect the existing cumulative honor cutoffs.
- The modal clearly handles missing planned subjects and unreachable GWA targets.
- Keyboard users can operate and dismiss the modal, and focus returns to its trigger when it closes.
