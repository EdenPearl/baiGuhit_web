import React, { useState } from "react";
import styled from "styled-components";
import CustomButton from "./CustomButton.js";

export default function DifficultyWrite({ onPlay }) {
  const [selected, setSelected] = useState("Medium");

  const handleSelectDifficulty = (level) => {
    setSelected(level);
    onPlay(level); // auto start immediately
  };

  return (
    <Card>
      <Title>Select Difficulty</Title>

      <Buttons>
        {["Easy", "Medium", "Hard"].map((level) => (
          <CustomButton
            key={level}
            label={level}
            width="200px"
            onClick={() => handleSelectDifficulty(level)}
            color={selected === level ? "#f4a01f" : "#d9a066"}
          />
        ))}
      </Buttons>
    </Card>
  );
}

/* ------------------ STYLED COMPONENTS ------------------ */

const Card = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 50px 60px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease;
`;

const Title = styled.h1`
  font-size: 36px;
  letter-spacing: 1px;
  margin-bottom: 40px;
  color: #fff;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
