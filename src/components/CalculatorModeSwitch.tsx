import React from "react";
import { FaListUl, FaThLarge } from "react-icons/fa";

export type CalculatorMode = "original" | "modern";

interface Props {
  mode: CalculatorMode;
  onChange: (mode: CalculatorMode) => void;
  isDark: boolean;
}

const CalculatorModeSwitch: React.FC<Props> = ({ mode, onChange, isDark }) => {
  const inactiveText = isDark ? "text-dark-content/60" : "text-light-content/60";
  const activeStyle = isDark
    ? "bg-dark-accent-1 text-light-content"
    : "bg-light-accent-1 text-dark-content";
  const focusStyle = isDark
    ? "focus-visible:outline-dark-accent-1"
    : "focus-visible:outline-light-accent-1";

  return (
    <div className="flex items-center" role="group" aria-label="Calculator layout">
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
          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusStyle} ${
            mode === "modern" ? activeStyle : inactiveText
          }`}>
          <FaThLarge aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorModeSwitch;
