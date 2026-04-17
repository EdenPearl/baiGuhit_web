import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import useGameDataByCategory from "../../../Hooks/GameHooks/useGameDataByCategory";
import confetti from "canvas-confetti";
import errorSoundFile from "../../../Assests/stone.mp3";
import stoneClick from "../../../Assests/stone.mp3";
import write1 from "../../../Assests/write1.png";
import write2 from "../../../Assests/write2.png";
import back from "../../../Assests/back.png";

/* ─────────────────────── CONSTANTS ─────────────────────── */

const ALL_BAYBAYIN_CHARS = [
  "ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ","ᜉ","ᜊ","ᜋ","ᜌ","ᜎ",
  "ᜏ","ᜐ","ᜑ","ᜒ","ᜓ","᜔",
];

const MAX_TIME = 30;

/* ─────────────────────── COMPONENT ─────────────────────── */

const TapMode = ({ selectedDifficulty = "animal", startGame = false, onGameOver }) => {
  const navigate = useNavigate();
  const scoreSaved = useRef(false);
  const stoneClickRef = useRef(null);

  const [score, setScore]               = useState(0);
  const [gameOver, setGameOver]         = useState(false);
  const [timeLeft, setTimeLeft]         = useState(MAX_TIME);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [tiles, setTiles]               = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [typedAnswer, setTypedAnswer]   = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isWrong, setIsWrong]           = useState(false);
  const [flash, setFlash]               = useState(false);
  const [tileVibrate, setTileVibrate]   = useState(false);
  const [isCorrectAnim, setIsCorrectAnim] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { imageUrl, baybayinWord, loading, refetch } = useGameDataByCategory(selectedDifficulty);

  /* ── Audio ── */
  useEffect(() => {
    stoneClickRef.current = new Audio(stoneClick);
    stoneClickRef.current.volume = 0.6;
    return () => { if (stoneClickRef.current) stoneClickRef.current.pause(); };
  }, []);

  const playClick = () => {
    if (!stoneClickRef.current) return;
    try { stoneClickRef.current.currentTime = 0; stoneClickRef.current.play().catch(() => {}); } catch {}
  };

  const playError = () => {
    const s = new Audio(errorSoundFile);
    s.volume = 0.7;
    s.play().catch(() => {});
  };

  /* ── Game init ── */
  useEffect(() => {
    if (!startGame) return;
    setIsGameStarted(true);
    setScore(0);
    setGameOver(false);
    setTimeLeft(MAX_TIME);
    scoreSaved.current = false;
  }, [startGame]);

  useEffect(() => {
    if (gameOver && onGameOver && !scoreSaved.current) {
      scoreSaved.current = true;
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  /* ── Tiles ── */
  const splitBaybayinWord = (word) => (word ? Array.from(word) : []);

  const generateTiles = () => {
    if (!startGame || !correctAnswer) return;
    const correctChars = [...new Set(splitBaybayinWord(correctAnswer))];
    let tilesToShow = [...correctChars];
    const neededWrong = 10 - tilesToShow.length;
    if (neededWrong > 0) {
      const wrongChars = ALL_BAYBAYIN_CHARS.filter((c) => !correctChars.includes(c));
      const shuffled = [...wrongChars].sort(() => 0.5 - Math.random());
      tilesToShow = [...tilesToShow, ...shuffled.slice(0, neededWrong)];
    }
    setTiles(tilesToShow.sort(() => 0.5 - Math.random()));
    setSelectedTiles([]);
    setTypedAnswer("");
  };

  const reshuffleTiles = () => {
    if (!correctAnswer) return;
    const correctChars = [...new Set(splitBaybayinWord(correctAnswer))];
    let newTiles = [...correctChars];
    const neededWrong = 10 - newTiles.length;
    if (neededWrong > 0) {
      const wrongChars = ALL_BAYBAYIN_CHARS.filter((c) => !correctChars.includes(c));
      const shuffled = [...wrongChars].sort(() => 0.5 - Math.random());
      newTiles = [...newTiles, ...shuffled.slice(0, neededWrong)];
    }
    setTiles(newTiles.sort(() => 0.5 - Math.random()));
    setSelectedTiles([]);
    setTypedAnswer("");
  };

  /* ── Timer ── */
  useEffect(() => {
    if (!isGameStarted || gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameStarted, gameOver]);

  /* ── Sync correct answer ── */
  useEffect(() => { if (baybayinWord) setCorrectAnswer(baybayinWord); }, [baybayinWord]);
  useEffect(() => { if (correctAnswer && isGameStarted && !gameOver) generateTiles(); }, [correctAnswer, isGameStarted]);

  /* ── Actions ── */
  const checkAnswer = () => {
    if (!typedAnswer) return;
    if (typedAnswer === correctAnswer) {
      setScore((s) => s + 1);
      setIsCorrectAnim(true);
      setTimeout(() => setIsCorrectAnim(false), 800);
      const end = Date.now() + 800;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
      nextQuestion();
    } else {
      playError();
      setFlash(true);
      setIsWrong(true);
      setTileVibrate(true);
      setTimeout(() => {
        setFlash(false);
        setIsWrong(false);
        setTileVibrate(false);
        setSelectedTiles([]);
        setTypedAnswer("");
      }, 600);
    }
  };

  const nextQuestion = () => { setSelectedTiles([]); setTypedAnswer(""); refetch(); };

  const handleClear = () => {
    const updated = [...selectedTiles];
    updated.pop();
    setSelectedTiles(updated);
    setTypedAnswer(updated.join(""));
  };

  const handleTileClick = (tile) => {
    if (gameOver) return;
    playClick();
    setSelectedTiles((prev) => {
      const next = [...prev, tile];
      setTypedAnswer(next.join(""));
      return next;
    });
  };

  const handleRestart = () => {
    scoreSaved.current = false;
    setScore(0);
    setGameOver(false);
    setTimeLeft(MAX_TIME);
    refetch();
  };

  const confirmExit = (confirm) => {
    setShowExitConfirm(false);
    if (confirm) navigate("/HomeGame");
  };

  /* ── Timer ring ── */
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - timeLeft / MAX_TIME);

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <PageRoot $flash={flash}>
        <BgTexture />
        <BgGlow />

        {flash && <DamageOverlay />}
        {isCorrectAnim && <CorrectBurst />}

        {/* ── HEADER ── */}
        <Header>
          <BackBtn onClick={() => setShowExitConfirm(true)} title="Exit">
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
                    stroke={timeLeft <= 10 ? "#ff6b6b" : "#fbc417"}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 25 25)"
                  />
                </TimerSvg>
                <TimerText $danger={timeLeft <= 10}>{String(timeLeft).padStart(2, "0")}</TimerText>
              </TimerPill>

              <StatPill>
                <StatIcon>◈</StatIcon>
                <StatBody>
                  <StatLabel>Category</StatLabel>
                  <StatVal>{selectedDifficulty}</StatVal>
                </StatBody>
              </StatPill>
            </ScoreRow>
          </HeaderCenter>

          {/* spacer to balance layout */}
          <div style={{ width: 195 }} />
        </Header>

        {/* ── SIDE ART ── */}
        <LeftArt src={write1} />
        <RightArt src={write2} />

        {/* ── GAME BODY ── */}
        <GameBody>

          {/* Prompt label */}
          <PromptStrip>
            <PromptLabel>Tap tiles to form the Baybayin word</PromptLabel>
          </PromptStrip>

          {/* Image display */}
          <ImageFrame>
            <FrameBg />
            {loading ? (
              <LoadingDots><LoadDot /><LoadDot $d=".15s" /><LoadDot $d=".3s" /></LoadingDots>
            ) : imageUrl ? (
              <GameImage src={imageUrl} alt="Game prompt" />
            ) : (
              <NoImage>No Image</NoImage>
            )}
            <Corner $pos="tl" /><Corner $pos="tr" />
            <Corner $pos="bl" /><Corner $pos="br" />
          </ImageFrame>

          {/* Answer line */}
          <AnswerRow $wrong={isWrong}>
            {selectedTiles.length === 0 ? (
              <AnswerPlaceholder>Click tiles below to form your answer</AnswerPlaceholder>
            ) : (
              <AnswerText>{typedAnswer}</AnswerText>
            )}
          </AnswerRow>

          {/* Tiles grid */}
          <TilesPanel>
            {tiles.map((tile, i) => (
              <Tile
                key={i}
                $vibrate={tileVibrate}
                onClick={() => handleTileClick(tile)}
              >
                {tile}
              </Tile>
            ))}
          </TilesPanel>

          {/* Action buttons */}
          <GameActions>
            <ActionBtn $variant="ghost" onClick={handleClear}>
              <BtnIcon>⌫</BtnIcon> Clear
            </ActionBtn>
            <ActionBtn $variant="primary" onClick={checkAnswer}>
              <BtnIcon>➤</BtnIcon> Check
            </ActionBtn>
            <ActionBtn $variant="ghost" onClick={() => nextQuestion()}>
              <BtnIcon>⏭</BtnIcon> Skip
            </ActionBtn>
            <ActionBtn $variant="ghost" onClick={reshuffleTiles}>
              <BtnIcon>⇄</BtnIcon> Shuffle
            </ActionBtn>
          </GameActions>

        </GameBody>
      </PageRoot>

      {/* ── GAME OVER MODAL ── */}
      {gameOver && (
        <ModalOverlay>
          <GameOverModal>
            <ModalOrb>⏳</ModalOrb>
            <ModalTitle>Time's Up!</ModalTitle>
            <ModalStats>
              <ModalStat>
                <ModalStatLabel>Category</ModalStatLabel>
                <ModalStatVal>{selectedDifficulty}</ModalStatVal>
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

      {/* ── EXIT CONFIRM ── */}
      {showExitConfirm && (
        <ModalOverlay>
          <ExitModal>
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit Tap Mode?</ModalTitle>
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

export default TapMode;

/* ═══════════════════════════════════
   ANIMATIONS
═══════════════════════════════════ */
const floatUp     = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const blink       = keyframes`0%,100%{opacity:1}50%{opacity:0}`;
const flashRed    = keyframes`0%,100%{opacity:0}25%,75%{opacity:1}`;
const correctPop  = keyframes`0%{opacity:0;transform:scale(.6)}40%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.4)}`;
const shake       = keyframes`0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}`;
const vibrate     = keyframes`0%,100%{transform:translateY(0)}20%{transform:translateY(-5px)}40%{transform:translateY(5px)}60%{transform:translateY(-3px)}80%{transform:translateY(3px)}`;
const timerDanger = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.2)}`;
const ringPop     = keyframes`0%{transform:scale(.7);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}`;
const dotLoad     = keyframes`0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}`;
const tileIn      = keyframes`from{opacity:0;transform:scale(.8) translateY(8px)}to{opacity:1;transform:none}`;

/* ═══════════════════════════════════
   PAGE ROOT
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

/* ── HEADER ── */
const Header = styled.header`
  position: relative; z-index: 100;
  width: 100%; padding: 12px 16px 8px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; flex-shrink: 0;

  @media (max-width: 900px) {
    padding: 10px 12px 6px;
    gap: 6px;
  }

  @media (max-width: 720px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;
const BackBtn = styled.button`
  background: none; border: none; padding: 0; cursor: pointer;
  flex-shrink: 0; transition: transform .2s;
  &:hover { transform: scale(.9); }
`;
const BackBtnIcon = styled.img`
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
const HeaderCenter = styled.div`
  flex: 1; display: flex; justify-content: center;

  @media (max-width: 720px) {
    order: 3;
    flex: 0 0 100%;
  }
`;
const ScoreRow = styled.div`
  display: flex; align-items: center; gap: 10px;

  @media (max-width: 900px) {
    gap: 8px;
  }

  @media (max-width: 720px) {
    gap: 6px;
    transform: scale(0.92);
  }
`;

const StatPill = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 5px 12px 5px 10px; border-radius: 12px;
  background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(8px);

  @media (max-width: 720px) {
    padding: 4px 10px 4px 8px;
    gap: 6px;
  }
`;
const StatIcon  = styled.span`
  font-size: 13px; opacity: .55; color: #fbc417;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`;
const StatBody  = styled.div``;
const StatLabel = styled.div`
  font-family: sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: rgba(255,242,210,.55);

  @media (max-width: 720px) {
    font-size: 8px;
    letter-spacing: 1px;
  }
`;
const StatVal   = styled.div`
  font-family: 'Georgia',serif; font-size: 15px; font-weight: 900; line-height: 1.1; color: ${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;

const TimerPill = styled.div`
  position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;

  @media (max-width: 720px) {
    width: 46px;
    height: 46px;
  }
`;
const TimerSvg  = styled.svg`position: absolute; inset: 0; width: 100%; height: 100%;`;
const TimerText = styled.div`
  font-family: 'Georgia',serif; font-size: 16px; font-weight: 900;
  position: relative; z-index: 1;
  color: ${({ $danger }) => $danger ? "#ff6b6b" : "#fff"};
  ${({ $danger }) => $danger && css`animation: ${timerDanger} .7s ease-in-out infinite;`}

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;

/* ── SIDE ART ── */
const LeftArt  = styled.img`position:absolute;top:0;left:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightArt = styled.img`position:absolute;top:0;right:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;

/* ── GAME BODY ── */
const GameBody = styled.main`
  position: relative; z-index: 10;
  flex: 1; width: 100%;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 0 16px 16px;
  overflow-y: auto;

  @media (max-width: 720px) {
    padding: 0 12px 12px;
    gap: 10px;
  }
`;

const PromptStrip = styled.div`
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 0 0;
  animation: ${floatUp} .4s ease;

  @media (max-width: 720px) {
    padding-top: 2px;
  }
`;
const PromptLabel = styled.div`
  font-family: sans-serif; font-size: 15px; font-weight: 700;
  letter-spacing: 1.4px; text-transform: uppercase;
  color: rgba(255,248,231,.6);

  @media (max-width: 720px) {
    font-size: 11px;
    letter-spacing: 1px;
    text-align: center;
  }
`;

/* ── IMAGE FRAME ── */
const ImageFrame = styled.div`
  position: relative;
  border-radius: 20px; padding: 10px;
  background: linear-gradient(135deg, rgba(139,90,43,.5) 0%, rgba(80,40,10,.6) 100%);
  border: 1px solid rgba(251,196,23,.25);
  box-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,220,150,.15);
  width: min(400px, 88vw);
  height: min(260px, 40vw);
  display: flex; align-items: center; justify-content: center;
`;
const FrameBg = styled.div`
  position: absolute; inset: 10px; border-radius: 12px;
  background: #fffacd; z-index: 0;
`;
const GameImage = styled.img`
  position: relative; z-index: 1;
  max-width: 100%; max-height: 100%;
  border-radius: 12px; object-fit: contain;
`;
const NoImage = styled.span`position: relative; z-index: 1; color: #9ca3af; font-style: italic; font-size: 14px;`;

/* Spinner for loading */
const LoadingDots = styled.div`position: relative; z-index: 1; display: flex; gap: 6px; align-items: center;`;
const LoadDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%; background: #c24010;
  animation: ${dotLoad} 1.2s ease-in-out infinite;
  animation-delay: ${({ $d }) => $d || "0s"};
`;

/* Canvas corner ornaments */
const Corner = styled.div`
  position: absolute; width: 18px; height: 18px;
  border-color: rgba(251,196,23,.55); border-style: solid; z-index: 2; pointer-events: none;
  ${({ $pos }) => {
    switch ($pos) {
      case "tl": return css`top:6px;left:6px;border-width:2px 0 0 2px;border-radius:4px 0 0 0;`;
      case "tr": return css`top:6px;right:6px;border-width:2px 2px 0 0;border-radius:0 4px 0 0;`;
      case "bl": return css`bottom:6px;left:6px;border-width:0 0 2px 2px;border-radius:0 0 0 4px;`;
      case "br": return css`bottom:6px;right:6px;border-width:0 2px 2px 0;border-radius:0 0 4px 0;`;
      default: return "";
    }
  }}
`;

/* ── ANSWER ROW ── */
const AnswerRow = styled.div`
  width: min(445px, 90vw);
  min-height: 64px;
  border-bottom: 3px solid ${({ $wrong }) => $wrong ? "#ef4444" : "rgba(251,196,23,.5)"};
  display: flex; align-items: center; justify-content: center;
  padding: 0 12px;
  transition: border-color .2s;
  ${({ $wrong }) => $wrong && css`animation: ${shake} .4s ease;`}
`;
const AnswerText        = styled.span`font-size: 2.8rem; font-weight: 900; color: #fff; letter-spacing: 7px;`;
const AnswerPlaceholder = styled.span`font-size: 14px; color: rgba(255,248,231,.4); font-style: italic;`;

/* ── TILES ── */
const TilesPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: min(400px, 88vw);
  padding: 14px;
  background: rgba(0,0,0,.22);
  border: 1px solid rgba(251,196,23,.15);
  border-radius: 18px;
  backdrop-filter: blur(8px);
`;
const Tile = styled.div`
  height: 65px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; cursor: pointer;
  background: rgba(255,255,255,.92);
  border: 1.5px solid rgba(251,196,23,.3);
  color: #3d1a06;
  transition: transform .15s, box-shadow .15s, background .15s;
  animation: ${tileIn} .3s ease both;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  ${({ $vibrate }) => $vibrate && css`animation: ${vibrate} .3s ease;`}
  &:hover { background: #fff; transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
  &:active { transform: scale(.95); }
`;

/* ── ACTION BUTTONS ── */
const GameActions = styled.div`
  display: flex; gap: 10px;
  width: min(445px, 90vw); justify-content: center;
`;

const ActionBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 12px 16px; border-radius: 12px;
  font-family: 'Georgia', serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: transform .15s, filter .15s, box-shadow .15s;
  flex: 1;
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

/* ── MODALS ── */
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
  animation: ${ringPop} .4s ease;
`;
const ExitModal    = styled(GameOverModal)``;
const ModalOrb     = styled.div`font-size: 40px; margin-bottom: 8px; filter: drop-shadow(0 4px 8px rgba(0,0,0,.4));`;
const ModalTitle   = styled.h2`font-family:'Georgia',serif;font-size:1.5rem;font-weight:900;margin:0 0 20px;color:#fde68a;letter-spacing:.3px;`;
const ModalSubtext = styled.p`font-family:sans-serif;font-size:13px;color:rgba(255,255,255,.5);margin:-12px 0 20px;`;
const ModalStats   = styled.div`
  display:flex;justify-content:center;align-items:center;gap:20px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  border-radius:14px;padding:16px 24px;margin-bottom:24px;
`;
const ModalStat      = styled.div`display:flex;flex-direction:column;gap:4px;align-items:center;`;
const ModalStatLabel = styled.div`font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.5);`;
const ModalStatVal   = styled.div`font-family:'Georgia',serif;font-size:22px;font-weight:900;color:${({ $gold }) => $gold ? "#fbc417" : "#fff4df"};`;
const ModalDivider   = styled.div`width:1px;height:40px;background:rgba(255,255,255,.1);`;
const ModalActions   = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const ModalBtn = styled.button`
  flex:1;min-width:120px;padding:11px 18px;border-radius:12px;
  font-family:'Georgia',serif;font-size:14px;font-weight:700;
  cursor:pointer;transition:transform .15s,filter .15s;border:none;
  &:hover { transform:translateY(-2px);filter:brightness(1.08); }
  &:active { transform:translateY(1px); }
  ${({ $variant }) => {
    if ($variant === "amber") return css`background:linear-gradient(135deg,#f59e0b,#d97706);color:#3d2401;`;
    if ($variant === "green") return css`background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;`;
    if ($variant === "red")   return css`background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;`;
    return css`background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;`;
  }}
`;