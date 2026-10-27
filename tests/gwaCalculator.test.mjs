import assert from "node:assert/strict";
import test from "node:test";

const calculator = await import("../src/gwaCalculator.mjs").catch(() => null);

const getCalculator = () => {
  assert.ok(calculator, "GWA calculator helpers have not been implemented yet");
  return calculator;
};

test("[AC-MODE1026-E1] empty entries return zero summary values", () => {
  const { calculateSummary } = getCalculator();

  assert.deepEqual(calculateSummary([]), {
    courseCount: 0,
    totalUnits: 0,
    totalPoints: 0,
    gwa: 0,
    academicStanding: "",
  });
});

test("[AC-MODE1026-E1] rows with only zero units return zero summary values", () => {
  const { calculateSummary } = getCalculator();

  assert.deepEqual(
    calculateSummary([
      { id: 0, grades: 1.25, units: 0 },
      { id: 1, grades: 2, units: 0 },
    ]),
    {
      courseCount: 0,
      totalUnits: 0,
      totalPoints: 0,
      gwa: 0,
      academicStanding: "",
    },
  );
});

test("[AC-MODE1026-F2] summary ignores zero-unit rows", () => {
  const { calculateSummary } = getCalculator();

  assert.deepEqual(
    calculateSummary([
      { id: 0, grades: 0, units: 0 },
      { id: 1, grades: 1.25, units: 3, name: "Mathematics" },
      { id: 2, grades: 1.75, units: 4 },
      { id: 3, grades: 2, units: 0 },
    ]),
    {
      courseCount: 2,
      totalUnits: 7,
      totalPoints: 10.75,
      gwa: 1.5357,
      academicStanding: "",
    },
  );
});

test("[AC-MODE1026-F4] Clear All detects shared rows with partial data", () => {
  const { hasCoursesToClear } = getCalculator();

  assert.equal(typeof hasCoursesToClear, "function");
  assert.equal(hasCoursesToClear([{ id: 0, grades: 1.25, units: 0 }]), true);
  assert.equal(hasCoursesToClear([{ id: 0, grades: 0, units: 0 }]), false);
  assert.equal(
    hasCoursesToClear([
      { id: 0, grades: 0, units: 0 },
      { id: 1, grades: 0, units: 0 },
    ]),
    true,
  );
});

test("[AC-MODE1026-F5] academic standing preserves GWA and unit thresholds", () => {
  const { getAcademicStanding } = getCalculator();

  assert.equal(getAcademicStanding(1, 10), "");
  assert.equal(getAcademicStanding(1.5, 11), "University Scholar");
  assert.equal(getAcademicStanding(1.505, 11), "");
  assert.equal(getAcademicStanding(1.51, 11), "College Scholar");
  assert.equal(getAcademicStanding(1.75, 11), "College Scholar");
  assert.equal(getAcademicStanding(1.76, 11), "Dean's Lister");
  assert.equal(getAcademicStanding(2, 11), "Dean's Lister");
  assert.equal(getAcademicStanding(2.0001, 11), "");
});

test("[AC-MODE1026-E1] grade stepping follows the existing allowed grade values", () => {
  const { stepGrade } = getCalculator();

  assert.equal(stepGrade(1, -1), 1);
  assert.equal(stepGrade(1, 1), 1.25);
  assert.equal(stepGrade(3, 1), 4);
  assert.equal(stepGrade(4, -1), 3);
  assert.equal(stepGrade(5, 1), 5);
});

test("[AC-MODE1026-E1] unit stepping stays between one and ten", () => {
  const { stepUnit } = getCalculator();

  assert.equal(stepUnit(1, -1), 1);
  assert.equal(stepUnit(3, -1), 2);
  assert.equal(stepUnit(3, 1), 4);
  assert.equal(stepUnit(10, 1), 10);
});
