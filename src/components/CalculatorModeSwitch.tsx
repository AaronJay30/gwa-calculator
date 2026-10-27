import React from "react";
import { FaArrowDown, FaListUl, FaThLarge } from "react-icons/fa";

export type CalculatorMode = "original" | "modern";

interface Props {
  mode: CalculatorMode;
  onChange: (mode: CalculatorMode) => void;
  isDark: boolean;
  showNewModeHint?: boolean;
}

const CalculatorModeSwitch: React.FC<Props> = ({
  mode,
  onChange,
  isDark,
  showNewModeHint = false,
}) => {
  const inactiveText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const activeStyle = isDark
    ? "bg-dark-accent-1 text-light-content"
    : "bg-light-accent-1 text-light-accent-text";
  const focusStyle = isDark
    ? "focus-visible:outline-dark-accent-1"
    : "focus-visible:outline-light-content";
  const showHint = showNewModeHint && mode === "original";
  const hintColor = isDark ? "text-dark-content" : "text-light-content";

  return (
    <div className="relative flex flex-col items-end" role="group" aria-label="Calculator layout">
      <div
        className={`flex gap-1 rounded-lg p-1 ${
          isDark ? "bg-dark-primary" : "bg-light-primary"
        }`}>
        <button
          type="button"
          aria-label="Original layout"
          title="Original layout"
          aria-pressed={mode === "original"}
          onClick={() => onChange("original")}
          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusStyle} ${
            mode === "original" ? activeStyle : inactiveText
          }`}>
          <FaListUl aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Modern layout"
          title="Modern layout"
          aria-pressed={mode === "modern"}
          onClick={() => onChange("modern")}
          className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusStyle} ${
            mode === "modern" ? activeStyle : inactiveText
          }`}>
          <FaThLarge aria-hidden="true" />
        </button>
      </div>
      {showHint && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-10 -right-3 z-20 flex w-[72px] flex-col items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold ${hintColor}`}>
          <span>Try Modern</span>
          <FaArrowDown className="mode-hint-arrow h-3 w-3" />
        </div>
      )}
    </div>
  );
};

export default CalculatorModeSwitch;
