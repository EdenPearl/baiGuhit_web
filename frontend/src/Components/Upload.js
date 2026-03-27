import React from 'react';
import styled from 'styled-components';
import { FaUpload } from 'react-icons/fa';
import useFileSelection from '../Hooks/UploadHooks/useFileSelection';
import useTransliteration from '../Hooks/UploadHooks/useTransliteration';

const Upload = () => {
  const { selectedImage, imageFile, handleFileSelect } = useFileSelection();
  const { result, transliterate } = useTransliteration(imageFile);

  return (
    <UploadContainer>
      <BoxContainer>
        <BoxWrapper>
          <Box>
            {selectedImage ? (
              <Image src={selectedImage} alt="Selected" />
            ) : (
              <UploadIcon />
            )}
          </Box>
          <FileInput type="file" onChange={handleFileSelect} id="fileInput" />
          <Button onClick={() => document.getElementById('fileInput').click()}>
            Choose a file
          </Button>
        </BoxWrapper>
        <BoxWrapper>
          <Box>
            <h2>{result}</h2>
          </Box>
          <Button onClick={transliterate}>
            Transliterate
          </Button>
        </BoxWrapper>
      </BoxContainer>
    </UploadContainer>
  );
};

export default Upload;
const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3f0, #ffe7e0);
  padding: 40px;
  font-family: 'Poppins', sans-serif;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 40px;
  width: 100%;
  max-width: 1000px;
`;

const BoxWrapper = styled.div`
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Box = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 2px solid #a52a2a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  color: #a52a2a;
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
  text-align: center;

  &:hover {
    transform: scale(1.02);
  }

  h2 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: bold;
    color: #a52a2a;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.03);
  }
`;

const UploadIcon = styled(FaUpload)`
  font-size: 5rem;
  color: #a52a2a;
`;

const Button = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(to right, #a52a2a, #e06d52);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;

  &:hover {
    background: #8b0000;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FileInput = styled.input`
  display: none;
`;
