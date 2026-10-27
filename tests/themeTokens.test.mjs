import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const { default: tailwindConfig } = await import("../tailwind.config.js");

const luminance = (hex) => {
  const channels = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
};

const contrastRatio = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
};

test("[AC-MODE1026-F6] Modern controls use colors from the configured theme", async () => {
  const modernSource = await readFile(
    new URL("../src/components/ModernCalculator.tsx", import.meta.url),
    "utf8",
  );
  const result = await postcss([
    tailwindcss({ config: "tailwind.config.js" }),
  ]).process("@tailwind utilities;", { from: "src/index.css" });

  assert.ok(
    result.css.includes(".bg-dark-accent-1 {") &&
      modernSource.includes("bg-dark-accent-1 text-light-content"),
    "Dark primary action does not use the Original theme accent",
  );
  assert.ok(
    result.css.includes(".bg-light-accent-1 {") &&
      modernSource.includes("bg-light-accent-1 text-dark-content"),
    "Light primary action does not use the Original theme accent",
  );
  assert.ok(
    modernSource.includes("bg-danger-1 text-dark-content") &&
      result.css.includes(".bg-danger-1 {") &&
      result.css.includes(".text-dark-content {"),
    "Destructive actions do not use the Original theme colors",
  );
  assert.ok(
    modernSource.includes("bg-dark-background text-dark-content") &&
      result.css.includes(".bg-dark-background {"),
    "Dark fields do not use the Original background color",
  );
  assert.ok(
    modernSource.includes("min-w-0 flex-1 break-words") &&
      result.css.includes(".min-w-0 {") &&
      result.css.includes(".break-words {"),
    "Long subject names do not have a wrapping flex layout",
  );

  const colors = tailwindConfig.theme.colors;
  assert.ok(
    contrastRatio(colors.danger[1], colors["dark-content"]) >= 4.5,
    "Original destructive button text does not meet 4.5:1 contrast",
  );
});
