import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

const STATS_DOC = "siteStats";
const VISITS_COLLECTION = "visits";
const UNIQUE_ID_KEY = "gwa-visitor-uuid";

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  visits: number;
  uniqueVisitors: number;
}

/**
 * Returns today's date in local timezone formatted as YYYY-MM-DD.
 * This is what we use for the daily breakdown document ID.
 */
export const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Returns or creates a stable UUID stored in localStorage.
 * This is what we use to dedupe unique visitors.
 */
const getOrCreateVisitorId = (): string => {
  let id = localStorage.getItem(UNIQUE_ID_KEY);
  if (!id) {
    // crypto.randomUUID is available in all modern browsers; fallback for very old ones
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(UNIQUE_ID_KEY, id);
  }
  return id;
};

/**
 * Records a visit. Idempotent for the same (visitorId, date) pair — if the
 * visitor has already been counted today, only the page-view counter increments.
 *
 * Updates three Firestore documents atomically (best-effort):
 *   - siteStats (totals)
 *   - dailyStats/{YYYY-MM-DD}
 *   - visits/{visitorId}  (presence check for unique dedupe)
 */
export const recordVisit = async (): Promise<void> => {
  const visitorId = getOrCreateVisitorId();
  const date = todayKey();

  // 1) Check if this visitor has already been counted today
  const visitRef = doc(db, VISITS_COLLECTION, `${date}_${visitorId}`);
  const existing = await getDoc(visitRef);

  // 2) Always increment total visits
  const statsRef = doc(db, STATS_DOC, "global");
  await setDoc(
    statsRef,
    { totalVisits: increment(1), updatedAt: serverTimestamp() },
    { merge: true },
  );

  const dailyRef = doc(db, "dailyStats", date);
  await setDoc(
    dailyRef,
    { date, visits: increment(1), updatedAt: serverTimestamp() },
    { merge: true },
  );

  // 3) If this is a new visitor today, mark them and bump unique counters
  if (!existing.exists()) {
    await setDoc(visitRef, {
      visitorId,
      date,
      firstVisitAt: serverTimestamp(),
    });
    await updateDoc(statsRef, { uniqueVisitors: increment(1) });
    await updateDoc(dailyRef, { uniqueVisitors: increment(1) });
  }
};

/**
 * Fetches lifetime totals. Returns zeros if doc doesn't exist yet.
 */
export const fetchGlobalStats = async (): Promise<VisitorStats> => {
  const snap = await getDoc(doc(db, STATS_DOC, "global"));
  if (!snap.exists()) return { totalVisits: 0, uniqueVisitors: 0 };
  const data = snap.data();
  return {
    totalVisits: data.totalVisits ?? 0,
    uniqueVisitors: data.uniqueVisitors ?? 0,
  };
};

/**
 * Fetches the last N days of daily stats, newest first.
 */
export const fetchDailyStats = async (
  days = 30,
): Promise<DailyStat[]> => {
  const q = query(
    collection(db, "dailyStats"),
    orderBy("date", "desc"),
    limit(days),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      date: data.date,
      visits: data.visits ?? 0,
      uniqueVisitors: data.uniqueVisitors ?? 0,
    };
  });
};

/**
 * Helper used by the admin page to format a Firestore timestamp for display.
 */
export const formatTimestamp = (ts: unknown): string => {
  if (ts instanceof Timestamp) return ts.toDate().toLocaleString();
  return "—";
};