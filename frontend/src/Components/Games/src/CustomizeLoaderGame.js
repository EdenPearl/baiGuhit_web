import React from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from '../../../Assests/logo1.png'; 

const Loader = () => {
    return (
        <LoaderOverlay>
            <LogoContainer>
                <LogoImage src={Logo} alt="Loading..." />
                <Spinner />
            </LogoContainer>
        </LoaderOverlay>
    );
};

export default Loader;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoaderOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7); 
    z-index: 2000; 
`;

const LogoContainer = styled.div`
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff;
    border-radius: 50%; 
`;

const LogoImage = styled.img`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
`;

const Spinner = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 5px solid transparent;
    border-top: 5px solid #d4a64a;
    border-right: 5px solid #f1d07e;
    border-radius: 50%;
    animation: ${spin} 2s linear infinite;
`;
