import React, { useEffect, useRef } from "react";
import { FaFacebookF } from "react-icons/fa";

interface Props {
  isDark: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<Props> = ({ isDark, onClose }) => {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogContent = useRef<HTMLElement>(null);
  const qrCodeUrl = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/qr.jfif`;
  const cardStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const mutedStyle = isDark ? "text-dark-content/70" : "text-light-content/70";
  const accentStyle = isDark
    ? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
    : "bg-light-accent-1 text-white hover:bg-light-accent-2";

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
        const focusable = dialogContent.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <section
        ref={dialogContent}
        className={`relative flex max-h-[90vh] w-full max-w-sm flex-col items-center overflow-y-auto rounded-2xl p-6 text-center shadow-2xl sm:p-7 ${cardStyle}`}>
        <button
          ref={closeButton}
          type="button"
          aria-label="Close support dialog"
          onClick={onClose}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentStyle}`}>
          ×
        </button>

        <h2 id="support-modal-title" className="pr-8 text-xl font-bold sm:text-2xl">
          Thank you for supporting the developer!
        </h2>
        <p className={`mt-2 text-sm leading-relaxed ${mutedStyle}`}>
          Scan the QR code to send support through GCash.
        </p>
        <img
          src={qrCodeUrl}
          alt="GCash QR code for supporting the developer"
          className="mt-5 w-full max-w-[280px] rounded-xl bg-white p-1"
        />
        <a
          href="https://www.facebook.com/gabato.aaron30"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentStyle}`}>
          <FaFacebookF aria-hidden="true" />
          Follow me on Facebook
        </a>
      </section>
    </div>
  );
};

export default SupportModal;
