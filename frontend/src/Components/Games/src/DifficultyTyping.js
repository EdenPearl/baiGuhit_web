// src/Components/DifficultyTyping.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Typing from "./Typing";
import bgMusicFile from "../../../Assests/drag.mp3";

/* ---------------- STYLES ---------------- */
const styles = {
  difficultyContainer: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.65)", zIndex: 1000, opacity: 1, visibility: "visible", transition: "opacity 0.3s ease, visibility 0.3s ease" },
  hidden: { opacity: 0, visibility: "hidden", pointerEvents: "none" },
  modalCard: { position: "relative", zIndex: 1001, width: "min(560px, 92vw)", overflow: "hidden", borderRadius: "22px", background: "linear-gradient(155deg, #2c1204 0%, #3d1a06 55%, #1e0d03 100%)", border: "1px solid rgba(251,196,23,0.25)", boxShadow: "0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,220,120,0.1)", opacity: 1, visibility: "visible", transform: "translateY(0) scale(1)", transition: "all 0.38s cubic-bezier(0.34,1.56,0.64,1)" },
  modalCardHidden: { opacity: 0, visibility: "hidden", transform: "translateY(12px) scale(0.9)" },
  modalTopBar: { height: "4px", background: "linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a)", backgroundSize: "300% 100%", animation: "shimmerGold 3s linear infinite" },
  modalCardBody: { padding: "18px 22px 26px", textAlign: "center" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 12px" },
  titleRow: { display: "flex", alignItems: "center", gap: "10px" },
  titleIcon: { fontSize: "22px" },
  title: { margin: 0, fontSize: "20px", letterSpacing: "0.2px", color: "#fde68a", fontFamily: "Georgia, serif", fontWeight: 900, textShadow: "0 4px 14px rgba(0,0,0,0.45)" },
  closeBtn: { width: "34px", height: "34px", borderRadius: "50%", border: "1.5px solid rgba(251,196,23,0.35)", background: "rgba(251,196,23,0.1)", color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease" },
  subtitle: { margin: 0, fontFamily: "sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(253,230,138,0.5)", textAlign: "center" },
  buttons: { display: "flex", flexDirection: "column", gap: "10px" },
  buttonWrapper: (delay) => ({ opacity: 0, transform: "translateY(18px)", animation: "slideUp 0.5s ease forwards", animationDelay: `${delay}s` }),
  optionBtn: { width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "15px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.22s ease" },
  optionIcon: { fontSize: "22px", flexShrink: 0 },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#fff4df", lineHeight: 1.2 },
  optionSub: { fontFamily: "sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" },
  arrow: { fontSize: "16px", color: "rgba(251,196,23,0.6)", flexShrink: 0 },
  countdownOverlay: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px" },
  countdownRing: { width: "120px", height: "120px", borderRadius: "50%", border: "4px solid rgba(251, 196, 23, 0.5)", background: "rgba(251, 196, 23, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(251, 196, 23, 0.2)", animation: "ringPop 0.9s ease, countdownBeat 1s ease-in-out infinite" },
  countdownNum: { fontFamily: "Georgia, serif", fontSize: "64px", fontWeight: 900, color: "#fbc417", textShadow: "0 0 20px rgba(251,196,23,0.6)" },
  countdownHint: { fontFamily: "sans-serif", fontSize: "15px", fontWeight: 600, letterSpacing: "0.8px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", animation: "fadeSlideUp 0.4s ease" },
  toastContainer: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    pointerEvents: "none"
  },
  toast: {
    padding: "12px 24px",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    animation: "slideDown 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    pointerEvents: "auto",
    minWidth: "250px",
    justifyContent: "center"
  },
  toastSuccess: {
    background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
  },
  toastError: {
    background: "linear-gradient(135deg, #f44336 0%, #da190b 100%)"
  },
  toastIcon: {
    fontSize: "16px"
  }
};

/* ---------------- KEYFRAMES ---------------- */
const keyframes = `
@keyframes shimmerGold {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
@keyframes ringPop {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes countdownBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
`;

export default function DifficultyTyping() {
  const [selected, setSelected] = useState("Easy");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [userData, setUserData] = useState(null);

  const [toasts, setToasts] = useState([]);

  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const audio = new Audio(bgMusicFile);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const fadeOutMusic = () => {
    if (!audioRef.current) return;
    const fadeInterval = setInterval(() => {
      if (audioRef.current.volume > 0.05) {
        audioRef.current.volume -= 0.05;
      } else {
        clearInterval(fadeInterval);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 100);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectDifficulty = (level) => {
    setSelected(level);
    setShowDifficulty(false);
    setCountdown(3);
  };

  const handleCloseModal = () => {
    navigate("/HomeGame");
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      fadeOutMusic();
      setStartGame(true);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const getUserData = () => {
      const loginDataStr = localStorage.getItem("loginData");

      if (!loginDataStr) {
        setUserData(null);
        return;
      }

      try {
        const parsed = JSON.parse(loginDataStr);

        if (!parsed.email) {
          localStorage.removeItem("loginData");
          setUserData(null);
          return;
        }

        setUserData(parsed);
      } catch {
        setUserData(null);
      }
    };

    getUserData();

    const handleStorageChange = () => {
      getUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const insertScore = async (finalScore) => {
    if (!userData || !userData.email) {
      showToast("Please login first to save your score!", "error");
      return;
    }

    const userEmail = userData.email;

    try {
      const response = await fetch("https://ebaybaymo-server.onrender.com/typing/insert-typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          status: selected.toLowerCase(),
          points: Number(finalScore),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showToast("Failed to save score: " + result.message, "error");
        // ...existing code...
      }
    } catch (err) {
      showToast("Error saving score: " + err.message, "error");
      // ...existing code...
    }
  };

  const levels = ["Easy", "Medium", "Hard"];
  const levelMeta = {
    Easy: { icon: "E", title: "Easy", sub: "Start with simpler questions" },
    Medium: { icon: "M", title: "Medium", sub: "Balanced challenge" },
    Hard: { icon: "H", title: "Hard", sub: "For experienced players" },
  };

  const showLoginWarning = !userData && !showDifficulty && startGame;

  return (
    <>
      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...(toast.type === "success" ? styles.toastSuccess : styles.toastError),
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={styles.toastIcon}>{toast.type === "success" ? "OK" : "ERR"}</span>
            {toast.message}
          </div>
        ))}
      </div>

      {showLoginWarning && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,0,0,0.8)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          Not logged in - scores will not be saved!
        </div>
      )}

      <Typing difficulty={selected} startGame={startGame} onGameOver={insertScore} />

      <div style={{ ...styles.difficultyContainer, ...(showDifficulty ? {} : styles.hidden) }}>
        <div style={{ ...styles.modalCard, ...(showDifficulty ? {} : styles.modalCardHidden) }}>
          <div style={styles.modalTopBar} />
          <div style={styles.modalCardBody}>
            <div style={styles.headerRow}>
              <div style={styles.titleRow}>
                <span style={styles.titleIcon}>T</span>
                <h1 style={styles.title}>Select Difficulty</h1>
              </div>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={handleCloseModal}
                aria-label="Close difficulty selector"
              >
                x
              </button>
            </div>

            <p style={styles.subtitle}>Choose your game difficulty to begin</p>

            <div style={styles.buttons}>
              {levels.map((level, index) => {
                const meta = levelMeta[level];
                return (
                  <div key={level} style={styles.buttonWrapper(index * 0.12)}>
                    <button
                      type="button"
                      style={{
                        ...styles.optionBtn,
                        borderColor: selected === level ? "rgba(251,196,23,0.4)" : "rgba(255,255,255,0.1)",
                        background: selected === level ? "rgba(251,196,23,0.12)" : "rgba(255,255,255,0.06)",
                      }}
                      onClick={() => handleSelectDifficulty(level)}
                    >
                      <span style={styles.optionIcon}>{meta.icon}</span>
                      <div style={styles.optionText}>
                        <div style={styles.optionTitle}>{meta.title}</div>
                        <div style={styles.optionSub}>{meta.sub}</div>
                      </div>
                      <span style={styles.arrow}>{">"}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {!userData && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#ff6b6b", fontSize: "14px", marginBottom: "10px" }}>
                  Please login to save your scores
                </p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Clear Data & Reload
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {countdown !== null && (
        <div style={{ ...styles.difficultyContainer, background: "rgba(0,0,0,0.55)" }}>
          <div style={styles.countdownOverlay}>
            <div key={countdown} style={styles.countdownRing}>
              <div style={styles.countdownNum}>{countdown}</div>
            </div>
            <div style={styles.countdownHint}>Round 1 begins�</div>
          </div>
        </div>
      )}
    </>
  );
}

