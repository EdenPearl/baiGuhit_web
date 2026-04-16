import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import write1 from '../../../Assests/write1.png';
import write2 from '../../../Assests/write2.png';
import back from '../../../Assests/back.png';
import confetti from "canvas-confetti";
import bgMusicFile from "../../../Assests/Tap.mp3";
import stoneClick from "../../../Assests/stone.mp3";

/* ---------------- ANIMATIONS ---------------- */
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

/* ---------------- MAIN COMPONENT ---------------- */
const Typing = ({ difficulty = "Medium", startGame = false, onGameOver }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const clickRef = useRef(new Audio(stoneClick));
  const hasSentScore = useRef(false);
  const feedbackTimeoutRef = useRef(null);

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
  const [flash, setFlash] = useState(false);
  const [isCorrectAnim, setIsCorrectAnim] = useState(false);

  useEffect(() => {
    setTime(timeLimit);
  }, [difficulty, timeLimit]);

  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - time / timeLimit);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/game/questions/typing");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      const filtered = data[difficulty] || [];
      setShuffledQuestions(shuffleArray(filtered));
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setFeedback("Error loading questions.");
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  const currentQuestion = shuffledQuestions[currentIndex] || null;

  useEffect(() => {
    const audio = new Audio(bgMusicFile);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    hasSentScore.current = false;
  }, [startGame]);

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
      setShowPlusPoints(false);
    }
    fetchQuestions();
  }, [difficulty, startGame, timeLimit, fetchQuestions]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.loop = true;
    if (isPlaying && !gameOver) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, gameOver]);

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

  useEffect(() => {
    if (gameOver && onGameOver && !scoreSubmitted) {
      onGameOver(score);
      setScoreSubmitted(true);
    }
  }, [gameOver, score, onGameOver, scoreSubmitted]);

  const playClickSound = () => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(() => {});
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

  const handleCorrectAnimation = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < shuffledQuestions.length) setCurrentIndex(nextIndex);
    else setCurrentIndex(0);
    setInput("");
    setFeedback("");
  };

  const handleCheck = () => {
    playClickSound();
    if (!currentQuestion || !isPlaying) return;
    const userAnswer = input.trim();
    if (userAnswer.toUpperCase() === currentQuestion.answer.toUpperCase()) {
      setTransientFeedback("✅ Correct!");
      setScore((s) => s + pointsPerCorrect);
      setPointsGained(pointsPerCorrect);
      setShowPlusPoints(true);
      setIsCorrectAnim(true);
      setTimeout(() => setIsCorrectAnim(false), 800);
      setTimeout(() => setShowPlusPoints(false), 800);
      handleCorrectAnimation();
      setTime((t) => Math.min(t + 1, 999));
      setTimeout(() => nextQuestion(), 800);
    } else {
      setTransientFeedback("❌ Wrong!");
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        nextQuestion();
      }, 1000);
    }
  };

  const handleSkip = () => {
    playClickSound();
    if (skipsLeft > 0) {
      setSkipsLeft((s) => s - 1);
      setTransientFeedback("⏭️ You skipped the question!");
      setTimeout(() => nextQuestion(), 800);
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

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") handleCheck();
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <PageRoot>
        <BgTexture />
        <BgGlow />
        <LeftArt src={write1} alt="Write left art" />
        <RightArt src={write2} alt="Write right art" />
        {flash && <DamageOverlay />}
        {isCorrectAnim && <CorrectBurst />}

        <audio ref={audioRef} src={bgMusicFile} />

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

          {loading ? (
            <QuestionCard>
              <QuestionText>Loading questions...</QuestionText>
            </QuestionCard>
          ) : (
            isPlaying && !gameOver && currentQuestion && (
              <CardStack>
                <QuestionCard $shake={flash}>
                  <QuestionText>What is the LATIN equivalent of:</QuestionText>
                  <CharacterBox>{currentQuestion.question}</CharacterBox>
                  {showPlusPoints && <PlusOne>+{pointsGained}</PlusOne>}
                </QuestionCard>

                <InputCard $shake={flash}>
                  <InputField
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type your answer here..."
                  />
                </InputCard>

                <GameActions>
                  <ActionBtn $variant="primary" onClick={handleCheck}>
                    <BtnIcon>➤</BtnIcon> Check
                  </ActionBtn>
                  <ActionBtn $variant="ghost" onClick={handleSkip} disabled={skipsLeft === 0}>
                    <BtnIcon>⏭</BtnIcon> Skip ({skipsLeft})
                  </ActionBtn>
                </GameActions>

                {feedback && <FeedbackTag>{feedback}</FeedbackTag>}
              </CardStack>
            )
          )}
        </GameBody>
      </PageRoot>

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
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit Typing Mode?</ModalTitle>
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

export default Typing;

/* ---------------- STYLES ---------------- */
const PageRoot = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(160deg, #7a2100 0%, #9a3000 30%, #c24010 65%, #a83008 100%);
  overflow: hidden;
  font-family: 'Georgia', serif;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BgTexture = styled.div`
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(0,0,0,.04) 60px, rgba(0,0,0,.04) 61px);
`;

const BgGlow = styled.div`
  position: absolute; top: -30%; left: 50%; transform: translateX(-50%);
  width: 80vw; height: 80vw; max-width: 700px; max-height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,196,23,.10) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
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

const LeftArt = styled.img`
  position: absolute;
  top: 0;
  left: -40px;
  width: 290px;
  opacity: .85;
  pointer-events: none;
  z-index: 1;
`;

const RightArt = styled.img`
  position: absolute;
  top: 0;
  right: -40px;
  width: 290px;
  opacity: .85;
  pointer-events: none;
  z-index: 1;
`;

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

const CardStack = styled.div`
  width: min(560px, 92vw);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
`;

const QuestionCard = styled.div`
  position: relative;
  width: 100%;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(251,196,23,.24);
  box-shadow: inset 0 1px 0 rgba(255,220,150,.1);
  text-align: center;
  box-sizing: border-box;
  ${({ $shake }) => $shake && css`animation: ${shake} .35s ease;`}
`;

const QuestionText = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  color: #fff4df;
`;

const CharacterBox = styled.div`
  display: inline-block;
  min-width: 100px;
  margin-top: 14px;
  padding: 18px 28px;
  border-radius: 14px;
  background: rgba(255,255,255,.94);
  color: #3d1a06;
  font-size: 2.4rem;
  font-weight: 900;
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

const InputCard = styled.div`
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,.92);
  border: 1.5px solid rgba(251,196,23,.35);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  box-sizing: border-box;
  ${({ $shake }) => $shake && css`animation: ${shake} .35s ease;`}
`;

const InputField = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(251,196,23,.25);
  background: rgba(255,255,255,.94);
  color: #3d1a06;
  font-family: 'Georgia', serif;
  font-size: 1.05rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  &:focus { border-color: rgba(251,196,23,.55); box-shadow: 0 0 0 3px rgba(251,196,23,.12); }
`;

const GameActions = styled.div`
  display: flex; gap: 10px;
  width: 100%; justify-content: center;
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
  width: 100%;
  text-align: center;
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
