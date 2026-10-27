import React, { useEffect, useRef, useState } from "react";
import { FaDownload, FaUpload } from "react-icons/fa";
import {
  createCourseBackup,
  parseCourseBackup,
} from "../calculatorSave.mjs";
import type { CalculatorSaveData } from "../calculatorSave.mjs";

interface Props {
  isDark: boolean;
  scholarshipCourses: CalculatorSaveData["scholarshipCourses"];
  latinHonorsCourses: CalculatorSaveData["latinHonorsCourses"];
  storageMessage: string;
  onImport: (data: CalculatorSaveData) => void;
}

const SaveCopyControls: React.FC<Props> = ({
  isDark,
  scholarshipCourses,
  latinHonorsCourses,
  storageMessage,
  onImport,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const cancelImport = useRef<HTMLButtonElement>(null);
  const confirmImport = useRef<HTMLButtonElement>(null);
  const [pendingImport, setPendingImport] = useState<CalculatorSaveData | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const mutedText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const primaryButton = isDark
    ? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
    : "bg-light-accent-1 text-light-accent-text hover:bg-light-accent-2";
  const secondaryButton = isDark
    ? "border border-dark-content/10 text-dark-content hover:bg-dark-content/5"
    : "border border-light-content/10 text-light-content hover:bg-light-content/5";
  const focusRing = isDark
    ? "focus-visible:outline-dark-accent-1"
    : "focus-visible:outline-light-content";

  useEffect(() => {
    if (!pendingImport) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingImport(null);
        return;
      }
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === cancelImport.current) {
        event.preventDefault();
        confirmImport.current?.focus();
      } else if (!event.shiftKey && document.activeElement === confirmImport.current) {
        event.preventDefault();
        cancelImport.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    cancelImport.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [pendingImport]);

  const handleDownload = () => {
    setError("");
    setStatus("");
    try {
      const content = createCourseBackup({ scholarshipCourses, latinHonorsCourses });
      const url = URL.createObjectURL(
        new Blob([content], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `gwa-calculator-save-${new Date().toISOString().slice(0, 10)}.json`;
      link.hidden = true;
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Your save copy has been downloaded.");
    } catch (downloadError) {
      console.error("Could not create calculator save copy:", downloadError);
      setError("Could not download a save copy. Please try again.");
    }
  };

  const handleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setError("");
    setStatus("");
    try {
      setPendingImport(parseCourseBackup(await file.text()));
    } catch (importError) {
      console.warn("Could not read calculator save copy:", importError);
      setError(
        importError instanceof Error
          ? importError.message
          : "This file could not be imported. Choose a valid GWA Calculator save copy.",
      );
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    onImport(pendingImport);
    setPendingImport(null);
    setStatus("Your save copy was imported.");
    setError("");
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${panelStyle}`}
      aria-label="Save and transfer calculator data">
      <div className="min-w-0">
        <p className="text-sm font-semibold">Saved on this device</p>
        <p className={`mt-0.5 text-xs ${mutedText}`}>
          Your course grades stay in this browser on this device. They aren&apos;t sent to our servers. Download a save copy to move them to another device.
        </p>
        {storageMessage && (
          <p className="mt-1 text-xs text-danger-2" role="status">
            {storageMessage}
          </p>
        )}
        {status && (
          <p className={`mt-1 text-xs ${mutedText}`} role="status" aria-live="polite">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-1 text-xs text-danger-2" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Save a copy of your grades"
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
          <FaDownload aria-hidden="true" />
          <span>Save copy</span>
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          aria-label="Import a save copy"
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${secondaryButton}`}>
          <FaUpload aria-hidden="true" />
          <span>Import copy</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={handleSelectFile}
          className="hidden"
          aria-label="Choose a GWA Calculator save copy"
        />
      </div>

      {pendingImport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-save-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingImport(null);
          }}>
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${panelStyle}`}>
            <h2 id="import-save-title" className="text-lg font-bold">
              Replace saved grades?
            </h2>
            <p className={`mt-2 text-sm ${mutedText}`}>
              Importing this save copy replaces the Academic Scholarship and Latin Honors courses on this device. You can cancel and keep your current grades.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelImport}
                type="button"
                onClick={() => setPendingImport(null)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${secondaryButton}`}>
                Cancel
              </button>
              <button
                ref={confirmImport}
                type="button"
                onClick={handleConfirmImport}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
                Replace grades
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SaveCopyControls;
