import { useState } from 'react';
import axios from 'axios';

const useTransliteration = (imageFile) => {
  const [result, setResult] = useState('');

  const transliterate = async () => {
    if (!imageFile) {
      console.error('No image selected for transliteration');
      setResult('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('baybayin_photo', imageFile, 'selected.png');

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
  };

  const appendA = (responseData) => {
    const charactersToAppendA = ['B', 'K', 'D', 'G', 'H', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'T', 'W', 'Y'];
    if (charactersToAppendA.includes(responseData)) {
      return responseData + 'a';
    }
    return responseData;
  };

  return {
    result,
    transliterate,
  };
};

export default useTransliteration;
