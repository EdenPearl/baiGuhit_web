// Translate.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const Translate = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  const handlePlay = () => {
    if (selectedMode === "multiple") navigate("/multiple");
    else if (selectedMode === "typing") navigate("/typing");
    else if (selectedMode === "dragdrop") navigate("/drag");
  };

  return (
    <Container>
      <GlowTitle>EbaybayMo: PLAI Translate Mode</GlowTitle>
      <SubText>Select your preferred game mode</SubText>

      <ModeContainer>
        <ModeCard
          selected={selectedMode === "multiple"}
          onClick={() => setSelectedMode("multiple")}
        >
          <h3>🧠 Multiple Choice</h3>
          <p>Choose the correct Baybayin translation from given options.</p>
        </ModeCard>

        <ModeCard
          selected={selectedMode === "typing"}
          onClick={() => setSelectedMode("typing")}
        >
          <h3>⌨️ Typing Mode</h3>
          <p>Type the correct Roman translation manually.</p>
        </ModeCard>

        <ModeCard
          selected={selectedMode === "dragdrop"}
          onClick={() => setSelectedMode("dragdrop")}
        >
          <h3>🧩 Drag & Drop</h3>
          <p>Match the correct Baybayin symbols by dragging them.</p>
        </ModeCard>
      </ModeContainer>

      {selectedMode && (
        <SelectionBox>
          <h2>Selected Mode:</h2>
          <SelectedMode>
            {selectedMode === "multiple"
              ? "🧠 Multiple Choice"
              : selectedMode === "typing"
              ? "⌨️ Typing Mode"
              : "🧩 Drag & Drop"}
          </SelectedMode>

          <ActionButtons>
            <Button onClick={handlePlay}>Play</Button>
            <ButtonSecondary onClick={() => setSelectedMode(null)}>
              Back
            </ButtonSecondary>
          </ActionButtons>
        </SelectionBox>
      )}

      <BackButton onClick={() => navigate("/")}>⬅ Back to Menu</BackButton>
    </Container>
  );
};

export default Translate;

/* 🌈 Enhanced Styled Components */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #ffdbA6, #f29d01, #f27905, #de7006, #f33f18, #ff3a0f);
  color: #fff;
  font-family: "Poppins", sans-serif;
  text-align: center;
  overflow: hidden;
  animation: ${fadeIn} 1s ease-out;
`;

const GlowTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #fff, #ffe29f, #ff7300, #ff3a0f, #fff);
  background-size: 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
`;

const SubText = styled.p`
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
`;

const ModeContainer = styled.div`
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 30px;
`;

const ModeCard = styled.div`
  width: 280px;
  padding: 25px;
  border-radius: 20px;

  background: ${({ selected }) =>
    selected ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"};
  border: 2px solid
    ${({ selected }) => (selected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)")};
  color: ${({ selected }) => (selected ? "#fff" : "#f9f9f9")};
  box-shadow: ${({ selected }) =>
    selected
      ? "0 0 20px rgba(255,255,255,0.6)"
      : "0 4px 15px rgba(0,0,0,0.3)"};
  transition: all 0.3s ease;
  cursor: pointer;
  transform: ${({ selected }) => (selected ? "scale(1.05)" : "scale(1)")};
  animation: ${fadeIn} 0.8s ease both;

  &:hover {
    transform: scale(1.08) rotate(1deg);
    background: rgba(255,255,255,0.3);
    box-shadow: 0 0 25px rgba(255,255,255,0.7);
  }

  h3 {
    margin-bottom: 10px;
    font-size: 1.3rem;
  }

  p {
    font-size: 0.95rem;
    opacity: 0.9;
  }
`;

const SelectionBox = styled.div`
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 20px 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
 
  animation: ${fadeIn} 0.8s ease both;
`;

const SelectedMode = styled.h2`
  margin: 10px 0;
  color: #ffffffff;
  text-shadow: 0 0 10px rgba(255,255,255,0.7);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 15px;
  background: linear-gradient(90deg, #fff, #ffd89b);
  color: #f27905;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(90deg, #ff7300, #ff3a0f);
    color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  }
`;

const ButtonSecondary = styled(Button)`
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.5);

  &:hover {
    background: linear-gradient(90deg, #f33f18, #ff7300);
    color: #fff;
  }
`;

const BackButton = styled.button`
  margin-top: 40px;
  padding: 10px 25px;
  border: none;
  border-radius: 10px;
  background: rgba(255,255,255,0.85);
  color: #f27905;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);

  &:hover {
    background: #ff3a0f;
    color: #fff;
    transform: scale(1.05);
  }
`;
