# Shareable Scholarship Result

**Feature SLUG:** `SCHOLAR1027`

## Intent

Make a qualifying scholarship result feel like a clear achievement and easy to share. The standing should be more prominent in the calculator, and users should be able to download a share card or share the result from their device.

## Goals

- Emphasize University Scholar, College Scholar, or Dean's Lister with a short entrance animation.
- Show a responsive, full-width result card in the page using the same content and layout as the downloaded image: a small “ACADEMIC ACHIEVEMENT” label inside a full-width gold award badge, the standing name, four-decimal GWA and total points, and course/unit totals. Render the preview as page UI rather than as the exported image.
- Place icon-only download and share actions at the card’s right edge. Keep the page card free of decoration; include a subtle circle at the top right of the downloaded card.
- Create a 1200×630 image card containing the earned standing, four-decimal GWA, course count, units, and four-decimal total points.
- Offer Download result card and Share result actions only when an academic standing qualifies.
- After the image download starts, show an accessible congratulations modal with confetti and encouraging copy.
- Keep the title and layout/theme controls on one row on mobile.
- Respect the existing Original/Modern palettes and reduced-motion preferences.

## Non-goals

- Changing the grade formula, scholarship thresholds, or stored course data.
- Adding a third-party image or confetti dependency.
- Collecting a student's name or other personal data for the card.

## Constraints

- Use browser SVG and Canvas APIs to render the PNG without a new dependency.
- Use the Web Share API when it can share the card file; otherwise share result text and the current page URL. If device sharing is unavailable, copy the text when clipboard access is available and keep image download usable.
- Show the congratulations modal only after PNG generation and the browser download action succeed.
- Modal must be dismissible by button and Escape, and its confetti and award animation must stop for reduced-motion users.
- Confetti falls from randomized positions continuously for the lifetime of the open congratulations modal.

## Approaches

1. **SVG card rendered to PNG with browser APIs — selected.** This produces a crisp, platform-friendly image without adding a dependency. The same SVG can be shared as a file where supported, with text/URL and clipboard fallbacks.
2. **Capture the on-page HTML with a screenshot library.** This could reuse the visible card, but adds a dependency and couples the download image to the responsive page layout.
3. **Share only text and a page link.** This is simpler, but does not provide the downloadable achievement image requested.

## Acceptance criteria

- **[AC-SCHOLAR1027-F1]** A qualifying standing appears in a full-width responsive card with the downloaded image’s content layout, a full-width achievement badge, and icon-only Download and Share actions at the right. The card is rendered as page UI without decoration.
- **[AC-SCHOLAR1027-F2]** The downloaded PNG contains the earned standing, four-decimal GWA, total courses, total units, four-decimal total points, and the subtle top-right circle.
- **[AC-SCHOLAR1027-F3]** Download success opens a dismissible congratulations modal with confetti, “You did a great job!”, and additional encouraging copy.
- **[AC-SCHOLAR1027-F4]** Share uses the device share sheet for the card file when supported, falls back to text and URL, and copies the result text when device sharing is unavailable but clipboard access exists.
- **[AC-SCHOLAR1027-F5]** No award card actions appear when no scholarship standing qualifies.
- **[AC-SCHOLAR1027-F6]** The award and confetti animations respect reduced-motion preferences.
- **[AC-SCHOLAR1027-F7]** On mobile, the GWA Calculator title sits inline with the mode and theme controls.
- **[AC-SCHOLAR1027-E1]** Download and share actions are absent when no scholarship standing qualifies.
- **[AC-SCHOLAR1027-E2]** Card text is escaped for SVG and card generation rejects a missing standing.
- **[AC-SCHOLAR1027-E3]** A failed PNG conversion does not start a download or show the success modal.
- **[AC-SCHOLAR1027-E4]** If device sharing is absent, result text is copied when clipboard access exists.
- **[AC-SCHOLAR1027-E5]** If both device sharing and clipboard access are absent, the UI reports that sharing is unavailable.
- **[AC-SCHOLAR1027-E6]** PNG conversion failure reports an error instead of opening the success modal.

## Security and privacy

The card uses only the current calculated summary. It adds no identity fields, persistence, or external image requests. Share targets remain user-selected through the browser's native share mechanism.
