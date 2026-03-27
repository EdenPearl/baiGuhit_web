import React, { useState } from 'react';
import styled from 'styled-components';

const GameDashboard = () => {
  const [activePage, setActivePage] = useState('HomeGame');


  return (
    <DashboardWrapper>
      <TopBar>
        
        <NavButtons>
        </NavButtons>
      </TopBar>
    </DashboardWrapper>
  );
};

export default GameDashboard;

// 🎨 Styled Components
const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2b2d42;
  color: #fff;
  padding: 15px 30px;
`;

const GameTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: #8d99ae;
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background-color: #edf2f4;
    color: #2b2d42;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
`;
