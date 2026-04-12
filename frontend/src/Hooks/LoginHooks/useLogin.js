// useLogin.js
import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const useLogin = (mode = 'marketplace') => {  // 👈 add mode parameter
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!validateEmail(email)) {
    setError('Please enter a valid email address.');
    return;
  }

  setLoading(true);

    try {
      const response = await axios.post(
        '/auth/login',
        { email, password }
      );

      if (response.data.sessionId) {
        const loginData = {
          id: response.data.userId,            // ✅ user ID
          username: response.data.username || '',      // ✅ user username (make sure route returns it)
          email: email,
          role: email === 'admin3@gmail.com' ? 'admin' : 'user',
          sessionId: response.data.sessionId,
        };

        // Save to context
        login(loginData);

        // Save to localStorage
        localStorage.setItem('sessionId', response.data.sessionId);
        localStorage.setItem('loginData', JSON.stringify(loginData));

        // Redirect logic
        if (mode === 'game') {
          navigate('/HomeGame');
        } else if (email === 'admin3@gmail.com') {
          navigate('/AdminDashboard');
        } else {
          navigate('/Dashboard');
        }

      } else {
        setError('Login failed, please try again.');
      }

    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleLogin,
  };
};

export default useLogin;
