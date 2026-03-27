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
const Multiple = ({ difficulty = "Easy", startGame = false, gameMode = "Multiple Choice",onGameOver,  }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null); // Background music
  const clickRef = useRef(new Audio(stoneClick)); // Button click sound

  const [questions, setQuestions] = useState([]);
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
  const [shakeOption, setShakeOption] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const choiceLabels = ["A", "B", "C", "D"];
  const timePercent = (time / 20) * 100;

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
    setLoggedUser(user); // store user for later use
    console.log("Logged-in User ID:", user.id);
    console.log("Logged-in email:", user.email);
  } else {
    setLoggedUser(null);
    console.log("No user found in localStorage.");
  }
}, []);
  // ---------------- FETCH QUESTIONS ----------------
  useEffect(() => {
    fetch("http://localhost:8000/game/questions/baybayin")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((q) => q.difficulty === difficulty);
        const shuffled = shuffleArray(filtered);
        setQuestions(shuffled);
        setCurrentQuestion(shuffled[0]);
        setShuffledOptions(shuffleArray(shuffled[0].options));
        setSelected(null);
        setScore(0);
        setTime(20);
        setSkipsLeft(3);
        setGameOver(false);
        setShowPlusOne(false);
        setIsPlaying(startGame);
        setFeedback("");
      })
      .catch((err) => console.error(err));
  }, [difficulty, startGame]);

  useEffect(() => {
    if (currentQuestion) setShuffledOptions(shuffleArray(currentQuestion.options));
  }, [currentQuestion]);

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
    audio.loop = true; // Loop music
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
  const nextQuestion = () => {
    if (!questions.length) return;
    const nextQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion({ ...nextQ, options: shuffleArray(nextQ.options) });
    setSelected(null);
    setFeedback("");
  };

  useEffect(() => {
  if (gameOver && typeof onGameOver === "function") {
    onGameOver(score); // ✅ sends final score to Difficulty.js
  }
}, [gameOver, score, onGameOver]);
  

  const handleCheck = () => {
    playClickSound();
    if (!selected) return;
    if (selected === currentQuestion.answer) {
      setFeedback("✅ Correct!");
      setScore((s) => s + 1);
      setShowPlusOne(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTime((t) => Math.min(t + 1, 999));
      setTimeout(() => setShowPlusOne(false), 800);
      setTimeout(() => nextQuestion(), 1500);
    } else handleWrongAnswer();
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
    const reshuffled = shuffleArray(questions);
    setQuestions(reshuffled);
    setCurrentQuestion({ ...reshuffled[0], options: shuffleArray(reshuffled[0].options) });
    setShuffledOptions(shuffleArray(reshuffled[0].options));
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
    playClickSound();
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setFeedback(" You skipped the question!");
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
    if (confirm) navigate("/translate");
  };

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
                    onClick={() => {
                      setSelected(opt);
                      playClickSound();
                    }}
                    $selected={selected === opt}
                    $shake={shakeOption}
                  >
                    {opt}
                  </OptionButton>
                </OptionWrapper>
              ))}
            </Options>

            <ButtonRow>
              <CustomButton label="Check Answer" onClick={handleCheck} width="180px" />
              <CustomButton
                label={` Skip (${skipsLeft})`}
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

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Game Over!</h2>
            <p>Game Mode: <strong>{gameMode}</strong></p>
            <p>Difficulty: <strong>{difficulty}</strong></p>
            <p>Final Score: {score}</p>
            <ButtonWrapper>
              <CustomButton label=" Restart" onClick={handleRestart} width="160px" color="#ffb300" />
              <CustomButton 
          label="Exit" 
          onClick={() => navigate("/translate")} // change "/" to your home route
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
