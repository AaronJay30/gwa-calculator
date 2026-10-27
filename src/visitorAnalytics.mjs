const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (!year || dateKey(date) !== key) {
    throw new RangeError(`Invalid local date key: ${key}`);
  }
  return date;
};

export const getPresetDateRange = (preset, today = new Date()) => {
  if (preset !== "week" && preset !== "month") {
    throw new RangeError(`Unknown date range preset: ${preset}`);
  }

  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - (preset === "week" ? 6 : 29));

  return { startDate: dateKey(start), endDate: dateKey(end) };
};

export const fillDailyStats = (startDate, endDate, records) => {
  if (startDate > endDate) return [];

  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  const byDate = new Map(records.map((record) => [record.date, record]));
  const series = [];

  for (const date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const key = dateKey(date);
    const record = byDate.get(key);
    series.push({
      date: key,
      visits: record?.visits ?? 0,
      uniqueVisitors: record?.uniqueVisitors ?? 0,
    });
  }

  return series;
};

export const getPeakDays = (records) => {
  const peakVisits = records.reduce(
    (highest, record) => Math.max(highest, record.visits),
    0,
  );
  return peakVisits > 0
    ? records.filter((record) => record.visits === peakVisits)
    : [];
};
