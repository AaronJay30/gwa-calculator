import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: number;
}

const MESSAGES_COLLECTION = "chatMessages";
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES_PER_DAY = 200;

/**
 * Returns midnight (local time) of the current day as a Firestore Timestamp.
 * Used to filter the query to "today only".
 */
export const startOfToday = (): Timestamp => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
};

const toMessage = (doc: DocumentData): ChatMessage => {
  const data = doc.data();
  return {
    id: doc.id,
    user: data.user ?? "Anonymous",
    text: data.text ?? "",
    // Prefer Firestore server timestamp; fall back to ms-since-epoch for safety
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : Date.now(),
  };
};

/**
 * Subscribe to today's messages. Calls `onMessage` with the latest array
 * ordered by createdAt ASC, capped at MAX_MESSAGES_PER_DAY.
 * Returns the unsubscribe function.
 */
export const subscribeToTodayMessages = (
  onMessage: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void,
): (() => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("createdAt", ">=", startOfToday()),
    orderBy("createdAt", "asc"),
    limit(MAX_MESSAGES_PER_DAY),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(toMessage);
      onMessage(messages);
    },
    (err) => onError(err),
  );
};

/**
 * Send a new message. Throws on validation failure or Firestore error.
 */
export const sendMessage = async (user: string, text: string): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} chars)`);
  }

  await addDoc(collection(db, MESSAGES_COLLECTION), {
    user: user.trim() || "Anonymous",
    text: trimmed,
    createdAt: serverTimestamp(),
  });
};