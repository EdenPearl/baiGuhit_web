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

/* ─── Baybayin character images per level ───
   Place these images in your Assests folder.
   Naming convention: baybayin_<char>.png
   e.g. baybayin_a.png, baybayin_ba.png, etc.
*/
import bay_a   from "../../../Assests/baybayin_a.png";
import bay_ba  from "../../../Assests/baybayin_ba.png";
import bay_na  from "../../../Assests/baybayin_na.png";
import bay_ka  from "../../../Assests/baybayin_ka.png";
import bay_ei  from "../../../Assests/baybayin_ei.png";
import bay_nga from "../../../Assests/baybayin_nga.png";
import bay_wa  from "../../../Assests/baybayin_wa.png";
import bay_pa  from "../../../Assests/baybayin_pa.png";
import bay_ga  from "../../../Assests/baybayin_ga.png";
import bay_ha  from "../../../Assests/baybayin_ha.png";
import bay_ma  from "../../../Assests/baybayin_ma.png";
import bay_da  from "../../../Assests/baybayin_da.png";
import bay_ta  from "../../../Assests/baybayin_ta.png";
import bay_sa  from "../../../Assests/baybayin_sa.png";
import bay_ya  from "../../../Assests/baybayin_ya.png";
import bay_ou  from "../../../Assests/baybayin_ou.png";
import bay_la  from "../../../Assests/baybayin_la.png";

/* ─────────────────────── CONSTANTS ─────────────────────── */

/**
 * Maps each level to:
 *  - label: display name
 *  - chars: array of { latin, img } for the preview panel
 */
const LEVEL_CHARACTER_MAP = {
  easy:   {
    label: "Easy",
    chars: [
      { latin: "A",  img: bay_a  },
      { latin: "BA", img: bay_ba },
      { latin: "NA", img: bay_na },
      { latin: "KA", img: bay_ka },
    ],
  },
  medium: {
    label: "Medium",
    chars: [
      { latin: "E/I", img: bay_ei  },
      { latin: "NGA", img: bay_nga },
      { latin: "WA",  img: bay_wa  },
    ],
  },
  hard:   {
    label: "Hard",
    chars: [
      { latin: "PA", img: bay_pa },
      { latin: "GA", img: bay_ga },
      { latin: "HA", img: bay_ha },
    ],
  },
  expert: {
    label: "Expert",
    chars: [
      { latin: "MA", img: bay_ma },
      { latin: "DA", img: bay_da },
      { latin: "TA", img: bay_ta },
      { latin: "SA", img: bay_sa },
    ],
  },
  master: {
    label: "Master",
    chars: [
      { latin: "YA",  img: bay_ya },
      { latin: "O/U", img: bay_ou },
      { latin: "LA",  img: bay_la },
    ],
  },
};

const FALLBACK_CHARACTERS = {
  easy:   ["A", "BA", "NA", "KA"],
  medium: ["E/I", "NGA", "WA"],
  hard:   ["PA", "GA", "HA"],
  expert: ["MA", "DA", "TA", "SA"],
  master: ["YA", "O/U", "LA"],
};

const TUTORIAL_CAPTIONS = {
  intro:        "Hello there. I am your Baybayin teacher. Today we will practice a, ba, and ka, then play round one.",
  this_is_a:    "This is a.",
  trace_a:      "Now, trace the Baybayin character a.",
  this_is_ba:   "This is ba. One sound: bah.",
  trace_ba:     "Now, trace the Baybayin character ba.",
  this_is_ka:   "This is ka, pronounced as one sound: ka.",
  trace_ka:     "Now, trace the Baybayin character ka.",
  ready_to_play:"Excellent work. Round one starts now. Write the Baybayin equivalent of the letter I show you.",
};

const TUTORIAL_TRACE_PATHS = {
  a:  "M28 62 C44 43, 72 41, 95 54 C106 61, 114 70, 120 80 M60 90 L124 38 M58 114 L128 62 M118 78 C109 111, 111 148, 125 170 C133 181, 148 186, 165 183 C186 179, 201 163, 210 140 C223 108, 236 76, 263 48 C279 31, 297 20, 320 14",
  ba: "M150 116 C125 148, 89 173, 59 165 C32 158, 28 119, 47 88 C72 47, 124 28, 175 38 C223 47, 259 82, 262 115 C266 148, 241 176, 203 182 C177 186, 159 180, 151 166 C146 156, 146 139, 150 116",
  ka: "M36 68 C84 26, 156 20, 220 44 C258 58, 286 62, 306 50 M160 34 C160 94, 160 120, 160 144 M36 176 C90 140, 162 132, 226 152 C262 164, 287 167, 306 156",
};

const LEVEL_SEQUENCE = ["Easy", "Medium", "Hard", "Expert", "Master"];
const normalizeLevel  = (l) => String(l || "").trim().toLowerCase();

/* ─────────────────────── COMPONENT ─────────────────────── */

const WriteModeV2 = () => {
  const GAME_DURATION_SECONDS  = 30;
  const PREVIEW_DURATION_MS    = 5000; // how long the character preview shows
  const HINT_THRESHOLD_SECONDS = 10;   // show hint again when time ≤ this

  const canvasRef  = useRef(null);
  const navigate   = useNavigate();
  const { submitWriteResult } = useWriteSubmission();
  const { insertScore }       = useInsertLeaderboard();
  const { updateScore }       = useUpdateLeaderboard();

  const submitLockRef         = useRef(false);
  const requestAbortRef       = useRef(null);
  const nextRoundTimerRef     = useRef(null);
  const wrongFlashTimerRef    = useRef(null);
  const leaderboardSaveLockRef= useRef(false);
  const playedLevelsRef       = useRef(new Set());
  const audioCtxRef           = useRef(null);
  const preGameMusicRef       = useRef(null);
  const bgMusicRef            = useRef(null);
  const stoneClickRef         = useRef(null);
  const previewTimerRef       = useRef(null);

  const [soundEnabled,       setSoundEnabled]       = useState(true);
  const [showTutorial,       setShowTutorial]       = useState(true);
  const [tutorialPhase,      setTutorialPhase]      = useState("intro");
  const [typedCaption,       setTypedCaption]       = useState("");
  const [countdown,          setCountdown]          = useState(null);
  const [isCountdownActive,  setIsCountdownActive]  = useState(false);
  const [currentCaption,     setCurrentCaption]     = useState(TUTORIAL_CAPTIONS.intro);

  const [isDrawing,          setIsDrawing]          = useState(false);
  const [level,              setLevel]              = useState("Easy");
  const [roundNumber,        setRoundNumber]        = useState(1);

  const [score,              setScore]              = useState(0);
  const [time,               setTime]               = useState(GAME_DURATION_SECONDS);
  const [gameOver,           setGameOver]           = useState(false);
  const [showExitConfirm,    setShowExitConfirm]    = useState(false);

  const [targetLetter,       setTargetLetter]       = useState("A");
  const [targetKey,          setTargetKey]          = useState("A");
  const [prediction,         setPrediction]         = useState(null);
  const [isLoading,          setIsLoading]          = useState(false);

  const [flash,              setFlash]              = useState(false);
  const [isWrong,            setIsWrong]            = useState(false);
  const [isCorrectAnim,      setIsCorrectAnim]      = useState(false);

  // ── Character preview states ──
  const [showPreview,        setShowPreview]        = useState(false);
  const [previewDismissed,   setPreviewDismissed]   = useState(false);
  const [showHintPanel,      setShowHintPanel]      = useState(false);
  const [previewCountdown,   setPreviewCountdown]   = useState(5);
  const [hintVisible,        setHintVisible]        = useState(false);

  const CANVAS_WIDTH  = 440;
  const CANVAS_HEIGHT = 440;

  const isTutorialTracePhase = ["a_trace","ba_trace","ka_trace"].includes(tutorialPhase);
  const isTutorialShowPhase  = ["a_show","ba_show","ka_show"].includes(tutorialPhase);
  const currentTutorialCharacter = tutorialPhase.startsWith("a_") ? "a"
    : tutorialPhase.startsWith("ba_") ? "ba"
    : tutorialPhase.startsWith("ka_") ? "ka"
    : null;

  const tutorialPhases    = ["intro","a_show","a_trace","ba_show","ba_trace","ka_show","ka_trace"];
  const tutorialStepIndex = Math.max(0, tutorialPhases.indexOf(tutorialPhase));

  const getNextLevel   = (cur) => {
    const idx = LEVEL_SEQUENCE.findIndex((l) => normalizeLevel(l) === normalizeLevel(cur));
    return idx === -1 || idx === LEVEL_SEQUENCE.length - 1 ? null : LEVEL_SEQUENCE[idx + 1];
  };
  const levelToRound = (lvl) => {
    const n = normalizeLevel(lvl);
    if (n === "expert") return 3;
    if (n === "master") return 4;
    return 1;
  };

  /* ── Current level's character list ── */
  const currentLevelData = LEVEL_CHARACTER_MAP[normalizeLevel(level)] || LEVEL_CHARACTER_MAP.easy;

  /* ═══════════ CHARACTER PREVIEW LOGIC ═══════════
     Called when a new round starts (after tutorial).
     1. Show preview panel for PREVIEW_DURATION_MS.
     2. Countdown ticks 5→0 inside the panel.
     3. Panel auto-dismisses (or player can tap "Got it").
     4. During game, if time ≤ HINT_THRESHOLD_SECONDS,
        a compact hint strip fades in.
  */
  const startPreview = () => {
    setShowPreview(true);
    setPreviewDismissed(false);
    setPreviewCountdown(Math.round(PREVIEW_DURATION_MS / 1000));

    // tick the preview countdown
    let remaining = Math.round(PREVIEW_DURATION_MS / 1000);
    const tick = setInterval(() => {
      remaining -= 1;
      setPreviewCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        dismissPreview();
      }
    }, 1000);

    previewTimerRef.current = tick;
  };

  const dismissPreview = () => {
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setShowPreview(false);
    setPreviewDismissed(true);
  };

  /* Show hint strip when time hits HINT_THRESHOLD */
  useEffect(() => {
    if (!showTutorial && !gameOver && !showPreview && previewDismissed) {
      if (time <= HINT_THRESHOLD_SECONDS && time > 0) {
        setHintVisible(true);
      } else if (time > HINT_THRESHOLD_SECONDS) {
        setHintVisible(false);
      }
    }
  }, [time, showTutorial, gameOver, showPreview, previewDismissed]);

  /* Cleanup preview timer on unmount */
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    };
  }, []);

  /* ═══════════ AUDIO ═══════════ */
  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
    return audioCtxRef.current;
  };

  const playTone = (freq, dur = 0.1, type = "sine", vol = 0.03) => {
    if (!soundEnabled) return;
    const ctx = ensureAudioContext(); if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  };

  const playCorrectSound = () => { playTone(520,.1,"triangle",.04); setTimeout(()=>playTone(660,.12,"triangle",.04),85); };
  const playWrongSound   = () => { playTone(210,.16,"sawtooth",.035); setTimeout(()=>playTone(170,.12,"sawtooth",.03),75); };
  const playTimeUpSound  = () => { playTone(240,.2,"square",.035); setTimeout(()=>playTone(180,.22,"square",.03),140); };
  const playStoneClick   = () => {
    if (!soundEnabled || !stoneClickRef.current) return;
    try { stoneClickRef.current.currentTime = 0; stoneClickRef.current.play().catch(()=>{}); } catch {}
  };

  /* ═══════════ CANVAS ═══════════ */
  const drawCanvasBase = ({ mode = "none" } = {}) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#fdf8f0"; ctx.fillRect(0,0,canvas.width,canvas.height);
    if (mode === "none" || !currentTutorialCharacter) return;
    const pathData = TUTORIAL_TRACE_PATHS[currentTutorialCharacter]; if (!pathData) return;
    const path = new Path2D(pathData);
    ctx.save();
    const scale = Math.min(430/320, 250/220);
    const dw = 320*scale, dh = 220*scale;
    ctx.translate((canvas.width-dw)/2, (canvas.height-dh)/2);
    ctx.scale(scale, scale);
    if (mode === "trace") {
      ctx.strokeStyle = "rgba(139,90,43,0.28)"; ctx.lineWidth = 7; ctx.setLineDash([8,10]);
    } else {
      ctx.strokeStyle = "#5c3d1e"; ctx.lineWidth = 8; ctx.setLineDash([]);
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(path); ctx.restore();
  };

  /* ═══════════ TUTORIAL ═══════════ */
  const advanceTutorial = () => {
    const next = {
      intro:    ["a_show",  TUTORIAL_CAPTIONS.this_is_a],
      a_show:   ["a_trace", TUTORIAL_CAPTIONS.trace_a],
      a_trace:  ["ba_show", TUTORIAL_CAPTIONS.this_is_ba],
      ba_show:  ["ba_trace",TUTORIAL_CAPTIONS.trace_ba],
      ba_trace: ["ka_show", TUTORIAL_CAPTIONS.this_is_ka],
      ka_show:  ["ka_trace",TUTORIAL_CAPTIONS.trace_ka],
    };
    if (next[tutorialPhase]) {
      setTutorialPhase(next[tutorialPhase][0]);
      setCurrentCaption(next[tutorialPhase][1]);
    } else if (tutorialPhase === "ka_trace") {
      setCurrentCaption(TUTORIAL_CAPTIONS.ready_to_play);
      startCountdownToGame();
    }
  };

  const startCountdownToGame = () => { setIsCountdownActive(true); setCountdown(3); };

  useEffect(() => {
    if (!isCountdownActive || countdown == null) return;
    if (countdown === 0) {
      setIsCountdownActive(false); setCountdown(null);
      setShowTutorial(false);
      // ← Show the character preview before starting
      startPreview();
      getRandomCharacter("Easy");
      return;
    }
    const t = setTimeout(() => setCountdown((p)=>p-1), 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountdownActive, countdown]);

  useEffect(() => {
    if (!showTutorial || isCountdownActive) { setTypedCaption(""); return; }
    let idx = 0; setTypedCaption("");
    const text = currentCaption; if (!text) return;
    const t = setInterval(() => {
      idx += 1; setTypedCaption(text.slice(0,idx));
      if (idx >= text.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [showTutorial, currentCaption, isCountdownActive]);

  useEffect(() => {
    const prevent = (e) => { if (isDrawing) e.preventDefault(); };
    window.addEventListener("touchmove", prevent, { passive: false });
    return () => window.removeEventListener("touchmove", prevent);
  }, [isDrawing]);

  useEffect(() => () => {
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
    if (wrongFlashTimerRef.current) clearTimeout(wrongFlashTimerRef.current);
    if (requestAbortRef.current) requestAbortRef.current.abort();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    const mode = isTutorialTracePhase ? "trace" : isTutorialShowPhase ? "show" : "none";
    drawCanvasBase({ mode: showTutorial ? mode : "none" });
    ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.strokeStyle = "#3e2d19";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, isTutorialTracePhase, isTutorialShowPhase, currentTutorialCharacter]);

  useEffect(() => {
    if (showTutorial && (isTutorialTracePhase || isTutorialShowPhase))
      drawCanvasBase({ mode: isTutorialTracePhase ? "trace" : "show" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, isTutorialTracePhase, isTutorialShowPhase, currentTutorialCharacter]);

  /* Timer — only ticks when preview is dismissed */
  useEffect(() => {
    if (showTutorial || gameOver || showPreview) return;
    const t = setInterval(() => {
      setTime((v) => {
        if (v <= 1) { clearInterval(t); setGameOver(true); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showTutorial, gameOver, showPreview]);

  useEffect(() => { if (gameOver) playTimeUpSound(); }, [gameOver]);

  useEffect(() => {
    preGameMusicRef.current = new Audio(preGameMusic);
    preGameMusicRef.current.loop = true; preGameMusicRef.current.volume = 0.2;
    bgMusicRef.current = new Audio(dragMusic);
    bgMusicRef.current.loop = true; bgMusicRef.current.volume = 0.2;
    stoneClickRef.current = new Audio(stoneClick);
    stoneClickRef.current.volume = 0.45;
    return () => [preGameMusicRef, bgMusicRef, stoneClickRef].forEach((r) => {
      if (r.current) { r.current.pause(); r.current.currentTime = 0; }
    });
  }, []);

  useEffect(() => {
    if (preGameMusicRef.current) {
      soundEnabled && showTutorial ? preGameMusicRef.current.play().catch(()=>{}) : preGameMusicRef.current.pause();
    }
    if (bgMusicRef.current) {
      soundEnabled && !showTutorial && !gameOver ? bgMusicRef.current.play().catch(()=>{}) : bgMusicRef.current.pause();
    }
  }, [soundEnabled, showTutorial, gameOver]);

  useEffect(() => { if (!gameOver) leaderboardSaveLockRef.current = false; }, [gameOver]);

  useEffect(() => {
    if (!gameOver || leaderboardSaveLockRef.current) return;
    leaderboardSaveLockRef.current = true;
    const save = async () => {
      try {
        const loginData = localStorage.getItem("loginData"); if (!loginData) return;
        const user = JSON.parse(loginData);
        const userId = user?.id; if (!userId) return;
        const status = normalizeLevel(level);
        const hasPlayed = playedLevelsRef.current.has(status);
        const result = hasPlayed ? await updateScore(userId, status, score) : await insertScore(userId, status, score);
        if (result.success && !hasPlayed) playedLevelsRef.current.add(status);
      } catch (e) { console.error(e); }
    };
    save();
  }, [gameOver, level, score, insertScore, updateScore]);

  /* ═══════════ CANVAS DRAWING ═══════════ */
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: ((cx-rect.left)/rect.width)*canvas.width, y: ((cy-rect.top)/rect.height)*canvas.height };
  };

  const startDrawing = (e) => {
    if (gameOver || showPreview) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCoords(e);
    ctx.strokeStyle = "#3e2d19"; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!isDrawing || gameOver) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);

  const handleClear = () => {
    if (gameOver) return; playStoneClick();
    drawCanvasBase({ mode: showTutorial ? (isTutorialTracePhase ? "trace" : isTutorialShowPhase ? "show" : "none") : "none" });
    setPrediction(null);
  };

  /* ═══════════ GAME LOGIC ═══════════ */
  const getRandomCharacter = async (diffLevel = level) => {
    const apply = (key) => {
      setTargetKey(key);
      setTargetLetter(key.includes("_") ? key.replace(/_/g,"/") : key);
    };
    try {
      const res  = await fetch(`http://localhost:5000/get_random_character?difficulty=${diffLevel.toLowerCase()}`);
      const data = await res.json();
      if (data.success) apply(data.character);
    } catch {
      const pool = FALLBACK_CHARACTERS[diffLevel.toLowerCase()] || FALLBACK_CHARACTERS.easy;
      apply(pool[Math.floor(Math.random()*pool.length)]);
    }
  };

  const handleSubmit = async () => {
    if (showTutorial || gameOver || isLoading || submitLockRef.current || showPreview) return;
    playStoneClick();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let hasStroke = false;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i]<200||pixels[i+1]<200||pixels[i+2]<200) { hasStroke=true; break; }
    }
    if (!hasStroke) return;

    submitLockRef.current = true; setIsLoading(true);
    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current=null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current=null; }
    if (requestAbortRef.current) { requestAbortRef.current.abort(); requestAbortRef.current=null; }

    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      // crop & process canvas
      const { width:sw, height:sh } = canvas;
      const srcPx = ctx.getImageData(0,0,sw,sh).data;
      let minX=sw, minY=sh, maxX=0, maxY=0;
      for (let y=0;y<sh;y++) for (let x=0;x<sw;x++) {
        const idx=(y*sw+x)*4;
        const g=0.299*srcPx[idx]+0.587*srcPx[idx+1]+0.114*srcPx[idx+2];
        if(g<200){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
      }
      const hasBox = maxX>minX && maxY>minY;
      const bbox   = Math.max(maxX-minX, maxY-minY);
      const pad    = Math.round(bbox*0.15+6);
      const cx=Math.max(0,minX-pad), cy=Math.max(0,minY-pad);
      const cw=Math.min(sw,maxX+pad+1)-cx, ch=Math.min(sh,maxY+pad+1)-cy;
      const OUT=96, off=document.createElement("canvas");
      off.width=OUT; off.height=OUT;
      const octx=off.getContext("2d");
      octx.fillStyle="#ffffff"; octx.fillRect(0,0,OUT,OUT);
      if (hasBox) {
        const sc=Math.min(OUT/cw,OUT/ch)*0.80;
        octx.drawImage(canvas,cx,cy,cw,ch,(OUT-cw*sc)/2,(OUT-ch*sc)/2,cw*sc,ch*sc);
      }
      const ip=octx.getImageData(0,0,OUT,OUT), d=ip.data;
      for(let i=0;i<d.length;i+=4){const g=Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]); const v=g<180?0:255; d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;}
      octx.putImageData(ip,0,0);
      const imageData  = off.toDataURL("image/png");
      const sendTarget = targetKey.toLowerCase().replace(/_/g,"/");

      const fallback = async () => {
        const b64=imageData.split(",")[1], bc=atob(b64), ba=new Uint8Array(bc.length);
        for(let i=0;i<bc.length;i++) ba[i]=bc.charCodeAt(i);
        const fd=new FormData();
        fd.append("baybayin_photo",new Blob([ba],{type:"image/png"}),"drawing.png");
        const r=await fetch("/heroku-proxy/check_image/",{method:"POST",body:fd,signal:controller.signal});
        const t=await r.text();
        let predicted; try{predicted=JSON.parse(t);}catch{predicted=t.trim().replace(/"/g,"");}
        return {success:true,prediction:{predicted,is_correct:predicted.toLowerCase()===sendTarget.toLowerCase(),confidence:null}};
      };

      let data=null;
      try {
        const r=await fetch("http://localhost:5000/submit_drawing",{
          method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,
          body:JSON.stringify({image:imageData,target_character:sendTarget,difficulty:level.toLowerCase(),round:roundNumber}),
        });
        data=await r.json();
        if(!data.success||data.prediction?.retry_message) data=await fallback();
      } catch(e) { if(e.name==="AbortError") throw e; data=await fallback(); }

      if (data.success) {
        const pred = data.prediction; setPrediction(pred);
        submitWriteResult({targetCharacter:sendTarget,predictedCharacter:pred?.predicted||"",isCorrect:!!pred?.is_correct,confidence:pred?.confidence,imageBase64:imageData}).catch(()=>{});
        if (pred.is_correct) {
          playCorrectSound(); setScore((s)=>s+1);
          setIsCorrectAnim(true); setTimeout(()=>setIsCorrectAnim(false),1000);
          confetti({particleCount:120,spread:70,origin:{y:0.6},colors:["#fbc417","#f97316","#fde68a","#fff"]});
          nextRoundTimerRef.current = setTimeout(()=>{ getRandomCharacter(level); handleClear(); nextRoundTimerRef.current=null; },3000);
        } else if (!pred.retry_message) {
          playWrongSound(); setFlash(true); setIsWrong(true);
          wrongFlashTimerRef.current = setTimeout(()=>{ setFlash(false); setIsWrong(false); handleClear(); wrongFlashTimerRef.current=null; },600);
        }
      }
    } catch(e) {
      if(e.name!=="AbortError"){ console.error(e); setPrediction({retry_message:"Network error"}); }
    } finally {
      setIsLoading(false); submitLockRef.current=false; requestAbortRef.current=null;
    }
  };

  const handleSkip = () => {
    if (showTutorial||gameOver||showPreview) return; playStoneClick();
    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current=null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current=null; }
    getRandomCharacter(level); handleClear();
  };

  const handleBackClick = () => setShowExitConfirm(true);
  const confirmExit = (yes) => { setShowExitConfirm(false); if(yes) navigate("/homegame"); };

  const resetRound = (lvl = level) => {
    if (nextRoundTimerRef.current) { clearTimeout(nextRoundTimerRef.current); nextRoundTimerRef.current=null; }
    if (wrongFlashTimerRef.current) { clearTimeout(wrongFlashTimerRef.current); wrongFlashTimerRef.current=null; }
    setPrediction(null); handleClear();
    setLevel(lvl); setRoundNumber(levelToRound(lvl));
    setScore(0); setTime(GAME_DURATION_SECONDS); setGameOver(false);
    setHintVisible(false); setPreviewDismissed(false);
    leaderboardSaveLockRef.current = false;
    // Show preview for the new level before starting
    startPreview();
    getRandomCharacter(lvl);
  };

  const handleRestart   = () => resetRound(level);
  const handleNextRound = () => { const nl=getNextLevel(level); if(nl) resetRound(nl); };

  const tutorialPrimaryLabel = tutorialPhase==="ka_trace" ? "Done & Start Game" : isTutorialTracePhase ? "Done" : "Next";
  const showTutorialAction   = showTutorial && !isCountdownActive;
  const nextLevel            = getNextLevel(level);

  const timerProgress    = time / GAME_DURATION_SECONDS;
  const circumference    = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - timerProgress);

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <PageRoot>
        <BgTexture /><BgGlow />
        {flash && <DamageOverlay />}
        {isCorrectAnim && <CorrectBurst />}

        {/* ── HEADER ── */}
        <Header>
          <BackBtn onClick={handleBackClick}><BackBtnIcon src={back} /></BackBtn>
          <HeaderCenter>
            {showTutorial ? (
              <TutorialBadge><TutorialBadgeDot />Tutorial Mode</TutorialBadge>
            ) : (
              <ScoreRow>
                <StatPill>
                  <StatIcon>✦</StatIcon>
                  <StatBody><StatLabel>Score</StatLabel><StatVal $gold>{score}</StatVal></StatBody>
                </StatPill>
                <TimerPill>
                  <TimerSvg viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                    <circle cx="25" cy="25" r="22" fill="none"
                      stroke={time<=5?"#ff6b6b":"#fbc417"} strokeWidth="3"
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" transform="rotate(-90 25 25)"
                    />
                  </TimerSvg>
                  <TimerText $danger={time<=5}>{String(time).padStart(2,"0")}</TimerText>
                </TimerPill>
                <StatPill>
                  <StatIcon>◈</StatIcon>
                  <StatBody><StatLabel>Level</StatLabel><StatVal>{level}</StatVal></StatBody>
                </StatPill>
              </ScoreRow>
            )}
          </HeaderCenter>
          <RightControlSlot>
            <SoundBtn onClick={()=>{ensureAudioContext();playStoneClick();setSoundEnabled(p=>!p);}} $active={soundEnabled}>
              {soundEnabled ? "🔊" : "🔇"}
            </SoundBtn>
          </RightControlSlot>
        </Header>

        <LeftArt src={write1} /><RightArt src={write2} />

        {/* ════════════════════════════════
            CHARACTER PREVIEW OVERLAY
            Shown for 5s at round start
        ════════════════════════════════ */}
        {showPreview && (
          <PreviewOverlay>
            <PreviewCard>
              <PreviewTopBar />
              <PreviewHeader>
                <PreviewTitle>Round Characters</PreviewTitle>
                <PreviewSubtitle>
                  Memorise these — you'll need to write their Latin equivalent
                </PreviewSubtitle>
              </PreviewHeader>

              <PreviewGrid $count={currentLevelData.chars.length}>
                {currentLevelData.chars.map(({ latin, img }) => (
                  <PreviewCharItem key={latin}>
                    <PreviewImg src={img} alt={latin} />
                    <PreviewLatinLabel>{latin}</PreviewLatinLabel>
                  </PreviewCharItem>
                ))}
              </PreviewGrid>

              <PreviewFooter>
                <PreviewTimerRow>
                  <PreviewTimerTrack>
                    <PreviewTimerFill
                      style={{ width: `${(previewCountdown / (PREVIEW_DURATION_MS/1000)) * 100}%` }}
                    />
                  </PreviewTimerTrack>
                  <PreviewTimerNum>{previewCountdown}s</PreviewTimerNum>
                </PreviewTimerRow>
                <PreviewBtn onClick={dismissPreview}>
                  Got it — Start!
                </PreviewBtn>
              </PreviewFooter>
            </PreviewCard>
          </PreviewOverlay>
        )}

        {/* ════════════════════════════════
            HINT STRIP — reappears at ≤10s
        ════════════════════════════════ */}
        {!showTutorial && !showPreview && hintVisible && (
          <HintStrip>
            <HintStripLabel>
              <HintDot />
              Hint — Round characters
            </HintStripLabel>
            <HintCharsRow>
              {currentLevelData.chars.map(({ latin, img }) => (
                <HintCharItem key={latin}>
                  <HintImg src={img} alt={latin} />
                  <HintLabel>{latin}</HintLabel>
                </HintCharItem>
              ))}
            </HintCharsRow>
          </HintStrip>
        )}

        {/* ── GAME BODY ── */}
        <GameBody>
          {!showTutorial && (
            <PromptStrip>
              <PromptLabel>Write the Baybayin for</PromptLabel>
              <PromptTarget $pulse={isCorrectAnim}>{targetLetter}</PromptTarget>
            </PromptStrip>
          )}

          {showTutorial && !isCountdownActive && (
            <TutorialPanel>
              <TutorialHeading>Listen, watch, and trace</TutorialHeading>
              <CaptionBubble>
                <CaptionText>{typedCaption}<CaptionCursor /></CaptionText>
              </CaptionBubble>
              <ProgressDots>
                {tutorialPhases.map((phase,idx)=>(
                  <Dot key={phase} $active={idx<=tutorialStepIndex} $current={idx===tutorialStepIndex} />
                ))}
              </ProgressDots>
            </TutorialPanel>
          )}

          {isCountdownActive && (
            <CountdownOverlay>
              <CountdownRing><CountdownNum>{countdown}</CountdownNum></CountdownRing>
              <CountdownHint>Round 1 begins…</CountdownHint>
            </CountdownOverlay>
          )}

          {((showTutorial && tutorialPhase !== "intro") || !showTutorial) && (
            <CanvasSection>
              <CanvasFrame $shake={!showTutorial && isWrong} $correct={isCorrectAnim}>
                <CanvasBg />
                <Canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
                <Corner $pos="tl"/><Corner $pos="tr"/><Corner $pos="bl"/><Corner $pos="br"/>
              </CanvasFrame>
              {!showTutorial && prediction && (
                <ResultTag $correct={!!prediction.is_correct} $error={!!prediction.retry_message}>
                  {prediction.retry_message
                    ? `⚠ ${prediction.retry_message}`
                    : prediction.is_correct ? "✓ Correct!"
                    : `✗ Got: ${String(prediction.predicted||"").toUpperCase()}`}
                </ResultTag>
              )}
            </CanvasSection>
          )}

          {showTutorial && showTutorialAction && (
            <TutorialActions>
              {isTutorialTracePhase && (
                <ActionBtn $variant="ghost" onClick={handleClear}><BtnIcon>⌫</BtnIcon> Clear Trace</ActionBtn>
              )}
              <ActionBtn $variant="primary" onClick={()=>{ if(isTutorialTracePhase) handleClear(); advanceTutorial(); }}>
                {tutorialPrimaryLabel} <BtnIcon>→</BtnIcon>
              </ActionBtn>
            </TutorialActions>
          )}

          {!showTutorial && (
            <GameActions>
              <ActionBtn $variant="ghost" onClick={handleClear}><BtnIcon>⌫</BtnIcon> Clear</ActionBtn>
              <ActionBtn $variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                  ? <><SpinnerDot /><SpinnerDot $d="0.15s"/><SpinnerDot $d="0.3s"/></>
                  : <><BtnIcon>➤</BtnIcon> Submit</>}
              </ActionBtn>
              <ActionBtn $variant="ghost" onClick={handleSkip}><BtnIcon>⏭</BtnIcon> Skip</ActionBtn>
            </GameActions>
          )}
        </GameBody>
      </PageRoot>

      {gameOver && (
        <ModalOverlay>
          <GameOverModal>
            <ModalOrb>⏳</ModalOrb>
            <ModalTitle>Time's Up!</ModalTitle>
            <ModalStats>
              <ModalStat><ModalStatLabel>Difficulty</ModalStatLabel><ModalStatVal>{level}</ModalStatVal></ModalStat>
              <ModalDivider />
              <ModalStat><ModalStatLabel>Final Score</ModalStatLabel><ModalStatVal $gold>{score}</ModalStatVal></ModalStat>
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

      {showExitConfirm && (
        <ModalOverlay>
          <ExitModal>
            <ModalTitle style={{fontSize:"1.1rem"}}>Exit the Writing Game?</ModalTitle>
            <ModalSubtext>Your progress will not be saved.</ModalSubtext>
            <ModalActions>
              <ModalBtn $variant="red"   onClick={()=>confirmExit(true)}>Yes, Exit</ModalBtn>
              <ModalBtn $variant="green" onClick={()=>confirmExit(false)}>Keep Playing</ModalBtn>
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
const pulse        = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.18)}`;
const floatUp      = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const blink        = keyframes`0%,100%{opacity:1}50%{opacity:0}`;
const centeredShake= keyframes`0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-8px)}60%{transform:translateX(8px)}75%{transform:translateX(-4px)}`;
const flashRed     = keyframes`0%,100%{opacity:0}25%,75%{opacity:1}`;
const correctPop   = keyframes`0%{opacity:0;transform:scale(.6)}40%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.4)}`;
const glowPulse    = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(251,196,23,.5)}50%{box-shadow:0 0 0 12px rgba(251,196,23,0)}`;
const timerDanger  = keyframes`0%,100%{transform:scale(1);color:#ff6b6b}50%{transform:scale(1.22);color:#ff3333}`;
const dotPop       = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.35)}`;
const ringPop      = keyframes`0%{transform:scale(.7);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}`;
const hintSlideIn  = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`;
const previewIn    = keyframes`from{opacity:0;transform:scale(.94) translateY(16px)}to{opacity:1;transform:none}`;
const spinnerPulse = keyframes`0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}`;

/* ═══════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════ */
const PageRoot   = styled.div`position:relative;width:100%;min-height:100vh;height:100vh;background:#6b1f00;overflow:hidden;font-family:'Georgia',serif;color:#fff;display:flex;flex-direction:column;align-items:center;`;
const BgTexture  = styled.div`position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(0,0,0,.04) 60px,rgba(0,0,0,.04) 61px);pointer-events:none;z-index:0;`;
const BgGlow     = styled.div`position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:80vw;height:80vw;max-width:700px;max-height:700px;border-radius:50%;background:radial-gradient(circle,rgba(251,196,23,.10) 0%,transparent 70%);pointer-events:none;z-index:0;`;
const DamageOverlay = styled.div`position:fixed;inset:0;background:rgba(220,38,38,.38);pointer-events:none;z-index:9000;animation:${flashRed} .55s ease forwards;`;
const CorrectBurst  = styled.div`position:fixed;inset:0;background:rgba(251,196,23,.18);pointer-events:none;z-index:9000;animation:${correctPop} .8s ease forwards;`;

/* Header */
const Header          = styled.header`position:relative;z-index:100;width:100%;padding:12px 16px 8px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;`;
const BackBtn         = styled.button`background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;transition:transform .2s;&:hover{transform:scale(.9);}`;
const BackBtnIcon     = styled.img`width:205px;display:block;margin-top:-30px;`;
const HeaderCenter    = styled.div`flex:1;display:flex;justify-content:center;`;
const TutorialBadge   = styled.div`display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:rgba(251,196,23,.15);border:1px solid rgba(251,196,23,.4);font-size:15px;font-weight:700;color:#fde68a;`;
const TutorialBadgeDot= styled.span`width:8px;height:8px;border-radius:50%;background:#fbc417;box-shadow:0 0 6px rgba(251,196,23,.8);animation:${blink} 1.4s ease-in-out infinite;`;
const ScoreRow        = styled.div`display:flex;align-items:center;gap:10px;`;
const StatPill        = styled.div`display:flex;align-items:center;gap:8px;padding:5px 12px 5px 10px;border-radius:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px);`;
const StatIcon        = styled.span`font-size:13px;opacity:.55;color:#fbc417;`;
const StatBody        = styled.div``;
const StatLabel       = styled.div`font-family:sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.55);`;
const StatVal         = styled.div`font-family:'Georgia',serif;font-size:15px;font-weight:900;line-height:1.1;color:${({$gold})=>$gold?"#fbc417":"#fff4df"};`;
const TimerPill       = styled.div`position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;`;
const TimerSvg        = styled.svg`position:absolute;inset:0;width:100%;height:100%;`;
const TimerText       = styled.div`font-family:'Georgia',serif;font-size:16px;font-weight:900;position:relative;z-index:1;color:${({$danger})=>$danger?"#ff6b6b":"#fff"};${({$danger})=>$danger&&css`animation:${timerDanger} .7s ease-in-out infinite;`}`;
const SoundBtn        = styled.button`flex-shrink:0;background:${({$active})=>$active?"rgba(34,197,94,.18)":"rgba(0,0,0,.28)"};border:1px solid ${({$active})=>$active?"rgba(34,197,94,.4)":"rgba(255,255,255,.2)"};border-radius:999px;padding:7px 12px;font-size:14px;cursor:pointer;transition:all .2s;color:white;&:hover{transform:translateY(-1px);}`;
const RightControlSlot= styled.div`width:205px;display:flex;justify-content:flex-end;`;
const LeftArt         = styled.img`position:absolute;top:0;left:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightArt        = styled.img`position:absolute;top:0;right:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;

/* ── CHARACTER PREVIEW OVERLAY ── */
const PreviewOverlay = styled.div`
  position: fixed; inset: 0; z-index: 500;
  background: rgba(10,3,0,.78);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;
const PreviewCard = styled.div`
  width: min(560px, 94vw);
  border-radius: 24px; overflow: hidden;
  background: linear-gradient(160deg, #2c1204 0%, #1e0b02 100%);
  border: 1px solid rgba(251,196,23,.28);
  box-shadow: 0 28px 70px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,220,120,.1);
  animation: ${previewIn} .45s cubic-bezier(.34,1.56,.64,1) both;
`;
const PreviewTopBar = styled.div`
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbc417, #c24010, #fbc417, transparent);
  background-size: 300% 100%;
  animation: ${keyframes`0%{background-position:-200% center}100%{background-position:200% center}`} 3s linear infinite;
`;
const PreviewHeader = styled.div`padding: 22px 28px 10px; text-align: center;`;
const PreviewTitle   = styled.h2`margin:0 0 6px;font-family:'Georgia',serif;font-size:1.3rem;font-weight:900;color:#fde68a;`;
const PreviewSubtitle= styled.p`margin:0;font-family:sans-serif;font-size:12px;color:rgba(255,242,210,.5);line-height:1.5;`;

const PreviewGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 18px 24px;
`;
const PreviewCharItem = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 14px 18px; border-radius: 16px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(251,196,23,.18);
  min-width: 90px;
  animation: ${floatUp} .4s ease both;
`;
const PreviewImg = styled.img`
  width: 72px; height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.4));
`;
const PreviewLatinLabel = styled.div`
  font-family: 'Georgia', serif; font-size: 1rem; font-weight: 900;
  color: #fbc417; letter-spacing: .5px;
`;

const PreviewFooter = styled.div`
  padding: 14px 28px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
`;
const PreviewTimerRow   = styled.div`display:flex;align-items:center;gap:10px;width:100%;`;
const PreviewTimerTrack = styled.div`flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;`;
const PreviewTimerFill  = styled.div`height:100%;border-radius:3px;background:linear-gradient(90deg,#fbc417,#f59e0b);transition:width 1s linear;`;
const PreviewTimerNum   = styled.span`font-family:sans-serif;font-size:11px;font-weight:700;color:rgba(255,242,210,.5);min-width:24px;`;
const PreviewBtn = styled.button`
  width: 100%; height: 48px; border: none; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg,#fbc417,#f59e0b);
  color: #3d2401; font-family: 'Georgia',serif; font-size:14px; font-weight:900; letter-spacing:.3px;
  box-shadow: 0 4px 18px rgba(251,196,23,.35);
  transition: transform .15s, box-shadow .15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 7px 24px rgba(251,196,23,.45); }
  &:active { transform: translateY(1px); }
`;

/* ── HINT STRIP ── */
const HintStrip = styled.div`
  position: relative; z-index: 20;
  width: min(520px, 92vw);
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(251,196,23,.1);
  border: 1px solid rgba(251,196,23,.3);
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; gap: 8px;
  animation: ${hintSlideIn} .4s ease both;
  margin-top: 4px;
`;
const HintStripLabel = styled.div`
  display: flex; align-items: center; gap: 7px;
  font-family: sans-serif; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(251,196,23,.7);
`;
const HintDot = styled.span`
  width:7px;height:7px;border-radius:50%;background:#fbc417;
  box-shadow:0 0 6px rgba(251,196,23,.9);
  animation:${blink} 1s ease-in-out infinite;flex-shrink:0;
`;
const HintCharsRow = styled.div`
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
`;
const HintCharItem = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 10px;
  background: rgba(0,0,0,.2);
  border: 1px solid rgba(251,196,23,.15);
`;
const HintImg   = styled.img`width:40px;height:40px;object-fit:contain;`;
const HintLabel = styled.div`font-family:'Georgia',serif;font-size:11px;font-weight:700;color:#fde68a;`;

/* Game body */
const GameBody   = styled.main`position:relative;z-index:10;flex:1;width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 16px 16px;overflow-y:auto;`;
const PromptStrip= styled.div`display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0 2px;animation:${floatUp} .4s ease;`;
const PromptLabel= styled.div`font-family:sans-serif;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,248,231,.6);`;
const PromptTarget=styled.div`font-family:'Georgia',serif;font-size:52px;font-weight:900;line-height:1;color:#fbc417;text-shadow:0 4px 18px rgba(251,196,23,.35),0 0 40px rgba(251,196,23,.15);letter-spacing:1px;${({$pulse})=>$pulse&&css`animation:${glowPulse} .6s ease;`}`;

const TutorialPanel  = styled.div`width:100%;max-width:500px;display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;animation:${floatUp} .4s ease;@media (max-width:720px){max-width:92vw;gap:10px;padding:4px 0 0;}`;
const TutorialHeading= styled.h2`font-family:'Georgia',serif;font-size:20px;font-weight:700;margin:0;color:#fde68a;letter-spacing:.3px;@media (max-width:720px){font-size:16px;text-align:center;}`;
const CaptionBubble  = styled.div`width:100%;padding:12px 18px;border-radius:16px;background:rgba(0,0,0,.28);border:1px solid rgba(255,220,150,.25);backdrop-filter:blur(8px);box-shadow:inset 0 1px 0 rgba(255,255,255,.06);@media (max-width:720px){padding:10px 12px;border-radius:14px;}`;
const CaptionText    = styled.p`
  margin:0;
  font-family:'Georgia',serif;
  font-size:clamp(11.5px,2.1vw,14px);
  line-height:1.45;
  color:#fff8e8;
  min-height:22px;
  overflow-wrap:anywhere;
  word-break:break-word;
  text-wrap:pretty;

  @media (max-width:720px){
    font-size:12px;
    line-height:1.4;
  }

  @media (max-width:420px){
    font-size:11.5px;
    line-height:1.35;
  }
`;
const CaptionCursor  = styled.span`display:inline-block;width:2px;height:1em;background:#fbc417;margin-left:2px;vertical-align:text-bottom;animation:${blink} .8s step-start infinite;`;
const ProgressDots   = styled.div`display:flex;gap:7px;align-items:center;`;
const Dot            = styled.span`width:${({$current})=>$current?"24px":"10px"};height:10px;border-radius:999px;background:${({$active})=>$active?"#fbc417":"rgba(255,255,255,.2)"};box-shadow:${({$active})=>$active?"0 0 8px rgba(251,196,23,.7)":"none"};transition:all .3s ease;${({$current})=>$current&&css`animation:${dotPop} 1.4s ease-in-out infinite;`}`;

const CountdownOverlay= styled.div`position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;z-index:200;`;
const CountdownRing   = styled.div`width:120px;height:120px;border-radius:50%;border:4px solid rgba(251,196,23,.5);background:rgba(251,196,23,.08);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(251,196,23,.2);animation:${ringPop} .9s ease;`;
const CountdownNum    = styled.div`font-family:'Georgia',serif;font-size:64px;font-weight:900;color:#fbc417;text-shadow:0 0 20px rgba(251,196,23,.6);`;
const CountdownHint   = styled.div`font-family:sans-serif;font-size:15px;font-weight:600;letter-spacing:.8px;color:rgba(255,255,255,.7);text-transform:uppercase;`;

const CanvasSection= styled.div`display:flex;flex-direction:column;align-items:center;gap:10px;`;
const CanvasFrame  = styled.div`position:relative;border-radius:20px;padding:10px;background:linear-gradient(135deg,rgba(139,90,43,.5) 0%,rgba(80,40,10,.6) 100%);border:1px solid rgba(251,196,23,.25);box-shadow:0 8px 32px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,220,150,.15),inset 0 -1px 0 rgba(0,0,0,.3);${({$shake})=>$shake&&css`animation:${centeredShake} .4s ease;`}${({$correct})=>$correct&&css`border-color:rgba(34,197,94,.6);box-shadow:0 0 20px rgba(34,197,94,.3);`}`;
const CanvasBg     = styled.div`position:absolute;inset:10px;border-radius:12px;background:#fdf8f0;z-index:0;`;
const Corner       = styled.div`position:absolute;width:18px;height:18px;border-color:rgba(251,196,23,.55);border-style:solid;z-index:2;pointer-events:none;${({$pos})=>{switch($pos){case"tl":return css`top:6px;left:6px;border-width:2px 0 0 2px;border-radius:4px 0 0 0;`;case"tr":return css`top:6px;right:6px;border-width:2px 2px 0 0;border-radius:0 4px 0 0;`;case"bl":return css`bottom:6px;left:6px;border-width:0 0 2px 2px;border-radius:0 0 0 4px;`;case"br":return css`bottom:6px;right:6px;border-width:0 2px 2px 0;border-radius:0 0 4px 0;`;default:return"";}}}`;
const Canvas       = styled.canvas`position:relative;z-index:1;width:min(400px,80vw);height:min(400px,80vw);background:transparent;border-radius:12px;cursor:crosshair;touch-action:none;display:block;`;
const ResultTag    = styled.div`font-family:sans-serif;font-size:14px;font-weight:700;letter-spacing:.3px;padding:8px 20px;border-radius:999px;color:${({$correct,$error})=>$error?"#fca5a5":$correct?"#bbf7d0":"#fca5a5"};background:${({$correct,$error})=>$error?"rgba(127,29,29,.5)":$correct?"rgba(22,101,52,.4)":"rgba(127,29,29,.4)"};border:1px solid ${({$correct,$error})=>$error?"rgba(252,165,165,.4)":$correct?"rgba(74,222,128,.4)":"rgba(252,165,165,.35)"};animation:${floatUp} .3s ease;`;

const TutorialActions= styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const GameActions    = styled.div`display:flex;gap:10px;width:min(420px,84vw);justify-content:center;`;
const ActionBtn      = styled.button`display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 20px;border-radius:12px;font-family:'Georgia',serif;font-size:14px;font-weight:700;letter-spacing:.2px;cursor:${({disabled})=>disabled?"not-allowed":"pointer"};opacity:${({disabled})=>disabled?.55:1};transition:transform .15s ease,filter .15s ease,box-shadow .15s ease;flex:${({$variant})=>$variant==="primary"?"2":"1"};${({$variant})=>{if($variant==="primary")return css`background:linear-gradient(135deg,#fbc417 0%,#f59e0b 100%);border:none;color:#3d2401;box-shadow:0 4px 14px rgba(251,196,23,.35),inset 0 1px 0 rgba(255,255,255,.25);&:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(251,196,23,.45);}&:active:not(:disabled){transform:translateY(1px);}`;return css`background:rgba(255,255,255,.06);border:1px solid rgba(251,196,23,.3);color:#fff7e7;&:hover:not(:disabled){background:rgba(255,255,255,.1);transform:translateY(-1px);}&:active:not(:disabled){transform:translateY(1px);}`;}}`;
const BtnIcon        = styled.span`font-size:13px;opacity:.9;`;
const SpinnerDot     = styled.span`display:inline-block;width:7px;height:7px;border-radius:50%;background:#3d2401;animation:${spinnerPulse} 1.2s ease-in-out infinite;animation-delay:${({$d})=>$d||"0s"};`;

const ModalOverlay  = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;`;
const GameOverModal = styled.div`background:linear-gradient(160deg,#2c1204 0%,#1a0b02 100%);border:1px solid rgba(251,196,23,.3);border-radius:24px;padding:36px 32px 28px;width:100%;max-width:380px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,220,120,.12);animation:${ringPop} .4s ease;`;
const ExitModal     = styled(GameOverModal)``;
const ModalOrb      = styled.div`font-size:40px;margin-bottom:8px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4));`;
const ModalTitle    = styled.h2`font-family:'Georgia',serif;font-size:1.5rem;font-weight:900;margin:0 0 20px;color:#fde68a;letter-spacing:.3px;`;
const ModalSubtext  = styled.p`font-family:sans-serif;font-size:13px;color:rgba(255,255,255,.5);margin:-12px 0 20px;`;
const ModalStats    = styled.div`display:flex;justify-content:center;align-items:center;gap:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 24px;margin-bottom:24px;`;
const ModalStat     = styled.div`display:flex;flex-direction:column;gap:4px;align-items:center;`;
const ModalStatLabel= styled.div`font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.5);`;
const ModalStatVal  = styled.div`font-family:'Georgia',serif;font-size:22px;font-weight:900;color:${({$gold})=>$gold?"#fbc417":"#fff4df"};`;
const ModalDivider  = styled.div`width:1px;height:40px;background:rgba(255,255,255,.1);`;
const ModalActions  = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const ModalBtn      = styled.button`flex:1;min-width:120px;padding:11px 18px;border-radius:12px;font-family:'Georgia',serif;font-size:14px;font-weight:700;cursor:${({disabled})=>disabled?"not-allowed":"pointer"};opacity:${({disabled})=>disabled?.45:1};transition:transform .15s ease,filter .15s ease;border:none;&:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08);}&:active:not(:disabled){transform:translateY(1px);}${({$variant})=>{if($variant==="amber")return css`background:linear-gradient(135deg,#f59e0b,#d97706);color:#3d2401;`;if($variant==="green")return css`background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;`;if($variant==="red")return css`background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;`;return css`background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;`;}}`;