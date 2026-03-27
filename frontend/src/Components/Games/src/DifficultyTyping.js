import React, { useState, useEffect, useRef } from "react";
import Typing from "./Typing";
import CustomButton from "./CustomButton.js";
import bgMusicFile from "../../../Assests/drag.mp3"; // 🎵 Background music

/* 🪶 BAYBAYIN CHARACTERS */
const BAYBAYIN_CHARS = [
  "ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ",
  "ᜉ","ᜊ","ᜋ","ᜌ","ᜎ","ᜏ","ᜐ","ᜑ"
];

const styles = {
  difficultyContainer: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    background: "rgba(0,0,0,0.35)",
    zIndex: 20,
    transition: "opacity 0.5s ease",
  },

  hidden: {
    opacity: 0,
    pointerEvents: "none",
  },

  baybayinBg: {
    position: "absolute",
    inset: 0,
    fontSize: "46px",
    color: "rgba(255,255,255,0.06)",
    letterSpacing: "30px",
    lineHeight: "80px",
    whiteSpace: "pre-wrap",
    animation: "floatBaybayin 60s linear infinite",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    borderRadius: "22px",
    padding: "50px 60px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  title: {
    fontSize: "36px",
    marginBottom: "35px",
    letterSpacing: "1.5px",
    color: "#fff",
  },

  buttons: {
    display: "flex",
    gap: "22px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  buttonWrapper: (delay) => ({
    opacity: 0,
    transform: "translateY(30px)",
    animation: "slideUp 0.6s ease forwards",
    animationDelay: `${delay}s`,
  }),

  countdown: {
    fontSize: "90px",
    color: "#fff",
    fontWeight: "bold",
    animation: "pulse 1s infinite",
  },
};

/* 🎞️ Keyframes */
const keyframes = `
@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes floatBaybayin {
  from { transform: translate(-10%, -10%); }
  to { transform: translate(10%, 10%); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
}
`;

export default function DifficultyTyping() {
  const [selected, setSelected] = useState("Medium");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);

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

  /* 🎵 Smooth Fade-Out */
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

  const handleSelectDifficulty = (level) => {
    setSelected(level);
    setShowDifficulty(false);
    setCountdown(3);
  };

  /* ⏳ Countdown logic */
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      fadeOutMusic(); // 🎵 smooth fade
      setStartGame(true);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const levels = ["Easy", "Medium", "Hard"];

  return (
    <>
      <Typing difficulty={selected} startGame={startGame} />

      <div
        style={{
          ...styles.difficultyContainer,
          ...(showDifficulty ? {} : styles.hidden),
        }}
      >
        <div style={styles.baybayinBg}>
          {Array(35)
            .fill(BAYBAYIN_CHARS.join("   "))
            .join("\n")}
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

      {countdown !== null && (
        <div
          style={{
            ...styles.difficultyContainer,
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <div style={styles.countdown}>{countdown}</div>
        </div>
      )}
    </>
  );
}
