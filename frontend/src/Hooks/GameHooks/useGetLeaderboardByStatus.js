import { useCallback, useEffect, useState } from "react";

const DEFAULT_GET_BY_STATUS_ENDPOINT = (status, limit = 10) =>
  `http://localhost:8000/game/leaderboard/${status}?limit=${limit}`;

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
    if (!enabled || !status) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = customEndpointFn(status, limit);
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message ||
            `Failed to fetch leaderboard for status: ${status}`
        );
      }

      setLeaderboard(Array.isArray(payload?.data) ? payload.data : []);
      setLoading(false);
    } catch (err) {
      const errorMsg =
        err?.message || `Unable to load leaderboard for ${status}.`;
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
