import React, { useCallback, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaDownload, FaListAlt, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import {
  calculateSummary,
  MAX_UNITS,
  stepUnit,
  VALID_GRADES,
} from "../gwaCalculator.mjs";
import {
  calculateLatinHonorsSummary,
  getCoursesForPeriod,
} from "../latinHonors.mjs";
import type { LatinHonorsCourse, LatinTerm } from "../latinHonors.mjs";
import {
  createLatinHonorResultSvg,
  createShareResultPng,
  downloadPngBlob,
  getLatinHonorCardFilename,
} from "../resultCard.mjs";
import CongratulationsModal from "./CongratulationsModal";
import GradeGoalPlannerModal from "./GradeGoalPlannerModal";
import LatinHonorsSummaryModal from "./LatinHonorsSummaryModal";

const YEARS = [
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
const TERMS: { id: LatinTerm; label: string }[] = [
  { id: "first", label: "First Sem" },
  { id: "mid", label: "Mid Sem" },
  { id: "second", label: "Second Sem" },
];

interface Props {
  isDark: boolean;
  courses: LatinHonorsCourse[];
  onCoursesChange: React.Dispatch<React.SetStateAction<LatinHonorsCourse[]>>;
  period: { year: number; term: LatinTerm };
  onPeriodChange: React.Dispatch<React.SetStateAction<{ year: number; term: LatinTerm }>>;
}

type EditableCourseField = "name" | "grades" | "units";

const LatinHonorsCalculator: React.FC<Props> = ({
  isDark,
  courses,
  onCoursesChange,
  period,
  onPeriodChange,
}) => {
  const { year, term } = period;
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState(1);
  const [units, setUnits] = useState(3);
  const [includeInLatinHonors, setIncludeInLatinHonors] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showGradePlanner, setShowGradePlanner] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [editingCourse, setEditingCourse] = useState<{
    id: number;
    field: EditableCourseField;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const closeSummary = useCallback(() => setShowSummary(false), []);
  const closeGradePlanner = useCallback(() => setShowGradePlanner(false), []);

  const termCourses = getCoursesForPeriod(courses, year, term);
  const countedTermCourses = termCourses.filter(
    (course) => course.includeInLatinHonors,
  );
  const termSummary = calculateSummary(countedTermCourses);
  const overallSummary = calculateLatinHonorsSummary(courses);
  const termIndex = TERMS.findIndex((item) => item.id === term);
  const gradeIndex = VALID_GRADES.indexOf(grade);
  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const fieldStyle = isDark
    ? "bg-dark-background text-dark-content placeholder:text-dark-content/45"
    : "bg-light-secondary text-light-content placeholder:text-light-content/45";
  const mutedText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const primaryButton = isDark
    ? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
    : "bg-light-accent-1 text-light-accent-text hover:bg-light-accent-2";
  const focusRing = isDark
    ? "focus-visible:outline-dark-accent-1"
    : "focus-visible:outline-light-content";

  const handleDownloadResult = async () => {
    if (!overallSummary.latinHonor || overallSummary.totalUnits <= 0) return;
    setDownloadingCard(true);
    setDownloadError("");
    try {
      const svg = createLatinHonorResultSvg(overallSummary, isDark);
      const png = await createShareResultPng(svg);
      downloadPngBlob(
        png,
        getLatinHonorCardFilename(overallSummary.latinHonor, overallSummary.gwa),
      );
      setShowCongratulations(true);
    } catch (error) {
      console.error("Could not download Latin Honors result card:", error);
      setDownloadError("Could not create the Latin Honors result card. Please try again.");
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleAddCourse = () => {
    onCoursesChange((previous) => {
      const id = Math.max(-1, ...previous.map((course) => course.id)) + 1;
      return [
        ...previous,
        {
          id,
          name: subject.trim() || undefined,
          grades: grade,
          units,
          year,
          term,
          includeInLatinHonors,
        },
      ];
    });
    setSubject("");
    setGrade(1);
    setUnits(3);
    setIncludeInLatinHonors(true);
  };

  const handleClearPeriod = () => {
    onCoursesChange((previous) =>
      previous.filter((course) => course.year !== year || course.term !== term),
    );
  };

  const handleClearAllCourses = () => {
    if (!window.confirm("Clear all Latin Honor grades from every year and semester? This cannot be undone.")) {
      return;
    }
    onCoursesChange([]);
  };

  const updateCourse = (
    id: number,
    changes: Partial<Pick<LatinHonorsCourse, "name" | "grades" | "units">>,
  ) => {
    onCoursesChange((previous) =>
      previous.map((course) => (course.id === id ? { ...course, ...changes } : course)),
    );
  };

  const startCourseEdit = (
    course: LatinHonorsCourse,
    field: EditableCourseField,
  ) => {
    setEditingCourse({ id: course.id, field });
    setEditingValue(field === "name" ? course.name ?? "" : String(course.units));
  };

  const commitCourseEdit = () => {
    if (!editingCourse) return;

    if (editingCourse.field === "name") {
      updateCourse(editingCourse.id, { name: editingValue.trim() || undefined });
    } else if (editingCourse.field === "units") {
      const nextUnits = Number(editingValue);
      if (Number.isInteger(nextUnits) && nextUnits >= 1 && nextUnits <= MAX_UNITS) {
        updateCourse(editingCourse.id, { units: nextUnits });
      }
    }

    setEditingCourse(null);
  };

  const setTermByOffset = (offset: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(TERMS.length - 1, termIndex + offset));
    onPeriodChange((previous) => ({ ...previous, term: TERMS[nextIndex].id }));
  };

  return (
    <div className="flex flex-col gap-5" aria-label="Latin Honors calculator">
      <section className={`rounded-xl p-6 ${panelStyle}`} aria-label="Cumulative Latin Honors estimate">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Latin Honor</h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label="Open Latin Honors summary"
              title="Summary"
              onClick={() => setShowSummary(true)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
              <FaListAlt aria-hidden="true" />
            </button>
            {overallSummary.latinHonor && (
              <button
                type="button"
                onClick={handleDownloadResult}
                disabled={downloadingCard}
                aria-label={`Download ${overallSummary.latinHonor} Latin Honor result card`}
                title={downloadingCard ? "Preparing download" : "Download result card"}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
                <FaDownload aria-hidden="true" />
              </button>
            )}
          </div>
        </header>
        {overallSummary.latinHonor ? (
          <div
            className={`mt-5 w-full rounded-lg px-4 py-3 ${
              isDark ? "bg-dark-accent-1 text-dark-primary" : "light-award"
            }`}>
            <p className="text-[10px] font-semibold tracking-[0.12em]">
              LATIN HONOR ACHIEVEMENT
            </p>
            <p className="latin-honor-remark mt-1 text-xl font-bold sm:text-2xl" aria-live="polite">
              {overallSummary.latinHonor}
            </p>
          </div>
        ) : (
          <p className={`mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold ${fieldStyle}`} aria-live="polite">
            {overallSummary.totalUnits > 0
              ? "Outside the listed honor ranges"
              : "Add courses to estimate your Latin Honors range."}
          </p>
        )}
        <p className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl" aria-live="polite">
          {overallSummary.gwa.toFixed(4)}
        </p>
        <p className={`mt-1 text-xs font-medium tracking-wide ${mutedText}`}>
          GENERAL WEIGHTED AVERAGE
        </p>
        {downloadError && (
          <p className="mt-2 text-sm text-danger-2" role="alert">
            {downloadError}
          </p>
        )}
        <div
          className={`mt-5 grid grid-cols-3 divide-x border-t pt-4 ${
            isDark
              ? "divide-dark-content/10 border-dark-content/10"
              : "divide-light-content/10 border-light-content/10"
          }`}>
          <Metric label="Total courses" value={overallSummary.courseCount.toLocaleString()} isDark={isDark} />
          <Metric label="Total units" value={overallSummary.totalUnits.toLocaleString()} isDark={isDark} />
          <Metric label="Total points" value={overallSummary.totalPoints.toFixed(2)} isDark={isDark} />
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label="Open Latin Honor grade planner"
          onClick={() => setShowGradePlanner(true)}
          className={`mt-4 inline-flex items-center text-sm font-semibold underline underline-offset-4 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}>
          What grades do I need?
        </button>
      </section>

      <section className={`rounded-xl p-5 sm:p-6 ${panelStyle}`} aria-label="Academic period">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PeriodNavigator
            label="Academic year"
            value={`${YEARS[year - 1]} Year`}
            onPrevious={() => onPeriodChange((previous) => ({ year: Math.max(1, previous.year - 1), term: "first" }))}
            onNext={() => onPeriodChange((previous) => ({ year: Math.min(10, previous.year + 1), term: "first" }))}
            previousDisabled={year === 1}
            nextDisabled={year === 10}
            isDark={isDark}
            mutedText={mutedText}
          />
          <PeriodNavigator
            label="Semester"
            value={TERMS[termIndex].label}
            onPrevious={() => setTermByOffset(-1)}
            onNext={() => setTermByOffset(1)}
            previousDisabled={termIndex === 0}
            nextDisabled={termIndex === TERMS.length - 1}
            isDark={isDark}
            mutedText={mutedText}
          />
        </div>

        <div className={`mt-5 rounded-lg p-4 ${fieldStyle}`} aria-label="Selected period computation">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={`text-sm font-medium ${mutedText}`}>
                {YEARS[year - 1]} Year · {TERMS[termIndex].label}
              </p>
              <p className="mt-1 text-3xl font-bold" aria-live="polite">
                {termSummary.gwa.toFixed(4)}
              </p>
              <p className={`text-xs ${mutedText}`}>Semester GWA</p>
            </div>
            {termSummary.academicStanding ? (
              <span
                className={`rounded-full px-3 py-1.5 text-right text-xs font-bold sm:text-sm ${
                  isDark
                    ? "bg-dark-accent-1 text-dark-primary"
                    : "bg-light-accent-1 text-light-accent-text"
                }`}>
                {termSummary.academicStanding}
              </span>
            ) : (
              <p className="text-right text-sm font-semibold">
                {termSummary.totalUnits >= 9
                  ? "No scholarship range"
                  : "Scholar standing appears after 9+ units"}
              </p>
            )}
          </div>
          <div
            className={`mt-4 grid grid-cols-3 divide-x border-t pt-3 ${
              isDark
                ? "divide-dark-content/10 border-dark-content/10"
                : "divide-light-content/10 border-light-content/10"
            }`}>
            <Metric label="Courses" value={termSummary.courseCount.toLocaleString()} isDark={isDark} />
            <Metric label="Units" value={termSummary.totalUnits.toLocaleString()} isDark={isDark} />
            <Metric label="Points" value={termSummary.totalPoints.toFixed(2)} isDark={isDark} />
          </div>
        </div>
      </section>

      <section className={`rounded-xl p-6 ${panelStyle}`}>
        <h2 className="text-lg font-bold">Add a course</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="latin-subject" className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
              Subject (optional)
            </label>
            <input
              id="latin-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Mathematics"
              className={`w-full rounded-lg px-4 py-3 outline-none ring-offset-2 transition focus-visible:ring-2 ${focusRing} ${fieldStyle}`}
            />
          </div>
          <div>
            <label htmlFor="latin-grade" className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
              Grade
            </label>
            <div className="flex items-center gap-2">
              <StepButton
                label="Decrease grade"
                onClick={() => setGrade(VALID_GRADES[gradeIndex - 1])}
                disabled={gradeIndex <= 0}
                isDark={isDark}>
                −
              </StepButton>
              <output
                aria-label="Selected grade"
                aria-live="polite"
                className={`flex-1 rounded-xl px-3 py-3 text-center font-semibold ${fieldStyle}`}>
                {grade.toFixed(2)}
              </output>
              <StepButton
                label="Increase grade"
                onClick={() => setGrade(VALID_GRADES[gradeIndex + 1])}
                disabled={gradeIndex >= VALID_GRADES.length - 1}
                isDark={isDark}>
                +
              </StepButton>
            </div>
          </div>
          <div>
            <label className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
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
              <output className={`flex-1 rounded-xl px-3 py-3 text-center font-semibold ${fieldStyle}`}>
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

        <label className={`mt-4 flex items-start gap-2 text-sm ${mutedText}`}>
          <input
            type="checkbox"
            checked={includeInLatinHonors}
            onChange={(event) => setIncludeInLatinHonors(event.target.checked)}
            className="mt-1 accent-dark-accent-1"
          />
          <span>
            Include in Latin Honors GWA
            <span className="mt-0.5 block text-xs">
              Leave unchecked for NSTP, or other courses excluded from your GWA.
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={handleAddCourse}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing} ${primaryButton}`}>
          <FaPlus aria-hidden="true" />
          Add Subject
        </button>
      </section>

      <section className={`rounded-xl p-6 ${panelStyle}`}>
        <header
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
            isDark ? "border-dark-content/10" : "border-light-content/10"
          }`}>
          <div>
            <h2 className="text-lg font-semibold">
              Courses · {YEARS[year - 1]} Year, {TERMS[termIndex].label}
            </h2>
            {termCourses.length > 0 && (
              <p className={`mt-1 text-xs ${mutedText}`}>
                Click or tap a course name, grade, or unit to edit it.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleClearPeriod}
              disabled={termCourses.length === 0}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark
                  ? "bg-danger-1 text-dark-content hover:bg-danger-2"
                  : "bg-danger-3 text-light-content hover:bg-danger-1"
              }`}>
              Clear this term
            </button>
            <button
              type="button"
              onClick={handleClearAllCourses}
              disabled={courses.length === 0}
              title="Clear Latin Honor grades from every year and semester"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark
                  ? "bg-danger-1 text-dark-content hover:bg-danger-2"
                  : "bg-danger-3 text-light-content hover:bg-danger-1"
              }`}>
              Clear all grades
            </button>
          </div>
        </header>
        {termCourses.length === 0 ? (
          <p className={`py-8 text-center text-sm ${mutedText}`}>
            No courses in this period yet. Add your first subject above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 pt-4" aria-label="Courses in selected period">
            {termCourses.map((course, index) => {
              const name = course.name?.trim() || `Subject ${index + 1}`;
              const points = course.grades * course.units;
              return (
                <li
                  key={course.id}
                  className={`flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl px-4 py-3 ${fieldStyle}`}>
                  <div className="min-w-0 flex-1 break-words font-semibold">
                    {editingCourse?.id === course.id && editingCourse.field === "name" ? (
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
                    {!course.includeInLatinHonors && (
                      <span className={`ml-2 inline-block text-xs font-normal ${mutedText}`}>
                        Excluded from GWA
                      </span>
                    )}
                  </div>
                  <EditableCourseValue label="Grade">
                    {editingCourse?.id === course.id && editingCourse.field === "grades" ? (
                      <select
                        autoFocus
                        value={course.grades}
                        onChange={(event) => {
                          updateCourse(course.id, { grades: Number(event.target.value) });
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
                    {editingCourse?.id === course.id && editingCourse.field === "units" ? (
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
                  <CourseValue label="Points" value={points.toFixed(2)} />
                  <button
                    type="button"
                    onClick={() => onCoursesChange((previous) => previous.filter((item) => item.id !== course.id))}
                    aria-label={`Delete ${name}`}
                    className="rounded-lg bg-danger-1 p-2 text-dark-content transition hover:bg-danger-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-2">
                    <FaRegTrashAlt aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {showSummary && (
        <LatinHonorsSummaryModal
          courses={courses}
          isDark={isDark}
          onClose={closeSummary}
        />
      )}
      {showGradePlanner && (
        <GradeGoalPlannerModal
          mode="latin-honors"
          isDark={isDark}
          currentCourses={courses}
          onClose={closeGradePlanner}
        />
      )}
      {showCongratulations && overallSummary.latinHonor && (
        <CongratulationsModal
          academicStanding={overallSummary.latinHonor}
          isDark={isDark}
          onClose={() => setShowCongratulations(false)}
        />
      )}
    </div>
  );
};

interface PeriodNavigatorProps {
  label: string;
  value: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
  isDark: boolean;
  mutedText: string;
}

const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({
  label,
  value,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  isDark,
  mutedText,
}) => (
  <div>
    <p className={`mb-1 text-xs font-medium ${mutedText}`}>{label}</p>
    <div className="flex items-center justify-between gap-2">
      <NavigationButton
        label={`Previous ${label.toLowerCase()}`}
        onClick={onPrevious}
        disabled={previousDisabled}
        isDark={isDark}>
        <FaChevronLeft aria-hidden="true" />
      </NavigationButton>
      <p className="min-w-0 text-center text-base font-semibold">{value}</p>
      <NavigationButton
        label={`Next ${label.toLowerCase()}`}
        onClick={onNext}
        disabled={nextDisabled}
        isDark={isDark}>
        <FaChevronRight aria-hidden="true" />
      </NavigationButton>
    </div>
  </div>
);

interface SmallButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isDark: boolean;
  children: React.ReactNode;
}

const NavigationButton: React.FC<SmallButtonProps> = ({
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
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
      isDark
        ? "bg-dark-background text-dark-content hover:bg-dark-secondary focus-visible:outline-dark-accent-1"
        : "bg-light-secondary text-light-content hover:bg-light-background focus-visible:outline-light-content"
    }`}>
    {children}
  </button>
);

const StepButton: React.FC<SmallButtonProps> = ({
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
    className={`h-10 w-10 shrink-0 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
      isDark
        ? "bg-dark-background text-dark-content hover:bg-dark-secondary focus-visible:outline-dark-accent-1"
        : "bg-light-secondary text-light-content hover:bg-light-background focus-visible:outline-light-content"
    }`}>
    {children}
  </button>
);

interface MetricProps {
  label: string;
  value: string;
  isDark: boolean;
}

const Metric: React.FC<MetricProps> = ({ label, value, isDark }) => (
  <div className="min-w-0 px-2 first:pl-0 last:pr-0 sm:px-4">
    <p className={`text-xs ${isDark ? "text-dark-content/60" : "text-light-content/60"}`}>
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-semibold">{value}</p>
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

const EditableCourseValue: React.FC<EditableCourseValueProps> = ({ label, children }) => (
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

export default LatinHonorsCalculator;
