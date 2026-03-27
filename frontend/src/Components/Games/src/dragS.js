import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import dragQuestions from "./data/dragQuestions";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import confetti from "canvas-confetti"; // 🎉 Confetti

/* ---------------- ANIMATIONS ---------------- */
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
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

/* ---------------- COMPONENT ---------------- */
const Drag = ({ difficulty = "Medium", start = false }) => {
  const navigate = useNavigate();

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const [shuffledQuestions, setShuffledQuestions] = useState(() =>
    shuffleArray(dragQuestions[difficulty] || dragQuestions.Medium)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(() => ({
    ...shuffledQuestions[0],
    options: shuffleArray(shuffledQuestions[0].options),
  }));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [time, setTime] = useState(20);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const choicesRef = useRef(null);
  const [dropHeight, setDropHeight] = useState(240);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    const newQuestions = shuffleArray(dragQuestions[difficulty] || dragQuestions.Medium);
    setShuffledQuestions(newQuestions);
    setCurrentIndex(0);
    setCurrentQuestion({ ...newQuestions[0], options: shuffleArray(newQuestions[0].options) });
    setScore(0);
    setTime(20);
    setSelected(null);
    setFeedback("");
    setGameOver(false);
    setSkipsLeft(3);
    setIsPlaying(false);
    setIsAnswering(false);
  }, [difficulty]);

  useEffect(() => { if (start) setIsPlaying(true); }, [start]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 0) {
          clearInterval(timer);
          setGameOver(true);
          setIsPlaying(false);
          return 0; // game over only at exact 0
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  /* ---------------- ADJUST DROP HEIGHT ---------------- */
  useEffect(() => {
    if (choicesRef.current) {
      setDropHeight(choicesRef.current.offsetHeight);
    }
  }, [currentQuestion]);

  /* ---------------- DRAG & DROP ---------------- */
  const handleDragStart = (e, val) => { 
    e.dataTransfer.setData("text", val); 
    setSelected(val); 
  };
  const allowDrop = (e) => e.preventDefault();

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
    setScore((s) => s + 1);
    setShowPlusOne(true);
    setFeedback("✅ Correct!");
    setTime((t) => t + 1); // add +1 second on correct
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      setShowPlusOne(false);
      setIsAnswering(false);
      nextQuestion();
    }, 800);
  };

  const handleWrongAnswer = () => {
    setFeedback("❌ Wrong!");
    setTimeout(() => {
      setIsAnswering(false);
      nextQuestion();
    }, 800);
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= shuffledQuestions.length) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    const nextQ = {
      ...shuffledQuestions[nextIndex],
      options: shuffleArray(shuffledQuestions[nextIndex].options),
    };
    setCurrentQuestion(nextQ);
    setCurrentIndex(nextIndex);
    setSelected(null);
    setFeedback("");
    // Time continues; no reset
  };

  const handleRestart = () => {
    const reshuffled = shuffleArray(dragQuestions[difficulty] || dragQuestions.Medium);
    setShuffledQuestions(reshuffled);
    setCurrentIndex(0);
    setCurrentQuestion({ ...reshuffled[0], options: shuffleArray(reshuffled[0].options) });
    setScore(0);
    setTime(20);
    setGameOver(false);
    setSelected(null);
    setIsPlaying(true);
    setSkipsLeft(3);
    setFeedback("");
    setIsAnswering(false);
  };

  const handleSkip = () => {
    if (skipsLeft > 0 && !gameOver && !isAnswering) {
      setSkipsLeft((s) => s - 1);
      setFeedback(" You skipped the question!");
      setIsAnswering(true);
      setTimeout(() => {
        setIsAnswering(false);
        nextQuestion();
      }, 800);
    }
  };

  const handleBackClick = () => setShowExitConfirm(true);
  const confirmExit = (confirm) => {
    setShowExitConfirm(false);
    if (confirm) navigate("/translate");
  };

  const timePercent = (time / 20) * 100;

  /* ---------------- RENDER ---------------- */
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

        {isPlaying && !gameOver && (
          <>
            <Question>{currentQuestion.question}</Question>

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
                  onDrop={handleDrop}
                  onDragOver={allowDrop}
                  style={{ height: dropHeight }}
                >
                  Drop Here
                </DropZone>
              </DropZoneColumn>
            </GamePanel>

            <ButtonRow>
              <CustomButton
                label={` Skip (${skipsLeft})`}
                onClick={handleSkip}
                width="180px"
                disabled={skipsLeft === 0 || isAnswering}
              />
            </ButtonRow>

            {feedback && <Feedback>{feedback}</Feedback>}
          </>
        )}

        <BackButton src={home} alt="Back" onClick={handleBackClick} />
      </GlassCard>

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
            <p>Game Mode: <strong>Drag & Drop</strong></p>
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
  position: absolute; left: 0; top: 0; width: 410px; height: auto; animation: ${slideFromLeft} 0.5s forwards;
`;
const RightImage = styled.img`
  position: absolute; right: 0; top: 0; width: 410px; height: auto; animation: ${slideFromRight} 0.5s forwards;
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
  color: #fff;
  ${({ $pulse }) => $pulse && css`animation: ${pulse} 1s infinite; color: #C2410C;`}
`;

const ScoreTimeBox = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
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
const Question = styled.h2`font-size:1.2rem; margin:14px 0 18px;`;

const GamePanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  gap: 40px;
`;

const ChoicesColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const DropZoneColumn = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Draggable = styled.div`
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1.6rem;
  cursor: grab;
  user-select: none;
  transition: all 0.25s ease-in-out;
  text-align: center;
  &:hover {
    transform: scale(1.1);
    background: #fff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
  }
`;

const DropZone = styled.div`
  width: 100%;
  max-width: 260px;
  height: auto;
  min-height: 240px;
  border: 3px dashed #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  padding: 20px;
`;

const ButtonRow = styled.div`display:flex; gap:12px; justify-content:center; margin-top:8px;`;
const ButtonWrapper = styled.div`margin-top:12px;`;
const Feedback = styled.p`margin-top:10px; font-size:1.15rem; font-weight:600;`;

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
