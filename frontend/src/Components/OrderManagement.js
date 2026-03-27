import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import getImageUrl from '../Utils/getImageUrl';
import { FaSearch, FaBell, FaSpinner } from 'react-icons/fa';

const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [messageInput, setMessageInput] = useState({});
  const lastOrderRef = useRef(null);

  const validStatuses = [
    'Pending',
    'Order is packed',
    'Order is ready to pick-up',
    'Order completed',
    'Order cancelled',
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('Please log in to manage orders.');
          return;
        }
        const response = await axios.get(
         url_t + 'auth/user_profile',
          {
            headers: {
              'Content-Type': 'application/json',
              'session-id': sessionId,
            },
          }
        );
        if (response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('userId', response.data.user.id.toString());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to authenticate user');
      }
    };

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const response = await axios.get(
         url_t + 'order/orders/admin?user_id=0',
          {
            headers: {
              'Accept': 'application/json',
              'session-id': sessionId,
            },
          }
        );

        if (!response.data || response.data.error) {
          throw new Error(response.data?.message || 'Failed to fetch orders');
        }

        const orders = response.data.data?.orders || [];
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);

        const imagePromises = sortedOrders.map(async (order) => {
          try {
            const imageUrl = await getImageUrl(order.product_id);
            return { productId: order.product_id, imageUrl };
          } catch (err) {
            console.error(`Error fetching image for product ${order.product_id}:`, err);
            return { productId: order.product_id, imageUrl: 'default-image-url.jpg' };
          }
        });

        const images = await Promise.all(imagePromises);
        const imageMap = images.reduce((acc, { productId, imageUrl }) => ({
          ...acc,
          [productId]: imageUrl,
        }), {});
        setImageUrls(imageMap);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (lastOrderRef.current) {
      lastOrderRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [filteredOrders]);

  const filterOrders = (term, tab) => {
    let filtered = orders;

    if (tab !== 'All') {
      filtered = orders.filter((order) => order.STATUS === tab);
    }

    if (term) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(term) ||
          order.product_id.toString().includes(term) ||
          order.user_id.toString().includes(term) ||
          order.NAME.toLowerCase().includes(term) ||
          order.contact_number.toLowerCase().includes(term) ||
          order.STATUS.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterOrders(term, activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterOrders(searchTerm, tab);
  };

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!user) {
      showNotification('Please log in to perform this action.');
      return;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('No session ID found');
      return;
    }

    try {
      const response = await axios.put(
        url_t +'order/order_update',
        { order_id: orderId, status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to update order status');
      }

      showNotification('Order status updated successfully');

      const refreshResponse = await axios.get(
        url_t +'order/orders/admin?user_id=0',
        {
          headers: {
            'Accept': 'application/json',
            'session-id': sessionId,
          },
        }
      );

      const orders = refreshResponse.data.data?.orders || [];
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
      setOrders(sortedOrders);
      filterOrders(searchTerm, activeTab);

      const imagePromises = sortedOrders.map(async (order) => {
        try {
          const imageUrl = await getImageUrl(order.product_id);
          return { productId: order.product_id, imageUrl };
        } catch (err) {
          console.error(`Error fetching image for product ${order.product_id}:`, err);
          return { productId: order.product_id, imageUrl: 'default-image-url.jpg' };
        }
      });

      const images = await Promise.all(imagePromises);
      const imageMap = images.reduce((acc, { productId, imageUrl }) => ({
        ...acc,
        [productId]: imageUrl,
      }), {});
      setImageUrls(imageMap);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleSendNotification = async (orderId, targetUserId) => {
    if (!user) {
      showNotification('Please log in to send notifications.');
      return;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('No session ID found');
      return;
    }

    const message = messageInput[orderId];
    if (!message) {
      showNotification('Please enter a message to send.');
      return;
    }

    try {
      const response = await axios.post(
        url_t +'chat/notifications',
        {
          room_name: `order_${orderId}`,
          user_id: user.id,
          target_user_id: targetUserId,
          message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId,
          },
        }
      );

      if (response.data.success) {
        showNotification('Notification sent successfully');
        setMessageInput((prev) => ({ ...prev, [orderId]: '' }));
      } else {
        throw new Error(response.data.message || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      showNotification(err.response?.data?.message || 'Failed to send notification');
    }
  };

  if (!user) return <Container>Please log in to manage orders.</Container>;
  if (loading) return (
    <Container>
      <LoadingSpinner>
        <FaSpinner className="spinner" />
        Loading...
      </LoadingSpinner>
    </Container>
  );
  if (error) return <ErrorContainer>Error: {error}</ErrorContainer>;

  return (
    <Container>
      <Header>
        <h1>Order Management</h1>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by Order ID, Product ID, User ID, Name, Contact, or Status"
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search orders"
          />
        </SearchContainer>
      </Header>
      {notification.visible && (
        <Notification>
          <FaBell /> {notification.message}
        </Notification>
      )}
      <TabContainer>
        <TabButton
          active={activeTab === 'All'}
          onClick={() => handleTabChange('All')}
          aria-selected={activeTab === 'All'}
        >
          All
        </TabButton>
        {validStatuses.map((status) => (
          <TabButton
            key={status}
            active={activeTab === status}
            onClick={() => handleTabChange(status)}
            aria-selected={activeTab === status}
          >
            {status}
          </TabButton>
        ))}
      </TabContainer>
      {filteredOrders.length === 0 ? (
        <NoOrders>No orders found.</NoOrders>
      ) : (
        <OrderGrid>
          {filteredOrders.map((order, index) => (
            <OrderCard
              key={order.order_id}
              ref={index === filteredOrders.length - 1 ? lastOrderRef : null}
            >
              <OrderImage
                src={imageUrls[order.product_id] !== 'default-image-url.jpg' ? imageUrls[order.product_id] : '/placeholder.png'}
                alt={order.product_name}
              />
              <OrderDetails>
                <OrderInfo>
                  <strong>Order ID:</strong> {order.id}
                </OrderInfo>
                <OrderInfo>
                  <strong>Product ID:</strong> {order.product_id}
                </OrderInfo>
                <OrderInfo>
                  <strong>User ID:</strong> {order.user_id}
                </OrderInfo>
                <OrderInfo>
                  <strong>Name:</strong> {order.NAME}
                </OrderInfo>
                <OrderInfo>
                  <strong>Contact:</strong> {order.contact_number}
                </OrderInfo>
                <OrderInfo>
                  <strong>Total Amount:</strong> ₱{(order.total_amount || 0).toFixed(2)}
                </OrderInfo>
                <OrderInfo>
                  <strong>Quantity:</strong> {order.quantity}
                </OrderInfo>
                <OrderInfo>
                  <strong>Status:</strong> {order.STATUS}
                </OrderInfo>
                <OrderInfo>
                  <strong>Estimated Date:</strong> 
                  {order.estimated_date
                    ? new Date(order.estimated_date).toLocaleDateString()
                    : 'N/A'}
                </OrderInfo>
              </OrderDetails>
              <OrderActions>
                <Select
                  value={order.STATUS}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  aria-label={`Update status for order ${order.id}`}
                >
                  {validStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <NotificationSection>
                  <NotificationInput
                    type="text"
                    placeholder="Enter notification message"
                    value={messageInput[order.id] || ''}
                    onChange={(e) =>
                      setMessageInput((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    aria-label={`Notification message for order ${order.id}`}
                  />
                  <NotifyButton
                    onClick={() => handleSendNotification(order.id, order.user_id)}
                    aria-label={`Send notification for order ${order.id}`}
                  >
                    <FaBell /> Send
                  </NotifyButton>
                </NotificationSection>
              </OrderActions>
            </OrderCard>
          ))}
        </OrderGrid>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91)); /* Applied new gradient */
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
 coals
  position: sticky;
  top: 0;
  z-index: 10;

  h1 {
    font-size: 1.8rem;
    color: #1a202c;
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #6b7280;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #aa270d; /* Adjusted to match gradient */
    box-shadow: 0 0 0 3px rgba(170, 39, 13, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 1rem 0;
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  background: ${(props) => (props.active ? 'linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91))' : '#f1f5f9')};
  color: ${(props) => (props.active ? '#fff' : '#1a202c')};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.active ? 'linear-gradient(90deg, rgb(150, 35, 12), rgb(211, 125, 71))' : '#e2e8f0')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(170, 39, 13, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const OrderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const OrderCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
`;

const OrderImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid #e2e8f0;
`;

const OrderDetails = styled.div`
  padding: 1rem;
`;

const OrderInfo = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #1a202c;

  strong {
    color: #4b5563;
    margin-right: 0.5rem;
  }
`;

const OrderActions = styled.div`
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
  }

  &:focus {
    outline: none;
    border-color: #aa270d;
    box-shadow: 0 0 0 3px rgba(170, 39, 13, 0.1);
  }
`;

const NotificationSection = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NotificationInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #aa270d;
    box-shadow: 0 0 0 3px rgba(170, 39, 13, 0.1);
  }
`;

const NotifyButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 35, 12), rgb(211, 125, 71));
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(170, 39, 13, 0.3);
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: #fff; /* Changed to white for contrast on gradient background */

  .spinner {
    font-size: 2rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
`;

const NoOrders = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #fff; /* Changed to white for contrast on gradient background */
  margin: 2rem 0;
`;

export default OrderManagement;