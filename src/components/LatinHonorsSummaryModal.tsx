import React, { useEffect, useRef, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { calculateLatinHonorsSummary, getLatinHonorsYearGroups } from "../latinHonors.mjs";
import { buildLatinHonorsExportData } from "../latinHonorsExports.mjs";
import type { LatinHonorsCourse, LatinTerm } from "../latinHonors.mjs";

interface Props {
  courses: LatinHonorsCourse[];
  isDark: boolean;
  onClose: () => void;
}

const TERM_LABELS: Record<LatinTerm, string> = {
  first: "First Sem",
  mid: "Mid Sem",
  second: "Second Sem",
};
const YEAR_LABELS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  let cleanupScheduled = false;
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
    }
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    cleanupScheduled = true;
  } finally {
    if (!cleanupScheduled) window.URL.revokeObjectURL(url);
  }
};

const LatinHonorsSummaryModal: React.FC<Props> = ({ courses, isDark, onClose }) => {
  const [exporting, setExporting] = useState<"pdf" | "excel" | "">("");
  const [exportError, setExportError] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogContent = useRef<HTMLDivElement>(null);
  const yearGroups = getLatinHonorsYearGroups(courses);
  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const fieldStyle = isDark
    ? "bg-dark-background"
    : "bg-light-secondary";
  const mutedStyle = isDark ? "text-dark-content/60" : "text-light-content/60";
  const borderStyle = isDark ? "border-dark-content/10" : "border-light-content/10";

  const handleExport = async (
    format: "pdf" | "excel",
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setExporting(format);
    setExportError("");
    try {
      const data = buildLatinHonorsExportData(courses);
      const blob = format === "pdf"
        ? await import("../latinHonorsPdf.mjs").then(({ createLatinHonorsPdf }) => createLatinHonorsPdf(data))
        : await import("../latinHonorsWorkbook.mjs").then(({ createLatinHonorsWorkbook }) => createLatinHonorsWorkbook(data));
      const extension = format === "pdf" ? "pdf" : "xlsx";
      downloadBlob(blob, `latin-honors-academic-summary.${extension}`);
    } catch (error) {
      console.error(`Could not create Latin Honors ${format.toUpperCase()} export:`, error);
      setExportError(`Could not create the ${format.toUpperCase()} file. Please try again.`);
    } finally {
      setExporting("");
    }
  };

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogContent.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), summary, a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((item) => {
        const closedDetails = item.closest("details:not([open])");
        if (!closedDetails) return true;
        if (item.tagName !== "SUMMARY" || item.parentElement !== closedDetails) {
          return false;
        }
        return !closedDetails.parentElement?.closest("details:not([open])");
      });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="latin-honors-summary-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div
        ref={dialogContent}
        className={`relative my-auto flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl shadow-2xl ${panelStyle}`}>
        <header className={`sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-t-2xl border-b p-5 ${panelStyle} ${borderStyle}`}>
          <div>
            <h2 id="latin-honors-summary-title" className="text-xl font-bold">
              Academic Summary
            </h2>
            <p className={`mt-1 text-sm ${mutedStyle}`}>
              Expand a year, then a semester, to review your saved grades.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={(event) => void handleExport("pdf", event)}
              disabled={courses.length === 0 || Boolean(exporting)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${borderStyle} ${mutedStyle}`}>
              <FaFilePdf aria-hidden="true" />
              {exporting === "pdf" ? "Preparing…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={(event) => void handleExport("excel", event)}
              disabled={courses.length === 0 || Boolean(exporting)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${borderStyle} ${mutedStyle}`}>
              <FaFileExcel aria-hidden="true" />
              {exporting === "excel" ? "Preparing…" : "Download Excel"}
            </button>
            <button
              ref={closeButton}
              type="button"
              aria-label="Close academic summary"
              onClick={onClose}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isDark
                  ? "bg-dark-background text-dark-content focus-visible:outline-dark-accent-1"
                  : "bg-light-secondary text-light-content focus-visible:outline-light-content"
              }`}>
              ×
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-4 sm:p-5">
          {exportError && (
            <p className="mb-3 rounded-lg bg-danger-1/10 p-3 text-sm text-danger-2" role="alert">
              {exportError}
            </p>
          )}
          {yearGroups.length === 0 ? (
            <p className={`rounded-xl p-8 text-center text-sm ${fieldStyle} ${mutedStyle}`}>
              No grades saved yet. Add courses by semester to see them here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {yearGroups.map((yearGroup, yearIndex) => (
                <details
                  key={yearGroup.year}
                  open={yearIndex === 0}
                  className={`rounded-xl border ${borderStyle} ${fieldStyle}`}>
                  <summary className="cursor-pointer px-4 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    {YEAR_LABELS[yearGroup.year - 1]} Year
                    <span className={`ml-2 text-sm font-normal ${mutedStyle}`}>
                      {yearGroup.terms.reduce((count, term) => count + term.courses.length, 0)} courses
                    </span>
                  </summary>
                  <div className="flex flex-col gap-2 px-3 pb-3">
                    {yearGroup.terms.map(({ term, courses: termCourses }) => {
                      const summary = calculateLatinHonorsSummary(termCourses);
                      return (
                        <details
                          key={term}
                          className={`rounded-lg border ${borderStyle} ${panelStyle}`}>
                          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                            <span>{TERM_LABELS[term]}</span>
                            <span className={`font-medium ${mutedStyle}`}>
                              GWA {summary.gwa.toFixed(4)} · {summary.totalUnits} units
                            </span>
                          </summary>
                          <div className="overflow-x-auto px-3 pb-3">
                            <div className={`mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 border-b px-2 pb-2 text-xs font-medium ${mutedStyle} ${borderStyle}`}>
                              <span>Subject</span>
                              <span className="text-right">Grade</span>
                              <span className="text-right">Units</span>
                              <span className="text-right">Points</span>
                            </div>
                            <ul className="flex flex-col gap-1.5">
                              {termCourses.map((course, courseIndex) => (
                                <li
                                  key={course.id}
                                  className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-md px-2 py-2 text-sm">
                                  <span className="min-w-0 break-words font-medium">
                                    {course.name?.trim() || `Subject ${courseIndex + 1}`}
                                    {!course.includeInLatinHonors && (
                                      <span className={`ml-2 block text-xs font-normal ${mutedStyle}`}>
                                        Excluded from Latin Honors GWA
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-right">{course.grades.toFixed(2)}</span>
                                  <span className="text-right">{course.units}</span>
                                  <span className="text-right">{(course.grades * course.units).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className={`mt-2 flex flex-wrap justify-end gap-x-4 gap-y-1 border-t pt-2 text-xs ${mutedStyle} ${borderStyle}`}>
                              <span>{summary.courseCount} included courses</span>
                              <span>{summary.totalUnits} units</span>
                              <span>{summary.totalPoints.toFixed(2)} points</span>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatinHonorsSummaryModal;
