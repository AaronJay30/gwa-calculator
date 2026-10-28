import { useEffect, useState, type FormEvent } from "react";
import { checkAdminPassword } from "../firebase/adminAuth";
import { fetchGlobalStats, formatTimestamp } from "../firebase/visitorService";
import type { VisitorStats } from "../firebase/visitorService";
import { isValidGoogleAnalyticsMeasurementId } from "../googleAnalytics";
import {
  clearJosePeekSchedule,
  fetchJosePeekSchedule,
  saveJosePeekSchedule,
  triggerJosePeekNow,
} from "../firebase/josePeekService";

interface Props {
  onClose: () => void;
  isDark: boolean;
}

const GA4_DASHBOARD_URL = "https://analytics.google.com/analytics/web/";

const AdminPage: React.FC<Props> = ({ onClose, isDark }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [legacyStats, setLegacyStats] = useState<VisitorStats | null>(null);
  const [loadingLegacyStats, setLoadingLegacyStats] = useState(false);
  const [legacyStatsError, setLegacyStatsError] = useState("");
  const [josePeekSchedule, setJosePeekSchedule] = useState<number | null>(null);
  const [josePeekDateTime, setJosePeekDateTime] = useState("");
  const [loadingJosePeek, setLoadingJosePeek] = useState(false);
  const [savingJosePeek, setSavingJosePeek] = useState(false);
  const [josePeekLoadError, setJosePeekLoadError] = useState("");
  const [josePeekError, setJosePeekError] = useState("");
  const [josePeekNotice, setJosePeekNotice] = useState("");
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  const hasGoogleAnalytics = isValidGoogleAnalyticsMeasurementId(measurementId);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoadingLegacyStats(true);
    setLegacyStatsError("");
    fetchGlobalStats()
      .then((stats) => {
        if (!cancelled) setLegacyStats(stats);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setLegacyStatsError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the saved Firestore totals.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLegacyStats(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoadingJosePeek(true);
    setJosePeekLoadError("");
    fetchJosePeekSchedule()
      .then((schedule) => {
        if (!cancelled) setJosePeekSchedule(schedule);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setJosePeekLoadError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the Jose peek schedule.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingJosePeek(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
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
    } catch {
      setError("Could not verify the password. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleScheduleJosePeek = async (event: FormEvent) => {
    event.preventDefault();
    const date = new Date(josePeekDateTime);
    if (!josePeekDateTime || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      setJosePeekError("Choose a future date and time.");
      setJosePeekNotice("");
      return;
    }

    setSavingJosePeek(true);
    setJosePeekError("");
    setJosePeekNotice("");
    try {
      await saveJosePeekSchedule(date);
      setJosePeekSchedule(date.getTime());
      setJosePeekLoadError("");
      setJosePeekNotice("Jose’s peek is scheduled for all visitors.");
    } catch (saveError: unknown) {
      setJosePeekError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the schedule. Check the Firestore rules and try again.",
      );
    } finally {
      setSavingJosePeek(false);
    }
  };

  const handleTriggerJosePeekNow = async () => {
    setSavingJosePeek(true);
    setJosePeekError("");
    setJosePeekNotice("");
    try {
      const scheduledAt = await triggerJosePeekNow();
      setJosePeekSchedule(scheduledAt);
      setJosePeekDateTime("");
      setJosePeekLoadError("");
      setJosePeekNotice("Jose’s peek will start for all visitors in a few seconds.");
    } catch (triggerError: unknown) {
      setJosePeekError(
        triggerError instanceof Error
          ? triggerError.message
          : "Could not start the shared peek. Check the Firestore rules and try again.",
      );
    } finally {
      setSavingJosePeek(false);
    }
  };

  const handleClearJosePeek = async () => {
    setSavingJosePeek(true);
    setJosePeekError("");
    setJosePeekNotice("");
    try {
      await clearJosePeekSchedule();
      setJosePeekSchedule(null);
      setJosePeekLoadError("");
      setJosePeekDateTime("");
      setJosePeekNotice("The Jose peek schedule was cleared.");
    } catch (clearError: unknown) {
      setJosePeekError(
        clearError instanceof Error
          ? clearError.message
          : "Could not clear the schedule. Check the Firestore rules and try again.",
      );
    } finally {
      setSavingJosePeek(false);
    }
  };

  const cardBg = isDark ? "bg-dark-primary" : "bg-light-primary";
  const textColor = isDark ? "text-dark-content" : "text-light-content";
  const inputBg = isDark ? "bg-dark-secondary" : "bg-light-secondary";
  const borderColor = isDark ? "border-dark-content/10" : "border-light-content/10";
  const actionButton = isDark
    ? "bg-dark-accent-1 text-dark-primary"
    : "bg-light-accent-1 text-light-accent-text";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Admin dashboard">
      <div className={"max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-2xl " + cardBg + " " + textColor}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">📊 Visitor Analytics</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin"
            className={"flex h-9 w-9 items-center justify-center rounded-full text-xl hover:opacity-70 " + inputBg}>
            ×
          </button>
        </div>

        {!authed && (
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <p className="text-sm opacity-70">Enter the admin password to view analytics.</p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              aria-label="Admin password"
              className={"rounded-lg px-3 py-2 outline-none " + inputBg}
              autoFocus
            />
            {error && <span className="text-sm text-red-400" role="alert">{error}</span>}
            <button
              type="submit"
              disabled={!password || checking}
              className={"rounded-lg px-3 py-2 font-semibold disabled:opacity-40 " + actionButton}>
              {checking ? "Checking…" : "Unlock"}
            </button>
          </form>
        )}

        {authed && (
          <div className="flex flex-col gap-5">
            <section className={"rounded-xl border p-4 " + borderColor + " " + inputBg} aria-labelledby="ga4-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="ga4-heading" className="font-semibold">Google Analytics 4</h2>
                  <p className="mt-1 text-sm opacity-70">
                    View page views, active users, engagement, traffic sources, and device reports in GA4.
                  </p>
                </div>
                <a
                  href={GA4_DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80 " + actionButton}>
                  Open GA4 ↗
                </a>
              </div>
              <p className={"mt-4 rounded-lg border p-3 text-sm " + borderColor} role="status">
                {hasGoogleAnalytics
                  ? "A GA4 Measurement ID is configured. New reports begin from the deployment that includes it."
                  : "GA4 is not connected yet. Add a Measurement ID in your deployment settings, then rebuild and redeploy the site."}
              </p>
            </section>

            <section className={"rounded-xl border p-4 " + borderColor} aria-labelledby="legacy-heading">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 id="legacy-heading" className="font-semibold">Legacy Firestore totals</h2>
                  <p className="mt-1 text-sm opacity-70">
                    Saved visitor counts from before GA4. New page visits no longer update these totals.
                  </p>
                </div>
                {legacyStats?.updatedAt && (
                  <p className="text-xs opacity-60">
                    Last recorded: {formatTimestamp(legacyStats.updatedAt)}
                  </p>
                )}
              </div>

              {loadingLegacyStats ? (
                <p className="py-6 text-center text-sm opacity-60" role="status">Loading saved totals…</p>
              ) : legacyStatsError ? (
                <p className="mt-4 text-sm text-red-400" role="alert">{legacyStatsError}</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={"rounded-lg p-3 " + inputBg}>
                    <div className="text-2xl font-bold">
                      {(legacyStats?.totalVisits ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs opacity-60">Total visits before GA4</div>
                  </div>
                  <div className={"rounded-lg p-3 " + inputBg}>
                    <div className="text-2xl font-bold">
                      {(legacyStats?.uniqueVisitors ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs opacity-60">Unique visitors before GA4</div>
                  </div>
                </div>
              )}
            </section>

            <section className={"rounded-xl border p-4 " + borderColor + " " + inputBg} aria-labelledby="jose-peek-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="jose-peek-heading" className="font-semibold">Scheduled Jose peek</h2>
                  <p className="mt-1 text-sm opacity-70">
                    Jose smoothly peeks higher to a random height, pauses for 2–3 seconds, then hides for 3–5 seconds. Each visitor sees the 30-second schedule once. Showing it now replaces the scheduled time.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loadingJosePeek || savingJosePeek}
                  onClick={handleTriggerJosePeekNow}
                  className={"shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 " + borderColor}
                  title="Starts the shared animation in a few seconds and replaces any scheduled time">
                  {savingJosePeek ? "Sending…" : "Show now for everyone"}
                </button>
              </div>

              <form onSubmit={handleScheduleJosePeek} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor="jose-peek-datetime" className="mb-1 block text-sm font-medium">
                    Date and time (your local time)
                  </label>
                  <input
                    id="jose-peek-datetime"
                    type="datetime-local"
                    required
                    value={josePeekDateTime}
                    onChange={(event) => {
                      setJosePeekDateTime(event.target.value);
                      setJosePeekError("");
                      setJosePeekNotice("");
                    }}
                    className={"w-full rounded-lg px-3 py-2 outline-none focus-visible:ring-2 " + inputBg}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!josePeekDateTime || loadingJosePeek || Boolean(josePeekLoadError) || savingJosePeek}
                  className={"rounded-lg px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40 " + actionButton}>
                  {savingJosePeek ? "Saving…" : "Schedule peek"}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {loadingJosePeek ? (
                  <p className="text-sm opacity-70" role="status">Loading schedule…</p>
                ) : josePeekLoadError ? (
                  <p className="text-sm opacity-70">Schedule unavailable.</p>
                ) : josePeekSchedule === null ? (
                  <p className="text-sm opacity-70">No Jose peek is scheduled.</p>
                ) : (
                  <p className="text-sm" role="status">
                    Scheduled for {new Date(josePeekSchedule).toLocaleString()}.
                  </p>
                )}
                {josePeekSchedule !== null && (
                  <button
                    type="button"
                    disabled={savingJosePeek}
                    onClick={handleClearJosePeek}
                    className={"rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 " + borderColor}>
                    Clear schedule
                  </button>
                )}
              </div>
              {josePeekLoadError && <p className="mt-3 text-sm text-red-400" role="alert">Could not load the schedule: {josePeekLoadError}</p>}
              {josePeekError && <p className="mt-3 text-sm text-red-400" role="alert">{josePeekError}</p>}
              {josePeekNotice && <p className="mt-3 text-sm" role="status">{josePeekNotice}</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
