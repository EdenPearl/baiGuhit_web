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
import gameName from '../../../Assests/game_name2.png';
import write from '../../../Assests/write.png';
import tap from '../../../Assests/tap.png';
import translate from '../../../Assests/translate.png';
import bounceMusic from '../../../Assests/home.mp3';
import mute from '../../../Assests/mute.png';


import CustomButton from './CustomButton.js';

const HomeGame = () => {
  const navigate = useNavigate();

  /* ---------------- MUSIC ---------------- */
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  /* ---------------- STATES ---------------- */
  const [sequence, setSequence] = useState({
    green1: false,
    green2: false,
    green3: false,
    write: false,
    girl9: false,
    sound: false,
    home: false,
    plate2: false,
    startGame: false,
    leaderboard: false,
    plate3: false,
    quit: false,
    gameName: false,
  });

  const [bounceHome, setBounceHome] = useState(false);
  const [bounceSound, setBounceSound] = useState(false);
  const [bounceGirl, setBounceGirl] = useState(false);

  const [hovered, setHovered] = useState({
    sound: false,
    home: false,
  });

  const [replaceWriteWithPlate1, setReplaceWriteWithPlate1] = useState(false);
  const [activePlate, setActivePlate] = useState('write');

  // Sequential appearance
  useEffect(() => {
    const timers = [
      setTimeout(() => setSequence(p => ({ ...p, green1: true })), 200),
      setTimeout(() => setSequence(p => ({ ...p, green2: true })), 380),
      setTimeout(() => setSequence(p => ({ ...p, green3: true })), 480),
      setTimeout(() => setSequence(p => ({ ...p, write: true })), 500),
      setTimeout(() => setSequence(p => ({ ...p, girl9: true })), 600),
      setTimeout(() => setSequence(p => ({ ...p, sound: true })), 600),
      setTimeout(() => setSequence(p => ({ ...p, home: true })), 800),
      setTimeout(() => setSequence(p => ({ ...p, plate2: true })), 800),
      setTimeout(() => setSequence(p => ({ ...p, startGame: true })), 1000),
      setTimeout(() => setSequence(p => ({ ...p, leaderboard: true })), 1150), // ✅ ADD THIS
      setTimeout(() => setSequence(p => ({ ...p, plate3: true })), 1200),
      setTimeout(() => setSequence(p => ({ ...p, quit: true })), 1280),
      setTimeout(() => setSequence(p => ({ ...p, gameName: true })), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);


  useEffect(() => {
      const storedUser = localStorage.getItem("loginData");
    
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Logged-in User ID:", user.id);
        console.log("Logged-in email:", user.email);
        console.log("Full stored loginData:", user);
      } else {
        console.log("No user found in localStorage.");
      }
    }, []);
   
  /* ---------------- BOUNCE EFFECTS ---------------- */
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

  /* ---------------- TOGGLE MUSIC ---------------- */
const toggleMusic = () => {
  if (!audioRef.current) return;

  if (isPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play();
  }

  setIsPlaying(!isPlaying);
};

  return (
    <Container>

      {/* AUDIO */}
      <audio ref={audioRef} src={bounceMusic} loop />

      {/* BACKGROUNDS */}
      {sequence.green1 && <LeftImage src={green1} />}
      {sequence.green2 && <BottomImage src={green2} />}
      {sequence.green3 && <RightImage src={green3} />}

      {/* WRITE / PLATES */}
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


      {sequence.home && (
        <Home
          src={home}
          isBouncing={bounceHome}
          onMouseEnter={() => setHovered(p => ({ ...p, home: true }))}
          onMouseLeave={() => setHovered(p => ({ ...p, home: false }))}
          onClick={() => navigate('/')}
        />
      )}

      {sequence.startGame && (
        <StartGameWrapper>
          <CustomButton
            label="Start Game"
            width="300px"
            onClick={() => {
              if (activePlate === 'write') {
                navigate('/write', { state: { autoplayIntro: true } });
              }
              else if (activePlate === 'plate2') navigate('/translate');
              else if (activePlate === 'plate3') navigate('/difficulty-tap');
            }}
          />
        </StartGameWrapper>
      )}

      {sequence.leaderboard && (
  <LeaderboardWrapper>
    <CustomButton
      label="Leaderboard"
      width="300px"
      onClick={() => navigate('/leaderboard')}
    />
  </LeaderboardWrapper>
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

// heartbeat animation used for the active/top mode
const heartbeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.06); }
  50% { transform: scale(1); }
  75% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

// subtle shake to hint other options — shorter gap and slightly stronger intensity
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
  /* initial intro animation */
  animation: ${zoomRotate} 1s ease-out;
  /* if active -> heartbeat; if not active -> subtle shake to hint other modes (brief every 6s) */
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
  animation: ${zoomRotate} 1s ease-out;
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
  width: 500px; /* larger hit area for easier clicking */
  height: auto;
  z-index: 320; /* ensure it's above background art */
  pointer-events: auto;
  animation: ${zoomRotate} 1s ease-out;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-6px) scale(1.02); }
  ${({ isActive }) => isActive ? css`
    animation: ${heartbeat} 1.6s ease-in-out infinite;
    z-index: 1000;
    transform: none;
  ` : css`
    /* shorter cycle (3.6s) and slightly earlier start */
    animation: ${zoomRotate} 1s ease-out, ${shake} 3.6s 0.6s ease-in-out infinite;
  `}
`;

const Plate3 = styled.img`
  position: absolute;
  top: 42%;
  left: 7%;
  width: 520px; /* slightly larger for better touch/click area */
  height: auto;
  z-index: 310; /* above other plates by default to avoid being covered */
  pointer-events: auto;
  animation: ${zoomRotate} 1s ease-out;
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

const LeaderboardWrapper = styled.div`
  position: absolute;
  top: 62%;
  left: 40%;
  transform: translate(-50%, -50%);
  animation: ${bounceIn} 0.9s ease forwards;
`;

const QuitWrapper = styled.div`
  position: absolute;
  top: 69%;
  left: 40%;
  transform: translate(-50%, -50%);
  animation: ${bounceIn} 0.9s ease forwards;
`;