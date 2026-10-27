import { useEffect, useState } from "react";
import ChatModal from "./ChatModal";

interface Props {
  isDark: boolean;
}

const ANNOUNCEMENT_KEY = "gwa-chat-announcement-dismissed";

const FloatingChatButton: React.FC<Props> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Hide the announcement if the user has already dismissed it in a prior session
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(() => {
    return localStorage.getItem(ANNOUNCEMENT_KEY) !== "true";
  });

  // Positioned above the existing footer link
  const accent = isDark
    ? "bg-dark-accent-1 text-white"
    : "bg-light-accent-1 text-light-accent-text";
  const ringColor = isDark ? "ring-dark-background" : "ring-light-background";
  const tooltipBg = isDark ? "bg-dark-secondary" : "bg-light-secondary";

  // Auto-dismiss the announcement after 12 seconds if the user never clicks
  useEffect(() => {
    if (!showAnnouncement) return;
    const timer = window.setTimeout(() => {
      setShowAnnouncement(false);
      localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [showAnnouncement]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowAnnouncement(false);
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
  };

  return (
    <>
      {/* Announcement tooltip — sits to the LEFT of the chat button so the
          arrow can point right toward the button. Hidden below sm to avoid
          overlap on very narrow screens. */}
      {showAnnouncement && !isOpen && (
        <div
          className="hidden sm:flex fixed bottom-20 right-20 z-40 items-center gap-2 animate-[chatBounce_1.4s_ease-in-out_infinite]">
          <div
            className={`relative ${tooltipBg} rounded-full px-4 py-2 shadow-lg flex items-center gap-2 whitespace-nowrap ${isDark ? "text-dark-content" : "text-light-content"}`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            <span className="text-sm font-medium">New! Chat with everyone 👋</span>
            {/* Arrow pointing RIGHT toward the chat button */}
            <span
              aria-hidden="true"
              className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 ${tooltipBg}`}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open chat"
        data-testid="floating-chat-button"
        className={`fixed bottom-16 right-4 z-40 w-14 h-14 rounded-full shadow-lg ${accent} flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform duration-200 ring-2 ${ringColor} ${showAnnouncement && !isOpen ? "animate-pulse" : ""}`}>
        {/* Chat bubble SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <ChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isDark={isDark}
      />

      {/* Inline keyframes for the bouncing announcement tooltip.
          Defined here (not in global CSS) so the file is self-contained. */}
      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(-6px); }
        }
      `}</style>
    </>
  );
};

export default FloatingChatButton;
