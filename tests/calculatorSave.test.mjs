import assert from "node:assert/strict";
import test from "node:test";

const calculatorSave = await import("../src/calculatorSave.mjs").catch(() => null);

const getSaveHelpers = () => {
  assert.ok(calculatorSave, "calculator save helpers have not been implemented yet");
  return calculatorSave;
};

const makeStorage = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};

test("[AC-SAVE1027-F1] scholarship course parsing keeps valid courses and empty draft rows", () => {
  const { parseScholarshipCourses } = getSaveHelpers();

  assert.deepEqual(
    parseScholarshipCourses([
      { id: 2, name: "Mathematics", grades: 1.25, units: 3 },
      { id: 3, grades: 0, units: 0 },
    ]),
    [
      { id: 2, name: "Mathematics", grades: 1.25, units: 3 },
      { id: 3, grades: 0, units: 0 },
    ],
  );
  assert.deepEqual(
    parseScholarshipCourses([
      { id: 2, grades: 6, units: 3 },
      { id: 3, grades: 1.25, units: 100 },
    ]),
    [],
  );
});

test("[AC-SAVE1027-F3] a backup round trip preserves both calculator course lists", () => {
  const { createCourseBackup, parseCourseBackup } = getSaveHelpers();
  const scholarshipCourses = [
    { id: 4, name: "Mathematics", grades: 1.25, units: 3 },
    { id: 5, grades: 0, units: 0 },
  ];
  const latinHonorsCourses = [
    {
      id: 7,
      name: "Mathematics",
      grades: 1.25,
      units: 3,
      year: 1,
      term: "first",
      includeInLatinHonors: true,
    },
  ];

  assert.deepEqual(
    parseCourseBackup(createCourseBackup({ scholarshipCourses, latinHonorsCourses })),
    { scholarshipCourses, latinHonorsCourses },
  );
});

test("[AC-SAVE1027-E1] backup import rejects unsupported versions and partial invalid data", () => {
  const { createCourseBackup, parseCourseBackup } = getSaveHelpers();
  const backup = JSON.parse(
    createCourseBackup({ scholarshipCourses: [], latinHonorsCourses: [] }),
  );

  assert.throws(
    () => parseCourseBackup(JSON.stringify({ ...backup, version: 2 })),
    /version/i,
  );
  assert.throws(
    () =>
      parseCourseBackup(
        JSON.stringify({
          ...backup,
          scholarshipCourses: [
            { id: 1, grades: 1.25, units: 3 },
            { id: 2, grades: 6, units: 3 },
          ],
        }),
      ),
    /course/i,
  );
  assert.throws(() => parseCourseBackup("not a backup"), /json|save copy/i);
});

test("[AC-SAVE1027-F1] saved data migrates Latin Honors courses from its legacy browser key", () => {
  const { LEGACY_LATIN_HONORS_STORAGE_KEY, loadCalculatorData } = getSaveHelpers();
  const latinHonorsCourses = [
    { id: 2, grades: 1.5, units: 4, year: 2, term: "mid" },
  ];
  const storage = makeStorage({
    [LEGACY_LATIN_HONORS_STORAGE_KEY]: JSON.stringify(latinHonorsCourses),
  });

  assert.deepEqual(loadCalculatorData(storage), {
    scholarshipCourses: [],
    latinHonorsCourses: [{ ...latinHonorsCourses[0], includeInLatinHonors: true }],
  });
});

test("[AC-SAVE1027-F1] autosave writes both course lists for the next page load", () => {
  const { SAVE_STORAGE_KEY, loadCalculatorData, saveCalculatorData } =
    getSaveHelpers();
  const storage = makeStorage();
  const data = {
    scholarshipCourses: [
      { id: 0, name: "Mathematics", grades: 1.25, units: 3 },
    ],
    latinHonorsCourses: [
      {
        id: 4,
        name: "Biology",
        grades: 1.5,
        units: 4,
        year: 1,
        term: "second",
        includeInLatinHonors: true,
      },
    ],
  };

  saveCalculatorData(storage, data);

  assert.notEqual(storage.getItem(SAVE_STORAGE_KEY), null);
  assert.deepEqual(loadCalculatorData(storage), data);
});

test("[AC-SAVE1027-F6] saved mode preferences restore with safe defaults", () => {
  const {
    PREFERENCES_STORAGE_KEY,
    loadCalculatorPreferences,
    saveCalculatorPreferences,
  } = getSaveHelpers();
  const storage = makeStorage();

  assert.deepEqual(loadCalculatorPreferences(storage), {
    mode: "original",
    computationMode: "scholarship",
  });

  saveCalculatorPreferences(storage, {
    mode: "modern",
    computationMode: "latin-honors",
  });
  assert.deepEqual(loadCalculatorPreferences(storage), {
    mode: "modern",
    computationMode: "latin-honors",
  });

  storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ mode: "broken", computationMode: "broken" }));
  assert.deepEqual(loadCalculatorPreferences(storage), {
    mode: "original",
    computationMode: "scholarship",
  });
});
