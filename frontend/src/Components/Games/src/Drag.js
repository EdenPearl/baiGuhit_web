import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import write1 from '../../../Assests/write1.png';
import write2 from '../../../Assests/write2.png';
import back from '../../../Assests/back.png';
import soundIcon from '../../../Assests/sound.png';
import muteIcon from '../../../Assests/mute.png';
import confetti from "canvas-confetti";
import dragMusic from '../../../Assests/Tap.mp3';
import stoneClick from '../../../Assests/stone.mp3';

/* ═══════════════════════════════════
   ANIMATIONS
═══════════════════════════════════ */
const flashUp = keyframes`
  0%   { opacity: 1; transform: translateY(0) translateX(-50%); }
  100% { opacity: 0; transform: translateY(-48px) translateX(-50%); }
`;
const shake = keyframes`
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
`;
const floatUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const flashRed = keyframes`
  0%,100% { opacity: 0; }
  25%,75%  { opacity: 1; }
`;
const correctPop = keyframes`
  0%   { opacity: 0; transform: scale(.6); }
  40%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.4); }
`;
const timerDanger = keyframes`
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.2); }
`;
const dotPulse = keyframes`
  0%,100% { opacity: .35; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.3); }
`;
const dotAnim = keyframes`
  0%,80%,100% { transform: scale(.6); opacity: .3; }
  40%          { transform: scale(1);  opacity: 1;  }
`;
const dropGlow = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(251,196,23,0); }
  50%      { box-shadow: 0 0 0 8px rgba(251,196,23,.18); }
`;
const dragPop = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(.95); }
  to   { opacity: 1; transform: none; }
`;
const correctFeedback = keyframes`
  0%   { opacity: 0; transform: translateY(6px) scale(.9); }
  20%  { opacity: 1; transform: translateY(0) scale(1); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-6px); }
`;

/* ═══════════════════════════════════
   COMPONENT
═══════════════════════════════════ */
const Drag = ({ difficulty = "Medium", startGame = false, onGameOver }) => {
  const navigate  = useNavigate();
  const audioRef  = useRef(new Audio(dragMusic));
  const clickRef  = useRef(new Audio(stoneClick));
  const scoreSaved = useRef(false);
  const timerRef   = useRef(null);

  const getDifficultyConfig = (diff) => {
    switch ((diff || "medium").toLowerCase()) {
      case "easy": return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy",   color: "#22c55e" };
      case "hard": return { timeLimit: 30, pointsPerCorrect: 2, label: "Hard",   color: "#ef4444" };
      default:     return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium", color: "#fbc417" };
    }
  };

  const config           = getDifficultyConfig(difficulty);
  const timeLimit        = config.timeLimit;
  const pointsPerCorrect = config.pointsPerCorrect;

  const playClick = () => {
    if (!soundEnabled || !clickRef.current) return;
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

  const [questions,         setQuestions]         = useState([]);
  const [shuffledQuestions, setShuffledQuestions]  = useState([]);
  const [currentIndex,      setCurrentIndex]       = useState(0);
  const [currentQuestion,   setCurrentQuestion]    = useState(null);
  const [score,             setScore]              = useState(0);
  const [showPlusPoints,    setShowPlusPoints]     = useState(false);
  const [pointsGained,      setPointsGained]       = useState(0);
  const [time,              setTime]               = useState(timeLimit);
  const [feedback,          setFeedback]           = useState(null); // { msg, ok }
  const [isPlaying,         setIsPlaying]          = useState(false);
  const [gameOver,          setGameOver]           = useState(false);
  const [skipsLeft,         setSkipsLeft]          = useState(3);
  const [showExitConfirm,   setShowExitConfirm]    = useState(false);
  const [isAnswering,       setIsAnswering]        = useState(false);
  const [shakeDrop,         setShakeDrop]          = useState(false);
  const [flash,             setFlash]              = useState(false);
  const [isCorrectAnim,     setIsCorrectAnim]      = useState(false);
  const [streak,            setStreak]             = useState(0);
  const [totalAnswered,     setTotalAnswered]      = useState(0);
  const [dragOver,          setDragOver]           = useState(false);
  const [loading,           setLoading]            = useState(true);
  const [soundEnabled,      setSoundEnabled]       = useState(true);

  const circumference    = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - time / timeLimit);

  /* ── Score callback ── */
  useEffect(() => {
    if (gameOver && onGameOver && !scoreSaved.current) {
      scoreSaved.current = true;
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  /* ── Music ── */
  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true; audio.volume = 0.4;
    if (soundEnabled && isPlaying && !gameOver) audio.play().catch(() => {});
    else audio.pause();
    return () => audio.pause();
  }, [isPlaying, gameOver, soundEnabled]);

  /* ── Fetch ── */
  useEffect(() => {
    scoreSaved.current = false;
    setLoading(true);
    fetch("http://localhost:8000/game/questions/drag")
      .then((r) => r.json())
      .then((data) => {
        const filtered = data.filter((q) => q.difficulty === difficulty);
        setQuestions(filtered);
        const shuffled = shuffleArray(filtered);
        setShuffledQuestions(shuffled);
        setCurrentIndex(0);
        setCurrentQuestion({ ...shuffled[0], options: shuffleArray(shuffled[0].options) });
        setScore(0); setTime(timeLimit); setSkipsLeft(3);
        setFeedback(null); setGameOver(false);
        setIsPlaying(startGame); setIsAnswering(false);
        setStreak(0); setTotalAnswered(0);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [difficulty, startGame, timeLimit]);

  /* ── Timer ── */
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current); timerRef.current = null;
          setGameOver(true); setIsPlaying(false); return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, gameOver]);

  /* ── Drag & Drop ── */
  const handleDragStart = (e, val) => e.dataTransfer.setData("text", val);
  const allowDrop       = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = ()  => setDragOver(false);

  const miniShards = () => confetti({
    particleCount: 25, startVelocity: 30, spread: 100,
    origin: { y: 0.6 }, colors: ["#FF0000","#FF4C4C","#FF8080"],
    shapes: ["triangle"], gravity: 0.5, scalar: 0.7,
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!isPlaying || gameOver || isAnswering) return;
    const data = e.dataTransfer.getData("text");
    setIsAnswering(true);
    setTotalAnswered((t) => t + 1);
    if (data === currentQuestion.answer) handleCorrect();
    else handleWrong();
  };

  /* ── Game logic ── */
  const handleCorrect = () => {
    setScore((s) => s + pointsPerCorrect);
    setStreak((s) => s + 1);
    setPointsGained(pointsPerCorrect);
    setShowPlusPoints(true);
    setIsCorrectAnim(true);
    setFeedback({ msg: "✓ Correct!", ok: true });
    setTime((t) => t + 1);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setShowPlusPoints(false); setIsCorrectAnim(false);
      setFeedback(null); setIsAnswering(false);
      nextQuestion();
    }, 1200);
  };

  const handleWrong = () => {
    setStreak(0);
    setFlash(true);
    setShakeDrop(true);
    setFeedback({ msg: "✗ Wrong!", ok: false });
    miniShards();
    setTimeout(() => {
      setFlash(false); setShakeDrop(false);
      setFeedback(null); setIsAnswering(false);
      nextQuestion();
    }, 1200);
  };

  const nextQuestion = () => {
    let nextIdx = currentIndex + 1;
    let pool = shuffledQuestions;
    if (nextIdx >= shuffledQuestions.length) {
      pool = shuffleArray(questions);
      setShuffledQuestions(pool);
      nextIdx = 0;
    }
    setCurrentQuestion({ ...pool[nextIdx], options: shuffleArray(pool[nextIdx].options) });
    setCurrentIndex(nextIdx);
  };

  const handleSkip = () => {
    playClick();
    if (skipsLeft <= 0 || gameOver || isAnswering) return;
    setSkipsLeft((s) => s - 1);
    setStreak(0);
    setFeedback({ msg: "⏭ Skipped", ok: false });
    setIsAnswering(true);
    setTimeout(() => { setFeedback(null); setIsAnswering(false); nextQuestion(); }, 700);
  };

  const handleRestart = () => {
    playClick();
    scoreSaved.current = false;
    const reshuffled = shuffleArray(questions);
    setShuffledQuestions(reshuffled);
    setCurrentIndex(0);
    setCurrentQuestion({ ...reshuffled[0], options: shuffleArray(reshuffled[0].options) });
    setScore(0); setTime(timeLimit); setGameOver(false);
    setIsPlaying(true); setSkipsLeft(3);
    setFeedback(null); setIsAnswering(false);
    setStreak(0); setTotalAnswered(0);
  };

  const handleBackClick = () => { playClick(); setShowExitConfirm(true); };
  const confirmExit = (yes) => { playClick(); setShowExitConfirm(false); if (yes) navigate("/HomeGame"); };

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <PageRoot>
        <BgTexture /><BgGlow />
        <LeftArt src={write1} /><RightArt src={write2} />
        {flash && <DamageOverlay />}
        {isCorrectAnim && <CorrectBurst />}

        {/* ── HEADER ── */}
        <Header>
          <BackBtn onClick={handleBackClick}><BackBtnIcon src={back} /></BackBtn>
          <HeaderCenter>
            <ScoreRow>
              <StatPill>
                <StatIcon>✦</StatIcon>
                <StatBody><StatLabel>Score</StatLabel><StatVal $gold>{score}</StatVal></StatBody>
              </StatPill>
              <TimerPill>
                <TimerSvg viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                  <circle cx="25" cy="25" r="22" fill="none"
                    stroke={time <= 10 ? "#ff6b6b" : "#fbc417"} strokeWidth="3"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" transform="rotate(-90 25 25)"
                  />
                </TimerSvg>
                <TimerText $danger={time <= 10}>{String(time).padStart(2, "0")}</TimerText>
              </TimerPill>
              <StatPill>
                <StatIcon>◈</StatIcon>
                <StatBody><StatLabel>Difficulty</StatLabel><StatVal>{config.label}</StatVal></StatBody>
              </StatPill>
            </ScoreRow>
          </HeaderCenter>
          <RightControlSlot>
            <SoundBtn onClick={() => { playClick(); setSoundEnabled(p => !p); }}>
              <SoundBtnImg src={soundEnabled ? soundIcon : muteIcon} alt="sound" />
            </SoundBtn>
          </RightControlSlot>
        </Header>

        {/* ── GAME BODY ── */}
        <GameBody>
          <PromptLabel>Drag the correct answer into the drop zone</PromptLabel>

          {loading ? (
            <LoadRow><LoadDot /><LoadDot $d=".15s" /><LoadDot $d=".3s" /></LoadRow>
          ) : isPlaying && !gameOver && currentQuestion ? (
            <>
              {/* ── QUESTION CARD ── */}
              <QuestionCard $shake={flash}>
                {showPlusPoints && <PlusOne>+{pointsGained}</PlusOne>}
                <QuestionMeta>What is the correct answer for:</QuestionMeta>
                <CharacterBox>{currentQuestion.question}</CharacterBox>
                {feedback && <FeedbackLine $ok={feedback.ok}>{feedback.msg}</FeedbackLine>}
              </QuestionCard>

              {/* ── DRAG PANEL ── */}
              <DragPanel>

                {/* Choices column */}
                <ChoicesCol>
                  <ColLabel>Choices</ColLabel>
                  {currentQuestion.options.map((opt, i) => (
                    <DragTile
                      key={opt}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opt)}
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      {opt}
                    </DragTile>
                  ))}
                </ChoicesCol>

                {/* Arrow */}
                <ArrowCol>
                  <Arrow>→</Arrow>
                  <ArrowLabel>drag here</ArrowLabel>
                </ArrowCol>

                {/* Drop zone column */}
                <DropCol>
                  <ColLabel>Drop Zone</ColLabel>
                  <DropZone
                    onDrop={handleDrop}
                    onDragOver={allowDrop}
                    onDragLeave={handleDragLeave}
                    $shake={shakeDrop}
                    $over={dragOver}
                  >
                    {dragOver ? (
                      <DropZoneHint $over>Release to answer</DropZoneHint>
                    ) : (
                      <DropZoneHint>Drop answer here</DropZoneHint>
                    )}
                  </DropZone>
                </DropCol>

              </DragPanel>

              {/* ── ACTIONS ── */}
              <GameActions>
                <ActionBtn $variant="ghost" onClick={handleSkip} disabled={skipsLeft === 0 || isAnswering}>
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

                <InfoBlock $center>
                  <InfoBlockLabel>How to play</InfoBlockLabel>
                  <DragHint>
                    <DragIcon>☰</DragIcon>
                    <DragHintText>drag → drop</DragHintText>
                  </DragHint>
                </InfoBlock>

                <InfoDivider />

                <InfoBlock $right>
                  <InfoBlockLabel>Progress</InfoBlockLabel>
                  <ProgressRow>
                    <ProgressTrack>
                      <ProgressFill
                        style={{ width: `${Math.min((currentIndex / Math.max(shuffledQuestions.length, 1)) * 100, 100)}%` }}
                      />
                    </ProgressTrack>
                    <ProgressNum>{currentIndex}/{shuffledQuestions.length}</ProgressNum>
                  </ProgressRow>
                </InfoBlock>
              </InfoStrip>

              {/* ── BOTTOM META ── */}
              <BottomMeta>
                <DiffBadge $color={config.color}>{config.label}</DiffBadge>
                <PointsNote>+{pointsPerCorrect} pts per correct · +1s time bonus</PointsNote>
                <SkipNote>{skipsLeft} skip{skipsLeft !== 1 ? "s" : ""} remaining</SkipNote>
              </BottomMeta>
            </>
          ) : null}
        </GameBody>
      </PageRoot>

      {/* ── GAME OVER ── */}
      {gameOver && (
        <ModalOverlay>
          <GameOverModal>
            <ModalOrb>⏳</ModalOrb>
            <ModalTitle>Time's Up!</ModalTitle>
            <ModalStats>
              <ModalStat><ModalStatLabel>Difficulty</ModalStatLabel><ModalStatVal>{config.label}</ModalStatVal></ModalStat>
              <ModalDivider />
              <ModalStat><ModalStatLabel>Final Score</ModalStatLabel><ModalStatVal $gold>{score}</ModalStatVal></ModalStat>
              <ModalDivider />
              <ModalStat><ModalStatLabel>Answered</ModalStatLabel><ModalStatVal>{totalAnswered}</ModalStatVal></ModalStat>
            </ModalStats>
            <ModalActions>
              <ModalBtn $variant="amber" onClick={handleRestart}>↺ Restart</ModalBtn>
              <ModalBtn $variant="red" onClick={() => navigate("/HomeGame")}>✕ Exit</ModalBtn>
            </ModalActions>
          </GameOverModal>
        </ModalOverlay>
      )}

      {/* ── EXIT CONFIRM ── */}
      {showExitConfirm && (
        <ModalOverlay>
          <ExitModal>
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit Drag & Drop Mode?</ModalTitle>
            <ModalActions>
              <ModalBtn $variant="red"   onClick={() => confirmExit(true)}>Yes, Exit</ModalBtn>
              <ModalBtn $variant="green" onClick={() => confirmExit(false)}>Keep Playing</ModalBtn>
            </ModalActions>
          </ExitModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default Drag;

/* ═══════════════════════════════════
   STYLES
═══════════════════════════════════ */

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
const LeftArt  = styled.img`position:absolute;top:0;left:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightArt = styled.img`position:absolute;top:0;right:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightControlSlot= styled.div`width:205px;display:flex;justify-content:flex-end;`;
const SoundBtn = styled.button`background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;transition:transform .2s;&:hover{transform:scale(.9);}`;
const SoundBtnImg = styled.img`
  width: 205px; display: block; margin-top: -30px;

  @media (max-width: 900px) {
    width: 170px;
    margin-top: -22px;
  }

  @media (max-width: 720px) {
    width: 150px;
    margin-top: -16px;
  }
`;

/* ── HEADER ── */
const Header = styled.header`
  position: relative; z-index: 100; width: 100%; padding: 12px 16px 8px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0;

  @media (max-width: 900px) {
    padding: 10px 12px 6px;
    gap: 6px;
  }

  @media (max-width: 720px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;
const BackBtn      = styled.button`background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;transition:transform .2s;&:hover{transform:scale(.9);}`;
const BackBtnIcon  = styled.img`
  width:205px;display:block;margin-top:-30px;

  @media (max-width: 900px) {
    width: 170px;
    margin-top: -22px;
  }

  @media (max-width: 720px) {
    width: 150px;
    margin-top: -16px;
  }
`;
const HeaderCenter = styled.div`
  flex:1;display:flex;justify-content:center;

  @media (max-width: 720px) {
    order: 3;
    flex: 0 0 100%;
  }
`;
const ScoreRow     = styled.div`
  display:flex;align-items:center;gap:10px;

  @media (max-width: 900px) {
    gap: 8px;
  }

  @media (max-width: 720px) {
    gap: 6px;
    transform: scale(0.92);
  }
`;
const StatPill     = styled.div`
  display:flex;align-items:center;gap:8px;padding:5px 12px 5px 10px;border-radius:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px);

  @media (max-width: 720px) {
    padding: 4px 10px 4px 8px;
    gap: 6px;
  }
`;
const StatIcon     = styled.span`
  font-size:13px;opacity:.55;color:#fbc417;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`;
const StatBody     = styled.div``;
const StatLabel    = styled.div`
  font-family:sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.55);

  @media (max-width: 720px) {
    font-size: 8px;
    letter-spacing: 1px;
  }
`;
const StatVal      = styled.div`
  font-family:'Georgia',serif;font-size:15px;font-weight:900;line-height:1.1;color:${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;
const TimerPill    = styled.div`
  position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;

  @media (max-width: 720px) {
    width: 46px;
    height: 46px;
  }
`;
const TimerSvg     = styled.svg`position:absolute;inset:0;width:100%;height:100%;`;
const TimerText    = styled.div`
  font-family:'Georgia',serif;font-size:16px;font-weight:900;
  position:relative;z-index:1;
  color:${({ $danger }) => $danger ? "#ff6b6b" : "#fff"};
  ${({ $danger }) => $danger && css`animation:${timerDanger} .7s ease-in-out infinite;`}

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;

/* ── GAME BODY ── */
const GameBody = styled.main`
  position: relative; z-index: 10; flex: 1; width: 100%;
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 0 16px 16px; overflow-y: auto;

  @media (max-width: 720px) {
    padding: 0 12px 12px;
    gap: 8px;
  }
`;
const PromptLabel = styled.div`
  font-family: sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: 1.6px; text-transform: uppercase;
  color: rgba(255,248,231,.55); padding-top: 2px;
  animation: ${floatUp} .4s ease;

  @media (max-width: 720px) {
    font-size: 10px;
    letter-spacing: 1px;
    text-align: center;
  }
`;
const LoadRow = styled.div`display:flex;gap:6px;align-items:center;margin-top:40px;`;
const LoadDot = styled.span`
  width:8px;height:8px;border-radius:50%;background:#fbc417;
  animation:${dotAnim} 1.2s ease-in-out infinite;
  animation-delay:${({ $d }) => $d || "0s"};
`;

/* ── QUESTION CARD ── */
const QuestionCard = styled.div`
  position: relative;
  width: min(580px, 92vw);
  padding: 18px 22px 14px;
  border-radius: 18px;
  background: rgba(0,0,0,.28);
  border: 1px solid rgba(251,196,23,.22);
  box-shadow: inset 0 1px 0 rgba(255,220,150,.08), 0 8px 24px rgba(0,0,0,.3);
  text-align: center;
  animation: ${floatUp} .35s ease;
  ${({ $shake }) => $shake && css`animation:${shake} .35s ease;`}
`;
const QuestionMeta = styled.p`
  margin: 0 0 10px;
  font-family: sans-serif; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(255,242,210,.45);
`;
const CharacterBox = styled.div`
  display: inline-block;
  padding: 14px 28px; border-radius: 14px;
  background: rgba(255,255,255,.95);
  color: #3d1a06; font-size: 2.4rem; font-weight: 900;
  box-shadow: 0 4px 16px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.8);
  letter-spacing: 2px;
`;
const PlusOne = styled.div`
  position: absolute; top: 14px; left: 50%;
  font-size: 1.1rem; font-weight: 800; color: #86efac;
  animation: ${flashUp} .8s forwards; white-space: nowrap;
`;
const FeedbackLine = styled.div`
  margin-top: 10px;
  font-family: sans-serif; font-size: 13px; font-weight: 700;
  color: ${({ $ok }) => $ok ? "#4ade80" : "#f87171"};
  animation: ${correctFeedback} .9s ease forwards;
`;

/* ── DRAG PANEL ── */
const DragPanel = styled.div`
  width: min(580px, 92vw);
  display: flex; align-items: center; gap: 12px;
  animation: ${floatUp} .4s ease;
`;

const ColLabel = styled.div`
  font-family: sans-serif; font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(255,242,210,.4); margin-bottom: 8px; text-align: center;
`;

/* Choices */
const ChoicesCol = styled.div`
  flex: 1;
  display: flex; flex-direction: column;
  background: rgba(0,0,0,.22);
  border: 1px solid rgba(251,196,23,.12);
  border-radius: 14px; padding: 12px 10px;
  backdrop-filter: blur(8px);
`;
const DragTile = styled.div`
  padding: 12px 10px; border-radius: 10px; margin-bottom: 6px;
  background: rgba(255,255,255,.92); color: #3d1a06;
  font-family: 'Georgia', serif; font-size: 1rem; font-weight: 700;
  text-align: center; cursor: grab; user-select: none;
  border: 1.5px solid rgba(251,196,23,.3);
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
  animation: ${dragPop} .3s ease both;
  transition: transform .15s, box-shadow .15s, background .15s;
  &:last-child { margin-bottom: 0; }
  &:hover { transform: translateY(-2px) scale(1.02); background: #fff; box-shadow: 0 6px 16px rgba(0,0,0,.25); }
  &:active { cursor: grabbing; transform: scale(.97); }
`;

/* Arrow */
const ArrowCol = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; flex-shrink: 0; padding-top: 24px;
`;
const Arrow = styled.span`
  font-size: 22px; color: rgba(251,196,23,.5);
  animation: ${keyframes`0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(4px);opacity:1}`} 1.6s ease-in-out infinite;
`;
const ArrowLabel = styled.span`
  font-family: sans-serif; font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .8px;
  color: rgba(255,242,210,.3);
`;

/* Drop zone */
const DropCol = styled.div`
  flex: 1;
  display: flex; flex-direction: column;
`;
const DropZone = styled.div`
  flex: 1; min-height: 160px;
  border: 2px dashed ${({ $over }) => $over ? "rgba(251,196,23,.75)" : "rgba(251,196,23,.3)"};
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: ${({ $over }) => $over ? "rgba(251,196,23,.12)" : "rgba(0,0,0,.18)"};
  backdrop-filter: blur(8px);
  transition: all .2s ease;
  ${({ $over }) => $over && css`animation: ${dropGlow} 1s ease-in-out infinite;`}
  ${({ $shake }) => $shake && css`animation: ${shake} .35s ease;`}
`;
const DropZoneHint = styled.p`
  margin: 0; font-family: sans-serif; font-size: 12px; font-weight: 700;
  letter-spacing: .5px; text-align: center;
  color: ${({ $over }) => $over ? "rgba(251,196,23,.85)" : "rgba(255,242,210,.3)"};
  transition: color .2s;
`;

/* ── ACTIONS ── */
const GameActions = styled.div`
  display: flex; gap: 10px;
  width: min(580px, 92vw); justify-content: center;
`;
const ActionBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 11px 24px; border-radius: 12px;
  font-family: 'Georgia', serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: transform .15s, box-shadow .15s;
  opacity: ${({ disabled }) => disabled ? .5 : 1};
  pointer-events: ${({ disabled }) => disabled ? "none" : "auto"};
  ${({ $variant }) => {
    if ($variant === "primary") return css`
      background: linear-gradient(135deg,#fbc417 0%,#f59e0b 100%);
      border: none; color: #3d2401; flex: 2;
      box-shadow: 0 4px 14px rgba(251,196,23,.35);
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(251,196,23,.45); }
      &:active { transform: translateY(1px); }
    `;
    return css`
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(251,196,23,.3); color: #fff7e7;
      &:hover { background: rgba(255,255,255,.1); transform: translateY(-1px); }
      &:active { transform: translateY(1px); }
    `;
  }}
`;
const BtnIcon = styled.span`font-size: 13px; opacity: .9;`;

/* ── BOTTOM INFO STRIP ── */
const InfoStrip = styled.div`
  width: min(580px, 92vw);
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-radius: 14px;
  background: rgba(0,0,0,.22); border: 1px solid rgba(251,196,23,.12);
  backdrop-filter: blur(8px);
  animation: ${floatUp} .5s .1s ease both;
`;
const InfoBlock      = styled.div`display:flex;flex-direction:column;gap:5px;align-items:${({ $center }) => $center ? "center" : ({ $right }) => $right ? "flex-end" : "flex-start"};flex:1;`;
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

/* Drag hint */
const DragHint     = styled.div`display:flex;align-items:center;gap:6px;`;
const DragIcon     = styled.span`font-size:14px;color:rgba(251,196,23,.6);`;
const DragHintText = styled.span`
  font-family:sans-serif;font-size:11px;font-weight:700;
  color:rgba(255,242,210,.65);letter-spacing:.4px;
`;

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

/* ── MODALS ── */
const ModalOverlay   = styled.div`position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;`;
const GameOverModal  = styled.div`background:linear-gradient(160deg,#2c1204 0%,#1a0b02 100%);border:1px solid rgba(251,196,23,.3);border-radius:24px;padding:36px 32px 28px;width:100%;max-width:400px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,220,120,.12);`;
const ExitModal      = styled(GameOverModal)``;
const ModalOrb       = styled.div`font-size:40px;margin-bottom:8px;`;
const ModalTitle     = styled.h2`font-family:'Georgia',serif;font-size:1.5rem;font-weight:900;margin:0 0 20px;color:#fde68a;`;
const ModalSubtext   = styled.p`font-family:sans-serif;font-size:13px;color:rgba(255,255,255,.5);margin:-12px 0 20px;`;
const ModalStats     = styled.div`display:flex;justify-content:center;align-items:center;gap:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 20px;margin-bottom:24px;`;
const ModalStat      = styled.div`display:flex;flex-direction:column;gap:4px;align-items:center;`;
const ModalStatLabel = styled.div`font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.5);`;
const ModalStatVal   = styled.div`font-family:'Georgia',serif;font-size:20px;font-weight:900;color:${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};`;
const ModalDivider   = styled.div`width:1px;height:36px;background:rgba(255,255,255,.1);`;
const ModalActions   = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const ModalBtn       = styled.button`
  flex:1;min-width:110px;padding:11px 16px;border-radius:12px;
  font-family:'Georgia',serif;font-size:14px;font-weight:700;
  cursor:pointer;border:none;transition:transform .15s,filter .15s;
  &:hover{transform:translateY(-2px);filter:brightness(1.08);}
  &:active{transform:translateY(1px);}
  ${({ $variant }) => {
    if ($variant === "amber") return css`background:linear-gradient(135deg,#f59e0b,#d97706);color:#3d2401;`;
    if ($variant === "green") return css`background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;`;
    if ($variant === "red")   return css`background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;`;
    return css`background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;`;
  }}
`;