import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { VALID_GRADES } from "../gwaCalculator.mjs";
import {
  calculateGradePlan,
  getGradePlanTargets,
} from "../gradeGoalPlanner.mjs";
import type {
  GradePlanCourse,
  GradePlanMode,
  GradePlanResult,
} from "../gradeGoalPlanner.mjs";

interface Props {
  mode: GradePlanMode;
  isDark: boolean;
  currentCourses: readonly GradePlanCourse[];
  onClose: () => void;
}

interface PlannedCourseDraft {
  id: number;
  name: string;
  units: number | "";
  gradeOverride: number | null;
  includeInLatinHonors: boolean;
}

const getRequiredAverageText = (plan: GradePlanResult, mode: GradePlanMode) => {
  if (plan.requiredAverage === null) return "";
  const subjects = mode === "latin-honors" ? "included upcoming subjects" : "upcoming subjects";
  if (plan.requiredAverage > 3) {
    return `A 3.00 average or better across your ${subjects} is enough for this target.`;
  }

  const comparison = plan.target.strict ? "below" : "at or below";
  return `Your ${subjects} need a weighted average ${comparison} ${plan.requiredAverage.toFixed(4)}.`;
};

const getProjectionMessage = (
  mode: GradePlanMode,
  projection: GradePlanResult,
  targetName: string,
  minimumUnitsNeeded: number,
) => {
  if (projection.targetMet) {
    return `This estimate reaches your ${targetName} target.`;
  }
  if (mode === "academic" && projection.status === "minimum-units-not-met") {
    const gwaMessage = projection.targetGwaMet
      ? "meets the target, but"
      : "does not yet meet the target, and";
    const unitLabel = minimumUnitsNeeded === 1 ? "unit" : "units";
    return `The projected GWA ${gwaMessage} Academic Scholarship standing requires at least 9 units. Add ${minimumUnitsNeeded} more ${unitLabel}.`;
  }
  return "This estimate misses the target. Adjust the grades and try again.";
};

const GradeGoalPlannerModal: React.FC<Props> = ({
  mode,
  isDark,
  currentCourses,
  onClose,
}) => {
  const targets = getGradePlanTargets(mode);
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourseDraft[]>([]);
  const nextId = useRef(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogContent = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const fieldStyle = isDark
    ? "bg-dark-background text-dark-content"
    : "bg-light-secondary text-light-content";
  const mutedText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const borderStyle = isDark ? "border-dark-content/10" : "border-light-content/10";
  const inputRing = isDark
    ? "focus-visible:ring-dark-accent-1"
    : "focus-visible:ring-light-content";
  const secondaryButton = isDark
    ? "border border-dark-content/10 text-dark-content hover:bg-dark-content/5"
    : "border border-light-content/10 text-light-content hover:bg-light-content/5";

  const planner = useMemo(() => {
    const unitsPlan = plannedCourses.map((course) => ({
      grades: course.gradeOverride ?? 1,
      units: course.units === "" ? 0 : course.units,
      includeInLatinHonors: course.includeInLatinHonors,
    }));
    const recommendation = calculateGradePlan(
      mode,
      currentCourses,
      unitsPlan,
      targetId,
    );
    const projectedCourses = unitsPlan.map((course, index) => ({
      ...course,
      grades:
        plannedCourses[index].gradeOverride ?? recommendation.suggestedGrade ?? 1,
    }));
    const projection = calculateGradePlan(
      mode,
      currentCourses,
      projectedCourses,
      targetId,
    );

    return { recommendation, projection };
  }, [currentCourses, mode, plannedCourses, targetId]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogContent.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) return;
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
  }, []);

  const updateCourse = (
    id: number,
    changes: Partial<Omit<PlannedCourseDraft, "id">>,
  ) => {
    setPlannedCourses((previous) =>
      previous.map((course) =>
        course.id === id ? { ...course, ...changes } : course,
      ),
    );
  };

  const addCourse = () => {
    setPlannedCourses((previous) => [
      ...previous,
      {
        id: nextId.current++,
        name: "",
        units: 3,
        gradeOverride: null,
        includeInLatinHonors: true,
      },
    ]);
  };

  const removeCourse = (id: number) => {
    setPlannedCourses((previous) => previous.filter((course) => course.id !== id));
  };

  const { recommendation, projection } = planner;
  const targetName = recommendation.target.label;
  const requiredAverageText = getRequiredAverageText(recommendation, mode);
  const minimumUnitsNeeded = Math.max(0, 9 - projection.projectedUnits);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-goal-planner-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}>
      <div
        ref={dialogContent}
        className={`relative my-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl shadow-2xl ${panelStyle}`}>
        <header className={`sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b p-5 ${panelStyle} ${borderStyle}`}>
          <div>
            <h2 id="grade-goal-planner-title" className="text-xl font-bold">
              What grades do I need?
            </h2>
            <p className={`mt-1 text-sm ${mutedText}`}>
              Try grade estimates for {mode === "academic" ? "Academic Scholarship" : "Latin Honors"}. Your saved grades won’t change.
            </p>
          </div>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close grade planner"
            onClick={onClose}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${secondaryButton}`}>
            ×
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-5">
          <section
            className={`grid grid-cols-3 gap-3 border-b pb-4 ${borderStyle}`}
            aria-label="Current grades">
            <PlannerMetric
              label="Current GWA"
              value={recommendation.currentGwa.toFixed(4)}
              isDark={isDark}
            />
            <PlannerMetric
              label="Current units"
              value={recommendation.currentUnits.toLocaleString()}
              isDark={isDark}
            />
            <PlannerMetric
              label="Current points"
              value={recommendation.currentPoints.toFixed(2)}
              isDark={isDark}
            />
          </section>

          <div className="mt-5">
            <label
              htmlFor="grade-planner-target"
              className={`mb-1.5 block text-sm font-medium ${mutedText}`}>
              Target
            </label>
            <select
              id="grade-planner-target"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className={`w-full rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 ${inputRing} ${fieldStyle}`}>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
          </div>

          <section className="mt-5" aria-labelledby="planned-subjects-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="planned-subjects-title" className="font-semibold">
                  Planned subjects
                </h3>
                <p className={`mt-1 text-xs ${mutedText}`}>
                  Add upcoming or ungraded subjects and their units.
                </p>
              </div>
              <button
                type="button"
                onClick={addCourse}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${secondaryButton} ${inputRing}`}>
                <FaPlus aria-hidden="true" />
                Add subject
              </button>
            </div>

            {plannedCourses.length === 0 ? (
              <p className={`mt-4 rounded-lg border border-dashed p-5 text-center text-sm ${borderStyle} ${mutedText}`}>
                Add a subject to see the grade recommendation and projected GWA.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3" aria-label="Planned subjects">
                {plannedCourses.map((course, index) => {
                  const courseLabel = course.name.trim() || `Subject ${index + 1}`;
                  const unitIsValid =
                    typeof course.units === "number" &&
                    Number.isInteger(course.units) &&
                    course.units >= 1 &&
                    course.units <= 99;
                  const suggestedGrade = recommendation.suggestedGrade;

                  return (
                    <li
                      key={course.id}
                      className={`grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(10rem,1fr)_2.5rem] sm:items-start ${borderStyle}`}>
                      <div>
                        <label
                          htmlFor={`planned-name-${course.id}`}
                          className={`mb-1 block text-xs font-medium ${mutedText}`}>
                          Subject (optional)
                        </label>
                        <input
                          id={`planned-name-${course.id}`}
                          type="text"
                          maxLength={100}
                          value={course.name}
                          onChange={(event) =>
                            updateCourse(course.id, { name: event.target.value })
                          }
                          placeholder={courseLabel}
                          className={`w-full min-w-0 rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 ${inputRing} ${fieldStyle}`}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`planned-units-${course.id}`}
                          className={`mb-1 block text-xs font-medium ${mutedText}`}>
                          Units
                        </label>
                        <input
                          id={`planned-units-${course.id}`}
                          type="number"
                          min={1}
                          max={99}
                          step={1}
                          value={course.units}
                          onChange={(event) => {
                            const { value } = event.target;
                            updateCourse(course.id, {
                              units: value === "" ? "" : Number(value),
                            });
                          }}
                          aria-invalid={!unitIsValid}
                          aria-describedby={!unitIsValid ? `planned-units-error-${course.id}` : undefined}
                          className={`w-full rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 ${inputRing} ${fieldStyle}`}
                        />
                        {!unitIsValid && (
                          <p
                            id={`planned-units-error-${course.id}`}
                            className="mt-1 text-xs text-danger-2">
                            Enter 1–99 units.
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`planned-grade-${course.id}`}
                          className={`mb-1 block text-xs font-medium ${mutedText}`}>
                          Grade estimate
                        </label>
                        <select
                          id={`planned-grade-${course.id}`}
                          value={course.gradeOverride === null ? "suggested" : course.gradeOverride}
                          disabled={mode === "latin-honors" && !course.includeInLatinHonors}
                          onChange={(event) => {
                            const value = event.target.value;
                            updateCourse(course.id, {
                              gradeOverride:
                                value === "suggested" ? null : Number(value),
                            });
                          }}
                          className={`w-full rounded-lg px-3 py-2 outline-none ring-offset-2 transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputRing} ${fieldStyle}`}>
                          <option value="suggested">
                            {suggestedGrade === null
                              ? "Best case · 1.00"
                              : `Suggested · ${suggestedGrade.toFixed(2)}`}
                          </option>
                          {VALID_GRADES.map((validGrade) => (
                            <option key={validGrade} value={validGrade}>
                              {validGrade.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCourse(course.id)}
                        aria-label={`Remove ${courseLabel}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-danger-1 hover:text-dark-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-5 ${borderStyle} ${inputRing}`}>
                        <FaRegTrashAlt aria-hidden="true" />
                      </button>
                      {mode === "latin-honors" && (
                        <label className={`flex items-start gap-2 text-xs sm:col-span-4 ${mutedText}`}>
                          <input
                            type="checkbox"
                            checked={course.includeInLatinHonors}
                            onChange={(event) =>
                              updateCourse(course.id, {
                                includeInLatinHonors: event.target.checked,
                              })
                            }
                            className="mt-0.5 accent-dark-accent-1"
                          />
                          <span>
                            Include in Latin Honors GWA
                            <span className="mt-0.5 block">
                              Keep checked for PE; uncheck for NSTP.
                            </span>
                          </span>
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {mode === "latin-honors" && plannedCourses.length > 0 && recommendation.plannedUnits === 0 && (
              <p className={`mt-4 text-sm ${mutedText}`} role="status">
                Enter valid units and include a subject in the Latin Honors GWA to see a projection.
              </p>
            )}
          </section>

          {(recommendation.requiredAverage !== null || recommendation.plannedUnits > 0) && (
            <section
              className={`mt-5 rounded-xl border p-4 ${borderStyle}`}
              aria-label="Grade recommendation and projected result">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {recommendation.requiredAverage !== null && (
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold ${mutedText}`}>
                      Grade target
                    </p>
                    {recommendation.suggestedGrade !== null ? (
                      <>
                        <p className={`mt-1 text-sm ${mutedText}`}>
                          {requiredAverageText}
                        </p>
                        <p className="mt-2 font-semibold">
                          Balanced suggestion: {recommendation.suggestedGrade.toFixed(2)} in each subject counted in this GWA.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 font-semibold" role="status" aria-live="polite">
                        Even straight 1.00s in counted subjects would give a best GWA of {recommendation.bestCaseGwa?.toFixed(4)}. {targetName} is out of reach.
                      </p>
                    )}
                  </div>
                )}

                {recommendation.plannedUnits > 0 && (
                  <div className={`sm:min-w-40 sm:border-l sm:pl-4 ${borderStyle}`}>
                    <p className={`text-xs ${mutedText}`}>Projected GWA</p>
                    <p className="mt-1 text-3xl font-bold" aria-live="polite">
                      {projection.projectedGwa.toFixed(4)}
                    </p>
                    <p className={`mt-2 text-xs ${mutedText}`}>
                      Projected standing
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {projection.projectedStanding ||
                        (mode === "academic" && projection.projectedUnits < 9
                          ? "Needs 9 units"
                          : "No listed range")}
                    </p>
                  </div>
                )}
              </div>

              {recommendation.plannedUnits > 0 && recommendation.suggestedGrade !== null && (
                <p className={`mt-3 border-t pt-3 text-sm ${borderStyle} ${projection.targetMet ? "font-semibold" : mutedText}`} role="status" aria-live="polite">
                  {getProjectionMessage(mode, projection, targetName, minimumUnitsNeeded)}
                </p>
              )}
            </section>
          )}

          <p className={`mt-4 text-xs ${mutedText}`}>
            This is a GWA estimate. Official scholarship or Latin Honor eligibility may have other requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

interface PlannerMetricProps {
  label: string;
  value: string;
  isDark: boolean;
}

const PlannerMetric: React.FC<PlannerMetricProps> = ({ label, value, isDark }) => (
  <div>
    <p className={`text-xs ${isDark ? "text-dark-content/60" : "text-light-content/60"}`}>
      {label}
    </p>
    <p className="mt-1 font-semibold">{value}</p>
  </div>
);

export default GradeGoalPlannerModal;
