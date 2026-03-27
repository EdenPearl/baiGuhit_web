import React from 'react';
import styled from 'styled-components';
import useVideoStream from '../Hooks/LiveCamHooks/useVideoStream';
import useImageCapture from '../Hooks/LiveCamHooks/useImageCapture';

const Livecam = () => {
  const videoRef = useVideoStream();
  const result = useImageCapture(videoRef);

  return (
    <Wrapper>
    <Container>
      <TopDiv>
        <Video ref={videoRef} autoPlay playsInline />
      </TopDiv>
      <Label>Transliterate</Label>
      <BottomDiv>
        <BottomContent>{result || 'Waiting...'}</BottomContent>
      </BottomDiv>
    </Container>
  </Wrapper>
  );
};

export default Livecam;
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #fff4e6, #ffe0d1, #fdd5cb);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  padding: 40px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Poppins', sans-serif;
`;


const TopDiv = styled.div`
  width: 100%;
  max-width: 320px;
  height: 240px;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #A52A2A;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Label = styled.div`
  margin: 30px 0 20px;
  padding: 10px 25px;
  background: linear-gradient(135deg, #a52a2a, #e7915b);
  background-size: 200% auto;
  color: #fff;
  font-weight: bold;
  font-size: 1.25rem;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(165, 42, 42, 0.4);
  animation: shine 3s ease-in-out infinite;

  @keyframes shine {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

const BottomDiv = styled.div`
  width: 100%;
  max-width: 500px;
  height: 200px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid #A52A2A;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const BottomContent = styled.div`
  font-size: 2.5rem;
  color: #333;
  font-weight: bold;
  text-align: center;
  padding: 0 20px;
  word-wrap: break-word;
`;
