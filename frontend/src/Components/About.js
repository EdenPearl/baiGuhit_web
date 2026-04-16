import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AboutContainer>
      <AboutNavBar>
        <BackBtn type="button" onClick={() => navigate('/')} aria-label="Go back home">
          ← Back to Home
        </BackBtn>
        <AboutTitle>About bAIguhit</AboutTitle>
        <Spacer />
      </AboutNavBar>

      <AboutContent>
        <Section>
          <SectionHeading>What is bAIguhit?</SectionHeading>
          <SectionText>
            bAIguhit is an ML-powered learning platform designed to help you master the ancient Philippine Baybayin script through interactive games and challenges. Whether you're a complete beginner or looking to refine your skills, our engaging game modes make learning fun and effective.
          </SectionText>
        </Section>

        <Section>
          <SectionHeading>Our Mission</SectionHeading>
          <SectionText>
            We believe in reviving and preserving the beautiful Baybayin script through modern, interactive technology. Our mission is to make learning this ancient script accessible, engaging, and enjoyable for everyone.
          </SectionText>
        </Section>

        <Section>
          <SectionHeading>Game Modes</SectionHeading>
          <ModesList>
            <ModeItem>
              <ModeIcon>✍️</ModeIcon>
              <ModeInfo>
                <ModeName>Write Mode</ModeName>
                <ModeDesc>Write the Baybayin equivalent of each Latin letter shown on screen. Perfect for building muscle memory.</ModeDesc>
              </ModeInfo>
            </ModeItem>
            <ModeItem>
              <ModeIcon>👆</ModeIcon>
              <ModeInfo>
                <ModeName>Tap Mode</ModeName>
                <ModeDesc>Tap the correct Baybayin character that matches the visual prompt. Test your recognition skills quickly.</ModeDesc>
              </ModeInfo>
            </ModeItem>
            <ModeItem>
              <ModeIcon>🔄</ModeIcon>
              <ModeInfo>
                <ModeName>Translate Mode</ModeName>
                <ModeDesc>Engage with multiple choice, character ID, typing, and drag-and-drop challenges to deepen your comprehension.</ModeDesc>
              </ModeInfo>
            </ModeItem>
          </ModesList>
        </Section>

        <Section>
          <SectionHeading>Features</SectionHeading>
          <FeaturesList>
            <FeatureItem>🤖 ML-Powered Learning - Get personalized guidance as you progress</FeatureItem>
            <FeatureItem>📊 Leaderboards - Compete with other learners and track your rank</FeatureItem>
            <FeatureItem>🎮 Multiple Game Modes - Diverse ways to practice and learn</FeatureItem>
            <FeatureItem>🎵 Engaging Audio - Immersive sound design to enhance your experience</FeatureItem>
            <FeatureItem>📱 Responsive Design - Learn on any device, anytime, anywhere</FeatureItem>
          </FeaturesList>
        </Section>

        <Section>
          <SectionHeading>Why Learn Baybayin?</SectionHeading>
          <SectionText>
            The Baybayin script is a fascinating piece of Philippine cultural heritage. Learning it connects you to over 500 years of history and helps preserve this beautiful writing system for future generations. Beyond cultural significance, learning Baybayin enhances your understanding of linguistic patterns and ancient writing systems.
          </SectionText>
        </Section>

        <Section>
          <SectionHeading>Get Started</SectionHeading>
          <SectionText>
            Ready to begin your Baybayin journey? Head back to the home page and click "Start Playing" to jump into your first game mode. Whether you choose Write, Tap, or Translate mode, each one will teach you something new about this remarkable script.
          </SectionText>
          <StartBtn type="button" onClick={() => navigate('/')}>
            🚀 Start Learning Now
          </StartBtn>
        </Section>
      </AboutContent>
    </AboutContainer>
  );
};

export default About;

/* ═══════════════════════════
   KEYFRAMES
═══════════════════════════ */

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

/* ═══════════════════════════
   STYLED COMPONENTS
═══════════════════════════ */

const AboutContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(160deg, #2b1004 0%, #4a1706 46%, #8a2a08 100%);
  color: #fff6eb;
  font-family: 'DM Sans', sans-serif;
`;

const AboutNavBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(42, 16, 4, 0.98) 0%, rgba(42, 16, 4, 0.90) 100%);
  border-bottom: 1px solid rgba(251, 196, 23, 0.15);
  backdrop-filter: blur(10px);
`;

const BackBtn = styled.button`
  background: none;
  border: 1px solid rgba(251, 196, 23, 0.3);
  color: #fbc417;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(251, 196, 23, 0.1);
    border-color: rgba(251, 196, 23, 0.6);
  }

  &:focus-visible {
    outline: 2px solid rgba(251, 196, 23, 0.6);
    outline-offset: 2px;
  }
`;

const AboutTitle = styled.h1`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  flex: 1;
`;

const Spacer = styled.div`
  width: 80px;
`;

const AboutContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 24px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Section = styled.section`
  margin-bottom: 48px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeading = styled.h2`
  margin: 0 0 16px;
  font-family: 'Cinzel', serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(90deg, #fbc417, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionText = styled.p`
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 246, 235, 0.85);
`;

const ModesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModeItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(251, 196, 23, 0.08);
  border: 1px solid rgba(251, 196, 23, 0.15);
  animation: ${slideInLeft} 0.4s ease-out;

  &:hover {
    background: rgba(251, 196, 23, 0.12);
    border-color: rgba(251, 196, 23, 0.3);
  }
`;

const ModeIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

const ModeInfo = styled.div`
  flex: 1;
`;

const ModeName = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #fbc417;
`;

const ModeDesc = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 246, 235, 0.75);
`;

const FeaturesList = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.li`
  font-size: 15px;
  color: rgba(255, 246, 235, 0.85);
  line-height: 1.6;
  padding-left: 8px;

  &:before {
    content: '→ ';
    color: #fbc417;
    font-weight: 700;
    margin-right: 8px;
  }
`;

const StartBtn = styled.button`
  margin-top: 24px;
  padding: 16px 32px;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #fbc417 0%, #f59e0b 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(251, 196, 23, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(251, 196, 23, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid rgba(251, 196, 23, 0.8);
    outline-offset: 2px;
  }
`;
