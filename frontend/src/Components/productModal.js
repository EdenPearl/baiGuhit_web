import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Loader from './CustomizeLoader';
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const ProductDetailModal = ({ product, onClose, onBuyNow, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Details');

  const reviewsArray = product.reviews ? product.reviews.split(' | ') : [];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('No session ID found.');
          setLoading(false);
          return;
        }

        const response = await axios.get(url_t +'auth/user_profile', {
          headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId,
          },
        });

        if (response.data && response.data.user && response.data.user.id) {
          setUserId(response.data.user.id);
        } else {
          setError('Failed to fetch user profile.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      const totalAmount = product.price * quantity;
      const response = await axios.post(url_t + 'cart/cart_insert', {
        user_id: userId,
        product_id: product.id,
        total_amount: totalAmount,
        quantity,
      });

      if (response.status === 200) {
        setShowSuccessMessage(true);
        onAddToCart(product, quantity);
        setTimeout(() => {
          setShowSuccessMessage(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.round(rating);
    const stars = [];

    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <Star key={i} filled={i < filledStars}>
          {i < filledStars ? '★' : '☆'}
        </Star>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <ModalOverlay>
        <Loader />
      </ModalOverlay>
    );
  }

  if (error) {
    return (
      <ModalOverlay>
        <ErrorText>{error}</ErrorText>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        {showSuccessMessage ? (
          <Content>
            <CheckCircle>
              <CheckMark>✔</CheckMark>
            </CheckCircle>
            <Message>Successfully Added to Cart</Message>
          </Content>
        ) : (
          <>
            <LeftSection>
              <MainImage src={product.imageUrl} alt={product.product_name || 'Product Image'} />
            </LeftSection>

            <RightSection>
              <CloseButton onClick={onClose}>×</CloseButton>
              <Title>{product.product_name}</Title>
              <Rating>{renderStars(product.average_rating)} ({product.average_rating?.toFixed(1)})</Rating>

              <Price>
                <CurrentPrice>₱{product.price?.toFixed(2)}</CurrentPrice>
              </Price>

              <Label>Quantity:</Label>
              <QuantityControls>
                <Button onClick={decrementQuantity}>-</Button>
                <Quantity>{quantity}</Quantity>
                <Button onClick={incrementQuantity}>+</Button>
              </QuantityControls>

              <Actions>
                <PrimaryButton onClick={handleAddToCart}>Add to Cart</PrimaryButton>
                <SecondaryButton onClick={handleBuyNow}>Buy Now</SecondaryButton>
              </Actions>

              <Tabs>
                {['Details', 'Reviews', 'Discussion'].map((tab) => (
                  <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </Tab>
                ))}
              </Tabs>

              <TabContent>
                {activeTab === 'Details' && <p>{product.description || 'No description available.'}</p>}
                {activeTab === 'Reviews' && (
                  reviewsArray.length ? (
                    <ul>{reviewsArray.map((review, idx) => <li key={idx}>{review}</li>)}</ul>
                  ) : (
                    <NoReviews>No reviews available.</NoReviews>
                  )
                )}
                {activeTab === 'Discussion' && <p>No discussions available.</p>}
              </TabContent>
            </RightSection>
          </>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components (fixed and improved)
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  max-width: 1100px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    max-height: 80vh;
    width: 90%;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const RightSection = styled.div`
  flex: 1;
  padding: 20px;
  position: relative;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
    padding: 10px;
  }
`;

const MainImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;

  @media (max-width: 768px) {
    max-height: 300px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #000;
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Title = styled.h2`
  font-size: 26px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const Rating = styled.div`
  color: #ffd700;
  font-size: 18px;
  margin: 10px 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Price = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
`;

const CurrentPrice = styled.div`
  font-size: 28px;
  color: #b12704;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Label = styled.div`
  font-weight: bold;
  margin: 15px 0 5px;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px;
  font-size: 18px;
  background: #ddd;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.2s;

  &:hover {
    background: #ccc;
  }

  @media (max-width: 768px) {
    padding: 6px;
    font-size: 16px;
  }
`;

const Quantity = styled.span`
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #ffa41c;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f08804;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #b12704;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #a02201;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const Tab = styled.div`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  border-bottom: ${({ active }) => (active ? '2px solid black' : 'none')};
  padding-bottom: 5px;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    color: #b12704;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TabContent = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #333;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const NoReviews = styled.p`
  color: gray;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Star = styled.span`
  color: ${({ filled }) => (filled ? '#ffd700' : '#ccc')};
  margin: 0 2px;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-weight: bold;
  font-size: 20px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  width: 100%;
`;

const Message = styled.p`
  font-size: 36px;
  color: #b12704;
  margin: 15px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const CheckCircle = styled.div`
  background-color: #b12704;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const CheckMark = styled.span`
  font-size: 48px;
  color: white;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export default ProductDetailModal;