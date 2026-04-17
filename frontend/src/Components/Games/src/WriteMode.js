import React, { useRef, useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import useWriteSubmission from "../../../Hooks/GameHooks/useWriteSubmission.js";
import useInsertLeaderboard from "../../../Hooks/GameHooks/useInsertLeaderboard.js";
import useUpdateLeaderboard from "../../../Hooks/GameHooks/useUpdateLeaderboard.js";

import write1 from "../../../Assests/write1.png";
import write2 from "../../../Assests/write2.png";
import back from "../../../Assests/back.png";
import preGameMusic from "../../../Assests/drag.mp3";
import dragMusic from "../../../Assests/Tap.mp3";
import stoneClick from "../../../Assests/stone.mp3";
import baybayinA from "../../../Assests/baybayin_a.png";
import baybayinBa from "../../../Assests/baybayin_ba.png";
import baybayinNa from "../../../Assests/baybayin_na.png";
import baybayinKa from "../../../Assests/baybayin_ka.png";
import baybayinEi from "../../../Assests/baybayin_ei.png";
import baybayinNga from "../../../Assests/baybayin_nga.png";
import baybayinWa from "../../../Assests/baybayin_wa.png";
import baybayinPa from "../../../Assests/baybayin_pa.png";
import baybayinGa from "../../../Assests/baybayin_ga.png";
import baybayinHa from "../../../Assests/baybayin_ha.png";
import baybayinMa from "../../../Assests/baybayin_ma.png";
import baybayinDa from "../../../Assests/baybayin_da.png";
import baybayinTa from "../../../Assests/baybayin_ta.png";
import baybayinSa from "../../../Assests/baybayin_sa.png";
import baybayinYa from "../../../Assests/baybayin_ya.png";
import baybayinOu from "../../../Assests/baybayin_ou.png";
import baybayinLa from "../../../Assests/baybayin_la.png";

/* ─────────────────────── CONSTANTS ─────────────────────── */

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

const ROUND_HINT_KEYS = {
  easy: ["a", "ba", "na", "ka"],
  medium: ["e/i", "nga", "wa"],
  hard: ["pa", "ga", "ha"],
  expert: ["ma", "da", "ta", "sa"],
  master: ["ya", "o/u", "la"],
};

const HINT_IMAGE_BY_KEY = {
  a: baybayinA,
  ba: baybayinBa,
  na: baybayinNa,
  ka: baybayinKa,
  "e/i": baybayinEi,
  nga: baybayinNga,
  wa: baybayinWa,
  pa: baybayinPa,
  ga: baybayinGa,
  ha: baybayinHa,
  ma: baybayinMa,
  da: baybayinDa,
  ta: baybayinTa,
  sa: baybayinSa,
  ya: baybayinYa,
  "o/u": baybayinOu,
  la: baybayinLa,
};

const normalizeLevel = (levelName) => String(levelName || "").trim().toLowerCase();

const getRoundHintKeys = (levelName) => ROUND_HINT_KEYS[normalizeLevel(levelName)] || ROUND_HINT_KEYS.easy;

/* ─────────────────────── COMPONENT ─────────────────────── */

const WriteModeV2 = () => {
  const GAME_DURATION_SECONDS = 30;

  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { submitWriteResult } = useWriteSubmission();
  const { insertScore } = useInsertLeaderboard();
  const { updateScore } = useUpdateLeaderboard();

  const submitLockRef = useRef(false);
  const requestAbortRef = useRef(null);
  const nextRoundTimerRef = useRef(null);
  const wrongFlashTimerRef = useRef(null);
  const leaderboardSaveLockRef = useRef(false);
  const playedLevelsRef = useRef(new Set());
  const audioCtxRef = useRef(null);
  const preGameMusicRef = useRef(null);
  const bgMusicRef = useRef(null);
  const stoneClickRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialPhase, setTutorialPhase] = useState("intro");
  const [typedCaption, setTypedCaption] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(TUTORIAL_CAPTIONS.intro);

  const [isDrawing, setIsDrawing] = useState(false);
  const [level, setLevel] = useState("Easy");
  const [roundNumber, setRoundNumber] = useState(1);

  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_DURATION_SECONDS);
  const [gameOver, setGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [targetLetter, setTargetLetter] = useState("A");
  const [targetKey, setTargetKey] = useState("A");
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [flash, setFlash] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrectAnim, setIsCorrectAnim] = useState(false);

  const CANVAS_WIDTH = 440;
  const CANVAS_HEIGHT = 440;

  const isTutorialTracePhase = tutorialPhase === "a_trace" || tutorialPhase === "ba_trace" || tutorialPhase === "ka_trace";
  const isTutorialShowPhase = tutorialPhase === "a_show" || tutorialPhase === "ba_show" || tutorialPhase === "ka_show";
  const currentTutorialCharacter = tutorialPhase.startsWith("a_") ? "a" : tutorialPhase.startsWith("ba_") ? "ba" : tutorialPhase.startsWith("ka_") ? "ka" : null;

  const tutorialPhases = ["intro", "a_show", "a_trace", "ba_show", "ba_trace", "ka_show", "ka_trace"];
  const tutorialStepIndex = Math.max(0, tutorialPhases.indexOf(tutorialPhase));

  const getNextLevel = (currentLevel) => {
    const idx = LEVEL_SEQUENCE.findIndex((l) => normalizeLevel(l) === normalizeLevel(currentLevel));
    if (idx === -1 || idx === LEVEL_SEQUENCE.length - 1) return null;
    return LEVEL_SEQUENCE[idx + 1];
  };

  const levelToRound = (lvl) => {
    const n = normalizeLevel(lvl);
    if (n === "expert") return 3;
    if (n === "master") return 4;
    return 1;
  };

  /* ── Audio ── */
  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
    return audioCtxRef.current;
  };

  const playTone = (frequency, duration = 0.1, type = "sine", volume = 0.03) => {
    if (!soundEnabled) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playCorrectSound = () => {
    playTone(520, 0.1, "triangle", 0.04);
    setTimeout(() => playTone(660, 0.12, "triangle", 0.04), 85);
  };

  const playWrongSound = () => {
    playTone(210, 0.16, "sawtooth", 0.035);
    setTimeout(() => playTone(170, 0.12, "sawtooth", 0.03), 75);
  };

  const playTimeUpSound = () => {
    playTone(240, 0.2, "square", 0.035);
    setTimeout(() => playTone(180, 0.22, "square", 0.03), 140);
  };

  const playStoneClick = () => {
    if (!soundEnabled || !stoneClickRef.current) return;
    try {
      stoneClickRef.current.currentTime = 0;
      stoneClickRef.current.play().catch(() => {});
    } catch { }
  };

  /* ── Canvas ── */
  const drawCanvasBase = ({ mode = "none" } = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fdf8f0";
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
      ctx.strokeStyle = "rgba(139, 90, 43, 0.28)";
      ctx.lineWidth = 7;
      ctx.setLineDash([8, 10]);
    } else {
      ctx.strokeStyle = "#5c3d1e";
      ctx.lineWidth = 8;
      ctx.setLineDash([]);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(path);
    ctx.restore();
  };

  const advanceTutorial = () => {
    if (tutorialPhase === "intro") { setTutorialPhase("a_show"); setCurrentCaption(TUTORIAL_CAPTIONS.this_is_a); }
    else if (tutorialPhase === "a_show") { setTutorialPhase("a_trace"); setCurrentCaption(TUTORIAL_CAPTIONS.trace_a); }
    else if (tutorialPhase === "a_trace") { setTutorialPhase("ba_show"); setCurrentCaption(TUTORIAL_CAPTIONS.this_is_ba); }
    else if (tutorialPhase === "ba_show") { setTutorialPhase("ba_trace"); setCurrentCaption(TUTORIAL_CAPTIONS.trace_ba); }
    else if (tutorialPhase === "ba_trace") { setTutorialPhase("ka_show"); setCurrentCaption(TUTORIAL_CAPTIONS.this_is_ka); }
    else if (tutorialPhase === "ka_show") { setTutorialPhase("ka_trace"); setCurrentCaption(TUTORIAL_CAPTIONS.trace_ka); }
    else if (tutorialPhase === "ka_trace") { setCurrentCaption(TUTORIAL_CAPTIONS.ready_to_play); startCountdownToGame(); }
  };

  const startCountdownToGame = () => { setIsCountdownActive(true); setCountdown(3); };

  useEffect(() => {
    if (!isCountdownActive || countdown == null) return;
    if (countdown === 0) {
      setIsCountdownActive(false);
      setCountdown(null);
      setShowTutorial(false);
      getRandomCharacter("Easy");
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountdownActive, countdown]);

  useEffect(() => {
    if (!showTutorial || isCountdownActive) { setTypedCaption(""); return; }
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
    const preventScroll = (e) => { if (isDrawing) e.preventDefault(); };
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => window.removeEventListener("touchmove", preventScroll);
  }, [isDrawing]);

  useEffect(() => {
    return () => {
      if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current = null; }
      if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current = null; }
      if (requestAbortRef.current) { requestAbortRef.current.abort(); requestAbortRef.current = null; }
    };
  }, []);

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

  useEffect(() => {
    if (showTutorial || gameOver) return;
    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timer); setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showTutorial, gameOver]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (gameOver) playTimeUpSound(); }, [gameOver]);

  useEffect(() => {
    preGameMusicRef.current = new Audio(preGameMusic);
    preGameMusicRef.current.loop = true;
    preGameMusicRef.current.volume = 0.2;
    bgMusicRef.current = new Audio(dragMusic);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.2;
    stoneClickRef.current = new Audio(stoneClick);
    stoneClickRef.current.volume = 0.45;
    return () => {
      [preGameMusicRef, bgMusicRef, stoneClickRef].forEach((r) => {
        if (r.current) { r.current.pause(); r.current.currentTime = 0; }
      });
    };
  }, []);

  useEffect(() => {
    const shouldPlayPreGame = soundEnabled && showTutorial;
    const shouldPlayGame = soundEnabled && !showTutorial && !gameOver;
    if (preGameMusicRef.current) {
      if (shouldPlayPreGame) preGameMusicRef.current.play().catch(() => {});
      else preGameMusicRef.current.pause();
    }
    if (bgMusicRef.current) {
      if (shouldPlayGame) bgMusicRef.current.play().catch(() => {});
      else bgMusicRef.current.pause();
    }
  }, [soundEnabled, showTutorial, gameOver]);

  useEffect(() => { if (!gameOver) leaderboardSaveLockRef.current = false; }, [gameOver]);

  useEffect(() => {
    if (!gameOver || leaderboardSaveLockRef.current) return;
    leaderboardSaveLockRef.current = true;
    const saveScore = async () => {
      try {
        const loginData = localStorage.getItem("loginData");
        if (!loginData) return;
        const user = JSON.parse(loginData);
        const userId = user?.id;
        if (!userId) return;
        const status = normalizeLevel(level);
        const points = score;
        const hasPlayedLevelBefore = playedLevelsRef.current.has(status);
        const result = hasPlayedLevelBefore
          ? await updateScore(userId, status, points)
          : await insertScore(userId, status, points);
        if (result.success && !hasPlayedLevelBefore) playedLevelsRef.current.add(status);
      } catch (error) {
        console.error("Score save error:", error);
      }
    };
    saveScore();
  }, [gameOver, level, score, roundNumber, insertScore, updateScore]);

  /* ── Pointer helpers ── */
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e) => {
    if (gameOver) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = "#3e2d19";
    ctx.lineWidth = 18;
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

  const stopDrawing = () => setIsDrawing(false);

  const handleClear = () => {
    if (gameOver) return;
    playStoneClick();
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
      setTargetLetter(key.includes("_") ? key.replace(/_/g, "/") : key);
    };
    try {
      const url = `http://localhost:5000/get_random_character?difficulty=${difficultyLevel.toLowerCase()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) applyCharacter(data.character);
    } catch {
      const pool = FALLBACK_CHARACTERS[difficultyLevel.toLowerCase()] || FALLBACK_CHARACTERS.easy;
      applyCharacter(pool[Math.floor(Math.random() * pool.length)]);
    }
  };

  const handleSubmit = async () => {
    if (showTutorial || gameOver || isLoading || submitLockRef.current) return;
    playStoneClick();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasStroke = false;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 200 || pixels[i + 1] < 200 || pixels[i + 2] < 200) { hasStroke = true; break; }
    }
    if (!hasStroke) return;

    submitLockRef.current = true;
    setIsLoading(true);

    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current = null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current = null; }
    if (requestAbortRef.current) { requestAbortRef.current.abort(); requestAbortRef.current = null; }

    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      const srcCtx = canvas.getContext("2d");
      const { width: sw, height: sh } = canvas;
      const srcPixels = srcCtx.getImageData(0, 0, sw, sh).data;
      let minX = sw, minY = sh, maxX = 0, maxY = 0;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = (y * sw + x) * 4;
          const gray = 0.299 * srcPixels[idx] + 0.587 * srcPixels[idx + 1] + 0.114 * srcPixels[idx + 2];
          if (gray < 200) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        }
      }
      const hasStrokeBox = maxX > minX && maxY > minY;
      const bboxSize = Math.max(maxX - minX, maxY - minY);
      const pad = Math.round(bboxSize * 0.15 + 6);
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(sw, maxX + pad + 1) - cropX;
      const cropH = Math.min(sh, maxY + pad + 1) - cropY;
      const OUT = 96;
      const offscreen = document.createElement("canvas");
      offscreen.width = OUT;
      offscreen.height = OUT;
      const offCtx = offscreen.getContext("2d");
      offCtx.fillStyle = "#ffffff";
      offCtx.fillRect(0, 0, OUT, OUT);
      if (hasStrokeBox) {
        const scale = Math.min(OUT / cropW, OUT / cropH) * 0.80;
        const dw = cropW * scale, dh = cropH * scale;
        const dx = (OUT - dw) / 2, dy = (OUT - dh) / 2;
        offCtx.drawImage(canvas, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
      }
      const imgPixels = offCtx.getImageData(0, 0, OUT, OUT);
      const d = imgPixels.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
        const val = gray < 180 ? 0 : 255;
        d[i] = val; d[i + 1] = val; d[i + 2] = val; d[i + 3] = 255;
      }
      offCtx.putImageData(imgPixels, 0, 0);
      const imageData = offscreen.toDataURL("image/png");
      const sendTarget = targetKey.toLowerCase().replace(/_/g, "/");

      const tryFallbackApi = async () => {
        const base64 = imageData.split(",")[1];
        const byteChars = atob(base64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: "image/png" });
        const formData = new FormData();
        formData.append("baybayin_photo", blob, "drawing.png");
        const fallbackRes = await fetch("/heroku-proxy/check_image/", { method: "POST", body: formData, signal: controller.signal });
        const fallbackText = await fallbackRes.text();
        let predicted;
        try { predicted = JSON.parse(fallbackText); } catch { predicted = fallbackText.trim().replace(/"/g, ""); }
        return { success: true, prediction: { predicted, is_correct: predicted.toLowerCase() === sendTarget.toLowerCase(), confidence: null } };
      };

      let data = null;
      try {
        const response = await fetch("http://localhost:5000/submit_drawing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ image: imageData, target_character: sendTarget, difficulty: level.toLowerCase(), round: roundNumber }),
        });
        data = await response.json();
        if (!data.success || data.prediction?.retry_message) data = await tryFallbackApi();
      } catch (primaryErr) {
        if (primaryErr.name === "AbortError") throw primaryErr;
        data = await tryFallbackApi();
      }

      if (data.success) {
        const pred = data.prediction;
        setPrediction(pred);

        if (pred.is_correct) {
          playCorrectSound();
          setScore((sc) => sc + 1);
          setIsCorrectAnim(true);
          setTimeout(() => setIsCorrectAnim(false), 1000);
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#fbc417", "#f97316", "#fde68a", "#fff"] });
          nextRoundTimerRef.current = setTimeout(() => { getRandomCharacter(level); handleClear(); nextRoundTimerRef.current = null; }, 3000);
        } else if (!pred.retry_message) {
          playWrongSound();
          setFlash(true);
          setIsWrong(true);
          wrongFlashTimerRef.current = setTimeout(() => { setFlash(false); setIsWrong(false); handleClear(); wrongFlashTimerRef.current = null; }, 600);
        }

        // Save analytics in the background so UI feedback appears immediately.
        submitWriteResult({
          targetCharacter: sendTarget,
          predictedCharacter: pred?.predicted || "",
          isCorrect: !!pred?.is_correct,
          confidence: pred?.confidence,
          imageBase64: imageData,
        }).catch(() => {});
      }
    } catch (e) {
      if (e.name !== "AbortError") { console.error(e); setPrediction({ retry_message: "Network error" }); }
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
      requestAbortRef.current = null;
    }
  };

  const handleSkip = () => {
    if (showTutorial || gameOver) return;
    playStoneClick();
    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current = null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current = null; }
    getRandomCharacter(level, roundNumber);
    handleClear();
  };

  const handleBackClick = () => setShowExitConfirm(true);

  const confirmExit = (confirm) => {
    setShowExitConfirm(false);
    if (confirm) navigate("/homegame");
  };

  const resetRound = (levelToStart = level) => {
    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current = null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current = null; }
    setPrediction("");
    handleClear();
    setLevel(levelToStart);
    setRoundNumber(levelToRound(levelToStart));
    setScore(0);
    setTime(GAME_DURATION_SECONDS);
    setGameOver(false);
    leaderboardSaveLockRef.current = false;
    getRandomCharacter(levelToStart, levelToRound(levelToStart));
  };

  const handleRestart = () => resetRound(level);
  const handleNextRound = () => { const nextLevel = getNextLevel(level); if (nextLevel) resetRound(nextLevel); };

  const tutorialPrimaryButtonLabel = tutorialPhase === "ka_trace" ? "Done & Start Game" : isTutorialTracePhase ? "Done" : "Next";
  const showTutorialActionButton = showTutorial && !isCountdownActive;
  const nextLevel = getNextLevel(level);

  /* ── Timer ring progress ── */
  const timerProgress = time / GAME_DURATION_SECONDS;
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - timerProgress);

  const hintKeys = getRoundHintKeys(level);
  const showRoundHints =
    !showTutorial &&
    !gameOver &&
    ((time > GAME_DURATION_SECONDS - 5) || (time <= 10 && time > 5));

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <PageRoot>
        {/* Ambient background layers */}
        <BgTexture />
        <BgGlow />

        {/* Damage flash overlay */}
        {flash && <DamageOverlay />}

        {/* Correct answer burst */}
        {isCorrectAnim && <CorrectBurst />}

        {/* ── HEADER ── */}
        <Header>
          <BackBtn onClick={handleBackClick} title="Exit game">
            <BackBtnIcon src={back} />
          </BackBtn>

          <HeaderCenter>
            {showTutorial ? (
              <TutorialBadge>
                <TutorialBadgeDot />
                Tutorial Mode
              </TutorialBadge>
            ) : (
              <ScoreRow>
                <StatPill>
                  <StatIcon>✦</StatIcon>
                  <StatBody>
                    <StatLabel>Score</StatLabel>
                    <StatVal $gold>{score}</StatVal>
                  </StatBody>
                </StatPill>

                <TimerPill $danger={time <= 5}>
                  <TimerSvg viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="25" cy="25" r="22"
                      fill="none"
                      stroke={time <= 5 ? "#ff6b6b" : "#fbc417"}
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 25 25)"
                    />
                  </TimerSvg>
                  <TimerText $danger={time <= 5}>{String(time).padStart(2, "0")}</TimerText>
                </TimerPill>

                <StatPill>
                  <StatIcon>◈</StatIcon>
                  <StatBody>
                    <StatLabel>Level</StatLabel>
                    <StatVal>{level}</StatVal>
                  </StatBody>
                </StatPill>
              </ScoreRow>
            )}
          </HeaderCenter>

          <RightControlSlot>
            <SoundBtn
              onClick={() => { ensureAudioContext(); playStoneClick(); setSoundEnabled((p) => !p); }}
              $active={soundEnabled}
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </SoundBtn>
          </RightControlSlot>
        </Header>

        {/* ── DECORATIVE SIDE IMAGES ── */}
        <LeftArt src={write1} />
        <RightArt src={write2} />

        {!showTutorial && showRoundHints && (
          <FloatingHintsLayer>
            {hintKeys.map((key, index) => {
              const src = HINT_IMAGE_BY_KEY[key];
              const xList = [12, 27, 42, 58, 73, 88];
              const yList = [26, 20, 30, 19, 31, 24];
              const rotList = [-8, 6, -5, 7, -6, 5];
              const scaleList = [0.92, 1.03, 0.97, 1.02, 0.95, 1.0];
              const x = xList[index % xList.length];
              const y = yList[index % yList.length];
              const rot = rotList[index % rotList.length];
              const scale = scaleList[index % scaleList.length];
              return (
                <HintFloatCard
                  key={key}
                  style={{
                    "--hint-left": `${x}%`,
                    "--hint-top": `${y}%`,
                    "--hint-rot": `${rot}deg`,
                    "--hint-scale": `${scale}`,
                    animationDelay: `${index * 0.12}s`,
                  }}
                >
                  {src ? <HintImg src={src} alt={`Baybayin ${key}`} /> : <HintImgFallback>?</HintImgFallback>}
                  <HintLatin>{key.toUpperCase()}</HintLatin>
                </HintFloatCard>
              );
            })}
          </FloatingHintsLayer>
        )}

        {/* ── MAIN GAME CONTENT ── */}
        <GameBody>
          {/* Prompt strip */}
          {!showTutorial && (
            <PromptStrip>
              <PromptLabel>Write the Baybayin for</PromptLabel>
              <PromptTarget $pulse={isCorrectAnim}>{targetLetter}</PromptTarget>
            </PromptStrip>
          )}

          {/* Tutorial caption */}
          {showTutorial && !isCountdownActive && (
            <TutorialPanel>
              <TutorialHeading>Listen, watch, and trace</TutorialHeading>
              <CaptionBubble>
                <CaptionText>{typedCaption}<CaptionCursor /></CaptionText>
              </CaptionBubble>
              <ProgressDots>
                {tutorialPhases.map((phase, idx) => (
                  <Dot key={phase} $active={idx <= tutorialStepIndex} $current={idx === tutorialStepIndex} />
                ))}
              </ProgressDots>
            </TutorialPanel>
          )}

          {/* Countdown overlay */}
          {isCountdownActive && (
            <CountdownOverlay>
              <CountdownRing>
                <CountdownNum>{countdown}</CountdownNum>
              </CountdownRing>
              <CountdownHint>Round 1 begins…</CountdownHint>
            </CountdownOverlay>
          )}

          {/* Canvas area */}
          {((showTutorial && tutorialPhase !== "intro") || !showTutorial) && (
            <CanvasSection>
              <CanvasFrame $shake={!showTutorial && isWrong} $correct={isCorrectAnim}>
                <CanvasBg />
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
                {/* Corner ornaments */}
                <Corner $pos="tl" />
                <Corner $pos="tr" />
                <Corner $pos="bl" />
                <Corner $pos="br" />
              </CanvasFrame>

              {/* Result tag */}
              {!showTutorial && prediction && (
                <ResultTag $correct={!!prediction.is_correct} $error={!!prediction.retry_message}>
                  {prediction.retry_message
                    ? `⚠ ${prediction.retry_message}`
                    : prediction.is_correct
                      ? "✓ Correct!"
                      : `✗ Got: ${String(prediction.predicted || "").toUpperCase()}`}
                </ResultTag>
              )}
            </CanvasSection>
          )}

          {/* Action buttons */}
          {showTutorial && showTutorialActionButton && (
            <TutorialActions>
              {isTutorialTracePhase && (
                <ActionBtn $variant="ghost" onClick={handleClear}>
                  <BtnIcon>⌫</BtnIcon>
                  Clear Trace
                </ActionBtn>
              )}
              <ActionBtn $variant="primary" onClick={() => { if (isTutorialTracePhase) handleClear(); advanceTutorial(); }}>
                {tutorialPrimaryButtonLabel}
                <BtnIcon>→</BtnIcon>
              </ActionBtn>
            </TutorialActions>
          )}

          {!showTutorial && (
            <GameActions>
              <ActionBtn $variant="ghost" onClick={handleClear}>
                <BtnIcon>⌫</BtnIcon>
                Clear
              </ActionBtn>

              <ActionBtn $variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <><SpinnerDot /><SpinnerDot $d="0.15s" /><SpinnerDot $d="0.3s" /></>
                ) : (
                  <><BtnIcon>➤</BtnIcon> Submit</>
                )}
              </ActionBtn>

              <ActionBtn $variant="ghost" onClick={handleSkip}>
                <BtnIcon>⏭</BtnIcon>
                Skip
              </ActionBtn>
            </GameActions>
          )}
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
                <ModalStatLabel>Difficulty</ModalStatLabel>
                <ModalStatVal>{level}</ModalStatVal>
              </ModalStat>
              <ModalDivider />
              <ModalStat>
                <ModalStatLabel>Final Score</ModalStatLabel>
                <ModalStatVal $gold>{score}</ModalStatVal>
              </ModalStat>
            </ModalStats>
            <ModalActions>
              <ModalBtn $variant="amber" onClick={handleRestart}>↺ Restart</ModalBtn>
              <ModalBtn $variant="green" onClick={handleNextRound} disabled={!nextLevel}>
                {nextLevel ? `Next: ${nextLevel} →` : "Max Level"}
              </ModalBtn>
            </ModalActions>
          </GameOverModal>
        </ModalOverlay>
      )}

      {/* ── EXIT CONFIRM MODAL ── */}
      {showExitConfirm && (
        <ModalOverlay>
          <ExitModal>
            <ModalTitle style={{ fontSize: "1.1rem" }}>Exit the Writing Game?</ModalTitle>
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

export default WriteModeV2;

/* ═══════════════════════════════════
   ANIMATIONS
═══════════════════════════════════ */

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const centeredShake = keyframes`
  0%, 100% { transform: translateX(0); }
  15%  { transform: translateX(-10px); }
  30%  { transform: translateX(10px); }
  45%  { transform: translateX(-8px); }
  60%  { transform: translateX(8px); }
  75%  { transform: translateX(-4px); }
`;

const flashRed = keyframes`
  0%, 100% { opacity: 0; }
  25%, 75%  { opacity: 1; }
`;

const correctPop = keyframes`
  0%   { opacity: 0; transform: scale(0.6); }
  40%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.4); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 196, 23, 0.5); }
  50%       { box-shadow: 0 0 0 12px rgba(251, 196, 23, 0); }
`;

const timerDanger = keyframes`
  0%, 100% { transform: scale(1); color: #ff6b6b; }
  50%       { transform: scale(1.22); color: #ff3333; }
`;

const dotPop = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.35); }
`;

const ringPop = keyframes`
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const floatHint = keyframes`
  0%, 100% { left: calc(var(--hint-left) - 4.5%); }
  50% { left: calc(var(--hint-left) + 4.5%); }
`;

/* ═══════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════ */

/* ── Root ── */
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

/* Layered background */
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

/* ── Overlays ── */
const DamageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(220, 38, 38, 0.38);
  pointer-events: none;
  z-index: 9000;
  animation: ${flashRed} 0.55s ease forwards;
`;

const CorrectBurst = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(251, 196, 23, 0.18);
  pointer-events: none;
  z-index: 9000;
  animation: ${correctPop} 0.8s ease forwards;
`;

/* ── Header ── */
const Header = styled.header`
  position: relative;
  z-index: 100;
  width: 100%;
  padding: 12px 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;

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
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
  &:hover { transform: scale(0.9); }
`;

const BackBtnIcon = styled.img`
  width: 205px;
  display: block;
  margin-top: -30px;

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
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 720px) {
    order: 3;
    flex: 0 0 100%;
  }
`;

const TutorialBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(251, 196, 23, 0.15);
  border: 1px solid rgba(251, 196, 23, 0.4);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #fde68a;
`;

const TutorialBadgeDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fbc417;
  box-shadow: 0 0 6px rgba(251, 196, 23, 0.8);
  animation: ${blink} 1.4s ease-in-out infinite;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 900px) {
    gap: 8px;
  }

  @media (max-width: 720px) {
    gap: 6px;
    transform: scale(0.92);
  }
`;

const StatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);

  @media (max-width: 720px) {
    padding: 4px 10px 4px 8px;
    gap: 6px;
  }
`;

const StatIcon = styled.span`
  font-size: 13px;
  opacity: 0.55;
  color: #fbc417;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`;

const StatBody = styled.div``;

const StatLabel = styled.div`
  font-family: sans-serif;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(255, 242, 210, 0.55);

  @media (max-width: 720px) {
    font-size: 8px;
    letter-spacing: 1px;
  }
`;

const StatVal = styled.div`
  font-family: 'Georgia', serif;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.1;
  color: ${({ $gold }) => ($gold ? "#fbc417" : "#fff4df")};

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;

/* Timer ring */
const TimerPill = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 720px) {
    width: 46px;
    height: 46px;
  }
`;

const TimerSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const TimerText = styled.div`
  font-family: 'Georgia', serif;
  font-size: 16px;
  font-weight: 900;
  position: relative;
  z-index: 1;
  color: ${({ $danger }) => ($danger ? "#ff6b6b" : "#fff")};
  ${({ $danger }) => $danger && css`animation: ${timerDanger} 0.7s ease-in-out infinite;`}

  @media (max-width: 720px) {
    font-size: 14px;
  }
`;

const SoundBtn = styled.button`
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? "rgba(34,197,94,0.18)" : "rgba(0,0,0,0.28)")};
  border: 1px solid ${({ $active }) => ($active ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.2)")};
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  &:hover { transform: translateY(-1px); }
`;

const RightControlSlot = styled.div`
  width: 205px;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 900px) {
    width: 170px;
  }

  @media (max-width: 720px) {
    order: 2;
    width: auto;
    flex: 1 1 auto;
  }
`;

/* ── Side art ── */
const LeftArt = styled.img`
  position: absolute;
  top: 0;
  left: -40px;
  width: 290px;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
`;

const RightArt = styled.img`
  position: absolute;
  top: 0;
  right: -40px;
  width: 290px;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
`;

/* ── Game Body ── */
const GameBody = styled.main`
  position: relative;
  z-index: 10;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 16px 16px;
  overflow-y: auto;

  @media (max-width: 720px) {
    padding: 0 12px 12px;
    gap: 8px;
  }
`;

/* ── Prompt strip ── */
const PromptStrip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 0 2px;
  animation: ${floatUp} 0.4s ease;

  @media (max-width: 720px) {
    padding: 6px 0 0;
  }
`;

const PromptLabel = styled.div`
  font-family: sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 248, 231, 0.6);

  @media (max-width: 720px) {
    font-size: 10px;
    letter-spacing: 1.1px;
    text-align: center;
  }
`;

const PromptTarget = styled.div`
  font-family: 'Georgia', serif;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.0;
  color: #fbc417;
  text-shadow: 0 4px 18px rgba(251,196,23,0.35), 0 0 40px rgba(251,196,23,0.15);
  letter-spacing: 1px;
  ${({ $pulse }) => $pulse && css`animation: ${glowPulse} 0.6s ease;`}

  @media (max-width: 900px) {
    font-size: 46px;
  }

  @media (max-width: 720px) {
    font-size: 38px;
    letter-spacing: 0.5px;
  }
`;

/* ── Tutorial panel ── */
const TutorialPanel = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  animation: ${floatUp} 0.4s ease;

  @media (max-width: 720px) {
    max-width: 92vw;
    gap: 10px;
    padding: 4px 0 0;
  }
`;

const TutorialHeading = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #fde68a;
  letter-spacing: 0.3px;

  @media (max-width: 720px) {
    font-size: 16px;
    text-align: center;
  }
`;

const CaptionBubble = styled.div`
  width: 100%;
  padding: 12px 18px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 220, 150, 0.25);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);

  @media (max-width: 720px) {
    padding: 10px 12px;
    border-radius: 14px;
  }
`;

const CaptionText = styled.p`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: clamp(11.5px, 2.1vw, 14px);
  line-height: 1.45;
  color: #fff8e8;
  min-height: 22px;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-wrap: pretty;

  @media (max-width: 720px) {
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 420px) {
    font-size: 11.5px;
    line-height: 1.35;
  }
`;

const CaptionCursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #fbc417;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${blink} 0.8s step-start infinite;
`;

const ProgressDots = styled.div`
  display: flex;
  gap: 7px;
  align-items: center;

  @media (max-width: 720px) {
    gap: 5px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const Dot = styled.span`
  width: ${({ $current }) => ($current ? "24px" : "10px")};
  height: 10px;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#fbc417" : "rgba(255,255,255,0.2)")};
  box-shadow: ${({ $active }) => ($active ? "0 0 8px rgba(251,196,23,0.7)" : "none")};
  transition: all 0.3s ease;
  ${({ $current }) => $current && css`animation: ${dotPop} 1.4s ease-in-out infinite;`}

  @media (max-width: 720px) {
    height: 8px;
    width: ${({ $current }) => ($current ? "20px" : "8px")};
  }
`;

/* ── Canvas section ── */
const CanvasSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const CanvasFrame = styled.div`
  position: relative;
  border-radius: 20px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(139,90,43,0.5) 0%, rgba(80,40,10,0.6) 100%);
  border: 1px solid rgba(251, 196, 23, 0.25);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,220,150,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.3);
  ${({ $shake }) => $shake && css`animation: ${centeredShake} 0.4s ease;`}
  ${({ $correct }) => $correct && css`border-color: rgba(34,197,94,0.6); box-shadow: 0 0 20px rgba(34,197,94,0.3);`}
`;

const CanvasBg = styled.div`
  position: absolute;
  inset: 10px;
  border-radius: 12px;
  background: #fdf8f0;
  z-index: 0;
`;

/* Corner ornaments */
const Corner = styled.div`
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: rgba(251, 196, 23, 0.55);
  border-style: solid;
  z-index: 2;
  pointer-events: none;
  ${({ $pos }) => {
    switch ($pos) {
      case "tl": return css`top: 6px; left: 6px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0;`;
      case "tr": return css`top: 6px; right: 6px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0;`;
      case "bl": return css`bottom: 6px; left: 6px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px;`;
      case "br": return css`bottom: 6px; right: 6px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0;`;
      default: return "";
    }
  }}
`;

const Canvas = styled.canvas`
  position: relative;
  z-index: 1;
  width: min(400px, 80vw);
  height: min(400px, 80vw);
  background: transparent;
  border-radius: 12px;
  cursor: crosshair;
  touch-action: none;
  display: block;
`;

/* ── Result tag ── */
const ResultTag = styled.div`
  font-family: sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 8px 20px;
  border-radius: 999px;
  color: ${({ $correct, $error }) => $error ? "#fca5a5" : $correct ? "#bbf7d0" : "#fca5a5"};
  background: ${({ $correct, $error }) => $error ? "rgba(127,29,29,0.5)" : $correct ? "rgba(22,101,52,0.4)" : "rgba(127,29,29,0.4)"};
  border: 1px solid ${({ $correct, $error }) => $error ? "rgba(252,165,165,0.4)" : $correct ? "rgba(74,222,128,0.4)" : "rgba(252,165,165,0.35)"};
  animation: ${floatUp} 0.3s ease;
`;

/* ── Action buttons ── */
const TutorialActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const GameActions = styled.div`
  display: flex;
  gap: 10px;
  width: min(420px, 84vw);
  justify-content: center;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
  flex: ${({ $variant }) => $variant === "primary" ? "2" : "1"};

  ${({ $variant }) => {
    if ($variant === "primary") return css`
      background: linear-gradient(135deg, #fbc417 0%, #f59e0b 100%);
      border: none;
      color: #3d2401;
      box-shadow: 0 4px 14px rgba(251,196,23,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(251,196,23,0.45); }
      &:active:not(:disabled) { transform: translateY(1px); }
    `;
    return css`
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(251,196,23,0.3);
      color: #fff7e7;
      &:hover:not(:disabled) { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
      &:active:not(:disabled) { transform: translateY(1px); }
    `;
  }}
`;

const BtnIcon = styled.span`
  font-size: 13px;
  opacity: 0.9;
`;

/* Spinner dots */
const spinnerPulse = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
`;

const SpinnerDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3d2401;
  animation: ${spinnerPulse} 1.2s ease-in-out infinite;
  animation-delay: ${({ $d }) => $d || "0s"};
`;

/* ── Countdown ── */
const CountdownOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  z-index: 200;
`;

const CountdownRing = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(251, 196, 23, 0.5);
  background: rgba(251, 196, 23, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(251, 196, 23, 0.2);
  animation: ${ringPop} 0.9s ease;
`;

const CountdownNum = styled.div`
  font-family: 'Georgia', serif;
  font-size: 64px;
  font-weight: 900;
  color: #fbc417;
  text-shadow: 0 0 20px rgba(251,196,23,0.6);
`;

const CountdownHint = styled.div`
  font-family: sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
`;

/* ── Modals ── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
`;

const GameOverModal = styled.div`
  background: linear-gradient(160deg, #2c1204 0%, #1a0b02 100%);
  border: 1px solid rgba(251, 196, 23, 0.3);
  border-radius: 24px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,120,0.12);
  animation: ${ringPop} 0.4s ease;
`;

const ExitModal = styled(GameOverModal)``;

const ModalOrb = styled.div`
  font-size: 40px;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
`;

const ModalTitle = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0 0 20px;
  color: #fde68a;
  letter-spacing: 0.3px;
`;

const ModalSubtext = styled.p`
  font-family: sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin: -12px 0 20px;
`;

const ModalStats = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 24px;
  margin-bottom: 24px;
`;

const ModalStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

const ModalStatLabel = styled.div`
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(255, 242, 210, 0.5);
`;

const ModalStatVal = styled.div`
  font-family: 'Georgia', serif;
  font-size: 22px;
  font-weight: 900;
  color: ${({ $gold }) => ($gold ? "#fbc417" : "#fff4df")};
`;

const ModalDivider = styled.div`
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ModalBtn = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 11px 18px;
  border-radius: 12px;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
  transition: transform 0.15s ease, filter 0.15s ease;
  border: none;
  &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
  &:active:not(:disabled) { transform: translateY(1px); }

  ${({ $variant }) => {
    if ($variant === "amber") return css`background: linear-gradient(135deg, #f59e0b, #d97706); color: #3d2401;`;
    if ($variant === "green") return css`background: linear-gradient(135deg, #22c55e, #16a34a); color: #052e16;`;
    if ($variant === "red")   return css`background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff;`;
    return css`background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff;`;
  }}
`;

const FloatingHintsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: none;
`;

const HintFloatCard = styled.div`
  position: absolute;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(122, 33, 0, 0.16);
  box-shadow: 0 10px 30px rgba(0,0,0,0.28);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 9px 8px;
  width: 90px;
  animation: ${floatHint} 4.2s ease-in-out infinite;
  left: var(--hint-left);
  top: var(--hint-top);
  transform: translate(-50%, -50%) rotate(var(--hint-rot)) scale(var(--hint-scale));
`;

const HintImg = styled.img`
  width: 62px;
  height: 62px;
  object-fit: contain;
  display: block;
`;

const HintImgFallback = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 8px;
  background: #fff8ee;
  color: #7a2100;
  display: grid;
  place-items: center;
  font-weight: 900;
`;

const HintLatin = styled.div`
  margin-top: 5px;
  font-family: sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #7a2100;
`;