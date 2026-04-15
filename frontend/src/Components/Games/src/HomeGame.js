import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import green1 from '../../../Assests/green1.png';
import green2 from '../../../Assests/green2.png';
import green3 from '../../../Assests/green3.png';
import plate1 from '../../../Assests/plate1.png';
import plate2 from '../../../Assests/plate2.png';
import plate3 from '../../../Assests/plate3.png';
import girl9 from '../../../Assests/girl9.png';
import sound from '../../../Assests/sound.png';
import home from '../../../Assests/home.png';
import gameName from '../../../Assests/bAI.png';
import write from '../../../Assests/write.png';
import tap from '../../../Assests/tap.png';
import translate from '../../../Assests/translate.png';
import bounceMusic from '../../../Assests/home.mp3';
import mute from '../../../Assests/mute.png';
import leaderboard from '../../../Assests/Leaderboard.png';

/* ═══════════════════════════════════
   COMPONENT
═══════════════════════════════════ */

const HomeGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTranslateSubmenuOpen, setIsTranslateSubmenuOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  const [sequence, setSequence] = useState({
    green1: false, green2: false, green3: false, write: false,
    girl9: false, sound: false, home: false, plate2: false,
    startGame: false, leaderboard: false, plate3: false,
    quit: false, gameName: false, leaderboardIcon: false,
  });

  const [bounceHome, setBounceHome] = useState(false);
  const [bounceSound, setBounceSound] = useState(false);
  const [bounceGirl, setBounceGirl] = useState(false);
  const [bounceLeaderboardIcon, setBounceLeaderboardIcon] = useState(false);

  const [hovered, setHovered] = useState({ sound: false, home: false, leaderboardIcon: false });
  const [replaceWriteWithPlate1, setReplaceWriteWithPlate1] = useState(false);
  const [activePlate, setActivePlate] = useState('write');

  /* ── Particle state for background ── */
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 6,
    }))
  );

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleSidebar = () => setIsSidebarOpen(p => !p);
  const closeSidebar = () => { setIsSidebarOpen(false); setIsTranslateSubmenuOpen(false); };
  const toggleTranslateSubmenu = () => setIsTranslateSubmenuOpen(p => !p);
  const openTranslateModal = () => setIsTranslateModalOpen(true);
  const closeTranslateModal = () => setIsTranslateModalOpen(false);

  const goToMode = (mode) => {
    if (mode === "multiple") navigate("/difficulty-multiple");
    if (mode === "typing") navigate("/difficulty-typing");
    if (mode === "dragdrop") navigate("/difficulty-drag");
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("loginData");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log("Logged-in User ID:", user.id);
    }
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSequence(p => ({ ...p, green1: true })), 200),
      setTimeout(() => setSequence(p => ({ ...p, green2: true })), 380),
      setTimeout(() => setSequence(p => ({ ...p, green3: true })), 480),
      setTimeout(() => setSequence(p => ({ ...p, write: true })), 500),
      setTimeout(() => setSequence(p => ({ ...p, girl9: true })), 600),
      setTimeout(() => setSequence(p => ({ ...p, sound: true })), 600),
      setTimeout(() => setSequence(p => ({ ...p, leaderboardIcon: true })), 700),
      setTimeout(() => setSequence(p => ({ ...p, home: true })), 800),
      setTimeout(() => setSequence(p => ({ ...p, plate2: true })), 800),
      setTimeout(() => setSequence(p => ({ ...p, startGame: true })), 1000),
      setTimeout(() => setSequence(p => ({ ...p, leaderboard: true })), 1150),
      setTimeout(() => setSequence(p => ({ ...p, plate3: true })), 1200),
      setTimeout(() => setSequence(p => ({ ...p, quit: true })), 1280),
      setTimeout(() => setSequence(p => ({ ...p, gameName: true })), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!sequence.girl9) return;
    const interval = setInterval(() => {
      setBounceGirl(true);
      setTimeout(() => setBounceGirl(false), 1500);
    }, 3000);
    return () => clearInterval(interval);
  }, [sequence.girl9]);

  useEffect(() => {
    if (!sequence.home) return;
    const interval = setInterval(() => {
      if (!hovered.home) { setBounceHome(true); setTimeout(() => setBounceHome(false), 1500); }
    }, 4000);
    return () => clearInterval(interval);
  }, [sequence.home, hovered.home]);

  useEffect(() => {
    if (!sequence.sound) return;
    const interval = setInterval(() => {
      if (!hovered.sound) { setBounceSound(true); setTimeout(() => setBounceSound(false), 1500); }
    }, 4000);
    return () => clearInterval(interval);
  }, [sequence.sound, hovered.sound]);

  useEffect(() => {
    if (!sequence.leaderboardIcon) return;
    const interval = setInterval(() => {
      if (!hovered.leaderboardIcon) { setBounceLeaderboardIcon(true); setTimeout(() => setBounceLeaderboardIcon(false), 1500); }
    }, 4000);
    return () => clearInterval(interval);
  }, [sequence.leaderboardIcon, hovered.leaderboardIcon]);

  /* ─── Mode label for active plate ─── */
  const modeLabels = { write: 'Write Mode', plate2: 'Translate Mode', plate3: 'Tap Mode' };
  const modeIcons  = { write: '✍️', plate2: '🔄', plate3: '👆' };

  return (
    <Container>
      <audio ref={audioRef} src={bounceMusic} loop />

      {/* Ambient background layers */}
      <BgGradient />
      <BgTexture />
      <BgRadial />

      {/* Floating gold particles */}
      {particles.map(p => (
        <Particle
          key={p.id}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          $delay={p.delay}
          $duration={p.duration}
        />
      ))}

      {/* ── Decorative foliage images ── */}
      {sequence.green1 && <LeftImage src={green1} />}
      {sequence.green2 && <BottomImage src={green2} />}
      {sequence.green3 && <RightImage src={green3} />}

      {/* ── Mode plates ── */}
      {sequence.write && (
        replaceWriteWithPlate1 ? (
          <Plate1
            src={activePlate === 'write' ? write : plate1}
            $isActive={activePlate === 'write'}
            onClick={() => { setReplaceWriteWithPlate1(false); setActivePlate('write'); }}
          />
        ) : (
          <Write
            src={write}
            $isActive={activePlate === 'write'}
            onClick={() => { setReplaceWriteWithPlate1(false); setActivePlate('write'); }}
          />
        )
      )}

      {sequence.plate2 && (
        <Plate2
          src={activePlate === 'plate2' ? translate : plate2}
          $isActive={activePlate === 'plate2'}
          onClick={() => { setReplaceWriteWithPlate1(true); setActivePlate('plate2'); }}
        />
      )}

      {sequence.plate3 && (
        <Plate3
          src={activePlate === 'plate3' ? tap : plate3}
          $isActive={activePlate === 'plate3'}
          onClick={() => { setReplaceWriteWithPlate1(true); setActivePlate('plate3'); }}
        />
      )}

      {/* ── Character ── */}
      {sequence.girl9 && <Girl9 src={girl9} $isBouncing={bounceGirl} />}

      {/* ── Game name ── */}
      {sequence.gameName && <GameName src={gameName} />}

      {/* ── Sound toggle ── */}
      {sequence.sound && (
        <SoundBtn
          src={isPlaying ? sound : mute}
          $isBouncing={bounceSound}
          onClick={toggleMusic}
          onMouseEnter={() => setHovered(p => ({ ...p, sound: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, sound: false }))}
          title={isPlaying ? 'Mute music' : 'Play music'}
        />
      )}

      {/* ── Leaderboard icon ── */}
      {sequence.leaderboardIcon && (
        <LeaderboardIconImg
          src={leaderboard}
          $isBouncing={bounceLeaderboardIcon}
          onClick={toggleSidebar}
          onMouseEnter={() => setHovered(p => ({ ...p, leaderboardIcon: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, leaderboardIcon: false }))}
          title="Leaderboard"
        />
      )}

      {/* ── Home icon ── */}
      {sequence.home && (
        <HomeImg
          src={home}
          $isBouncing={bounceHome}
          onMouseEnter={() => setHovered(p => ({ ...p, home: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, home: false }))}
          onClick={() => navigate('/')}
          title="Go home"
        />
      )}

      {/* ── Active mode indicator chip ── */}
      {sequence.startGame && (
        <ModeChip>
          <ModeChipDot />
          <span>{modeIcons[activePlate]}</span>
          <ModeChipLabel>{modeLabels[activePlate]}</ModeChipLabel>
        </ModeChip>
      )}

      {/* ── CTA buttons ── */}
      {sequence.startGame && (
        <StartGameWrapper>
          <GoldButton
            onClick={() => {
              if (activePlate === 'write') navigate('/write');
              else if (activePlate === 'plate2') openTranslateModal();
              else if (activePlate === 'plate3') navigate('/difficulty-tap');
            }}
          >
            <BtnGlow />
            <BtnInner>
              <BtnIconSpan>▶</BtnIconSpan>
              Start Game
            </BtnInner>
          </GoldButton>
        </StartGameWrapper>
      )}

      {sequence.quit && (
        <QuitWrapper>
          <GhostButton onClick={() => navigate('/')}>
            <BtnInner>
              <BtnIconSpan style={{ opacity: 0.7 }}>←</BtnIconSpan>
              Quit
            </BtnInner>
          </GhostButton>
        </QuitWrapper>
      )}

      {/* ═══════════ SIDEBAR OVERLAY ═══════════ */}
      <Overlay $isOpen={isSidebarOpen} onClick={closeSidebar} />

      {/* ═══════════ SIDEBAR ═══════════ */}
      <Sidebar $isOpen={isSidebarOpen}>
        {/* Ornamental top bar */}
        <SidebarTopBar />

        <SidebarHeader>
          <SidebarBrand>
            <SidebarBrandIcon>🏆</SidebarBrandIcon>
            <SidebarBrandText>Leaderboard</SidebarBrandText>
          </SidebarBrand>
          <CloseBtn onClick={closeSidebar} title="Close">✕</CloseBtn>
        </SidebarHeader>

        <SidebarDivider />

        <SidebarBody>
          <SidebarSubtitle>Choose a game mode to view rankings</SidebarSubtitle>

          <NavSection>
            {/* Translate accordion */}
            <NavBtn $isOpen={isTranslateSubmenuOpen} onClick={toggleTranslateSubmenu}>
              <NavBtnIcon>🔄</NavBtnIcon>
              <NavBtnBody>
                <NavBtnTitle>Translate Mode</NavBtnTitle>
                <NavBtnSub>Multiple game types</NavBtnSub>
              </NavBtnBody>
              <NavChevron $isOpen={isTranslateSubmenuOpen}>▾</NavChevron>
            </NavBtn>

            <Submenu $isOpen={isTranslateSubmenuOpen}>
              <SubmenuInner>
                <SubBtn onClick={() => { navigate("/multiple-board"); closeSidebar(); }}>
                  <SubBtnIcon>🧠</SubBtnIcon>
                  <span>Multiple Choice</span>
                </SubBtn>
                <SubBtn onClick={() => { navigate("/typing-board"); closeSidebar(); }}>
                  <SubBtnIcon>⌨️</SubBtnIcon>
                  <span>Typing</span>
                </SubBtn>
                <SubBtn onClick={() => { navigate("/drag-board"); closeSidebar(); }}>
                  <SubBtnIcon>🧩</SubBtnIcon>
                  <span>Drag & Drop</span>
                </SubBtn>
              </SubmenuInner>
            </Submenu>

            <NavBtn onClick={() => { navigate("/tap-board"); closeSidebar(); }}>
              <NavBtnIcon>👆</NavBtnIcon>
              <NavBtnBody>
                <NavBtnTitle>Tap Mode</NavBtnTitle>
                <NavBtnSub>Quick recognition</NavBtnSub>
              </NavBtnBody>
            </NavBtn>

            <NavBtn onClick={() => { navigate("/write-board"); closeSidebar(); }}>
              <NavBtnIcon>✍️</NavBtnIcon>
              <NavBtnBody>
                <NavBtnTitle>Write Mode</NavBtnTitle>
                <NavBtnSub>Practice writing</NavBtnSub>
              </NavBtnBody>
            </NavBtn>
          </NavSection>
        </SidebarBody>

        <SidebarFooter>
          <FooterOrn>✦</FooterOrn>
          <FooterText>EbaybayMo Thesis 2024</FooterText>
          <FooterOrn>✦</FooterOrn>
        </SidebarFooter>
      </Sidebar>

      {/* ═══════════ TRANSLATE MODAL ═══════════ */}
      <ModalOverlay $isOpen={isTranslateModalOpen} onClick={closeTranslateModal} />
      <TranslateModal $isOpen={isTranslateModalOpen}>
        <ModalTopBar />
        <ModalHeader>
          <ModalTitleRow>
            <ModalTitleIcon>🔄</ModalTitleIcon>
            <ModalTitleText>Translate Mode</ModalTitleText>
          </ModalTitleRow>
          <ModalCloseBtn onClick={closeTranslateModal} title="Close">✕</ModalCloseBtn>
        </ModalHeader>
        <ModalDivider />
        <ModalBody>
          <ModalSubtitle>Choose your game mode to begin</ModalSubtitle>
          <ModalBtns>
            <ModalOptionBtn onClick={() => { goToMode("multiple"); closeTranslateModal(); }}>
              <ModalOptionIcon>🧠</ModalOptionIcon>
              <ModalOptionText>
                <ModalOptionTitle>Multiple Choice</ModalOptionTitle>
                <ModalOptionSub>Select the correct answer</ModalOptionSub>
              </ModalOptionText>
              <ModalArrow>→</ModalArrow>
            </ModalOptionBtn>
            <ModalOptionBtn onClick={() => { goToMode("typing"); closeTranslateModal(); }}>
              <ModalOptionIcon>⌨️</ModalOptionIcon>
              <ModalOptionText>
                <ModalOptionTitle>Typing</ModalOptionTitle>
                <ModalOptionSub>Type the translation</ModalOptionSub>
              </ModalOptionText>
              <ModalArrow>→</ModalArrow>
            </ModalOptionBtn>
            <ModalOptionBtn onClick={() => { goToMode("dragdrop"); closeTranslateModal(); }}>
              <ModalOptionIcon>🧩</ModalOptionIcon>
              <ModalOptionText>
                <ModalOptionTitle>Drag & Drop</ModalOptionTitle>
                <ModalOptionSub>Match words correctly</ModalOptionSub>
              </ModalOptionText>
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

const translateInLeft = keyframes`
  from { transform: translateX(-200px); opacity: 0; }
  to   { transform: translateX(0);      opacity: 1; }
`;

const translateInBottom = keyframes`
  from { transform: translateY(200px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

const translateInRight = keyframes`
  from { transform: translateX(200px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

const slideFromTop = keyframes`
  from { transform: translateY(-150px); opacity: 0; }
  to   { transform: translateY(0);      opacity: 1; }
`;

const slideFromBottom = keyframes`
  from { transform: translateY(220px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

const rotateFromRight = keyframes`
  from { transform: translateX(150px) rotate(0deg); opacity: 0; }
  to   { transform: translateX(0)     rotate(360deg); opacity: 1; }
`;

const waveZoom = keyframes`
  0%   { transform: scale(0.8) rotate(0deg);  opacity: 0; }
  15%  { opacity: 1; }
  50%  { transform: scale(1.04) rotate(-2deg); }
  75%  { transform: scale(0.98) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg);     opacity: 1; }
`;

const waveIdle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  30%       { transform: scale(1.03) rotate(-1.5deg); }
  70%       { transform: scale(1.01) rotate(1.5deg); }
`;

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  25%       { transform: scale(1.06); }
  50%       { transform: scale(1); }
  75%       { transform: scale(1.06); }
`;

const shake = keyframes`
  0%,74%    { transform: translateY(0) rotate(0deg); }
  75%        { transform: translateY(-10px) rotate(-6deg); }
  80%        { transform: translateY(6px) rotate(5deg); }
  85%        { transform: translateY(-4px) rotate(-3deg); }
  90%, 100% { transform: translateY(0) rotate(0deg); }
`;

const zoomRotate = keyframes`
  from { transform: scale(0) rotate(0deg);   opacity: 0; }
  to   { transform: scale(1) rotate(360deg); opacity: 1; }
`;

const bounceLoop = keyframes`
  0%,20%,50%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const bounceIn = keyframes`
  0%   { transform: scale(0.6) translateY(20px); opacity: 0; }
  60%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

const floatParticle = keyframes`
  0%   { transform: translateY(0) scale(1);    opacity: 0; }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.4; }
  100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
`;

const shimmerGold = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const chipPop = keyframes`
  from { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) scale(1)   translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

/* ═══════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════ */

/* ── Root container ── */
const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Georgia', serif;
`;

/* ── Layered background ── */
const BgGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #7a2100 0%, #9a3000 30%, #c24010 65%, #a83008 100%);
  z-index: 0;
`;

const BgTexture = styled.div`
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 55px,
      rgba(0,0,0,0.04) 55px,
      rgba(0,0,0,0.04) 56px
    );
  z-index: 1;
  pointer-events: none;
`;

const BgRadial = styled.div`
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  height: 90vw;
  max-width: 800px;
  max-height: 800px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,196,23,0.12) 0%, transparent 68%);
  z-index: 1;
  pointer-events: none;
`;

/* ── Floating particles ── */
const Particle = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(251, 196, 23, 0.55);
  box-shadow: 0 0 6px rgba(251, 196, 23, 0.4);
  pointer-events: none;
  z-index: 2;
  animation: ${floatParticle} ${({ $duration }) => $duration}s ${({ $delay }) => $delay}s ease-in infinite;
`;

/* ── Foliage images ── */
const LeftImage = styled.img`
  position: absolute;
  left: 0; top: 0;
  width: 410px;
  height: auto;
  z-index: 3;
  animation: ${translateInLeft} 0.55s ease-out forwards;
`;

const BottomImage = styled.img`
  position: absolute;
  bottom: -20%; left: 0;
  width: 1530px;
  height: auto;
  z-index: 3;
  animation: ${translateInBottom} 0.55s ease-out forwards;
`;

const RightImage = styled.img`
  position: absolute;
  right: -3%; top: 0;
  width: 410px;
  height: auto;
  z-index: 3;
  animation: ${translateInRight} 0.55s ease-out forwards;
`;

/* ── Mode plates ── */
const Write = styled.img`
  position: absolute;
  top: 61%; left: -8%;
  width: 550px;
  height: auto;
  cursor: pointer;
  z-index: 50;
  pointer-events: auto;
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0 0 18px rgba(251,196,23,0.6))' : 'none'};
  ${({ $isActive }) => $isActive
    ? css`animation: ${heartbeat} 1.6s ease-in-out infinite; z-index: 900;`
    : css`animation: ${zoomRotate} 1s ease-out, ${shake} 6s 1s ease-in-out infinite;`
  }
`;

const Plate1 = styled.img`
  position: absolute;
  top: 61%; left: -8%;
  width: 550px;
  height: auto;
  cursor: pointer;
  z-index: 50;
  pointer-events: auto;
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0 0 18px rgba(251,196,23,0.6))' : 'none'};
  ${({ $isActive }) => $isActive
    ? css`animation: ${heartbeat} 1.6s ease-in-out infinite; z-index: 900;`
    : css`animation: ${zoomRotate} 1s ease-out, ${shake} 6s 1s ease-in-out infinite;`
  }
`;

const Plate2 = styled.img`
  position: absolute;
  top: 32%; left: -8%;
  width: 500px;
  height: auto;
  z-index: 320;
  cursor: pointer;
  pointer-events: auto;
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0 0 16px rgba(251,196,23,0.55))' : 'none'};
  transition: filter 0.25s;
  ${({ $isActive }) => $isActive
    ? css`animation: ${heartbeat} 1.6s ease-in-out infinite; z-index: 1000;`
    : css`animation: ${zoomRotate} 1s ease-out, ${shake} 3.6s 0.6s ease-in-out infinite;`
  }
  &:hover { filter: drop-shadow(0 0 10px rgba(251,196,23,0.35)); }
`;

const Plate3 = styled.img`
  position: absolute;
  top: 42%; left: 7%;
  width: 520px;
  height: auto;
  z-index: 310;
  cursor: pointer;
  pointer-events: auto;
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0 0 16px rgba(251,196,23,0.55))' : 'none'};
  transition: filter 0.25s;
  ${({ $isActive }) => $isActive
    ? css`animation: ${heartbeat} 1.6s ease-in-out infinite; z-index: 1000;`
    : css`animation: ${zoomRotate} 1s ease-out, ${shake} 3.6s 0.6s ease-in-out infinite;`
  }
  &:hover { filter: drop-shadow(0 0 10px rgba(251,196,23,0.35)); }
`;

/* ── Character ── */
const Girl9 = styled.img`
  position: absolute;
  bottom: 0%; left: 75%;
  width: 430px;
  height: auto;
  z-index: 10;
  animation: ${slideFromBottom} 1s ease-out,
             ${({ $isBouncing }) => $isBouncing ? css`${bounceLoop} 1.5s ease` : 'none'};
`;

/* ── Game name ── */
const GameName = styled.img`
  position: absolute;
  top: 2%; left: 25%;
  width: 760px;
  height: auto;
  z-index: 15;
  filter: drop-shadow(0 6px 24px rgba(0,0,0,0.4));
  animation: ${waveZoom} 1.2s ease-out forwards, ${waveIdle} 5s 1.2s ease-in-out infinite;
`;

/* ── Icon buttons (sound, leaderboard, home) ── */
const SoundBtn = styled.img`
  position: absolute;
  top: -6%; right: -10%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 20;
  animation: ${rotateFromRight} 1s ease-out,
             ${({ $isBouncing }) => $isBouncing ? css`${bounceLoop} 1.5s ease` : 'none'};
  transition: transform 0.25s ease, filter 0.25s;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
  &:hover { transform: scale(0.91); filter: drop-shadow(0 6px 16px rgba(251,196,23,0.4)); }
`;

const LeaderboardIconImg = styled.img`
  position: absolute;
  top: 12%; right: -10%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 20;
  animation: ${rotateFromRight} 1s ease-out,
             ${({ $isBouncing }) => $isBouncing ? css`${bounceLoop} 1.5s ease` : 'none'};
  transition: transform 0.25s ease, filter 0.25s;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
  &:hover { transform: scale(0.91); filter: drop-shadow(0 6px 16px rgba(251,196,23,0.4)); }
`;

const HomeImg = styled.img`
  position: absolute;
  top: -6%; left: -5%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 20;
  animation: ${slideFromTop} 0.9s ease-out,
             ${({ $isBouncing }) => $isBouncing ? css`${bounceLoop} 1.5s ease` : 'none'};
  transition: transform 0.25s ease, filter 0.25s;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
  &:hover { transform: scale(0.91); filter: drop-shadow(0 6px 16px rgba(251,196,23,0.4)); }
`;

/* ── Active mode chip ── */
const ModeChip = styled.div`
  position: absolute;
  top: calc(55% - 58px);
  left: 40%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px 5px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(251,196,23,0.35);
  backdrop-filter: blur(8px);
  z-index: 200;
  animation: ${chipPop} 0.5s ease forwards;
`;

const ModeChipDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fbc417;
  box-shadow: 0 0 6px rgba(251,196,23,0.9);
  animation: ${blink} 1.4s ease-in-out infinite;
  flex-shrink: 0;
`;

const ModeChipLabel = styled.span`
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #fde68a;
`;

/* ── CTA buttons ── */
const StartGameWrapper = styled.div`
  position: absolute;
  top: 55%;
  left: 40%;
  transform: translate(-50%, -50%);
  z-index: 200;
  animation: ${bounceIn} 0.9s ease forwards;
`;

const QuitWrapper = styled.div`
  position: absolute;
  top: 65%;
  left: 40%;
  transform: translate(-50%, -50%);
  z-index: 200;
  animation: ${bounceIn} 0.9s 0.1s ease both;
`;

/* Gold primary button */
const GoldButton = styled.button`
  position: relative;
  width: 300px;
  height: 58px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #fde68a 0%, #fbc417 40%, #f59e0b 100%);
  box-shadow:
    0 6px 24px rgba(251,196,23,0.45),
    0 2px 0 rgba(255,255,255,0.25) inset,
    0 -2px 0 rgba(0,0,0,0.15) inset;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(251,196,23,0.55), 0 2px 0 rgba(255,255,255,0.25) inset;
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 12px rgba(251,196,23,0.35);
  }
`;

const BtnGlow = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: ${shimmerGold} 2.4s linear infinite;
`;

const BtnInner = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Georgia', serif;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: #3d2401;
`;

const BtnIconSpan = styled.span`
  font-size: 14px;
`;

/* Ghost secondary button */
const GhostButton = styled.button`
  width: 300px;
  height: 52px;
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(251,196,23,0.4);
  backdrop-filter: blur(8px);
  transition: all 0.18s ease;
  &:hover {
    background: rgba(255,255,255,0.13);
    border-color: rgba(251,196,23,0.65);
    transform: translateY(-2px);
  }
  &:active { transform: translateY(1px); }
  ${BtnInner} {
    font-size: 16px;
    font-weight: 700;
    color: #fff7e7;
  }
`;

/* ═══════════════════════════════════
   SIDEBAR
═══════════════════════════════════ */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(5px);
  z-index: 998;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.35s ease, visibility 0.35s ease;
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0; right: 0;
  width: 360px;
  height: 100%;
  z-index: 999;
  display: flex;
  flex-direction: column;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* layered background */
  background: linear-gradient(170deg, #2c1204 0%, #3d1a06 50%, #1e0d03 100%);
  border-left: 1px solid rgba(251,196,23,0.2);
  box-shadow: -14px 0 50px rgba(0,0,0,0.55);
`;

const SidebarTopBar = styled.div`
  height: 4px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a);
  background-size: 300% 100%;
  animation: ${shimmerGold} 3s linear infinite;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 14px;
`;

const SidebarBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SidebarBrandIcon = styled.span`
  font-size: 26px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
`;

const SidebarBrandText = styled.h2`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: 900;
  color: #fde68a;
  letter-spacing: 0.3px;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(251,196,23,0.35);
  background: rgba(251,196,23,0.1);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(251,196,23,0.22);
    border-color: rgba(251,196,23,0.6);
    transform: rotate(90deg);
  }
`;

const SidebarDivider = styled.div`
  height: 1px;
  margin: 0 22px;
  background: linear-gradient(90deg, transparent, rgba(251,196,23,0.3), transparent);
`;

const SidebarBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeSlideUp} 0.45s 0.15s ease both;

  /* custom scrollbar */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(251,196,23,0.25); border-radius: 4px; }
`;

const SidebarSubtitle = styled.p`
  margin: 0;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(253,230,138,0.5);
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ $isOpen }) => $isOpen ? 'rgba(251,196,23,0.5)' : 'rgba(255,255,255,0.1)'};
  background: ${({ $isOpen }) => $isOpen ? 'rgba(251,196,23,0.1)' : 'rgba(255,255,255,0.06)'};
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(251,196,23,0.12);
    border-color: rgba(251,196,23,0.4);
    transform: translateX(-4px);
  }
`;

const NavBtnIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const NavBtnBody = styled.div`
  flex: 1;
`;

const NavBtnTitle = styled.div`
  font-family: 'Georgia', serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff4df;
  line-height: 1.2;
`;

const NavBtnSub = styled.div`
  font-family: sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
`;

const NavChevron = styled.span`
  font-size: 14px;
  color: rgba(251,196,23,0.7);
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const Submenu = styled.div`
  overflow: hidden;
  max-height: ${({ $isOpen }) => ($isOpen ? '240px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
`;

const SubmenuInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 0 4px 20px;
  border-left: 2px solid rgba(251,196,23,0.35);
  margin-left: 18px;
`;

const SubBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  color: #fff;
  cursor: pointer;
  text-align: left;
  font-family: sans-serif;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(251,196,23,0.12);
    border-color: rgba(251,196,23,0.3);
    transform: translateX(4px);
  }
`;

const SubBtnIcon = styled.span`
  font-size: 16px;
`;

const SidebarFooter = styled.div`
  flex-shrink: 0;
  padding: 16px 22px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const FooterOrn = styled.span`
  color: rgba(251,196,23,0.4);
  font-size: 10px;
`;

const FooterText = styled.span`
  font-family: sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.5px;
`;

/* ═══════════════════════════════════
   TRANSLATE MODAL
═══════════════════════════════════ */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const TranslateModal = styled.div`
  position: fixed;
  top: 50%; left: 50%;
  transform: ${({ $isOpen }) => $isOpen
    ? 'translate(-50%, -50%) scale(1)'
    : 'translate(-50%, -50%) scale(0.88)'
  };
  width: min(420px, 90vw);
  z-index: 1001;
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(155deg, #2c1204 0%, #3d1a06 55%, #1e0d03 100%);
  border: 1px solid rgba(251,196,23,0.25);
  box-shadow: 0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,220,120,0.1);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.38s cubic-bezier(0.34,1.56,0.64,1);
`;

const ModalTopBar = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a);
  background-size: 300% 100%;
  animation: ${shimmerGold} 3s linear infinite;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 12px;
`;

const ModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalTitleIcon = styled.span`
  font-size: 22px;
`;

const ModalTitleText = styled.h2`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: 900;
  color: #fde68a;
`;

const ModalCloseBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid rgba(251,196,23,0.35);
  background: rgba(251,196,23,0.1);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(251,196,23,0.22);
    border-color: rgba(251,196,23,0.6);
    transform: rotate(90deg);
  }
`;

const ModalDivider = styled.div`
  height: 1px;
  margin: 0 22px;
  background: linear-gradient(90deg, transparent, rgba(251,196,23,0.25), transparent);
`;

const ModalBody = styled.div`
  padding: 18px 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeSlideUp} 0.4s 0.1s ease both;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(253,230,138,0.5);
  text-align: center;
`;

const ModalBtns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModalOptionBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s ease;
  &:hover {
    background: rgba(251,196,23,0.12);
    border-color: rgba(251,196,23,0.4);
    transform: translateX(6px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  &:active { transform: translateX(3px); }
`;

const ModalOptionIcon = styled.span`
  font-size: 22px;
  flex-shrink: 0;
`;

const ModalOptionText = styled.div`
  flex: 1;
`;

const ModalOptionTitle = styled.div`
  font-family: 'Georgia', serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff4df;
  line-height: 1.2;
`;

const ModalOptionSub = styled.div`
  font-family: sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
`;

const ModalArrow = styled.span`
  font-size: 16px;
  color: rgba(251,196,23,0.6);
  flex-shrink: 0;
`;