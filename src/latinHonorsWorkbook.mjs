import * as XLSX from "xlsx";

const TERM_LABELS = { first: "First Sem", mid: "Mid Sem", second: "Second Sem" };

export const createLatinHonorsWorkbook = (data) => {
  const workbook = XLSX.utils.book_new();
  const summaryRows = [
    ["GWA Calculator - Latin Honors Academic Summary"],
    [
      "Overall Latin Honor",
      data.overallSummary.latinHonor || "Outside listed honor ranges",
      "Cumulative GWA",
      data.overallSummary.gwa,
      "Total Units",
      data.overallSummary.totalUnits,
      "Total Points",
      data.overallSummary.totalPoints,
    ],
    [],
    [
      "Academic Year",
      "Semester",
      "Semester GWA",
      "Included Courses",
      "Included Units",
      "Included Points",
      "Academic Scholarship Standing",
    ],
    ...data.semesterSummaries.map((period) => [
      `Year ${period.year}`,
      TERM_LABELS[period.term],
      period.latinHonorsSummary.gwa,
      period.latinHonorsSummary.courseCount,
      period.latinHonorsSummary.totalUnits,
      period.latinHonorsSummary.totalPoints,
      period.scholarshipSummary.academicStanding || "No scholarship range",
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  for (const reference of ["D2", ...data.semesterSummaries.map((_, index) => `C${index + 5}`)]) {
    if (summarySheet[reference]) summarySheet[reference].z = "0.0000";
  }
  for (const reference of ["H2", ...data.semesterSummaries.map((_, index) => `F${index + 5}`)]) {
    if (summarySheet[reference]) summarySheet[reference].z = "0.00";
  }
  summarySheet["!cols"] = [
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 17 },
    { wch: 15 },
    { wch: 16 },
    { wch: 30 },
    { wch: 16 },
  ];
  summarySheet["!autofilter"] = { ref: `A4:G${Math.max(4, summaryRows.length)}` };
  summarySheet["!freeze"] = { xSplit: 0, ySplit: 4, topLeftCell: "A5", activePane: "bottomLeft", state: "frozen" };
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Semester Summary");

  const standingByPeriod = new Map(
    data.semesterSummaries.map((period) => [
      `${period.year}:${period.term}`,
      period.scholarshipSummary.academicStanding || "No scholarship range",
    ]),
  );
  const courseRows = data.courseDetails.map((course) => ({
    "Academic Year": `Year ${course.year}`,
    Semester: TERM_LABELS[course.term],
    Subject: course.name,
    Grade: course.grades,
    Units: course.units,
    Points: course.points,
    "Counts toward Latin Honors": course.includeInLatinHonors ? "Yes" : "No",
    "Academic scholarship standing": standingByPeriod.get(`${course.year}:${course.term}`),
  }));
  const courseSheet = XLSX.utils.json_to_sheet(courseRows, {
    header: [
      "Academic Year",
      "Semester",
      "Subject",
      "Grade",
      "Units",
      "Points",
      "Counts toward Latin Honors",
      "Academic scholarship standing",
    ],
  });
  for (let index = 0; index < data.courseDetails.length; index += 1) {
    const row = index + 2;
    courseSheet[`D${row}`].z = "0.00";
    courseSheet[`F${row}`].z = "0.00";
  }
  courseSheet["!cols"] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 34 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 25 },
    { wch: 30 },
  ];
  courseSheet["!autofilter"] = { ref: `A1:H${Math.max(1, courseRows.length + 1)}` };
  courseSheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };
  XLSX.utils.book_append_sheet(workbook, courseSheet, "Course Details");

  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
