import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
    >
      <ModalContent>
        <Message>{message}</Message>
        <ButtonContainer>
          <Button  className='cancel' onClick={onRequestClose}>Cancel</Button>
          <Button className='confirm' onClick={onConfirm}>Confirm</Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Message = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  .cancel {
    background-color: #dc3545;
  
    &:hover {
      background-color: #dc3545;
        }
    }
    .confirm {
        background-color: #000099;

    &:hover {
     background-color: #0056b3;
    }
  }
`;

const Button = styled.button`
  font-family: 'Poppins', sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  color: white;
  font-size: 12px;
`;

export default ConfirmationModal;
