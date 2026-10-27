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
const latinHonorsModalModule = await vite
  .ssrLoadModule("/src/components/LatinHonorsSummaryModal.tsx")
  .catch(() => null);
const latinHonorsCalculatorModule = await vite
  .ssrLoadModule("/src/components/LatinHonorsCalculator.tsx")
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

test("[AC-MODE1026-F10] mode hint sits above the Modern icon without blocking it", async () => {
  const markup = renderToStaticMarkup(
    React.createElement(CalculatorModeSwitch, {
      mode: "original",
      onChange: () => {},
      isDark: true,
      showNewModeHint: true,
    }),
  );
  const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");

  assert.match(markup, /mode-hint-arrow/);
  assert.match(markup, /Try Modern/);
  assert.match(markup, /pointer-events-none absolute/);
  assert.doesNotMatch(markup, /mode-hint-ring|stroke-dasharray/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 2);
  assert.doesNotMatch(markup, /New mode! Try Modern|Dismiss new mode hint/);
  assert.match(styles, /@keyframes mode-hint-nudge/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*\.mode-hint-arrow/);
});

test("[AC-MODE1026-E2] new-mode cue is hidden while Modern is active", () => {
  const markup = renderToStaticMarkup(
    React.createElement(CalculatorModeSwitch, {
      mode: "modern",
      onChange: () => {},
      isDark: true,
      showNewModeHint: true,
    }),
  );

  assert.doesNotMatch(markup, /mode-hint-ring|mode-hint-arrow|Try me/);
});

test("[AC-MODE1026-E3] selecting Modern hides the cue for the page session", async () => {
  const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const switchSource = await readFile(
    new URL("../src/components/CalculatorModeSwitch.tsx", import.meta.url),
    "utf8",
  );

  assert.match(appSource, /nextMode === "modern"\) setShowModeHint\(false\)/);
  assert.match(switchSource, /showNewModeHint && mode === "original"/);
  assert.doesNotMatch(switchSource, /New mode! Try Modern|Dismiss new mode hint/);
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

test("[AC-LATINHONORS-UI9] Latin Honor image download opens the congratulations modal after success", async () => {
  const latinHonorsSource = await readFile(
    new URL("../src/components/LatinHonorsCalculator.tsx", import.meta.url),
    "utf8",
  );
  const handler = latinHonorsSource.slice(
    latinHonorsSource.indexOf("const handleDownloadResult"),
    latinHonorsSource.indexOf("const handleAddCourse"),
  );

  assert.ok(handler.indexOf("downloadPngBlob(") >= 0);
  assert.ok(
    handler.indexOf("setShowCongratulations(true)") >
      handler.indexOf("downloadPngBlob("),
  );
  assert.match(latinHonorsSource, /<CongratulationsModal/);
  assert.match(latinHonorsSource, /academicStanding=\{overallSummary\.latinHonor\}/);
  assert.match(latinHonorsSource, /showCongratulations &&/);
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

test("[AC-LATINHONORS-UI1] computation selector is rendered only in Modern layout", async () => {
  const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /mode === "modern" &&\s*\(\s*<ComputationModeSwitch/);
  assert.match(appSource, /mode === "original" \? "flex flex-col gap-8" : "hidden"/);
  assert.match(appSource, /mode === "modern" && computationMode === "latin-honors"/);
});

test("[AC-LATINHONORS-UI2] Latin Honors grade entry uses previous and next buttons", async () => {
  const componentSource = await readFile(
    new URL("../src/components/LatinHonorsCalculator.tsx", import.meta.url),
    "utf8",
  );

  assert.match(componentSource, /label="Decrease grade"/);
  assert.match(componentSource, /label="Increase grade"/);
  assert.doesNotMatch(componentSource, /<select[\s\S]*?id="latin-grade"/);
});

test("[AC-LATINHONORS-UI3] summary modal shows collapsible terms and saved grade details", () => {
  assert.ok(latinHonorsModalModule, "Latin Honors summary modal is missing");
  const markup = renderToStaticMarkup(
    React.createElement(latinHonorsModalModule.default, {
      isDark: true,
      courses: [
        {
          id: 1,
          name: "Mathematics",
          grades: 1.25,
          units: 3,
          year: 1,
          term: "first",
          includeInLatinHonors: true,
        },
        {
          id: 2,
          name: "PE",
          grades: 1.5,
          units: 2,
          year: 1,
          term: "mid",
          includeInLatinHonors: false,
        },
      ],
      onClose: () => {},
    }),
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /<details open=""/);
  assert.match(markup, /First Sem/);
  assert.match(markup, /Mid Sem/);
  assert.match(markup, /Mathematics/);
  assert.match(markup, /1\.25/);
  assert.match(markup, /PE/);
  assert.match(markup, /Excluded from Latin Honors GWA/);
  assert.match(markup, /Download PDF/);
  assert.match(markup, /Download Excel/);
});

test("[AC-LATINHONORS-UI5] Latin Honor result and semester scholarship use award badges and a labeled image download", async () => {
  const componentSource = await readFile(
    new URL("../src/components/LatinHonorsCalculator.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");

  assert.match(componentSource, /latin-honor-remark/);
  assert.match(componentSource, /bg-dark-accent-1 text-dark-primary/);
  assert.match(componentSource, /bg-light-accent-1 text-light-accent-text/);
  assert.match(componentSource, /Download \$\{overallSummary\.latinHonor\} Latin Honor result card/);
  assert.match(componentSource, /rounded-full px-3 py-1\.5 text-right text-xs font-bold/);
  assert.match(styles, /\.latin-honor-remark[\s\S]*?animation:/);
  assert.match(styles, /\.latin-honor-remark,[\s\S]*?animation: none/);
});

test("[AC-LATINHONORS-UI7] Latin Honor image download appears only for a qualifying cumulative result", () => {
  assert.ok(latinHonorsCalculatorModule, "Latin Honors calculator is missing");
  const previousWindow = globalThis.window;
  const renderWithSavedCourses = (courses) => {
    globalThis.window = { localStorage: { getItem: () => JSON.stringify(courses) } };
    return renderToStaticMarkup(
      React.createElement(latinHonorsCalculatorModule.default, { isDark: true }),
    );
  };

  try {
    const emptyMarkup = renderWithSavedCourses([]);
    assert.doesNotMatch(emptyMarkup, /Download .* Latin Honor result card/);

    const qualifyingMarkup = renderWithSavedCourses([
      { id: 1, name: "Mathematics", grades: 1.25, units: 12, year: 1, term: "first", includeInLatinHonors: true },
    ]);
    assert.match(qualifyingMarkup, /Download Magna Cum Laude Latin Honor result card/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("[AC-LATINHONORS-UI8] Latin Honor card matches the scholarship summary layout", () => {
  assert.ok(latinHonorsCalculatorModule, "Latin Honors calculator is missing");
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: () => JSON.stringify([
        { id: 1, name: "Mathematics", grades: 1.25, units: 12, year: 1, term: "first", includeInLatinHonors: true },
      ]),
    },
  };

  try {
    const markup = renderToStaticMarkup(
      React.createElement(latinHonorsCalculatorModule.default, { isDark: true }),
    );
    assert.match(markup, /<h2 class="text-lg font-bold">Latin Honor<\/h2>/);
    assert.match(markup, /aria-label="Open Latin Honors summary"/);
    assert.match(markup, /aria-label="Download Magna Cum Laude Latin Honor result card"/);
    assert.match(markup, /LATIN HONOR ACHIEVEMENT/);
    assert.match(markup, /GENERAL WEIGHTED AVERAGE/);
    assert.match(markup, /15\.00/);
    assert.doesNotMatch(markup, /15\.0000/);
    assert.doesNotMatch(markup, /GWA estimate using the ranges provided/);
    assert.doesNotMatch(markup, />Download result</);
    assert.doesNotMatch(markup, />Summary<\/button>/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("[AC-LATINHONORS-UI6] summary exports are lazy-loaded and errors remain visible", async () => {
  const modalSource = await readFile(
    new URL("../src/components/LatinHonorsSummaryModal.tsx", import.meta.url),
    "utf8",
  );

  assert.match(modalSource, /import\("\.\.\/latinHonorsPdf\.mjs"\)/);
  assert.match(modalSource, /import\("\.\.\/latinHonorsWorkbook\.mjs"\)/);
  assert.match(modalSource, /disabled=\{courses\.length === 0 \|\| Boolean\(exporting\)\}/);
  assert.match(modalSource, /role="alert"/);
  assert.match(modalSource, /event\.preventDefault\(\)/);
  assert.match(modalSource, /type="button"/);
});

test("[AC-LATINHONORS-UI4] closed collapsible sections remain reachable in the modal focus order", async () => {
  const modalSource = await readFile(
    new URL("../src/components/LatinHonorsSummaryModal.tsx", import.meta.url),
    "utf8",
  );

  assert.match(modalSource, /item\.tagName !== "SUMMARY" \|\| item\.parentElement !== closedDetails/);
  assert.match(modalSource, /!closedDetails\.parentElement\?\.closest\("details:not\(\[open\]\)"\)/);
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
