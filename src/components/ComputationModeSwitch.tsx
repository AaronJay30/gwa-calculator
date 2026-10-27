import React from "react";

export type ComputationMode = "scholarship" | "latin-honors";

interface Props {
  mode: ComputationMode;
  onChange: (mode: ComputationMode) => void;
  isDark: boolean;
}

const ComputationModeSwitch: React.FC<Props> = ({ mode, onChange, isDark }) => {
  const containerStyle = isDark ? "bg-dark-primary" : "bg-light-primary";
  const selectedStyle = isDark
    ? "bg-dark-accent-1 text-light-content"
    : "bg-light-accent-1 text-light-accent-text";
  const unselectedStyle = isDark
    ? "text-dark-content/60 hover:bg-dark-content/5"
    : "text-light-content/60 hover:bg-light-content/5";
  const focusStyle = isDark
    ? "focus-visible:outline-dark-accent-1"
    : "focus-visible:outline-light-content";

  return (
    <div
      className={`grid w-full grid-cols-2 gap-1 rounded-xl p-1 ${containerStyle}`}
      role="group"
      aria-label="Computation type">
      <button
        type="button"
        aria-pressed={mode === "scholarship"}
        onClick={() => onChange("scholarship")}
        className={`rounded-lg px-2 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusStyle} ${
          mode === "scholarship" ? selectedStyle : unselectedStyle
        }`}>
        Academic Scholarship
      </button>
      <button
        type="button"
        aria-pressed={mode === "latin-honors"}
        onClick={() => onChange("latin-honors")}
        className={`rounded-lg px-2 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusStyle} ${
          mode === "latin-honors" ? selectedStyle : unselectedStyle
        }`}>
        Latin Honors
      </button>
    </div>
  );
};

export default ComputationModeSwitch;
