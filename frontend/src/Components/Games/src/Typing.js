import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import confetti from "canvas-confetti";
import bgMusicFile from "../../../Assests/Tap.mp3";
import stoneClick from "../../../Assests/stone.mp3";

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-36px); }
`;

const slideFromLeft = keyframes`
  from { transform: translateX(-200px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideFromRight = keyframes`
  from { transform: translateX(200px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideFromTop = keyframes`
  from { transform: translateY(-150px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

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
  position: absolute; left: 0; top: 0;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const RightImage = styled.img`
  position: absolute; right: 0; top: 0;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  padding: 30px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  text-align: center;
  width: 95%;
  max-width: 720px;
  z-index: 10;
`;

const TimeBarContainer = styled.div`
  position: relative;
  height: 28px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.22);
  overflow: hidden;
`;

const TimeBar = styled.div`
  position: absolute;
  height: 100%;
  width: ${({ $timePercent }) => $timePercent}%;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  transition: width 1s linear;
`;

const TimeText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 1.05rem;
  ${({ $pulse }) => $pulse && css`animation: ${pulse} 1s infinite; color: #C2410C;`}
`;

const ScoreTimeBox = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 1.05rem;
  margin-bottom: 10px;
  position: relative;
`;

const PlusOne = styled.div`
  position: absolute;
  left: 86px;
  top: -6px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #7CFC00;
  animation: ${flashUp} 0.8s forwards;
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

const Question = styled.h2`
  font-size: 1.2rem;
  margin: 14px 0 18px;
`;

const CharacterBox = styled.div`
  background:#ffffff;
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 20px 30px;
  border-radius: 14px;
  margin: 16px auto;
  display: inline-block;
  min-width: 100px;
`;

const Input = styled.input`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.15rem;
  margin-bottom: 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  width: 80%;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
`;

const Feedback = styled.p`
  margin-top: 10px;
  font-size: 1.15rem;
  font-weight: 600;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: white;
  padding: 40px 50px;
  border-radius: 18px;
  color: #333;
  border: 2px solid #ddd;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 6px 25px rgba(0,0,0,0.3);
`;

const BackButton = styled.img`
  position: absolute;
  top: -6%;
  left: -5%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 10;
  animation: ${slideFromTop} 0.9s ease-out;
  transition: transform 0.3s ease;
  &:hover { transform: scale(0.9); }
`;

// ==================== FIXED COMPONENT ====================
const Typing = ({ difficulty = "Medium", startGame = false, onGameOver }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const clickRef = useRef(new Audio(stoneClick));

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

  // ✅ Calculate config based on current difficulty
  const config = getDifficultyConfig(difficulty);
  const timeLimit = config.timeLimit;
  const pointsPerCorrect = config.pointsPerCorrect;

  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(startGame);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showPlusPoints, setShowPlusPoints] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // ✅ Update time whenever difficulty changes
  useEffect(() => {
    setTime(timeLimit);
  }, [difficulty, timeLimit]);

  const timePercent = Math.max(0, (time / timeLimit) * 100);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/game/questions/typing`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      const filtered = data[difficulty] || [];
      setQuestions(filtered);
      setShuffledQuestions(shuffleArray(filtered));
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setFeedback("Error loading questions.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = shuffledQuestions[currentIndex] || null;

  const playClickSound = () => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(err => console.log("Click audio error:", err));
    }
  };

  const handleCorrectAnimation = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  const handleWrongAnimation = () => confetti({ particleCount: 30, angle: 90, spread: 100, startVelocity: 15, gravity: 0.6, colors: ["#FF0000"], shapes: ["triangle"], origin: { y: 0.3 } });

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < shuffledQuestions.length) setCurrentIndex(nextIndex);
    else setCurrentIndex(0);
    setInput(""); setFeedback("");
  };

  const handleCheck = () => {
    playClickSound();
    if (!currentQuestion || !isPlaying) return;
    const userAnswer = input.trim();
    if (userAnswer.toUpperCase() === currentQuestion.answer.toUpperCase()) {
      setFeedback("✅ Correct!"); 
      setScore(s => s + pointsPerCorrect); 
      setPointsGained(pointsPerCorrect);
      setShowPlusPoints(true);
      setTimeout(() => setShowPlusPoints(false), 800); 
      handleCorrectAnimation();
      setTime(t => Math.min(t + 1, 999)); 
      setTimeout(() => nextQuestion(), 800);
    } else { 
      setFeedback("❌ Wrong!"); 
      handleWrongAnimation(); 
      setTimeout(() => nextQuestion(), 2000); 
    }
  };

  const handleSkip = () => {
    playClickSound();
    if (skipsLeft > 0) { 
      setSkipsLeft(s => s - 1); 
      setFeedback("⏭️ Skipped!"); 
      setTimeout(() => { setFeedback(""); nextQuestion(); }, 800); 
    }
  };

  const handleRestart = () => {
    playClickSound();
    setScore(0); 
    setTime(timeLimit); 
    setGameOver(false); 
    setIsPlaying(true); 
    setInput(""); 
    setFeedback(""); 
    setSkipsLeft(3); 
    setCurrentIndex(0); 
    setScoreSubmitted(false);
  };

  const handleBackClick = () => { playClickSound(); setShowExitConfirm(true); };
  const confirmExit = (confirm) => { playClickSound(); setShowExitConfirm(false); if (confirm) navigate("/HomeGame"); };

  // ✅ Reset game state when difficulty changes
  useEffect(() => { 
    if (startGame) {
      setIsPlaying(true);
      setGameOver(false);
      setScore(0);
      setTime(timeLimit);
      setSkipsLeft(3);
      setScoreSubmitted(false);
      setCurrentIndex(0);
      setInput("");
      setFeedback("");
    }
    fetchQuestions(); 
  }, [difficulty, startGame, timeLimit]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      if (isPlaying && !gameOver) audioRef.current.play().catch(err => console.log("Audio error:", err));
      else audioRef.current.pause();
    }
  }, [isPlaying, gameOver]);

  // ==================== CRITICAL FIX: Game Over Timer ====================
  useEffect(() => {
    if (isPlaying && !gameOver) {
      const timer = setInterval(() => {
        setTime(t => { 
          if (t <= 1) { 
            setGameOver(true); 
            setIsPlaying(false); 
            return 0; 
          } 
          return t - 1; 
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, gameOver]);

  // ==================== CRITICAL FIX: Call onGameOver when game ends ====================
  useEffect(() => {
    if (gameOver && onGameOver && !scoreSubmitted) {
      onGameOver(score);
      setScoreSubmitted(true);
    }
  }, [gameOver, score, onGameOver, scoreSubmitted]);

  return (
    <Container>
      <audio ref={audioRef} src={bgMusicFile} />
      <LeftImage src={green1} alt="Green1" />
      <RightImage src={green4} alt="Green4" />
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

        {loading ? <p>Loading questions...</p> :
        <>
          {currentQuestion && isPlaying &&
          <>
            <Question>What is the LATIN equivalent of:</Question>
            <CharacterBox>{currentQuestion.question}</CharacterBox>
            <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." onKeyDown={(e) => e.key === "Enter" && handleCheck()} />
            <ButtonRow>
              <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
              <CustomButton label={`⏭️ Skip (${skipsLeft})`} onClick={handleSkip} width="160px" disabled={skipsLeft === 0} />
            </ButtonRow>
          </>}
          {feedback && <Feedback>{feedback}</Feedback>}
        </>}
        <BackButton src={home} alt="Back" onClick={handleBackClick} />
      </GlassCard>

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
            <p>Difficulty: <strong>{config.label}</strong></p>
            <p>Final Score: <strong>{score}</strong></p>
            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
              ({pointsPerCorrect} points per correct answer)
            </p>
            <ButtonRow>
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
            </ButtonRow>
          </Modal>
        </Overlay>
      )}

      {showExitConfirm &&
        <Overlay>
          <Modal>
            <h2>⚠️ Are you sure you want to exit?</h2>
            <ButtonRow>
              <CustomButton label="YES" onClick={() => confirmExit(true)} width="100px" color="red" />
              <CustomButton label="NO" onClick={() => confirmExit(false)} width="100px" color="green" />
            </ButtonRow>
          </Modal>
        </Overlay>
      }
    </Container>
  );
};

export default Typing;