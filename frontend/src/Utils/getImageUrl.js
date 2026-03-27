import axios from 'axios';

const getImageUrl = async (id) => {
  try {
    // Use localStorage instead of AsyncStorage
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `https://ebaybaymo-server-b084d082cda7.herokuapp.com/product/product_image/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer', // Fetch binary data
      }
    );

    // Convert ArrayBuffer to Base64
    const buffer = new Uint8Array(response.data);
    const binary = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
    const base64Image = `data:image/jpeg;base64,${btoa(binary)}`;

    return base64Image;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null; // Return null if the fetch fails
  }
};

export default getImageUrl;