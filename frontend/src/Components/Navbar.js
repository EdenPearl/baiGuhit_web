import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import LoginModal from './Login';

const Navbar = ({ scrollToSection, refs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Listen to scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <NavbarContainer isScrolled={isScrolled}>
      <Logo>eBaybayMo</Logo>
      <NavLinks>
        <NavLink onClick={() => scrollToSection(refs.heroRef)}>Home</NavLink>
        <NavLink onClick={() => scrollToSection(refs.pricingRef)}>Pricing</NavLink>
        <NavLink onClick={() => scrollToSection(refs.researchRef)}>Research</NavLink>
        <NavLink onClick={() => scrollToSection(refs.aboutRef)}>About</NavLink>
        <ButtonContainer>
          <LoginButton onClick={toggleModal}>Login</LoginButton>
        </ButtonContainer>
      </NavLinks>
      <LoginModal isOpen={isModalOpen} toggleModal={toggleModal} />
    </NavbarContainer>
  );
};

export default Navbar;

// Styled Components
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const NavbarContainer = styled.nav`
  display: flex;
  position: fixed;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  top: 0;
  left: 0;
  color: #fff;
  font-family: 'Poppins';
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  transition: background 0.5s ease, box-shadow 0.5s ease;

  background: ${props =>
    props.isScrolled
      ? 'rgba(204, 70, 12, 0.85)'
      : 'linear-gradient(135deg, #cc460c, #e66524)'};

  background-size: 300% 300%;
  animation: ${props =>
    props.isScrolled
      ? 'none'
      : css`${gradientAnimation} 10s ease infinite`};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
`;
const Logo = styled.div`
  padding: 1rem;
  margin-left: 2rem;
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 800;
  font-style: italic;
  text-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const NavLinks = styled.div`
  padding: 1rem;
  margin-right: 2rem;
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    width: 100%;
    background-color: #C2410C;
  }
`;

const NavLink = styled.div`
  cursor: pointer;
  color: #ffffff;
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-left: 40px;
  align-items: center;
`;

const LoginButton = styled.button`
  background-color: #ffffff;
  color: #C2410C;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Poppins';
  font-weight: 600;
  width: 100px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f3f3f3;
    transform: scale(1.05);
    box-shadow: 0 3px 6px rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;
