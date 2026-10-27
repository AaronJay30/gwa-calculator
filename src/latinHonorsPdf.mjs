import { jsPDF } from "jspdf";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LEFT = 14;
const RIGHT = PAGE_WIDTH - LEFT;
const BOTTOM = PAGE_HEIGHT - 15;
const SUBJECT_LINES_PER_ROW = 55;
const GOLD = [195, 154, 50];
const NAVY = [30, 43, 77];
const TEXT = [35, 43, 58];
const MUTED = [91, 103, 122];
const TERM_LABELS = { first: "First Sem", mid: "Mid Sem", second: "Second Sem" };

const format = (value) => Number(value).toFixed(4);
const formatPoints = (value) => Number(value).toFixed(2);

export const createLatinHonorsPdf = (data) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 17;
  let activePeriod = null;

  const text = (value, x = LEFT, options = {}) =>
    doc.text(String(value), x, y, options);

  const addPage = () => {
    doc.addPage();
    y = 17;
    doc.setTextColor(...TEXT);
  };

  const ensureSpace = (height, repeatPeriod = false) => {
    if (y + height <= BOTTOM) return;
    addPage();
    if (repeatPeriod && activePeriod) drawPeriodHeading(activePeriod, true);
  };

  const drawPeriodHeading = (period, continued = false) => {
    const yearLabel = `Year ${period.year} | ${TERM_LABELS[period.term]}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    text(continued ? `${yearLabel} (continued)` : yearLabel);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const summary = period.latinHonorsSummary;
    const standing = period.scholarshipSummary.academicStanding || "No scholarship range";
    text(`Semester GWA: ${format(summary.gwa)}  |  Academic standing: ${standing}`);
    y += 6;

    doc.setFillColor(...NAVY);
    doc.roundedRect(LEFT, y - 3.2, RIGHT - LEFT, 7, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    text("Subject", LEFT + 2);
    text("Grade", 111, { align: "right" });
    text("Units", 133, { align: "right" });
    text("Points", 158, { align: "right" });
    text("Status", 194, { align: "right" });
    y += 7;
    doc.setTextColor(...TEXT);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...NAVY);
  text("GWA Calculator");
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  text("Latin Honors academic record");
  y += 7;

  doc.setFillColor(...GOLD);
  doc.roundedRect(LEFT, y - 2, RIGHT - LEFT, 30, 3, 3, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CUMULATIVE LATIN HONOR", LEFT + 5, y + 5);
  doc.setFontSize(16);
  doc.text(data.overallSummary.latinHonor || "Outside listed honor ranges", LEFT + 5, y + 19);
  doc.setFontSize(9);
  doc.text(`GWA ${format(data.overallSummary.gwa)}`, RIGHT - 5, y + 18, { align: "right" });
  y += 34;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const caveat = "This is an estimate using the ranges provided. Official CLSU eligibility may include other requirements.";
  doc.text(doc.splitTextToSize(caveat, RIGHT - LEFT), LEFT, y);
  y += 10;

  const overall = data.overallSummary;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  text(`Included courses: ${overall.courseCount}    Units: ${overall.totalUnits}    Points: ${formatPoints(overall.totalPoints)}`);
  y += 11;

  if (!data.semesterSummaries.length) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    text("No courses have been saved yet.");
  }

  for (const period of data.semesterSummaries) {
    activePeriod = period;
    ensureSpace(22);
    drawPeriodHeading(period);

    for (const course of period.courses) {
      const name = course.name?.trim() || "Unnamed subject";
      const nameLines = doc.splitTextToSize(name, 77);
      for (let start = 0; start < nameLines.length; start += SUBJECT_LINES_PER_ROW) {
        const lines = nameLines.slice(start, start + SUBJECT_LINES_PER_ROW);
        const rowHeight = Math.max(7, lines.length * 4 + 2);
        ensureSpace(rowHeight, true);
        doc.setFontSize(lines.length > 1 ? 7.5 : 8);
        doc.setTextColor(...TEXT);
        doc.text(lines, LEFT + 2, y + 1);
        if (start === 0) {
          doc.setFontSize(8);
          doc.text(Number(course.grades).toFixed(2), 111, y + 1, { align: "right" });
          doc.text(String(course.units), 133, y + 1, { align: "right" });
          doc.text(formatPoints(course.grades * course.units), 158, y + 1, { align: "right" });
          const included = course.includeInLatinHonors !== false;
          doc.setTextColor(...(included ? MUTED : [170, 70, 70]));
          doc.text(included ? "Included" : "Excluded", 194, y + 1, { align: "right" });
        }
        doc.setDrawColor(225, 229, 235);
        doc.line(LEFT, y + rowHeight - 1, RIGHT, y + rowHeight - 1);
        y += rowHeight;
      }
    }

    y += 8;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${page} of ${pageCount}`, RIGHT, PAGE_HEIGHT - 7, { align: "right" });
  }

  return doc.output("blob");
};
