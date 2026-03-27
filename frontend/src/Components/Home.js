import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import notoSansTagalog from '../Assests/NotoSansTagalog-Regular.ttf';
import logo1 from '../Assests/logo1.jpg';
import bay1 from '../Assests/bay1.png';
import bay2 from '../Assests/bay2.png';
import bay3 from '../Assests/bay3.png';
import bay4 from '../Assests/bay4.png';
import bay5 from '../Assests/bay5.png';
import bay6 from '../Assests/bay6.png';
import bay7 from '../Assests/bay7.png';
import bay8 from '../Assests/bay8.png';
import bay9 from '../Assests/bay9.png';
import LoginModal from './Login';
import LoginGame from './Games/src/LoginGame';
import Translate from './Translate';

// Load Noto Sans Tagalog font
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'NotoSansTagalog';
    src: url(${notoSansTagalog}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleScan = () => setIsScanOpen(!isScanOpen);
  const toggleGameModal = () => setIsGameModalOpen(!isGameModalOpen);
  const toggleMarketModal = () => setIsMarketModalOpen(!isMarketModalOpen);

  const baybayinImages = [
    { src: bay1, top: '10%', left: '10%' },
    { src: bay2, top: '40%', left: '8%' },
    { src: bay3, top: '70%', left: '12%' },
    { src: bay4, top: '5%', left: '70%' },
    { src: bay5, top: '20%', left: '80%' },
    { src: bay6, top: '40%', left: '68%' },
    { src: bay7, top: '55%', left: '78%' },
    { src: bay8, top: '70%', left: '85%' },
    { src: bay9, top: '85%', left: '72%' },
  ];

  return (
    <>
      <GlobalStyle />
      <HeroContainer>
        {/* Background Baybayin images */}
        {baybayinImages.map((img, index) => (
          <FadingImage
            key={index}
            src={img.src}
            alt={`Baybayin ${index + 1}`}
            style={{
              top: img.top,
              left: img.left,
              width: `${120 + Math.random() * 50}px`,
              transform: `rotate(${Math.random() * 8 - 4}deg)`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        <ContentWrapper>
          <LeftContent>
            <Title>Reviving Tradition, Revolutionized by Innovation</Title>
            <ButtonContainer>
              <HeroButton onClick={toggleGameModal}>Play Game</HeroButton>
              <HeroButton onClick={toggleMarketModal}>Explore Marketplace</HeroButton>
            </ButtonContainer>
          </LeftContent>

          <RightContent>
            <LogoCircle>
              <LogoHero src={logo1} alt="App Logo" />
            </LogoCircle>
            <BrandTitle>eBaybayMo</BrandTitle>
          </RightContent>
        </ContentWrapper>

        <LoginModal isOpen={isModalOpen} toggleModal={toggleModal} />
        {isGameModalOpen && <LoginGame isOpen={isGameModalOpen} toggleModal={toggleGameModal} />}
        {isMarketModalOpen && <LoginModal isOpen={isMarketModalOpen} toggleModal={toggleMarketModal} />}
        {isScanOpen && <Translate isFloating={true} onClose={toggleScan} />}
      </HeroContainer>
    </>
  );
};

export default HeroSection;


// Styled Components
// Gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroContainer = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Animated gradient */
  background: linear-gradient(135deg, #cc460c, #e66524);
  background-size: 300% 300%;
  animation: ${gradientAnimation} 10s ease infinite;
`;



const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  max-width: 1300px;
  position: relative;
`;

const LeftContent = styled.div`
  flex: 1;
  color: #fff;
  padding: 2rem 3rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px; /* Prevent text from overlapping logo */
  background: rgba(0, 0, 0, 0.2); /* Subtle translucent box */
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 1024px) {
    max-width: 500px;
    padding: 1.5rem 2rem;
  }

  @media (max-width: 768px) {
    max-width: 90%;
    background: rgba(0, 0, 0, 0.35);
  }
`;

const Title = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 2.5vw + 1rem, 3rem);
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
`;


const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const HeroButton = styled.button`
  font-family: 'Poppins', sans-serif;
  background-color: #fff;
  color: #C2410C;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f3f3;
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const fade = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;

const FadingImage = styled.img`
  position: absolute;
  height: auto;
  opacity: 0.25;
  z-index: 0;
  animation: ${fade} ease-in-out infinite;
  pointer-events: none;
  will-change: transform, opacity;
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BrandTitle = styled.h2`
  margin-top: 1rem;
  font-size: 3rem;
  font-family: 'Poppins', sans-serif;
  font-style: italic;

  color: #ffffff; /* keep the white color */

  /* Add a subtle shadow behind the text */
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);

  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;


const LogoOverlay = styled.img`
  position: absolute; 
  top: 6px; 
  right: 30px;
  bottom: 0; 
  width: 455px; 
  height: auto; 
  z-index: 1; 
  animation: ${float} 3s ease-in-out infinite, ${fadeIn} 0.8s ease-in-out;
  pointer-events: none; /* So it doesn't block button clicks */ 
  opacity: 0.95; ;

  @media (max-width: 1024px) {
    right: 40px;
    top: 30px;
    width: clamp(180px, 35vw, 380px);
  }

  @media (max-width: 768px) {
    position: relative;
    top: 0;
    right: 0;
    margin: 2rem auto 0;
    display: block;
    width: 65%;
    max-width: 320px;
  }

  @media (max-width: 480px) {
    width: 75%;
    max-width: 280px;
  }
`;
const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
`;

const LogoCircle = styled.div`
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15) inset;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoHero = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;


const SlideContainer = styled.div`
  position: absolute;
  top: -80px;
  right: 80px;

  @media (max-width: 1024px) {
    top: -60px;
    right: 50px;
  }

  @media (max-width: 768px) {
    position: relative;
    top: 0;
    right: 0;
    display: flex;
    justify-content: center;
  }
`;



