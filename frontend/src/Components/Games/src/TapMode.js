import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CustomButton from "./CustomButton.js";
import home from "../../../Assests/backB.png";
import stoneClick from "../../../Assests/stone.mp3";
import useGameDataByCategory from "../../../Hooks/GameHooks/useGameDataByCategory";
import confetti from "canvas-confetti";
import errorSoundFile from "../../../Assests/stone.mp3";
import write1 from "../../../Assests/write1.png";
import write2 from "../../../Assests/write2.png";
import { keyframes, css } from "styled-components";

const BackButton = styled.img`
  position: absolute;
  top: -6%;
  left: -5%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 10;
`;

const LeftDecor = styled.img`
  position: absolute;
  top: 0%;
  left: 0%;
  width: 320px;
  pointer-events: none;
  z-index: 1;
`;

const RightDecor = styled.img`
  position: absolute;
  top: 0%;
  right: 0%;
  width: 320px;
  pointer-events: none;
  z-index: 1;
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
`;

const ScoreBox = styled.div`
  position: absolute;
  top: 30px;
  left: 480px;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  z-index: 20;
`;

const TimeWrapper = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
`;

const TimeBarBackground = styled.div`
  position: relative;
  width: 360px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255,255,255,0.3);
  overflow: hidden;
`;

const TimeBarFill = styled.div`
  position: absolute;
  height: 100%;
  width: ${({ width }) => width}%;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  transition: width 1s linear;
`;

const TimeText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;

  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${pulse} 1s infinite;
      color: #ff0000;
    `}
`;

const TapMode = ({ selectedDifficulty = "animal", startGame = false, onGameOver }) => {
  const navigate = useNavigate();
  const scoreSaved = useRef(false);

  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [targetChar, setTargetChar] = useState("？");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const { imageUrl, baybayinWord, loading, refetch } =
  useGameDataByCategory(selectedDifficulty);
  const [previousWord, setPreviousWord] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const [flash, setFlash] = useState(false);
  const errorSound = new Audio(errorSoundFile);
  errorSound.volume = 0.7;
  const [tileVibrate, setTileVibrate] = useState(false);

  const MAX_TIME = 30;
  const clickSound = new Audio(stoneClick);
  clickSound.volume = 0.6;

  // All possible Baybayin characters for wrong options
  const ALL_BAYBAYIN_CHARS = [
    "ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ","ᜉ","ᜊ","ᜋ","ᜌ","ᜎ",
    "ᜏ","ᜐ","ᜑ","ᜒ","ᜓ","᜔"
  ];

  useEffect(() => {
    if (!startGame) return;
    setIsGameStarted(true);
    setScore(0);
    setTargetIndex(0);
    setGameOver(false);
    setTimeLeft(MAX_TIME);
    scoreSaved.current = false;
    // Don't call generateTiles here - wait for baybayinWord to load
  }, [startGame]);

  useEffect(() => {
    if (gameOver && onGameOver && !scoreSaved.current) {
      scoreSaved.current = true;
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  // FIXED: Properly split Baybayin word into individual characters
  // This handles both single chars and multi-char combinations
  const splitBaybayinWord = (word) => {
    if (!word) return [];
    // Split into array of characters, properly handling Unicode
    return Array.from(word);
  };

  const generateTiles = () => {
    if (!startGame || !correctAnswer) return;
    
    // FIXED: Use proper character splitting instead of regex
    const correctChars = splitBaybayinWord(correctAnswer);
    const uniqueCorrectChars = [...new Set(correctChars)]; // Remove duplicates
    
    const totalTiles = 10;
    let tilesToShow = [];
    
    // FIXED: Always include ALL unique correct characters first
    tilesToShow = [...uniqueCorrectChars];
    
    // Fill remaining slots with wrong characters
    const neededWrong = totalTiles - tilesToShow.length;
    if (neededWrong > 0) {
      // Filter out any characters that are already in correct answer
      const wrongChars = ALL_BAYBAYIN_CHARS.filter(
        (c) => !uniqueCorrectChars.includes(c)
      );
      
      // Randomly select wrong characters
      const shuffledWrong = [...wrongChars].sort(() => 0.5 - Math.random());
      const selectedWrong = shuffledWrong.slice(0, neededWrong);
      
      tilesToShow = [...tilesToShow, ...selectedWrong];
    }
    
    // Shuffle all tiles
    tilesToShow = tilesToShow.sort(() => 0.5 - Math.random());
    
    // FIXED: Debug logging to verify correct answer is in tiles
    console.log("Correct answer:", correctAnswer);
    console.log("Correct chars:", uniqueCorrectChars);
    console.log("Generated tiles:", tilesToShow);
    
    // Verify all correct chars are present
    const missingChars = uniqueCorrectChars.filter(c => !tilesToShow.includes(c));
    if (missingChars.length > 0) {
      console.error("CRITICAL: Missing correct characters in tiles:", missingChars);
    }
    
    setTiles(tilesToShow);
    setSelectedTiles([]);
    setTypedAnswer("");
  };

  const reshuffleTiles = () => {
    if (!correctAnswer) return;
    
    const correctChars = [...new Set(splitBaybayinWord(correctAnswer))];
    const totalTiles = 10;
    let newTiles = [...correctChars]; // Always include correct chars
    
    const neededWrong = totalTiles - newTiles.length;
    if (neededWrong > 0) {
      const wrongChars = ALL_BAYBAYIN_CHARS.filter(
        (c) => !correctChars.includes(c)
      );
      const shuffledWrong = [...wrongChars].sort(() => 0.5 - Math.random());
      newTiles = [...newTiles, ...shuffledWrong.slice(0, neededWrong)];
    }
    
    newTiles = newTiles.sort(() => 0.5 - Math.random());
    setTiles(newTiles);
    setSelectedTiles([]);
    setTypedAnswer("");
  };

  useEffect(() => {
    if (!isGameStarted || gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameStarted, gameOver]);

  useEffect(() => {
    if (baybayinWord) {
      setCorrectAnswer(baybayinWord);
    }
  }, [baybayinWord]);

  // FIXED: Generate tiles whenever correctAnswer changes and game is active
  useEffect(() => {
    if (correctAnswer && isGameStarted && !gameOver) {
      generateTiles();
    }
  }, [correctAnswer, isGameStarted]);

  useEffect(() => {
    console.log("Correct answer from DB:", baybayinWord);
  }, [baybayinWord]);

  const checkAnswer = () => {
    if (!typedAnswer) return;
    if (typedAnswer === correctAnswer) {
      setScore((s) => s + 1);
      const duration = 800;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      nextQuestion();
    } else {
      errorSound.currentTime = 0;
      errorSound.play();
      setFlash(true);
      setIsWrong(true);
      setTileVibrate(true);
      setTimeout(() => {
        setFlash(false);
        setIsWrong(false);
        setTileVibrate(false);
        setSelectedTiles([]);
        setTypedAnswer("");
      }, 600);
      console.log("WRONG TRIGGERED");
    }
  };

  const skipQuestion = () => nextQuestion();

  const nextQuestion = () => {
    // FIXED: Always fetch new word from database instead of generating random
    // This ensures consistency with the image displayed
    setSelectedTiles([]);
    setTypedAnswer("");
    refetch();
  };

  const handleRestart = () => {
    scoreSaved.current = false;
    setScore(0);
    setTargetIndex(0);
    setGameOver(false);
    setTimeLeft(MAX_TIME);
    setPreviousWord(null);
    // Don't call generateTiles directly, let the useEffect handle it after refetch
    refetch();
  };

  const handleClear = () => {
    if (typedAnswer.length === 0) return;
    const newSelectedTiles = [...selectedTiles];
    newSelectedTiles.pop();
    setSelectedTiles(newSelectedTiles);
    setTypedAnswer(newSelectedTiles.join(""));
  };

  const handleTileClick = (tile) => {
    if (gameOver) return;
    clickSound.currentTime = 0;
    clickSound.play();
    setSelectedTiles((prev) => {
      const newTiles = [...prev, tile];
      setTypedAnswer(newTiles.join(""));
      return newTiles;
    });
  };

  return (
    <div
      style={{
        ...styles.body,
        background: flash
          ? "linear-gradient(135deg,#7f1d1d,#b91c1c)"
          : "linear-gradient(135deg,#C2410C,#EA580C)",
        transition: "background 0.15s ease-in-out",
      }}
    >
      {flash && <div style={styles.damageOverlay} />}
      <LeftDecor src={write1} alt="Decor Left" />
      <RightDecor src={write2} alt="Decor Right" />
      <BackButton src={home} alt="Back" onClick={() => navigate("/HomeGame")} />
      <ScoreBox>
         Score: {score}
      </ScoreBox>
      <TimeWrapper>
        <TimeBarBackground>
          <TimeBarFill width={(timeLeft / MAX_TIME) * 100} />
          <TimeText $pulse={timeLeft <= 10}>
            {timeLeft}s
          </TimeText>
        </TimeBarBackground>
      </TimeWrapper>
      <div style={styles.canvasBox}>
        {loading ? (
          <span>Loading...</span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Game"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: "20px",
              objectFit: "contain",
            }}
          />
        ) : (
          <span>No Image</span>
        )}
      </div>
      <div
        style={{
          ...styles.answerLine,
          ...(isWrong ? styles.shake : {}),
        }}
      >
        {selectedTiles.length === 0 ? (
          <span style={styles.answerPlaceholder}>
            Click tiles below to form your answer
          </span>
        ) : (
          <span style={styles.answerSentence}>{typedAnswer}</span>
        )}
      </div>
      <div style={styles.tilesPanel}>
        {tiles.map((tile, index) => (
          <div
            key={index}
            style={{
              ...styles.tile,
              ...(tileVibrate ? styles.vibrate : {}),
            }}
            onClick={() => handleTileClick(tile)}
          >
            {tile}
          </div>
        ))}
      </div>
      <div style={styles.buttonGroup}>
        <CustomButton label="Check Answer" onClick={checkAnswer} />
        <CustomButton label="Clear" onClick={handleClear} />
        <CustomButton label="Skip" onClick={skipQuestion} />
        <CustomButton label="Reshuffle Tiles" onClick={reshuffleTiles} />
      </div>
      {gameOver && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⏰ Time's Up!</h2>
            <p>Final Score: {score}</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Score saved to {selectedDifficulty} leaderboard!
            </p>
            <div style={styles.horizontalButtonGroup}>
              <CustomButton label="Restart" onClick={handleRestart} />
              <CustomButton
                label="Exit"
                onClick={() => navigate("/HomeGame")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  body: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#C2410C,#EA580C)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 120,
    gap: 24,
    position: "relative",
  },
  statsBar: {
    display: "flex",
    gap: 20,
    fontSize: "1.2rem",
    color: "#fff",
    alignItems: "center",
  },
  scoreBox: {
    background: "#fbbf24",
    padding: "8px 16px",
    borderRadius: 12,
    fontWeight: "bold",
    color: "#1f2937",
    left: "55%",
    transform: "translateX(-50%)",
  },
  timeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  timeBarBackground: {
    width: 120,
    height: 16,
    background: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  timeBarFill: {
    height: "100%",
    borderRadius: 8,
    transition: "width 0.3s linear",
  },
  timeText: {
    fontSize: "0.9rem",
    color: "#fff",
  },
  categoryBadge: {
    background: "#10b981",
    padding: "6px 12px",
    borderRadius: 12,
    fontWeight: "bold",
  },
  canvasBox: {
    width: 450,
    height: 280,
    background: "#fffacd",
    borderRadius: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "5rem",
    fontWeight: "bold",
    color: "#dc2626",
    border: "3px solid #fbbf24",
  },
  targetChar: {
    color: "#dc2626",
  },
  answerLine: {
    width: 500,
    minHeight: 60,
    height: 60,
    borderBottom: "4px solid #fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 10px",
    marginTop: -10,
    fontSize: "2rem",
    color: "#1f2937",
    fontWeight: "bold",
    whiteSpace: "pre",
    wordBreak: "keep-all",
    letterSpacing: "8px",
  },
  answerSentence: {
    color: "#1f2937",
    fontSize: "2.5rem",
    fontWeight: "bold",
  },
  answerPlaceholder: {
    fontSize: "1rem",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  tilesPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 10,
    width: 360,
    padding: 10,
    background: "rgba(255,255,255,0.9)",
    borderRadius: 16,
  },
  tile: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "2rem",
    cursor: "pointer",
    background: "#fff",
    border: "2px solid #ddd",
    transition: "all 0.2s",
    ":hover": {
      background: "#f0f0f0",
      transform: "scale(1.05)",
    },
  },
  buttonGroup: {
    position: "absolute",
    top: 680,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "row",
    gap: 20,
    zIndex: 20,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    textAlign: "center",
  },
  horizontalButtonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 70,
  },
  shake: {
    animation: "shake 0.4s",
  },
  wrongFlash: {
    backgroundColor: "#fee2e2",
    borderBottom: "4px solid #dc2626",
    transition: "all 0.2s ease",
  },
  wrongPop: {
    transform: "scale(0.9)",
    transition: "transform 0.1s ease",
  },
  vibrate: {
    animation: "tileJump 0.3s",
  },
  damageOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(220, 38, 38, 0.35)",
    backdropFilter: "blur(2px)",
    pointerEvents: "none",
    zIndex: 999,
    animation: "screenShake 0.8s ease",
  },
};

export default TapMode;