import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';

const PricingSection = () => {
  return (
    <PricingContainer>
      <PricingTitle>Pricing</PricingTitle>
      <PricingCards>
        <Card highlighted>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardPrice>₱0/month</CardPrice>
          </CardHeader>
          <CardFeatureList>
            <CardFeature>
              <FaCheckCircle /> Individual Character Recognition
            </CardFeature>
          </CardFeatureList>
          <ButtonContainer>
            <CardButton disabled>Current Plan</CardButton>
          </ButtonContainer>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardPrice>₱289/month</CardPrice>
          </CardHeader>
          <CardFeatureList>
            <CardFeature>
              <FaCheckCircle /> Complete Word Recognition
            </CardFeature>
          </CardFeatureList>
          <ButtonContainer>
            <CardButton>Get Premium</CardButton>
          </ButtonContainer>
        </Card>
      </PricingCards>
    </PricingContainer>
  );
};

export default PricingSection;

const PricingContainer = styled.section`
  padding: 1rem;
  text-align: center;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const PricingTitle = styled.h2`
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  color: #a52a2a;
  margin-bottom: 3rem;
`;

const PricingCards = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
`;

const Card = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  width: 600px; /* Increased from 400px */
  height: 700px; /* Increased from 500px */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, box-shadow 0.3s;
  margin: 1.5rem; /* Increased margin for spacing */
  ${({ highlighted }) =>
    highlighted &&
    `
    border: 2px solid #8b1b1b;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  `}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 350px;
    height: 450px;
  }
`;

const CardHeader = styled.div`
  font-family: 'Poppins', sans-serif;
  background-color: #a52a2a;
  color: white;
  padding: 1.5rem; /* Increased from 1rem */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CardTitle = styled.h2`
  font-size: 2rem; /* Increased from 1.5rem */
  font-weight: 300;
  margin: 0;
`;

const CardPrice = styled.h3`
  font-size: 1.4rem; /* Increased from 1rem */
  margin: 0;
`;

const CardFeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1.5rem 0; /* Increased margin for spacing */
  flex-grow: 1;
`;

const CardFeature = styled.li`
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem; /* Increased from 1rem */
  color: #000000;
  margin-bottom: 1.5rem; /* Increased from 1rem */
  display: flex;
  align-items: center;
  svg {
    margin-right: 0.75rem; /* Increased from 0.5rem */
    color: #8b1b1b;
    font-size: 1.4rem; /* Added to scale icon */
  }
`;

const ButtonContainer = styled.div`
  padding: 1.5rem; /* Increased from 1rem */
`;

const CardButton = styled.button`
  width: 100%;
  padding: 1rem; /* Increased from 0.75rem */
  background-color: #8b1b1b;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem; /* Increased from 1rem */
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #a52a2a;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;