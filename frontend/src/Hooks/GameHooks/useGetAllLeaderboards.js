import { useCallback, useEffect, useState } from "react";

const DEFAULT_GET_ALL_ENDPOINT = (limit = 10) =>
  `http://localhost:8000/game/leaderboard?limit=${limit}`;

const useGetAllLeaderboards = (
  limit = 10,
  enabled = true,
  customEndpointFn = DEFAULT_GET_ALL_ENDPOINT
) => {
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllLeaderboards = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = customEndpointFn(limit);
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message || "Failed to fetch all leaderboards"
        );
      }

      // Normalize the data by status
      const organizedData = {};
      if (Array.isArray(payload?.data)) {
        payload.data.forEach((item) => {
          const status = (item?.status || "unknown").toLowerCase();
          if (!organizedData[status]) {
            organizedData[status] = [];
          }
          organizedData[status].push(item);
        });
      }

      setLeaderboards(organizedData);
      setLoading(false);
    } catch (err) {
      const errorMsg = err?.message || "Unable to load leaderboards.";
      setError(errorMsg);
      setLeaderboards({});
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
