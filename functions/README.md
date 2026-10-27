# Delete chat messages from Firestore after 24 hours

The calculator's `createdAt` query only hides older messages from the chat
view. It does **not** delete their Firestore documents. This repository has no
cleanup function implementation or Firebase deployment configuration, so
database deletion must be enabled in the Firebase project.

Use Firestore's time-to-live (TTL) policy on the existing `createdAt` field.
That applies to existing messages and new messages without changing the web
app:

1. Open **Firebase Console → Firestore Database → Time-to-live** for the
   calculator's project and database.
2. Choose **Create policy**.
3. Set **Collection group** to `chatMessages`.
4. Set **Timestamp field** to `createdAt`.
5. Set **Expiration offset** to **24 hours**, then create the policy.
6. Wait until the policy status is **Active**.

Firestore TTL deletion is asynchronous: expired messages are typically deleted
within 24 hours after their expiration time, not at the exact 24-hour mark.
Older messages that already passed the cutoff are eligible once the policy is
active. TTL deletes require billing to be enabled and are billed as document
deletes. See [Firestore TTL documentation](https://firebase.google.com/docs/firestore/ttl)
and [Firestore pricing](https://cloud.google.com/firestore/pricing) before
enabling the policy.
