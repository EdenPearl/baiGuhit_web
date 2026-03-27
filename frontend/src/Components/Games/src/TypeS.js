import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import typingQuestions from "./data/typingQuestions";
import CustomButton from "./CustomButton.js";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import confetti from "canvas-confetti"; // 🎉 ADD CONFETTI

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
`;

const Typing = ({ difficulty = "Medium", startGame = false }) => {
  const navigate = useNavigate();

  const questionSet = typingQuestions[difficulty] || typingQuestions.Medium;

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledQuestions, setShuffledQuestions] = useState(shuffleArray(questionSet));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(shuffledQuestions[0]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [time, setTime] = useState(20);
  const [isPlaying, setIsPlaying] = useState(startGame);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => setIsPlaying(startGame), [startGame]);

  useEffect(() => {
    if (currentQuestion) {
      setShuffledQuestions(shuffleArray(questionSet));
    }
  }, [currentQuestion, questionSet]);

  // TIMER
  useEffect(() => {
    if (isPlaying && !gameOver && time > 0) {
      const timer = setInterval(() => setTime((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (time === 0 && !gameOver) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [isPlaying, time, gameOver]);

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < shuffledQuestions.length) {
      setCurrentIndex(nextIndex);
      setCurrentQuestion(shuffledQuestions[nextIndex]);
    } else {
      const reshuffled = shuffleArray(questionSet);
      setShuffledQuestions(reshuffled);
      setCurrentIndex(0);
      setCurrentQuestion(reshuffled[0]);
    }

    setInput("");
    setFeedback("");
  };

  const handleWrongAnswer = () => {
    setFeedback("❌ Wrong!");
    setTimeout(() => nextQuestion(), 800);
  };

  const handleCorrectAnimation = () => {
    // 🎉 CONFETTI BURST
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCheck = () => {
    if (!isPlaying || gameOver) return;

    if (input.trim().toUpperCase() === currentQuestion.answer.toUpperCase()) {
      setFeedback("✅ Correct!");
      setScore((s) => s + 1);

      

      // +1 animation
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 800);

      // 🎉 Trigger confetti
      handleCorrectAnimation();

      setTime((t) => Math.min(t + 1, 20));

      setTimeout(() => nextQuestion(), 800);
    } else {
      handleWrongAnswer();
    }
  };

  const handleRestart = () => {
    const reshuffled = shuffleArray(questionSet);
    setShuffledQuestions(reshuffled);
    setCurrentIndex(0);
    setCurrentQuestion(reshuffled[0]);
    setScore(0);
    setTime(20);
    setGameOver(false);
    setFeedback("");
    setInput("");
    setIsPlaying(true);
    setSkipsLeft(3);
    setShowPlusOne(false);
  };

  const handleSkip = () => {
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setFeedback(" You skipped the question!");
      setTimeout(() => nextQuestion(), 800);
    }
  };

  const handleBackClick = () => setShowExitConfirm(true);
  const confirmExit = (confirm) => {
    setShowExitConfirm(false);
    if (confirm) navigate("/translate");
  };

  const timePercent = (time / 20) * 100;

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

        {isPlaying && !gameOver && currentQuestion && (
          <>
            <Question>{currentQuestion.question}</Question>

            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type here..."
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />

            <ButtonRow>
              <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
              <CustomButton label={` Skip (${skipsLeft})`} onClick={handleSkip} width="160px" disabled={skipsLeft === 0} />
            </ButtonRow>

            {feedback && <Feedback>{feedback}</Feedback>}
          </>
        )}

        <BackButton src={home} alt="Back" onClick={handleBackClick} />
      </GlassCard>

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>🎯 Game Over!</h2>
            <p>Game Mode: <strong>Typing Mode</strong></p>
            <p>Difficulty: <strong>{difficulty}</strong></p>
            <p>Final Score: {score}</p>

            <ButtonWrapper>
              <CustomButton label=" Restart" onClick={handleRestart} width="160px" color="#ffb300" />
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

export default Typing;

/* ---------------- STYLES ---------------- */
const slideFromLeft = keyframes`from { transform: translateX(-200px); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;
const slideFromRight = keyframes`from { transform: translateX(200px); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;
const slideFromTop = keyframes`from { transform: translateY(-150px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  font-family: "Poppins", sans-serif;
  overflow: hidden;
`;

const LeftImage = styled.img`position: absolute; left: 0; top: 0; width: 410px; height: auto; animation: ${slideFromLeft} 0.5s forwards;`;
const RightImage = styled.img`position: absolute; right: 0; top: 0; width: 410px; height: auto; animation: ${slideFromRight} 0.5s forwards;`;

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
  position: relative;
  height: 28px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.3);
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
  font-size: 1.1rem;
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
  left: 60px;
  top: -10px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #00FF00;
  animation: ${flashUp} 0.8s forwards;
`;

const Score = styled.div``;
const Question = styled.h2`
  font-size: 2.6rem;       /* LARGE and CLEAR */
  font-weight: 700;
  margin: 20px 0 25px;
  text-align: center;
  color: #ffffff;

  /* Smooth appearance only (no glow) */
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { transform: scale(0.85); opacity: 0; }
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
  background: rgba(255,255,255,0.85);
  width: 80%;
  text-align: center;
`;
const ButtonRow = styled.div`display: flex; gap: 12px; justify-content: center; margin-top: 8px;`;
const ButtonWrapper = styled.div`margin-top: 12px;`;
const Feedback = styled.p`margin-top: 10px; font-size: 1.15rem; font-weight: 600;`;
const Overlay = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;`;
const Modal = styled.div`background: white; padding: 40px 50px; border-radius: 18px; color: #333; border: 2px solid #ddd; text-align: center; width: 90%; max-width: 400px; box-shadow: 0 6px 25px rgba(0,0,0,0.3);`;
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
