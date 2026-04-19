import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import bay1 from '../../../Assests/bay1.png';
import bay2 from '../../../Assests/bay2.png';
import bay3 from '../../../Assests/bay3.png';
import bay4 from '../../../Assests/bay4.png';
import bay5 from '../../../Assests/bay5.png';
import bay6 from '../../../Assests/bay6.png';
import bay7 from '../../../Assests/bay7.png';
import bay8 from '../../../Assests/bay8.png';
import bay9 from '../../../Assests/bay9.png';
import plate1   from '../../../Assests/plate1.png';
import plate2   from '../../../Assests/plate2.png';
import plate3   from '../../../Assests/plate3.png';
import sound    from '../../../Assests/sound.png';
import gameName from '../../../Assests/bAI.png';
import write    from '../../../Assests/write.png';
import tap      from '../../../Assests/tap.png';
import translate from '../../../Assests/translate.png';
import bounceMusic from '../../../Assests/home.mp3';
import mute     from '../../../Assests/mute.png';
import leaderboard from '../../../Assests/Leaderboard.png';

const LAST_ACTIVE_MODE_KEY = 'homeGameActivePlate';

/* ═══════════════════════════════════════════════
   BAYBAYIN CHARACTERS — character + latin label
════════════════════════════════════════════════ */
const BAYBAYIN_CHARS = [
  { glyph: 'ᜀ', latin: 'A'  },
  { glyph: 'ᜊ', latin: 'BA' },
  { glyph: 'ᜃ', latin: 'KA' },
  { glyph: 'ᜇ', latin: 'DA' },
  { glyph: 'ᜄ', latin: 'GA' },
  { glyph: 'ᜑ', latin: 'HA' },
  { glyph: 'ᜁ', latin: 'I'  },
  { glyph: 'ᜎ', latin: 'LA' },
  { glyph: 'ᜋ', latin: 'MA' },
  { glyph: 'ᜈ', latin: 'NA' },
  { glyph: 'ᜅ', latin: 'NGA'},
  { glyph: 'ᜂ', latin: 'O/U'},
  { glyph: 'ᜉ', latin: 'PA' },
  { glyph: 'ᜍ', latin: 'RA' },
  { glyph: 'ᜐ', latin: 'SA' },
  { glyph: 'ᜆ', latin: 'TA' },
  { glyph: 'ᜏ', latin: 'WA' },
  { glyph: 'ᜌ', latin: 'YA' },
];

/* ═══════════════════════════════════════════════
   SCRIPTURE PANEL SVG — stone slab background
════════════════════════════════════════════════ */
const ScriptureStoneSVG = () => (
  <svg width="100%" height="100%" viewBox="0 0 320 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="scr-stone" cx="38%" cy="28%" r="70%">
        <stop offset="0%"   stopColor="#4a1c08"/>
        <stop offset="55%"  stopColor="#2e1005"/>
        <stop offset="100%" stopColor="#1a0802"/>
      </radialGradient>
      <radialGradient id="scr-face" cx="42%" cy="32%" r="62%">
        <stop offset="0%"   stopColor="#3d1606"/>
        <stop offset="100%" stopColor="#200c03"/>
      </radialGradient>
      <radialGradient id="scr-glow" cx="50%" cy="50%" r="55%">
        <stop offset="0%"   stopColor="#fbc417" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="#fbc417" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="scr-edge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#6b3010" stopOpacity="0.8"/>
        <stop offset="40%"  stopColor="#fbc417" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="#1a0802" stopOpacity="0.9"/>
      </linearGradient>
      <filter id="scr-inner-shadow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    {/* Outer stone body */}
    <path d="M18 22 Q22 8 40 6 Q160 2 280 6 Q298 8 302 22
             L308 80 Q312 130 312 200 Q312 310 308 390
             L302 460 Q298 514 280 516 Q160 520 40 516
             Q22 514 18 460 L12 390 Q8 310 8 200
             Q8 130 12 80 Z"
      fill="url(#scr-stone)"/>

    {/* Stone face (inner lit surface) */}
    <path d="M26 28 Q30 14 46 12 Q160 8 274 12 Q290 14 294 28
             L299 82 Q303 130 303 200 Q303 308 299 386
             L294 454 Q290 508 274 510 Q160 514 46 510
             Q30 508 26 454 L21 386 Q17 308 17 200
             Q17 130 21 82 Z"
      fill="url(#scr-face)"/>

    {/* Ambient glow in center */}
    <ellipse cx="160" cy="240" rx="120" ry="160" fill="url(#scr-glow)" className="scr-breathe"/>

    {/* Carved horizontal lines (stone texture) */}
    {[60, 100, 140, 340, 380, 420, 460].map((y, i) => (
      <line key={i} x1="28" y1={y} x2="292" y2={y}
        stroke="#1a0802" strokeWidth="1.2" strokeOpacity="0.55"/>
    ))}

    {/* Top decorative band */}
    <rect x="26" y="18" width="268" height="36" rx="2" fill="#1a0802" fillOpacity="0.5"/>
    <line x1="26" y1="18"  x2="294" y2="18"  stroke="#fbc417" strokeWidth="0.8" strokeOpacity="0.35" className="scr-shimmer"/>
    <line x1="26" y1="54"  x2="294" y2="54"  stroke="#fbc417" strokeWidth="0.8" strokeOpacity="0.30" className="scr-shimmer"/>
    {/* Top band ornament text */}
    <text x="160" y="41" textAnchor="middle"
      fontFamily="Georgia,serif" fontSize="11" fontWeight="700"
      fill="#fbc417" fillOpacity="0.55" letterSpacing="8" className="scr-shimmer">
      ᜊᜌᜊᜌᜈ
    </text>

    {/* Bottom decorative band */}
    <rect x="26" y="462" width="268" height="36" rx="2" fill="#1a0802" fillOpacity="0.5"/>
    <line x1="26" y1="462" x2="294" y2="462" stroke="#fbc417" strokeWidth="0.8" strokeOpacity="0.30" className="scr-shimmer"/>
    <line x1="26" y1="498" x2="294" y2="498" stroke="#fbc417" strokeWidth="0.8" strokeOpacity="0.25" className="scr-shimmer"/>
    <text x="160" y="484" textAnchor="middle"
      fontFamily="Georgia,serif" fontSize="11" fontWeight="700"
      fill="#fbc417" fillOpacity="0.45" letterSpacing="8" className="scr-shimmer">
      ᜊᜌᜊᜌᜈ
    </text>

    {/* Left edge carved border */}
    <path d="M26 28 Q30 14 46 12" stroke="#6b3010" strokeWidth="2" fill="none" strokeOpacity="0.7"/>
    <path d="M26 28 Q30 14 46 12" stroke="#fbc417" strokeWidth="0.7" fill="none" strokeOpacity="0.22" className="scr-shimmer"/>

    {/* Corner ornament diamonds */}
    <polygon points="50,30  58,22  66,30  58,38"  fill="#fbc417" fillOpacity="0.28" className="scr-shimmer"/>
    <polygon points="254,30 262,22 270,30 262,38" fill="#fbc417" fillOpacity="0.28" className="scr-shimmer"/>
    <polygon points="50,480 58,472 66,480 58,488" fill="#fbc417" fillOpacity="0.22" className="scr-shimmer"/>
    <polygon points="254,480 262,472 270,480 262,488" fill="#fbc417" fillOpacity="0.22" className="scr-shimmer"/>

    {/* Vertical carved side lines */}
    <line x1="26"  y1="60" x2="26"  y2="460" stroke="#fbc417" strokeWidth="0.6" strokeOpacity="0.18" className="scr-shimmer"/>
    <line x1="294" y1="60" x2="294" y2="460" stroke="#fbc417" strokeWidth="0.6" strokeOpacity="0.18" className="scr-shimmer"/>

    {/* Inner border frame */}
    <rect x="36" y="64" width="248" height="392" rx="4" fill="none"
      stroke="#3d1606" strokeWidth="1.5"/>
    <rect x="36" y="64" width="248" height="392" rx="4" fill="none"
      stroke="#fbc417" strokeWidth="0.6" strokeOpacity="0.20" className="scr-shimmer"/>

    {/* Divider line between glyph area and label */}
    <line x1="60" y1="350" x2="260" y2="350"
      stroke="#fbc417" strokeWidth="0.8" strokeOpacity="0.25" className="scr-shimmer"/>

    {/* Small rune dots along divider */}
    <circle cx="160" cy="350" r="3.5" fill="#fbc417" fillOpacity="0.30" className="scr-breathe"/>
    <circle cx="80"  cy="350" r="2"   fill="#fbc417" fillOpacity="0.18"/>
    <circle cx="240" cy="350" r="2"   fill="#fbc417" fillOpacity="0.18"/>
  </svg>
);

/* ═══════════════════════════════════
   SCROLL BANNER SVG (unchanged)
═══════════════════════════════════ */
const ScrollBannerSVG = ({ label }) => (
  <svg width="100%" height="100%" viewBox="0 0 320 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="scr-bg" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#4a1c08"/>
        <stop offset="100%" stopColor="#2c1004"/>
      </radialGradient>
    </defs>
    <path d="M20 14 Q4 14 4 36 Q4 58 20 58 L24 54 Q12 54 12 36 Q12 18 24 18Z" fill="#6b3010"/>
    <path d="M20 18 Q8 18 8 36 Q8 54 20 54 L24 50 Q14 50 14 36 Q14 22 24 22Z" fill="#8b4a18"/>
    <path d="M300 14 Q316 14 316 36 Q316 58 300 58 L296 54 Q308 54 308 36 Q308 18 296 18Z" fill="#6b3010"/>
    <path d="M300 18 Q312 18 312 36 Q312 54 300 54 L296 50 Q306 50 306 36 Q306 22 296 22Z" fill="#8b4a18"/>
    <rect x="20" y="8"  width="280" height="56" rx="4" fill="url(#scr-bg)"/>
    <rect x="20" y="8"  width="280" height="56" rx="4" fill="none" stroke="#fbc417" strokeWidth="1" strokeOpacity="0.28"/>
    <line x1="32" y1="20" x2="288" y2="20" stroke="#fbc417" strokeOpacity="0.15" strokeWidth="0.8"/>
    <line x1="32" y1="52" x2="288" y2="52" stroke="#fbc417" strokeOpacity="0.15" strokeWidth="0.8"/>
    <polygon points="34,36 40,30 46,36 40,42" fill="#fbc417" fillOpacity="0.32"/>
    <polygon points="274,36 280,30 286,36 280,42" fill="#fbc417" fillOpacity="0.32"/>
    <text x="160" y="41" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17"
      fontWeight="900" letterSpacing="1.5" fill="#fde68a" fillOpacity="0.95">{label}</text>
  </svg>
);

/* ═══════════════════════════════════
   TORCH SVG (unchanged)
═══════════════════════════════════ */
const TorchSVG = ({ flip = false }) => (
  <svg width="100%" height="100%" viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg"
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }} aria-hidden="true">
    <defs>
      <radialGradient id="tch-glow" cx="50%" cy="80%" r="55%">
        <stop offset="0%" stopColor="#fbc417" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#fbc417" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect x="36" y="100" width="8"  height="90" rx="3" fill="#5c2808"/>
    <rect x="37" y="100" width="3"  height="90" rx="2" fill="#8b4a18" opacity="0.4"/>
    <rect x="30" y="136" width="20" height="6" rx="2" fill="#6b3010"/>
    <rect x="30" y="162" width="20" height="6" rx="2" fill="#6b3010"/>
    <path d="M20 88 Q40 96 60 88 L56 108 Q40 116 24 108Z" fill="#8b4a18"/>
    <path d="M24 108 Q40 116 56 108 L54 120 Q40 126 26 120Z" fill="#6b3010"/>
    <path d="M26 120 Q40 126 54 120 L52 132 Q40 136 28 132Z" fill="#5c2808"/>
    <ellipse cx="40" cy="110" rx="13" ry="4" fill="#fbc417" fillOpacity="0.4" className="tch-ember"/>
    <path d="M40 88 Q26 66 30 44 Q35 24 40 12 Q45 24 50 44 Q54 66 40 88Z" fill="#c2410c" className="tch-flame1"/>
    <path d="M40 86 Q28 64 32 44 Q36 28 40 18 Q44 28 48 44 Q52 64 40 86Z" fill="#f97316" className="tch-flame1"/>
    <path d="M40 84 Q30 62 34 44 Q37 32 40 22 Q43 32 46 44 Q50 62 40 84Z" fill="#fb923c" className="tch-flame2"/>
    <path d="M40 82 Q33 60 36 46 Q38 36 40 28 Q42 36 44 46 Q47 60 40 82Z" fill="#fde68a" className="tch-flame3"/>
    <path d="M40 76 Q37 58 38 46 Q39 38 40 32 Q41 38 42 46 Q43 58 40 76Z" fill="white" fillOpacity="0.8" className="tch-flame3"/>
    <circle cx="34" cy="42" r="2.2" fill="#fbc417" className="tch-ember1"/>
    <circle cx="46" cy="34" r="1.8" fill="#fde68a" className="tch-ember2"/>
    <circle cx="40" cy="24" r="1.4" fill="white"   className="tch-ember3"/>
    <circle cx="32" cy="30" r="1.2" fill="#fbc417" className="tch-ember2"/>
    <circle cx="48" cy="48" r="1.5" fill="#fb923c" className="tch-ember1"/>
    <circle cx="38" cy="16" r="1"   fill="#fde68a" className="tch-ember3"/>
    <ellipse cx="40" cy="90" rx="32" ry="18" fill="url(#tch-glow)" className="tch-glow"/>
  </svg>
);

/* ═══════════════════════════════════
   COMPONENT
═══════════════════════════════════ */
const HomeGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying]   = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTranslateSubmenuOpen, setIsTranslateSubmenuOpen] = useState(false);
  const [isTranslateModalOpen,   setIsTranslateModalOpen]   = useState(false);

  /* scripture cycling state */
  const [scriptureIdx,    setScriptureIdx]    = useState(0);
  const [scriptureVisible, setScriptureVisible] = useState(true);

  const [sequence, setSequence] = useState({
    write: false, scripture: false, sound: false, plate2: false,
    startGame: false, leaderboard: false, plate3: false,
    quit: false, gameName: false, leaderboardIcon: false,
  });

  const [bounceSound,          setBounceSound]          = useState(false);
  const [bounceLeaderboardIcon,setBounceLeaderboardIcon] = useState(false);
  const [hovered, setHovered] = useState({ sound: false, leaderboardIcon: false });
  const [replaceWriteWithPlate1, setReplaceWriteWithPlate1] = useState(false);
  const [activePlate, setActivePlate] = useState('write');

  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 2 + Math.random() * 4, delay: Math.random() * 6, duration: 4 + Math.random() * 6,
    }))
  );

  const floatingBaybayin = useMemo(() => ([
    { id:'bay-a', src:bay1, top:'10%', left:'9%',  widthPx:78, rotDeg:-5, floatDur:11,   floatDelay:0.2, fadeDur:5.4, fadeDelay:0.5, opacity:0.2,  blur:0.2  },
    { id:'bay-b', src:bay2, top:'18%', left:'86%', widthPx:84, rotDeg:4,  floatDur:12.6, floatDelay:0.8, fadeDur:6.2, fadeDelay:0.8, opacity:0.18, blur:0.3  },
    { id:'bay-c', src:bay3, top:'34%', left:'12%', widthPx:72, rotDeg:-3, floatDur:9.8,  floatDelay:1.1, fadeDur:5.6, fadeDelay:0.2, opacity:0.18, blur:0.1  },
    { id:'bay-d', src:bay4, top:'42%', left:'90%', widthPx:90, rotDeg:5,  floatDur:13.1, floatDelay:0.3, fadeDur:6.4, fadeDelay:0.7, opacity:0.2,  blur:0.25 },
    { id:'bay-e', src:bay5, top:'56%', left:'16%', widthPx:76, rotDeg:-4, floatDur:10.7, floatDelay:1.4, fadeDur:5.8, fadeDelay:0.6, opacity:0.16, blur:0.15 },
    { id:'bay-f', src:bay6, top:'64%', left:'84%', widthPx:86, rotDeg:3,  floatDur:12.2, floatDelay:0.5, fadeDur:6.1, fadeDelay:1.0, opacity:0.18, blur:0.2  },
    { id:'bay-g', src:bay7, top:'76%', left:'10%', widthPx:80, rotDeg:-2, floatDur:11.4, floatDelay:0.9, fadeDur:5.7, fadeDelay:0.3, opacity:0.16, blur:0.2  },
    { id:'bay-h', src:bay8, top:'82%', left:'70%', widthPx:82, rotDeg:2,  floatDur:10.2, floatDelay:0.4, fadeDur:5.3, fadeDelay:0.9, opacity:0.16, blur:0.2  },
    { id:'bay-i', src:bay9, top:'92%', left:'28%', widthPx:74, rotDeg:-6, floatDur:9.6,  floatDelay:1.2, fadeDur:5.1, fadeDelay:1.2, opacity:0.14, blur:0.15 },
  ]), []);

  /* ── Scripture cycling: fade out → swap → fade in every 2.5s ── */
  useEffect(() => {
    if (!sequence.scripture) return;
    const SHOW_MS  = 2000; // visible for 2s
    const FADE_MS  = 400;  // fade transition

    const cycle = setInterval(() => {
      // start fade-out
      setScriptureVisible(false);
      setTimeout(() => {
        setScriptureIdx(i => (i + 1) % BAYBAYIN_CHARS.length);
        setScriptureVisible(true);
      }, FADE_MS);
    }, SHOW_MS + FADE_MS);

    return () => clearInterval(cycle);
  }, [sequence.scripture]);

  const toggleMusic        = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleSidebar      = () => setIsSidebarOpen(p => !p);
  const closeSidebar       = () => { setIsSidebarOpen(false); setIsTranslateSubmenuOpen(false); };
  const toggleTranslateSubmenu  = () => setIsTranslateSubmenuOpen(p => !p);
  const openTranslateModal  = () => setIsTranslateModalOpen(true);
  const closeTranslateModal = () => setIsTranslateModalOpen(false);

  const selectMode = (mode) => {
    setActivePlate(mode);
    setReplaceWriteWithPlate1(mode !== 'write');
    try { localStorage.setItem(LAST_ACTIVE_MODE_KEY, mode); } catch {}
  };
  const goToMode = (mode) => {
    if (mode === 'multiple') navigate('/difficulty-multiple');
    if (mode === 'typing')   navigate('/difficulty-typing');
    if (mode === 'dragdrop') navigate('/difficulty-drag');
  };

  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = 0.5; audioRef.current.play().catch(() => setIsPlaying(false)); }
  }, []);

  useEffect(() => {
    try {
      const lastMode = localStorage.getItem(LAST_ACTIVE_MODE_KEY);
      if (lastMode === 'write' || lastMode === 'plate2' || lastMode === 'plate3') {
        setActivePlate(lastMode); setReplaceWriteWithPlate1(lastMode !== 'write');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('loginData');
    if (storedUser) { JSON.parse(storedUser); }
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSequence(p => ({ ...p, write: true })),           500),
      setTimeout(() => setSequence(p => ({ ...p, scripture: true })),       700),
      setTimeout(() => setSequence(p => ({ ...p, sound: true })),           600),
      setTimeout(() => setSequence(p => ({ ...p, leaderboardIcon: true })), 700),
      setTimeout(() => setSequence(p => ({ ...p, plate2: true })),          800),
      setTimeout(() => setSequence(p => ({ ...p, startGame: true })),      1000),
      setTimeout(() => setSequence(p => ({ ...p, leaderboard: true })),    1150),
      setTimeout(() => setSequence(p => ({ ...p, plate3: true })),         1200),
      setTimeout(() => setSequence(p => ({ ...p, quit: true })),           1280),
      setTimeout(() => setSequence(p => ({ ...p, gameName: true })),       1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!sequence.sound) return;
    const interval = setInterval(() => { if (!hovered.sound) { setBounceSound(true); setTimeout(() => setBounceSound(false), 1500); } }, 4000);
    return () => clearInterval(interval);
  }, [sequence.sound, hovered.sound]);

  useEffect(() => {
    if (!sequence.leaderboardIcon) return;
    const interval = setInterval(() => { if (!hovered.leaderboardIcon) { setBounceLeaderboardIcon(true); setTimeout(() => setBounceLeaderboardIcon(false), 1500); } }, 4000);
    return () => clearInterval(interval);
  }, [sequence.leaderboardIcon, hovered.leaderboardIcon]);

  const modeLabels = { write: 'Write Mode', plate2: 'Translate Mode', plate3: 'Tap Mode' };
  const modeOrder = ['write', 'plate2', 'plate3'];
  const cycleMode = (direction) => {
    const currentIndex = modeOrder.indexOf(activePlate);
    const nextIndex = (currentIndex + direction + modeOrder.length) % modeOrder.length;
    selectMode(modeOrder[nextIndex]);
  };
  const currentChar = BAYBAYIN_CHARS[scriptureIdx];

  return (
    <Container>
      <audio ref={audioRef} src={bounceMusic} loop/>
      <BgGradient/><BgTexture/><BgRadial/>

      <FloatingBaybayinLayer aria-hidden="true">
        {floatingBaybayin.map(img => (
          <FloatingBaybayinImg key={img.id} src={img.src} alt=""
            $top={img.top} $left={img.left} $w={img.widthPx} $rot={img.rotDeg}
            $floatDur={img.floatDur} $floatDelay={img.floatDelay}
            $fadeDur={img.fadeDur} $fadeDelay={img.fadeDelay}
            $opacity={img.opacity} $blur={img.blur}/>
        ))}
      </FloatingBaybayinLayer>

      {particles.map(p => (
        <Particle key={p.id}
          style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size }}
          $delay={p.delay} $duration={p.duration}/>
      ))}

      {/* ── Mode plates (left side) ── */}
      {sequence.write && (
        replaceWriteWithPlate1
          ? <Plate1 src={activePlate==='write'?write:plate1} $isActive={activePlate==='write'} onClick={()=>selectMode('write')}/>
          : <Write  src={write} $isActive={activePlate==='write'} onClick={()=>selectMode('write')}/>
      )}
      {sequence.plate2 && <Plate2 src={activePlate==='plate2'?translate:plate2} $isActive={activePlate==='plate2'} onClick={()=>selectMode('plate2')}/>}
      {sequence.plate3 && <Plate3 src={activePlate==='plate3'?tap:plate3}       $isActive={activePlate==='plate3'} onClick={()=>selectMode('plate3')}/>}

      {sequence.startGame && (
        <MobileModePicker>
          <MobileModeBtn $active={activePlate==='write'}  onClick={()=>selectMode('write')}>Write</MobileModeBtn>
          <MobileModeBtn $active={activePlate==='plate2'} onClick={()=>selectMode('plate2')}>Translate</MobileModeBtn>
          <MobileModeBtn $active={activePlate==='plate3'} onClick={()=>selectMode('plate3')}>Tap</MobileModeBtn>
        </MobileModePicker>
      )}

      {/* ════════════════════════════════════
          SCRIPTURE PANEL — right side
      ════════════════════════════════════ */}
      {sequence.scripture && (
        <ScriptureWrapper>
          {/* Stone slab background */}
          <ScriptureStoneSVG/>

          {/* Cycling content overlaid on the stone */}
          <ScriptureContent>
            {/* Title label at top */}
            <ScriptureTitle>BAYBAYIN</ScriptureTitle>

            {/* The big Baybayin glyph */}
            <GlyphArea>
              <GlyphChar $visible={scriptureVisible}>
                {currentChar.glyph}
              </GlyphChar>
              {/* Glow behind glyph */}
              <GlyphGlow $visible={scriptureVisible}/>
            </GlyphArea>

            {/* Equals / separator */}
            <EqualsMark $visible={scriptureVisible}>=</EqualsMark>

            {/* Latin equivalent below the divider */}
            <LatinLabel $visible={scriptureVisible}>
              {currentChar.latin}
            </LatinLabel>

            {/* Small progress dots */}
            <DotRow>
              {BAYBAYIN_CHARS.map((_, i) => (
                <Dot key={i} $active={i === scriptureIdx}/>
              ))}
            </DotRow>
          </ScriptureContent>

          {/* Torch beside the scripture panel */}
          <ScriptureTorch>
            <TorchSVG flip={true}/>
          </ScriptureTorch>
        </ScriptureWrapper>
      )}

      {/* ── Scroll Banner ── */}
      {sequence.startGame && (
        <ScrollBannerWrapper>
          <ModeArrowBtn $side="left" onClick={() => cycleMode(-1)} title="Previous mode" aria-label="Previous mode">&lt;</ModeArrowBtn>
          <ScrollBannerSVG label={modeLabels[activePlate]}/>
          <ModeArrowBtn $side="right" onClick={() => cycleMode(1)} title="Next mode" aria-label="Next mode">&gt;</ModeArrowBtn>
        </ScrollBannerWrapper>
      )}

      {/* ── Game name ── */}
      {sequence.gameName && <GameName src={gameName}/>}

      {/* ── Sound toggle ── */}
      {sequence.sound && (
        <RightControlSlot>
          <SoundBtn $active={isPlaying} $isBouncing={bounceSound}
            onClick={toggleMusic}
            onMouseEnter={()=>setHovered(p=>({...p,sound:true}))}
            onMouseLeave={()=>setHovered(p=>({...p,sound:false}))}
            title={isPlaying?'Mute music':'Play music'}>
            <ControlBtnIcon src={isPlaying?sound:mute} alt={isPlaying?'Sound on':'Muted'} />
            <ControlText>{isPlaying?'Sound':'Mute'}</ControlText>
          </SoundBtn>
        </RightControlSlot>
      )}

      {/* ── Leaderboard ── */}
      {sequence.leaderboardIcon && (
        <LeftControlSlot>
          <LeaderboardBtn $isBouncing={bounceLeaderboardIcon}
            onClick={toggleSidebar}
            onMouseEnter={()=>setHovered(p=>({...p,leaderboardIcon:true}))}
            onMouseLeave={()=>setHovered(p=>({...p,leaderboardIcon:false}))}
            title="Leaderboard">
            <ControlBtnIcon src={leaderboard} alt="Leaderboard" />
            <ControlText>Leaderboard</ControlText>
          </LeaderboardBtn>
        </LeftControlSlot>
      )}

      {sequence.sound && sequence.leaderboardIcon && (
        <MobileUtilityBar>
          <MobileUtilityBtn onClick={toggleMusic} title={isPlaying?'Mute':'Play'}>
            <MobileUtilityIcon>{isPlaying?'🔊':'🔇'}</MobileUtilityIcon>
          </MobileUtilityBtn>
          <MobileUtilityBtn onClick={toggleSidebar} title="Leaderboard">
            <MobileUtilityIcon>🏆</MobileUtilityIcon>
          </MobileUtilityBtn>
        </MobileUtilityBar>
      )}

      {sequence.startGame && <ActionAura aria-hidden="true"/>}

      {/* ── CTA buttons ── */}
      {sequence.startGame && (
        <StartGameWrapper>
          <GoldButton onClick={()=>{
            if (activePlate==='write') navigate('/write');
            else if (activePlate==='plate2') openTranslateModal();
            else if (activePlate==='plate3') navigate('/difficulty-tap');
          }}>
            <BtnGlow/><BtnInner><BtnIconSpan>▶</BtnIconSpan>Start Game</BtnInner>
          </GoldButton>
        </StartGameWrapper>
      )}

      {sequence.quit && (
        <QuitWrapper>
          <GhostButton onClick={()=>navigate('/')}>
            <BtnInner><BtnIconSpan style={{opacity:0.7}}>←</BtnIconSpan>Quit</BtnInner>
          </GhostButton>
        </QuitWrapper>
      )}

      {/* ═══════ SIDEBAR ═══════ */}
      <Overlay $isOpen={isSidebarOpen} onClick={closeSidebar}/>
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarTopBar/>
        <SidebarHeader>
          <SidebarBrand>
            <SidebarBrandIcon>🏆</SidebarBrandIcon>
            <SidebarBrandText>Leaderboard</SidebarBrandText>
          </SidebarBrand>
          <CloseBtn onClick={closeSidebar}>✕</CloseBtn>
        </SidebarHeader>
        <SidebarDivider/>
        <SidebarBody>
          <SidebarSubtitle>Choose a game mode to view rankings</SidebarSubtitle>
          <NavSection>
            <NavBtn $isOpen={isTranslateSubmenuOpen} onClick={toggleTranslateSubmenu}>
              <NavBtnIcon>🔄</NavBtnIcon>
              <NavBtnBody><NavBtnTitle>Translate Mode</NavBtnTitle><NavBtnSub>Multiple game types</NavBtnSub></NavBtnBody>
              <NavChevron $isOpen={isTranslateSubmenuOpen}>▾</NavChevron>
            </NavBtn>
            <Submenu $isOpen={isTranslateSubmenuOpen}>
              <SubmenuInner>
                <SubBtn onClick={()=>{navigate('/multiple-board');closeSidebar();}}><SubBtnIcon>🧠</SubBtnIcon><span>Multiple Choice</span></SubBtn>
                <SubBtn onClick={()=>{navigate('/typing-board');  closeSidebar();}}><SubBtnIcon>⌨️</SubBtnIcon><span>Typing</span></SubBtn>
                <SubBtn onClick={()=>{navigate('/drag-board');    closeSidebar();}}><SubBtnIcon>🧩</SubBtnIcon><span>Drag &amp; Drop</span></SubBtn>
              </SubmenuInner>
            </Submenu>
            <NavBtn onClick={()=>{navigate('/tap-board');closeSidebar();}}>
              <NavBtnIcon>👆</NavBtnIcon><NavBtnBody><NavBtnTitle>Tap Mode</NavBtnTitle><NavBtnSub>Quick recognition</NavBtnSub></NavBtnBody>
            </NavBtn>
            <NavBtn onClick={()=>{navigate('/write-board');closeSidebar();}}>
              <NavBtnIcon>✍️</NavBtnIcon><NavBtnBody><NavBtnTitle>Write Mode</NavBtnTitle><NavBtnSub>Practice writing</NavBtnSub></NavBtnBody>
            </NavBtn>
          </NavSection>
        </SidebarBody>
        <SidebarFooter>
          <FooterOrn>✦</FooterOrn><FooterText>EbaybayMo Thesis 2024</FooterText><FooterOrn>✦</FooterOrn>
        </SidebarFooter>
      </Sidebar>

      {/* ═══════ TRANSLATE MODAL ═══════ */}
      <ModalOverlay $isOpen={isTranslateModalOpen} onClick={closeTranslateModal}/>
      <TranslateModal $isOpen={isTranslateModalOpen}>
        <ModalTopBar/>
        <ModalHeader>
          <ModalTitleRow><ModalTitleIcon>🔄</ModalTitleIcon><ModalTitleText>Translate Mode</ModalTitleText></ModalTitleRow>
          <ModalCloseBtn onClick={closeTranslateModal}>✕</ModalCloseBtn>
        </ModalHeader>
        <ModalDivider/>
        <ModalBody>
          <ModalSubtitle>Choose your game mode to begin</ModalSubtitle>
          <ModalBtns>
            <ModalOptionBtn onClick={()=>{goToMode('multiple');closeTranslateModal();}}>
              <ModalOptionIcon>🧠</ModalOptionIcon>
              <ModalOptionText><ModalOptionTitle>Multiple Choice</ModalOptionTitle><ModalOptionSub>Select the correct answer</ModalOptionSub></ModalOptionText>
              <ModalArrow>→</ModalArrow>
            </ModalOptionBtn>
            <ModalOptionBtn onClick={()=>{goToMode('typing');closeTranslateModal();}}>
              <ModalOptionIcon>⌨️</ModalOptionIcon>
              <ModalOptionText><ModalOptionTitle>Typing</ModalOptionTitle><ModalOptionSub>Type the translation</ModalOptionSub></ModalOptionText>
              <ModalArrow>→</ModalArrow>
            </ModalOptionBtn>
            <ModalOptionBtn onClick={()=>{goToMode('dragdrop');closeTranslateModal();}}>
              <ModalOptionIcon>🧩</ModalOptionIcon>
              <ModalOptionText><ModalOptionTitle>Drag &amp; Drop</ModalOptionTitle><ModalOptionSub>Match words correctly</ModalOptionSub></ModalOptionText>
              <ModalArrow>→</ModalArrow>
            </ModalOptionBtn>
          </ModalBtns>
        </ModalBody>
      </TranslateModal>
    </Container>
  );
};

export default HomeGame;

/* ═══════════════════════════════════
   KEYFRAMES
═══════════════════════════════════ */
const waveZoom  = keyframes`0%{transform:translateX(-50%) scale(0.8) rotate(0deg);opacity:0}15%{opacity:1}50%{transform:translateX(-50%) scale(1.04) rotate(-2deg)}75%{transform:translateX(-50%) scale(0.98) rotate(2deg)}100%{transform:translateX(-50%) scale(1) rotate(0deg);opacity:1}`;
const waveIdle  = keyframes`0%,100%{transform:translateX(-50%) scale(1) rotate(0deg)}30%{transform:translateX(-50%) scale(1.03) rotate(-1.5deg)}70%{transform:translateX(-50%) scale(1.01) rotate(1.5deg)}`;
const heartbeat = keyframes`0%,100%{transform:scale(1)}25%{transform:scale(1.06)}50%{transform:scale(1)}75%{transform:scale(1.06)}`;
const shake     = keyframes`0%,74%{transform:translateY(0) rotate(0deg)}75%{transform:translateY(-10px) rotate(-6deg)}80%{transform:translateY(6px) rotate(5deg)}85%{transform:translateY(-4px) rotate(-3deg)}90%,100%{transform:translateY(0) rotate(0deg)}`;
const zoomRotate= keyframes`from{transform:scale(0) rotate(0deg);opacity:0}to{transform:scale(1) rotate(360deg);opacity:1}`;
const bounceLoop= keyframes`0%,20%,50%,80%,100%{transform:translateY(0)}40%{transform:translateY(-20px)}60%{transform:translateY(-10px)}`;
const bounceIn  = keyframes`0%{transform:translate(-50%,-50%) scale(0.6) translateY(20px);opacity:0}60%{transform:translate(-50%,-50%) scale(1.06) translateY(-4px);opacity:1}100%{transform:translate(-50%,-50%) scale(1) translateY(0);opacity:1}`;
const floatParticle = keyframes`0%{transform:translateY(0) scale(1);opacity:0}20%{opacity:0.7}80%{opacity:0.4}100%{transform:translateY(-120px) scale(0.5);opacity:0}`;
const bayFade  = keyframes`0%,100%{opacity:0.12}50%{opacity:0.36}`;
const bayDrift = keyframes`0%,100%{transform:translate(-50%,-50%) translateY(0) rotate(var(--rot))}50%{transform:translate(-50%,-50%) translateY(-12px) rotate(var(--rot))}`;
const shimmerGold = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;
const fadeSlideUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

/* scripture panel */
const scriptureEnter = keyframes`
  from{transform:translateX(120px) translateY(-50%);opacity:0}
  to  {transform:translateX(0)     translateY(-50%);opacity:1}`;
const scrBreathe = keyframes`0%,100%{opacity:0.10}50%{opacity:0.24}`;
const scrShimmer = keyframes`0%,100%{opacity:0.25}50%{opacity:0.55}`;
const scrStoneFloat = keyframes`
  0%,100%{transform:translateY(-50%) rotate(0.3deg)}
  50%    {transform:translateY(calc(-50% - 8px)) rotate(-0.3deg)}`;

/* torch */
const flameSway1 = keyframes`0%,100%{transform:scaleX(1) skewX(0deg) translateY(0)}25%{transform:scaleX(1.09) skewX(-5deg) translateY(-3px)}50%{transform:scaleX(0.93) skewX(4deg) translateY(-1px)}75%{transform:scaleX(1.07) skewX(-2deg) translateY(-4px)}`;
const flameSway2 = keyframes`0%,100%{transform:scaleX(1) skewX(0deg) translateY(0)}30%{transform:scaleX(1.07) skewX(6deg) translateY(-2px)}60%{transform:scaleX(0.95) skewX(-4deg) translateY(-3px)}`;
const flameSway3 = keyframes`0%,100%{transform:scaleX(1) translateY(0)}40%{transform:scaleX(1.05) translateY(-5px)}70%{transform:scaleX(0.96) translateY(-2px)}`;
const emberFloat1 = keyframes`0%{transform:translate(0,0) scale(1);opacity:0}15%{opacity:0.9}80%{opacity:0.4}100%{transform:translate(-9px,-44px) scale(0.25);opacity:0}`;
const emberFloat2 = keyframes`0%{transform:translate(0,0) scale(1);opacity:0}15%{opacity:0.9}80%{opacity:0.4}100%{transform:translate(7px,-48px) scale(0.2);opacity:0}`;
const emberFloat3 = keyframes`0%{transform:translate(0,0) scale(1);opacity:0}15%{opacity:0.8}80%{opacity:0.3}100%{transform:translate(2px,-56px) scale(0.2);opacity:0}`;
const torchGlow   = keyframes`0%,100%{opacity:0.5}50%{opacity:0.9}`;
const emberPulse  = keyframes`0%,100%{opacity:0.3}50%{opacity:0.75}`;
const scrollEnter = keyframes`from{transform:translateX(-50%) scaleX(0.5);opacity:0}to{transform:translateX(-50%) scaleX(1);opacity:1}`;
const scrollIdle  = keyframes`0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.012)}`;

/* ═══════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════ */
const Container = styled.div`
  width:100%;height:100vh;position:relative;overflow:hidden;font-family:'Georgia',serif;

  .scr-breathe{animation:${scrBreathe} 4s ease-in-out infinite;}
  .scr-shimmer{animation:${scrShimmer} 5s ease-in-out infinite;}

  .tch-flame1{transform-origin:50% 90%;animation:${flameSway1} 1.8s ease-in-out infinite;}
  .tch-flame2{transform-origin:50% 90%;animation:${flameSway2} 1.5s 0.2s ease-in-out infinite;}
  .tch-flame3{transform-origin:50% 90%;animation:${flameSway3} 1.2s 0.1s ease-in-out infinite;}
  .tch-ember {animation:${emberPulse}  1.4s ease-in-out infinite;}
  .tch-ember1{animation:${emberFloat1} 2.2s 0.1s ease-out infinite;}
  .tch-ember2{animation:${emberFloat2} 2.6s 0.6s ease-out infinite;}
  .tch-ember3{animation:${emberFloat3} 3.0s 1.2s ease-out infinite;}
  .tch-glow  {animation:${torchGlow}   1.9s ease-in-out infinite;}
`;

const BgGradient = styled.div`position:absolute;inset:0;background:#6b1f00;z-index:0;`;
const BgTexture  = styled.div`position:absolute;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(0,0,0,0.04) 60px,rgba(0,0,0,0.04) 61px);`;
const BgRadial   = styled.div`position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:80vw;height:80vw;max-width:700px;max-height:700px;border-radius:50%;z-index:1;pointer-events:none;background:radial-gradient(circle,rgba(251,196,23,0.10) 0%,transparent 70%);`;

const Particle = styled.span`
  position:absolute;border-radius:50%;background:rgba(251,196,23,0.55);box-shadow:0 0 6px rgba(251,196,23,0.4);pointer-events:none;z-index:2;
  animation:${floatParticle} ${({$duration})=>$duration}s ${({$delay})=>$delay}s ease-in infinite;`;

const FloatingBaybayinLayer = styled.div`position:absolute;inset:0;z-index:2;pointer-events:none;`;
const FloatingBaybayinImg   = styled.img`
  position:absolute;top:${({$top})=>$top};left:${({$left})=>$left};width:${({$w})=>`${$w}px`};height:auto;
  transform:translate(-50%,-50%);opacity:${({$opacity})=>$opacity};
  filter:${({$blur})=>`blur(${$blur}px) drop-shadow(0 6px 14px rgba(0,0,0,.35)) brightness(1.12) contrast(1.12)`};
  mix-blend-mode:lighten;--rot:${({$rot})=>`${$rot}deg`};
  animation:${bayFade} ${({$fadeDur})=>$fadeDur}s ${({$fadeDelay})=>$fadeDelay}s ease-in-out infinite,
            ${bayDrift} ${({$floatDur})=>$floatDur}s ${({$floatDelay})=>$floatDelay}s ease-in-out infinite;
  will-change:transform,opacity;
  @media(max-width:700px){opacity:${({$opacity})=>Math.min(0.14,$opacity)};width:${({$w})=>`${Math.max(54,Math.round($w*0.7))}px`};}`;

/* ═══════════════════════════════════
   SCRIPTURE PANEL
═══════════════════════════════════ */
const ScriptureWrapper = styled.div`
  position:absolute;
  top:57%;
  right:clamp(14px,1.8vw,28px);
  width:clamp(220px,22vw,300px);
  z-index:12;
  pointer-events:none;
  transform:translateY(-50%);
  animation:${scriptureEnter} 0.9s 0.75s ease-out both,
            ${scrStoneFloat}  8s  1.7s ease-in-out infinite;
  filter:none;
  opacity:0.9;
  @media(max-width:1100px){top:58%;right:10px;width:clamp(196px,20vw,258px);}
  @media(max-width:900px) {top:60%;right:8px;width:180px;}
  @media(max-width:620px) { display:none; }`;

/* All text content sits absolutely on top of the SVG stone */
const ScriptureContent = styled.div`
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:13% 9% 17%;
  pointer-events:none;
  gap:2px;`;

const ScriptureTitle = styled.div`
  font-family:'Georgia',serif;
  font-size:clamp(10px,0.86vw,12px);
  font-weight:900;
  letter-spacing:3px;
  color:#fbc417;
  opacity:0.60;
  text-transform:uppercase;
  margin-bottom:6px;`;

const GlyphArea = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:clamp(120px,14vw,170px);`;

const GlyphChar = styled.div`
  font-size:clamp(86px,8.4vw,124px);
  line-height:1;
  color:#fde68a;
  text-shadow:
    0 0 20px rgba(251,196,23,0.85),
    0 0 42px rgba(251,196,23,0.45),
    0 3px 12px rgba(0,0,0,0.8);
  font-family:'Noto Sans Tagalog','Noto Serif Tagalog','Noto Serif','Georgia',serif;
  transition:opacity 0.32s ease, transform 0.32s ease;
  opacity:${({$visible})=>$visible?1:0};
  transform:${({$visible})=>$visible?'translateY(0) scale(1)':'translateY(8px) scale(0.92)'};
  will-change:opacity,transform;
  user-select:none;`;

const GlyphGlow = styled.div`
  position:absolute;
  width:clamp(90px,8vw,118px);
  height:clamp(90px,8vw,118px);
  border-radius:50%;
  background:radial-gradient(circle, rgba(251,196,23,0.30) 0%, transparent 70%);
  pointer-events:none;
  transition:opacity 0.32s ease;
  opacity:${({$visible})=>$visible?1:0};
  filter:blur(10px);`;

const EqualsMark = styled.div`
  font-family:'Georgia',serif;
  font-size:12px;
  color:#fbc417;
  opacity:${({$visible})=>$visible?0.50:0};
  transition:opacity 0.32s ease;
  margin:5px 0 3px;
  letter-spacing:2px;`;

const LatinLabel = styled.div`
  font-family:'Georgia',serif;
  font-size:clamp(24px,2.3vw,34px);
  font-weight:900;
  letter-spacing:4px;
  color:#fde68a;
  text-shadow:0 2px 10px rgba(0,0,0,0.7), 0 0 16px rgba(251,196,23,0.35);
  transition:opacity 0.32s ease, transform 0.32s ease;
  opacity:${({$visible})=>$visible?0.95:0};
  transform:${({$visible})=>$visible?'translateY(0)':'translateY(5px)'};
  margin-bottom:10px;`;

const DotRow = styled.div`
  display:flex;
  gap:3px;
  flex-wrap:wrap;
  justify-content:center;
  max-width:70%;`;

const Dot = styled.div`
  width:${({$active})=>$active?'12px':'4px'};
  height:4px;
  border-radius:3px;
  background:${({$active})=>$active?'#fbc417':'rgba(251,196,23,0.25)'};
  transition:all 0.4s ease;
  box-shadow:${({$active})=>$active?'0 0 6px rgba(251,196,23,0.6)':'none'};`;

/* Torch — aligned relative to scripture panel scale */
const ScriptureTorch = styled.div`
  position:absolute;
  top:10%;
  left:clamp(-56px,-4.2vw,-44px);
  width:clamp(34px,3.2vw,44px);
  z-index:11;
  opacity:0.7;
  filter:drop-shadow(0 0 10px rgba(251,150,23,0.55));`;

/* ── Scroll Banner ── */
const ScrollBannerWrapper = styled.div`
  position:absolute;top:43%;left:50%;transform:translateX(-50%);
  width:clamp(190px,24vw,310px);z-index:200;
  overflow:visible;
  animation:${scrollEnter} 0.65s 1.15s ease-out both,${scrollIdle} 4.5s 1.8s ease-in-out infinite;
  @media(max-width:900px){display:none;}`;

const ModeArrowBtn = styled.button`
  position:absolute;
  top:50%;
  ${({$side})=>$side==='left'?'left:-34px;':'right:-34px;'}
  transform:translateY(-50%);
  width:30px;
  height:30px;
  border:none;
  border-radius:50%;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(251,196,23,0.18);
  color:#fde68a;
  font-family:'Georgia',serif;
  font-size:18px;
  font-weight:900;
  line-height:1;
  box-shadow:0 0 0 1px rgba(251,196,23,0.45), 0 6px 14px rgba(0,0,0,0.35);
  transition:transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  &:hover{background:rgba(251,196,23,0.32);transform:translateY(-50%) scale(1.08);}
  &:active{transform:translateY(-50%) scale(0.98);}
`;

/* ── Mode plates ── */
const Write = styled.img`
  position:absolute;top:61%;left:-8%;width:clamp(290px,44vw,550px);height:auto;
  cursor:pointer;z-index:50;pointer-events:auto;
  filter:${({$isActive})=>$isActive?'drop-shadow(0 0 18px rgba(251,196,23,0.6))':'none'};
  ${({$isActive})=>$isActive?css`animation:${heartbeat} 1.6s ease-in-out infinite;z-index:900;`:css`animation:${zoomRotate} 1s ease-out,${shake} 6s 1s ease-in-out infinite;`}
  @media(max-width:1150px){left:-14%;}@media(max-width:900px){display:none;}`;

const Plate1 = styled.img`
  position:absolute;top:61%;left:-8%;width:clamp(290px,44vw,550px);height:auto;
  cursor:pointer;z-index:50;pointer-events:auto;
  filter:${({$isActive})=>$isActive?'drop-shadow(0 0 18px rgba(251,196,23,0.6))':'none'};
  ${({$isActive})=>$isActive?css`animation:${heartbeat} 1.6s ease-in-out infinite;z-index:900;`:css`animation:${zoomRotate} 1s ease-out,${shake} 6s 1s ease-in-out infinite;`}
  @media(max-width:1150px){left:-14%;}@media(max-width:900px){display:none;}`;

const Plate2 = styled.img`
  position:absolute;top:32%;left:-8%;width:clamp(270px,40vw,500px);height:auto;
  z-index:320;cursor:pointer;pointer-events:auto;transition:filter 0.25s;
  filter:${({$isActive})=>$isActive?'drop-shadow(0 0 16px rgba(251,196,23,0.55))':'none'};
  ${({$isActive})=>$isActive?css`animation:${heartbeat} 1.6s ease-in-out infinite;z-index:1000;`:css`animation:${zoomRotate} 1s ease-out,${shake} 3.6s 0.6s ease-in-out infinite;`}
  &:hover{filter:drop-shadow(0 0 10px rgba(251,196,23,0.35));}
  @media(max-width:1150px){left:-14%;}@media(max-width:900px){display:none;}`;

const Plate3 = styled.img`
  position:absolute;top:42%;left:7%;width:clamp(280px,42vw,520px);height:auto;
  z-index:310;cursor:pointer;pointer-events:auto;transition:filter 0.25s;
  filter:${({$isActive})=>$isActive?'drop-shadow(0 0 16px rgba(251,196,23,0.55))':'none'};
  ${({$isActive})=>$isActive?css`animation:${heartbeat} 1.6s ease-in-out infinite;z-index:1000;`:css`animation:${zoomRotate} 1s ease-out,${shake} 3.6s 0.6s ease-in-out infinite;`}
  &:hover{filter:drop-shadow(0 0 10px rgba(251,196,23,0.35));}
  @media(max-width:1150px){left:2%;}@media(max-width:900px){display:none;}`;

const MobileModePicker = styled.div`
  position:absolute;top:38%;left:50%;transform:translateX(-50%);
  z-index:220;display:none;gap:8px;width:min(92vw,480px);
  @media(max-width:900px){display:grid;grid-template-columns:repeat(3,96px);justify-content:center;}
  @media(max-width:520px){top:36%;}`;

const MobileModeBtn = styled.button`
  width:96px;height:96px;border-radius:12px;padding:8px;cursor:pointer;
  border:1px solid ${({$active})=>$active?'rgba(251,196,23,0.7)':'rgba(255,255,255,0.14)'};
  background:${({$active})=>$active?'rgba(251,196,23,0.2)':'rgba(0,0,0,0.28)'};
  color:${({$active})=>$active?'#fde68a':'#fff6eb'};
  font-family:sans-serif;font-size:12px;font-weight:700;letter-spacing:0.2px;line-height:1.15;
  transition:all 0.2s ease;display:inline-flex;align-items:center;justify-content:center;text-align:center;
  &:hover{border-color:rgba(251,196,23,0.6);background:rgba(251,196,23,0.18);}`;

const GameName = styled.img`
  position:absolute;top:2%;left:50%;width:clamp(280px,56vw,760px);height:auto;z-index:15;
  filter:drop-shadow(0 6px 24px rgba(0,0,0,0.4));
  animation:${waveZoom} 1.2s ease-out forwards,${waveIdle} 5s 1.2s ease-in-out infinite;
  @media(max-width:700px){top:74px;width:min(88vw,460px);}@media(max-width:420px){top:82px;width:min(90vw,420px);}`;

const LeftControlSlot = styled.div`
  position:absolute;top:14px;left:18px;z-index:24;
  @media(max-width:700px){display:none;}`;

const RightControlSlot = styled.div`
  position:absolute;top:14px;right:18px;z-index:24;
  @media(max-width:700px){display:none;}`;

const LeaderboardBtn = styled.button`
  background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;
  transition:transform .2s, box-shadow .2s, border-color .2s, background .2s;
  animation:${({$isBouncing})=>$isBouncing?css`${bounceLoop} 1.5s ease`:'none'};
  &:hover{transform:translateY(-1px);}
  display:inline-flex;align-items:center;justify-content:center;
  width:205px;height:74px;
  background:linear-gradient(135deg,rgba(251,196,23,.24),rgba(245,158,11,.18));
  border:1px solid rgba(251,196,23,.42);
  border-radius:18px;
  box-shadow:0 8px 20px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.18);
  overflow:hidden;
`;

const SoundBtn = styled.button`
  background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;
  transition:transform .2s, box-shadow .2s, border-color .2s, background .2s;
  animation:${({$isBouncing})=>$isBouncing?css`${bounceLoop} 1.5s ease`:'none'};
  &:hover{transform:translateY(-1px);}
  display:inline-flex;align-items:center;justify-content:center;
  width:205px;height:74px;
  background:linear-gradient(135deg,rgba(251,196,23,.24),rgba(245,158,11,.18));
  border:1px solid ${({$active})=>$active?'rgba(251,196,23,.55)':'rgba(251,196,23,.34)'};
  border-radius:18px;
  box-shadow:0 8px 20px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.18);
  overflow:hidden;
`;

const ControlBtnIcon = styled.img`
  width:180px;
  margin:0 auto;
  object-fit:contain;
`;

const ControlText = styled.span`
  display:none;
  @media(max-width:720px){
    display:inline-block;
    font-family:sans-serif;
    font-size:11px;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:1px;
    color:#fff1cf;
    line-height:1;
  }
`;

const MobileUtilityBar  = styled.div`position:absolute;top:12px;right:12px;z-index:230;display:none;gap:8px;@media(max-width:700px){display:flex;}`;
const MobileUtilityBtn  = styled.button`
  width:${({$wide})=>$wide?'64px':'44px'};height:44px;border-radius:12px;
  border:1px solid rgba(251,196,23,0.45);background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);
  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  transition:transform 0.2s ease,background 0.2s ease,border-color 0.2s ease;
  &:hover{transform:translateY(-2px);background:rgba(251,196,23,0.16);border-color:rgba(251,196,23,0.65);}`;
const MobileUtilityIcon = styled.span`font-size:19px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));`;

const ActionAura = styled.div`
  position:absolute;left:50%;top:62%;width:min(78vw,420px);height:220px;
  transform:translate(-50%,-50%);border-radius:999px;pointer-events:none;z-index:190;
  background:radial-gradient(circle,rgba(251,196,23,0.16) 0%,rgba(251,196,23,0.08) 38%,transparent 78%);
  filter:blur(2px);
  @media(max-width:900px){top:63%;}@media(max-width:520px){top:68%;height:180px;}`;

const StartGameWrapper = styled.div`
  position:absolute;top:60%;left:50%;transform:translate(-50%,-50%);z-index:200;
  animation:${bounceIn} 0.9s ease forwards;
  @media(max-width:900px){top:58%;}@media(max-width:520px){top:62%;}`;

const QuitWrapper = styled.div`
  position:absolute;top:71%;left:50%;transform:translate(-50%,-50%);z-index:200;
  animation:${bounceIn} 0.9s 0.1s ease both;
  @media(max-width:900px){top:69%;}@media(max-width:520px){top:74%;}`;

const GoldButton = styled.button`
  position:relative;width:300px;height:58px;border:none;border-radius:14px;cursor:pointer;overflow:hidden;
  background:linear-gradient(135deg,#fde68a 0%,#fbc417 40%,#f59e0b 100%);
  box-shadow:0 6px 24px rgba(251,196,23,0.45),0 2px 0 rgba(255,255,255,0.25) inset,0 -2px 0 rgba(0,0,0,0.15) inset;
  transition:transform 0.15s ease,box-shadow 0.15s ease;
  &:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(251,196,23,0.55),0 2px 0 rgba(255,255,255,0.25) inset;}
  &:active{transform:translateY(1px);box-shadow:0 3px 12px rgba(251,196,23,0.35);}
  @media(max-width:900px){width:min(86vw,300px);}@media(max-width:520px){width:min(92vw,260px);height:52px;border-radius:12px;}`;

const BtnGlow = styled.span`
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.35) 50%,transparent 100%);
  background-size:200% 100%;animation:${shimmerGold} 2.4s linear infinite;`;

const BtnInner = styled.span`
  position:relative;display:flex;align-items:center;justify-content:center;gap:10px;
  font-family:'Georgia',serif;font-size:18px;font-weight:900;letter-spacing:0.4px;color:#3d2401;
  @media(max-width:520px){font-size:15px;gap:8px;}`;

const BtnIconSpan = styled.span`font-size:14px;`;

const GhostButton = styled.button`
  width:300px;height:52px;border-radius:14px;cursor:pointer;
  background:rgba(255,255,255,0.07);border:1.5px solid rgba(251,196,23,0.4);backdrop-filter:blur(8px);
  transition:all 0.18s ease;
  &:hover{background:rgba(255,255,255,0.13);border-color:rgba(251,196,23,0.65);transform:translateY(-2px);}
  &:active{transform:translateY(1px);}
  ${BtnInner}{font-size:16px;font-weight:700;color:#fff7e7;}
  @media(max-width:900px){width:min(86vw,300px);}@media(max-width:520px){width:min(92vw,260px);height:48px;border-radius:12px;}`;

const Overlay   = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(5px);z-index:998;opacity:${({$isOpen})=>$isOpen?1:0};visibility:${({$isOpen})=>$isOpen?'visible':'hidden'};transition:opacity 0.35s ease,visibility 0.35s ease;`;
const Sidebar   = styled.aside`position:fixed;top:0;right:0;width:360px;height:100%;z-index:999;display:flex;flex-direction:column;transform:${({$isOpen})=>$isOpen?'translateX(0)':'translateX(100%)'};transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(170deg,#2c1204 0%,#3d1a06 50%,#1e0d03 100%);border-left:1px solid rgba(251,196,23,0.2);box-shadow:-14px 0 50px rgba(0,0,0,0.55);`;
const SidebarTopBar   = styled.div`height:4px;flex-shrink:0;background:linear-gradient(90deg,#fde68a,#fbc417,#f59e0b,#fbc417,#fde68a);background-size:300% 100%;animation:${shimmerGold} 3s linear infinite;`;
const SidebarHeader   = styled.div`display:flex;align-items:center;justify-content:space-between;padding:20px 22px 14px;`;
const SidebarBrand    = styled.div`display:flex;align-items:center;gap:10px;`;
const SidebarBrandIcon= styled.span`font-size:26px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));`;
const SidebarBrandText= styled.h2`margin:0;font-family:'Georgia',serif;font-size:20px;font-weight:900;color:#fde68a;letter-spacing:0.3px;`;
const CloseBtn        = styled.button`width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(251,196,23,0.35);background:rgba(251,196,23,0.1);color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;&:hover{background:rgba(251,196,23,0.22);border-color:rgba(251,196,23,0.6);transform:rotate(90deg);}`;
const SidebarDivider  = styled.div`height:1px;margin:0 22px;background:linear-gradient(90deg,transparent,rgba(251,196,23,0.3),transparent);`;
const SidebarBody     = styled.div`flex:1;overflow-y:auto;padding:18px 22px;display:flex;flex-direction:column;gap:14px;animation:${fadeSlideUp} 0.45s 0.15s ease both;&::-webkit-scrollbar{width:4px;}&::-webkit-scrollbar-track{background:transparent;}&::-webkit-scrollbar-thumb{background:rgba(251,196,23,0.25);border-radius:4px;}`;
const SidebarSubtitle = styled.p`margin:0;font-family:sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(253,230,138,0.5);`;
const NavSection      = styled.div`display:flex;flex-direction:column;gap:10px;`;
const NavBtn          = styled.button`width:100%;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;border:1px solid ${({$isOpen})=>$isOpen?'rgba(251,196,23,0.5)':'rgba(255,255,255,0.1)'};background:${({$isOpen})=>$isOpen?'rgba(251,196,23,0.1)':'rgba(255,255,255,0.06)'};color:#fff;cursor:pointer;text-align:left;transition:all 0.25s ease;&:hover{background:rgba(251,196,23,0.12);border-color:rgba(251,196,23,0.4);transform:translateX(-4px);}`;
const NavBtnIcon      = styled.span`font-size:20px;flex-shrink:0;`;
const NavBtnBody      = styled.div`flex:1;`;
const NavBtnTitle     = styled.div`font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#fff4df;line-height:1.2;`;
const NavBtnSub       = styled.div`font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;`;
const NavChevron      = styled.span`font-size:14px;color:rgba(251,196,23,0.7);transition:transform 0.3s ease;transform:${({$isOpen})=>$isOpen?'rotate(180deg)':'rotate(0deg)'};`;
const Submenu         = styled.div`overflow:hidden;max-height:${({$isOpen})=>$isOpen?'240px':'0'};opacity:${({$isOpen})=>$isOpen?1:0};transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),opacity 0.3s ease;`;
const SubmenuInner    = styled.div`display:flex;flex-direction:column;gap:8px;padding:6px 0 4px 20px;border-left:2px solid rgba(251,196,23,0.35);margin-left:18px;`;
const SubBtn          = styled.button`display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);color:#fff;cursor:pointer;text-align:left;font-family:sans-serif;font-size:13px;font-weight:500;transition:all 0.2s ease;&:hover{background:rgba(251,196,23,0.12);border-color:rgba(251,196,23,0.3);transform:translateX(4px);}`;
const SubBtnIcon      = styled.span`font-size:16px;`;
const SidebarFooter   = styled.div`flex-shrink:0;padding:16px 22px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;gap:10px;`;
const FooterOrn       = styled.span`color:rgba(251,196,23,0.4);font-size:10px;`;
const FooterText      = styled.span`font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:0.5px;`;
const ModalOverlay    = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:1000;opacity:${({$isOpen})=>$isOpen?1:0};visibility:${({$isOpen})=>$isOpen?'visible':'hidden'};transition:opacity 0.3s ease,visibility 0.3s ease;`;
const TranslateModal  = styled.div`position:fixed;top:50%;left:50%;transform:${({$isOpen})=>$isOpen?'translate(-50%,-50%) scale(1)':'translate(-50%,-50%) scale(0.88)'};width:min(420px,90vw);z-index:1001;overflow:hidden;border-radius:22px;background:linear-gradient(155deg,#2c1204 0%,#3d1a06 55%,#1e0d03 100%);border:1px solid rgba(251,196,23,0.25);box-shadow:0 28px 70px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,220,120,0.1);opacity:${({$isOpen})=>$isOpen?1:0};visibility:${({$isOpen})=>$isOpen?'visible':'hidden'};transition:all 0.38s cubic-bezier(0.34,1.56,0.64,1);`;
const ModalTopBar     = styled.div`height:4px;background:linear-gradient(90deg,#fde68a,#fbc417,#f59e0b,#fbc417,#fde68a);background-size:300% 100%;animation:${shimmerGold} 3s linear infinite;`;
const ModalHeader     = styled.div`display:flex;align-items:center;justify-content:space-between;padding:20px 22px 12px;`;
const ModalTitleRow   = styled.div`display:flex;align-items:center;gap:10px;`;
const ModalTitleIcon  = styled.span`font-size:22px;`;
const ModalTitleText  = styled.h2`margin:0;font-family:'Georgia',serif;font-size:20px;font-weight:900;color:#fde68a;`;
const ModalCloseBtn   = styled.button`width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(251,196,23,0.35);background:rgba(251,196,23,0.1);color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;&:hover{background:rgba(251,196,23,0.22);border-color:rgba(251,196,23,0.6);transform:rotate(90deg);}`;
const ModalDivider    = styled.div`height:1px;margin:0 22px;background:linear-gradient(90deg,transparent,rgba(251,196,23,0.25),transparent);`;
const ModalBody       = styled.div`padding:18px 22px 26px;display:flex;flex-direction:column;gap:14px;animation:${fadeSlideUp} 0.4s 0.1s ease both;`;
const ModalSubtitle   = styled.p`margin:0;font-family:sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(253,230,138,0.5);text-align:center;`;
const ModalBtns       = styled.div`display:flex;flex-direction:column;gap:10px;`;
const ModalOptionBtn  = styled.button`width:100%;display:flex;align-items:center;gap:14px;padding:15px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;text-align:left;transition:all 0.22s ease;&:hover{background:rgba(251,196,23,0.12);border-color:rgba(251,196,23,0.4);transform:translateX(6px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}&:active{transform:translateX(3px);}`;
const ModalOptionIcon = styled.span`font-size:22px;flex-shrink:0;`;
const ModalOptionText = styled.div`flex:1;`;
const ModalOptionTitle= styled.div`font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#fff4df;line-height:1.2;`;
const ModalOptionSub  = styled.div`font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;`;
const ModalArrow      = styled.span`font-size:16px;color:rgba(251,196,23,0.6);flex-shrink:0;`;