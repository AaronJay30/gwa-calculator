# GWA Calculator Updates Promo Video

## Intent

Create a shareable student-facing video that announces the new Latin Honor computation in the GWA Calculator. The main message is **“You can now compute your Latin Honor.”** The video also briefly shows Academic Scholarship standing, semester organization, exports, local saves, course transfer, and the result celebration. Admin pages and visitor analytics are out of scope.

## Audience and language

- Audience: Philippine college students tracking grades, scholarship standing, and Latin Honors estimates.
- Language: English voice-over, synchronized English captions, and concise on-screen text.
- Short brand name: display “Gcalc” and pronounce it “G-kalk” in the narration.
- Call to action: “Calculate. Track. Celebrate.” Do not invent a public URL.

## Format and visual direction

- 1920 × 1080 landscape, 30 fps, 1800 frames, approximately 60 seconds.
- Outfit typography; the calculator’s navy/gold dark theme and pastel-blue light theme.
- Two-column composition: story copy on the left and large, authentic app captures on the right.
- Use restrained camera drift and push-ins, staggered copy reveals, subtle background parallax, and a crisp wipe from device save to course transfer. Keep text and app controls legible while moving.
- Use light background music and a small set of transition sounds. Deliver a second version without background music that retains voice-over and SFX.
- Confetti is deterministic, appears only for the result celebration, and continues through the congratulations moment.

## Storyboard and voice-over

| Time | Visual focus | Voice-over / caption |
|---|---|---|
| 0–6s | Open with the light-mode calculator and the new feature headline. | “New in the GWA Calculator: you can now compute your Latin Honor.” |
| 6–14s | Academic Scholarship with a fictional College Scholar result. Name all supported standings as possible results. | “Keep tracking your GWA and your academic standing: Dean’s Lister, College Scholar, or University Scholar.” |
| 14–27s | Latin Honors period controls, one term’s calculation, then the cumulative estimate. This is the longest feature section. | “Add grades by year and semester. See each term’s GWA and your cumulative Latin Honor estimate.” |
| 27–36s | Expand the summary, show saved grades and PDF/Excel choices. | “Review every semester’s grades, then download the full summary as a PDF or Excel file.” |
| 36–45s | Device-local save notice, followed by transferring scholarship courses to a selected term. | “Your entries save on your device. Back them up, or transfer scholarship courses into a selected term.” |
| 45–54s | Cum Laude estimate result card and congratulations modal with falling confetti. | “See your progress in a shareable result card, and celebrate the work behind your estimate.” |
| 54–60s | Branded closing screen. | “GWA Calculator. Calculate, track, and celebrate your academic progress.” |

## Accuracy and privacy

- Use fictional grades only: Statistics (1.25, 3 units), Biology (1.50, 4), Composition (1.50, 4), Literature (1.75, 4). The 15 units and 22.75 grade points produce a 1.5167 GWA and a Cum Laude estimate.
- Scholarship course data is copied only inside the isolated capture context into First Year · First Sem.
- Do not use the user’s open browser or its storage. Start a fresh Playwright context, assert localStorage is empty before app scripts, and block analytics requests.
- No admin pages, analytics, visitor counts, real personal information, or backend data may appear visually or in narration.
- Describe Latin Honors as an estimate; do not imply the calculator confirms official CLSU eligibility.

## Production and acceptance

- Keep all capture, Remotion, audio, and output files in `video-promo/`; do not change the website app or root package manifest.
- Recapture the app at a 960 × 540 CSS viewport, device scale factor 2, producing fresh 1920 × 1080 images.
- Build three landscape styleframes before scene polish. Use the same real app captures in the final video.
- Use deterministic, frame-based motion and confetti; no ambient user data or random values.
- Review representative opening, motion, and hold frames for every scene. Inspect the final video at 1920 × 1080 and confirm the narration, captions, and music/SFX timing. Confirm both versions share identical video frames.
- Run an independent review before delivery. Do not publish or upload the video.
