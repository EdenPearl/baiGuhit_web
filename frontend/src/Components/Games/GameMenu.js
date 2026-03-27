import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ModesMenu = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <MenuCard>
        <MenuTitle>🎮 eBaybayMo Game Modes</MenuTitle>
        <Subtitle>Select how you want to learn Baybayin</Subtitle>

        <ButtonsWrapper>
          <ModeButton onClick={() => navigate('/write')}>
            ✍️ Write Mode
          </ModeButton>
          <ModeButton onClick={() => navigate('/tapmode')}>
            👆 Tap Mode
          </ModeButton>
          <ModeButton onClick={() => navigate('/translate')}>
            🌍 Translate Mode
          </ModeButton>
        </ButtonsWrapper>

        {/* ✅ Back Button */}
        <BackButton onClick={() => navigate('/dashboard')}>
          ⬅ Back to Dashboard
        </BackButton>
      </MenuCard>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5e6cc 0%, #f9d1b7 100%);
  font-family: 'Inter', sans-serif;
`;

const MenuCard = styled.div`
  background: #fff;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0px 6px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  text-align: center;
  border: 2px solid #8b5a2b;
`;

const MenuTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 15px;
  color: #3c2f2f;
  background: linear-gradient(90deg, #8b5a2b, #a67c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 18px;
  margin-bottom: 40px;
  color: #6b4e31;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const ModeButton = styled.button`
  padding: 15px;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  cursor: pointer;
  background: linear-gradient(90deg, #a67c00, #8b5a2b);
  color: #fff;
  font-weight: bold;
  transition: transform 0.2s ease, background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #805e00, #6b4e31);
    transform: translateY(-3px);
  }
`;

/* ✅ New Back Button */
const BackButton = styled.button`
  padding: 12px 20px;
  border: 2px solid #8b5a2b;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  background: #fff;
  color: #8b5a2b;
  font-weight: bold;
  transition: transform 0.2s ease, background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #8b5a2b;
    color: #fff;
    transform: translateY(-2px);
  }
`;

export default ModesMenu;
