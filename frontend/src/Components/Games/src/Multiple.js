import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import write1 from "../../../Assests/write1.png";
import write2 from "../../../Assests/write2.png";
import back from "../../../Assests/back.png";
import confetti from "canvas-confetti";
import bgMusicFile from "../../../Assests/Tap.mp3"; // Background music
import stoneClick from "../../../Assests/stone.mp3"; // Button click sound

/* ---------------- ANIMATIONS ---------------- */
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
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

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const flashRed = keyframes`
  0%, 100% { opacity: 0; }
  25%, 75% { opacity: 1; }
`;

const correctPop = keyframes`
  0% { opacity: 0; transform: scale(.6); }
  40% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.4); }
`;

const timerDanger = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const dotPulse = keyframes`
  0%,100% { opacity: .35; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.3); }
`;

const dotAnim = keyframes`
  0%,80%,100% { transform: scale(.6); opacity: .3; }
  40%          { transform: scale(1);  opacity: 1;  }
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
        return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy", color: "#22c55e" };
      case "medium":
        return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium", color: "#fbc417" };
      case "hard":
        return { timeLimit: 30, pointsPerCorrect: 2, label: "Hard", color: "#ef4444" };
      default:
        return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy", color: "#22c55e" };
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
  const [flash, setFlash] = useState(false);
  const [isCorrectAnim, setIsCorrectAnim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const feedbackTimeoutRef = useRef(null);

  const choiceLabels = ["A", "B", "C", "D"];
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - time / timeLimit);

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

  const setTransientFeedback = (message, duration = 1000) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    setFeedback(message);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback("");
      feedbackTimeoutRef.current = null;
    }, duration);
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

    setTotalAnswered((t) => t + 1);
    // FIXED: Check against the tracked correct answer index
    if (selectedIndex === correctAnswerIndex) {
      setTransientFeedback("✅ Correct!");
      setScore((s) => s + pointsPerCorrect);
      setStreak((s) => s + 1);
      setPointsGained(pointsPerCorrect);
      setShowPlusPoints(true);
      setIsCorrectAnim(true);
      setTimeout(() => setIsCorrectAnim(false), 800);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTime((t) => Math.min(t + 1, 999));
      setTimeout(() => setShowPlusPoints(false), 800);
      setTimeout(() => nextQuestion(), 1000);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setTransientFeedback("❌ Wrong!");
    setStreak(0);
    setFlash(true);
    setShakeOption(true);
    setTimeout(() => {
      setFlash(false);
      setShakeOption(false);
      nextQuestion();
    }, 1000);
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
    setStreak(0);
    setTotalAnswered(0);
  };

  const handleSkip = () => {
    playClickSound();
    if (skipsLeft > 0 && !gameOver) {
      setSkipsLeft((s) => s - 1);
      setTransientFeedback("⏭️ You skipped the question!");
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
    <>
    <PageRoot>
      <BgTexture />
      <BgGlow />
      {flash && <DamageOverlay />}
      {isCorrectAnim && <CorrectBurst />}

      {/* Background Music */}
      <audio ref={audioRef} src={bgMusicFile} />

      <LeftArt src={write1} />
      <RightArt src={write2} />

      <Header>
        <BackBtn onClick={handleBackClick} title="Exit">
          <BackBtnIcon src={back} />
        </BackBtn>

        <HeaderCenter>
          <ScoreRow>
            <StatPill>
              <StatIcon>✦</StatIcon>
              <StatBody>
                <StatLabel>Score</StatLabel>
                <StatVal $gold>{score}</StatVal>
              </StatBody>
            </StatPill>

            <TimerPill>
              <TimerSvg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="25" cy="25" r="22"
                  fill="none"
                  stroke={time <= 10 ? "#ff6b6b" : "#fbc417"}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                />
              </TimerSvg>
              <TimerText $danger={time <= 10}>{String(time).padStart(2, "0")}</TimerText>
            </TimerPill>

            <StatPill>
              <StatIcon>◈</StatIcon>
              <StatBody>
                <StatLabel>Difficulty</StatLabel>
                <StatVal>{config.label}</StatVal>
              </StatBody>
            </StatPill>
          </ScoreRow>
        </HeaderCenter>

        <div style={{ width: 195 }} />
      </Header>

      <GameBody>
        <PromptStrip>
          <PromptLabel>Select the correct Baybayin answer</PromptLabel>
        </PromptStrip>

        {isPlaying && !gameOver && currentQuestion && (
          <>
            <QuestionCard>
              <QuestionText>{currentQuestion.question}</QuestionText>
              {showPlusPoints && <PlusOne>+{pointsGained}</PlusOne>}
            </QuestionCard>

            <OptionsPanel>
              {shuffledOptions.map((opt, i) => (
                <OptionButton
                  key={i}
                  onClick={() => {
                    setSelectedIndex(i);
                    playClickSound();
                  }}
                  $selected={selectedIndex === i}
                  $shake={shakeOption && selectedIndex === i}
                >
                  <OptionLabel>{choiceLabels[i]}.</OptionLabel>
                  <OptionText>{opt}</OptionText>
                </OptionButton>
              ))}
            </OptionsPanel>

            <GameActions>
              <ActionBtn $variant="primary" onClick={handleCheck}>
                <BtnIcon>➤</BtnIcon> Check
              </ActionBtn>
              <ActionBtn $variant="ghost" onClick={handleSkip} disabled={skipsLeft === 0}>
                <BtnIcon>⏭</BtnIcon> Skip ({skipsLeft})
              </ActionBtn>
            </GameActions>

            {/* ── BOTTOM INFO STRIP ── */}
            <InfoStrip>
              <InfoBlock>
                <InfoBlockLabel>Streak</InfoBlockLabel>
                <StreakRow>
                  {[...Array(5)].map((_, i) => (
                    <StreakDot key={i} $active={i < streak} $current={i === streak - 1} />
                  ))}
                  {streak > 5 && <StreakExtra>+{streak - 5}</StreakExtra>}
                </StreakRow>
              </InfoBlock>

              <InfoDivider />

              <InfoBlock $right>
                <InfoBlockLabel>Progress</InfoBlockLabel>
                <ProgressRow>
                  <ProgressTrack>
                    <ProgressFill
                      style={{ width: `${Math.min((currentQuestionIndex / Math.max(questions.length, 1)) * 100, 100)}%` }}
                    />
                  </ProgressTrack>
                  <ProgressNum>{currentQuestionIndex}/{questions.length}</ProgressNum>
                </ProgressRow>
              </InfoBlock>
            </InfoStrip>

            {/* ── BOTTOM META ── */}
            <BottomMeta>
              <DiffBadge $color={config.color}>{config.label}</DiffBadge>
              <PointsNote>+{pointsPerCorrect} pts per correct · +1s time bonus</PointsNote>
              <SkipNote>{skipsLeft} skip{skipsLeft !== 1 ? "s" : ""} remaining</SkipNote>
            </BottomMeta>

            {feedback && <FeedbackTag>{feedback}</FeedbackTag>}
          </>
        )}
      </GameBody>

      </PageRoot>

      {/* Game Over Modal */}
      {gameOver && (
        <ModalOverlay>
          <GameOverModal>
            <ModalOrb>⏳</ModalOrb>
            <ModalTitle>Time's Up!</ModalTitle>
            <ModalStats>
              <ModalStat>
                <ModalStatLabel>Difficulty</ModalStatLabel>
                <ModalStatVal>{config.label}</ModalStatVal>
              </ModalStat>
              <ModalDivider />
              <ModalStat>
                <ModalStatLabel>Final Score</ModalStatLabel>
                <ModalStatVal $gold>{score}</ModalStatVal>
              </ModalStat>
            </ModalStats>
            <ModalActions>
              <ModalBtn $variant="amber" onClick={handleRestart}>↺ Restart</ModalBtn>
              <ModalBtn $variant="red" onClick={() => navigate("/HomeGame")}>✕ Exit</ModalBtn>
            </ModalActions>
          </GameOverModal>
        </ModalOverlay>
      )}

      {showExitConfirm && (
        <ModalOverlay>
          <ExitModal>
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit Multiple Mode?</ModalTitle>
            <ModalSubtext>Your progress will not be saved.</ModalSubtext>
            <ModalActions>
              <ModalBtn $variant="red" onClick={() => confirmExit(true)}>Yes, Exit</ModalBtn>
              <ModalBtn $variant="green" onClick={() => confirmExit(false)}>Keep Playing</ModalBtn>
            </ModalActions>
          </ExitModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default Multiple;

/* ---------------- STYLES ---------------- */
const PageRoot = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background: #6b1f00;
  overflow: hidden;
  font-family: 'Georgia', serif;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BgTexture = styled.div`
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 60px,
      rgba(0,0,0,0.04) 60px,
      rgba(0,0,0,0.04) 61px
    );
  pointer-events: none;
  z-index: 0;
`;

const BgGlow = styled.div`
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 80vw;
  max-width: 700px;
  max-height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,196,23,0.10) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
`;

const DamageOverlay = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 9000;
  background: rgba(220,38,38,.38);
  animation: ${flashRed} .55s ease forwards;
`;

const CorrectBurst = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 9000;
  background: rgba(251,196,23,.18);
  animation: ${correctPop} .8s ease forwards;
`;

const Header = styled.header`
  position: relative; z-index: 100;
  width: 100%; padding: 12px 16px 8px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; flex-shrink: 0;
`;

const BackBtn = styled.button`
  background: none; border: none; padding: 0; cursor: pointer;
  flex-shrink: 0; transition: transform .2s;
  &:hover { transform: scale(.9); }
`;

const BackBtnIcon = styled.img`width: 205px; display: block; margin-top: -30px;`;
const HeaderCenter = styled.div`flex: 1; display: flex; justify-content: center;`;
const ScoreRow = styled.div`display: flex; align-items: center; gap: 10px;`;

const StatPill = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 5px 12px 5px 10px; border-radius: 12px;
  background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(8px);
`;
const StatIcon = styled.span`font-size: 13px; opacity: .55; color: #fbc417;`;
const StatBody = styled.div``;
const StatLabel = styled.div`font-family: sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: rgba(255,242,210,.55);`;
const StatVal = styled.div`font-family: 'Georgia', serif; font-size: 15px; font-weight: 900; line-height: 1.1; color: ${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};`;

const TimerPill = styled.div`position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;`;
const TimerSvg = styled.svg`position: absolute; inset: 0; width: 100%; height: 100%;`;
const TimerText = styled.div`
  font-family: 'Georgia', serif; font-size: 16px; font-weight: 900;
  position: relative; z-index: 1;
  color: ${({ $danger }) => $danger ? "#ff6b6b" : "#fff"};
  ${({ $danger }) => $danger && css`animation: ${timerDanger} .7s ease-in-out infinite;`}
`;

const LeftArt = styled.img`position:absolute;top:0;left:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightArt = styled.img`position:absolute;top:0;right:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;

const GameBody = styled.main`
  position: relative; z-index: 10;
  flex: 1; width: 100%;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 0 16px 16px;
  overflow-y: auto;
`;

const PromptStrip = styled.div`
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 0 0;
  animation: ${floatUp} .4s ease;
`;
const PromptLabel = styled.div`
  font-family: sans-serif; font-size: 15px; font-weight: 700;
  letter-spacing: 1.4px; text-transform: uppercase;
  color: rgba(255,248,231,.6);
`;

const QuestionCard = styled.div`
  position: relative;
  width: min(560px, 92vw);
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(251,196,23,.24);
  box-shadow: inset 0 1px 0 rgba(255,220,150,.1);
`;

const QuestionText = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  color: #fff4df;
`;

const PlusOne = styled.div`
  position: absolute;
  right: 16px;
  top: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #86efac;
  animation: ${flashUp} .8s forwards;
`;

const OptionsPanel = styled.div`
  display: grid;
  gap: 10px;
  width: min(560px, 92vw);
  padding: 14px;
  background: rgba(0,0,0,.22);
  border: 1px solid rgba(251,196,23,.15);
  border-radius: 18px;
  backdrop-filter: blur(8px);
`;

const OptionButton = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 34px 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid ${({ $selected }) => $selected ? "rgba(251,196,23,.55)" : "rgba(251,196,23,.2)"};
  background: ${({ $selected }) => $selected ? "rgba(251,196,23,.2)" : "rgba(255,255,255,.9)"};
  color: ${({ $selected }) => $selected ? "#fff7e7" : "#3d1a06"};
  cursor: pointer;
  transition: transform .15s, box-shadow .15s, background .15s;
  ${({ $shake }) => $shake && css`animation: ${shake} .4s;`}
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
`;

const OptionLabel = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
`;

const OptionText = styled.span`
  text-align: left;
  font-size: 1rem;
  font-weight: 700;
`;

const GameActions = styled.div`
  display: flex; gap: 10px;
  width: min(560px, 92vw); justify-content: center;
`;

const ActionBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 12px 16px; border-radius: 12px;
  font-family: 'Georgia', serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: transform .15s, filter .15s, box-shadow .15s;
  flex: 1;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  pointer-events: ${({ disabled }) => disabled ? "none" : "auto"};
  ${({ $variant }) => {
    if ($variant === "primary") return css`
      background: linear-gradient(135deg, #fbc417 0%, #f59e0b 100%);
      border: none; color: #3d2401;
      box-shadow: 0 4px 14px rgba(251,196,23,.35), inset 0 1px 0 rgba(255,255,255,.25);
      flex: 2;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(251,196,23,.45); }
      &:active { transform: translateY(1px); }
    `;
    return css`
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(251,196,23,.3);
      color: #fff7e7;
      &:hover { background: rgba(255,255,255,.1); transform: translateY(-1px); }
      &:active { transform: translateY(1px); }
    `;
  }}
`;

const BtnIcon = styled.span`font-size: 13px; opacity: .9;`;

const FeedbackTag = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #fff4df;
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
`;

const GameOverModal = styled.div`
  background: linear-gradient(160deg, #2c1204 0%, #1a0b02 100%);
  border: 1px solid rgba(251,196,23,.3);
  border-radius: 24px; padding: 36px 32px 28px;
  width: 100%; max-width: 380px; text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,220,120,.12);
`;

const ExitModal = styled(GameOverModal)``;
const ModalOrb = styled.div`font-size: 40px; margin-bottom: 8px; filter: drop-shadow(0 4px 8px rgba(0,0,0,.4));`;
const ModalTitle = styled.h2`font-family:'Georgia',serif;font-size:1.5rem;font-weight:900;margin:0 0 20px;color:#fde68a;letter-spacing:.3px;`;
const ModalSubtext = styled.p`font-family:sans-serif;font-size:13px;color:rgba(255,255,255,.5);margin:-12px 0 20px;`;
const ModalStats = styled.div`
  display:flex;justify-content:center;align-items:center;gap:20px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  border-radius:14px;padding:16px 24px;margin-bottom:24px;
`;
const ModalStat = styled.div`display:flex;flex-direction:column;gap:4px;align-items:center;`;
const ModalStatLabel = styled.div`font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.5);`;
const ModalStatVal = styled.div`font-family:'Georgia',serif;font-size:22px;font-weight:900;color:${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};`;
const ModalDivider = styled.div`width:1px;height:40px;background:rgba(255,255,255,.1);`;
const ModalActions = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const ModalBtn = styled.button`
  flex:1;min-width:120px;padding:11px 18px;border-radius:12px;
  font-family:'Georgia',serif;font-size:14px;font-weight:700;
  cursor:pointer;transition:transform .15s,filter .15s;border:none;
  &:hover { transform:translateY(-2px);filter:brightness(1.08); }
  &:active { transform:translateY(1px); }
  ${({ $variant }) => {
    if ($variant === "amber") return css`background:linear-gradient(135deg,#f59e0b,#d97706);color:#3d2401;`;
    if ($variant === "green") return css`background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;`;
    if ($variant === "red") return css`background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;`;
    return css`background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;`;
  }}
`;

/* ── BOTTOM INFO STRIP ── */
const InfoStrip = styled.div`
  width: min(560px, 92vw);
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-radius: 14px;
  background: rgba(0,0,0,.22); border: 1px solid rgba(251,196,23,.12);
  backdrop-filter: blur(8px);
  animation: ${floatUp} .5s .1s ease both;
`;
const InfoBlock      = styled.div`display:flex;flex-direction:column;gap:5px;align-items:${({ $right }) => $right ? "flex-end" : "flex-start"};flex:1;`;
const InfoBlockLabel = styled.div`font-family:sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,242,210,.4);`;
const InfoDivider    = styled.div`width:1px;height:36px;background:rgba(255,255,255,.1);flex-shrink:0;`;

/* Streak */
const StreakRow   = styled.div`display:flex;align-items:center;gap:5px;`;
const StreakDot   = styled.span`
  width:${({ $current }) => $current ? "18px" : "10px"};height:10px;border-radius:999px;
  background:${({ $active }) => $active ? "#fbc417" : "rgba(255,255,255,.18)"};
  box-shadow:${({ $active }) => $active ? "0 0 6px rgba(251,196,23,.7)" : "none"};
  transition:all .3s ease;
  ${({ $current, $active }) => $current && $active && css`animation:${dotPulse} 1.4s ease-in-out infinite;`}
`;
const StreakExtra = styled.span`font-family:sans-serif;font-size:10px;font-weight:700;color:#fbc417;`;

/* Progress */
const ProgressRow   = styled.div`display:flex;align-items:center;gap:6px;`;
const ProgressTrack = styled.div`width:80px;height:6px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden;`;
const ProgressFill  = styled.div`height:100%;border-radius:3px;background:linear-gradient(90deg,#fbc417,#f59e0b);transition:width .4s ease;`;
const ProgressNum   = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.55);font-weight:600;`;

/* ── BOTTOM META ── */
const BottomMeta  = styled.div`display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;animation:${floatUp} .5s .2s ease both;`;
const DiffBadge   = styled.div`padding:3px 12px;border-radius:20px;font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:${({ $color }) => `${$color}22`};border:1px solid ${({ $color }) => `${$color}55`};color:${({ $color }) => $color};`;
const PointsNote  = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.4);`;
const SkipNote    = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.4);`;