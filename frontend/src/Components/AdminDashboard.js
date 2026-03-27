import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch, FaEye } from 'react-icons/fa';
import getImageUrl from '../Utils/getImageUrl';
import Loader from './CustomizeLoader'; // Assuming this is a styled spinner component
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif; /* Modern font */
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  min-height: 100vh;
  border-radius: 12px;
  overflow-y: auto;
  color: #fff; /* High contrast text */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const WaveEmoji = styled.span`
  display: inline-block;
  animation: wave 2s infinite;
  transform-origin: 70% 70%;
  font-size: 2rem;

  @keyframes wave {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
    60% { transform: rotate(0deg); }
    100% { transform: rotate(0deg); }
  }
`;

const Banner = styled.div`
  background: rgba(255, 255, 255, 0.95); /* Semi-transparent for contrast */
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BannerTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: #aa270d; /* Gradient start */
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const BannerText = styled.div`
  color: #333;
  font-size: 1rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

const MetricTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.p`
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: #aa270d; /* Gradient start */

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const FlexSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const SectionWrapper = styled.div`
  flex: 2 1 600px;
  min-width: 300px;
`;

const ActiveUsersWrapper = styled.div`
  flex: 1 1 300px;
  min-width: 250px;
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 600;
  border-left: 4px solid #e7915b; /* Gradient end */
  padding-left: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 300px;

  svg {
    color: #aa270d;
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 1rem;
  width: 100%;
  background: transparent;
  color: #333;
`;

const TableContainer = styled.div`
  max-height: 400px;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    min-width: 80px;
  }

  th {
    background: #aa270d; /* Gradient start */
    color: #fff;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    color: #333;
  }

  @media (max-width: 768px) {
    th,
    td {
      padding: 0.5rem;
      min-width: 60px;
    }
  }
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: rgba(231, 145, 91, 0.1); /* Gradient end tint */
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status?.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }};
  color: #fff;
`;

const OrderImage = styled.img`
  max-width: 50px;
  max-height: 50px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #e7915b; /* Gradient end */
  color: #fff;

  &:hover {
    background: #d47a48; /* Darker shade */
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #e7915b; /* Gradient end */
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #d47a48;
    text-decoration: underline;
  }
`;

const ButtonWrapper = styled.div`
  text-align: right;
  margin-top: 1rem;
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  color: #aa270d;
  border-radius: 12px;
  text-align: center;
  margin: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NoData = styled.p`
  text-align: center;
  color: #333;
  font-size: 1.1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    activeUsers: [],
    metrics: { totalSales: 0, pendingOrders: 0 },
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const ordersTableRef = useRef(null);
  const usersTableRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      const userId = 0;
      try {
        const response = await fetch(url_t + `order/orders/admin?user_id=${userId}`, {
          headers: { 'Accept': 'application/json' },
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Expected JSON, got ${contentType || 'unknown content type'}`);
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }

        const orders = result.data.orders || [];
        const imagePromises = orders.map(async (order) => {
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

        setDashboardData({
          orders,
          activeUsers: result.data.activeUsers || [],
          metrics: result.data.metrics || { totalSales: 0, pendingOrders: 0 },
        });
        setFilteredOrders(orders);
        setFilteredUsers(result.data.activeUsers || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    const filtered = dashboardData.orders.filter(
      (order) =>
        order.NAME?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.id.toString().includes(orderSearch) ||
        order.product_id.toString().includes(orderSearch)
    );
    setFilteredOrders(filtered);
    setVisibleOrders(5); // Reset visible orders when search changes
  }, [orderSearch, dashboardData.orders]);

  // Filter users based on search term
  useEffect(() => {
    const filtered = dashboardData.activeUsers.filter(
      (user) => user.user_id.toString().includes(userSearch)
    );
    setFilteredUsers(filtered);
    setVisibleUsers(5); // Reset visible users when search changes
  }, [userSearch, dashboardData.activeUsers]);

  const handleSeeMoreOrders = () => {
    setVisibleOrders((prev) => {
      const newVisibleOrders = prev + 5;
      if (ordersTableRef.current) {
        ordersTableRef.current.scrollTo({
          top: ordersTableRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
      return newVisibleOrders;
    });
  };

  const handleSeeMoreUsers = () => {
    setVisibleUsers((prev) => {
      const newVisibleUsers = prev + 5;
      if (usersTableRef.current) {
        usersTableRef.current.scrollTo({
          top: usersTableRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
      return newVisibleUsers;
    });
  };

  const handleOrderClick = (orderId) => {
    console.log(`View order details for ID: ${orderId}`);
    // Implement navigation or modal for order details
  };

  const handleUserClick = (userId) => {
    console.log(`View user details for ID: ${userId}`);
    // Implement navigation or modal for user details
  };

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return <ErrorContainer>Error: {error}</ErrorContainer>;
  }

  return (
    <Container>
      <Header>
        Admin Dashboard <WaveEmoji>👋</WaveEmoji>
      </Header>

      <Banner>
        <BannerTitle>Welcome to Your Dashboard!</BannerTitle>
        <BannerText>
          Monitor your sales, track pending orders, and manage active users efficiently.
        </BannerText>
      </Banner>

      <MetricsContainer>
        <MetricCard>
          <MetricTitle>Total Sales</MetricTitle>
          <MetricValue>₱{dashboardData.metrics.totalSales.toFixed(2)}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Pending Orders</MetricTitle>
          <MetricValue>{dashboardData.metrics.pendingOrders}</MetricValue>
        </MetricCard>
      </MetricsContainer>

      <FlexSection>
        <SectionWrapper>
          <SectionTitle>Orders ({filteredOrders.length})</SectionTitle>
          <SearchBar>
            <FaSearch aria-hidden="true" />
            <SearchInput
              type="text"
              placeholder="Search by order ID, product ID, or name..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              aria-label="Search orders"
            />
          </SearchBar>
          {filteredOrders.length === 0 ? (
            <NoData>No orders found.</NoData>
          ) : (
            <>
              <TableContainer ref={ordersTableRef}>
                <Table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product ID</th>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Total Amount</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Estimated Date</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, visibleOrders).map((order) => (
                      <TableRow key={order.id} onClick={() => handleOrderClick(order.id)} tabIndex={0} role="button" aria-label={`View order ${order.id}`}>
                        <td>{order.id}</td>
                        <td>{order.product_id}</td>
                        <td>{order.user_id}</td>
                        <td>{order.NAME}</td>
                        <td>{order.contact_number}</td>
                        <td>₱{order.total_amount.toFixed(2)}</td>
                        <td>{order.quantity}</td>
                        <td><StatusBadge status={order.STATUS}>{order.STATUS}</StatusBadge></td>
                        <td>
                          {order.estimated_date
                            ? new Date(order.estimated_date).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          {imageUrls[order.product_id] && imageUrls[order.product_id] !== 'default-image-url.jpg' ? (
                            <OrderImage src={imageUrls[order.product_id]} alt={`Product ${order.product_id}`} />
                          ) : (
                            'No Image'
                          )}
                        </td>
                        <td>
                          <ActionButton onClick={(e) => { e.stopPropagation(); handleOrderClick(order.id); }} aria-label={`View order ${order.id}`}>
                            <FaEye /> View
                          </ActionButton>
                        </td>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
              {visibleOrders < filteredOrders.length && (
                <ButtonWrapper>
                  <SeeMoreButton onClick={handleSeeMoreOrders}>See More</SeeMoreButton>
                </ButtonWrapper>
              )}
            </>
          )}
        </SectionWrapper>

        <ActiveUsersWrapper>
          <SectionTitle>Active Users ({filteredUsers.length})</SectionTitle>
          <SearchBar>
            <FaSearch aria-hidden="true" />
            <SearchInput
              type="text"
              placeholder="Search by user ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              aria-label="Search users"
            />
          </SearchBar>
          {filteredUsers.length === 0 ? (
            <NoData>No active users found.</NoData>
          ) : (
            <>
              <TableContainer ref={usersTableRef}>
                <Table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Order Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, visibleUsers).map((user) => (
                      <TableRow key={user.user_id} onClick={() => handleUserClick(user.user_id)} tabIndex={0} role="button" aria-label={`View user ${user.user_id}`}>
                        <td>{user.user_id}</td>
                        <td>{user.order_count}</td>
                        <td>
                          <ActionButton onClick={(e) => { e.stopPropagation(); handleUserClick(user.user_id); }} aria-label={`View user ${user.user_id}`}>
                            <FaEye /> View
                          </ActionButton>
                        </td>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
              {visibleUsers < filteredUsers.length && (
                <ButtonWrapper>
                  <SeeMoreButton onClick={handleSeeMoreUsers}>See More</SeeMoreButton>
                </ButtonWrapper>
              )}
            </>
          )}
        </ActiveUsersWrapper>
      </FlexSection>
    </Container>
  );
};

export default AdminDashboard;