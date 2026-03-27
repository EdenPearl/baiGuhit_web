import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import confetti from "canvas-confetti";

/* ---------------- ANIMATIONS ---------------- */
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

/* ---------------- STYLED COMPONENTS ---------------- */
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
  position: absolute;
  left: 0;
  top: 0;
  width: 410px;
  height: auto;
  animation: ${slideFromLeft} 0.5s forwards;
`;

const RightImage = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  width: 410px;
  height: auto;
  animation: ${slideFromRight} 0.5s forwards;
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

const Question = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 14px 0 18px;
  text-align: center;
  color: #ffffff;
  animation: fadeIn 0.25s ease-out;
  @keyframes fadeIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
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

const Feedback = styled.p`margin-top: 10px; font-size: 1.15rem; font-weight: 600;`;

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

/* ---------------- COMPONENT ---------------- */
const Typing = ({ difficulty = "Medium", startGame = false }) => {
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [isPlaying, setIsPlaying] = useState(startGame); 
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timePercent = Math.max(0, (time / 20) * 100);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/game/question/${difficulty}`);
      if (!res.ok) throw new Error("Failed to fetch question");
      const data = await res.json();
      setCurrentQuestion(data.question || "No question available");
      setInput("");
      
    } catch (err) {
      console.error(err);
      setFeedback("Error fetching question.");
      setCurrentQuestion("Unable to load question");
    } finally {
      setLoading(false);
    }
  };

  const checkWithGrok = async (question, userAnswer) => {
    try {
      const res = await fetch("http://localhost:8000/game/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userAnswer })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Grok check error:", err);
      return { correct: false, reason: "Error connecting to Grok." };
    }
  };

  const handleCorrectAnimation = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleCheck = async () => {
    if (!currentQuestion || !isPlaying || gameOver) return;
    const userAnswer = input.trim().toUpperCase();
    const result = await checkWithGrok(currentQuestion, userAnswer);

    if (result.correct) {
      setFeedback(`✅ Correct! ${result.reason || ""}`);
      setScore((s) => s + 1);
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 800);
      handleCorrectAnimation();
      setTime((t) => Math.min(t + 1, 20));
    } else {
      setFeedback(`❌ Incorrect! ${result.reason || ""}`);
    }

    setTimeout(() => {
      setFeedback("");
      fetchQuestion();
    }, 1500);
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!startGame) return; // only start after Play
    setIsPlaying(true);

    if (isPlaying && time > 0 && !gameOver) {
      const timer = setInterval(() => setTime((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (isPlaying && time === 0 && !gameOver) {
      setGameOver(true); // trigger game over modal
      setIsPlaying(false);
      setFeedback("❌ Time's up!");
    }
  }, [isPlaying, time, gameOver, startGame]);

  useEffect(() => {
    if (startGame) fetchQuestion();
  }, [difficulty, startGame]);

  const handleSkip = () => {
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setFeedback("⏭️ You skipped the question!");
      setTimeout(() => { setFeedback(""); fetchQuestion(); }, 800);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setTime(20);
    setGameOver(false);
    setIsPlaying(true);
    setInput("");
    setFeedback("");
    setSkipsLeft(3);
    fetchQuestion();
  };

  const handleBackClick = () => setShowExitConfirm(true);
  const confirmExit = (confirm) => { setShowExitConfirm(false); if (confirm) navigate("/translate"); };

  return (
    <Container>
      <LeftImage src={green1} alt="Green1" />
      <RightImage src={green4} alt="Green4" />

      <GlassCard>
        <TimeBarContainer>
          <TimeBar $timePercent={timePercent} />
          <TimeText $pulse={time <= 10}>{time}s</TimeText>
        </TimeBarContainer>

        <ScoreTimeBox>
          <Score>🏆 Score: {score}</Score>
          {showPlusOne && <PlusOne>+1</PlusOne>}
        </ScoreTimeBox>

        {loading ? (
          <p>Loading question...</p>
        ) : (
          <>
            {currentQuestion && startGame && !gameOver && (
              <>
                <Question>{currentQuestion}</Question>
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type here..."
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                />
                <ButtonRow>
                  <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
                  <CustomButton
                    label={`Skip (${skipsLeft})`}
                    onClick={handleSkip}
                    width="160px"
                    disabled={skipsLeft === 0}
                  />
                </ButtonRow>
              </>
            )}
            {feedback && <Feedback>{feedback}</Feedback>}
          </>
        )}

        <BackButton src={home} alt="Back" onClick={handleBackClick} />
      </GlassCard>

      {/* GAME OVER MODAL */}
      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
      
            <p>Difficulty: <strong>{difficulty}</strong></p>
            <p>Final Score: {score}</p>
            <ButtonRow>
              <CustomButton label="Restart" onClick={handleRestart} width="160px" color="#ffb300" />
            </ButtonRow>
          </Modal>
        </Overlay>
      )}

      {/* EXIT CONFIRM MODAL */}
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

export default Typing;
