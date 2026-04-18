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
    background: rgba(43, 16, 4, 0.55);
    z-index: 2000; 
`;

const LogoContainer = styled.div`
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgba(253, 230, 138, 0.95) 0%, rgba(251, 196, 23, 0.88) 52%, rgba(245, 158, 11, 0.74) 100%);
    border-radius: 50%; 
    box-shadow: 0 0 0 4px rgba(251, 196, 23, 0.14), 0 10px 24px rgba(0, 0, 0, 0.24);
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
    border: 5px solid rgba(255, 246, 235, 0.16);
    border-top: 5px solid #fbc417;
    border-right: 5px solid #f59e0b;
    border-bottom: 5px solid rgba(194, 64, 16, 0.45);
    border-left: 5px solid rgba(255, 246, 235, 0.16);
    border-radius: 50%;
    animation: ${spin} 2s linear infinite;
`;
