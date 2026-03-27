import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton.js";
import green1 from '../../../Assests/green1.png';
import green4 from '../../../Assests/green4.png';
import home from '../../../Assests/backB.png';
import bgMusicFile from "../../../Assests/Trans.mp3"; // ✅ Background music

// All 17 Baybayin characters
const BAYBAYIN_CHARS = ["ᜀ","ᜁ","ᜂ","ᜃ","ᜄ","ᜅ","ᜆ","ᜇ","ᜈ","ᜉ","ᜊ","ᜋ","ᜌ","ᜎ","ᜏ","ᜐ","ᜑ"];

const Translate = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chars, setChars] = useState([]);
  const navigate = useNavigate();
  const audioRef = useRef(null); // ✅ Audio reference

  const goToMode = (mode) => {
    if (mode === "multiple") navigate("/difficulty-multiple");
    if (mode === "typing") navigate("/difficulty-typing");
    if (mode === "dragdrop") navigate("/difficulty-drag");
  };

  // ✅ Background Music Effect
  useEffect(() => {
    audioRef.current = new Audio(bgMusicFile);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // adjust volume here
    audioRef.current.play().catch(() => {});

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  // Generate floating Baybayin characters
  useEffect(() => {
    const temp = BAYBAYIN_CHARS.map((char) => ({
      char,
      top: Math.random() * 90,
      left: Math.random() * 90,
      size: 16 + Math.random() * 24,
      delay: Math.random() * 10
    }));
    setChars(temp);
  }, []);

  return (
    <Container>
      <FloatingChars>
        {chars.map((item, idx) => (
          <Char
            key={idx}
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
              animationDelay: `${item.delay}s`
            }}
          >
            {item.char}
          </Char>
        ))}
      </FloatingChars>

      <LeftImage src={green1} />
      <RightImage src={green4} />

      <GlowTitle>EbaybayMo: PLAI Translate Mode</GlowTitle>
      <SubText>Select your preferred game mode</SubText>

      <CenterWrapper>
        <ModeContainer>
          <ModeCard
            onMouseEnter={() => setHoveredCard("multiple")}
            onMouseLeave={() => setHoveredCard(null)}
            blur={hoveredCard && hoveredCard !== "multiple"}
            onClick={() => goToMode("multiple")}
          >
            <h3>🧠 Multiple Choice</h3>
            <p>Identify and choose the correct Baybayin equivalent of the given Roman letter or word.</p>
          </ModeCard>

          <ModeCard
            onMouseEnter={() => setHoveredCard("typing")}
            onMouseLeave={() => setHoveredCard(null)}
            blur={hoveredCard && hoveredCard !== "typing"}
            onClick={() => goToMode("typing")}
          >
            <h3>⌨️ Typing Mode</h3>
            <p>Identify the Roman equivalent of the given Baybayin symbol and type your answer manually.</p>
          </ModeCard>

          <ModeCard
            onMouseEnter={() => setHoveredCard("dragdrop")}
            onMouseLeave={() => setHoveredCard(null)}
            blur={hoveredCard && hoveredCard !== "dragdrop"}
            onClick={() => goToMode("dragdrop")}
          >
            <h3>🧩 Drag & Drop</h3>
            <p>Identify the correct letter or word that corresponds to the displayed Baybayin symbol. Drag your answer to match it correctly.</p>
          </ModeCard>
        </ModeContainer>
      </CenterWrapper>

      <BackButton src={home} onClick={() => navigate("/HomeGame")} />
    </Container>
  );
};

export default Translate;


/* ------------------- STYLES ------------------- */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const slideFromTop = keyframes`
  from { transform: translateY(-150px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const softFloat = keyframes`
  0%,100% { transform: translate(0,0); opacity: 0.15; }
  50% { transform: translate(5px,-15px); opacity: 0.08; }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 120px;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  color: #fff;
  font-family: "Poppins", sans-serif;
  text-align: center;
  overflow-y: auto;
  position: relative;
`;

const FloatingChars = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const Char = styled.span`
  position: absolute;
  color: #fff;
  opacity: 0.15;
  font-weight: bold;
  animation: ${softFloat} 12s ease-in-out infinite;
`;

const CenterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-direction: column;
  min-height: 60vh;
  z-index: 1;
`;

const LeftImage = styled.img`
  position: absolute; left: 0; top: 0;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const RightImage = styled.img`
  position: absolute; right: 0; top: 0;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const GlowTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #fff, #ffe29f, #ff7300, #ff3a0f, #fff, #5ee7df);
  background-size: 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 4s linear infinite alternate;
  text-shadow: 0 0 25px rgba(255,255,255,0.7);
  z-index: 1;
`;

const SubText = styled.p`
  font-size: 1.3rem;
  margin-bottom: 35px;
  opacity: 0.9;
  z-index: 1;
`;

const ModeContainer = styled.div`
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const ModeCard = styled.div`
  width: 280px;
  padding: 25px;
  border-radius: 20px;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.8s ease both;
  filter: ${({ blur }) => (blur ? "blur(4px) brightness(0.7)" : "none")};

  &:hover {
    transform: scale(1.12) rotate(1deg);
    background: rgba(255,255,255,0.35);
    box-shadow: 0 0 30px rgba(255,255,255,0.9);
  }

  h3 { margin-bottom: 10px; font-size: 1.3rem; }
  p { font-size: 0.95rem; opacity: 0.9; }
`;

const BackButton = styled.img`
  position: absolute;
  top: -6%;
  left: -5%;
  width: 350px;
  cursor: pointer;
  z-index: 10;
  animation: ${slideFromTop} 0.9s ease-out;
  transition: .3s;

  &:hover {
    transform: scale(0.9) rotate(-2deg);
  }
`;
