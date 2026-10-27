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
      modernSource.includes("bg-light-accent-1 text-light-accent-text"),
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
    contrastRatio(colors["light-accent-text"], colors["light-accent"][1]) >= 4.5,
    "Light primary action text does not meet 4.5:1 contrast",
  );
  assert.ok(
    contrastRatio(colors.danger[1], colors["dark-content"]) >= 4.5,
    "Original destructive button text does not meet 4.5:1 contrast",
  );
});

test("[AC-LIGHTTHEME-F1] light achievement banners use a readable pastel blue while controls stay blue", async () => {
  const [modernSource, latinHonorsSource] = await Promise.all([
    readFile(new URL("../src/components/ModernCalculator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/LatinHonorsCalculator.tsx", import.meta.url), "utf8"),
  ]);
  const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");
  const pastelBlue = "#D9E6FF";
  const darkText = "#182230";

  assert.ok(contrastRatio(darkText, pastelBlue) >= 4.5);
  assert.match(styles, /\.light-award[\s\S]*?background-color:\s*#D9E6FF/);
  assert.match(styles, /\.light-award[\s\S]*?color:\s*#182230/);
  assert.ok(modernSource.includes("light-award"));
  assert.ok(latinHonorsSource.includes("light-award"));
  assert.ok(modernSource.includes("bg-light-accent-1 text-light-accent-text"));
  assert.ok(latinHonorsSource.includes("bg-light-accent-1 text-light-accent-text"));
});

test("[AC-LATINHONORS-UI1] computation selector uses readable dark-mode text tokens", async () => {
  const source = await readFile(
    new URL("../src/components/ComputationModeSwitch.tsx", import.meta.url),
    "utf8",
  );
  const result = await postcss([
    tailwindcss({ config: "tailwind.config.js" }),
  ]).process("@tailwind utilities;", { from: "src/index.css" });

  assert.ok(
    source.includes("text-dark-content/60") &&
      result.css.includes(".text-dark-content\\/60 {"),
    "Dark-mode inactive label must use a generated light text color",
  );
});
