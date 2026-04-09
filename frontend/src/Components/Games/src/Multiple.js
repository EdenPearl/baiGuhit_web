import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import green1 from "../../../Assests/green1.png";
import green4 from "../../../Assests/green4.png";
import home from "../../../Assests/backB.png";
import confetti from "canvas-confetti";
import bgMusicFile from "../../../Assests/Tap.mp3"; // Background music
import stoneClick from "../../../Assests/stone.mp3"; // Button click sound

/* ---------------- ANIMATIONS ---------------- */
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
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

/* ---------------- MAIN COMPONENT ---------------- */
const Multiple = ({ difficulty = "Easy", startGame = false, gameMode = "Multiple Choice", onGameOver }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null); // Background music
  const clickRef = useRef(new Audio(stoneClick)); // Button click sound

  // ✅ Configuration based on difficulty
  const getDifficultyConfig = (diff) => {
    const normalizedDiff = diff?.toLowerCase() || "easy";
    switch (normalizedDiff) {
      case "easy":
        return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy" };
      case "medium":
        return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium" };
      case "hard":
        return { timeLimit: 30, pointsPerCorrect: 2, label: "Hard" };
      default:
        return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy" };
    }
  };

  const config = getDifficultyConfig(difficulty);
  const timeLimit = config.timeLimit;
  const pointsPerCorrect = config.pointsPerCorrect;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // FIXED: Track question index
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // FIXED: Track where answer is
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showPlusPoints, setShowPlusPoints] = useState(false);
  const [time, setTime] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(startGame);
  const [gameOver, setGameOver] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [shakeOption, setShakeOption] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState([]); // FIXED: Track used questions

  const choiceLabels = ["A", "B", "C", "D"];
  const timePercent = (time / timeLimit) * 100;

  // Ref to prevent multiple score submissions
  const hasSentScore = useRef(false);

  // ---------------- SHUFFLE ----------------
  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loginData");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedUser(user);
      console.log("Logged-in User ID:", user.id);
      console.log("Logged-in email:", user.email);
    } else {
      setLoggedUser(null);
      console.log("No user found in localStorage.");
    }
  }, []);

  // Reset hasSentScore when game starts/restarts
  useEffect(() => {
    hasSentScore.current = false;
  }, [startGame]);

  // ---------------- FETCH QUESTIONS ----------------
  useEffect(() => {
    fetch("http://localhost:8000/game/questions/baybayin")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((q) => q.difficulty === difficulty);
        // FIXED: Shuffle questions so they come in random order
        const shuffledQuestions = shuffleArray(filtered);
        setQuestions(shuffledQuestions);
        
        if (shuffledQuestions.length > 0) {
          // Start with first question (already random due to shuffle)
          loadQuestion(shuffledQuestions[0]);
          setCurrentQuestionIndex(0);
          setUsedQuestionIndices([0]);
        }
        
        resetGameState();
      })
      .catch((err) => console.error(err));
  }, [difficulty, startGame, timeLimit]);

  // FIXED: Helper to load a question with properly shuffled options
  const loadQuestion = (question) => {
    // Create options array with answer and wrong answers
    const options = [...question.options];
    
    // Shuffle the options completely randomly
    const shuffled = shuffleArray(options);
    
    // Find where the correct answer ended up after shuffling
    const correctIdx = shuffled.indexOf(question.answer);
    
    setShuffledOptions(shuffled);
    setCorrectAnswerIndex(correctIdx);
    setSelectedIndex(null);
  };

  const resetGameState = () => {
    setSelectedIndex(null);
    setScore(0);
    setTime(timeLimit);
    setSkipsLeft(3);
    setGameOver(false);
    setShowPlusPoints(false);
    setIsPlaying(startGame);
    setFeedback("");
    hasSentScore.current = false;
  };

  // ---------------- TIMER ----------------
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

  // ---------------- BACKGROUND MUSIC ----------------
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.loop = true;
    if (isPlaying && !gameOver) {
      audio.play().catch((err) => console.log("Audio play error:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying, gameOver]);

  // ---------------- PLAY BUTTON SOUND ----------------
  const playClickSound = () => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch((err) => console.log("Click audio error:", err));
    }
  };

  // ---------------- CONFETTI ----------------
  const miniShards = () => {
    confetti({
      particleCount: 25,
      startVelocity: 30,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#FF0000", "#FF4C4C", "#FF8080"],
      shapes: ["triangle"],
      gravity: 0.5,
      scalar: 0.7,
    });
  };

  // ---------------- QUESTION HANDLERS ----------------
  // FIXED: Get next random question that hasn't been used recently
  const nextQuestion = () => {
    if (questions.length === 0) return;

    // Get available indices (questions not recently used)
    const availableIndices = questions.map((_, idx) => idx).filter(
      idx => !usedQuestionIndices.includes(idx)
    );

    let nextIndex;
    
    if (availableIndices.length === 0) {
      // All questions used, reset and pick random
      const randomIdx = Math.floor(Math.random() * questions.length);
      nextIndex = randomIdx;
      setUsedQuestionIndices([randomIdx]);
    } else {
      // Pick random from available
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setUsedQuestionIndices(prev => [...prev, nextIndex]);
    }

    setCurrentQuestionIndex(nextIndex);
    loadQuestion(questions[nextIndex]);
  };

  // FIXED: Added proper dependencies and logging
  useEffect(() => {
    if (gameOver && !hasSentScore.current) {
      hasSentScore.current = true;
      console.log("Game Over! Final score to save:", score);
      
      if (typeof onGameOver === "function") {
        console.log("Calling onGameOver callback with score:", score);
        onGameOver(score);
      } else {
        console.error("onGameOver is not a function:", onGameOver);
      }
    }
  }, [gameOver, score, onGameOver]);

  const handleCheck = () => {
    playClickSound();
    if (selectedIndex === null) return;

    // FIXED: Check against the tracked correct answer index
    if (selectedIndex === correctAnswerIndex) {
      setFeedback("✅ Correct!");
      setScore((s) => s + pointsPerCorrect);
      setPointsGained(pointsPerCorrect);
      setShowPlusPoints(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTime((t) => Math.min(t + 1, 999));
      setTimeout(() => setShowPlusPoints(false), 800);
      setTimeout(() => nextQuestion(), 1500);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setFeedback("❌ Wrong!");
    setShakeOption(true);
    miniShards();
    setTimeout(() => {
      setShakeOption(false);
      nextQuestion();
    }, 1500);
  };

  const handleRestart = () => {
    playClickSound();
    hasSentScore.current = false;
    
    // Reshuffle questions for new game
    const reshuffled = shuffleArray([...questions]);
    setQuestions(reshuffled);
    
    // Pick random starting question
    const startIdx = Math.floor(Math.random() * reshuffled.length);
    setCurrentQuestionIndex(startIdx);
    setUsedQuestionIndices([startIdx]);
    
    if (reshuffled.length > 0) {
      loadQuestion(reshuffled[startIdx]);
    }
    
    setScore(0);
    setTime(timeLimit);
    setGameOver(false);
    setIsPlaying(true);
    setFeedback("");
    setSkipsLeft(3);
    setShowPlusPoints(false);
  };

  const handleSkip = () => {
    playClickSound();
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setFeedback("⏭️ You skipped the question!");
      setTimeout(() => nextQuestion(), 800);
    }
  };

  const handleBackClick = () => {
    playClickSound();
    setShowExitConfirm(true);
  };

  const confirmExit = (confirm) => {
    playClickSound();
    setShowExitConfirm(false);
    if (confirm) navigate("/HomeGame");
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container>
      {/* Background Music */}
      <audio ref={audioRef} src={bgMusicFile} />

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
            <Question>{currentQuestion.question}</Question>

            <Options>
              {shuffledOptions.map((opt, i) => (
                <OptionWrapper key={i}>
                  <OptionLabel>{choiceLabels[i]}.</OptionLabel>
                  <OptionButton
                    onClick={() => {
                      setSelectedIndex(i);
                      playClickSound();
                    }}
                    $selected={selectedIndex === i}
                    $shake={shakeOption && selectedIndex === i}
                  >
                    {opt}
                  </OptionButton>
                </OptionWrapper>
              ))}
            </Options>

            <ButtonRow>
              <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
              <CustomButton
                label={`⏭️ Skip (${skipsLeft})`}
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

      {/* Game Over Modal */}
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

  ${({ $shake }) =>
    $shake &&
    css`
      animation: ${shake} 0.4s;
    `}

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