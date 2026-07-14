import { useEffect, useState, FormEvent } from "react";
import { checkAdminPassword } from "../firebase/adminAuth";
import {
  fetchGlobalStats,
  fetchDailyStats,
  VisitorStats,
  DailyStat,
} from "../firebase/visitorService";

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

  // Load stats after successful auth
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    const load = async () => {
      setLoadingStats(true);
      setStatsError("");
      try {
        const [globalStats, dailyStats] = await Promise.all([
          fetchGlobalStats(),
          fetchDailyStats(30),
        ]);
        if (!cancelled) {
          setStats(globalStats);
          setDaily(dailyStats);
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError(
            err instanceof Error ? err.message : "Failed to load stats",
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

  const cardBg = isDark ? "bg-dark-primary" : "bg-light-primary";
  const textColor = isDark ? "text-dark-content" : "text-light-content";
  const inputBg = isDark ? "bg-dark-secondary" : "bg-light-secondary";

  const maxDailyVisits = Math.max(1, ...daily.map((d) => d.visits));

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
                  <div className="text-xs opacity-60 mt-1">Total Visits</div>
                </div>
                <div className={`rounded-xl p-4 ${inputBg}`}>
                  <div className="text-3xl font-bold">
                    {stats.uniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    Unique Visitors
                  </div>
                </div>
              </div>
            )}

            {/* Daily breakdown chart */}
            {!loadingStats && daily.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-3 opacity-70">
                  Last {daily.length} Days
                </h2>
                <div className="flex flex-col gap-1">
                  {daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-2 text-xs">
                      <span className="w-24 opacity-60 shrink-0">{d.date}</span>
                      <div className={`flex-1 rounded ${inputBg} overflow-hidden`}>
                        <div
                          className={`h-5 rounded ${
                            isDark ? "bg-dark-accent-1" : "bg-light-accent-1"
                          }`}
                          style={{
                            width: `${(d.visits / maxDailyVisits) * 100}%`,
                            minWidth: d.visits > 0 ? "8px" : "0",
                          }}
                          title={`${d.visits} visits (${d.uniqueVisitors} unique)`}
                        />
                      </div>
                      <span className="w-20 text-right shrink-0">
                        {d.visits} <span className="opacity-40">/ {d.uniqueVisitors}u</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loadingStats && daily.length === 0 && stats && (
              <div className="opacity-50 text-sm text-center py-4">
                No daily breakdown data yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;