import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({
  configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
after(() => vite.close());

const { default: CalculatorModeSwitch } = await vite.ssrLoadModule(
  "/src/components/CalculatorModeSwitch.tsx",
);
const { default: ModernCalculator } = await vite.ssrLoadModule(
  "/src/components/ModernCalculator.tsx",
);
const congratulationsModule = await vite
  .ssrLoadModule("/src/components/CongratulationsModal.tsx")
  .catch(() => null);

test("[AC-MODE1026-F7] layout switch uses accessible icons without visible text", () => {
  const markup = renderToStaticMarkup(
    React.createElement(CalculatorModeSwitch, {
      mode: "original",
      onChange: () => {},
      isDark: true,
    }),
  );

  assert.match(markup, /aria-label="Calculator layout"/);
  assert.match(markup, /aria-label="Original layout"/);
  assert.match(markup, /aria-label="Modern layout"/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 2);
  assert.equal((markup.match(/<svg\b/g) ?? []).length, 2);
  assert.doesNotMatch(markup, />\s*(Original|Modern)\s*<\/button>/);
});

test("[AC-MODE1026-F8] Modern view uses Original palette and compact result sizing", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ModernCalculator, {
      courses: [],
      summary: {
        gwa: 0,
        courseCount: 0,
        totalUnits: 0,
        totalPoints: 0,
        academicStanding: "",
      },
      isDark: true,
      onAddCourse: () => {},
      onDeleteCourse: () => {},
      onClearAll: () => {},
      onDemoData: () => {},
    }),
  );

  assert.match(markup, /bg-dark-primary/);
  assert.match(markup, /bg-dark-background/);
  assert.match(markup, /bg-dark-accent-1/);
  assert.match(markup, /text-5xl font-bold/);
  assert.doesNotMatch(markup, /bg-dark-secondary|sm:text-6xl/);
});

test("[AC-SCHOLAR1027-F1] earned standing is prominent with right-side icon actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ModernCalculator, {
      courses: [],
      summary: {
        gwa: 1.51,
        courseCount: 8,
        totalUnits: 40,
        totalPoints: 60.5,
        academicStanding: "College Scholar",
      },
      isDark: true,
      onAddCourse: () => {},
      onDeleteCourse: () => {},
      onClearAll: () => {},
      onDemoData: () => {},
    }),
  );

  assert.match(markup, /College Scholar/);
  assert.match(markup, /class="w-full rounded-xl p-6/);
  assert.match(markup, /ACADEMIC ACHIEVEMENT/);
  assert.doesNotMatch(markup, /src="data:image\/svg\+xml;charset=utf-8,/);
  assert.match(markup, /aria-label="Download College Scholar result card"/);
  assert.match(markup, /title="Download result card"/);
  assert.match(markup, /aria-label="Share College Scholar result"/);
  assert.match(markup, /title="Share result"/);
  assert.doesNotMatch(markup, />Download result card<\/button>/);
  assert.doesNotMatch(markup, />Share result<\/button>/);
});

test("[AC-SCHOLAR1027-E1] result card download is hidden without a scholarship standing", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ModernCalculator, {
      courses: [],
      summary: {
        gwa: 0,
        courseCount: 0,
        totalUnits: 0,
        totalPoints: 0,
        academicStanding: "",
      },
      isDark: true,
      onAddCourse: () => {},
      onDeleteCourse: () => {},
      onClearAll: () => {},
      onDemoData: () => {},
    }),
  );

  assert.doesNotMatch(markup, /Download result card/);
});

test("[AC-SCHOLAR1027-F3] download confirmation celebrates the earned standing accessibly", () => {
  assert.ok(congratulationsModule, "congratulations modal component is missing");
  const markup = renderToStaticMarkup(
    React.createElement(congratulationsModule.default, {
      academicStanding: "College Scholar",
      isDark: true,
      onClose: () => {},
    }),
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /Congratulations, College Scholar!/);
  assert.match(markup, /You did a great job!/);
  assert.match(markup, /Your hard work paid off/);
  assert.match(markup, /ready to share/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /achievement-confetti/);
  assert.match(markup, /Close congratulations dialog/);
});

test("[AC-SCHOLAR1027-F3] congratulations opens only after the image download starts", async () => {
  const modernSource = await readFile(
    new URL("../src/components/ModernCalculator.tsx", import.meta.url),
    "utf8",
  );
  const handler = modernSource.slice(
    modernSource.indexOf("const handleDownloadCard"),
    modernSource.indexOf("const handleShare"),
  );

  assert.ok(handler.indexOf("downloadPngBlob(") >= 0);
  assert.ok(
    handler.indexOf("setShowCongratulations(true)") >
      handler.indexOf("downloadPngBlob("),
  );
});

test("[AC-SCHOLAR1027-F6] achievement remark animates and confetti loops with reduced-motion support", async () => {
  const modernSource = await readFile(
    new URL("../src/components/ModernCalculator.tsx", import.meta.url),
    "utf8",
  );
  const modalSource = await readFile(
    new URL("../src/components/CongratulationsModal.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");

  assert.match(modernSource, /scholarship-remark/);
  assert.match(styles, /@keyframes scholarship-remark/);
  assert.match(modalSource, /Math\.random\(/);
  assert.match(styles, /achievement-confetti-fall[^\n]*infinite/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test("[AC-SCHOLAR1027-F7] mobile header keeps the title inline with its controls", async () => {
  const appSource = await readFile(
    new URL("../src/App.tsx", import.meta.url),
    "utf8",
  );

  assert.match(appSource, /flex flex-row items-start justify-between gap-2/);
});

test("[AC-MODE1026-F9] app keeps Original width and stacks mode control above theme", async () => {
  const appSource = await readFile(
    new URL("../src/App.tsx", import.meta.url),
    "utf8",
  );
  const modeControlIndex = appSource.indexOf("<CalculatorModeSwitch");
  const themeControlIndex = appSource.indexOf("<ThemeSwitch");
  const controlStackIndex = appSource.lastIndexOf(
    'className="flex shrink-0 flex-col items-end gap-2"',
    modeControlIndex,
  );

  assert.match(appSource, /w-full sm:w-1\/2 md:w-3\/4 lg:w-1\/2/);
  assert.ok(controlStackIndex >= 0, "mode and theme controls are not stacked");
  assert.ok(modeControlIndex < themeControlIndex, "mode control must appear first");
  assert.ok(themeControlIndex > controlStackIndex);
});
