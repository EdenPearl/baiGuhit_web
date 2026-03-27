import { useState } from 'react';

const useToggleRegister = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return {
    isModalOpen,
    toggleModal,
  };
};

export default useToggleRegister;
