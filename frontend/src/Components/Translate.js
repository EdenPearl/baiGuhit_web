import React, { useState } from 'react';
import styled from 'styled-components';
import Livecam from '../Components/Livecam';
import Upload from '../Components/Upload';
import History from '../Components/History';

const Translate = ({ isFloating, onClose }) => {
  const [selectedContent, setSelectedContent] = useState('Livecam');

  const renderContent = () => {
    switch (selectedContent) {
      case 'Livecam':
        return <Livecam />;
      case 'Upload':
        return <Upload />;
      case 'History':
        return <History />;
      default:
        return <Livecam />;
    }
  };

  return (
    <TranslateContainer isFloating={isFloating}>
      {isFloating && <CloseButton onClick={onClose}>×</CloseButton>}

      <Sidebar>
        {['Livecam', 'Upload', 'History'].map(tab => (
          <TabButton
            key={tab}
            onClick={() => setSelectedContent(tab)}
            active={selectedContent === tab}
          >
            {tab}
          </TabButton>
        ))}
      </Sidebar>

      <Content>
        <InnerContent>
          {renderContent()}
        </InnerContent>
      </Content>
    </TranslateContainer>
  );
};

export default Translate;
const TranslateContainer = styled.div`
  display: flex;
  height: ${({ isFloating }) => (isFloating ? '700px' : '100vh')};
  width: ${({ isFloating }) => (isFloating ? '800px' : '100%')};
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  border-radius: ${({ isFloating }) => (isFloating ? '20px' : '0')};
  box-shadow: ${({ isFloating }) =>
    isFloating ? '0 8px 30px rgba(0,0,0,0.4)' : 'none'};
  position: ${({ isFloating }) => (isFloating ? 'fixed' : 'relative')};
  ${({ isFloating }) =>
    isFloating &&
    `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `}
  z-index: ${({ isFloating }) => (isFloating ? '1000' : '1')};
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
`;

const Sidebar = styled.div`
  width: 200px;
  background: linear-gradient(135deg, #a52a2a, #e7915b);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TabButton = styled.button`
  background-color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.2)')};
  color: ${({ active }) => (active ? '#A52A2A' : '#fff')};
  padding: 12px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.4)')};
    color: #A52A2A;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
  background: linear-gradient(135deg, #fdfcfb, #e7e4e4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InnerContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 14px;
  background: #A52A2A;
  color: white;
  border: none;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #8B1B1B;
  }
`;
