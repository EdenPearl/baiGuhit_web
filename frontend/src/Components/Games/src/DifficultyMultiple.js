// src/Components/Difficulty.js
import React, { useState, useEffect, useRef } from "react";
import Multiple from "./Multiple";
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
};

/* ---------------- KEYFRAMES ---------------- */
const keyframes = `
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
@keyframes floatBaybayin { from { transform: translate(-10%, -10%); } to { transform: translate(10%, 10%); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.85; } 100% { transform: scale(1); opacity: 1; } }
`;

export default function Difficulty() {
  const [selected, setSelected] = useState("Easy");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [email, setEmail] = useState(""); // store email from login/localStorage

  const audioRef = useRef(null);

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



  /* -------------------- Fetch email -------------------- */
useEffect(() => {
  const loginDataStr = localStorage.getItem("loginData");
  if (loginDataStr) {
    try {
      const loginData = JSON.parse(loginDataStr);
      if (loginData.email) setEmail(loginData.email);
    } catch (err) {
      console.error("Failed to parse loginData:", err);
    }
  }
}, []);

  /* -------------------- Insert score AFTER game ends -------------------- */
  const insertScore = async (finalScore) => {
  const loginDataStr = localStorage.getItem("loginData");
  if (!loginDataStr) {
    console.error("No loginData in localStorage");
    return;
  }

  let email = null;

  try {
    const loginData = JSON.parse(loginDataStr);
    console.log("LoginData:", loginData);
    email = loginData.email;   // ✅ get email
  } catch (err) {
    console.error("Failed to parse loginData", err);
    return;
  }

  if (!email) {
    console.error("Email not found in loginData");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/multiple/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,   // ✅ SEND EMAIL
        status: selected.toLowerCase(),
        points: finalScore,
      }),
    });

    const result = await response.json();
    console.log("Insert result:", result);
  } catch (err) {
    console.error("Insert score error:", err);
  }
};

  const levels = ["Easy", "Medium", "Hard"];

  return (
    <>
      {/* -------------------- Game Component -------------------- */}
      <Multiple
        difficulty={selected}
        startGame={startGame}
        onGameOver={(finalScore) => insertScore(finalScore)}
      />

      {/* -------------------- Difficulty Selection Overlay -------------------- */}
      <div style={{ ...styles.difficultyContainer, ...(showDifficulty ? {} : styles.hidden) }}>
        <div style={styles.baybayinBg}>
          {Array(35).fill(BAYBAYIN_CHARS.join("   ")).join("\n")}
        </div>
        <div style={styles.card}>
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