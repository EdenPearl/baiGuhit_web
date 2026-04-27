import { useCallback, useEffect, useState } from "react";

const DEFAULT_GET_ALL_ENDPOINT = (limit = 10) =>
  `http://localhost:8000/game/leaderboard?limit=${limit}`;

const STATUS_KEYS = ["easy", "medium", "hard", "expert", "master"];

const createEmptyLeaderboards = () => ({
  easy: [],
  medium: [],
  hard: [],
  expert: [],
  master: [],
});

const toPoints = (value) => Number(value?.points) || 0;

const normalizeAndRank = (rows, limit) => {
  const grouped = createEmptyLeaderboards();

  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const status = String(item?.status || "").trim().toLowerCase();
    if (!STATUS_KEYS.includes(status)) return;
    grouped[status].push(item);
  });

  STATUS_KEYS.forEach((status) => {
    grouped[status] = grouped[status]
      .sort((a, b) => toPoints(b) - toPoints(a))
      .slice(0, limit);
  });

  return grouped;
};

const useGetAllLeaderboards = (
  limit = 10,
  enabled = true,
  customEndpointFn = DEFAULT_GET_ALL_ENDPOINT
) => {
  const [leaderboards, setLeaderboards] = useState(createEmptyLeaderboards());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllLeaderboards = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = customEndpointFn(limit);
      // ...existing code...
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      // ...existing code...

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message || "Failed to fetch all leaderboards"
        );
      }

      const ranked = normalizeAndRank(payload?.data, limit);
      // ...existing code...

      setLeaderboards(ranked);
      setLoading(false);
    } catch (err) {
      const errorMsg = err?.message || "Unable to load leaderboards.";
      // ...existing code...
      setError(errorMsg);
      setLeaderboards(createEmptyLeaderboards());
      setLoading(false);
    }
  }, [enabled, limit, customEndpointFn]);

  useEffect(() => {
    fetchAllLeaderboards();
  }, [fetchAllLeaderboards]);

  return {
    leaderboards,
    loading,
    error,
    refetch: fetchAllLeaderboards,
  };
};

export default useGetAllLeaderboards;
