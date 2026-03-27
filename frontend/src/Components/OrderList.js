import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

import Loader from './CustomizeLoader';

const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const OrderList = () => {
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null); // NEW STATE
  

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
          headers: { 'session-id': sessionId },
        });

        if (response.data?.user?.id) {
          setUserId(response.data.user.id);
        } else {
          setError('Failed to fetch user profile.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile.');
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(url_t +
          `order/order_list?user_id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.data) {
          const processedOrders = response.data.data.map(order => ({
            ...order,
            imageUrl: order.image ? `data:image/jpeg;base64,${order.image}` : '/default-image.jpg',
          }));
          setOrders(processedOrders);
        } else {
          setError('Failed to fetch orders.');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleTrackClick = (orderId) => {
    setActiveOrder(orderId === activeOrder ? null : orderId);
  };

  return (
    <Container>
      <Header>
        <h1>Track Your Order</h1>
        <p>Thanks for making a purchase. You can track your order below. Happy shopping!</p>
      </Header>

      <Main>
        {loading ? (
          <Loader />
        ) : error ? (
          <Error>{error}</Error>
        ) : (
          orders.map((order) => (
            <OrderWrapper key={order.id}>
              <OrderCard active={activeOrder === order.id}>
                <OrderInfo>
                  <div>
                    <OrderText><strong>Order Id:</strong> #{order.id}</OrderText>
                  </div>
                  <TrackButton onClick={() => handleTrackClick(order.id)}>
                    {activeOrder === order.id ? "Close" : "Track Your Order"}
                  </TrackButton>
                </OrderInfo>

                <ProductList>
                  <ProductItem>
                    <ProductImage src={order.imageUrl} alt={order.product_name} />
                    <ProductDetails>
                      <ProductTitle>{order.product_name}</ProductTitle>
                      <ProductSub>{order.brand_name || 'Dust Studios'}</ProductSub>
                      <SmallText>Size: Regular</SmallText>
                      <SmallText>Qty: {order.quantity || 1}</SmallText>
                    </ProductDetails>

                    <ProductMeta>
                      <MetaColumn>
                        <span>Price</span>
                        <p>₱{(order.total_amount || 0).toFixed(2)}</p>
                      </MetaColumn>
                      <MetaColumn>
                        <span>Status</span>
                        <StatusTag>{order.status || 'Ready for Delivery'}</StatusTag>
                      </MetaColumn>
                      <MetaColumn>
  <span>Estimated Delivery</span>
  <p>
    {order.created_at
      ? new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A'}
  </p>
</MetaColumn>

                    </ProductMeta>
                  </ProductItem>
                </ProductList>

                <OrderFooter>
                <PaymentDetails>
  {order.status?.toLowerCase() === 'order completed' && (
    <span>Order Paid</span>
  )}
  <TotalPrice>
    Total Price: <strong>₱{(order.total_amount || 0).toFixed(2)}</strong>
  </TotalPrice>
</PaymentDetails>
                </OrderFooter>
              </OrderCard>

              {activeOrder === order.id && (
  <TrackingPanel>
    <h2>Tracking Details</h2>
    {order.status === 'Order is packed' && (
      <>
        <p>Your package is out for delivery, be ready to pay ₱{(order.total_amount || 0).toFixed(2)} to receive parcel <strong>{order.product_name}</strong> pick-up in Bisu-Bilar.</p>
        <ActionButton>Contact Us</ActionButton>
      </>
    )}
    {order.status === 'Order completed' && (
      <>
        <p>Your package <strong>{order.product_name}</strong> was already picked-up.</p>
        <ButtonGroup>
          <ActionButton>Review</ActionButton>
          <ActionButton>Buy Again</ActionButton>
        </ButtonGroup>
      </>
    )}
    {order.status === 'Pending' && (
      <>
        <p>Your package is getting ready by the ebaybaymo team.</p>
        <ActionButton>Cancel Order</ActionButton>
      </>
    )}
    {order.status === 'Order Cancelled' && (
      <>
        <p>Your order <strong>{order.product_name}</strong> was successfully cancelled by the system.</p>
        <ActionButton>Buy Now</ActionButton>
      </>
    )}
  </TrackingPanel>
)}

            </OrderWrapper>
          ))
        )}
      </Main>
    </Container>
  );
};

export default OrderList;

// Styled components:

const Container = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  font-family: 'Inter', sans-serif;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    font-size: 1rem;
  }
`;

const Main = styled.main`
  max-width: 900px;
  margin: 0 auto;
`;

const ActionButton = styled.button`
  margin-top: 1rem;
  background: #A52A2A;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: 0.2s;

  &:hover {
    background: #4338ca;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  ${ActionButton} {
    flex: 1;
  }
`;

const OrderWrapper = styled.div`
  display: flex;
  transition: all 0.4s ease;
  margin-bottom: 2rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  flex: 1;
  transform: ${({ active }) => (active ? 'translateX(-20%)' : 'translateX(0)')};
  transition: all 0.4s ease;
`;

const TrackingPanel = styled.div`
  width: 300px;
  background:#fbeaea;
  margin-left: 1rem;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  animation: fadeIn 0.4s ease forwards;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  h2 {
    margin-top: 0;
    color:#000000
  }

  p {
    font-size: 0.95rem;
    color:#000000;
    margin-top: 0.8rem;
  }
`;

const OrderInfo = styled.div`
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderText = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
`;

const TrackButton = styled.button`
  background: #A52A2A;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background:  #7b1c1c;
  }
`;

const ProductList = styled.div`
  padding: 1rem 1.5rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding: 1rem 0;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
`;

const ProductDetails = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const ProductTitle = styled.h2`
  font-size: 1.1rem;
  margin: 0;
  color: #111827;
`;

const ProductSub = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

const SmallText = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  min-width: 360px;
  padding-left: 2rem;
  gap: 2rem;
`;



const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;

  span {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
`;

const StatusTag = styled.div`
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  display: inline-block;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  background: #f9fafb;
  align-items: center;
`;

const PaymentDetails = styled.div`
  text-align: right;
  color: #6b7280;
  font-size: 0.9rem;
`;

const TotalPrice = styled.div`
  color: #111827;
  font-weight: bold;
  margin-top: 0.3rem;
`;

const Error = styled.div`
  color: red;
  text-align: center;
  padding: 2rem;
`;
