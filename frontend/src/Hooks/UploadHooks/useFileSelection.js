import { useState } from 'react';

const useFileSelection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImageFile(file);
    }
  };

  return {
    selectedImage,
    imageFile,
    handleFileSelect,
  };
};

export default useFileSelection;
