import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

const STATS_DOC = "siteStats";

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  updatedAt: Timestamp | null;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  visits: number;
  uniqueVisitors: number;
}

/**
 * Fetches the frozen pre-GA4 totals for the admin baseline. Returns zeros if
 * the aggregate document doesn't exist yet.
 */
export const fetchGlobalStats = async (): Promise<VisitorStats> => {
  const snap = await getDoc(doc(db, STATS_DOC, "global"));
  if (!snap.exists()) {
    return { totalVisits: 0, uniqueVisitors: 0, updatedAt: null };
  }
  const data = snap.data();
  return {
    totalVisits: data.totalVisits ?? 0,
    uniqueVisitors: data.uniqueVisitors ?? 0,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
  };
};

/**
 * Fetches daily stats for an inclusive YYYY-MM-DD date range, oldest first.
 */
export const fetchDailyStats = async (
  startDate: string,
  endDate: string,
): Promise<DailyStat[]> => {
  const q = query(
    collection(db, "dailyStats"),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc"),
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
