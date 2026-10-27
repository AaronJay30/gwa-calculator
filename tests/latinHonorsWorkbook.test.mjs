import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { buildLatinHonorsExportData } from "../src/latinHonorsExports.mjs";

const workbookModule = await import("../src/latinHonorsWorkbook.mjs").catch(() => null);

test("[AC-LATINHONORS-EXCEL1] Excel workbook has complete summary and course sheets", async () => {
  assert.ok(workbookModule, "Latin Honors workbook generator is missing");
  const report = buildLatinHonorsExportData([
    { id: 1, name: "Mathematics", grades: 1.25, units: 12, year: 1, term: "first" },
    {
      id: 2,
      name: "PE",
      grades: 1,
      units: 3,
      year: 1,
      term: "first",
      includeInLatinHonors: false,
    },
    { id: 3, name: "Biology", grades: 1.75, units: 12, year: 2, term: "mid" },
  ]);
  const blob = workbookModule.createLatinHonorsWorkbook(report);

  assert.ok(blob instanceof Blob);
  assert.equal(blob.type, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  const workbook = XLSX.read(await blob.arrayBuffer(), { type: "array", cellNF: true });
  assert.deepEqual(workbook.SheetNames, ["Semester Summary", "Course Details"]);

  const summaryRows = XLSX.utils.sheet_to_json(workbook.Sheets["Semester Summary"], {
    header: 1,
    raw: true,
  });
  assert.ok(summaryRows.some((row) => row.includes("Cum Laude")));
  assert.ok(summaryRows.some((row) => row.includes("University Scholar")));
  assert.ok(summaryRows.some((row) => row.includes("College Scholar")));

  const detailRows = XLSX.utils.sheet_to_json(workbook.Sheets["Course Details"], {
    raw: true,
  });
  assert.equal(detailRows.length, 3);
  assert.deepEqual(detailRows.map(({ Subject }) => Subject), ["Mathematics", "PE", "Biology"]);
  assert.equal(detailRows[1]["Counts toward Latin Honors"], "No");
  assert.equal(detailRows[1]["Academic scholarship standing"], "University Scholar");
  assert.equal(workbook.Sheets["Semester Summary"].D2.z, "0.0000");
  assert.equal(workbook.Sheets["Semester Summary"].H2.z, "0.00");
  assert.equal(workbook.Sheets["Semester Summary"].F5.z, "0.00");
  assert.equal(workbook.Sheets["Course Details"].F2.z, "0.00");
});

test("[AC-LATINHONORS-EXCEL2] empty data still creates valid workbook sheets", async () => {
  assert.ok(workbookModule, "Latin Honors workbook generator is missing");
  const blob = workbookModule.createLatinHonorsWorkbook(buildLatinHonorsExportData([]));
  const workbook = XLSX.read(await blob.arrayBuffer(), { type: "array" });

  assert.deepEqual(workbook.SheetNames, ["Semester Summary", "Course Details"]);
  assert.equal(
    XLSX.utils.sheet_to_json(workbook.Sheets["Course Details"]).length,
    0,
  );
});
