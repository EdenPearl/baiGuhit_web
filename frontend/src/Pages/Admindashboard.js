import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar"; // Updated to AdminSidebar
import AdminDashboard from "../Components/AdminDashboard";
import AdminChat from "../Components/AdminChat";

import UserManagement from "../Components/UserManagement";

import OrderManagement from "../Components/OrderManagement";
import ProductManagement from "../Components/ProductManagement";

const Dashboard = () => {
  const [selectedContent, setSelectedContent] = useState("AdminDashboard");

  const navigate = useNavigate();
  const location = useLocation();

  
  const renderContent = () => {
    switch (selectedContent) {
      case "AdminDashboard":
        return <AdminDashboard />;
      case "AdminChat":
        return <AdminChat />;
      
      case "UserManagement":
        return <UserManagement />;
      case "OrderManagement":
        return <OrderManagement />;
      case "ProductManagement":
        return <ProductManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <DashboardContainer>
      <AdminSidebar onSelect={setSelectedContent} /> {/* Updated to AdminSidebar */}
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