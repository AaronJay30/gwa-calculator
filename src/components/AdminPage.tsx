import { useEffect, useState, FormEvent } from "react";
import { checkAdminPassword } from "../firebase/adminAuth";
import {
  fetchGlobalStats,
  fetchDailyStats,
  VisitorStats,
  DailyStat,
} from "../firebase/visitorService";
import VisitorAnalyticsChart from "./VisitorAnalyticsChart";
import {
  fillDailyStats,
  getPeakDays,
  getPresetDateRange,
  DateRangePreset,
} from "../visitorAnalytics.mjs";

interface Props {
  onClose: () => void;
  isDark: boolean;
}

const AdminPage: React.FC<Props> = ({ onClose, isDark }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [rangeDefaults] = useState(() => getPresetDateRange("month"));
  const [rangeMode, setRangeMode] = useState<DateRangePreset | "custom">(
    "month",
  );
  const [dateRange, setDateRange] = useState(rangeDefaults);
  const [customStartDate, setCustomStartDate] = useState(rangeDefaults.startDate);
  const [customEndDate, setCustomEndDate] = useState(rangeDefaults.endDate);
  const [rangeError, setRangeError] = useState("");
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [dailyError, setDailyError] = useState("");

  // Lifetime totals do not change with the selected chart range.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    const load = async () => {
      setLoadingStats(true);
      setStatsError("");
      try {
        const globalStats = await fetchGlobalStats();
        if (!cancelled) setStats(globalStats);
      } catch (err) {
        if (!cancelled) {
          setStatsError(
            err instanceof Error ? err.message : "Failed to load lifetime stats",
          );
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  // Fetch only the selected date range and ignore stale responses.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    const load = async () => {
      setLoadingDaily(true);
      setDailyError("");
      try {
        const records = await fetchDailyStats(
          dateRange.startDate,
          dateRange.endDate,
        );
        if (!cancelled) {
          setDaily(
            fillDailyStats(dateRange.startDate, dateRange.endDate, records),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setDailyError(
            err instanceof Error ? err.message : "Failed to load daily analytics",
          );
        }
      } finally {
        if (!cancelled) setLoadingDaily(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [authed, dateRange.startDate, dateRange.endDate]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (checking || !password) return;
    setChecking(true);
    setError("");
    try {
      const ok = await checkAdminPassword(password);
      if (!ok) {
        setError("Wrong password");
      } else {
        setAuthed(true);
        setPassword("");
      }
    } finally {
      setChecking(false);
    }
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setRangeMode(preset);
    setDateRange(getPresetDateRange(preset));
    setRangeError("");
  };

  const handleCustomSelect = () => {
    setRangeMode("custom");
    setCustomStartDate(dateRange.startDate);
    setCustomEndDate(dateRange.endDate);
    setRangeError("");
  };

  const handleCustomApply = () => {
    if (!customStartDate || !customEndDate) {
      setRangeError("Choose both a start date and an end date.");
      return;
    }
    if (customStartDate > customEndDate) {
      setRangeError("The start date must be on or before the end date.");
      return;
    }
    if (customEndDate > rangeDefaults.endDate) {
      setRangeError("The end date cannot be in the future.");
      return;
    }

    setDateRange({
      startDate: customStartDate,
      endDate: customEndDate,
    });
    setRangeError("");
  };

  const cardBg = isDark ? "bg-dark-primary" : "bg-light-primary";
  const textColor = isDark ? "text-dark-content" : "text-light-content";
  const inputBg = isDark ? "bg-dark-secondary" : "bg-light-secondary";
  const borderColor = isDark ? "border-dark-content/10" : "border-light-content/10";
  const filterButtonClass = (selected: boolean) =>
    `rounded-lg border px-3 py-2 text-sm font-medium transition ${
      selected
        ? isDark
          ? "border-dark-accent-1 bg-dark-accent-1 text-dark-primary"
          : "border-light-accent-1 bg-light-accent-1 text-white"
        : `${borderColor} hover:bg-current/5`
    }`;
  const peakDays = getPeakDays(daily);
  const peakVisits = peakDays[0]?.visits ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Admin dashboard">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 ${cardBg} ${textColor}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">📊 Visitor Analytics</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin"
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xl hover:opacity-70 ${inputBg}`}>
            ×
          </button>
        </div>

        {/* Password gate */}
        {!authed && (
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <p className="text-sm opacity-70">
              Enter the admin password to view analytics.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`rounded-lg px-3 py-2 outline-none ${inputBg}`}
              autoFocus
            />
            {error && <span className="text-red-400 text-sm">{error}</span>}
            <button
              type="submit"
              disabled={!password || checking}
              className={`rounded-lg py-2 px-3 font-semibold disabled:opacity-40 ${
                isDark ? "bg-dark-accent-1" : "bg-light-accent-1"
              } text-white`}>
              {checking ? "Checking…" : "Unlock"}
            </button>
          </form>
        )}

        {/* Stats dashboard */}
        {authed && (
          <div className="flex flex-col gap-6">
            {statsError && (
              <div className="text-red-400 text-sm text-center">
                {statsError}
              </div>
            )}

            {loadingStats && (
              <div className="opacity-60 text-sm text-center py-8">
                Loading…
              </div>
            )}

            {/* Summary cards */}
            {!loadingStats && stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-4 ${inputBg}`}>
                  <div className="text-3xl font-bold">
                    {stats.totalVisits.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-60 mt-1">All-time Visits</div>
                </div>
                <div className={`rounded-xl p-4 ${inputBg}`}>
                  <div className="text-3xl font-bold">
                    {stats.uniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    All-time Unique Visitors
                  </div>
                </div>
              </div>
            )}

            <section className="flex flex-col gap-4" aria-label="Daily visitor analytics">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Daily traffic</h2>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Date range">
                  <button
                    type="button"
                    aria-pressed={rangeMode === "week"}
                    onClick={() => handlePresetChange("week")}
                    className={filterButtonClass(rangeMode === "week")}>
                    Last week
                  </button>
                  <button
                    type="button"
                    aria-pressed={rangeMode === "month"}
                    onClick={() => handlePresetChange("month")}
                    className={filterButtonClass(rangeMode === "month")}>
                    Last 30 days
                  </button>
                  <button
                    type="button"
                    aria-pressed={rangeMode === "custom"}
                    onClick={handleCustomSelect}
                    className={filterButtonClass(rangeMode === "custom")}>
                    Custom
                  </button>
                </div>
              </div>

              {rangeMode === "custom" && (
                <div className={`flex flex-wrap items-end gap-3 rounded-xl p-3 ${inputBg}`}>
                  <label className="flex flex-col gap-1 text-xs opacity-80">
                    <span>Start date</span>
                    <input
                      type="date"
                      aria-label="Start date"
                      max={rangeDefaults.endDate}
                      value={customStartDate}
                      onChange={(event) => {
                        setCustomStartDate(event.target.value);
                        setRangeError("");
                      }}
                      className={`rounded-lg px-2 py-2 text-sm outline-none ${inputBg}`}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs opacity-80">
                    <span>End date</span>
                    <input
                      type="date"
                      aria-label="End date"
                      max={rangeDefaults.endDate}
                      value={customEndDate}
                      onChange={(event) => {
                        setCustomEndDate(event.target.value);
                        setRangeError("");
                      }}
                      className={`rounded-lg px-2 py-2 text-sm outline-none ${inputBg}`}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      isDark
                        ? "bg-dark-accent-1 text-dark-primary"
                        : "bg-light-accent-1 text-white"
                    }`}>
                    Apply range
                  </button>
                </div>
              )}

              {rangeError && (
                <p className="text-sm text-red-400" role="alert">
                  {rangeError}
                </p>
              )}
              {dailyError && (
                <p className="text-sm text-red-400" role="alert">
                  {dailyError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                {!loadingDaily && !dailyError && (
                  <p className="text-sm font-semibold" aria-live="polite">
                    {peakVisits > 0
                      ? `Peak traffic: ${peakDays.map((day) => day.date).join(", ")} · ${peakVisits.toLocaleString()} visits`
                      : "No visits recorded in this range."}
                  </p>
                )}
                <p className="text-xs opacity-60" aria-live="polite">
                  {dateRange.startDate} – {dateRange.endDate}
                </p>
              </div>

              {loadingDaily ? (
                <p className="py-12 text-center text-sm opacity-60" role="status">
                  Loading daily analytics…
                </p>
              ) : dailyError ? null : (
                <VisitorAnalyticsChart
                  data={daily}
                  peakDates={peakDays.map((day) => day.date)}
                  isDark={isDark}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
