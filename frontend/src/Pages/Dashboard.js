import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import AdminSidebar from '../Components/AdminSidebar'; // Import AdminSidebar
import Home from '../Components/Home1';
import Chat from '../Components/ChatRoom';
import Transliterate from '../Components/Translate';
import Survey from '../Components/Survey';
import Order from '../Components/Order';
import Profile from '../Components/Profile';
import Cart from '../Components/Cart';
// Admin components (placeholders, create these as needed)
import AdminDashboard from '../Components/AdminDashboard';
import ProductManagement from '../Components/ProductManagement';
import OrderManagement from '../Components/OrderManagement';
import UserManagement from '../Components/UserManagement';
import AdminChat from '../Components/AdminChat';


const Dashboard = () => {
  const [selectedContent, setSelectedContent] = useState('Home');
  const [userRole, setUserRole] = useState('user'); // Default to user
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          navigate('/login');
          return;
        }
        const response = await fetch(
          'http://localhost:8000/auth/user_profile',
          {
            headers: { 'session-id': sessionId },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role || 'user'); // Assume API returns role
          if (data.user.role === 'admin3' && selectedContent === 'Home') {
            setSelectedContent('AdminDashboard'); // Default to admin dashboard
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === '/Checkout') {
      setSelectedContent('Home');
    } else if (location.pathname === '/Cart') {
      setSelectedContent('Cart');
    }
  }, [location.pathname]);

  const renderContent = () => {
    if (userRole === 'admin3') {
      switch (selectedContent) {
        case 'AdminDashboard':
          return <AdminDashboard />;
        case 'ProductManagement':
          return <ProductManagement />;
        case 'OrderManagement':
          return <OrderManagement />;
        case 'UserManagement':
          return <UserManagement />;
        case 'AdminChat':
          return <AdminChat />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (selectedContent) {
        case 'Home':
          return <Home />;
        case 'ChatRoom':
          return <Chat />;
        case 'Order':
          return <Order />;
        case 'Transliterate':
          return <Transliterate />;
        case 'Survey':
          return <Survey />;
        case 'Profile':
          return <Profile />;
        case 'Cart':
          return <Cart />;
        default:
          return <Home />;
      }
    }
  };

  return (
    <DashboardContainer>
      {userRole === 'admin3' ? (
        <AdminSidebar onSelect={setSelectedContent} />
      ) : (
        <Sidebar onSelect={setSelectedContent} />
      )}
      <Content>{renderContent()}</Content>
    </DashboardContainer>
  );
};

export default Dashboard;

const DashboardContainer = styled.div`
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  height: 100vh;
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
`;