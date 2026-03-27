import axios from 'axios';

const getImageUrl = async (id) => {
  try {
    const token = localStorage.getItem('token');  
    const response = await axios.get(`https://ebaybaymo-server-b084d082cda7.herokuapp.com/product/product_image/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,  
      },
      responseType: 'blob',  
    });

    const imageUrl = URL.createObjectURL(response.data);
    console.log('Image fetched successfully:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error during image fetch:', error);
    return null;
  }
};

export default getImageUrl;
