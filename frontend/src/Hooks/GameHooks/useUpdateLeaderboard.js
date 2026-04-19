import { useCallback, useState } from "react";

const DEFAULT_UPDATE_ENDPOINT = "https://ebaybaymo-server.onrender.com/game/leaderboard/update";

const useUpdateLeaderboard = (customEndpoint = DEFAULT_UPDATE_ENDPOINT) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const updateScore = useCallback(
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
            payload?.message || `Failed to update leaderboard score`
          );
        }

        setData(payload?.data || null);
        setLoading(false);
        return {
          success: true,
          data: payload?.data,
        };
      } catch (err) {
        const errorMsg = err?.message || "Unable to update score.";
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
    updateScore,
    loading,
    error,
    data,
  };
};

export default useUpdateLeaderboard;
