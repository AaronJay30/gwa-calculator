# Local Save and Course Transfer Design

## Intent

Let students keep their Academic Scholarship and Latin Honors grades after refresh, move scholarship courses into a selected Latin Honors period without re-entering them, and carry a save copy to another device.

## Goals

- Automatically save both course lists in this browser on this device and restore them on reload.
- Remember the selected Original/Modern layout and Academic Scholarship/Latin Honors calculator type after refresh.
- Show a concise notice that calculator grades remain in local browser storage and are not sent to the app's servers.
- Offer a downloadable, versioned JSON save copy containing both course lists and an import action.
- Treat import as a full restore: validate the whole file, ask before replacing current data, and leave the current data untouched if the file is invalid or the user cancels.
- Let a user copy all complete Academic Scholarship courses into a chosen Latin Honors year and semester. Preserve the original list, keep transfers repeatable without duplicating them, and open Latin Honors at that destination after transfer.
- Continue restoring existing Latin Honors entries saved under the current storage key.

## Non-goals and limits

- No account, server storage, automatic cross-device sync, transcript recognition, or new calculation rules.
- A downloaded save copy is a portable backup file, not an Excel or PDF report.
- Scholarship and Latin Honors courses remain independent after transfer; changing or deleting a source course later does not erase an already copied Latin Honors entry.

## Approaches considered

1. **One versioned app save (chosen):** Keep both course lists in the app's shared state and persist them together. This matches the complete-backup/restore behavior and gives transfer one source and destination. Migrate the existing Latin Honors browser key when no new save exists.
2. **Keep separate component saves:** Add scholarship storage and bundle both lists only for downloads. This retains component ownership but requires coordinating import, persistence errors, and migration across separate stores, making partial restores easier.

## Data and interaction

- The shared save contains a format name, version, export timestamp, scholarship courses, and Latin Honors courses. Import accepts only the supported format/version and valid course records; it does not partially apply malformed data.
- Persist layout and calculator-type preferences locally alongside the course data, but keep them separate from portable course backups so importing grades does not change the destination device's preferred view.
- Local autosave covers both lists. If browser storage is unavailable, show a clear status and keep the current session usable.
- Place compact **Save copy** and **Import copy** controls with the privacy notice in the calculator UI, available in both layout modes. The notice refers specifically to grade/course data.
- Place **Transfer to Latin Honors** with Academic Scholarship's added courses. Its dialog selects First through Tenth Year and First, Mid, or Second Sem. Transfer only completed courses (valid grade and positive units), copy their names/grades/units, and retain source IDs so repeating the same transfer updates the matching course in that period rather than duplicating it. After a successful transfer, show Latin Honors at that year and semester.
- Importing a valid save asks the user to confirm replacing both course lists. Canceling or rejecting a file does not change either list.

## Acceptance criteria

- [AC-SAVE1027-F1] Academic Scholarship and Latin Honors entries are restored after a page refresh.
- [AC-SAVE1027-F2] The UI clearly says course data is saved in this browser on this device and is not sent to the app's servers.
- [AC-SAVE1027-F3] A downloaded JSON save copy includes both calculators' course data and can restore it on another device.
- [AC-SAVE1027-F4] A user can select a year and semester to copy completed Academic Scholarship courses into Latin Honors; the source remains intact and the destination is shown afterward.
- [AC-SAVE1027-F5] Repeating a transfer to the same period updates matching transferred courses without creating duplicates.
- [AC-SAVE1027-F6] After refresh, the last selected layout and calculator type are restored.
- [AC-SAVE1027-E1] Invalid, unsupported, or canceled imports do not alter current saved data and show an understandable outcome.
- [AC-SAVE1027-E2] When local storage cannot be read or written, the current session remains usable and the UI explains that entries may not survive leaving the page.
- [AC-SAVE1027-S1] Imported JSON is parsed and validated as data; it is never executed or partially applied.

## Visual direction

Reuse the existing dark/light theme tokens, compact button styles, and modal patterns. Keep backup controls low-profile so they do not compete with the GWA results or the existing calculator mode switches.
