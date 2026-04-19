import { useCallback, useEffect, useState } from "react";

const DEFAULT_WRITE_TOP10_ENDPOINTS = [
  "https://ebaybaymo-server.onrender.com/game/write/top10",
];

const EMPTY_ROUND_DATA = {
  easy: [],
  medium: [],
  hard: [],
  expert: [],
  master: [],
};

const normalizePayload = (payload) => ({
  easy: Array.isArray(payload?.easy) ? payload.easy : [],
  medium: Array.isArray(payload?.medium) ? payload.medium : [],
  hard: Array.isArray(payload?.hard) ? payload.hard : [],
  expert: Array.isArray(payload?.expert) ? payload.expert : [],
  master: Array.isArray(payload?.master) ? payload.master : [],
});

const useWriteTop10 = (enabled = true, customEndpoints = DEFAULT_WRITE_TOP10_ENDPOINTS) => {
  const [writeTop10, setWriteTop10] = useState(EMPTY_ROUND_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWriteTop10 = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError("");

    let lastError = null;

    for (const endpoint of customEndpoints) {
      const requestEndpoint = String(endpoint || "").trim();
      if (!requestEndpoint) continue;

      try {
        const response = await fetch(requestEndpoint);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error || payload?.message || `Failed to fetch write leaderboard from ${requestEndpoint}`);
        }

        setWriteTop10(normalizePayload(payload));
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
      }
    }

    const message = lastError?.message || "Unable to load write leaderboard.";
    setError(message);
    setWriteTop10(EMPTY_ROUND_DATA);
    setLoading(false);
  }, [enabled, customEndpoints]);

  useEffect(() => {
    fetchWriteTop10();
  }, [fetchWriteTop10]);

  return {
    writeTop10,
    loading,
    error,
    refetch: fetchWriteTop10,
  };
};

export default useWriteTop10;
