import { useCallback, useState } from "react";

const DEFAULT_INSERT_ENDPOINT = "http://localhost:8000/game/leaderboard/insert";

const useInsertLeaderboard = (customEndpoint = DEFAULT_INSERT_ENDPOINT) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const insertScore = useCallback(
    async (userId, status, points) => {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const response = await fetch(customEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            status: status,
            points: points,
          }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload?.success === false) {
          throw new Error(
            payload?.message || `Failed to insert leaderboard score`
          );
        }

        setData(payload?.data || null);
        setLoading(false);
        return {
          success: true,
          data: payload?.data,
        };
      } catch (err) {
        const errorMsg = err?.message || "Unable to insert score.";
        setError(errorMsg);
        setLoading(false);
        return {
          success: false,
          error: errorMsg,
        };
      }
    },
    [customEndpoint]
  );

  return {
    insertScore,
    loading,
    error,
    data,
  };
};

export default useInsertLeaderboard;
