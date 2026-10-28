import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

const JOSE_PEEK_DOC = doc(db, "siteSettings", "josePeek");
const IMMEDIATE_TRIGGER_DELAY_MS = 5000;

export type JosePeekSchedule = number | null;

const getScheduledAt = (value: unknown): JosePeekSchedule =>
  value instanceof Timestamp ? value.toMillis() : null;

export const fetchJosePeekSchedule = async (): Promise<JosePeekSchedule> => {
  const snapshot = await getDoc(JOSE_PEEK_DOC);
  return getScheduledAt(snapshot.data()?.scheduledAt);
};

export const subscribeToJosePeekSchedule = (
  onSchedule: (schedule: JosePeekSchedule) => void,
  onError: (error: Error) => void,
): (() => void) =>
  onSnapshot(
    JOSE_PEEK_DOC,
    (snapshot) => onSchedule(getScheduledAt(snapshot.data()?.scheduledAt)),
    (error) => onError(error),
  );

export const saveJosePeekSchedule = async (scheduledAt: Date): Promise<void> => {
  if (
    !(scheduledAt instanceof Date) ||
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getTime() <= Date.now()
  ) {
    throw new Error("Choose a future date and time.");
  }

  await setDoc(
    JOSE_PEEK_DOC,
    {
      scheduledAt: Timestamp.fromDate(scheduledAt),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const triggerJosePeekNow = async (): Promise<number> => {
  // Current Firestore rules require scheduledAt to be later than request.time.
  const scheduledAt = new Date(Date.now() + IMMEDIATE_TRIGGER_DELAY_MS);
  await saveJosePeekSchedule(scheduledAt);
  return scheduledAt.getTime();
};

export const clearJosePeekSchedule = async (): Promise<void> => {
  await setDoc(
    JOSE_PEEK_DOC,
    { scheduledAt: null, updatedAt: serverTimestamp() },
    { merge: true },
  );
};
