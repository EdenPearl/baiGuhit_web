import React from 'react';
import styled from 'styled-components';

const OrderPlaced = ({ onClose }) => { // Replace navigation with onClose prop
  return (
    <Container>
      <Content>
        <CheckCircle>
          <CheckMark>✔</CheckMark>
        </CheckCircle>
        <Title>Thank You!</Title>
        <Message>Your order has been successfully placed. We will contact you shortly.</Message>
      </Content>
    
    </Container>
  );
};

// Styled components remain mostly unchanged, but adjust for floating behavior
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f4f6f9;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 400px; // Fixed width for floating
  max-width: 90vw; // Responsive width
`;


const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #A52A2A;
  margin: 10px 0;
`;

const Message = styled.p`
  font-size: 18px;
  color: #333;
  margin: 10px 0;
`;

const CheckCircle = styled.div`
  background-color: #A52A2A;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`; 

const CheckMark = styled.span`
  font-size: 36px;
  color: white;
`;

export default OrderPlaced;