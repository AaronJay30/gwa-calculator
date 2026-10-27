import React, { useEffect, useMemo, useRef } from "react";
import { FaAward } from "react-icons/fa";

interface Props {
  academicStanding: string;
  isDark: boolean;
  onClose: () => void;
}

const CongratulationsModal: React.FC<Props> = ({
  academicStanding,
  isDark,
  onClose,
}) => {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogContent = useRef<HTMLElement>(null);
  const cardStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const accentStyle = isDark
    ? "bg-dark-accent-1 text-light-content"
    : "bg-light-accent-1 text-white";
  const mutedStyle = isDark ? "text-dark-content/70" : "text-light-content/70";
  const confettiPieces = useMemo(
    () => {
      const colors = isDark
        ? ["#C39A32", "#DAE2F1", "#F1C75B", "#8298C8"]
        : ["#3158C8", "#7D98E6", "#C39A32", "#182230"];
      return Array.from({ length: 36 }, (_, index) => ({
        left: `${Math.random() * 100}%`,
        duration: `${2.4 + Math.random() * 2.8}s`,
        delay: `${-(Math.random() * 4)}s`,
        drift: `${(Math.random() - 0.5) * 260}px`,
        rotation: `${360 + Math.random() * 720}deg`,
        size: `${6 + Math.random() * 7}px`,
        color: colors[index % colors.length],
        borderRadius: Math.random() > 0.5 ? "2px" : "50%",
      }));
    },
    [isDark],
  );

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const buttons = dialogContent.current?.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled])",
        );
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="congratulations-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <span
            key={index}
            className="achievement-confetti"
            style={{
              left: piece.left,
              animationDuration: piece.duration,
              animationDelay: piece.delay,
              backgroundColor: piece.color,
              borderRadius: piece.borderRadius,
              width: piece.size,
              height: piece.size,
              "--confetti-drift": piece.drift,
              "--confetti-rotation": piece.rotation,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section
        ref={dialogContent}
        className={`relative z-10 flex w-full max-w-md flex-col items-center rounded-2xl p-7 text-center shadow-2xl sm:p-9 ${cardStyle}`}>
        <button
          ref={closeButton}
          type="button"
          aria-label="Close congratulations dialog"
          onClick={onClose}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-xl transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentStyle}`}>
          ×
        </button>

        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${accentStyle}`}
          aria-hidden="true">
          <FaAward />
        </div>
        <h2 id="congratulations-title" className="text-2xl font-bold sm:text-3xl">
          Congratulations, {academicStanding}!
        </h2>
        <p className="mt-3 text-lg font-semibold">You did a great job!</p>
        <p className={`mt-2 max-w-sm text-sm leading-relaxed ${mutedStyle}`}>
          Your hard work paid off. Keep believing in yourself and reaching for
          your goals.
        </p>
        <p className={`mt-4 text-sm font-medium ${mutedStyle}`}>
          Your {academicStanding} result card is downloaded and ready to share.
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`mt-6 rounded-lg px-6 py-2.5 font-semibold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentStyle}`}>
          Done
        </button>
      </section>
    </div>
  );
};

export default CongratulationsModal;
