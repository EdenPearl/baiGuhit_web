import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './CustomizeLoader';
import { FaShoppingCart } from 'react-icons/fa';
import Cart from '../Components/Cart'; // Ensure this points to your Cart component

const OrderList = () => {
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('No session ID found.');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://ebaybaymo-server-b084d082cda7.herokuapp.com/auth/user_profile', {
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
        const response = await axios.get(
          `https://ebaybaymo-server-b084d082cda7.herokuapp.com/order/order_list?user_id=${userId}`,
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

  const handleViewClick = (orderId) => {
    setActiveOrder(orderId === activeOrder ? null : orderId);
  };

  const handleNavClick = () => {
    setShowCart((prev) => !prev);
  };

  const filteredOrders = orders.filter((order) =>
    order.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer showCart={showCart}>
      <MainContent showCart={showCart}>
        <TopBar>
          <SearchBar
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <RightSection>
            <CartButton onClick={handleNavClick} aria-label="Toggle Cart">
              <FaShoppingCart />
            </CartButton>
            <ProfileImage src="https://via.placeholder.com/32" alt="Profile" />
          </RightSection>
        </TopBar>

        <Banner>
          <BannerText>
            <h1>View Your Orders</h1>
            <p>
              Monitor your purchases and stay updated on delivery statuses. Celebrate Filipino heritage with every order!
            </p>
          </BannerText>
        </Banner>

        <Main>
          {loading ? (
            <Loader />
          ) : error ? (
            <Error>{error}</Error>
          ) : filteredOrders.length === 0 ? (
            <EmptyState>
              <EmptyIllustration src="https://via.placeholder.com/150" alt="No orders" />
              <EmptyText>No orders found. Start shopping now!</EmptyText>
              <ActionButton onClick={() => navigate('/market')}>
                Shop Now
              </ActionButton>
            </EmptyState>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderWrapper key={order.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <OrderCard active={activeOrder === order.id}>
                  <OrderInfo>
                    <div>
                      <OrderText><strong>Order Id:</strong> #{order.id}</OrderText>
                    </div>
                    <ButtonContainer>
                      <ViewButton onClick={() => handleViewClick(order.id)}>
                        {activeOrder === order.id ? "Close" : "View Your Order"}
                      </ViewButton>
                    </ButtonContainer>
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
                          <span>Total Amount</span>
                          <p>₱{(order.total_amount || 0).toFixed(2)}</p>
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
                    <h2>Order Details</h2>
                    <DetailItem>
                      <DetailLabel>Name:</DetailLabel>
                      <DetailValue>{order.name || 'N/A'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Contact Number:</DetailLabel>
                      <DetailValue>{order.contact_number || 'N/A'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Status:</DetailLabel>
                      <DetailValue>{order.status || 'Ready for Delivery'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Estimated Delivery:</DetailLabel>
                      <DetailValue>
                        {order.estimated_date
                          ? new Date(order.estimated_date).toISOString().split('T')[0]
                          : 'N/A'}
                      </DetailValue>
                    </DetailItem>
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
      </MainContent>

      <CartContainer showCart={showCart}>
        {showCart && <Cart closeCart={() => setShowCart(false)} userId={userId} />}
      </CartContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  font-family: 'Poppins', sans-serif;
  width: 100%;
  height: 100vh;
  gap: ${({ showCart }) => (showCart ? '1rem' : '0')}; /* Maintain gap when cart is visible */
  overflow: hidden; /* Prevent page-level overflow */
`;

const MainContent = styled.div`
  flex: ${({ showCart }) => (showCart ? '0 0 66%' : '1')};
  padding: 1.5rem;
  background: linear-gradient(180deg, #fff, #f8f8f8);
  transition: flex 0.3s ease;
  height: 100%; /* Use full available height */
  overflow-y: ${({ showCart }) => (showCart ? 'hidden' : 'auto')}; /* Disable scrolling when cart is open */

  @media (max-width: 768px) {
    flex: ${({ showCart }) => (showCart ? '0 0 100%' : '1')};
    ${({ showCart }) => showCart && 'display: none;'} /* Hide MainContent on mobile when cart is open */
  }
`;

const CartContainer = styled.div`
  flex: ${({ showCart }) => (showCart ? '0 0 30%' : '0')};
  height: 99%;
  background: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Ensure cart remains scrollable */
  transition: flex 0.3s ease, width 0.3s ease;
  visibility: ${({ showCart }) => (showCart ? 'visible' : 'hidden')};
  width: ${({ showCart }) => (showCart ? '30%' : '0')};
  border-radius: ${({ showCart }) => (showCart ? '20px' : '0')};
  animation: ${({ showCart }) => (showCart ? 'slideIn 0.3s ease' : 'none')};

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @media (max-width: 768px) {
    width: ${({ showCart }) => (showCart ? '100%' : '0')};
    flex: ${({ showCart }) => (showCart ? '0 0 100%' : '0')};
    position: ${({ showCart }) => (showCart ? 'fixed' : 'relative')};
    top: 0;
    right: 0;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const SearchBar = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 300px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    width: 200px;
    font-size: 14px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const CartButton = styled.button`
  background: linear-gradient(90deg, rgb(233, 236, 16), rgb(207, 94, 49));
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-size: 1.5rem;
  transition: transform 0.2s ease;

  &:hover {
    background: linear-gradient(90deg, rgb(200, 200, 14), rgb(180, 82, 43));
    transform: scale(1.1);
  }

  &::after {
    content: 'Toggle Cart';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const Banner = styled.div`
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  border-radius: 20px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const BannerText = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }
    p {
      font-size: 1rem;
    }
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 1rem;
  overflow-y: auto; /* Allow internal scrolling if content overflows */
  height: calc(100% - 120px); /* Adjust based on TopBar and Banner heights */
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
`;

const EmptyIllustration = styled.img`
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  margin-top: 1rem;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: glimmerEffect 2s infinite;
  }

  @keyframes glimmerEffect {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const OrderWrapper = styled.div`
  display: flex;
  transition: all 0.4s ease;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease forwards;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const OrderCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  transform: ${({ active }) => (active ? 'translateX(-20%)' : 'translateX(0)')};
  transition: all 0.4s ease;

  @media (max-width: 768px) {
    transform: none;
  }
`;

const TrackingPanel = styled.div`
  width: 300px;
  background: #f8f8f8;
  margin-left: 1rem;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.4s ease forwards;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  h2 {
    margin-top: 0;
    color: #333;
    font-size: 1.2rem;
  }

  p {
    font-size: 0.95rem;
    color: #666;
    margin-top: 0.8rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
`;

const DetailLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
`;

const OrderInfo = styled.div`
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderText = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.95rem;
`;

const ViewButton = styled.button`
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: glimmerEffect 2s infinite;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const ProductList = styled.div`
  padding: 1rem 1.5rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const ProductDetails = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const ProductTitle = styled.h2`
  font-size: 1.1rem;
  margin: 0;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProductSub = styled.div`
  color: #666;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const SmallText = styled.div`
  color: #999;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  min-width: 360px;
  padding-left: 2rem;
  gap: 2rem;

  @media (max-width: 768px) {
    min-width: 200px;
    padding-left: 1rem;
    gap: 1rem;
  }
`;

const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;

  span {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #007bff;
  }

  @media (max-width: 768px) {
    min-width: 80px;
    span {
      font-size: 0.7rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  background: #f8f8f8;
  align-items: center;
`;

const PaymentDetails = styled.div`
  text-align: right;
  color: #666;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const TotalPrice = styled.div`
  color: #007bff;
  font-weight: bold;
  margin-top: 0.3rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Error = styled.div`
  color: #721c24;
  background: #f8d7da;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin: 2rem 0;
`;

export default OrderList;