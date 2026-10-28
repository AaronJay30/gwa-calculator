# Scheduled Jose peek

## Intent

Add a playful Admin control to schedule the existing `public/jose.png` cutout. At the chosen time, visitors see Jose peek in and out from the lower-left corner for 30 seconds.

## Behavior

- Admin can schedule one future local date and time or clear the pending schedule.
- Admin can trigger the animation for all visitors from Firebase, or schedule it for a future local date and time. The immediate action replaces any existing schedule and starts a few seconds after the write so it satisfies the Firestore future-timestamp rule.
- Store one schedule timestamp in `siteSettings/josePeek` in Firestore. Visitors subscribe to this single document; triggering, scheduling, and clearing each write only that document. Visitors never write to Firestore for this feature.
- Each browser plays a given schedule once, identified by its timestamp and remembered in localStorage. Visitors already on the site wait for the scheduled time; visitors who arrive later see the peek once on their first visit after the schedule.
- Each peek smoothly rises higher to a random height, stays for 2–3 seconds, then hides for 3–5 seconds before repeating. The full run, including all visible holds and hidden waits, lasts 30 seconds. It does not intercept clicks and appears above modals. Reduced-motion users see a stationary peek for the same duration.
- Admin can see the active schedule and receives an error if Firestore rejects a read or write.

## Approaches

1. **One Firestore schedule document (selected):** Shares one timestamp with all visitors using the existing Firebase setup. It uses one initial document read/listener per visitor and writes only when an admin schedules or clears the event.
2. **Browser localStorage:** Requires no Firestore reads, but only affects the admin’s device and cannot satisfy the global visitor behavior.
3. **Authenticated backend or Cloud Function:** Can provide server-side authorization, but adds authentication, deployment, and maintenance setup for a decorative one-time event.

## Constraints and notes

- Reuse the existing Firebase client, admin modal, image asset, and app animation conventions; add no dependencies.
- The current admin password check runs in the browser, and this repository contains no Firestore rules. Firestore rules determine whether the schedule write is accepted; the UI must surface permission errors rather than silently reporting success.
- Use the device’s local time in the Admin input and store its absolute timestamp so visitors on different time zones see the event at the same instant.
- A scheduled event remains configured so visitors arriving later can see it once. Clearing it cancels a pending event; a new timestamp creates a new event key.
