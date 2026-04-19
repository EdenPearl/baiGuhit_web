import { useEffect, useState, useCallback } from "react";

const useGameDataByCategory = (category) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [baybayinWord, setBaybayinWord] = useState("");
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGameData = useCallback(async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://ebaybaymo-server.onrender.com/game/game/category/${category}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch game data");
      }

      const data = await response.json();

      // Convert base64 image to usable URL
      const imageSrc = `data:image/jpeg;base64,${data.image}`;

      setImageUrl(imageSrc);
      setBaybayinWord(data.baybayin_word);
      setGameId(data.id);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  return {
    imageUrl,
    baybayinWord,
    gameId,
    loading,
    error,
    refetch: fetchGameData,
  };
};

export default useGameDataByCategory;

