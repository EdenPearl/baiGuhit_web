import React, { useState, useEffect } from "react";
import TapMode from "./TapMode";
import CustomButton from "./CustomButton.js";

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
  },

  hidden: {
    opacity: 0,
    pointerEvents: "none",
  },

  /* 🪶 PATTERN LAYER */
  baybayinBg: {
    position: "absolute",
    inset: 0,
    fontSize: "48px",
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
    background: "rgba(255, 255, 255, 0.08)",
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
    animation: `slideUp 0.6s ease forwards`,
    animationDelay: `${delay}s`,
  }),

  countdown: {
    fontSize: "90px",
    color: "#fff",
    fontWeight: "bold",
  },
};

/* 🎞️ KEYFRAMES */
const keyframes = `
@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatBaybayin {
  from {
    transform: translate(-10%, -10%);
  }
  to {
    transform: translate(10%, 10%);
  }
}
`;

export default function DifficultyTap() {
  const [selected, setSelected] = useState("animal");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSelectCategory = (category) => {
    setSelected(category);
    setShowDifficulty(false);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setStartGame(true);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const categories = ["animal", "profession", "fruit", "things", "color",];

  return (
    <>
      <TapMode selectedDifficulty={selected} startGame={startGame} />

      <div
        style={{
          ...styles.difficultyContainer,
          ...(showDifficulty ? {} : styles.hidden),
        }}
      >
        {/* 🪶 BAYBAYIN BACKGROUND */}
        <div style={styles.baybayinBg}>
          {Array(40)
            .fill(BAYBAYIN_CHARS.join("   "))
            .join("\n")}
        </div>

        {/* 📦 CARD */}
        <div style={styles.card}>
          <h1 style={styles.title}>Select Category</h1>

          <div style={styles.buttons}>
            {categories.map((category, index) => (
              <div
                key={category}
                style={styles.buttonWrapper(index * 0.12)}
              >
                <CustomButton
                  label={category}
                  width="180px"
                  height="55px"
                  selected={selected === category}
                  onClick={() => handleSelectCategory(category)}
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
