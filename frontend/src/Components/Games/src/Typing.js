import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import write1 from '../../../Assests/write1.png';
import write2 from '../../../Assests/write2.png';
import back from '../../../Assests/back.png';
import soundIcon from "../../../Assests/sound.png";
import muteIcon from "../../../Assests/mute.png";
import confetti from "canvas-confetti";
import bgMusicFile from "../../../Assests/Tap.mp3";
import stoneClick from "../../../Assests/stone.mp3";

/* ---------------- ANIMATIONS ---------------- */
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
const correctFeedback = keyframes`
  0%   { opacity: 0; transform: translateY(6px) scale(.9); }
  20%  { opacity: 1; transform: translateY(0) scale(1); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-6px); }
`;

/* ---------------- BAYBAYIN HINT MAP ---------------- */
const BAYBAYIN_HINTS = {
  A: "ᜀ", E: "ᜁ", I: "ᜁ", O: "ᜂ", U: "ᜂ",
  B: "ᜊ", K: "ᜃ", D: "ᜇ", G: "ᜄ", H: "ᜑ",
  L: "ᜎ", M: "ᜋ", N: "ᜈ", NG: "ᜅ", P: "ᜉ",
  R: "ᜍ", S: "ᜐ", T: "ᜆ", W: "ᜏ", Y: "ᜌ",
};

/* ---------------- COMPONENT ---------------- */
const Typing = ({ difficulty = "Medium", startGame = false, onGameOver }) => {
  const navigate    = useNavigate();
  const audioRef    = useRef(null);
  const clickRef    = useRef(new Audio(stoneClick));
  const inputRef    = useRef(null);
  const feedbackRef = useRef(null);

  const getDifficultyConfig = (diff) => {
    switch ((diff || "medium").toLowerCase()) {
      case "easy":   return { timeLimit: 60, pointsPerCorrect: 5, label: "Easy",   color: "#22c55e" };
      case "hard":   return { timeLimit: 30, pointsPerCorrect: 2, label: "Hard",   color: "#ef4444" };
      default:       return { timeLimit: 40, pointsPerCorrect: 3, label: "Medium", color: "#fbc417" };
    }
  };

  const config          = getDifficultyConfig(difficulty);
  const timeLimit       = config.timeLimit;
  const pointsPerCorrect = config.pointsPerCorrect;

  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [input,         setInput]         = useState("");
  const [feedback,      setFeedback]      = useState(null); // { msg, ok }
  const [score,         setScore]         = useState(0);
  const [time,          setTime]          = useState(timeLimit);
  const [isPlaying,     setIsPlaying]     = useState(startGame);
  const [gameOver,      setGameOver]      = useState(false);
  const [skipsLeft,     setSkipsLeft]     = useState(3);
  const [showPlusPoints,setShowPlusPoints]= useState(false);
  const [pointsGained,  setPointsGained]  = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [showExitConfirm,setShowExitConfirm]=useState(false);
  const [scoreSubmitted,setScoreSubmitted]= useState(false);
  const [flash,         setFlash]         = useState(false);
  const [isCorrectAnim, setIsCorrectAnim] = useState(false);
  const [streak,        setStreak]        = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showHint,      setShowHint]      = useState(false);
  const [soundEnabled,  setSoundEnabled]  = useState(true);

  const normalizeAnswerText = (value) => String(value ?? "").trim().toUpperCase();

  const getAcceptedAnswers = (rawAnswer) => {
    if (Array.isArray(rawAnswer)) {
      const list = rawAnswer.map(normalizeAnswerText).filter(Boolean);

      return list.length ? list : [""];
    }

    if (rawAnswer && typeof rawAnswer === "object") {
      if (Array.isArray(rawAnswer.answers)) {
        const list = rawAnswer.answers.map(normalizeAnswerText).filter(Boolean);
        if (list.length) return list;
      }

      if ("answer" in rawAnswer) {
        const one = normalizeAnswerText(rawAnswer.answer);
        if (one) return [one];
      }

      if ("text" in rawAnswer) {
        const one = normalizeAnswerText(rawAnswer.text);
        if (one) return [one];
      }
    }

    return [normalizeAnswerText(rawAnswer)];
  };

  useEffect(() => { setTime(timeLimit); }, [difficulty, timeLimit]);

  const circumference    = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - time / timeLimit);

  /* ── Fetch ── */
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:8000/game/questions/typing");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShuffledQuestions(shuffleArray(data[difficulty] || []));
      setCurrentIndex(0);
    } catch {
      setFeedback({ msg: "Error loading questions.", ok: false });
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  const currentQuestion = shuffledQuestions[currentIndex] || null;

  /* ── Audio ── */
  useEffect(() => {
    const audio = new Audio(bgMusicFile);
    audio.loop = true; audio.volume = 0.5;
    audioRef.current = audio;
    if (soundEnabled) audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [soundEnabled]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundEnabled && isPlaying && !gameOver) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying, gameOver, soundEnabled]);

  /* ── Init ── */
  useEffect(() => {
    if (startGame) {
      setIsPlaying(true); setGameOver(false); setScore(0);
      setTime(timeLimit); setSkipsLeft(3); setScoreSubmitted(false);
      setCurrentIndex(0); setInput(""); setFeedback(null);
      setStreak(0); setTotalAnswered(0);
    }
    fetchQuestions();
  }, [difficulty, startGame, timeLimit, fetchQuestions]);

  /* ── Timer ── */
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const t = setInterval(() => {
      setTime((v) => {
        if (v <= 1) { clearInterval(t); setGameOver(true); setIsPlaying(false); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPlaying, gameOver]);

  /* ── Score callback ── */
  useEffect(() => {
    if (gameOver && onGameOver && !scoreSubmitted) {
      onGameOver(score); setScoreSubmitted(true);
    }
  }, [gameOver, score, onGameOver, scoreSubmitted]);

  /* ── Helpers ── */
  const playClick = () => {
    if (!soundEnabled || !clickRef.current) return;
    clickRef.current.currentTime = 0; clickRef.current.play().catch(() => {});
  };

  const setTransientFeedback = (msg, ok, ms = 1000) => {
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    setFeedback({ msg, ok });
    feedbackRef.current = setTimeout(() => setFeedback(null), ms);
  };

  const nextQuestion = () => {
    setCurrentIndex((i) => (i + 1 < shuffledQuestions.length ? i + 1 : 0));
    setInput(""); setFeedback(null); setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── Actions ── */
  const handleCheck = () => {
    playClick();
    if (!currentQuestion || !isPlaying) return;
    const playerAnswer = normalizeAnswerText(input);
    const acceptedAnswers = getAcceptedAnswers(currentQuestion.answer);
    if (acceptedAnswers.includes(playerAnswer)) {
      setScore((s) => s + pointsPerCorrect);
      setStreak((s) => s + 1);
      setTotalAnswered((t) => t + 1);
      setPointsGained(pointsPerCorrect);
      setShowPlusPoints(true);
      setIsCorrectAnim(true);
      setTimeout(() => { setShowPlusPoints(false); setIsCorrectAnim(false); }, 800);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTime((t) => Math.min(t + 1, 999));
      setTransientFeedback("✓ Correct!", true, 700);
      setTimeout(() => nextQuestion(), 750);
    } else {
      setStreak(0);
      setTotalAnswered((t) => t + 1);
      setFlash(true);
      setTransientFeedback("✗ Try again!", false, 900);
      setTimeout(() => { setFlash(false); nextQuestion(); }, 950);
    }
  };

  const handleSkip = () => {
    playClick();
    if (skipsLeft <= 0) return;
    setSkipsLeft((s) => s - 1);
    setStreak(0);
    setTransientFeedback("⏭ Skipped", false, 700);
    setTimeout(() => nextQuestion(), 700);
  };

  const handleRestart = () => {
    playClick();
    setScore(0); setTime(timeLimit); setGameOver(false); setIsPlaying(true);
    setInput(""); setFeedback(null); setSkipsLeft(3); setCurrentIndex(0);
    setScoreSubmitted(false); setStreak(0); setTotalAnswered(0);
  };

  const handleBackClick   = () => { playClick(); setShowExitConfirm(true); };
  const confirmExit = (yes) => { playClick(); setShowExitConfirm(false); if (yes) navigate("/HomeGame"); };
  const handleKeyDown     = (e) => { if (e.key === "Enter") handleCheck(); };

  /* ── Hint character (first letter of question) ── */
  const primaryAcceptedAnswer = currentQuestion
    ? getAcceptedAnswers(currentQuestion.answer)[0] || ""
    : "";

  const hintChar = currentQuestion
    ? BAYBAYIN_HINTS[primaryAcceptedAnswer.slice(0, 1)] || "—"
    : "—";

  useEffect(() => { return () => { if (feedbackRef.current) clearTimeout(feedbackRef.current); }; }, []);

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
          <BackBtn onClick={handleBackClick}><BackBtnIcon src={back} alt="Back" /><ControlText>Back</ControlText></BackBtn>
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
            <SoundBtn onClick={() => { playClick(); setSoundEnabled(p => !p); }} $active={soundEnabled}>
              <SoundBtnImg src={soundEnabled ? soundIcon : muteIcon} alt={soundEnabled ? "Sound on" : "Sound off"} />
              <ControlText>{soundEnabled ? "Sound" : "Mute"}</ControlText>
            </SoundBtn>
          </RightControlSlot>
        </Header>

        {/* ── GAME BODY ── */}
        <GameBody>
          <PromptLabel>Type the Latin equivalent of the Baybayin character</PromptLabel>

          {loading ? (
            <LoadRow><LoadDot /><LoadDot $d=".15s" /><LoadDot $d=".3s" /></LoadRow>
          ) : isPlaying && !gameOver && currentQuestion ? (
            <>
              {/* ── QUESTION CARD ── */}
              <QuestionCard $shake={flash}>
                {showPlusPoints && <PlusOne>+{pointsGained}</PlusOne>}

                <QuestionMeta>What is the LATIN equivalent of:</QuestionMeta>
                <CharacterBox>{currentQuestion.question}</CharacterBox>

                {/* Hint toggle */}
                <HintRow>
                  <HintBtn onClick={() => setShowHint((h) => !h)} $active={showHint}>
                    {showHint ? "Hide hint" : "Show hint"}
                  </HintBtn>
                  {showHint && (
                    <HintBubble>
                      Starts with: <HintChar>{hintChar}</HintChar>
                    </HintBubble>
                  )}
                </HintRow>
              </QuestionCard>

              {/* ── INPUT CARD ── */}
              <InputCard $shake={flash}>
                <InputField
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer…"
                  $hasValue={input.length > 0}
                />
                {feedback && (
                  <FeedbackLine $ok={feedback.ok}>{feedback.msg}</FeedbackLine>
                )}
              </InputCard>

              {/* ── ACTIONS ── */}
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

                {/* Streak */}
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

                {/* Keyboard hint */}
                <InfoBlock $center>
                  <InfoBlockLabel>Keyboard shortcut</InfoBlockLabel>
                  <KeyHint>
                    <KeyCap>Submit with Enter key</KeyCap>
                  </KeyHint>
                </InfoBlock>

                <InfoDivider />

                {/* Progress */}
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

              {/* ── DIFFICULTY BADGE + POINTS REMINDER ── */}
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
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit Typing Mode?</ModalTitle>
            <ModalSubtext>Your progress will not be saved.</ModalSubtext>
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

export default Typing;

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
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9000;
  background: rgba(220,38,38,.38);
  animation: ${flashRed} .55s ease forwards;
`;

const CorrectBurst = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9000;
  background: rgba(251,196,23,.18);
  animation: ${correctPop} .8s ease forwards;
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

const Header = styled.header`
  position: relative; z-index: 100; width: 100%; padding: 12px 16px 8px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0;

  @media (max-width: 900px) {
    padding: 10px 12px 6px;
    gap: 6px;
  }

  @media (max-width: 720px) {
    padding: 10px 10px 6px;
    gap: 6px;
  }
`;
const BackBtn      = styled.button`
  background:none;
  border:none;
  padding:0;
  cursor:pointer;
  flex-shrink:0;
  transition:transform .2s, box-shadow .2s, border-color .2s, background .2s;

  &:hover{transform:translateY(-1px);}

  @media(min-width:721px){
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:205px;
    height:74px;
    background:linear-gradient(135deg,rgba(251,196,23,.24),rgba(245,158,11,.18));
    border:1px solid rgba(251,196,23,.42);
    border-radius:18px;
    box-shadow:0 8px 20px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.18);
    overflow:hidden;
  }

  @media(max-width:720px){
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:8px 12px;
    border:1px solid rgba(251,196,23,.35);
    border-radius:12px;
    background:rgba(0,0,0,.25);
    &:hover{transform:none;}
  }
`;
const BackBtnIcon  = styled.img`
  width:205px;
  display:block;

  @media(min-width:721px){
    width:180px;
    margin:0 auto;
    object-fit:contain;
  }

  @media(max-width:720px){display:none;}
`;
const RightControlSlot= styled.div`width:205px;display:flex;justify-content:flex-end;@media (max-width:720px){width:auto;}`;
const SoundBtn = styled.button`
  background:none;
  border:none;
  padding:0;
  cursor:pointer;
  flex-shrink:0;
  transition:transform .2s, box-shadow .2s, border-color .2s, background .2s;

  &:hover{transform:translateY(-1px);}

  @media(min-width:721px){
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:205px;
    height:74px;
    background:linear-gradient(135deg,rgba(251,196,23,.24),rgba(245,158,11,.18));
    border:1px solid ${({$active})=>$active?"rgba(251,196,23,.55)":"rgba(251,196,23,.34)"};
    border-radius:18px;
    box-shadow:0 8px 20px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.18);
    overflow:hidden;
  }

  @media(max-width:720px){
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:8px 12px;
    border:1px solid ${({$active})=>$active?"rgba(251,196,23,.5)":"rgba(255,255,255,.25)"};
    border-radius:12px;
    background:rgba(0,0,0,.25);
    &:hover{transform:none;}
  }
`;
const SoundBtnImg = styled.img`
  width:205px;
  display:block;

  @media(min-width:721px){
    width:180px;
    margin:0 auto;
    object-fit:contain;
  }

  @media(max-width:720px){display:none;}
`;
const ControlText = styled.span`display:none;@media (max-width:720px){display:inline-block;font-family:sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff1cf;line-height:1;}`;
const HeaderCenter = styled.div`
  flex:1;display:flex;justify-content:center;
  min-width:0;
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
  text-transform: uppercase; letter-spacing: 1.6px;
  color: rgba(255,242,210,.45);
`;
const LoadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
`;
const LoadDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #fbc417;
  opacity: .35;
  animation: ${dotPulse} 1.1s ease-in-out infinite;
  animation-delay: ${({ $d }) => $d || "0s"};
`;
const QuestionCard = styled.div`
  position: relative;
  width: min(520px, 92vw);
  padding: 20px 22px 16px;
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
  padding: 16px 32px;
  border-radius: 16px;
  background: rgba(255,255,255,.95);
  color: #3d1a06;
  font-size: 2.8rem; font-weight: 900;
  box-shadow: 0 4px 16px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.8);
  letter-spacing: 2px;
`;
const PlusOne = styled.div`
  position: absolute; top: 14px; left: 50%;
  font-size: 1.1rem; font-weight: 800; color: #86efac;
  animation: ${flashUp} .8s forwards;
  white-space: nowrap;
`;
const HintRow = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin-top: 12px;
`;
const HintBtn = styled.button`
  background: ${({ $active }) => $active ? "rgba(251,196,23,.18)" : "rgba(255,255,255,.07)"};
  border: 1px solid ${({ $active }) => $active ? "rgba(251,196,23,.45)" : "rgba(255,255,255,.15)"};
  border-radius: 20px; padding: 4px 14px;
  font-family: sans-serif; font-size: 11px; font-weight: 700;
  color: ${({ $active }) => $active ? "#fde68a" : "rgba(255,248,231,.5)"};
  cursor: pointer; transition: all .15s;
  &:hover { background: rgba(251,196,23,.15); color: #fde68a; }
`;
const HintBubble = styled.div`
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 10px;
  background: rgba(251,196,23,.1); border: 1px solid rgba(251,196,23,.25);
  font-family: sans-serif; font-size: 12px; color: rgba(255,242,210,.7);
  animation: ${floatUp} .2s ease;
`;
const HintChar = styled.span`font-size: 1.1rem; color: #fde68a; font-family: 'Noto Sans Tagalog', sans-serif;`;

/* ── INPUT CARD ── */
const InputCard = styled.div`
  width: min(520px, 92vw);
  padding: 10px 10px 6px;
  background: rgba(255,255,255,.94);
  border: 1.5px solid rgba(251,196,23,.3);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,.18);
  ${({ $shake }) => $shake && css`animation:${shake} .35s ease;`}
`;
const InputField = styled.input`
  width: 100%; box-sizing: border-box;
  padding: 13px 16px; border-radius: 10px;
  border: 1.5px solid ${({ $hasValue }) => $hasValue ? "rgba(251,196,23,.5)" : "rgba(194,64,12,.15)"};
  background: transparent;
  color: #3d1a06; font-family: 'Georgia', serif; font-size: 1.05rem; font-weight: 700;
  text-align: center; outline: none;
  transition: border-color .2s, box-shadow .2s;
  &::placeholder { color: rgba(107,58,31,.35); font-weight: 400; }
  &:focus { border-color: rgba(251,196,23,.6); box-shadow: 0 0 0 3px rgba(251,196,23,.1); }
`;
const FeedbackLine = styled.div`
  text-align: center; padding: 5px 0 2px;
  font-family: sans-serif; font-size: 12px; font-weight: 700;
  color: ${({ $ok }) => $ok ? "#16a34a" : "#dc2626"};
  animation: ${correctFeedback} .9s ease forwards;
`;

/* ── ACTIONS ── */
const GameActions = styled.div`
  display: flex; gap: 10px;
  width: min(520px, 92vw); justify-content: center;
`;
const ActionBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 12px 16px; border-radius: 12px;
  font-family: 'Georgia', serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: transform .15s, box-shadow .15s;
  flex: 1;
  opacity: ${({ disabled }) => disabled ? .5 : 1};
  pointer-events: ${({ disabled }) => disabled ? "none" : "auto"};
  ${({ $variant }) => {
    if ($variant === "primary") return css`
      background: linear-gradient(135deg,#fbc417 0%,#f59e0b 100%);
      border: none; color: #3d2401; flex: 2;
      box-shadow: 0 4px 14px rgba(251,196,23,.35), inset 0 1px 0 rgba(255,255,255,.25);
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
  width: min(520px, 92vw);
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(0,0,0,.22);
  border: 1px solid rgba(251,196,23,.12);
  backdrop-filter: blur(8px);
  animation: ${floatUp} .5s .1s ease both;
`;
const InfoBlock = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  align-items: ${({ $center }) => $center ? "center" : $right => $right ? "flex-end" : "flex-start"};
  flex: 1;
`;
const InfoBlockLabel = styled.div`
  font-family: sans-serif; font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
  color: rgba(255,242,210,.4);
`;
const InfoDivider = styled.div`width: 1px; height: 36px; background: rgba(255,255,255,.1); flex-shrink: 0;`;

/* Streak dots */
const StreakRow   = styled.div`display:flex;align-items:center;gap:5px;`;
const StreakDot   = styled.span`
  width: ${({ $current }) => $current ? "18px" : "10px"};
  height: 10px; border-radius: 999px;
  background: ${({ $active }) => $active ? "#fbc417" : "rgba(255,255,255,.18)"};
  box-shadow: ${({ $active }) => $active ? "0 0 6px rgba(251,196,23,.7)" : "none"};
  transition: all .3s ease;
  ${({ $current, $active }) => $current && $active && css`animation:${dotPulse} 1.4s ease-in-out infinite;`}
`;
const StreakExtra  = styled.span`font-family:sans-serif;font-size:10px;font-weight:700;color:#fbc417;`;

/* Keyboard hint */
const KeyHint      = styled.div`display:flex;align-items:center;gap:4px;`;
const KeyCap       = styled.span`
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,242,210,.78);
  letter-spacing: .2px;
`;

/* Progress bar */
const ProgressRow   = styled.div`display:flex;align-items:center;gap:6px;`;
const ProgressTrack = styled.div`
  width: 80px; height: 6px; border-radius: 3px;
  background: rgba(255,255,255,.15); overflow: hidden;
`;
const ProgressFill  = styled.div`
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg,#fbc417,#f59e0b);
  transition: width .4s ease;
  transform-origin: left;
`;
const ProgressNum   = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.55);font-weight:600;`;

/* ── BOTTOM META ── */
const BottomMeta = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 14px; flex-wrap: wrap;
  animation: ${floatUp} .5s .2s ease both;
`;
const DiffBadge = styled.div`
  padding: 3px 12px; border-radius: 20px;
  font-family: sans-serif; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
  background: ${({ $color }) => `${$color}22`};
  border: 1px solid ${({ $color }) => `${$color}55`};
  color: ${({ $color }) => $color};
`;
const PointsNote = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.4);`;
const SkipNote   = styled.span`font-family:sans-serif;font-size:10px;color:rgba(255,242,210,.4);`;

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