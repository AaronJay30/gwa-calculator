# Daily Chat Cleanup — Cloud Function

This is a **standalone** Cloud Function you can deploy via the Firebase CLI.
It is NOT wired into the Vite build (the React app uses Firestore queries with
`where("createdAt", ">=", startOfToday())` for the read-side filter, so the app
works on the Spark free plan without this).

The function below adds storage hygiene on the Blaze plan: it deletes any
`chatMessages` document whose `createdAt` is older than the start of today.

## Setup

```bash
npm install -g firebase-tools
firebase login
firebase init functions   # choose TypeScript, this project
# copy index.ts + package.json below into functions/
cd functions
npm install
firebase deploy --only functions
```

The function uses `pubsub.schedule("0 0 * * *")` — runs at midnight in the
function's region (default: us-central1, which is UTC).

## functions/package.json

```json
{
  "name": "functions",
  "type": "module",
  "engines": { "node": "20" },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  }
}
```

## functions/index.ts

```ts
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp();

export const cleanupOldChatMessages = onSchedule(
  { schedule: "0 0 * * *", timeZone: "UTC" },
  async () => {
    const db = getFirestore();
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const cutoff = Timestamp.fromDate(startOfToday);

    const snapshot = await db
      .collection("chatMessages")
      .where("createdAt", "<", cutoff)
      .limit(500)
      .get();

    if (snapshot.empty) {
      console.log("No old chat messages to delete.");
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted ${snapshot.size} old chat messages.`);
  },
);
```