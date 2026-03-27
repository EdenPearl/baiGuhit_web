import React from 'react';
import styled from 'styled-components';
import AboutImg from '../Assests/about.png';

const AboutSection = () => {
  return (
    <AboutContainer>
      <ContentWrapper>
        <ImageWrapper>
          <img src={AboutImg} alt="Illustration" />
        </ImageWrapper>
        <TextWrapper>
          <AboutTitle>About</AboutTitle>
          <AboutDescription>
            <span>eBaybayMo </span>is a community-driven app that uses technology to bring Baybayin characters to life, connecting tattoo artists, t-shirt designers, scholars, and enthusiasts with the rich heritage of the Filipino script.
          </AboutDescription>
        </TextWrapper>
      </ContentWrapper>
    </AboutContainer>
  );
};

export default AboutSection;

const AboutContainer = styled.section`
  padding: 2rem;
  background: linear-gradient(135deg, #8B1B1B 0%, #4A0B0B 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: left;
  animation: fadeIn 1s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
`;

const ImageWrapper = styled.div`
  flex: 1;
  padding-right: 2rem;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const TextWrapper = styled.div`
  flex: 2;
`;

const AboutTitle = styled.h2`
  font-size: 2.5rem;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const AboutDescription = styled.p`
  width: 90%;
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;

  span {
    font-weight: bold;
    font-style: italic;
    color: #FFD700; /* Gold color for emphasis */
  }
`;