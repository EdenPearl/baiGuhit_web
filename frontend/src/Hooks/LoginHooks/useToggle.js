import { useState } from 'react';

const useToggle = () => {
  const [showLogin, setShowLogin] = useState(true);

  const openSignUpModal = () => {
    setShowLogin(false);
  };

  const openLoginModal = () => {
    setShowLogin(true);
  };

  return {
    showLogin,
    openSignUpModal,
    openLoginModal,
  };
};

export default useToggle;
