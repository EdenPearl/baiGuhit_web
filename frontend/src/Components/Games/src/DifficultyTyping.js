// src/Components/DifficultyTyping.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Typing from "./Typing";
import CustomButton from "./CustomButton.js";
import bgMusicFile from "../../../Assests/drag.mp3";

const BAYBAYIN_CHARS = [
  "ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ",
  "ᜉ","ᜊ","ᜋ","ᜌ","ᜎ","ᜏ","ᜐ","ᜑ"
];

const styles = {
  difficultyContainer: { position: "fixed", inset: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.35)", zIndex: 20, transition: "opacity 0.5s ease" },
  hidden: { opacity: 0, pointerEvents: "none" },
  baybayinBg: { position: "absolute", inset: 0, fontSize: "46px", color: "rgba(255,255,255,0.06)", letterSpacing: "30px", lineHeight: "80px", whiteSpace: "pre-wrap", animation: "floatBaybayin 60s linear infinite", pointerEvents: "none" },
  card: { position: "relative", zIndex: 2, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", borderRadius: "22px", padding: "50px 60px", boxShadow: "0 10px 40px rgba(0,0,0,0.35)", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", alignItems: "center" },
  title: { fontSize: "36px", marginBottom: "35px", letterSpacing: "1.5px", color: "#fff" },
  buttons: { display: "flex", gap: "22px", justifyContent: "center", flexWrap: "wrap" },
  buttonWrapper: (delay) => ({ opacity: 0, transform: "translateY(30px)", animation: "slideUp 0.6s ease forwards", animationDelay: `${delay}s` }),
  countdown: { fontSize: "90px", color: "#fff", fontWeight: "bold", animation: "pulse 1s infinite" },
  closeButton: { 
    position: "absolute", 
    top: "15px", 
    right: "20px", 
    background: "transparent", 
    border: "none", 
    color: "rgba(255,255,255,0.6)", 
    fontSize: "28px", 
    cursor: "pointer", 
    transition: "color 0.3s ease, transform 0.2s ease",
    padding: "0",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  closeButtonHover: {
    color: "#fff",
    transform: "scale(1.1)"
  },
  // Toast notification styles
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

const keyframes = `
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
@keyframes floatBaybayin { from { transform: translate(-10%, -10%); } to { transform: translate(10%, 10%); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.85; } 100% { transform: scale(1); opacity: 1; } }
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
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  
  // Toast state
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

  /* -------------------- Toast Helper -------------------- */
  const showToast = (message, type = "success") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSelectDifficulty = (level) => {
    setSelected(level);
    setShowDifficulty(false);
    setCountdown(3);
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
      } catch (err) {
        setUserData(null);
      }
    };
    getUserData();
    window.addEventListener('storage', getUserData);
    return () => window.removeEventListener('storage', getUserData);
  }, []);

  const insertScore = async (finalScore) => {
    if (!userData || !userData.email) {
      showToast("⚠️ Please login first to save your score!", "error");
      return;
    }

    const userEmail = userData.email;

    try {
      const response = await fetch("http://localhost:8000/typing/insert-typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          status: selected.toLowerCase(),
          points: Number(finalScore),
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("🏆 Score saved successfully!", "success");
      } else {
        showToast("❌ Failed to save score: " + result.message, "error");
        console.error("Failed to save score:", result.message);
      }
    } catch (err) {
      showToast("❌ Error saving score: " + err.message, "error");
      console.error("Error saving score:", err.message);
    }
  };

  const levels = ["Easy", "Medium", "Hard"];
  const showLoginWarning = !userData && !showDifficulty && startGame;

  return (
    <>
      {/* Toast Notifications Container */}
      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...(toast.type === "success" ? styles.toastSuccess : styles.toastError)
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={styles.toastIcon}>
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Login Warning */}
      {showLoginWarning && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,0,0,0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 1000
        }}>
          ⚠️ Not logged in - scores won't be saved!
        </div>
      )}

      <Typing
        difficulty={selected}
        startGame={startGame}
        onGameOver={insertScore}
      />

      <div style={{ ...styles.difficultyContainer, ...(showDifficulty ? {} : styles.hidden) }}>
        <div style={styles.baybayinBg}>
          {Array(35).fill(BAYBAYIN_CHARS.join("   ")).join("\n")}
        </div>
        <div style={styles.card}>
          <button
            style={{
              ...styles.closeButton,
              ...(isCloseHovered ? styles.closeButtonHover : {})
            }}
            onClick={() => navigate("/HomeGame")}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
            aria-label="Close"
          >
            ×
          </button>
          
          <h1 style={styles.title}>Select Difficulty</h1>
          <div style={styles.buttons}>
            {levels.map((level, index) => (
              <div key={level} style={styles.buttonWrapper(index * 0.12)}>
                <CustomButton
                  label={level}
                  width="180px"
                  height="55px"
                  selected={selected === level}
                  onClick={() => handleSelectDifficulty(level)}
                />
              </div>
            ))}
          </div>
          {!userData && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p style={{ color: "#ff6b6b", fontSize: "14px", marginBottom: "10px" }}>
                ⚠️ Please login to save your scores
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
                  fontSize: "12px"
                }}
              >
                Clear Data & Reload
              </button>
            </div>
          )}
        </div>
      </div>

      {countdown !== null && (
        <div style={{ ...styles.difficultyContainer, background: "rgba(0,0,0,0.6)" }}>
          <div style={styles.countdown}>{countdown}</div>
        </div>
      )}
    </>
  );
}