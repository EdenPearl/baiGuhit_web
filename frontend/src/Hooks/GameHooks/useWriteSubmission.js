import { useCallback, useState } from "react";

const DEFAULT_WRITE_SUBMIT_ENDPOINTS = [
  "/game/write/submit",
];

const parseStoredUserId = () => {
  const loginDataRaw = localStorage.getItem("loginData");
  if (loginDataRaw) {
    try {
      const loginData = JSON.parse(loginDataRaw);
      const parsedLoginId = parseInt(loginData?.id, 10);
      if (!Number.isNaN(parsedLoginId) && parsedLoginId > 0) {
        return parsedLoginId;
      }
    } catch (error) {
      console.warn("Unable to parse loginData for write submission:", error);
    }
  }

  const fallbackUserId = parseInt(localStorage.getItem("userId"), 10);
  if (!Number.isNaN(fallbackUserId) && fallbackUserId > 0) {
    return fallbackUserId;
  }

  return null;
};

const useWriteSubmission = (customEndpoints = DEFAULT_WRITE_SUBMIT_ENDPOINTS) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitWriteResult = useCallback(
    async ({
      userId,
      targetCharacter,
      predictedCharacter,
      isCorrect,
      confidence,
      imageBase64,
    }) => {
      const resolvedUserId = userId || parseStoredUserId();
      if (!resolvedUserId) {
        throw new Error("Missing user_id. User must be logged in before saving write submissions.");
      }

      if (!targetCharacter || !predictedCharacter) {
        throw new Error("targetCharacter and predictedCharacter are required.");
      }

      const confidenceNumber = Number.isFinite(Number(confidence)) ? Number(confidence) : 0;

      const formData = new FormData();
      formData.append("user_id", String(resolvedUserId));
      formData.append("target_character", String(targetCharacter));
      formData.append("predicted_character", String(predictedCharacter));
      formData.append("is_correct", isCorrect ? "1" : "0");
      formData.append("confidence", String(confidenceNumber));
      if (imageBase64) {
        formData.append("image_base64", String(imageBase64));
      }

      setLoading(true);
      setError("");

      let lastError = null;

      for (const endpoint of customEndpoints) {
        try {
          const requestEndpoint = String(endpoint || "").trim();
          if (!requestEndpoint) continue;

          console.log(`[Write Submit] Attempting endpoint: ${requestEndpoint}`);

          const response = await fetch(requestEndpoint, {
            method: "POST",
            body: formData,
          });

          const payload = await response.json().catch(() => ({}));

          if (!response.ok || payload?.success === false) {
            console.error(`[Write Submit] Failed at ${requestEndpoint}:`, {
              status: response.status,
              payload,
            });
            throw new Error(payload?.message || `Write submission failed at ${requestEndpoint}`);
          }

          console.log(`[Write Submit] Success at ${requestEndpoint}`);
          setLoading(false);
          return payload;
        } catch (err) {
          console.error(`[Write Submit] Error at endpoint:`, err);
          lastError = err;
        }
      }

      const message = lastError?.message || "Write submission failed on all endpoints.";
      setError(message);
      setLoading(false);
      throw new Error(message);
    },
    [customEndpoints]
  );

  return {
    submitWriteResult,
    loading,
    error,
  };
};

export default useWriteSubmission;
