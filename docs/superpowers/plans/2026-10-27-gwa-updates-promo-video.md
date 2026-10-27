# GWA Calculator Updates Promo Video Implementation Plan

**Goal:** Produce a 60-second, 1920 × 1080 landscape Remotion promo with English voice-over, synchronized captions, and two audio mixes, centered on the new Latin Honor computation.

**Architecture:** Keep the standalone Remotion project in `video-promo/`. Capture real app states in a fresh Playwright context with fictional courses, then compose seven scenes from the new landscape screenshots. Drive scenes, captions, narration, and sound cues from the 1800-frame timeline.

**Tech stack:** React, Remotion, TypeScript, Playwright, FFmpeg, and a selected built-in voice for narration.

**Spec:** `docs/superpowers/specs/2026-10-27-gwa-updates-promo-video-design.md`

## Global constraints

- 1920 × 1080 landscape, 30 fps, 1800 frames (60 seconds).
- Use the app’s Outfit typography, navy/gold dark theme, and pastel-blue light theme.
- Keep the app package manifest unchanged; do not modify the calculator UI.
- Use only fictional grades and a fresh isolated browser context. Never read the user’s browser storage.
- Exclude admin, visitor analytics, and backend content.
- Keep Latin Honors labeled as an estimate, not an official eligibility result.
- Use deterministic animations and confetti. Do not publish or upload the video.

## Work items

1. **Fresh landscape captures**
   - Start a separate local app preview and capture at 960 × 540 CSS pixels with device scale factor 2.
   - Assert initial localStorage is empty, block analytics, seed the four fictional courses, and recapture all product states.
   - Review the resulting images for clipping, popup noise, and personal data.

2. **Landscape styleframes**
   - Prepare opening, Latin Honors, and celebration frames at 1920 × 1080.
   - Use a left-side message column and a right-side real app screenshot.
   - Inspect each frame before final scene polish.

3. **Timeline and scenes**
   - Register a 1920 × 1080, 30 fps, 1800-frame composition.
   - Build seven scenes: opening, scholarship, Latin Honors, semester summary, local save/course transfer, result/congratulations, and closing.
   - Keep the Latin Honors scene longest and foreground “You can now compute your Latin Honor” at the start.
   - Use slow screen pushes, staggered text reveals, subtle parallax, and a clean left-to-right transfer wipe.

4. **Narration and sound**
   - Use the voice selected from the available voice picker and the approved English script in the spec.
   - Burn in synchronized English captions.
   - Keep the music mix and a no-background-music mix; both retain voice-over and SFX.
   - Keep music low under the narration and inspect the final audio mix for clipping and drift.

5. **Render and review**
   - Run TypeScript validation and render scene stills for entrance, movement, and readable holds.
   - Render both MP4s, verify 1920 × 1080 at 30 fps and about 60 seconds, and compare frame hashes between versions.
   - Inspect narration/caption alignment and exclude all admin/analytics content.
   - Request an independent final review and record findings before delivery.
