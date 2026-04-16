import { useState } from 'react';
import axios from 'axios';

const REGISTER_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000/auth/register'
    : 'https://ebaybaymo-server-b084d082cda7.herokuapp.com/auth/register';

const useRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    try {
      const response = await axios.post(REGISTER_URL, {
        email,
        password,
      });
      setSuccess('Registered Successfully');
      console.log('Registration successful:', response.data);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    setError,
    setSuccess,
    showPassword,
    setShowPassword,
    handleSubmit,
  };
};

export default useRegister;
