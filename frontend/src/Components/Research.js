import ResearchImg from '../Assests/16.png';
import React, { useState } from 'react';
import styled from 'styled-components';

const ResearchSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <ResearchContainer>
      <ContentWrapper>
        <ImageWrapper>
          <img src={ResearchImg} alt="Illustration" />
        </ImageWrapper>
        <TextWrapper>
          <ResearchTitle>Research</ResearchTitle>
          <ResearchDescription>
            <ul>
              <li>
                <a
                  href="https://www.researchgate.net/publication/381189686_eBaybayMo_An_E-Learning_Mobile_Application_Tool_for_Transliterating_Baybayin_Characters_to_Latin_Letters_using_k-NN_Algorithm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  eBaybayMo: An E-Learning Mobile Application Tool for Transliterating Baybayin Characters to Latin Letters using k-NN Algorithm
                </a>
              </li>
            </ul>
          </ResearchDescription>
        </TextWrapper>
      </ContentWrapper>

      <ButtonWrapper>
        <ExploreButton onClick={toggleModal}>Explore</ExploreButton>
      </ButtonWrapper>

      {isModalOpen && (
        <ModalOverlay>
          <Modal>
            <CloseButton onClick={toggleModal}>×</CloseButton>
          </Modal>
        </ModalOverlay>
      )}
    </ResearchContainer>
  );
};

export default ResearchSection;

// Styled Components
const ResearchContainer = styled.section`
  padding: 2rem;
  background: linear-gradient(to right, #7f1d1d, #f97316);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center vertically */
  min-height: 100vh;
  color: white;
  text-align: center; /* Center text horizontally */
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center vertically */
  max-width: 1200px;
  width: 100%;
  margin: 0 auto; /* Center horizontally */

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    align-items: center; /* Ensure alignment for row layout */
  }
`;

const ImageWrapper = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center; /* Center image horizontally */

  img {
    width: 100%;
    max-width: 400px; /* Optional: limit image width */
    height: auto;
    border: 4px solid white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }
`;

const TextWrapper = styled.div`
  flex: 2;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center text content horizontally */
`;

const ResearchTitle = styled.h2`
  font-size: 2.5rem;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1rem;
`;

const ResearchDescription = styled.div`
  width: 90%;
  font-size: 1.25rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.7;

  ul {
    margin-top: 1rem;
    padding-left: 1.5rem;
    list-style-type: disc;
    text-align: left; /* Keep list text aligned left for readability */
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #c7d2fe;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center; /* Center button horizontally */
`;

const ExploreButton = styled.button`
  background: white;
  color: #7f1d1d;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f3f4f6;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 100%;
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4b5563;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #1f2937;
  }
`;