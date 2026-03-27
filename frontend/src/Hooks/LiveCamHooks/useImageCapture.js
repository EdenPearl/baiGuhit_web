import { useState, useEffect } from 'react';
import axios from 'axios';

const useImageCapture = (videoRef) => {
  const [result, setResult] = useState('');

  useEffect(() => {
    const captureInterval = setInterval(() => {
      captureImage();
    }, 5000);

    return () => {
      clearInterval(captureInterval);
    };
  }, [videoRef]);

  const captureImage = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video stream not ready for capturing');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }

        const formData = new FormData();
        formData.append('baybayin_photo', blob, 'captured.png');

        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          console.error('No session ID found in localStorage');
          setResult('Session ID is required');
          return;
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'session-id': sessionId,
          },
        };

        try {
          const response = await axios.post('https://ebaybaymo-server-b084d082cda7.herokuapp.com/images/check_image', formData, config);
          const modifiedResult = appendA(response.data);
          setResult(modifiedResult);
        } catch (error) {
          console.error('Error uploading the image:', error);
          setResult('Error');
        }
      },
      'image/png',
      1
    );
  };

  const appendA = (responseData) => {
    const charactersToAppendA = ['B', 'K', 'D', 'G', 'H', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'T', 'W', 'Y'];
    if (charactersToAppendA.includes(responseData)) {
      return responseData + 'a';
    }
    return responseData;
  };

  return result;
};

export default useImageCapture;
