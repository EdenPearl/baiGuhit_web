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
import soundIcon from "../../../Assests/sound.png";
import muteIcon from "../../../Assests/mute.png";
import preGameMusic from "../../../Assests/drag.mp3";
import dragMusic from "../../../Assests/Tap.mp3";
import stoneClick from "../../../Assests/stone.mp3";

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

const LEVEL_CHARACTER_MAP = {
  easy:   { label:"Easy",   chars:[{latin:"A",img:bay_a},{latin:"BA",img:bay_ba},{latin:"NA",img:bay_na},{latin:"KA",img:bay_ka}] },
  medium: { label:"Medium", chars:[{latin:"E/I",img:bay_ei},{latin:"NGA",img:bay_nga},{latin:"WA",img:bay_wa}] },
  hard:   { label:"Hard",   chars:[{latin:"PA",img:bay_pa},{latin:"GA",img:bay_ga},{latin:"HA",img:bay_ha}] },
  expert: { label:"Expert", chars:[{latin:"MA",img:bay_ma},{latin:"DA",img:bay_da},{latin:"TA",img:bay_ta},{latin:"SA",img:bay_sa}] },
  master: { label:"Master", chars:[{latin:"YA",img:bay_ya},{latin:"O/U",img:bay_ou},{latin:"LA",img:bay_la}] },
};

const FALLBACK_CHARACTERS = {
  easy:["A","BA","NA","KA"], medium:["E/I","NGA","WA"],
  hard:["PA","GA","HA"], expert:["MA","DA","TA","SA"], master:["YA","O/U","LA"],
};

const TUTORIAL_CAPTIONS = {
  intro:"Hello there. I am your Baybayin teacher. Today we will practice a, ba, and ka, then play round one.",
  this_is_a:"This is a.", trace_a:"Now, trace the Baybayin character a.",
  this_is_ba:"This is ba. One sound: bah.", trace_ba:"Now, trace the Baybayin character ba.",
  this_is_ka:"This is ka, pronounced as one sound: ka.", trace_ka:"Now, trace the Baybayin character ka.",
  ready_to_play:"Excellent work. Round one starts now. Write the Baybayin equivalent of the letter I show you.",
};

const TUTORIAL_TRACE_PATHS = {
  a:"M28 62 C44 43, 72 41, 95 54 C106 61, 114 70, 120 80 M60 90 L124 38 M58 114 L128 62 M118 78 C109 111, 111 148, 125 170 C133 181, 148 186, 165 183 C186 179, 201 163, 210 140 C223 108, 236 76, 263 48 C279 31, 297 20, 320 14",
  ba:"M150 116 C125 148, 89 173, 59 165 C32 158, 28 119, 47 88 C72 47, 124 28, 175 38 C223 47, 259 82, 262 115 C266 148, 241 176, 203 182 C177 186, 159 180, 151 166 C146 156, 146 139, 150 116",
  ka:"M36 68 C84 26, 156 20, 220 44 C258 58, 286 62, 306 50 M160 34 C160 94, 160 120, 160 144 M36 176 C90 140, 162 132, 226 152 C262 164, 287 167, 306 156",
};

const LEVEL_SEQUENCE = ["Easy","Medium","Hard","Expert","Master"];
const normalizeLevel  = (l) => String(l||"").trim().toLowerCase();

const WriteModeV2 = () => {
  const GAME_DURATION_SECONDS  = 30;
  const PREVIEW_DURATION_MS    = 5000;
  const HINT_THRESHOLD_SECONDS = 18;

  const canvasRef = useRef(null);
  const navigate  = useNavigate();
  const { submitWriteResult } = useWriteSubmission();
  const { insertScore }       = useInsertLeaderboard();
  const { updateScore }       = useUpdateLeaderboard();

  const submitLockRef          = useRef(false);
  const requestAbortRef        = useRef(null);
  const nextRoundTimerRef      = useRef(null);
  const wrongFlashTimerRef     = useRef(null);
  const leaderboardSaveLockRef = useRef(false);
  const playedLevelsRef        = useRef(new Set());
  const audioCtxRef            = useRef(null);
  const preGameMusicRef        = useRef(null);
  const bgMusicRef             = useRef(null);
  const stoneClickRef          = useRef(null);
  const previewTimerRef        = useRef(null);

  const [soundEnabled,      setSoundEnabled]      = useState(true);
  const [showTutorial,      setShowTutorial]      = useState(true);
  const [tutorialPhase,     setTutorialPhase]     = useState("intro");
  const [typedCaption,      setTypedCaption]      = useState("");
  const [countdown,         setCountdown]         = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [currentCaption,    setCurrentCaption]    = useState(TUTORIAL_CAPTIONS.intro);
  const [isDrawing,         setIsDrawing]         = useState(false);
  const [level,             setLevel]             = useState("Easy");
  const [roundNumber,       setRoundNumber]       = useState(1);
  const [score,             setScore]             = useState(0);
  const [time,              setTime]              = useState(GAME_DURATION_SECONDS);
  const [gameOver,          setGameOver]          = useState(false);
  const [showExitConfirm,   setShowExitConfirm]   = useState(false);
  const [targetLetter,      setTargetLetter]      = useState("A");
  const [targetKey,         setTargetKey]         = useState("A");
  const [prediction,        setPrediction]        = useState(null);
  const [isLoading,         setIsLoading]         = useState(false);
  const [flash,             setFlash]             = useState(false);
  const [isWrong,           setIsWrong]           = useState(false);
  const [isCorrectAnim,     setIsCorrectAnim]     = useState(false);
  const [showPreview,       setShowPreview]       = useState(false);
  const [previewDismissed,  setPreviewDismissed]  = useState(false);
  const [previewCountdown,  setPreviewCountdown]  = useState(5);
  const [hintVisible,       setHintVisible]       = useState(false);
  const [hintPanelOpen,     setHintPanelOpen]     = useState(false);

  const CANVAS_WIDTH  = 440;
  const CANVAS_HEIGHT = 440;

  const isTutorialTracePhase = ["a_trace","ba_trace","ka_trace"].includes(tutorialPhase);
  const isTutorialShowPhase  = ["a_show","ba_show","ka_show"].includes(tutorialPhase);
  const currentTutorialCharacter = tutorialPhase.startsWith("a_")?"a":tutorialPhase.startsWith("ba_")?"ba":tutorialPhase.startsWith("ka_")?"ka":null;
  const tutorialPhases    = ["intro","a_show","a_trace","ba_show","ba_trace","ka_show","ka_trace"];
  const tutorialStepIndex = Math.max(0, tutorialPhases.indexOf(tutorialPhase));

  const getNextLevel = (cur) => {
    const idx = LEVEL_SEQUENCE.findIndex((l)=>normalizeLevel(l)===normalizeLevel(cur));
    return idx===-1||idx===LEVEL_SEQUENCE.length-1?null:LEVEL_SEQUENCE[idx+1];
  };
  const levelToRound = (lvl) => { const n=normalizeLevel(lvl); if(n==="expert")return 3; if(n==="master")return 4; return 1; };

  const currentLevelData = LEVEL_CHARACTER_MAP[normalizeLevel(level)] || LEVEL_CHARACTER_MAP.easy;

  const startPreview = () => {
    setShowPreview(true); setPreviewDismissed(false);
    setPreviewCountdown(Math.round(PREVIEW_DURATION_MS/1000));
    let remaining = Math.round(PREVIEW_DURATION_MS/1000);
    const tick = setInterval(()=>{
      remaining-=1; setPreviewCountdown(remaining);
      if(remaining<=0){ clearInterval(tick); dismissPreview(); }
    },1000);
    previewTimerRef.current = tick;
  };

  const dismissPreview = () => {
    if(previewTimerRef.current){ clearInterval(previewTimerRef.current); previewTimerRef.current=null; }
    setShowPreview(false); setPreviewDismissed(true);
  };

  useEffect(()=>{
    if(!showTutorial&&!gameOver&&!showPreview&&previewDismissed){
      if(time<=HINT_THRESHOLD_SECONDS&&time>0){ setHintVisible(true); }
      else if(time>HINT_THRESHOLD_SECONDS){ setHintVisible(false); setHintPanelOpen(false); }
    }
  },[time,showTutorial,gameOver,showPreview,previewDismissed]);

  // Close hint panel when game ends
  useEffect(()=>{
    if(gameOver){ setHintPanelOpen(false); }
  },[gameOver]);

  useEffect(()=>()=>{ if(previewTimerRef.current) clearInterval(previewTimerRef.current); },[]);

  const ensureAudioContext = () => {
    if(typeof window==="undefined")return null;
    const AudioCtx=window.AudioContext||window.webkitAudioContext; if(!AudioCtx)return null;
    if(!audioCtxRef.current) audioCtxRef.current=new AudioCtx();
    if(audioCtxRef.current.state==="suspended") audioCtxRef.current.resume().catch(()=>{});
    return audioCtxRef.current;
  };
  const playTone=(freq,dur=0.1,type="sine",vol=0.03)=>{
    if(!soundEnabled)return; const ctx=ensureAudioContext(); if(!ctx)return;
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type; osc.frequency.value=freq;
    gain.gain.setValueAtTime(vol,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+dur);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+dur);
  };
  const playCorrectSound=()=>{playTone(520,.1,"triangle",.04);setTimeout(()=>playTone(660,.12,"triangle",.04),85);};
  const playWrongSound=()=>{playTone(210,.16,"sawtooth",.035);setTimeout(()=>playTone(170,.12,"sawtooth",.03),75);};
  const playTimeUpSound=()=>{playTone(240,.2,"square",.035);setTimeout(()=>playTone(180,.22,"square",.03),140);};
  const playStoneClick=()=>{ if(!soundEnabled||!stoneClickRef.current)return; try{stoneClickRef.current.currentTime=0;stoneClickRef.current.play().catch(()=>{});}catch{} };

  const drawCanvasBase=({mode="none"}={})=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d"); if(!ctx)return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#fdf8f0"; ctx.fillRect(0,0,canvas.width,canvas.height);
    if(mode==="none"||!currentTutorialCharacter)return;
    const pathData=TUTORIAL_TRACE_PATHS[currentTutorialCharacter]; if(!pathData)return;
    const path=new Path2D(pathData); ctx.save();
    const scale=Math.min(430/320,250/220),dw=320*scale,dh=220*scale;
    ctx.translate((canvas.width-dw)/2,(canvas.height-dh)/2); ctx.scale(scale,scale);
    if(mode==="trace"){ctx.strokeStyle="rgba(139,90,43,0.28)";ctx.lineWidth=7;ctx.setLineDash([8,10]);}
    else{ctx.strokeStyle="#5c3d1e";ctx.lineWidth=8;ctx.setLineDash([]);}
    ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke(path);ctx.restore();
  };

  const advanceTutorial=()=>{
    const next={intro:["a_show",TUTORIAL_CAPTIONS.this_is_a],a_show:["a_trace",TUTORIAL_CAPTIONS.trace_a],a_trace:["ba_show",TUTORIAL_CAPTIONS.this_is_ba],ba_show:["ba_trace",TUTORIAL_CAPTIONS.trace_ba],ba_trace:["ka_show",TUTORIAL_CAPTIONS.this_is_ka],ka_show:["ka_trace",TUTORIAL_CAPTIONS.trace_ka]};
    if(next[tutorialPhase]){setTutorialPhase(next[tutorialPhase][0]);setCurrentCaption(next[tutorialPhase][1]);}
    else if(tutorialPhase==="ka_trace"){setCurrentCaption(TUTORIAL_CAPTIONS.ready_to_play);startCountdownToGame();}
  };
  const startCountdownToGame=()=>{setIsCountdownActive(true);setCountdown(3);};

  useEffect(()=>{
    if(!isCountdownActive||countdown==null)return;
    if(countdown===0){setIsCountdownActive(false);setCountdown(null);setShowTutorial(false);startPreview();getRandomCharacter("Easy");return;}
    const t=setTimeout(()=>setCountdown((p)=>p-1),900); return()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isCountdownActive,countdown]);

  useEffect(()=>{
    if(!showTutorial||isCountdownActive){setTypedCaption("");return;}
    let idx=0; setTypedCaption("");
    const text=currentCaption; if(!text)return;
    const t=setInterval(()=>{idx+=1;setTypedCaption(text.slice(0,idx));if(idx>=text.length)clearInterval(t);},28);
    return()=>clearInterval(t);
  },[showTutorial,currentCaption,isCountdownActive]);

  useEffect(()=>{const p=(e)=>{if(isDrawing)e.preventDefault();};window.addEventListener("touchmove",p,{passive:false});return()=>window.removeEventListener("touchmove",p);},[isDrawing]);
  useEffect(()=>()=>{if(nextRoundTimerRef.current)clearTimeout(nextRoundTimerRef.current);if(wrongFlashTimerRef.current)clearTimeout(wrongFlashTimerRef.current);if(requestAbortRef.current)requestAbortRef.current.abort();},[]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    canvas.width=CANVAS_WIDTH;canvas.height=CANVAS_HEIGHT;
    const ctx=canvas.getContext("2d");
    const mode=isTutorialTracePhase?"trace":isTutorialShowPhase?"show":"none";
    drawCanvasBase({mode:showTutorial?mode:"none"});
    ctx.lineWidth=4;ctx.lineCap="round";ctx.strokeStyle="#3e2d19";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[showTutorial,isTutorialTracePhase,isTutorialShowPhase,currentTutorialCharacter]);

  useEffect(()=>{if(showTutorial&&(isTutorialTracePhase||isTutorialShowPhase))drawCanvasBase({mode:isTutorialTracePhase?"trace":"show"});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[showTutorial,isTutorialTracePhase,isTutorialShowPhase,currentTutorialCharacter]);

  useEffect(()=>{
    if(showTutorial||gameOver||showPreview)return;
    const t=setInterval(()=>{setTime((v)=>{if(v<=1){clearInterval(t);setGameOver(true);return 0;}return v-1;});},1000);
    return()=>clearInterval(t);
  },[showTutorial,gameOver,showPreview]);

  useEffect(()=>{if(gameOver)playTimeUpSound();},[gameOver]);

  useEffect(()=>{
    preGameMusicRef.current=new Audio(preGameMusic);preGameMusicRef.current.loop=true;preGameMusicRef.current.volume=0.2;
    bgMusicRef.current=new Audio(dragMusic);bgMusicRef.current.loop=true;bgMusicRef.current.volume=0.2;
    stoneClickRef.current=new Audio(stoneClick);stoneClickRef.current.volume=0.45;
    return()=>[preGameMusicRef,bgMusicRef,stoneClickRef].forEach((r)=>{if(r.current){r.current.pause();r.current.currentTime=0;}});
  },[]);

  useEffect(()=>{
    if(preGameMusicRef.current){soundEnabled&&showTutorial?preGameMusicRef.current.play().catch(()=>{}):preGameMusicRef.current.pause();}
    if(bgMusicRef.current){soundEnabled&&!showTutorial&&!gameOver?bgMusicRef.current.play().catch(()=>{}):bgMusicRef.current.pause();}
  },[soundEnabled,showTutorial,gameOver]);

  useEffect(()=>{if(!gameOver)leaderboardSaveLockRef.current=false;},[gameOver]);
  useEffect(()=>{
    if(!gameOver||leaderboardSaveLockRef.current)return;
    leaderboardSaveLockRef.current=true;
    const save=async()=>{try{const ld=localStorage.getItem("loginData");if(!ld)return;const u=JSON.parse(ld);if(!u?.id)return;const s=normalizeLevel(level);const hp=playedLevelsRef.current.has(s);const r=hp?await updateScore(u.id,s,score):await insertScore(u.id,s,score);if(r.success&&!hp)playedLevelsRef.current.add(s);}catch(e){console.error(e);}};
    save();
  },[gameOver,level,score,insertScore,updateScore]);

  const getCoords=(e)=>{const canvas=canvasRef.current;const rect=canvas.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return{x:((cx-rect.left)/rect.width)*canvas.width,y:((cy-rect.top)/rect.height)*canvas.height};};
  const startDrawing=(e)=>{if(gameOver||showPreview)return;setIsDrawing(true);const ctx=canvasRef.current.getContext("2d");const{x,y}=getCoords(e);ctx.strokeStyle="#3e2d19";ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(x,y);};
  const draw=(e)=>{if(!isDrawing||gameOver)return;const ctx=canvasRef.current.getContext("2d");const{x,y}=getCoords(e);ctx.lineTo(x,y);ctx.stroke();};
  const stopDrawing=()=>setIsDrawing(false);
  const handleClear=()=>{if(gameOver)return;playStoneClick();drawCanvasBase({mode:showTutorial?(isTutorialTracePhase?"trace":isTutorialShowPhase?"show":"none"):"none"});setPrediction(null);};

  const getRandomCharacter=async(diffLevel=level)=>{
    const apply=(key)=>{setTargetKey(key);setTargetLetter(key.includes("_")?key.replace(/_/g,"/"):key);};
    try{const res=await fetch(`http://localhost:5000/get_random_character?difficulty=${diffLevel.toLowerCase()}`);const data=await res.json();if(data.success)apply(data.character);}
    catch{const pool=FALLBACK_CHARACTERS[diffLevel.toLowerCase()]||FALLBACK_CHARACTERS.easy;apply(pool[Math.floor(Math.random()*pool.length)]);}
  };

  const handleSubmit=async()=>{
    if(showTutorial||gameOver||isLoading||submitLockRef.current||showPreview)return;
    playStoneClick();
    const canvas=canvasRef.current,ctx=canvas.getContext("2d");
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let hasStroke=false;for(let i=0;i<pixels.length;i+=4)if(pixels[i]<200||pixels[i+1]<200||pixels[i+2]<200){hasStroke=true;break;}
    if(!hasStroke)return;
    submitLockRef.current=true;setIsLoading(true);
    if(nextRoundTimerRef.current){clearTimeout(nextRoundTimerRef.current);nextRoundTimerRef.current=null;}
    if(wrongFlashTimerRef.current){clearTimeout(wrongFlashTimerRef.current);wrongFlashTimerRef.current=null;}
    if(requestAbortRef.current){requestAbortRef.current.abort();requestAbortRef.current=null;}
    const controller=new AbortController();requestAbortRef.current=controller;
    try{
      const{width:sw,height:sh}=canvas,srcPx=ctx.getImageData(0,0,sw,sh).data;
      let minX=sw,minY=sh,maxX=0,maxY=0;
      for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const idx=(y*sw+x)*4;const g=0.299*srcPx[idx]+0.587*srcPx[idx+1]+0.114*srcPx[idx+2];if(g<200){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}}
      const hasBox=maxX>minX&&maxY>minY,bbox=Math.max(maxX-minX,maxY-minY),pad=Math.round(bbox*0.15+6);
      const cx=Math.max(0,minX-pad),cy2=Math.max(0,minY-pad),cw=Math.min(sw,maxX+pad+1)-cx,ch=Math.min(sh,maxY+pad+1)-cy2;
      const OUT=96,off=document.createElement("canvas");off.width=OUT;off.height=OUT;
      const octx=off.getContext("2d");octx.fillStyle="#ffffff";octx.fillRect(0,0,OUT,OUT);
      if(hasBox){const sc=Math.min(OUT/cw,OUT/ch)*0.80;octx.drawImage(canvas,cx,cy2,cw,ch,(OUT-cw*sc)/2,(OUT-ch*sc)/2,cw*sc,ch*sc);}
      const ip=octx.getImageData(0,0,OUT,OUT),d=ip.data;
      for(let i=0;i<d.length;i+=4){const g=Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]);const v=g<180?0:255;d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;}
      octx.putImageData(ip,0,0);
      const imageData=off.toDataURL("image/png"),sendTarget=targetKey.toLowerCase().replace(/_/g,"/");
      const fallback=async()=>{const b64=imageData.split(",")[1],bc=atob(b64),ba=new Uint8Array(bc.length);for(let i=0;i<bc.length;i++)ba[i]=bc.charCodeAt(i);const fd=new FormData();fd.append("baybayin_photo",new Blob([ba],{type:"image/png"}),"drawing.png");const r=await fetch("/heroku-proxy/check_image/",{method:"POST",body:fd,signal:controller.signal});const t=await r.text();let p;try{p=JSON.parse(t);}catch{p=t.trim().replace(/"/g,"");}return{success:true,prediction:{predicted:p,is_correct:p.toLowerCase()===sendTarget.toLowerCase(),confidence:null}};};
      let data=null;
      try{const r=await fetch("http://localhost:5000/submit_drawing",{method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,body:JSON.stringify({image:imageData,target_character:sendTarget,difficulty:level.toLowerCase(),round:roundNumber})});data=await r.json();if(!data.success||data.prediction?.retry_message)data=await fallback();}
      catch(e){if(e.name==="AbortError")throw e;data=await fallback();}
      if(data.success){
        const pred=data.prediction;setPrediction(pred);
        submitWriteResult({targetCharacter:sendTarget,predictedCharacter:pred?.predicted||"",isCorrect:!!pred?.is_correct,confidence:pred?.confidence,imageBase64:imageData}).catch(()=>{});
        if(pred.is_correct){playCorrectSound();setScore((s)=>s+1);setIsCorrectAnim(true);setTimeout(()=>setIsCorrectAnim(false),1000);confetti({particleCount:120,spread:70,origin:{y:0.6},colors:["#fbc417","#f97316","#fde68a","#fff"]});nextRoundTimerRef.current=setTimeout(()=>{getRandomCharacter(level);handleClear();nextRoundTimerRef.current=null;},3000);}
        else if(!pred.retry_message){playWrongSound();setFlash(true);setIsWrong(true);wrongFlashTimerRef.current=setTimeout(()=>{setFlash(false);setIsWrong(false);handleClear();wrongFlashTimerRef.current=null;},600);}
      }
    }catch(e){if(e.name!=="AbortError"){console.error(e);setPrediction({retry_message:"Network error"});}}
    finally{setIsLoading(false);submitLockRef.current=false;requestAbortRef.current=null;}
  };

  const handleSkip=()=>{if(showTutorial||gameOver||showPreview)return;playStoneClick();if(nextRoundTimerRef.current){clearTimeout(nextRoundTimerRef.current);nextRoundTimerRef.current=null;}if(wrongFlashTimerRef.current){clearTimeout(wrongFlashTimerRef.current);wrongFlashTimerRef.current=null;}getRandomCharacter(level);handleClear();};
  const handleBackClick=()=>setShowExitConfirm(true);
  const confirmExit=(yes)=>{setShowExitConfirm(false);if(yes)navigate("/homegame");};
  const resetRound=(lvl=level)=>{if(nextRoundTimerRef.current){clearTimeout(nextRoundTimerRef.current);nextRoundTimerRef.current=null;}if(wrongFlashTimerRef.current){clearTimeout(wrongFlashTimerRef.current);wrongFlashTimerRef.current=null;}setPrediction(null);handleClear();setLevel(lvl);setRoundNumber(levelToRound(lvl));setScore(0);setTime(GAME_DURATION_SECONDS);setGameOver(false);setHintVisible(false);setHintPanelOpen(false);setPreviewDismissed(false);leaderboardSaveLockRef.current=false;startPreview();getRandomCharacter(lvl);};
  const handleRestart=()=>resetRound(level);
  const handleNextRound=()=>{const nl=getNextLevel(level);if(nl)resetRound(nl);};

  const tutorialPrimaryLabel=tutorialPhase==="ka_trace"?"Done & Start Game":isTutorialTracePhase?"Done":"Next";
  const showTutorialAction=showTutorial&&!isCountdownActive;
  const nextLevel=getNextLevel(level);
  const timerProgress=time/GAME_DURATION_SECONDS;
  const circumference=2*Math.PI*22;
  const strokeDashoffset=circumference*(1-timerProgress);

  return (
    <>
      <PageRoot>
        <BgTexture /><BgGlow />
        {flash && <DamageOverlay />}
        {isCorrectAnim && <CorrectBurst />}

        <Header>
          <BackBtn onClick={handleBackClick}>
            <BackBtnIcon src={back} alt="Back" />
            <ControlText>Back</ControlText>
          </BackBtn>
          <HeaderCenter>
            {showTutorial ? (
              <TutorialBadge><TutorialBadgeDot />Tutorial Mode</TutorialBadge>
            ) : (
              <ScoreRow>
                <StatPill><StatIcon>✦</StatIcon><StatBody><StatLabel>Score</StatLabel><StatVal $gold>{score}</StatVal></StatBody></StatPill>
                <TimerPill>
                  <TimerSvg viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                    <circle cx="25" cy="25" r="22" fill="none" stroke={time<=5?"#ff6b6b":"#fbc417"} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 25 25)"/>
                  </TimerSvg>
                  <TimerText $danger={time<=5}>{String(time).padStart(2,"0")}</TimerText>
                </TimerPill>
                <StatPill><StatIcon>◈</StatIcon><StatBody><StatLabel>Level</StatLabel><StatVal>{level}</StatVal></StatBody></StatPill>
              </ScoreRow>
            )}
          </HeaderCenter>
          <RightControlSlot>
            <SoundBtn onClick={()=>{ensureAudioContext();playStoneClick();setSoundEnabled(p=>!p);}} $active={soundEnabled}>
              <SoundBtnImg src={soundEnabled?soundIcon:muteIcon} alt={soundEnabled?"Sound on":"Sound off"} />
              <ControlText>{soundEnabled?"Sound":"Mute"}</ControlText>
            </SoundBtn>
          </RightControlSlot>
        </Header>

        <LeftArt src={write1} /><RightArt src={write2} />

        {/* ════════ CHARACTER PREVIEW ════════ */}
        {showPreview && (
          <PreviewOverlay>
            <PreviewCard>
              <PreviewTopBar />
              <PreviewHeader>
                <PreviewEyebrow>Round Characters</PreviewEyebrow>
                <PreviewTitle>Memorise these Baybayin characters</PreviewTitle>
                <PreviewSubtitle>You will be asked to write their Latin equivalents</PreviewSubtitle>
              </PreviewHeader>

              <PreviewOrbs>
                {currentLevelData.chars.map(({ latin, img }, i) => (
                  <PreviewOrb key={latin} $index={i}>
                    <PreviewOrbGlow />
                    <PreviewOrbRing />
                    <PreviewOrbImg src={img} alt={latin} />
                  </PreviewOrb>
                ))}
              </PreviewOrbs>

              <PreviewFooter>
                <PreviewTimerRow>
                  <PreviewTimerTrack>
                    <PreviewTimerFill style={{ width:`${(previewCountdown/(PREVIEW_DURATION_MS/1000))*100}%` }} />
                  </PreviewTimerTrack>
                  <PreviewTimerNum>{previewCountdown}s</PreviewTimerNum>
                </PreviewTimerRow>
                <PreviewBtn onClick={dismissPreview}>
                  <PreviewBtnShimmer />
                  Got it — Start!
                </PreviewBtn>
              </PreviewFooter>
            </PreviewCard>
          </PreviewOverlay>
        )}

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
              <CaptionBubble><CaptionText>{typedCaption}<CaptionCursor /></CaptionText></CaptionBubble>
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

          {((showTutorial && tutorialPhase!=="intro") || !showTutorial) && (
            <CanvasSection>
              <CanvasWrapper>
                <CanvasFrame $shake={!showTutorial&&isWrong} $correct={isCorrectAnim}>
                  <CanvasBg />
                  <Canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                  />
                  <Corner $pos="tl"/><Corner $pos="tr"/><Corner $pos="bl"/><Corner $pos="br"/>
                </CanvasFrame>

                {/* ── HINT ICON BUTTON ── */}
                {!showTutorial && hintVisible && (
                  <HintIconBtn
                    $mobile={false}
                    $open={hintPanelOpen}
                    onClick={() => setHintPanelOpen(p => !p)}
                    title="Show hint"
                  >
                    <HintIconBtnPulse $open={hintPanelOpen} />
                    {hintPanelOpen ? "✕" : "?"}
                  </HintIconBtn>
                )}

                {/* ── HINT SLIDE PANEL ── */}
                {!showTutorial && hintVisible && (
                  <HintSlidePanel $mobile={false} $open={hintPanelOpen}>
                    <HintSlidePanelInner>
                      <HintSlideLabel>
                        <HintSlideDot />Quick Hint
                      </HintSlideLabel>
                      <HintSlideOrbs>
                        {currentLevelData.chars.map(({ latin, img }) => (
                          <HintSlideOrb key={latin}>
                            <HintSlideOrbImg src={img} alt={latin} />
                          </HintSlideOrb>
                        ))}
                      </HintSlideOrbs>
                    </HintSlidePanelInner>
                  </HintSlidePanel>
                )}
              </CanvasWrapper>

              {!showTutorial && prediction && (
                <ResultTag $correct={!!prediction.is_correct} $error={!!prediction.retry_message}>
                  {prediction.retry_message?`⚠ ${prediction.retry_message}`:prediction.is_correct?"✓ Correct!":`✗ Got: ${String(prediction.predicted||"").toUpperCase()}`}
                </ResultTag>
              )}
            </CanvasSection>
          )}

          {showTutorial && showTutorialAction && (
            <TutorialActions>
              {isTutorialTracePhase && <ActionBtn $variant="ghost" onClick={handleClear}><BtnIcon>⌫</BtnIcon> Clear Trace</ActionBtn>}
              <ActionBtn $variant="primary" onClick={()=>{if(isTutorialTracePhase)handleClear();advanceTutorial();}}>{tutorialPrimaryLabel} <BtnIcon>→</BtnIcon></ActionBtn>
            </TutorialActions>
          )}

          {!showTutorial && (
            <GameActions>
              <ActionBtn $variant="ghost" onClick={handleClear}><BtnIcon>⌫</BtnIcon> Clear</ActionBtn>
              <ActionBtn $variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading?<><SpinnerDot/><SpinnerDot $d="0.15s"/><SpinnerDot $d="0.3s"/></>:<><BtnIcon>➤</BtnIcon> Submit</>}
              </ActionBtn>
              <ActionBtn $variant="ghost" onClick={handleSkip}><BtnIcon>⏭</BtnIcon> Skip</ActionBtn>
            </GameActions>
          )}

          {!showTutorial && hintVisible && (
            <MobileHintDock>
              <HintIconBtn
                $mobile
                $open={hintPanelOpen}
                onClick={() => setHintPanelOpen(p => !p)}
                title="Show hint"
              >
                <HintIconBtnPulse $open={hintPanelOpen} />
                {hintPanelOpen ? "✕" : "?"}
              </HintIconBtn>

              <HintSlidePanel $mobile $open={hintPanelOpen}>
                <HintSlidePanelInner>
                  <HintSlideLabel>
                    <HintSlideDot />Quick Hint
                  </HintSlideLabel>
                  <HintSlideOrbs>
                    {currentLevelData.chars.map(({ latin, img }) => (
                      <HintSlideOrb key={latin}>
                        <HintSlideOrbImg src={img} alt={latin} />
                      </HintSlideOrb>
                    ))}
                  </HintSlideOrbs>
                </HintSlidePanelInner>
              </HintSlidePanel>
            </MobileHintDock>
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
              <ModalBtn $variant="green" onClick={handleNextRound} disabled={!nextLevel}>{nextLevel?`Next: ${nextLevel} →`:"Max Level"}</ModalBtn>
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
              <ModalBtn $variant="red" onClick={()=>confirmExit(true)}>Yes, Exit</ModalBtn>
              <ModalBtn $variant="green" onClick={()=>confirmExit(false)}>Keep Playing</ModalBtn>
            </ModalActions>
          </ExitModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default WriteModeV2;

/* ═══════════════════════════════════ ANIMATIONS ═══════════════════════════════════ */
const floatUp       = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const blink         = keyframes`0%,100%{opacity:1}50%{opacity:0}`;
const centeredShake = keyframes`0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-8px)}60%{transform:translateX(8px)}75%{transform:translateX(-4px)}`;
const flashRed      = keyframes`0%,100%{opacity:0}25%,75%{opacity:1}`;
const correctPop    = keyframes`0%{opacity:0;transform:scale(.6)}40%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.4)}`;
const glowPulse     = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(251,196,23,.5)}50%{box-shadow:0 0 0 12px rgba(251,196,23,0)}`;
const timerDanger   = keyframes`0%,100%{transform:scale(1);color:#ff6b6b}50%{transform:scale(1.22);color:#ff3333}`;
const dotPop        = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.35)}`;
const ringPop       = keyframes`0%{transform:scale(.7);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}`;
const spinnerPulse  = keyframes`0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}`;
const shimmerBg     = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;
const previewIn     = keyframes`from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:none}`;
const hintBtnPulseAnim = keyframes`0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.4);opacity:0}`;

/* ═══════════════════════════════════ BASE STYLES ═══════════════════════════════════ */
const PageRoot    = styled.div`position:relative;width:100%;min-height:100vh;height:100vh;background:#6b1f00;overflow:hidden;font-family:'Georgia',serif;color:#fff;display:flex;flex-direction:column;align-items:center;`;
const BgTexture   = styled.div`position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(0,0,0,.04) 60px,rgba(0,0,0,.04) 61px);pointer-events:none;z-index:0;`;
const BgGlow      = styled.div`position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:80vw;height:80vw;max-width:700px;max-height:700px;border-radius:50%;background:radial-gradient(circle,rgba(251,196,23,.10) 0%,transparent 70%);pointer-events:none;z-index:0;`;
const DamageOverlay = styled.div`position:fixed;inset:0;background:rgba(220,38,38,.38);pointer-events:none;z-index:9000;animation:${flashRed} .55s ease forwards;`;
const CorrectBurst  = styled.div`position:fixed;inset:0;background:rgba(251,196,23,.18);pointer-events:none;z-index:9000;animation:${correctPop} .8s ease forwards;`;
const Header          = styled.header`position:relative;z-index:100;width:100%;padding:12px 16px 8px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;`;
const BackBtn         = styled.button`
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
const BackBtnIcon     = styled.img`
  width:205px;
  display:block;

  @media(min-width:721px){
    width:180px;
    margin:0 auto;
    object-fit:contain;
  }

  @media(max-width:720px){display:none;}
`;
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
const SoundBtn        = styled.button`
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
const SoundBtnImg     = styled.img`
  width:205px;
  display:block;

  @media(min-width:721px){
    width:180px;
    margin:0 auto;
    object-fit:contain;
  }

  @media(max-width:720px){display:none;}
`;
const ControlText     = styled.span`display:none;@media(max-width:720px){display:inline-block;font-family:sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff1cf;line-height:1;}`;
const RightControlSlot= styled.div`width:205px;display:flex;justify-content:flex-end;@media(max-width:720px){width:auto;}`;
const LeftArt         = styled.img`position:absolute;top:0;left:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;
const RightArt        = styled.img`position:absolute;top:0;right:-40px;width:290px;opacity:.85;pointer-events:none;z-index:1;`;

/* ═══════════════════════════════════ PREVIEW OVERLAY ═══════════════════════════════════ */
const PreviewOverlay = styled.div`
  position:fixed;inset:0;z-index:500;
  background:rgba(6,1,0,.85);backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:20px;
`;
const PreviewCard = styled.div`
  width:min(580px,94vw);border-radius:28px;overflow:hidden;
  background:linear-gradient(160deg,#2c1204 0%,#1a0800 55%,#0e0400 100%);
  border:1px solid rgba(251,196,23,.2);
  box-shadow:0 32px 80px rgba(0,0,0,.75),0 0 0 1px rgba(251,196,23,.06),inset 0 1px 0 rgba(255,220,120,.1);
  animation:${previewIn} .5s cubic-bezier(.34,1.56,.64,1) both;
`;
const PreviewTopBar  = styled.div`height:3px;background:linear-gradient(90deg,transparent,#fbc417,#c24010,#fbc417,transparent);background-size:300% 100%;animation:${shimmerBg} 3s linear infinite;`;
const PreviewHeader  = styled.div`padding:26px 32px 4px;text-align:center;display:flex;flex-direction:column;gap:5px;`;
const PreviewEyebrow = styled.div`font-family:sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(251,196,23,.5);`;
const PreviewTitle   = styled.h2`margin:0;font-family:'Georgia',serif;font-size:clamp(1.1rem,3vw,1.4rem);font-weight:900;color:#fde68a;`;
const PreviewSubtitle= styled.p`margin:0;font-family:sans-serif;font-size:12px;line-height:1.55;color:rgba(255,242,210,.38);`;

const PreviewOrbs = styled.div`
  display:flex;flex-wrap:wrap;justify-content:center;align-items:center;
  gap:clamp(16px,3.5vw,28px);
  padding:28px 24px 16px;
`;
const PreviewOrb = styled.div`
  position:relative;
  width:clamp(84px,13vw,112px);height:clamp(84px,13vw,112px);
  display:flex;align-items:center;justify-content:center;
  &:hover img{transform:scale(1.14);filter:drop-shadow(0 0 16px rgba(251,196,23,.9)) brightness(1.2);}
`;
const PreviewOrbGlow = styled.div`
  position:absolute;inset:-10px;border-radius:50%;
  background:radial-gradient(circle,rgba(251,196,23,.16) 0%,transparent 68%);
  pointer-events:none;
`;
const PreviewOrbRing = styled.div`
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:repeating-conic-gradient(rgba(251,196,23,.3) 0deg 10deg,transparent 10deg 20deg);
  -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),white calc(100% - 2px));
  mask:radial-gradient(farthest-side,transparent calc(100% - 2px),white calc(100% - 2px));
`;
const PreviewOrbImg = styled.img`
  width:66%;height:66%;object-fit:contain;position:relative;z-index:1;
  filter:drop-shadow(0 4px 14px rgba(0,0,0,.55)) brightness(1.1);
  transition:transform .25s ease,filter .25s ease;
`;

const PreviewFooter    = styled.div`padding:8px 28px 26px;display:flex;flex-direction:column;align-items:center;gap:13px;`;
const PreviewTimerRow   = styled.div`display:flex;align-items:center;gap:10px;width:100%;`;
const PreviewTimerTrack = styled.div`flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden;`;
const PreviewTimerFill  = styled.div`height:100%;border-radius:2px;background:linear-gradient(90deg,#fbc417,#f59e0b);transition:width 1s linear;`;
const PreviewTimerNum   = styled.span`font-family:sans-serif;font-size:11px;font-weight:700;color:rgba(255,242,210,.4);min-width:22px;`;
const PreviewBtn = styled.button`
  position:relative;overflow:hidden;
  width:100%;height:50px;border:none;border-radius:14px;cursor:pointer;
  background:linear-gradient(135deg,#fde68a 0%,#fbc417 45%,#f59e0b 100%);
  color:#3d2401;font-family:'Georgia',serif;font-size:14px;font-weight:900;letter-spacing:.4px;
  box-shadow:0 4px 20px rgba(251,196,23,.4),inset 0 1px 0 rgba(255,255,255,.25);
  transition:transform .15s,box-shadow .15s;
  &:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(251,196,23,.55);}
  &:active{transform:translateY(1px);}
`;
const PreviewBtnShimmer = styled.span`
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
  background-size:200% 100%;animation:${shimmerBg} 2.2s linear infinite;
`;

/* ═══════════════════════════════════ GAME BODY STYLES ═══════════════════════════════════ */
const GameBody    = styled.main`position:relative;z-index:10;flex:1;width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 16px 16px;overflow-y:auto;`;
const PromptStrip = styled.div`display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0 2px;animation:${floatUp} .4s ease;`;
const PromptLabel = styled.div`font-family:sans-serif;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,248,231,.6);`;
const PromptTarget= styled.div`font-family:'Georgia',serif;font-size:52px;font-weight:900;line-height:1;color:#fbc417;text-shadow:0 4px 18px rgba(251,196,23,.35),0 0 40px rgba(251,196,23,.15);letter-spacing:1px;${({$pulse})=>$pulse&&css`animation:${glowPulse} .6s ease;`}`;
const TutorialPanel  = styled.div`width:100%;max-width:500px;display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;animation:${floatUp} .4s ease;@media(max-width:720px){max-width:92vw;}`;
const TutorialHeading= styled.h2`font-family:'Georgia',serif;font-size:20px;font-weight:700;margin:0;color:#fde68a;`;
const CaptionBubble  = styled.div`width:100%;padding:12px 18px;border-radius:16px;background:rgba(0,0,0,.28);border:1px solid rgba(255,220,150,.25);backdrop-filter:blur(8px);`;
const CaptionText    = styled.p`margin:0;font-family:'Georgia',serif;font-size:clamp(11.5px,2.1vw,14px);line-height:1.45;color:#fff8e8;min-height:22px;`;
const CaptionCursor  = styled.span`display:inline-block;width:2px;height:1em;background:#fbc417;margin-left:2px;vertical-align:text-bottom;animation:${blink} .8s step-start infinite;`;
const ProgressDots   = styled.div`display:flex;gap:7px;align-items:center;`;
const Dot            = styled.span`width:${({$current})=>$current?"24px":"10px"};height:10px;border-radius:999px;background:${({$active})=>$active?"#fbc417":"rgba(255,255,255,.2)"};box-shadow:${({$active})=>$active?"0 0 8px rgba(251,196,23,.7)":"none"};transition:all .3s ease;${({$current})=>$current&&css`animation:${dotPop} 1.4s ease-in-out infinite;`}`;
const CountdownOverlay= styled.div`position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;z-index:200;`;
const CountdownRing   = styled.div`width:120px;height:120px;border-radius:50%;border:4px solid rgba(251,196,23,.5);background:rgba(251,196,23,.08);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(251,196,23,.2);animation:${ringPop} .9s ease;`;
const CountdownNum    = styled.div`font-family:'Georgia',serif;font-size:64px;font-weight:900;color:#fbc417;text-shadow:0 0 20px rgba(251,196,23,.6);`;
const CountdownHint   = styled.div`font-family:sans-serif;font-size:15px;font-weight:600;letter-spacing:.8px;color:rgba(255,255,255,.7);text-transform:uppercase;`;
const CanvasSection   = styled.div`display:flex;flex-direction:column;align-items:center;gap:10px;`;

/* ── CANVAS WRAPPER — positions the hint button relative to the canvas ── */
const CanvasWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  overflow: visible;
`;

const CanvasFrame     = styled.div`position:relative;border-radius:20px;padding:10px;background:linear-gradient(135deg,rgba(139,90,43,.5) 0%,rgba(80,40,10,.6) 100%);border:1px solid rgba(251,196,23,.25);box-shadow:0 8px 32px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,220,150,.15),inset 0 -1px 0 rgba(0,0,0,.3);${({$shake})=>$shake&&css`animation:${centeredShake} .4s ease;`}${({$correct})=>$correct&&css`border-color:rgba(34,197,94,.6);box-shadow:0 0 20px rgba(34,197,94,.3);`}`;
const CanvasBg        = styled.div`position:absolute;inset:10px;border-radius:12px;background:#fdf8f0;z-index:0;`;
const Corner          = styled.div`position:absolute;width:18px;height:18px;border-color:rgba(251,196,23,.55);border-style:solid;z-index:2;pointer-events:none;${({$pos})=>{switch($pos){case"tl":return css`top:6px;left:6px;border-width:2px 0 0 2px;border-radius:4px 0 0 0;`;case"tr":return css`top:6px;right:6px;border-width:2px 2px 0 0;border-radius:0 4px 0 0;`;case"bl":return css`bottom:6px;left:6px;border-width:0 0 2px 2px;border-radius:0 0 0 4px;`;case"br":return css`bottom:6px;right:6px;border-width:0 2px 2px 0;border-radius:0 0 4px 0;`;default:return"";}}}`;
const Canvas          = styled.canvas`position:relative;z-index:1;width:min(400px,80vw);height:min(400px,80vw);background:transparent;border-radius:12px;cursor:crosshair;touch-action:none;display:block;`;
const ResultTag       = styled.div`font-family:sans-serif;font-size:14px;font-weight:700;letter-spacing:.3px;padding:8px 20px;border-radius:999px;color:${({$correct,$error})=>$error?"#fca5a5":$correct?"#bbf7d0":"#fca5a5"};background:${({$correct,$error})=>$error?"rgba(127,29,29,.5)":$correct?"rgba(22,101,52,.4)":"rgba(127,29,29,.4)"};border:1px solid ${({$correct,$error})=>$error?"rgba(252,165,165,.4)":$correct?"rgba(74,222,128,.4)":"rgba(252,165,165,.35)"};animation:${floatUp} .3s ease;`;
const TutorialActions = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const GameActions     = styled.div`display:flex;gap:10px;width:min(420px,84vw);justify-content:center;`;
const ActionBtn       = styled.button`display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 20px;border-radius:12px;font-family:'Georgia',serif;font-size:14px;font-weight:700;cursor:${({disabled})=>disabled?"not-allowed":"pointer"};opacity:${({disabled})=>disabled?.55:1};transition:transform .15s ease,filter .15s ease,box-shadow .15s ease;flex:${({$variant})=>$variant==="primary"?"2":"1"};${({$variant})=>{if($variant==="primary")return css`background:linear-gradient(135deg,#fbc417 0%,#f59e0b 100%);border:none;color:#3d2401;box-shadow:0 4px 14px rgba(251,196,23,.35),inset 0 1px 0 rgba(255,255,255,.25);&:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(251,196,23,.45);}&:active:not(:disabled){transform:translateY(1px);}`;return css`background:rgba(255,255,255,.06);border:1px solid rgba(251,196,23,.3);color:#fff7e7;&:hover:not(:disabled){background:rgba(255,255,255,.1);transform:translateY(-1px);}&:active:not(:disabled){transform:translateY(1px);}`;}}`;
const BtnIcon         = styled.span`font-size:13px;opacity:.9;`;
const SpinnerDot      = styled.span`display:inline-block;width:7px;height:7px;border-radius:50%;background:#3d2401;animation:${spinnerPulse} 1.2s ease-in-out infinite;animation-delay:${({$d})=>$d||"0s"};`;

/* ═══════════════════════════════════ HINT BUTTON & SLIDE PANEL ═══════════════════════════════════ */
const HintIconBtn = styled.button`
  position: absolute;
  bottom: 0;
  left: calc(100% + 10px);
  right: auto;
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${({ $open }) => $open ? "rgba(251,196,23,0.9)" : "rgba(251,196,23,0.55)"};
  background: ${({ $open }) =>
    $open
      ? "linear-gradient(135deg,#fbc417,#f59e0b)"
      : "linear-gradient(135deg,rgba(55,18,0,0.95),rgba(35,10,0,0.98))"};
  color: ${({ $open }) => ($open ? "#3d2401" : "#fbc417")};
  font-family: 'Georgia', serif;
  font-size: ${({ $open }) => ($open ? "14px" : "22px")};
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,196,23,0.12),
              ${({ $open }) => $open ? "0 0 20px rgba(251,196,23,0.4)" : "none"};
  transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease,
              box-shadow 0.22s ease, transform 0.15s ease;
  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.93); }

  ${({ $mobile }) =>
    $mobile &&
    css`
      display: none;
      position: relative;
      left: auto;
      right: auto;
      bottom: auto;
    `}

  @media (max-width: 980px) {
    left: auto;
    right: 0;
    bottom: -52px;
  }

  @media (max-width: 720px) {
    ${({ $mobile }) =>
      $mobile
        ? css`
            display: flex;
          `
        : css`
            display: none;
          `}
  }
`;

const HintIconBtnPulse = styled.span`
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid rgba(251,196,23,0.5);
  pointer-events: none;
  ${({ $open }) =>
    !$open &&
    css`animation: ${hintBtnPulseAnim} 1.9s ease-out infinite;`}
`;

const MobileHintDock = styled.div`
  display: none;
  position: relative;

  @media (max-width: 720px) {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: min(420px, 84vw);
    margin-top: 4px;
    z-index: 25;
  }
`;

const HintSlidePanel = styled.div`
  position: absolute;
  bottom: 0;
  left: calc(100% + 58px);
  right: auto;
  z-index: 19;
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open, $mobile }) =>
    $mobile
      ? ($open ? "translate(-50%, 0) scale(1)" : "translate(-50%, 10px) scale(0.92)")
      : ($open ? "translateX(0) scale(1)" : "translateX(12px) scale(0.92)")};
  transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.34,1.56,0.64,1);

  ${({ $mobile }) =>
    $mobile &&
    css`
      display: none;
    `}

  @media (max-width: 980px) {
    left: auto;
    right: 46px;
    bottom: -52px;
  }

  @media (max-width: 720px) {
    ${({ $mobile }) =>
      $mobile
        ? css`
            display: block;
            left: 50%;
            right: auto;
            top: 50px;
            bottom: auto;
            z-index: 30;
          `
        : css`
            display: none;
          `}
  }
`;

const HintSlidePanelInner = styled.div`
  padding: 10px 14px 12px;
  border-radius: 18px 18px 4px 18px;
  background: rgba(14,4,0,0.92);
  border: 1px solid rgba(251,196,23,0.35);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 36px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,196,23,0.06),
              inset 0 1px 0 rgba(255,220,120,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`;

const HintSlideLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: sans-serif;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(251,196,23,0.6);
`;

const HintSlideDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fbc417;
  box-shadow: 0 0 6px rgba(251,196,23,0.9);
  animation: ${blink} 1s ease-in-out infinite;
  flex-shrink: 0;
`;

const HintSlideOrbs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const HintSlideOrb = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(251,196,23,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,196,23,0.05);
  transition: border-color 0.2s, background 0.2s;
  &:hover {
    border-color: rgba(251,196,23,0.45);
    background: rgba(255,255,255,0.1);
  }
`;

const HintSlideOrbImg = styled.img`
  width: 65%;
  height: 65%;
  object-fit: contain;
  filter: drop-shadow(0 2px 7px rgba(0,0,0,0.5)) brightness(1.15);
`;

/* ═══════════════════════════════════ MODAL STYLES ═══════════════════════════════════ */
const ModalOverlay    = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;`;
const GameOverModal   = styled.div`background:linear-gradient(160deg,#2c1204 0%,#1a0b02 100%);border:1px solid rgba(251,196,23,.3);border-radius:24px;padding:36px 32px 28px;width:100%;max-width:380px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,220,120,.12);animation:${ringPop} .4s ease;`;
const ExitModal       = styled(GameOverModal)``;
const ModalOrb        = styled.div`font-size:40px;margin-bottom:8px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4));`;
const ModalTitle      = styled.h2`font-family:'Georgia',serif;font-size:1.5rem;font-weight:900;margin:0 0 20px;color:#fde68a;`;
const ModalSubtext    = styled.p`font-family:sans-serif;font-size:13px;color:rgba(255,255,255,.5);margin:-12px 0 20px;`;
const ModalStats      = styled.div`display:flex;justify-content:center;align-items:center;gap:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 24px;margin-bottom:24px;`;
const ModalStat       = styled.div`display:flex;flex-direction:column;gap:4px;align-items:center;`;
const ModalStatLabel  = styled.div`font-family:sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,242,210,.5);`;
const ModalStatVal    = styled.div`font-family:'Georgia',serif;font-size:22px;font-weight:900;color:${({$gold})=>$gold?"#fbc417":"#fff4df"};`;
const ModalDivider    = styled.div`width:1px;height:40px;background:rgba(255,255,255,.1);`;
const ModalActions    = styled.div`display:flex;gap:10px;justify-content:center;flex-wrap:wrap;`;
const ModalBtn        = styled.button`flex:1;min-width:120px;padding:11px 18px;border-radius:12px;font-family:'Georgia',serif;font-size:14px;font-weight:700;cursor:${({disabled})=>disabled?"not-allowed":"pointer"};opacity:${({disabled})=>disabled?.45:1};transition:transform .15s ease,filter .15s ease;border:none;&:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08);}&:active:not(:disabled){transform:translateY(1px);}${({$variant})=>{if($variant==="amber")return css`background:linear-gradient(135deg,#f59e0b,#d97706);color:#3d2401;`;if($variant==="green")return css`background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;`;if($variant==="red")return css`background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;`;return css`background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;`;}}`;