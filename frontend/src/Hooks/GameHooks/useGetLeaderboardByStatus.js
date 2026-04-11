import { useCallback, useEffect, useState } from "react";

const DEFAULT_GET_BY_STATUS_ENDPOINT = (status, limit = 10) => {
  const rawStatus = typeof status === "string" ? status.trim() : "";
  const isAllStatuses = !rawStatus || rawStatus.toLowerCase() === "all";

  if (isAllStatuses) {
    return `http://localhost:8000/game/leaderboard?limit=${limit}`;
  }

  return `http://localhost:8000/game/leaderboard/${encodeURIComponent(
    rawStatus
  )}?limit=${limit}`;
};

const toPoints = (value) => Number(value?.points) || 0;

const useGetLeaderboardByStatus = (
  status,
  limit = 10,
  enabled = true,
  customEndpointFn = DEFAULT_GET_BY_STATUS_ENDPOINT
) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError("");

    const rawStatus = typeof status === "string" ? status.trim() : "";
    const isAllStatuses = !rawStatus || rawStatus.toLowerCase() === "all";
    const statusLabel = isAllStatuses ? "all" : rawStatus;

    try {
      const endpoint = customEndpointFn(status, limit);
      console.log("[LEADERBOARD BY STATUS] Fetch start:", {
        status: statusLabel,
        limit,
        endpoint,
      });

      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      console.log("[LEADERBOARD BY STATUS] Raw response:", {
        status: statusLabel,
        httpStatus: response.status,
        ok: response.ok,
        success: payload?.success,
        payloadStatus: payload?.status,
        rows: Array.isArray(payload?.data) ? payload.data.length : 0,
      });

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message ||
            `Failed to fetch leaderboard for status: ${statusLabel}`
        );
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const rankedRows = [...rows].sort((a, b) => toPoints(b) - toPoints(a));
      console.log("[LEADERBOARD BY STATUS] Ranked rows:", {
        status: statusLabel,
        rankedCount: rankedRows.length,
        topRow: rankedRows[0] || null,
      });
      setLeaderboard(rankedRows.slice(0, limit));
      setLoading(false);
    } catch (err) {
      const errorMsg =
        err?.message || `Unable to load leaderboard for ${statusLabel}.`;
      console.error("[LEADERBOARD BY STATUS] Fetch failed:", {
        status: statusLabel,
        error: errorMsg,
      });
      setError(errorMsg);
      setLeaderboard([]);
      setLoading(false);
    }
  }, [enabled, status, limit, customEndpointFn]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};

export default useGetLeaderboardByStatus;
