// OrderSummary.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronLeft } from 'react-icons/fa';

const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const OrderSummary = () => {
  const [name, setName] = useState('Juan Dela Cruz');
  const [phone, setPhone] = useState('09858544267');
  const [modalVisible, setModalVisible] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState(null);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [isMounted, setIsMounted] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
    const fetchUserData = async () => {
      if (!isMounted) return;
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          console.error('No session ID found');
          return;
        }

        const response = await fetch(url_t +
          'auth/user_profile',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'session-id': sessionId,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.user && isMounted) {
            setUser(result.user);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    return () => {
      setIsMounted(false);
    };
  }, [isMounted]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!isMounted) return;
      try {
        const storedData = localStorage.getItem('orderData');
        let parsedData;
        if (location.state?.orderData) {
          parsedData = location.state.orderData;
          localStorage.setItem('orderData', JSON.stringify(parsedData));
        } else if (storedData) {
          parsedData = JSON.parse(storedData);
        }
        if (parsedData && isMounted) {
          setOrderData(parsedData);
          setTotalPrice(parsedData.price * parsedData.quantity);
        } else {
          console.error('No order data found');
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      }
    };

    fetchOrderData();

    return () => {
      setIsMounted(false);
    };
  }, [isMounted, location.state]);

  useEffect(() => {
    if (!isMounted) return;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (isMounted) {
      setEstimatedDate(formattedDate);
    }

    return () => {
      setIsMounted(false);
    };
  }, [isMounted]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleEditPress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleConfirmOrder = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedEstimatedDate = tomorrow.toISOString().split('T')[0];

      const response = await fetch(url_t +'order/order_insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: orderData.product_id,
          total_amount: totalPrice,
          status: 'Pending',
          quantity: orderData.quantity,
          contact_number: phone,
          name: name,
          estimated_date: formattedEstimatedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to insert order');
      }

      const result = await response.json();
      console.log('Order inserted successfully, Order ID:', result.order_id);
      navigate('/order-complete');
    } catch (error) {
      console.error('Error confirming order:', error.message);
      alert('Failed to confirm order: ' + error.message);
    }
  };

  if (!isMounted || !orderData) return null;

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <FaChevronLeft size={24} color="#A52A2A" />
        </BackButton>
        <HeaderTitle>Order Summary</HeaderTitle>
      </Header>

      <ScrollContainer>
        <Section>
          <InfoHeader>
            <SectionTitle>Add Your Information</SectionTitle>
            <EditText onClick={handleEditPress}>Edit</EditText>
          </InfoHeader>
          <InputBox>
            <InfoText>{name}</InfoText>
            <InfoText>{phone}</InfoText>
          </InputBox>
        </Section>

        <ProductSection>
          <ProductDetailsRow>
            <ProductImage
              src={orderData.image || 'https://via.placeholder.com/100'}
              alt={orderData.product_name}
            />
            <ProductInfo>
              <ProductTitle>{orderData.product_name || 'Loading...'}</ProductTitle>
              <ProductPrice>₱{orderData.price.toFixed(0)}</ProductPrice>
            </ProductInfo>
          </ProductDetailsRow>
          <ProductQuantity>x{orderData.quantity}</ProductQuantity>
        </ProductSection>

        <PickupSection>
          <PickupText>
            Your order will be available for pickup on
            <BoldText> BISU-BILAR Campus</BoldText> at
            <BoldText> [COMSOC office]</BoldText> the day after purchase.
          </PickupText>
        </PickupSection>

        <DetailsSection>
          <EstimatedDateLabel>Estimated Date:</EstimatedDateLabel>
          <EstimatedDate>{estimatedDate}</EstimatedDate>
          <PaymentMethodLabel>Payment Method:</PaymentMethodLabel>
          <PaymentMethodText>
            Payment will be made in person upon pickup.
          </PaymentMethodText>
        </DetailsSection>

        <TotalAmountContainer>
          <Label>Total amount:</Label>
          <TotalAmount>₱{totalPrice.toFixed(0)}</TotalAmount>
        </TotalAmountContainer>
      </ScrollContainer>

      <Footer>
        <ConfirmButton onClick={handleConfirmOrder}>
          <ConfirmText>Confirm Order</ConfirmText>
        </ConfirmButton>
      </Footer>

      {modalVisible && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit Information</ModalTitle>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Phone Number"
            />
            <SaveButton onClick={handleSave}>Save</SaveButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styled Components for OrderSummary
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  width: 100%;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #a52a2a;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const ScrollContainer = styled.div`
  flex: 1;
  padding: 0 1rem 1rem;
`;

const Section = styled.div`
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
  padding: 1rem;
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
`;

const EditText = styled.span`
  color: #a52a2a;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const InputBox = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0.25rem 0;
`;

const ProductSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
`;

const ProductDetailsRow = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const ProductImage = styled.img`
  width: 140px;
  height: 140px;
  margin-right: 1rem;
  border-radius: 5px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
`;

const ProductPrice = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #a52a2a;
  margin: 1rem 0 0;
`;

const ProductQuantity = styled.p`
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
`;

const PickupSection = styled.div`
  margin: 0.5rem 0;
  text-align: center;
`;

const PickupText = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
`;

const BoldText = styled.span`
  font-weight: bold;
`;

const DetailsSection = styled.div`
  margin: 0.5rem 0;
`;

const EstimatedDateLabel = styled.p`
  font-size: 1rem;
  font-weight: bold;
  margin: 0.5rem 0 0.25rem;
`;

const EstimatedDate = styled.p`
  font-size: 1rem;
  color: #a52a2a;
  margin: 0 0 0.5rem;
`;

const PaymentMethodLabel = styled.p`
  font-size: 1rem;
  font-weight: bold;
  margin: 0.5rem 0 0.25rem;
`;

const PaymentMethodText = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem;
`;

const TotalAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
`;

const Label = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const TotalAmount = styled.p`
  font-size: 1.375rem;
  font-weight: bold;
  color: #a52a2a;
  margin: 0;
`;

const Footer = styled.div`
  background-color: #a52a2a;
  padding: 1rem;
  border-top: 1px solid #c0c0c0;
`;

const ConfirmButton = styled.button`
  background-color: white;
  border-radius: 10px;
  padding: 0.625rem 1.5rem;
  border: none;
  cursor: pointer;
  margin-left: auto;
  display: block;
  min-width: 150px;
`;

const ConfirmText = styled.span`
  font-size: 1rem;
  color: #a52a2a;
  font-weight: bold;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  width: 80%;
  max-width: 500px;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem;
  margin: 0.625rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const SaveButton = styled.button`
  background-color: #a52a2a;
  color: white;
  padding: 0.625rem;
  border-radius: 5px;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 0.625rem;
`;