import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import baybayinQuestions from "./data/baybayinQuestions";
import green1 from "../../../Assests/green1.png";
import green4 from "../../../Assests/green4.png";
import home from "../../../Assests/backB.png";
import confetti from "canvas-confetti"; // 🎉 CONFETTI

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
`;

const Multiple = ({ difficulty = "Easy", startGame = false, gameMode = "Multiple Choice" }) => {
  const navigate = useNavigate();

  // Filter questions based on difficulty
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [time, setTime] = useState(20);
  const [isPlaying, setIsPlaying] = useState(startGame);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const choiceLabels = ["A", "B", "C", "D"];
  const timePercent = (time / 20) * 100;

  // Shuffle helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load filtered questions whenever difficulty changes
  useEffect(() => {
    const filtered = baybayinQuestions.filter((q) => q.difficulty === difficulty);
    setFilteredQuestions(filtered);
    const shuffled = shuffleArray(filtered);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setCurrentQuestion(shuffled[0]);
    setSelected(null);
    setFeedback("");
    setScore(0);
    setTime(20);
    setSkipsLeft(3);
    setGameOver(false);
    setShowPlusOne(false);
    setIsPlaying(startGame);
  }, [difficulty, startGame]);

  // Shuffle options whenever current question changes
  useEffect(() => {
    if (currentQuestion) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestion]);

  // Timer
  useEffect(() => {
    if (isPlaying && !gameOver) {
      const timer = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            clearInterval(timer);
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

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < shuffledQuestions.length) {
      setCurrentIndex(nextIndex);
      setCurrentQuestion(shuffledQuestions[nextIndex]);
    } else {
      // Reshuffle questions if at the end
      const reshuffled = shuffleArray(filteredQuestions);
      setShuffledQuestions(reshuffled);
      setCurrentIndex(0);
      setCurrentQuestion(reshuffled[0]);
    }
    setSelected(null);
    setFeedback("");
  };

  const handleWrongAnswer = () => {
    setFeedback("❌ Wrong!");
    setTimeout(() => {
      setFeedback("");
      setSelected(null);
      nextQuestion();
    }, 800);
  };

  const handleCorrectAnimation = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCheck = () => {
    if (!selected) return;
    if (selected === currentQuestion.answer) {
      setFeedback("✅ Correct!");
      setScore((s) => s + 1);
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 800);
      handleCorrectAnimation();
      setTime((t) => Math.min(t + 1, 999));
      setTimeout(() => nextQuestion(), 800);
    } else {
      handleWrongAnswer();
    }
  };

  const handleRestart = () => {
    const reshuffled = shuffleArray(filteredQuestions);
    setShuffledQuestions(reshuffled);
    setCurrentIndex(0);
    setCurrentQuestion(reshuffled[0]);
    setScore(0);
    setTime(20);
    setGameOver(false);
    setIsPlaying(true);
    setFeedback("");
    setSelected(null);
    setSkipsLeft(3);
    setShowPlusOne(false);
  };

  const handleSkip = () => {
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setFeedback("⏭️ You skipped the question!");
      setTimeout(() => nextQuestion(), 800);
    }
  };

  const handleBackClick = () => setShowExitConfirm(true);
  const confirmExit = (confirm) => {
    setShowExitConfirm(false);
    if (confirm) navigate("/translate");
  };

  return (
    <Container>
      <LeftImage src={green1} />
      <RightImage src={green4} />

      <GlassCard>
        {/* TIMER */}
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

            <Options>
              {shuffledOptions.map((opt, i) => (
                <OptionWrapper key={i}>
                  <OptionLabel>{choiceLabels[i]}.</OptionLabel>
                  <OptionButton
                    onClick={() => setSelected(opt)}
                    $selected={selected === opt}
                  >
                    {opt}
                  </OptionButton>
                </OptionWrapper>
              ))}
            </Options>

            <ButtonRow>
              <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
              <CustomButton
                label={`⏭ Skip (${skipsLeft})`}
                onClick={handleSkip}
                width="160px"
                disabled={skipsLeft === 0}
              />
            </ButtonRow>

            {feedback && <Feedback>{feedback}</Feedback>}
          </>
        )}

        <BackButton src={home} onClick={handleBackClick} />
      </GlassCard>

      {/* GAME OVER MODAL */}
      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
            <p>Game Mode: <strong>{gameMode}</strong></p>
            <p>Difficulty: <strong>{difficulty}</strong></p>
            <p>Final Score: {score}</p>
            <ButtonWrapper>
              <CustomButton label="🔁 Restart" onClick={handleRestart} width="160px" color="#ffb300" />
            </ButtonWrapper>
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

export default Multiple;

/* ---------------- STYLES ---------------- */

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
  position: absolute;
  left: 0;
  top: 0;
  width: 410px;
  animation: ${slideFromLeft} 0.5s forwards;
`;

const RightImage = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  width: 410px;
  animation: ${slideFromRight} 0.5s forwards;
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

  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${pulse} 1s infinite;
      color: #C2410C;
    `}
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
  font-size: 1.2rem;
  margin: 14px 0 18px;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`;

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionLabel = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
`;

const OptionButton = styled.button`
  flex: 1;
  background: ${({ $selected }) =>
    $selected ? "linear-gradient(135deg, #C2410C, #EA580C)" : "rgba(255,255,255,0.4)"};
  color: ${({ $selected }) => ($selected ? "#fff" : "#222")};
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Feedback = styled.p`
  margin-top: 10px;
  font-size: 1.15rem;
  font-weight: 600;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: white;
  padding: 40px;
  border-radius: 18px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ButtonWrapper = styled.div`
  margin-top: 12px;
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

  &:hover {
    transform: scale(0.9);
  }
`;
