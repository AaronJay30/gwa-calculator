import assert from "node:assert/strict";
import test from "node:test";

const latinHonors = await import("../src/latinHonors.mjs").catch(() => null);
const latinHonorsExports = await import("../src/latinHonorsExports.mjs").catch(() => null);

const getLatinHonors = () => {
  assert.ok(latinHonors, "Latin Honors helpers have not been implemented yet");
  return latinHonors;
};

test("[AC-LATINHONORS-CALC1] classifies the supplied CLSU GWA ranges", () => {
  const { getLatinHonor } = getLatinHonors();

  assert.equal(getLatinHonor(1.2, 1), "Summa Cum Laude");
  assert.equal(getLatinHonor(1.2001, 1), "Magna Cum Laude");
  assert.equal(getLatinHonor(1.45, 1), "Magna Cum Laude");
  assert.equal(getLatinHonor(1.4501, 1), "Cum Laude");
  assert.equal(getLatinHonor(1.75, 1), "Cum Laude");
  assert.equal(getLatinHonor(1.7501, 1), "");
  assert.equal(getLatinHonor(1, 0), "");
});

test("[AC-LATINHONORS-CALC2] cumulative GWA weights courses by units", () => {
  const { calculateLatinHonorsSummary } = getLatinHonors();

  assert.deepEqual(
    calculateLatinHonorsSummary([
      { id: 1, grades: 1, units: 3, year: 1, term: "first" },
      { id: 2, grades: 2, units: 6, year: 1, term: "second" },
    ]),
    {
      courseCount: 2,
      totalUnits: 9,
      totalPoints: 15,
      gwa: 1.6667,
      latinHonor: "Cum Laude",
    },
  );
});

test("[AC-LATINHONORS-PERIOD1] period lookup keeps year and term records separate", () => {
  const { getCoursesForPeriod } = getLatinHonors();
  const courses = [
    { id: 1, grades: 1.25, units: 3, year: 1, term: "first" },
    { id: 2, grades: 1.5, units: 4, year: 1, term: "second" },
    { id: 3, grades: 1.75, units: 3, year: 2, term: "first" },
  ];

  assert.deepEqual(getCoursesForPeriod(courses, 1, "first"), [courses[0]]);
  assert.deepEqual(getCoursesForPeriod(courses, 2, "first"), [courses[2]]);
});

test("[AC-LATINHONORS-SUMMARY1] saved courses group by ascending year and populated semester", () => {
  const { getLatinHonorsYearGroups } = getLatinHonors();
  const courses = [
    { id: 1, grades: 1.25, units: 3, year: 2, term: "second" },
    { id: 2, grades: 1.5, units: 4, year: 1, term: "mid" },
    { id: 3, grades: 1.75, units: 3, year: 1, term: "first" },
    { id: 4, grades: 1.75, units: 3, year: 2, term: "second" },
  ];

  assert.deepEqual(getLatinHonorsYearGroups(courses), [
    {
      year: 1,
      terms: [
        { term: "first", courses: [courses[2]] },
        { term: "mid", courses: [courses[1]] },
      ],
    },
    { year: 2, terms: [{ term: "second", courses: [courses[0], courses[3]] }] },
  ]);
  assert.deepEqual(getLatinHonorsYearGroups([]), []);
});

test("[AC-LATINHONORS-CALC3] an excluded course does not affect totals or honor", () => {
  const { calculateLatinHonorsSummary } = getLatinHonors();

  assert.deepEqual(
    calculateLatinHonorsSummary([
      { id: 1, grades: 1, units: 3, year: 1, term: "first" },
      {
        id: 2,
        grades: 5,
        units: 99,
        year: 1,
        term: "first",
        includeInLatinHonors: false,
      },
    ]),
    {
      courseCount: 1,
      totalUnits: 3,
      totalPoints: 3,
      gwa: 1,
      latinHonor: "Summa Cum Laude",
    },
  );
});

test("[AC-LATINHONORS-CALC4] cutoffs use the unrounded average", () => {
  const { getLatinHonor } = getLatinHonors();

  assert.equal(getLatinHonor(1.20001, 20), "Magna Cum Laude");
  assert.equal(getLatinHonor(1.45001, 20), "Cum Laude");
});

test("[AC-LATINHONORS-CALC5] classification uses exact GWA even when display rounds to a cutoff", () => {
  const { calculateLatinHonorsSummary } = getLatinHonors();
  const courses = [
    ...Array.from({ length: 40 }, (_, id) => ({
      id,
      grades: 1.25,
      units: 99,
      year: 1,
      term: "first",
    })),
    { id: 40, grades: 1.25, units: 45, year: 1, term: "first" },
    ...Array.from({ length: 10 }, (_, index) => ({
      id: index + 41,
      grades: 1,
      units: 99,
      year: 1,
      term: "first",
    })),
    { id: 51, grades: 1, units: 10, year: 1, term: "first" },
  ];
  const summary = calculateLatinHonorsSummary(courses);

  assert.equal(summary.totalUnits, 5005);
  assert.equal(summary.gwa.toFixed(4), "1.2000");
  assert.equal(summary.latinHonor, "Magna Cum Laude");
});

test("[AC-LATINHONORS-EXPORT1] report data groups every saved course and semester standing", () => {
  assert.ok(latinHonorsExports, "Latin Honors export helpers are missing");
  const { buildLatinHonorsExportData } = latinHonorsExports;
  const courses = [
    { id: 1, name: "Math", grades: 1.25, units: 12, year: 1, term: "first" },
    {
      id: 2,
      name: "PE",
      grades: 1,
      units: 3,
      year: 1,
      term: "first",
      includeInLatinHonors: false,
    },
    { id: 3, name: "Biology", grades: 1.75, units: 6, year: 2, term: "mid" },
    { id: 4, name: "History", grades: 1.75, units: 6, year: 2, term: "mid" },
    { id: 5, name: "Physics", grades: 2, units: 11, year: 10, term: "second" },
  ];

  const report = buildLatinHonorsExportData(courses);

  assert.deepEqual(
    report.semesterSummaries.map(({ year, term, latinHonorsSummary, scholarshipSummary }) => ({
      year,
      term,
      gwa: latinHonorsSummary.gwa,
      units: latinHonorsSummary.totalUnits,
      standing: scholarshipSummary.academicStanding,
    })),
    [
      { year: 1, term: "first", gwa: 1.25, units: 12, standing: "University Scholar" },
      { year: 2, term: "mid", gwa: 1.75, units: 12, standing: "College Scholar" },
      { year: 10, term: "second", gwa: 2, units: 11, standing: "Dean's Lister" },
    ],
  );
  assert.deepEqual(
    report.courseDetails.map(({ id, name, includeInLatinHonors, points }) => ({
      id,
      name,
      includeInLatinHonors,
      points,
    })),
    [
      { id: 1, name: "Math", includeInLatinHonors: true, points: 15 },
      { id: 2, name: "PE", includeInLatinHonors: false, points: 3 },
      { id: 3, name: "Biology", includeInLatinHonors: true, points: 10.5 },
      { id: 4, name: "History", includeInLatinHonors: true, points: 10.5 },
      { id: 5, name: "Physics", includeInLatinHonors: true, points: 22 },
    ],
  );
  assert.equal(report.overallSummary.totalUnits, 35);
  assert.equal(report.overallSummary.latinHonor, "Cum Laude");
});

test("[AC-LATINHONORS-EXPORT2] empty saved courses produce an empty export", () => {
  assert.ok(latinHonorsExports, "Latin Honors export helpers are missing");
  const { buildLatinHonorsExportData } = latinHonorsExports;

  assert.deepEqual(buildLatinHonorsExportData([]), {
    overallSummary: {
      courseCount: 0,
      totalUnits: 0,
      totalPoints: 0,
      gwa: 0,
      latinHonor: "",
    },
    semesterSummaries: [],
    courseDetails: [],
  });
});

test("[AC-LATINHONORS-STORAGE1] only valid stored course records are restored", () => {
  const { parseLatinHonorsCourses } = getLatinHonors();

  assert.deepEqual(parseLatinHonorsCourses("not json"), []);
  assert.deepEqual(parseLatinHonorsCourses({}), []);
  assert.deepEqual(
    parseLatinHonorsCourses([
      {
        id: 3,
        grades: 1.25,
        units: 99,
        year: 10,
        term: "mid",
        name: "Course",
        includeInLatinHonors: true,
      },
      { id: "bad", grades: 1.25, units: 3, year: 1, term: "first" },
      { id: 4, grades: 1.25, units: 100, year: 1, term: "first" },
      { id: 5, grades: 1.25, units: 3, year: 11, term: "first" },
      { id: 6, grades: 1.25, units: 3, year: 1, term: "invalid" },
    ]),
    [
      {
        id: 3,
        grades: 1.25,
        units: 99,
        year: 10,
        term: "mid",
        name: "Course",
        includeInLatinHonors: true,
      },
    ],
  );
});

test("[AC-SAVE1027-F4] transfer copies only completed scholarship courses into the chosen period", () => {
  const { transferScholarshipCourses } = getLatinHonors();
  const scholarshipCourses = [
    { id: 4, name: "Mathematics", grades: 1.25, units: 3 },
    { id: 5, name: "Pending", grades: 0, units: 4 },
    { id: 6, name: "No units", grades: 1.5, units: 0 },
  ];
  const latinHonorsCourses = [
    { id: 8, name: "Existing", grades: 1.75, units: 3, year: 2, term: "first" },
  ];

  const result = transferScholarshipCourses(
    scholarshipCourses,
    latinHonorsCourses,
    3,
    "mid",
  );

  assert.deepEqual(result, {
    courses: [
      latinHonorsCourses[0],
      {
        id: 9,
        sourceScholarshipCourseId: 4,
        name: "Mathematics",
        grades: 1.25,
        units: 3,
        year: 3,
        term: "mid",
        includeInLatinHonors: true,
      },
    ],
    addedCount: 1,
    updatedCount: 0,
    skippedCount: 2,
  });
  assert.equal(scholarshipCourses[0].name, "Mathematics");
});

test("[AC-SAVE1027-F5] repeat transfer updates a linked course without changing its exclusion choice", () => {
  const { transferScholarshipCourses } = getLatinHonors();
  const scholarshipCourses = [
    { id: 4, name: "Mathematics", grades: 1.25, units: 4 },
  ];
  const existingLatinCourses = [
    {
      id: 20,
      sourceScholarshipCourseId: 4,
      name: "Old Mathematics",
      grades: 1.5,
      units: 3,
      year: 1,
      term: "first",
      includeInLatinHonors: false,
    },
  ];

  const result = transferScholarshipCourses(
    scholarshipCourses,
    existingLatinCourses,
    1,
    "first",
  );

  assert.deepEqual(result, {
    courses: [
      {
        ...existingLatinCourses[0],
        name: "Mathematics",
        grades: 1.25,
        units: 4,
      },
    ],
    addedCount: 0,
    updatedCount: 1,
    skippedCount: 0,
  });

  const repeated = transferScholarshipCourses(
    scholarshipCourses,
    result.courses,
    1,
    "first",
  );
  assert.equal(repeated.courses.length, 1);
  assert.equal(repeated.addedCount, 0);
  assert.equal(repeated.courses[0].includeInLatinHonors, false);
});

test("[AC-SAVE1027-F4] a linked scholarship course can be copied to a different period", () => {
  const { transferScholarshipCourses } = getLatinHonors();
  const scholarshipCourses = [
    { id: 4, name: "Mathematics", grades: 1.25, units: 3 },
  ];
  const firstPeriod = transferScholarshipCourses(
    scholarshipCourses,
    [],
    1,
    "first",
  );
  const secondPeriod = transferScholarshipCourses(
    scholarshipCourses,
    firstPeriod.courses,
    1,
    "second",
  );

  assert.equal(secondPeriod.courses.length, 2);
  assert.equal(secondPeriod.addedCount, 1);
  assert.equal(secondPeriod.courses[1].year, 1);
  assert.equal(secondPeriod.courses[1].term, "second");
});

test("[AC-SAVE1027-F5] scholarship course ids do not collide with retained transferred copies", () => {
  const { getNextScholarshipCourseId } = getLatinHonors();

  assert.equal(
    getNextScholarshipCourseId(
      [{ id: 0, grades: 0, units: 0 }],
      [{
        id: 12,
        sourceScholarshipCourseId: 4,
        grades: 1.25,
        units: 3,
        year: 1,
        term: "first",
      }],
    ),
    5,
  );
});
