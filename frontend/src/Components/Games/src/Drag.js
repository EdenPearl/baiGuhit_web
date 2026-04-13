// src/Components/Drag.js
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import confetti from "canvas-confetti";
import dragMusic from '../../../Assests/Tap.mp3';
import stoneClick from '../../../Assests/stone.mp3';

/* ---------------- ANIMATIONS ---------------- */
const pulse = keyframes`0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); }`;
const flashUp = keyframes`0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-40px); }`;
const slideFromLeft = keyframes`from { transform: translateX(-200px); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;
const slideFromRight = keyframes`from { transform: translateX(200px); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;
const slideFromTop = keyframes`from { transform: translateY(-150px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;
const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

/* ---------------- COMPONENT ---------------- */
const Drag = ({ difficulty = "Medium", startGame = false, onGameOver }) => {
  const navigate = useNavigate();
  const audioRef = useRef(new Audio(dragMusic));
  const clickRef = useRef(new Audio(stoneClick));
  const scoreSaved = useRef(false);
  const timerRef = useRef(null);

  // ✅ Configuration based on difficulty
  const getDifficultyConfig = (diff) => {
    const normalizedDiff = diff?.toLowerCase() || "medium";
    switch (normalizedDiff) {
      case "easy":
        return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy" };
      case "medium":
        return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium" };
      case "hard":
        return { timeLimit: 30, pointsPerCorrect: 2, label: "Hard" };
      default:
        return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium" };
    }
  };

  const config = getDifficultyConfig(difficulty);
  const timeLimit = config.timeLimit;
  const pointsPerCorrect = config.pointsPerCorrect;

  const playClick = () => {
    clickRef.current.currentTime = 0;
    clickRef.current.play().catch(() => {});
  };

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showPlusPoints, setShowPlusPoints] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [time, setTime] = useState(timeLimit);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [shakeDrop, setShakeDrop] = useState(false);

  const choicesRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [dropHeight, setDropHeight] = useState(240);

  useEffect(() => {
    if (gameOver && onGameOver && !scoreSaved.current) {
      scoreSaved.current = true;
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  /* ---------------- BACKGROUND MUSIC ---------------- */
  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.4;

    if (isPlaying && !gameOver) audio.play().catch(() => {});
    if (!isPlaying || gameOver) audio.pause();

    return () => audio.pause();
  }, [isPlaying, gameOver]);

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {
    scoreSaved.current = false;
    
    fetch("/game/questions/drag")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(q => q.difficulty === difficulty);
        setQuestions(filtered);

        const shuffled = shuffleArray(filtered);
        setShuffledQuestions(shuffled);

        setCurrentIndex(0);
        setCurrentQuestion({ ...shuffled[0], options: shuffleArray(shuffled[0].options) });

        setScore(0);
        setTime(timeLimit);
        setSelected(null);
        setFeedback("");
        setGameOver(false);
        setSkipsLeft(3);
        setShowPlusPoints(false);
        setIsPlaying(startGame);
        setIsAnswering(false);
      })
      .catch((err) => console.error("Failed to fetch drag questions:", err));
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty, startGame, timeLimit]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, gameOver]);

  /* ---------------- AUTO HEIGHT ---------------- */
  useEffect(() => {
    if (choicesRef.current) setDropHeight(choicesRef.current.offsetHeight);
  }, [currentQuestion]);

  /* ---------------- DRAG & DROP ---------------- */
  const handleDragStart = (e, val) => {
    e.dataTransfer.setData("text", val);
    setSelected(val);
  };

  const allowDrop = (e) => e.preventDefault();

  const miniShards = () => {
    confetti({
      particleCount: 25,
      startVelocity: 30,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FF0000", "#FF4C4C", "#FF8080"],
      shapes: ["triangle"],
      gravity: 0.5,
      scalar: 0.7,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!isPlaying || gameOver || isAnswering) return;

    const data = e.dataTransfer.getData("text");
    setIsAnswering(true);

    if (data === currentQuestion.answer) handleCorrectAnswer();
    else handleWrongAnswer();
  };

  /* ---------------- GAME LOGIC ---------------- */
  const handleCorrectAnswer = () => {
    setScore((s) => s + pointsPerCorrect);
    setPointsGained(pointsPerCorrect);
    setShowPlusPoints(true);
    setFeedback("✅ Correct!");
    setTime((t) => t + 1);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      setShowPlusPoints(false);
      setIsAnswering(false);
      nextQuestion();
    }, 1800);
  };

  const handleWrongAnswer = () => {
    setFeedback("❌ Wrong!");
    miniShards();
    setShakeDrop(true);

    setTimeout(() => {
      setShakeDrop(false);
      setIsAnswering(false);
      nextQuestion();
    }, 1800);
  };

  const nextQuestion = () => {
    let nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledQuestions.length) {
      const reshuffled = shuffleArray(questions);
      setShuffledQuestions(reshuffled);
      nextIndex = 0;
    }

    const nextQ = {
      ...shuffledQuestions[nextIndex],
      options: shuffleArray(shuffledQuestions[nextIndex].options)
    };

    setCurrentQuestion(nextQ);
    setCurrentIndex(nextIndex);
    setSelected(null);
    setFeedback("");
  };

  const handleSkip = () => {
    playClick();
    if (skipsLeft > 0 && !gameOver && !isAnswering) {
      setSkipsLeft((s) => s - 1);
      setFeedback("⏭️ You skipped the question!");
      setIsAnswering(true);
      setTimeout(() => {
        setIsAnswering(false);
        nextQuestion();
      }, 800);
    }
  };

  const handleRestart = () => {
    playClick();
    scoreSaved.current = false;
    
    const reshuffled = shuffleArray(questions);
    setShuffledQuestions(reshuffled);
    setCurrentIndex(0);
    setCurrentQuestion({ ...reshuffled[0], options: shuffleArray(reshuffled[0].options) });
    setScore(0);
    setTime(timeLimit);
    setGameOver(false);
    setSelected(null);
    setIsPlaying(true);
    setSkipsLeft(3);
    setFeedback("");
    setIsAnswering(false);
  };

  const handleBackClick = () => { playClick(); setShowExitConfirm(true); };
  const confirmExit = (confirm) => { playClick(); setShowExitConfirm(false); if (confirm) navigate("/HomeGame"); };

  const timePercent = (time / timeLimit) * 100;

  return (
    <Container>
      <LeftImage src={green1} />
      <RightImage src={green4} />

      <GlassCard>
        <TimeBarContainer>
          <TimeBar $timePercent={timePercent} />
          <TimeText $pulse={time <= 10}>{time}s</TimeText>
        </TimeBarContainer>

        <ScoreTimeBox>
          <Score>🏆 Score: {score}</Score>
          {showPlusPoints && <PlusOne>+{pointsGained}</PlusOne>}
        </ScoreTimeBox>

        <DifficultyBadge>
          {config.label} Mode • {pointsPerCorrect} pts/correct • {timeLimit}s
        </DifficultyBadge>

        {isPlaying && !gameOver && currentQuestion && (
          <>
            {/* ✅ ENHANCED QUESTION BOX - Auto-fits long text */}
            <QuestionBox>
              <QuestionText>{currentQuestion.question}</QuestionText>
            </QuestionBox>

            <GamePanel>
              <ChoicesColumn ref={choicesRef}>
                {currentQuestion.options.map((opt) => (
                  <Draggable
                    key={opt}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opt)}
                  >
                    {opt}
                  </Draggable>
                ))}
              </ChoicesColumn>

              <DropZoneColumn>
                <DropZone
                  ref={dropZoneRef}
                  onDrop={handleDrop}
                  onDragOver={allowDrop}
                  style={{ height: dropHeight }}
                  $shake={shakeDrop}
                >
                  Drop Here
                </DropZone>
              </DropZoneColumn>
            </GamePanel>

            {feedback && <Feedback>{feedback}</Feedback>}

            <ButtonRow>
              <CustomButton
                label={`⏭️ Skip (${skipsLeft})`}
                onClick={handleSkip}
                width="180px"
                disabled={skipsLeft === 0 || isAnswering}
              />
            </ButtonRow>
          </>
        )}

        <BackButton src={home} onClick={handleBackClick} />
      </GlassCard>

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
            <p>Game Mode: <strong>Drag & Drop</strong></p>
            <p>Difficulty: <strong>{config.label}</strong></p>
            <p>Final Score: <strong>{score}</strong></p>
            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
              ({pointsPerCorrect} points per correct answer)
            </p>

            <ButtonWrapper>
              <CustomButton
                label="Restart"
                onClick={handleRestart}
                width="160px"
                color="#ffb300"
              />

              <CustomButton
                label="Exit"
                onClick={() => navigate("/HomeGame")}
                width="160px"
                color="#ffb300"
              />
            </ButtonWrapper>
          </Modal>
        </Overlay>
      )}

      {showExitConfirm && (
        <Overlay>
          <Modal>
            <h2>⚠️ Are you sure you want to exit?</h2>
            <ButtonRow>
              <CustomButton label="YES" onClick={() => confirmExit(true)} width="100px" color="red" />
              <CustomButton label="NO" onClick={() => confirmExit(false)} width="100px" color="green" />
            </ButtonRow>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
};

export default Drag;

/* ---------------- STYLES ---------------- */
const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  font-family: "Poppins", sans-serif;
  overflow: hidden;
`;

const LeftImage = styled.img`
  position: absolute; left: 0; top: 0; width: 410px; animation: ${slideFromLeft} 0.5s forwards;
`;
const RightImage = styled.img`
  position: absolute; right: 0; top: 0; width: 410px; animation: ${slideFromRight} 0.5s forwards;
`;

const GlassCard = styled.div`
  background: rgba(255,255,255,0.15);
  border-radius: 25px;
  padding: 50px 60px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  text-align: center;
  width: 95%;
  max-width: 640px;
  z-index: 10;
`;

const TimeBarContainer = styled.div`
  position: relative; height: 28px; margin-bottom: 16px; border-radius: 14px;
  background: rgba(255,255,255,0.3); overflow: hidden;
`;
const TimeBar = styled.div`
  position: absolute; height: 100%; width: ${({ $timePercent }) => $timePercent}%;
  background: linear-gradient(135deg, #C2410C, #EA580C); transition: width 1s linear;
`;
const TimeText = styled.div`
  position: absolute; width: 100%; text-align: center; font-weight: 700; font-size: 1.1rem;
  ${({ $pulse }) => $pulse && css`animation: ${pulse} 1s infinite; color: #C2410C;`}
`;

const ScoreTimeBox = styled.div`
  display: flex; justify-content: flex-start; font-size: 1.05rem; margin-bottom: 10px; position: relative;
`;
const PlusOne = styled.div`
  position: absolute; left: 60px; top: -10px; font-size: 1.2rem; font-weight: bold;
  color: #00FF00; animation: ${flashUp} 0.8s forwards;
`;
const Score = styled.div``;

const DifficultyBadge = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: inline-block;
  font-weight: 600;
`;

/* ✅ ENHANCED QUESTION STYLES - Box with auto-fit text */
const QuestionBox = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 20px 24px;
  margin: 20px 0 25px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const QuestionText = styled.h2`
  font-size: clamp(1.2rem, 4vw, 2rem);
  font-weight: 600;
  margin: 0;
  text-align: center;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const GamePanel = styled.div`
  display:flex; align-items:center; justify-content:space-between; margin:20px 0; gap:40px;
`;

const ChoicesColumn = styled.div`
  display:flex; flex-direction:column; gap:16px; flex:1;
`;
const DropZoneColumn = styled.div`
  flex:1; display:flex; align-items:center; justify-content:center;
`;
const Draggable = styled.div`
  background: rgba(255, 255, 255, 0.85); color:#333; border-radius:12px;
  padding:12px 20px; font-size:1.6rem; cursor:grab; user-select:none;
  transition: all 0.25s ease-in-out; text-align:center;
  &:hover { transform: scale(1.1); background:#fff; box-shadow:0 0 15px rgba(255,255,255,0.7);}
`;
const DropZone = styled.div`
  width:100%; max-width:260px; min-height:240px;
  border:3px dashed #fff; border-radius:18px;
  display:flex; align-items:center; justify-content:center;
  font-size:1.3rem; font-weight:700;
  background: rgba(255,255,255,0.12); color:#fff; padding:20px;
  ${({ $shake }) => $shake && css`animation: ${shake} 0.3s ease-in-out;`}
`;

const Feedback = styled.p`margin-top:10px; font-size:1.15rem; font-weight:600;`;

const ButtonRow = styled.div`display:flex; gap:12px; justify-content:center; margin-top:8px;`;
const ButtonWrapper = styled.div`margin-top:12px;`;

const Overlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,0.6);
  display:flex; align-items:center; justify-content:center; z-index:9999;
`;
const Modal = styled.div`
  background:white; padding:40px 50px; border-radius:18px; color:#333;
  border:2px solid #ddd; text-align:center; width:90%; max-width:400px;
  box-shadow:0 6px 25px rgba(0,0,0,0.3);
`;
const BackButton = styled.img`
  position:absolute; top:-6%; left:-5%; width:350px; height:auto; cursor:pointer;
  z-index:10; animation:${slideFromTop} 0.9s ease-out; transition:transform 0.3s ease;
  &:hover{transform:scale(0.9);}
`;