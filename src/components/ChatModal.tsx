import { useEffect, useRef, useState, FormEvent } from "react";
import {
  subscribeToTodayMessages,
  sendMessage,
  ChatMessage,
} from "../firebase/chatService";

const NAME_STORAGE_KEY = "gwa-chat-username";
const MAX_MESSAGE_LENGTH = 500;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const formatTime = (ms: number): string => {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem(NAME_STORAGE_KEY) ?? "",
  );
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [hoursLeft, setHoursLeft] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);

  // Update the "cleared in Xh Ym" countdown every minute
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // next local midnight
      const diffMs = midnight.getTime() - now.getTime();
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      setHoursLeft(`${h}h ${m}m`);
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Prompt for name the first time the modal opens if none is saved
  useEffect(() => {
    if (isOpen && !userName) {
      setShowNamePrompt(true);
    }
  }, [isOpen, userName]);

  // Subscribe to today's messages while open
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToTodayMessages(
      (msgs) => {
        setMessages(msgs);
        setError("");
      },
      (err) => setError(err.message),
    );
    return unsubscribe;
  }, [isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setUserName(trimmed);
    setShowNamePrompt(false);
    setDraftName("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(userName, trimmed);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const cardBg = isDark ? "bg-dark-primary" : "bg-light-primary";
  const textColor = isDark ? "text-dark-content" : "text-light-content";
  const inputBg = isDark ? "bg-dark-secondary" : "bg-light-secondary";
  const accent = isDark ? "bg-dark-accent-1" : "bg-light-accent-1";
  const accentText = isDark ? "text-white" : "text-light-accent-text";

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:backdrop-blur-md p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chat">
      <div
        className={`w-full sm:max-w-md sm:w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[600px] sm:h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${cardBg} ${textColor}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-dark-secondary" : "border-light-secondary"}`}>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Daily Chat</h2>
            <span className="text-xs opacity-60">
              {userName ? `Signed in as ${userName}` : "Messages reset every day"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xl hover:opacity-70 ${inputBg}`}>
            ×
          </button>
        </div>

        {/* Daily reset banner */}
        <div className={`flex items-center gap-2 px-5 py-2.5 text-xs ${isDark ? "bg-dark-secondary/60 text-dark-content" : "bg-light-secondary/60 text-light-content"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 opacity-70">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="opacity-80">
            Messages clear at midnight — {hoursLeft} left today
          </span>
        </div>

        {/* Name prompt overlay */}
        {showNamePrompt && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-xl p-6 flex flex-col gap-3 ${cardBg}`}>
              <h3 className="text-lg font-semibold">Choose a display name</h3>
              <p className="text-sm opacity-70">
                Pick a name others will see in chat. It's saved on this device only.
              </p>
              <input
                type="text"
                maxLength={32}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
                placeholder="e.g. Aaron"
                className={`rounded-lg px-3 py-2 outline-none ${inputBg}`}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={!draftName.trim()}
                className={`rounded-lg py-2 px-3 font-semibold disabled:opacity-40 ${accent} ${accentText}`}>
                Start chatting
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={listRef}
          className="chat-scroll flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.length === 0 && !error && (
            <div className="opacity-50 text-sm text-center mt-8">
              No messages yet today. Say hi!
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm text-center mt-4">
              {error}
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.user === userName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${isMine ? "self-end items-end" : "self-start items-start"}`}>
                <span className="text-xs opacity-60 mb-0.5">
                  {msg.user} · {formatTime(msg.createdAt)}
                </span>
                <div
                  className={`rounded-2xl px-3 py-2 break-words whitespace-pre-wrap ${isMine ? `${accent} ${accentText}` : inputBg}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className={`px-5 py-4 border-t flex gap-2 ${isDark ? "border-dark-secondary" : "border-light-secondary"}`}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={userName ? "Type a message…" : "Set your name first"}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={!userName || sending}
            className={`flex-1 rounded-lg px-3 py-2 outline-none disabled:opacity-50 ${inputBg}`}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending || !userName}
            className={`rounded-lg px-4 py-2 font-semibold disabled:opacity-40 ${accent} ${accentText}`}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
