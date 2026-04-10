import React, { useRef, useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import confetti from "canvas-confetti";
import useWriteSubmission from "../../../Hooks/GameHooks/useWriteSubmission.js";

import write1 from "../../../Assests/write1.png";
import write2 from "../../../Assests/write2.png";
import back from "../../../Assests/back.png";


const FALLBACK_CHARACTERS = {
  easy: ["A", "E", "I", "O", "U"],
  medium: ["A", "E", "I", "O", "U", "BA", "KA", "DA", "GA", "HA"],
  hard: ["LA", "GA", "MA", "HA"],
  expert: ["O/U", "PA", "SA"],
  master: ["NGA", "YA", "TA"],
};

const TUTORIAL_CAPTIONS = {
  intro: "Hello there. I am your Baybayin teacher. Today we will practice a, ba, and ka, then play round one.",
  this_is_a: "This is a.",
  show_a: "Look closely at the shape of a.",
  trace_a: "Now, trace the Baybayin character a.",
  this_is_ba: "This is ba. One sound: bah.",
  show_ba: "Look closely at the shape of ba.",
  trace_ba: "Now, trace the Baybayin character ba.",
  this_is_ka: "This is ka, pronounced as one sound: ka.",
  show_ka: "Look closely at the shape of ka.",
  trace_ka: "Now, trace the Baybayin character ka.",
  ready_to_play: "Excellent work. Round one starts now. Write the Baybayin equivalent of the letter I show you.",
};

const TUTORIAL_TRACE_PATHS = {
  a: "M28 62 C44 43, 72 41, 95 54 C106 61, 114 70, 120 80 M60 90 L124 38 M58 114 L128 62 M118 78 C109 111, 111 148, 125 170 C133 181, 148 186, 165 183 C186 179, 201 163, 210 140 C223 108, 236 76, 263 48 C279 31, 297 20, 320 14",
  ba: "M150 116 C125 148, 89 173, 59 165 C32 158, 28 119, 47 88 C72 47, 124 28, 175 38 C223 47, 259 82, 262 115 C266 148, 241 176, 203 182 C177 186, 159 180, 151 166 C146 156, 146 139, 150 116",
  ka: "M36 68 C84 26, 156 20, 220 44 C258 58, 286 62, 306 50 M160 34 C160 94, 160 120, 160 144 M36 176 C90 140, 162 132, 226 152 C262 164, 287 167, 306 156",
};

const LEVEL_SEQUENCE = ["Easy", "Medium", "Hard", "Expert", "Master"];

const normalizeLevel = (levelName) => String(levelName || "").trim().toLowerCase();

const WriteModeV2 = () => {
  const GAME_DURATION_SECONDS = 30;

  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { submitWriteResult } = useWriteSubmission();

  // Prevent duplicate submits and stale async side effects
  const submitLockRef = useRef(false);
  const requestAbortRef = useRef(null);
  const nextRoundTimerRef = useRef(null);
  const wrongFlashTimerRef = useRef(null);

  // ========== TUTORIAL STATES ==========
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialPhase, setTutorialPhase] = useState("intro"); // intro, a_show, a_trace, ba_show, ba_trace, ka_show, ka_trace
  const [typedCaption, setTypedCaption] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(TUTORIAL_CAPTIONS.intro);


  const [isDrawing, setIsDrawing] = useState(false);
  const [level, setLevel] = useState("Easy");
  const [roundNumber, setRoundNumber] = useState(1);

  const [score, setScore] = useState(100);
  const [time, setTime] = useState(GAME_DURATION_SECONDS);
  const [gameOver, setGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [targetLetter, setTargetLetter] = useState("A");
  const [targetKey, setTargetKey] = useState("A");
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // WRONG ANIMATION STATES
  const [flash, setFlash] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;

  const isTutorialTracePhase = tutorialPhase === "a_trace" || tutorialPhase === "ba_trace" || tutorialPhase === "ka_trace";
  const isTutorialShowPhase = tutorialPhase === "a_show" || tutorialPhase === "ba_show" || tutorialPhase === "ka_show";
  const currentTutorialCharacter = tutorialPhase.startsWith("a_")
    ? "a"
    : tutorialPhase.startsWith("ba_")
      ? "ba"
      : tutorialPhase.startsWith("ka_")
        ? "ka"
        : null;

  const tutorialPhases = ["intro", "a_show", "a_trace", "ba_show", "ba_trace", "ka_show", "ka_trace"];
  const tutorialStepIndex = Math.max(0, tutorialPhases.indexOf(tutorialPhase));

  const getNextLevel = (currentLevel) => {
    const idx = LEVEL_SEQUENCE.findIndex((levelName) => normalizeLevel(levelName) === normalizeLevel(currentLevel));
    if (idx === -1 || idx === LEVEL_SEQUENCE.length - 1) return null;
    return LEVEL_SEQUENCE[idx + 1];
  };

  const levelToRound = (lvl) => {
    const normalizedLevel = normalizeLevel(lvl);
    if (normalizedLevel === "expert") return 3;
    if (normalizedLevel === "master") return 4;
    return 1; // easy/medium/hard use standard round
  };

  const drawCanvasBase = ({ mode = "none" } = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === "none" || !currentTutorialCharacter) return;

    const pathData = TUTORIAL_TRACE_PATHS[currentTutorialCharacter];
    if (!pathData) return;

    const path = new Path2D(pathData);

    ctx.save();
    const viewBoxWidth = 320;
    const viewBoxHeight = 220;
    const targetWidth = 430;
    const targetHeight = 250;
    const scale = Math.min(targetWidth / viewBoxWidth, targetHeight / viewBoxHeight);
    const drawWidth = viewBoxWidth * scale;
    const drawHeight = viewBoxHeight * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    if (mode === "trace") {
      ctx.strokeStyle = "rgba(62, 45, 25, 0.42)";
      ctx.lineWidth = 7;
      ctx.setLineDash([8, 10]);
    } else {
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 8;
      ctx.setLineDash([]);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(path);
    ctx.restore();
  };

  const advanceTutorial = () => {
    if (tutorialPhase === "intro") {
      setTutorialPhase("a_show");
      setCurrentCaption(TUTORIAL_CAPTIONS.this_is_a);
    } else if (tutorialPhase === "a_show") {
      setTutorialPhase("a_trace");
      setCurrentCaption(TUTORIAL_CAPTIONS.trace_a);
    } else if (tutorialPhase === "a_trace") {
      setTutorialPhase("ba_show");
      setCurrentCaption(TUTORIAL_CAPTIONS.this_is_ba);
    } else if (tutorialPhase === "ba_show") {
      setTutorialPhase("ba_trace");
      setCurrentCaption(TUTORIAL_CAPTIONS.trace_ba);
    } else if (tutorialPhase === "ba_trace") {
      setTutorialPhase("ka_show");
      setCurrentCaption(TUTORIAL_CAPTIONS.this_is_ka);
    } else if (tutorialPhase === "ka_show") {
      setTutorialPhase("ka_trace");
      setCurrentCaption(TUTORIAL_CAPTIONS.trace_ka);
    } else if (tutorialPhase === "ka_trace") {
      setCurrentCaption(TUTORIAL_CAPTIONS.ready_to_play);
      startCountdownToGame();
    }
  };

  const startCountdownToGame = () => {
    setIsCountdownActive(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (!isCountdownActive || countdown == null) return;

    if (countdown === 0) {
      setIsCountdownActive(false);
      setCountdown(null);
      setShowTutorial(false);
      getRandomCharacter("Easy");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 900);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountdownActive, countdown]);

  useEffect(() => {
    if (!showTutorial || isCountdownActive) {
      setTypedCaption("");
      return;
    }

    let index = 0;
    setTypedCaption("");
    const text = currentCaption;
    if (!text) return;
    const timer = setInterval(() => {
      index += 1;
      setTypedCaption(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, 28);

    return () => clearInterval(timer);
  }, [showTutorial, currentCaption, isCountdownActive]);

  useEffect(() => {
    const preventScroll = (e) => {
      if (isDrawing) e.preventDefault();
    };

    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [isDrawing]);

  useEffect(() => {
    return () => {
      if (nextRoundTimerRef.current) {
        clearTimeout(nextRoundTimerRef.current);
        nextRoundTimerRef.current = null;
      }
      if (wrongFlashTimerRef.current) {
        clearTimeout(wrongFlashTimerRef.current);
        wrongFlashTimerRef.current = null;
      }
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
        requestAbortRef.current = null;
      }
    };
  }, []);

  // ---------------- Canvas Setup ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");

    const tutorialCanvasMode = isTutorialTracePhase ? "trace" : isTutorialShowPhase ? "show" : "none";
    drawCanvasBase({ mode: showTutorial ? tutorialCanvasMode : "none" });

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3e2d19";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, isTutorialTracePhase, isTutorialShowPhase, currentTutorialCharacter]);

  useEffect(() => {
    if (showTutorial && (isTutorialTracePhase || isTutorialShowPhase)) {
      drawCanvasBase({ mode: isTutorialTracePhase ? "trace" : "show" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, isTutorialTracePhase, isTutorialShowPhase, currentTutorialCharacter]);

  // ---------------- Timer ----------------
  useEffect(() => {
    if (showTutorial || gameOver) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTutorial, gameOver]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    return { x, y };
  };

  const startDrawing = (e) => {
    if (gameOver) return;

    setIsDrawing(true);

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasCoords(e);

    ctx.strokeStyle = "#3e2d19";
    ctx.lineWidth = 18; // Make the drawing bolder
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || gameOver) return;

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasCoords(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (gameOver) return;

    if (showTutorial) {
      drawCanvasBase({ mode: isTutorialTracePhase ? "trace" : isTutorialShowPhase ? "show" : "none" });
    } else {
      drawCanvasBase({ mode: "none" });
    }

    setPrediction("");
  };

  const getRandomCharacter = async (difficultyLevel = level, forcedRound = roundNumber) => {
    const applyCharacter = (key) => {
      setTargetKey(key);
      const display = key.includes("_") ? key.replace(/_/g, "/") : key;
      setTargetLetter(display);
    };

    try {
      const url = `http://localhost:5000/get_random_character?difficulty=${difficultyLevel.toLowerCase()}`;
      console.log('[API CALL] GET', url);
      const response = await fetch(url);

      const data = await response.json();
      console.log('[API RESULT] get_random_character:', data);

      if (data.success) {
        applyCharacter(data.character);
      }
    } catch (e) {
      console.warn("Localhost unavailable, using local character bank:", e);
      const pool = FALLBACK_CHARACTERS[difficultyLevel.toLowerCase()] || FALLBACK_CHARACTERS.easy;
      const key = pool[Math.floor(Math.random() * pool.length)];
      applyCharacter(key);
    }
  };

  const handleSubmit = async () => {
    if (showTutorial || gameOver || isLoading || submitLockRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let hasStroke = false;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      if (r < 200 || g < 200 || b < 200) {
        hasStroke = true;
        break;
      }
    }

    if (!hasStroke) return;

    submitLockRef.current = true;
    setIsLoading(true);

    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }

    if (wrongFlashTimerRef.current) {
      clearTimeout(wrongFlashTimerRef.current);
      wrongFlashTimerRef.current = null;
    }

    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
      requestAbortRef.current = null;
    }

    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      // ---- KNN preprocessing: crop → center → resize → binarize ----
      // KNN compares raw pixel distances, so the image must match training
      // data (rotatedwhite images): pure black strokes on pure white background.
      const srcCanvas = canvasRef.current;
      const srcCtx = srcCanvas.getContext("2d");
      const { width: sw, height: sh } = srcCanvas;
      const pixels = srcCtx.getImageData(0, 0, sw, sh).data;

      // Step 1: Find bounding box of non-white pixels (threshold 200)
      let minX = sw, minY = sh, maxX = 0, maxY = 0;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = (y * sw + x) * 4;
          // Convert to grayscale brightness
          const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
          if (gray < 200) { // non-white = stroke pixel
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const hasStrokeBox = maxX > minX && maxY > minY;

      // Step 2: Pad bounding box by 15% of the larger dimension
      const bboxSize = Math.max(maxX - minX, maxY - minY);
      const pad = Math.round(bboxSize * 0.15 + 6);
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(sw, maxX + pad + 1) - cropX;
      const cropH = Math.min(sh, maxY + pad + 1) - cropY;

      // Step 3: Resize the cropped region into a square canvas
      const OUT = 96;
      const offscreen = document.createElement("canvas");
      offscreen.width = OUT;
      offscreen.height = OUT;
      const offCtx = offscreen.getContext("2d");
      offCtx.fillStyle = "#ffffff";
      offCtx.fillRect(0, 0, OUT, OUT);

      if (hasStrokeBox) {
        // Scale to fill 80% of the output with equal margins (matches training layout)
        const scale = Math.min(OUT / cropW, OUT / cropH) * 0.80;
        const dw = cropW * scale;
        const dh = cropH * scale;
        const dx = (OUT - dw) / 2;
        const dy = (OUT - dh) / 2;
        offCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
      }

      // Step 4: Binarize — force every pixel to pure black or pure white.
      // KNN uses pixel-distance: anti-aliased grey strokes will not match
      // the clean binary training images (rotatedwhite*).
      const imgPixels = offCtx.getImageData(0, 0, OUT, OUT);
      const d = imgPixels.data;
      const THRESHOLD = 180; // pixels darker than this become pure black
      for (let i = 0; i < d.length; i += 4) {
        const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
        const val = gray < THRESHOLD ? 0 : 255;
        d[i] = val; d[i + 1] = val; d[i + 2] = val; d[i + 3] = 255;
      }
      offCtx.putImageData(imgPixels, 0, 0);

      const imageData = offscreen.toDataURL("image/png");
      console.log('[IMAGE] Sending: 96x96 binary PNG, crop+center+binarize, hasStroke:', hasStrokeBox,
        'bbox:', { cropX, cropY, cropW, cropH }, 'dataLen:', imageData.length);
      const sendTarget = targetKey.toLowerCase().replace(/_/g, "/");

      const tryFallbackApi = async () => {
        const base64 = imageData.split(",")[1];
        const byteChars = atob(base64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: "image/png" });

        const formData = new FormData();
        formData.append("baybayin_photo", blob, "drawing.png");

        console.log('[API CALL] POST /heroku-proxy/check_image/', { target: sendTarget });
        const fallbackRes = await fetch("/heroku-proxy/check_image/", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        const fallbackText = await fallbackRes.text();
        console.log('[API RESULT] heroku-proxy/check_image raw:', fallbackText);
        let predicted;
        try {
          predicted = JSON.parse(fallbackText);
        } catch {
          predicted = fallbackText.trim().replace(/"/g, "");
        }

        const is_correct = predicted.toLowerCase() === sendTarget.toLowerCase();
        return {
          success: true,
          prediction: { predicted, is_correct, confidence: null },
        };
      };

      let data = null;

      try {
        console.log('[API CALL] POST http://localhost:5000/submit_drawing', { target_character: sendTarget, difficulty: level.toLowerCase(), round: roundNumber });
        const response = await fetch("http://localhost:5000/submit_drawing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            image: imageData,
            target_character: sendTarget,
            difficulty: level.toLowerCase(),
            round: roundNumber,
          }),
        });

        data = await response.json();
        console.log('[API RESULT] submit_drawing:', data);

        // If primary API failed to predict, fall back to Heroku API
        if (!data.success || data.prediction?.retry_message) {
          data = await tryFallbackApi();
        }
      } catch (primaryErr) {
        if (primaryErr.name === "AbortError") throw primaryErr;
        console.warn("Primary API failed, trying fallback:", primaryErr);
        data = await tryFallbackApi();
      }

      if (data.success) {
        const pred = data.prediction;
        console.log('[UI] prediction payload:', pred);
        setPrediction(pred);

        // Persist each evaluated drawing result without blocking gameplay.
        try {
          await submitWriteResult({
            targetCharacter: sendTarget,
            predictedCharacter: pred?.predicted || "",
            isCorrect: !!pred?.is_correct,
            confidence: pred?.confidence,
            imageBase64: imageData,
          });
        } catch (saveError) {
          console.warn("Write submission save failed:", saveError);
        }

        if (pred.is_correct) {
          setScore((sc) => sc + 1);

          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
          });

          nextRoundTimerRef.current = setTimeout(() => {
            getRandomCharacter(level);
            handleClear();
            nextRoundTimerRef.current = null;
          }, 3000);
        } else if (!pred.retry_message) {
          setFlash(true);
          setIsWrong(true);

          wrongFlashTimerRef.current = setTimeout(() => {
            setFlash(false);
            setIsWrong(false);
            handleClear();
            wrongFlashTimerRef.current = null;
          }, 600);
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setPrediction({ retry_message: "Network error" });
      }
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
      requestAbortRef.current = null;
    }
  };

  const handleSkip = () => {
    if (showTutorial || gameOver) return;

    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }

    if (wrongFlashTimerRef.current) {
      clearTimeout(wrongFlashTimerRef.current);
      wrongFlashTimerRef.current = null;
    }

    getRandomCharacter(level, roundNumber);
    handleClear();
  };

  const handleBackClick = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = (confirm) => {
    setShowExitConfirm(false);

    if (confirm) navigate("/homegame");
  };

  const resetRound = (levelToStart = level) => {
    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }

    if (wrongFlashTimerRef.current) {
      clearTimeout(wrongFlashTimerRef.current);
      wrongFlashTimerRef.current = null;
    }

    setPrediction("");
    handleClear();

    setLevel(levelToStart);
    setRoundNumber(levelToRound(levelToStart));
    setScore(0);
    setTime(GAME_DURATION_SECONDS);
    setGameOver(false);

    getRandomCharacter(levelToStart, levelToRound(levelToStart));
  };

  const handleRestart = () => {
    resetRound(level);
  };

  const handleNextRound = () => {
    const nextLevel = getNextLevel(level);
    if (!nextLevel) return;
    resetRound(nextLevel);
  };

  const tutorialPrimaryButtonLabel =
    tutorialPhase === "ka_trace"
      ? "Done & Start Game"
      : isTutorialTracePhase
        ? "Done"
        : "Next";

  const showTutorialActionButton = showTutorial && !isCountdownActive;

  const nextLevel = getNextLevel(level);

  return (
    <>
      <Container
        style={{
          background: flash
            ? "linear-gradient(135deg,#7f1d1d,#b91c1c)"
            : "linear-gradient(135deg,#c2410c,#ea580c)",
        }}
      >
        {flash && <div style={styles.damageOverlay} />}

        <Header>
          <BackIcon src={back} onClick={handleBackClick} />

          <TopInfo>
            {showTutorial ? (
              <InfoLine $tutorial={showTutorial}>Tutorial Mode</InfoLine>
            ) : (
              <>
                <InfoLine>Score: {score}</InfoLine>
                <InfoLine>Time: {String(time).padStart(2, "0")}</InfoLine>
                <InfoLine>Difficulty: {level}</InfoLine>
              </>
            )}
          </TopInfo>
        </Header>

        <Instruction $center={showTutorial} $gameLine={!showTutorial} $tutorial={showTutorial}>
          {showTutorial ? (
            "Listen, watch, and trace"
          ) : (
            <>
              <GamePromptLabel>Write the Baybayin equivalent for:</GamePromptLabel>{" "}
              <GamePromptTarget>{targetLetter}</GamePromptTarget>
            </>
          )}
        </Instruction>

        {showTutorial && !isCountdownActive && (
          <CenterCaptionPanel $withVisual={tutorialPhase !== "intro"}>
            <TypingCaption>{typedCaption}</TypingCaption>
            <StepDots>
              {tutorialPhases.map((phase, idx) => (
                <StepDot key={phase} $active={idx <= tutorialStepIndex} />
              ))}
            </StepDots>
          </CenterCaptionPanel>
        )}

        {isCountdownActive && (
          <CountdownOverlay>
            <CountdownBolt $left>⚡</CountdownBolt>
            <CountdownLabel>Round 1 starts in</CountdownLabel>
            <CountdownNumber>{countdown}</CountdownNumber>
            <CountdownBolt>⚡</CountdownBolt>
          </CountdownOverlay>
        )}

        <LeftSideImage src={write1} />
        <RightSideImage src={write2} />

        {showTutorial ? (
          <TutorialActionWrapper $withVisual={tutorialPhase !== "intro"}>
            {isTutorialTracePhase && (
              <CustomButton
                label="Clear Trace"
                onClick={handleClear}
                width="170px"
              />
            )}
            {showTutorialActionButton && (
              <CustomButton
                label={tutorialPrimaryButtonLabel}
                onClick={() => {
                  if (isTutorialTracePhase) handleClear();
                  advanceTutorial();
                }}
                width={isTutorialTracePhase ? "200px" : "230px"}
                disabled={isCountdownActive}
              />
            )}
          </TutorialActionWrapper>
        ) : null}

        {!showTutorial && (
          <GameActionWrapper>
            <CustomButton
              label={isLoading ? "Submitting..." : "Submit"}
              onClick={handleSubmit}
              width="210px"
              disabled={isLoading}
            />
            <CustomButton
              label="Clear"
              onClick={handleClear}
              width="210px"
            />
            <CustomButton label="Skip" onClick={handleSkip} width="210px" />
          </GameActionWrapper>
        )}

        {((showTutorial && tutorialPhase !== "intro") || !showTutorial) && (
          <CanvasBorder style={!showTutorial && isWrong ? styles.shake : {}}>
            <Canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </CanvasBorder>
        )}

        {!showTutorial && prediction && (
          <Result>
            {prediction.retry_message ? (
              prediction.retry_message
            ) : (
              <>ML Predicted: {prediction.predicted.toUpperCase()} ({Math.round((prediction.confidence || 0) * 100)}%){prediction.model_used ? ` • Model: ${prediction.model_used}` : ""}</>
            )}
          </Result>
        )}
      </Container>

      {gameOver && (
        <Overlay>
          <Modal>
            <h2>⏳ Time's Up!</h2>
            <p>Difficulty: {level}</p>
            <p>Final Score: {score}</p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginTop: "18px",
                flexWrap: "wrap",
              }}
            >
              <CustomButton
                label="Restart"
                onClick={handleRestart}
                width="180px"
                color="#ffb300"
              />
              <CustomButton
                label={nextLevel ? `Next Round (${nextLevel})` : "Next Round"
                }
                onClick={handleNextRound}
                width="200px"
                color="#22c55e"
                disabled={!nextLevel}
              />
            </div>
          </Modal>
        </Overlay>
      )}

      {showExitConfirm && (
        <Overlay>
          <Modal>
            <h3>Exit the Writing Game?</h3>

            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <CustomButton label="YES" onClick={() => confirmExit(true)} width="120px" color="red" />
              <CustomButton label="NO" onClick={() => confirmExit(false)} width="120px" color="green" />
            </div>
          </Modal>
        </Overlay>
      )}
    </>
  );
};

export default WriteModeV2;

/* ---------------- Animation Styles ---------------- */

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
`;

const floatIn = keyframes`
  0% { transform: translate(-50%, -46%); opacity: 0; }
  100% { transform: translate(-50%, -50%); opacity: 1; }
`;

const lightningFlash = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.92) rotate(-8deg); }
  50% { opacity: 1; transform: scale(1.08) rotate(0deg); }
`;

const styles = {
  shake: {
    animation: "shake 0.4s",
  },

  damageOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(220, 38, 38, 0.35)",
    backdropFilter: "blur(2px)",
    pointerEvents: "none",
    zIndex: 999,
    animation: "screenShake 0.8s ease",
  },
};

/* ---------------- Styled Components ---------------- */

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #c2410c, #ea580c);
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
  color: white;
`;

const Header = styled.div`
  width: 100%;
  height: 70px;
  position: relative;
  padding-top: 10px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: white;
  padding: 40px 50px;
  border-radius: 18px;
  color: #333;
  border: 2px solid #ddd;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
`;

const BackIcon = styled.img`
  position: absolute;
  top: -40%;
  left: -5%;
  width: 350px;
  cursor: pointer;
  z-index: 999;
  transition: transform 0.3s;

  &:hover {
    transform: scale(0.9);
  }
`;

const TopInfo = styled.div`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  display: flex;
  gap: 80px;
`;

const InfoLine = styled.div`
  font-size: 25px;
  font-weight: 800;
  ${({ $tutorial }) =>
    $tutorial && css`
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.4px;
      opacity: 0.92;
    `}
`;

const Instruction = styled.div`
  margin-top: 30px;
  font-size: 15px;
  font-weight: 590;
  position: relative;
  ${({ $tutorial }) =>
    $tutorial && css`
      width: fit-content;
      margin: 18px auto 0;
      padding: 8px 18px;
      font-size: 30px;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.65);
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.12);
      letter-spacing: 0.2px;
    `}
  ${({ $gameLine }) =>
    $gameLine && css`
      margin-top: 18px;
      font-size: 22px;
      white-space: nowrap;
      text-align: center;
    `}
  ${({ $center }) =>
    $center
      ? css`
          left: 0;
          text-align: center;
        `
      : css`
          left: 0%;
        `}
`;

const GamePromptLabel = styled.span`
  font-size: 22px;
  font-weight: 600;
  color: #fff7ed;
`;

const GamePromptTarget = styled.span`
  font-size: 40px;
  font-weight: 900;
  color: #fef08a;
  letter-spacing: 0.5px;
`;

const CenterCaptionPanel = styled.div`
  position: absolute;
  left: 50%;
  top: ${({ $withVisual }) => ($withVisual ? "73%" : "50%")};
  transform: translate(-50%, -50%);
  width: min(86vw, 700px);
  text-align: center;
  z-index: 80;
  animation: ${floatIn} 0.45s ease-out;
`;

const TypingCaption = styled.div`
  margin: 0 auto;
  width: min(86vw, 880px);
  max-width: 100%;
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(120deg, rgba(0, 0, 0, 0.28), rgba(255, 255, 255, 0.16));
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.35;
  white-space: pre-wrap;
  box-shadow: 0 8px 20px (0, 0, 0, 0.22);
`;

const StepDots = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const StepDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#fde68a" : "rgba(255,255,255,0.35)")};
  box-shadow: ${({ $active }) => ($active ? "0 0 12px rgba(253, 230, 138, 0.7)" : "none")};
`;

const TutorialActionWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: ${({ $withVisual }) => ($withVisual ? "84%" : "calc(55% + 70px)")};
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  justify-content: center;
  z-index: 85;
`;

const GameActionWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: calc(25% + 544px);
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  justify-content: center;
  z-index: 85;
`;

const CountdownOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 120;
`;

const CountdownLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 14px;
`;

const CountdownNumber = styled.div`
  font-size: 6rem;
  font-weight: 800;
  color: #fde68a;
  ${({ children }) => children && css`animation: ${pulse} 0.9s ease-in-out;`}
`;

const CountdownBolt = styled.div`
  position: absolute;
  ${({ $left }) => ($left ? "left: 40%;" : "right: 40%;")}
  top: 56%;
  font-size: 2.2rem;
  color: #fde047;
  filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.9));
  animation: ${lightningFlash} 0.45s ease-in-out infinite;
  animation-delay: ${({ $left }) => ($left ? "0s" : "0.2s")};
  pointer-events: none;
`;

const LeftSideImage = styled.img`
  position: absolute;
  top: 0%;
  left: 0%;
  width: 339px;
`;

const RightSideImage = styled.img`
  position: absolute;
  top: 0%;
  right: 0%;
  width: 339px;
`;

const CanvasBorder = styled.div`
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px;
  border-radius: 20px;
`;

const Canvas = styled.canvas`
  position: relative;
  top: 0px;
  left: 0px;
  width: 500px;
  height: 500px;
  background: #ffffff;
  border-radius: 20px;
  cursor: crosshair;

  touch-action: none;
`;

const Result = styled.p`
  position: absolute;
  top: calc(33% + 374px + 12px);
  left: 50%;
  transform: translateX(-50%);
  color: #fff3e7;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.18);
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.08);
`;