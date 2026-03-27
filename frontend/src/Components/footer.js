import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Column>
          <Title>eBaybayMo</Title>
          <Text>A community-driven app that uses technology to bring Baybayin characters to life, connecting tattoo artists, t-shirt designers, scholars, and enthusiasts with the rich heritage of the Filipino script</Text>
        </Column>
        <Column>
          <Title>Company</Title>
          <StyledLink href="#">About Us</StyledLink>
          <StyledLink href="#">Services</StyledLink>
          <StyledLink href="#">Blog</StyledLink>
          <StyledLink href="#">Contact Us</StyledLink>
        </Column>
        <Column>
          <Title>Support</Title>
          <StyledLink href="#">Support</StyledLink>
          <StyledLink href="#">Knowledge Base</StyledLink>
          <StyledLink href="#">Live Chat</StyledLink>
        </Column>
        <Column>
          <Title>Products</Title>
          <StyledLink href="#">Tshirt</StyledLink>
          <StyledLink href="#">Mug</StyledLink>
        </Column>
      </FooterContent>
      <SocialIconsContainer>
        <SocialIcon><a href="https://facebook.com"><FaFacebook /></a></SocialIcon>
        <SocialIcon><a href="https://twitter.com"><FaTwitter /></a></SocialIcon>
        <SocialIcon><a href="https://instagram.com"><FaInstagram /></a></SocialIcon>
        <SocialIcon><a href="https://linkedin.com"><FaLinkedin /></a></SocialIcon>
      </SocialIconsContainer>
      <FooterBottom>
        <BottomText>&copy; 2025 eBaybayMo. All rights reserved.</BottomText>
        <BottomLinks>
          <StyledLink href="#">Terms & Conditions</StyledLink>
          <StyledLink href="#">Privacy Policy</StyledLink>
        </BottomLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;

const FooterContainer = styled.footer`
  * {
    -webkit-tap-highlight-color: transparent;
  }
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: #fff;
  padding: 60px 20px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;


const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 200px;
  margin: 20px 0;

  @media (max-width: 768px) {
    margin: 15px 0;
  }
`;

const Title = styled.h4`
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 1.2em;
  color: Black;

  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const Text = styled.p`
  margin: 0;
  margin-bottom: 20px;
  line-height: 1.5;

  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const StyledLink = styled.a`
  display: block;
  color: #fff;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s ease;

  &:hover {
    color: #ff6600;
  }

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const SocialIconsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px 0;

  @media (max-width: 768px) {
    margin: 30px 0;
  }
`;

const SocialIcon = styled.div`
  font-size: 1.5em;
  margin: 0 15px;

  a {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #ff6600;
    }
  }

  @media (max-width: 768px) {
    margin: 0 10px;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  border-top: 1px solid #444;
  padding-top: 20px;

  @media (max-width: 768px) {
    padding-top: 15px;
  }
`;

const BottomText = styled.p`
  margin: 0;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`;
