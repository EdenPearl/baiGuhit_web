import { useState } from 'react';

const usePasswordToggle = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return {
    showPassword,
    togglePasswordVisibility,
  };
};

export default usePasswordToggle;
