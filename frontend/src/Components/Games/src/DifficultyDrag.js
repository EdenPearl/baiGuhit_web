// src/Components/DifficultyDrag.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ Added import
import Drag from "./Drag";
import CustomButton from "./CustomButton.js";
import bgMusicFile from "../../../Assests/drag.mp3"; // 🎵 Background music

/* 🪶 Baybayin Characters */
const BAYBAYIN_CHARS = [
  "ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ",
  "ᜉ","ᜊ","ᜋ","ᜌ","ᜎ","ᜏ","ᜐ","ᜑ"
];

/* ---------------- STYLES ---------------- */
const styles = {
  difficultyContainer: { position: "fixed", inset: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.35)", zIndex: 20, transition: "opacity 0.5s ease" },
  hidden: { opacity: 0, pointerEvents: "none" },
  baybayinBg: { position: "absolute", inset: 0, fontSize: "46px", color: "rgba(255,255,255,0.06)", letterSpacing: "30px", lineHeight: "80px", whiteSpace: "pre-wrap", animation: "floatBaybayin 60s linear infinite", pointerEvents: "none" },
  card: { position: "relative", zIndex: 2, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", borderRadius: "22px", padding: "50px 60px", boxShadow: "0 10px 40px rgba(0,0,0,0.35)", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", alignItems: "center" },
  title: { fontSize: "36px", marginBottom: "35px", letterSpacing: "1.5px", color: "#fff" },
  buttons: { display: "flex", gap: "22px", justifyContent: "center", flexWrap: "wrap" },
  buttonWrapper: (delay) => ({ opacity: 0, transform: "translateY(30px)", animation: "slideUp 0.6s ease forwards", animationDelay: `${delay}s` }),
  countdown: { fontSize: "90px", color: "#fff", fontWeight: "bold", animation: "pulse 1s infinite" },
  // ⬇️ Added close button styles
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
  }
};

/* ---------------- KEYFRAMES ---------------- */
const keyframes = `
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
@keyframes floatBaybayin { from { transform: translate(-10%, -10%); } to { transform: translate(10%, 10%); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.85; } 100% { transform: scale(1); opacity: 1; } }
`;

export default function DifficultyDrag() {
  const [selected, setSelected] = useState("Easy");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [userData, setUserData] = useState(null); // Store full user data
  const [isCloseHovered, setIsCloseHovered] = useState(false); // ⬅️ Added hover state

  const audioRef = useRef(null);
  const navigate = useNavigate(); // ⬅️ Added navigate hook

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

  /* inject keyframes */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* -------------------- Difficulty Selection -------------------- */
  const handleSelectDifficulty = (level) => {
    setSelected(level);
    setShowDifficulty(false);
    setCountdown(3);
  };

  /* -------------------- Countdown logic -------------------- */
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

  /* -------------------- Fetch email from localStorage -------------------- */
  useEffect(() => {
    const getUserData = () => {
      const loginDataStr = localStorage.getItem("loginData");
      console.log("Raw loginData from localStorage:", loginDataStr);
      
      if (!loginDataStr) {
        console.error("No loginData in localStorage");
        setUserData(null);
        return;
      }

      try {
        const parsed = JSON.parse(loginDataStr);
        console.log("Parsed loginData:", parsed);
        
        // Check if email exists
        if (!parsed.email) {
          console.error("⚠️ OLD LOGIN DATA DETECTED - Missing email field!");
          console.error("Please logout and login again to fix this.");
          console.error("Current data:", parsed);
          
          // Auto-clear old invalid data
          localStorage.removeItem("loginData");
          setUserData(null);
          return;
        }
        
        setUserData(parsed);
        console.log("✅ User data loaded successfully:", parsed.email);
      } catch (err) {
        console.error("Failed to parse loginData:", err);
        setUserData(null);
      }
    };

    getUserData();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      getUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /* -------------------- Insert score AFTER game ends -------------------- */
  const insertScore = async (finalScore) => {
    console.log("=== insertScore called ===");
    console.log("Final score received:", finalScore);
    console.log("Current userData:", userData);

    // Use the userData from state instead of reading localStorage again
    if (!userData || !userData.email) {
      console.error("No user data available");
      alert("Please login first to save your score!");
      return;
    }

    const userEmail = userData.email;
    console.log(`Sending score to DB: ${finalScore} for ${userEmail}`);
    console.log("Difficulty status:", selected.toLowerCase());

    try {
      const response = await fetch("/drag/insert-drag", {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server response:", result);

      if (result.success) {
        console.log("🏆 Score saved to Leaderboard!");
        alert("Score saved successfully! 🏆");
      } else {
        console.error("Failed to save score:", result.message);
        alert("Failed to save score: " + result.message);
      }

    } catch (err) {
      console.error("Failed to save score:", err);
      alert("Error saving score: " + err.message);
    }
  };

  const levels = ["Easy", "Medium", "Hard"];

  // Show login warning if no user data
  const showLoginWarning = !userData && !showDifficulty && startGame;

  return (
    <>
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

      {/* -------------------- Game Component -------------------- */}
      <Drag
        difficulty={selected}
        startGame={startGame}
        onGameOver={insertScore}
      />

      {/* -------------------- Difficulty Selection Overlay -------------------- */}
      <div style={{ ...styles.difficultyContainer, ...(showDifficulty ? {} : styles.hidden) }}>
        <div style={styles.baybayinBg}>
          {Array(35).fill(BAYBAYIN_CHARS.join("   ")).join("\n")}
        </div>
        <div style={styles.card}>
          {/* ⬇️ Added X button here */}
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

      {/* -------------------- Countdown Display -------------------- */}
      {countdown !== null && (
        <div style={{ ...styles.difficultyContainer, background: "rgba(0,0,0,0.6)" }}>
          <div style={styles.countdown}>{countdown}</div>
        </div>
      )}
    </>
  );
}