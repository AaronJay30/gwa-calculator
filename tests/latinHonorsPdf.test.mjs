import assert from "node:assert/strict";
import test from "node:test";
import { buildLatinHonorsExportData } from "../src/latinHonorsExports.mjs";

const pdfModule = await import("../src/latinHonorsPdf.mjs").catch(() => null);

test("[AC-LATINHONORS-PDF1] PDF includes the cumulative award, term badges, and all courses", async () => {
  assert.ok(pdfModule, "Latin Honors PDF generator is missing");
  const report = buildLatinHonorsExportData([
    { id: 1, name: "Mathematics", grades: 1.25, units: 12, year: 1, term: "first" },
    {
      id: 2,
      name: "Physical Education",
      grades: 1,
      units: 3,
      year: 1,
      term: "first",
      includeInLatinHonors: false,
    },
  ]);
  const blob = pdfModule.createLatinHonorsPdf(report);

  assert.ok(blob instanceof Blob);
  assert.match(await blob.slice(0, 8).text(), /^%PDF-/);
  assert.ok(blob.size > 1000);
  const pdfText = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  assert.match(pdfText, /Magna Cum Laude/);
  assert.match(pdfText, /University Scholar/);
  assert.match(pdfText, /Physical Education/);
  assert.match(pdfText, /\(Excluded\) Tj/);
  assert.match(pdfText, /Points: 15\.00/);
  assert.match(pdfText, /\(15\.00\) Tj/);
});

test("[AC-LATINHONORS-PDF2] long course lists continue across pages with section headings", async () => {
  assert.ok(pdfModule, "Latin Honors PDF generator is missing");
  const courses = Array.from({ length: 90 }, (_, id) => ({
    id,
    name: `Course ${id + 1}`,
    grades: 1.5,
    units: 3,
    year: 1,
    term: "first",
  }));
  const blob = pdfModule.createLatinHonorsPdf(buildLatinHonorsExportData(courses));
  const pdfText = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  const pages = pdfText.match(/\/Type\s*\/Page(?!s)\b/g) ?? [];

  assert.ok(pages.length >= 2, `expected multiple pages, got ${pages.length}`);
  assert.match(pdfText, /Year 1 \| First Sem(?: \(continued\))?/);
  assert.match(pdfText, /Course 90/);
});

test("[AC-LATINHONORS-PDF3] exceptionally long subject names continue onto new pages", async () => {
  assert.ok(pdfModule, "Latin Honors PDF generator is missing");
  const longName = "Advanced Research ".repeat(600);
  const report = buildLatinHonorsExportData([
    { id: 1, name: longName, grades: 1.25, units: 12, year: 1, term: "first" },
  ]);
  const blob = pdfModule.createLatinHonorsPdf(report);
  const pdfText = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  const pages = pdfText.match(/\/Type\s*\/Page(?!s)\b/g) ?? [];

  assert.ok(pages.length >= 2);
});
