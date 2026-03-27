import React, { useState } from "react";
import Multiple from "./Multiple";
import CustomButton from "./CustomButton.js";

export default function Difficulty() {
  const [selected, setSelected] = useState("Easy");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [startGame, setStartGame] = useState(false);

  const handlePlay = () => {
    setShowDifficulty(false);
    setStartGame(true);
  };

  return (
    <>
      <Multiple difficulty={selected} startGame={startGame} />

      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          background: "rgba(0,0,0,0.3)",
          zIndex: 20,
          transition: "opacity 0.5s ease",
          opacity: showDifficulty ? 1 : 0,
          pointerEvents: showDifficulty ? "auto" : "none",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "50px 60px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "40px", color: "#fff" }}>
            Select Difficulty
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
            {["Easy", "Medium", "Hard"].map((level) => (
              <CustomButton
                key={level}
                label={level}
                width="200px"
                onClick={() => setSelected(level)}
                selected={selected === level}
              />
            ))}
          </div>

          <CustomButton label="Play" width="220px" color="green" onClick={handlePlay} />
        </div>
      </div>
    </>
  );
}
