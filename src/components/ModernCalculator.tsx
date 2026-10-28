import React, { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaDownload, FaPlus, FaRegTrashAlt, FaShareAlt } from "react-icons/fa";
import { GWA } from "../model";
import {
  CalculatorSummary,
  MAX_UNITS,
  VALID_GRADES,
  hasCoursesToClear,
  stepGrade,
  stepUnit,
} from "../gwaCalculator.mjs";
import {
  createShareResultPng,
  createShareResultSvg,
  downloadPngBlob,
  getResultCardFilename,
  shareResult,
} from "../resultCard.mjs";
import CongratulationsModal from "./CongratulationsModal";
import type { LatinTerm, ScholarshipTransferResult } from "../latinHonors.mjs";

interface Props {
  courses: GWA[];
  summary: CalculatorSummary;
  isDark: boolean;
  onUpdateCourse: (
    id: number,
    changes: Partial<Pick<GWA, "name" | "grades" | "units">>,
  ) => void;
  onAddCourse: (course: Omit<GWA, "id">) => void;
  onDeleteCourse: (id: number) => void;
  onClearAll: () => void;
  onDemoData: () => void;
  onTransferCourses: (year: number, term: LatinTerm) => ScholarshipTransferResult;
}

const ModernCalculator: React.FC<Props> = ({
  courses,
  summary,
  isDark,
  onUpdateCourse,
  onAddCourse,
  onDeleteCourse,
  onClearAll,
  onDemoData,
  onTransferCourses,
}) => {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState(1);
  const [units, setUnits] = useState(3);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{
    id: number;
    field: "name" | "grades" | "units";
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [transferYear, setTransferYear] = useState(1);
  const [transferTerm, setTransferTerm] = useState<LatinTerm>("first");
  const transferYearSelect = useRef<HTMLSelectElement>(null);
  const confirmTransfer = useRef<HTMLButtonElement>(null);

  const savedCourses = courses.filter((course) => course.units > 0);
  const transferableCourses = savedCourses.filter(
    (course) => VALID_GRADES.includes(course.grades) && course.units > 0,
  );
  const canClearAll = hasCoursesToClear(courses);
  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const fieldStyle = isDark
    ? "bg-dark-background text-dark-content placeholder:text-dark-content/45"
    : "bg-light-secondary text-light-content placeholder:text-light-content/45";
  const mutedText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const secondaryButton = isDark
    ? "border border-dark-content/10 text-dark-content hover:bg-dark-content/5"
    : "border border-light-content/10 text-light-content hover:bg-light-content/5";
  const primaryButton = isDark
    ? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
    : "bg-light-accent-1 text-light-accent-text hover:bg-light-accent-2";
  const destructiveStyle =
    "bg-danger-1 text-dark-content hover:bg-danger-2 focus-visible:outline-danger-2";
  const focusRing = isDark
    ? "focus-visible:ring-dark-accent-1"
    : "focus-visible:ring-light-content";
  const gradeIndex = VALID_GRADES.indexOf(grade);
  const resultCardSvg = summary.academicStanding
    ? createShareResultSvg(summary, isDark)
    : "";

  useEffect(() => {
    if (!showTransfer) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowTransfer(false);
      } else if (event.key === "Tab" && event.shiftKey && document.activeElement === transferYearSelect.current) {
        event.preventDefault();
        confirmTransfer.current?.focus();
      } else if (event.key === "Tab" && !event.shiftKey && document.activeElement === confirmTransfer.current) {
        event.preventDefault();
        transferYearSelect.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    transferYearSelect.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [showTransfer]);

  const handleTransfer = () => {
    onTransferCourses(transferYear, transferTerm);
    setShowTransfer(false);
  };

  const startCourseEdit = (
    course: GWA,
    field: "name" | "grades" | "units",
  ) => {
    setEditingCourse({ id: course.id, field });
    setEditingValue(field === "name" ? course.name ?? "" : String(course.units));
  };

  const commitCourseEdit = () => {
    if (!editingCourse) return;

    if (editingCourse.field === "name") {
      onUpdateCourse(editingCourse.id, { name: editingValue.trim() || undefined });
    } else if (editingCourse.field === "units") {
      const nextUnits = Number(editingValue);
      if (Number.isInteger(nextUnits) && nextUnits >= 1 && nextUnits <= MAX_UNITS) {
        onUpdateCourse(editingCourse.id, { units: nextUnits });
      }
    }

    setEditingCourse(null);
  };

  const handleAdd = () => {
    onAddCourse({
      name: subject.trim() || undefined,
      grades: grade,
      units,
    });
    setSubject("");
    setGrade(1);
    setUnits(3);
  };

  const handleDownloadCard = async () => {
    setShareMessage("");
    try {
      const png = await createShareResultPng(resultCardSvg);
      downloadPngBlob(
        png,
        getResultCardFilename(summary.academicStanding, summary.gwa),
      );
      setShowCongratulations(true);
    } catch {
      setShareMessage("Could not create the result card. Please try again.");
    }
  };

  const handleShare = async () => {
    setShareMessage("");
    try {
      const result = await shareResult(summary, isDark);
      if (result === "copied") {
        setShareMessage(
          "Result details copied. Download the card to share the image.",
        );
      } else if (result === "unsupported") {
        setShareMessage(
          "Device sharing is unavailable here. Download the card to share it.",
        );
      } else {
        setShareMessage("Your result is ready to share.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage(
        "Could not share the result. You can download the card instead.",
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
      <section
        className={
          summary.academicStanding
            ? "flex flex-col gap-3"
            : `flex flex-col gap-5 rounded-xl p-6 ${panelStyle}`
        }
        aria-label="GWA summary">
        {summary.academicStanding ? (
          <div className={`w-full rounded-xl p-6 ${panelStyle}`}>
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Academic Scholarship</h2>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Download ${summary.academicStanding} result card`}
                  title="Download result card"
                  onClick={handleDownloadCard}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isDark
                      ? "focus-visible:outline-dark-accent-1"
                      : "focus-visible:outline-light-content"
                  } ${primaryButton}`}>
                  <FaDownload aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Share ${summary.academicStanding} result`}
                  title="Share result"
                  onClick={handleShare}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isDark
                      ? "focus-visible:outline-dark-accent-1"
                      : "focus-visible:outline-light-accent-1"
                  } ${secondaryButton}`}>
                  <FaShareAlt aria-hidden="true" />
                </button>
              </div>
            </header>
            <div
              className={`mt-5 w-full rounded-lg px-4 py-3 ${
                isDark ? "bg-dark-accent-1 text-dark-primary" : "light-award"
              }`}>
                <p className="text-[10px] font-semibold tracking-[0.12em]">
                  ACADEMIC ACHIEVEMENT
                </p>
                <p className="scholarship-remark mt-1 text-xl font-bold sm:text-2xl">
                  {summary.academicStanding}
                </p>
              </div>
            <p
              className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl"
              aria-live="polite">
              {summary.gwa.toFixed(4)}
            </p>
            <p className={`mt-1 text-xs font-medium tracking-wide ${mutedText}`}>
              GENERAL WEIGHTED AVERAGE
            </p>
            <div
              className={`mt-5 grid grid-cols-3 divide-x border-t pt-4 ${
                isDark
                  ? "divide-dark-content/10 border-dark-content/10"
                  : "divide-light-content/10 border-light-content/10"
              }`}>
              <SummaryMetric
                label="Total courses"
                value={summary.courseCount.toLocaleString()}
                isDark={isDark}
              />
              <SummaryMetric
                label="Total units"
                value={summary.totalUnits.toLocaleString()}
                isDark={isDark}
              />
              <SummaryMetric
                label="Total points"
                value={summary.totalPoints.toFixed(2)}
                isDark={isDark}
              />
            </div>
            {shareMessage && (
              <p
                className={`mt-3 text-right text-sm ${mutedText}`}
                role="status"
                aria-live="polite">
                {shareMessage}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${mutedText}`}>
                General weighted average
              </p>
              <p className="mt-1 text-5xl font-bold tracking-tight" aria-live="polite">
                {summary.gwa.toFixed(4)}
              </p>
              <p className={`mt-3 text-sm ${mutedText}`}>
                Academic standing appears after 9+ units.
              </p>
            </div>
            <div
              className={`grid grid-cols-3 divide-x ${
                isDark ? "divide-dark-content/10" : "divide-light-content/10"
              }`}>
              <SummaryMetric
                label="Total courses"
                value={summary.courseCount.toLocaleString()}
                isDark={isDark}
              />
              <SummaryMetric
                label="Total units"
                value={summary.totalUnits.toLocaleString()}
                isDark={isDark}
              />
              <SummaryMetric
                label="Total points"
                value={summary.totalPoints.toFixed(4)}
                isDark={isDark}
              />
            </div>
          </>
        )}
      </section>

      <section className={`rounded-xl p-6 ${panelStyle}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
          <div className="md:col-span-2">
            <label
              className={`mb-1.5 block text-sm font-medium ${mutedText}`}
              htmlFor="modern-subject">
              Subject (optional)
            </label>
            <input
              id="modern-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Mathematics"
              className={`w-full rounded-lg px-4 py-3 outline-none ring-offset-2 transition focus-visible:ring-2 ${focusRing} ${fieldStyle}`}
            />
          </div>

          <div>
            <label
              htmlFor="modern-grade-value"
              className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
              Grade
            </label>
            <div className="flex items-center gap-2">
              <StepButton
                label="Decrease grade"
                onClick={() => setGrade(stepGrade(grade, -1))}
                disabled={gradeIndex === 0}
                isDark={isDark}>
                −
              </StepButton>
              <output
                id="modern-grade-value"
                className={`flex-1 rounded-xl px-3 py-3 text-center font-semibold ${fieldStyle}`}
                aria-live="polite">
                {grade.toFixed(2)}
              </output>
              <StepButton
                label="Increase grade"
                onClick={() => setGrade(stepGrade(grade, 1))}
                disabled={gradeIndex === VALID_GRADES.length - 1}
                isDark={isDark}>
                +
              </StepButton>
            </div>
          </div>

          <div>
            <label
              htmlFor="modern-units-value"
              className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
              Units
            </label>
            <div className="flex items-center gap-2">
              <StepButton
                label="Decrease units"
                onClick={() => setUnits(stepUnit(units, -1))}
                disabled={units <= 1}
                isDark={isDark}>
                −
              </StepButton>
              <output
                id="modern-units-value"
                className={`flex-1 rounded-xl px-3 py-3 text-center font-semibold ${fieldStyle}`}
                aria-live="polite">
                {units}
              </output>
              <StepButton
                label="Increase units"
                onClick={() => setUnits(stepUnit(units, 1))}
                disabled={units >= MAX_UNITS}
                isDark={isDark}>
                +
              </StepButton>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isDark
              ? "focus-visible:outline-dark-accent-1"
              : "focus-visible:outline-light-content"
          } ${primaryButton}`}>
          <FaPlus aria-hidden="true" />
          Add Subject
        </button>
      </section>

      <section className={`rounded-xl p-6 ${panelStyle}`}>
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
            isDark ? "border-dark-content/10" : "border-light-content/10"
          }`}>
          <h2 className="text-lg font-semibold">Added Courses</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              disabled={transferableCourses.length === 0}
              aria-label="Transfer courses to Latin Honors"
              title="Transfer courses to Latin Honors"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${secondaryButton}`}>
              <FaArrowRight aria-hidden="true" />
              <span className="hidden sm:inline">Transfer</span>
            </button>
            <button
              type="button"
              onClick={onDemoData}
              className={`rounded-lg px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isDark
                  ? "focus-visible:outline-dark-accent-1"
                  : "focus-visible:outline-light-content"
              } ${secondaryButton}`}>
              Demo Data
            </button>
            <button
              type="button"
              onClick={onClearAll}
              disabled={!canClearAll}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${destructiveStyle}`}>
              Clear All
            </button>
          </div>
        </div>

        {savedCourses.length === 0 ? (
          <p className={`py-10 text-center text-sm ${mutedText}`}>
            No subjects added yet. Fill in the fields above and click{" "}
            <span className="font-semibold">Add Subject</span>.
          </p>
        ) : (
          <>
            <p className={`pt-3 text-xs ${mutedText}`}>
              Click or tap a course name, grade, or unit to edit it.
            </p>
            <ul className="flex flex-col gap-2 pt-3" aria-label="Added courses">
              {savedCourses.map((course, index) => {
                const name = course.name?.trim() || `Subject ${index + 1}`;
                const currentEdit =
                  editingCourse?.id === course.id ? editingCourse.field : null;

                return (
                  <li
                    key={course.id}
                    className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl px-4 py-3 ${fieldStyle}`}>
                    <div className="min-w-0 flex-1 break-words font-semibold">
                      {currentEdit === "name" ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingValue}
                          onChange={(event) => setEditingValue(event.target.value)}
                          onBlur={commitCourseEdit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          aria-label={`Edit subject ${name}`}
                          placeholder="Subject name"
                          className={`w-full min-w-0 rounded-md px-2 py-1 outline-none ring-1 ring-inset ${fieldStyle} ${focusRing}`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startCourseEdit(course, "name")}
                          title="Click to edit subject"
                          aria-label={`Edit subject ${name}`}
                          className={`max-w-full rounded px-1 text-left hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${focusRing}`}>
                          {name}
                        </button>
                      )}
                    </div>
                    <EditableCourseValue label="Grade">
                      {currentEdit === "grades" ? (
                        <select
                          autoFocus
                          value={course.grades}
                          onChange={(event) => {
                            onUpdateCourse(course.id, {
                              grades: Number(event.target.value),
                            });
                            setEditingCourse(null);
                          }}
                          onBlur={() => setEditingCourse(null)}
                          aria-label={`Edit grade for ${name}`}
                          className={`rounded-md px-1 py-0.5 text-right outline-none ring-1 ring-inset ${fieldStyle} ${focusRing}`}>
                          {VALID_GRADES.map((validGrade) => (
                            <option key={validGrade} value={validGrade}>
                              {validGrade.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startCourseEdit(course, "grades")}
                          title="Click to edit grade"
                          aria-label={`Edit grade for ${name}`}
                          className={`rounded px-1 text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${focusRing}`}>
                          {course.grades.toFixed(2)}
                        </button>
                      )}
                    </EditableCourseValue>
                    <EditableCourseValue label="Units">
                      {currentEdit === "units" ? (
                        <input
                          type="number"
                          autoFocus
                          min={1}
                          max={MAX_UNITS}
                          step={1}
                          value={editingValue}
                          onChange={(event) => setEditingValue(event.target.value)}
                          onBlur={commitCourseEdit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          aria-label={`Edit units for ${name}`}
                          className={`w-16 rounded-md px-1 py-0.5 text-right outline-none ring-1 ring-inset ${fieldStyle} ${focusRing}`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startCourseEdit(course, "units")}
                          title="Click to edit units"
                          aria-label={`Edit units for ${name}`}
                          className={`rounded px-1 text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${focusRing}`}>
                          {course.units}
                        </button>
                      )}
                    </EditableCourseValue>
                    <CourseValue
                      label="Points"
                      value={(course.grades * course.units).toFixed(2)}
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(course.id)}
                      aria-label={`Delete ${name}`}
                      className={`rounded-lg p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${destructiveStyle}`}>
                      <FaRegTrashAlt aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
      </div>
      {showTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-courses-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowTransfer(false);
          }}>
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${panelStyle}`}>
            <h2 id="transfer-courses-title" className="text-lg font-bold">
              Transfer courses to Latin Honors
            </h2>
            <p className={`mt-2 text-sm ${mutedText}`}>
              Copy {transferableCourses.length} completed {transferableCourses.length === 1 ? "course" : "courses"} into a year and semester. Your Academic Scholarship courses will stay in place.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="transfer-year" className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
                  Academic year
                </label>
                <select
                  ref={transferYearSelect}
                  id="transfer-year"
                  value={transferYear}
                  onChange={(event) => setTransferYear(Number(event.target.value))}
                  className={`w-full rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 ${focusRing} ${fieldStyle}`}>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((year) => (
                    <option key={year} value={year}>
                      {ordinalYear(year)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="transfer-term" className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
                  Semester
                </label>
                <select
                  id="transfer-term"
                  value={transferTerm}
                  onChange={(event) => setTransferTerm(event.target.value as LatinTerm)}
                  className={`w-full rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 ${focusRing} ${fieldStyle}`}>
                  <option value="first">First Sem</option>
                  <option value="mid">Mid Sem</option>
                  <option value="second">Second Sem</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTransfer(false)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${secondaryButton}`}>
                Cancel
              </button>
              <button
                ref={confirmTransfer}
                type="button"
                onClick={handleTransfer}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
                Transfer courses
              </button>
            </div>
          </div>
        </div>
      )}
      {showCongratulations && (
        <CongratulationsModal
          academicStanding={summary.academicStanding}
          isDark={isDark}
          onClose={() => setShowCongratulations(false)}
        />
      )}
    </>
  );
};

const ordinalYear = (year: number) => {
  const labels = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
  return `${labels[year - 1]} Year`;
};

interface StepButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isDark: boolean;
  children: React.ReactNode;
}

const StepButton: React.FC<StepButtonProps> = ({
  label,
  onClick,
  disabled,
  isDark,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`h-10 w-10 shrink-0 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-accent-1 ${
      isDark
        ? "bg-dark-background text-dark-content hover:bg-dark-primary"
        : "bg-light-secondary text-light-content hover:bg-light-background"
    }`}>
    {children}
  </button>
);

interface SummaryMetricProps {
  label: string;
  value: string;
  isDark: boolean;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({ label, value, isDark }) => (
  <div className="min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5">
    <p
      className={`text-xs sm:text-sm ${
        isDark ? "text-dark-content/60" : "text-light-content/60"
      }`}>
      {label}
    </p>
    <p className="mt-1 truncate text-base font-semibold">{value}</p>
  </div>
);

interface CourseValueProps {
  label: string;
  value: string;
}

interface EditableCourseValueProps {
  label: string;
  children: React.ReactNode;
}

const EditableCourseValue: React.FC<EditableCourseValueProps> = ({
  label,
  children,
}) => (
  <div className="text-right">
    <p className="text-xs opacity-60">{label}</p>
    <div className="text-sm font-medium">{children}</div>
  </div>
);

const CourseValue: React.FC<CourseValueProps> = ({ label, value }) => (
  <div className="text-right">
    <p className="text-xs opacity-60">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default ModernCalculator;
