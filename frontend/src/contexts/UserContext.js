// UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('loginData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData)); // Store data from localStorage if available
    }
  }, []);

  const login = (data) => {
    setUserData(data); // Set user data in the context
    localStorage.setItem('loginData', JSON.stringify(data)); // Save login data to localStorage
  };

  const logout = () => {
    setUserData(null); // Clear user data when logging out
    localStorage.removeItem('loginData');
    localStorage.removeItem('sessionId');
  };

  return (
    <UserContext.Provider value={{ userData, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Add export for useUser hook
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};

export { UserContext, UserProvider };
