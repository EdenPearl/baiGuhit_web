import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TapMode from "./TapMode";
import bgMusicFile from "../../../Assests/drag.mp3";

// FIXED: Removed BAYBAYIN_CHARS since we only use database words now
// This prevents mismatch between generated words and database images

const styles = {
  difficultyContainer: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.65)",
    zIndex: 1000,
    opacity: 1,
    visibility: "visible",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  },
  hidden: {
    opacity: 0,
    visibility: "hidden",
    pointerEvents: "none",
  },
  modalCard: {
    position: "relative",
    zIndex: 1001,
    width: "min(560px, 92vw)",
    overflow: "hidden",
    borderRadius: "22px",
    background: "linear-gradient(155deg, #2c1204 0%, #3d1a06 55%, #1e0d03 100%)",
    border: "1px solid rgba(251,196,23,0.25)",
    boxShadow: "0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,220,120,0.1)",
    opacity: 1,
    visibility: "visible",
    transform: "translateY(0) scale(1)",
    transition: "all 0.38s cubic-bezier(0.34,1.56,0.64,1)",
  },
  modalCardHidden: {
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(12px) scale(0.9)",
  },
  modalCardBody: {
    padding: "18px 22px 26px",
    textAlign: "center",
  },
  modalTopBar: {
    height: "4px",
    background: "linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a)",
    backgroundSize: "300% 100%",
    animation: "shimmerGold 3s linear infinite",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    letterSpacing: "0.2px",
    color: "#fde68a",
    fontFamily: "Georgia, serif",
    fontWeight: 900,
    textShadow: "0 4px 14px rgba(0,0,0,0.45)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 22px 12px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  titleIcon: {
    fontSize: "22px",
  },
  closeBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1.5px solid rgba(251,196,23,0.35)",
    background: "rgba(251,196,23,0.1)",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.25s ease",
  },
  subtitle: {
    margin: "0",
    fontFamily: "sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(253,230,138,0.5)",
    textAlign: "center",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttonWrapper: (delay) => ({
    opacity: 0,
    transform: "translateY(18px)",
    animation: `slideUp 0.5s ease forwards`,
    animationDelay: `${delay}s`,
  }),
  optionBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.22s ease",
  },
  optionIcon: {
    fontSize: "22px",
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "15px",
    fontWeight: 700,
    color: "#fff4df",
    lineHeight: 1.2,
  },
  optionSub: {
    fontFamily: "sans-serif",
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    marginTop: "2px",
  },
  arrow: {
    fontSize: "16px",
    color: "rgba(251,196,23,0.6)",
    flexShrink: 0,
  },
  countdownOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
  },
  countdownRing: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid rgba(251, 196, 23, 0.5)",
    background: "rgba(251, 196, 23, 0.08)",
    boxShadow: "0 0 40px rgba(251, 196, 23, 0.2)",
    animation: "ringPop 0.9s ease, countdownBeat 1s ease-in-out infinite",
  },
  countdownNum: {
    fontFamily: "Georgia, serif",
    fontSize: "64px",
    fontWeight: 900,
    color: "#fbc417",
    textShadow: "0 0 20px rgba(251,196,23,0.6)",
  },
  countdownHint: {
    fontFamily: "sans-serif",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    animation: "fadeSlideUp 0.4s ease",
  },
};

const keyframes = `
@keyframes shimmerGold {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}
@keyframes ringPop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes countdownBeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

export default function DifficultyTap() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("animal");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const scoreSaved = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* 🎵 Background Music */
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

  useEffect(() => {
    const getUserData = () => {
      const loginDataStr = localStorage.getItem("loginData");
      // ...existing code...
      
      if (!loginDataStr) {
        // ...existing code...
        setUserData(null);
        return;
      }

      try {
        const parsed = JSON.parse(loginDataStr);
        // ...existing code...
        
        if (!parsed.email) {
          // ...existing code...
          
          localStorage.removeItem("loginData");
          setUserData(null);
          return;
        }
        
        setUserData(parsed);
        // ...existing code...
      } catch (err) {
        // ...existing code...
        setUserData(null);
      }
    };

    getUserData();
  }, []);

  const handleSelectCategory = (category) => {
    setSelected(category);
    setShowDifficulty(false);
    setCountdown(3);
    scoreSaved.current = false;
  };

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

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const insertScore = async (finalScore) => {
    // ...existing code...

    if (!userData || !userData.email) {
      // ...existing code...
      return;
    }

    if (scoreSaved.current) {
      // ...existing code...
      return;
    }

    const userEmail = userData.email;
    // ...existing code...

    try {
      const response = await fetch("https://ebaybaymo-server.onrender.com/tap/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          category: selected,
          score: Number(finalScore),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // ...existing code...

      if (result.success) {
        scoreSaved.current = true;
        // ...existing code...
      } else {
        // ...existing code...
      }
    } catch (err) {
      // ...existing code...
    }
  };

  const categories = ["animal", "profession", "fruit", "things", "color"];
  const categoryMeta = {
    animal: { icon: "🐾", title: "Animal", sub: "Tap the right answer" },
    profession: { icon: "💼", title: "Profession", sub: "Tap the right answer" },
    fruit: { icon: "🍎", title: "Fruit", sub: "Tap the right answer" },
    things: { icon: "📦", title: "Things", sub: "Tap the right answer" },
    color: { icon: "🎨", title: "Color", sub: "Tap the right answer" },
  };

  return (
    <>
      <TapMode
        selectedDifficulty={selected}
        startGame={startGame}
        onGameOver={insertScore}
      />

      <div
        style={{
          ...styles.difficultyContainer,
          ...(showDifficulty ? {} : styles.hidden),
        }}
      >
        <div
          style={{
            ...styles.modalCard,
            ...(showDifficulty ? {} : styles.modalCardHidden),
          }}
        >
          <div style={styles.modalTopBar} />
          <div style={styles.modalCardBody}>
            <div style={styles.headerRow}>
              <div style={styles.titleRow}>
                <span style={styles.titleIcon}>↻</span>
                <h1 style={styles.title}>Select Category</h1>
              </div>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={handleCloseModal}
                aria-label="Close difficulty selector"
              >
                ×
              </button>
            </div>

            <p style={styles.subtitle}>Choose your game category to begin</p>

            <div style={styles.buttons}>
              {categories.map((category, index) => {
                const meta = categoryMeta[category];
                return (
                  <div key={category} style={styles.buttonWrapper(index * 0.12)}>
                    <button
                      type="button"
                      style={{
                        ...styles.optionBtn,
                        borderColor: selected === category ? "rgba(251,196,23,0.4)" : "rgba(255,255,255,0.1)",
                        background: selected === category ? "rgba(251,196,23,0.12)" : "rgba(255,255,255,0.06)",
                      }}
                      onClick={() => handleSelectCategory(category)}
                    >
                      <span style={styles.optionIcon}>{meta.icon}</span>
                      <div style={styles.optionText}>
                        <div style={styles.optionTitle}>{meta.title}</div>
                        <div style={styles.optionSub}>{meta.sub}</div>
                      </div>
                      <span style={styles.arrow}>→</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {!userData && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#ff6b6b", fontSize: "14px" }}>
                  ⚠️ Please login to save your scores
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {countdown !== null && (
        <div
          style={{
            ...styles.difficultyContainer,
            background: "rgba(0,0,0,0.55)",
          }}
        >
          <div style={styles.countdownOverlay}>
            <div key={countdown} style={styles.countdownRing}>
              <div style={styles.countdownNum}>{countdown}</div>
            </div>
            <div style={styles.countdownHint}>Round 1 begins…</div>
          </div>
        </div>
      )}
    </>
  );
}