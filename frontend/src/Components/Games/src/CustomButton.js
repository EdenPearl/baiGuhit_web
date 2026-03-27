import React from "react";
import styled from "styled-components";

const CustomButton = ({ label, onClick, width = "200px", color = "#f4a01f", shadowColor = "#3b230d", disabled = false }) => {
  return (
    <ButtonWrapper $shadowColor={shadowColor}>
      <MainButton
        $width={width}
        $color={color}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </MainButton>
    </ButtonWrapper>
  );
};

export default CustomButton;

/* ---------------- STYLES ---------------- */

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: ${({ $width }) => $width || "200px"};
`;

const MainButton = styled.button`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff3e7;
  background-color: ${({ $color }) => $color};
  border: none;
  border-radius: 40px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform 0.2s ease, filter 0.2s ease;
  box-shadow: 6px 6px 0 ${({ $color, $shadowColor }) => $shadowColor || "#3b230d"};

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
    filter: ${({ disabled }) => (disabled ? "none" : "brightness(1.1)")};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 4px 4px 0 ${({ $shadowColor }) => $shadowColor || "#3b230d"};
  }
`;
