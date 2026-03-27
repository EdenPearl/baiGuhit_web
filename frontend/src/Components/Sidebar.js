import React, { useState } from 'react';
import styled from 'styled-components';
import { IoStorefrontOutline, IoLanguageOutline, IoChatbubblesOutline } from "react-icons/io5";
import { MdQuestionAnswer, MdOutlineShoppingCart } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { FaGamepad, FaPuzzlePiece, FaTrophy } from "react-icons/fa";
import useLogout from '../Hooks/LogoutHook/useLogout';
import logo1 from '../Assests/logo1.jpg';

const Sidebar = ({ onSelect }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const logout = useLogout();

  const handleLogout = () => {
    setModalOpen(true);
  };

  const confirmLogout = () => {
    setModalOpen(false);
    logout();
  };

  const handleNavClick = (item) => {
    setSelectedItem(item);
    onSelect(item);
  };

  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoCircle>
          <LogoImage src={logo1} alt="Logo" />
        </LogoCircle>
        <LogoText>eBaybayMo</LogoText>
      </LogoContainer>
      
      <NavItems>
        <NavItem 
          onClick={() => handleNavClick('Home')}
          isSelected={selectedItem === 'Home'}
        >
          <IoStorefrontOutline className="icon" />
          Shop
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('ChatRoom')}
          isSelected={selectedItem === 'ChatRoom'}
        >
          <IoChatbubblesOutline className="icon" /> Chat
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('Order')}
          isSelected={selectedItem === 'Order'}
        >
          <MdOutlineShoppingCart className="icon" /> Order List
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('Transliterate')}
          isSelected={selectedItem === 'Transliterate'}
        >
          <IoLanguageOutline className="icon" /> Transliterate
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('Survey')}
          isSelected={selectedItem === 'Survey'}
        >
          <MdQuestionAnswer className="icon" /> Survey
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('Profile')}
          isSelected={selectedItem === 'Profile'}
        >
          <FaUser className="icon" /> Profile
        </NavItem>
        <NavItem 
          onClick={() => handleNavClick('Games')}
          isSelected={selectedItem === 'Games'}
        >
          <FaGamepad className="icon" /> Games
        </NavItem>
      </NavItems>

      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>

      {isModalOpen && (
        <ConfirmationModal 
          isOpen={isModalOpen} 
          onRequestClose={() => setModalOpen(false)} 
          onConfirm={confirmLogout} 
          message="Are you sure you want to logout?"
        />
      )}
    </SidebarContainer>
  );
};

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalMessage>{message}</ModalMessage>
        <ModalButtons>
          <ModalButton onClick={onConfirm} primary>Yes</ModalButton>
          <ModalButton onClick={onRequestClose}>No</ModalButton>
        </ModalButtons>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Sidebar;

const SidebarContainer = styled.div`
  height: 100vh;
  width: 200px;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  justify-content: space-between;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  border-bottom: 4px solid #ffffff;
  padding-bottom: 15px;
`;

const LogoCircle = styled.div`
  border: 2px solid #ffffff;
  border-radius: 100%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImage = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 100%;
  object-fit: contain;
`;

const LogoText = styled.h1`
  padding -right: 10px;
  font-family: 'Poppins';
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-grow: 1;
  margin-top: 50px;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: calc(100% - 10px);
  padding: 12px 15px 12px 25px;
  margin-left: 0;
  margin-right: auto;
  margin-bottom: 10px;
  font-family: 'Poppins';
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  background-color: ${props => (props.isSelected ? '#ffffff' : 'transparent')};
  color: ${props => (props.isSelected ? '#A52A2A' : '#ffffff')};
  transition: background-color 0.3s, color 0.3s, width 0.3s;

  &:hover {
    background-color: #ffffff;
    color: #A52A2A;
  }

  .icon {
    margin-right: 10px;
    font-size: 1.5rem;
  }
`;

const LogoutButton = styled.button`
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 10px;
  font-family: 'Poppins';
  font-size: 1rem;
  color: #ffffff;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 30px;
  border: 2px solid #ffffff;
  border-radius: 8px;

  &:hover {
    background-color: #ffffff;
    color: #A52A2A;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -75%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0.1) 100%
    );
    transform: skewX(-20deg);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -75%;
    }
    100% {
      left: 125%;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* Higher than Translate's z-index of 1000 */
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const ModalMessage = styled.p`
  font-family: 'Poppins';
  font-size: 1rem;
  margin-bottom: 20px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Poppins';
  background-color: ${props => (props.primary ? '#A52A2A' : '#ccc')};
  color: ${props => (props.primary ? '#fff' : '#000')};

  &:hover {
    background-color: ${props => (props.primary ? '#8B1B1B' : '#bbb')};
  }
`;