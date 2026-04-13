import React, { useState, useEffect, useRef } from "react";
import TapMode from "./TapMode";
import CustomButton from "./CustomButton.js";

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
  const [userData, setUserData] = useState(null);
  const scoreSaved = useRef(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
        
        if (!parsed.email) {
          console.error("⚠️ OLD LOGIN DATA DETECTED - Missing email field!");
          console.error("Please logout and login again to fix this.");
          console.error("Current data:", parsed);
          
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
  }, []);

  const handleSelectCategory = (category) => {
    setSelected(category);
    setShowDifficulty(false);
    setCountdown(3);
    scoreSaved.current = false;
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

  const insertScore = async (finalScore) => {
    console.log("=== insertScore called ===");
    console.log("Final score received:", finalScore);
    console.log("Current userData:", userData);

    if (!userData || !userData.email) {
      console.error("No user data available");
      return;
    }

    if (scoreSaved.current) {
      console.log("Score already saved, skipping...");
      return;
    }

    const userEmail = userData.email;
    console.log(`Sending score to DB: ${finalScore} for ${userEmail}`);
    console.log("Category:", selected);

    try {
      const response = await fetch("http://localhost:8000/tap/insert", {
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
      console.log("Server response:", result);

      if (result.success) {
        scoreSaved.current = true;
        console.log("🏆 Score saved to Leaderboard!");
      } else {
        console.error("Failed to save score:", result.error);
      }

    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  const categories = ["animal", "profession", "fruit", "things", "color"];

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
        <div style={styles.baybayinBg}>
          {Array(40)
            .fill(BAYBAYIN_CHARS.join("   "))
            .join("\n")}
        </div>

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
          
          {!userData && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p style={{ color: "#ff6b6b", fontSize: "14px" }}>
                ⚠️ Please login to save your scores
              </p>
            </div>
          )}
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