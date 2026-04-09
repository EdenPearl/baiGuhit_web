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

import CustomButton from './CustomButton.js';

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

  const [hovered, setHovered] = useState({
    sound: false, home: false, leaderboardIcon: false,
  });

  const [replaceWriteWithPlate1, setReplaceWriteWithPlate1] = useState(false);
  const [activePlate, setActivePlate] = useState('write');

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsTranslateSubmenuOpen(false);
  };
  const toggleTranslateSubmenu = () => setIsTranslateSubmenuOpen(!isTranslateSubmenuOpen);

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
      console.log("Logged-in email:", user.email);
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
    if (sequence.girl9) {
      const interval = setInterval(() => {
        setBounceGirl(true);
        setTimeout(() => setBounceGirl(false), 1500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [sequence.girl9]);

  useEffect(() => {
    if (sequence.home) {
      const interval = setInterval(() => {
        if (!hovered.home) {
          setBounceHome(true);
          setTimeout(() => setBounceHome(false), 1500);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sequence.home, hovered.home]);

  useEffect(() => {
    if (sequence.sound) {
      const interval = setInterval(() => {
        if (!hovered.sound) {
          setBounceSound(true);
          setTimeout(() => setBounceSound(false), 1500);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sequence.sound, hovered.sound]);

  useEffect(() => {
    if (sequence.leaderboardIcon) {
      const interval = setInterval(() => {
        if (!hovered.leaderboardIcon) {
          setBounceLeaderboardIcon(true);
          setTimeout(() => setBounceLeaderboardIcon(false), 1500);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sequence.leaderboardIcon, hovered.leaderboardIcon]);

  return (
    <Container>
      <audio ref={audioRef} src={bounceMusic} loop />

      {sequence.green1 && <LeftImage src={green1} />}
      {sequence.green2 && <BottomImage src={green2} />}
      {sequence.green3 && <RightImage src={green3} />}

      {sequence.write && (
        replaceWriteWithPlate1 ? (
          <Plate1
            src={activePlate === 'write' ? write : plate1}
            isActive={activePlate === 'write'}
            onClick={() => {
              setReplaceWriteWithPlate1(false);
              setActivePlate('write');
            }}
          />
        ) : (
          <Write
            src={write}
            isActive={activePlate === 'write'}
            onClick={() => {
              setReplaceWriteWithPlate1(false);
              setActivePlate('write');
            }}
          />
        )
      )}

      {sequence.plate2 && (
        <Plate2
          src={activePlate === 'plate2' ? translate : plate2}
          isActive={activePlate === 'plate2'}
          onClick={() => {
            setReplaceWriteWithPlate1(true);
            setActivePlate('plate2');
          }}
        />
      )}

      {sequence.plate3 && (
        <Plate3
          src={activePlate === 'plate3' ? tap : plate3}
          isActive={activePlate === 'plate3'}
          onClick={() => {
            setReplaceWriteWithPlate1(true);
            setActivePlate('plate3');
          }}
        />
      )}

      {sequence.girl9 && <Girl9 src={girl9} isBouncing={bounceGirl} />}
      {sequence.gameName && <GameName src={gameName} />}

      {sequence.sound && (
        <Sound
          src={isPlaying ? sound : mute}
          isBouncing={bounceSound}
          onClick={toggleMusic}
          onMouseEnter={() => setHovered(p => ({ ...p, sound: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, sound: false }))}
        />
      )}

      {sequence.leaderboardIcon && (
        <LeaderboardIconImg
          src={leaderboard}
          isBouncing={bounceLeaderboardIcon}
          onClick={toggleSidebar}
          onMouseEnter={() => setHovered(p => ({ ...p, leaderboardIcon: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, leaderboardIcon: false }))}
        />
      )}

      {/* ✅ ENHANCED SIDEBAR OVERLAY */}
      <Overlay isOpen={isSidebarOpen} onClick={closeSidebar} />
      
      {/* ✅ ENHANCED SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen}>
        <SidebarHeader>
          <CloseButton onClick={closeSidebar}>✕</CloseButton>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarIcon>🏆</SidebarIcon>
          <SidebarTitle>Leaderboard</SidebarTitle>
          <SidebarSubtitle>Track your progress</SidebarSubtitle>
          
          <ButtonsWrapper>
            {/* Translate Mode with Submenu */}
            <SidebarButton onClick={toggleTranslateSubmenu} isActive={isTranslateSubmenuOpen}>
              <ButtonIcon>🔄</ButtonIcon>
              <ButtonText>
                <span>Translate Mode</span>
                <small>Multiple game types</small>
              </ButtonText>
              <Chevron isOpen={isTranslateSubmenuOpen}>▼</Chevron>
            </SidebarButton>
            
            <SubmenuContainer isOpen={isTranslateSubmenuOpen}>
              <SubmenuButton onClick={() => { navigate("/multiple-board"); closeSidebar(); }}>
                <SubmenuIcon>🧠</SubmenuIcon>
                <span>Multiple Choice</span>
              </SubmenuButton>
              <SubmenuButton onClick={() => { navigate("/typing-board"); closeSidebar(); }}>
                <SubmenuIcon>⌨️</SubmenuIcon>
                <span>Typing</span>
              </SubmenuButton>
              <SubmenuButton onClick={() => { navigate("/drag-board"); closeSidebar(); }}>
                <SubmenuIcon>🧩</SubmenuIcon>
                <span>Drag & Drop</span>
              </SubmenuButton>
            </SubmenuContainer>
            
            <SidebarButton onClick={() => { navigate("/tap-mode"); closeSidebar(); }}>
              <ButtonIcon>👆</ButtonIcon>
              <ButtonText>
                <span>Tap Mode</span>
                <small>Quick recognition</small>
              </ButtonText>
            </SidebarButton>
            
            <SidebarButton onClick={() => { navigate("/write-mode"); closeSidebar(); }}>
              <ButtonIcon>✍️</ButtonIcon>
              <ButtonText>
                <span>Write Mode</span>
                <small>Practice writing</small>
              </ButtonText>
            </SidebarButton>
          </ButtonsWrapper>
        </SidebarContent>
        
        <SidebarFooter>
          <span>EbaybayMo Thesis 2024</span>
        </SidebarFooter>
      </Sidebar>

      {/* ✅ TRANSLATE MODE MODAL */}
      <ModalOverlay isOpen={isTranslateModalOpen} onClick={closeTranslateModal} />
      <TranslateModal isOpen={isTranslateModalOpen}>
        <ModalHeader>
          <ModalTitle>🔄 Translate Mode</ModalTitle>
          <ModalCloseButton onClick={closeTranslateModal}>✕</ModalCloseButton>
        </ModalHeader>
        
        <ModalContent>
          <ModalSubtitle>Choose your game mode</ModalSubtitle>
          
          <ModalButtonsWrapper>
            <ModalButton onClick={() => { goToMode("multiple"); closeTranslateModal(); }}>
              <ModalButtonIcon>🧠</ModalButtonIcon>
              <ModalButtonText>
                <span>Multiple Choice</span>
                <small>Select the correct answer</small>
              </ModalButtonText>
            </ModalButton>
            
            <ModalButton onClick={() => { goToMode("typing"); closeTranslateModal(); }}>
              <ModalButtonIcon>⌨️</ModalButtonIcon>
              <ModalButtonText>
                <span>Typing</span>
                <small>Type the translation</small>
              </ModalButtonText>
            </ModalButton>
            
            <ModalButton onClick={() => { goToMode("dragdrop"); closeTranslateModal(); }}>
              <ModalButtonIcon>🧩</ModalButtonIcon>
              <ModalButtonText>
                <span>Drag & Drop</span>
                <small>Match words correctly</small>
              </ModalButtonText>
            </ModalButton>
          </ModalButtonsWrapper>
        </ModalContent>
      </TranslateModal>

      {sequence.home && (
        <Home
          src={home}
          isBouncing={bounceHome}
          onMouseEnter={() => setHovered(p => ({ ...p, home: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, home: false }))}
          onClick={() => navigate('/')}
        />
      )}

      {/* ✅ UPDATED Start Game Logic */}
      {sequence.startGame && (
        <StartGameWrapper>
          <CustomButton
            label="Start Game"
            width="300px"
            onClick={() => {
              if (activePlate === 'write') navigate('/write');
              else if (activePlate === 'plate2') openTranslateModal();
              else if (activePlate === 'plate3') navigate('/difficulty-tap');
            }}
          />
        </StartGameWrapper>
      )}

      {sequence.quit && (
        <QuitWrapper>
          <CustomButton
            label="Quit"
            width="300px"
            onClick={() => navigate('/')}
          />
        </QuitWrapper>
      )}
    </Container>
  );
};

export default HomeGame;

/* ------------------------ ANIMATIONS ------------------------ */
const slideFromTop = keyframes`
  from { transform: translateY(-150px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const heartbeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.06); }
  50% { transform: scale(1); }
  75% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

const shake = keyframes`
  0%, 74% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-6deg); }
  80% { transform: translateY(6px) rotate(5deg); }
  85% { transform: translateY(-4px) rotate(-3deg); }
  90%, 100% { transform: translateY(0) rotate(0deg); }
`;

const zoomRotate = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
`;

const slideFromBottom = keyframes`
  from { transform: translateY(200px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const waveZoom = keyframes`
  0% { transform: scale(0.8) rotate(0deg); opacity: 1; }
  25% { transform: scale(1) rotate(3deg); }
  50% { transform: scale(1.05) rotate(-3deg); }
  75% { transform: scale(1) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const rotateFromRight = keyframes`
  from { transform: translateX(150px) rotate(0deg); opacity: 0; }
  to { transform: translateX(0) rotate(360deg); opacity: 1; }
`;

const bounceLoop = keyframes`
  0%,20%,50%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const translateInLeft = keyframes`
  from { transform: translateX(-200px); }
  to { transform: translateX(0); }
`;

const translateInBottom = keyframes`
  from { transform: translateY(200px); }
  to { transform: translateY(0); }
`;

const translateInRight = keyframes`
  from { transform: translateX(200px); }
  to { transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const fadeInContent = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalPopIn = keyframes`
  0% { transform: scale(0.8) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

/* ------------------------ STYLED COMPONENTS ------------------------ */
const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  overflow: hidden;
`;

const LeftImage = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 410px;
  height: auto;
  animation: ${translateInLeft} 0.5s forwards;
`;

const BottomImage = styled.img`
  position: absolute;
  bottom: -20%;
  left: 0;
  width: 1530px;
  height: auto;
  animation: ${translateInBottom} 0.5s forwards;
`;

const RightImage = styled.img`
  position: absolute;
  right: -3%;
  top: 0;
  width: 410px;
  height: auto;
  animation: ${translateInRight} 0.5s forwards;
`;

const Write = styled.img`
  position: absolute;
  top: 61%;
  left: -8%;
  width: 550px;
  height: auto;
  cursor: pointer;
  z-index: 50;
  pointer-events: auto;
  ${({ isActive }) => isActive ? css`
    animation: ${heartbeat} 1.6s ease-in-out infinite;
    z-index: 900;
  ` : css`
    animation: ${zoomRotate} 1s ease-out, ${shake} 6s 1s ease-in-out infinite;
  `}
`;

const Plate1 = styled.img`
  position: absolute;
  top: 61%;
  left: -8%;
  width: 550px;
  height: auto;
  cursor: pointer;
  z-index: 50;
  pointer-events: auto;
  ${({ isActive }) => isActive ? css`
    animation: ${heartbeat} 1.6s ease-in-out infinite;
    z-index: 900;
  ` : css`
    animation: ${zoomRotate} 1s ease-out, ${shake} 6s 1s ease-in-out infinite;
  `}
`;

const Plate2 = styled.img`
  position: absolute;
  top: 32%;
  left: -8%;
  width: 500px;
  height: auto;
  z-index: 320;
  pointer-events: auto;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-6px) scale(1.02); }
  ${({ isActive }) => isActive ? css`
    animation: ${heartbeat} 1.6s ease-in-out infinite;
    z-index: 1000;
    transform: none;
  ` : css`
    animation: ${zoomRotate} 1s ease-out, ${shake} 3.6s 0.6s ease-in-out infinite;
  `}
`;

const Plate3 = styled.img`
  position: absolute;
  top: 42%;
  left: 7%;
  width: 520px;
  height: auto;
  z-index: 310;
  pointer-events: auto;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-4px) scale(1.02); }
  ${({ isActive }) => isActive ? css`
    animation: ${heartbeat} 1.6s ease-in-out infinite;
    z-index: 1000;
    transform: none;
  ` : css`
    animation: ${zoomRotate} 1s ease-out, ${shake} 3.6s 0.6s ease-in-out infinite;
  `}
`;

const Girl9 = styled.img`
  position: absolute;
  bottom: 0%;
  left: 75%;
  width: 430px;
  height: auto;
  animation: ${slideFromBottom} 1s ease-out,
             ${({ isBouncing }) => (isBouncing ? css`${bounceLoop} 1.5s ease` : 'none')};
`;

const GameName = styled.img`
  position: absolute;
  top: 2%;
  left: 25%;
  width: 760px;
  height: auto;
  animation: ${waveZoom} 2.8s ease-in-out infinite;
`;

const Sound = styled.img`
  position: absolute;
  top: -6%;
  right: -10%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 10;
  animation: ${rotateFromRight} 1s ease-out,
             ${({ isBouncing }) => (isBouncing ? css`${bounceLoop} 1.5s ease` : 'none')};
  transition: transform 0.3s ease;
  &:hover { transform: scale(0.9); }
`;

const LeaderboardIconImg = styled.img`
  position: absolute;
  top: 12%;
  right: -10%;
  width: 350px;
  height: auto;
  cursor: pointer;
  z-index: 10;
  animation: ${rotateFromRight} 1s ease-out,
             ${({ isBouncing }) => (isBouncing ? css`${bounceLoop} 1.5s ease` : 'none')};
  transition: transform 0.3s ease;
  &:hover { transform: scale(0.9); }
`;

const Home = styled.img`
  position: absolute;
  top: -6%;
  left: -5%;
  width: 350px;
  height: auto;
  animation: ${slideFromTop} 0.9s ease-out,
             ${({ isBouncing }) => (isBouncing ? css`${bounceLoop} 1.5s ease` : 'none')};
  transition: transform 0.3s ease;
  &:hover { transform: scale(0.9); }
`;

const StartGameWrapper = styled.div`
  position: absolute;
  top: 55%;
  left: 40%;
  transform: translate(-50%, -50%);
  animation: ${bounceIn} 0.9s ease forwards;
`;

const QuitWrapper = styled.div`
  position: absolute;
  top: 65%;
  left: 40%;
  transform: translate(-50%, -50%);
  animation: ${bounceIn} 0.9s ease forwards;
`;

/* ✅ ENHANCED SIDEBAR STYLES */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 998;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.4s ease, visibility 0.4s ease;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100%;
  background: linear-gradient(180deg, rgba(194, 65, 12, 0.98) 0%, rgba(234, 88, 12, 0.98) 100%);
  z-index: 999;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.4);
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ffe29f, #ff7300, #ff3a0f);
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  position: relative;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px 30px;
  animation: ${fadeInContent} 0.5s ease 0.2s both;
  overflow-y: auto;
`;

const SidebarIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
`;

const SidebarTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  color: #fff;
  text-align: center;
  background: linear-gradient(90deg, #fff, #ffe29f, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const SidebarSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0 35px;
  font-weight: 300;
  letter-spacing: 1px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SidebarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 18px 20px;
  background: ${({ isActive }) => isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ isActive }) => isActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  backdrop-filter: blur(10px);
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateX(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateX(-2px);
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
`;

const ButtonText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  
  span {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  small {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 400;
  }
`;

const Chevron = styled.span`
  font-size: 0.9rem;
  transition: transform 0.3s ease;
  transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  opacity: 0.8;
`;

const SubmenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding-left: 20px;
  overflow: hidden;
  max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid rgba(255, 158, 0, 0.6);
  margin-left: 20px;
  margin-top: ${({ isOpen }) => (isOpen ? '10px' : '0')};
  margin-bottom: ${({ isOpen }) => (isOpen ? '10px' : '0')};
`;

const SubmenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 20px);
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateX(5px);
  }
  
  span {
    font-size: 1rem;
    font-weight: 500;
  }
`;

const SubmenuIcon = styled.span`
  font-size: 1.4rem;
`;

const SidebarFooter = styled.div`
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  span {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 300;
  }
`;

/* ✅ TRANSLATE MODAL STYLES */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const TranslateModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: ${({ isOpen }) => isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)'};
  width: 420px;
  max-width: 90%;
  background: linear-gradient(135deg, rgba(194, 65, 12, 0.98) 0%, rgba(234, 88, 12, 0.98) 100%);
  border-radius: 24px;
  z-index: 1001;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #ffe29f, #ff7300, #ff3a0f);
  }
  
  animation: ${({ isOpen }) => isOpen ? css`${modalPopIn} 0.4s ease` : 'none'};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg) scale(1.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ModalContent = styled.div`
  padding: 20px 24px 28px;
`;

const ModalSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  text-align: center;
  font-weight: 400;
`;

const ModalButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateX(8px) scale(1.02);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateX(4px) scale(0.98);
  }
`;

const ModalButtonIcon = styled.span`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
`;

const ModalButtonText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  
  span {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  small {
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: 400;
  }
`;