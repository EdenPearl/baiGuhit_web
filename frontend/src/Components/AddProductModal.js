import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const holidays = [
  'Valentine\'s Day',
  'Christmas Day',
  'New Year',
  'Chinese New Year',
];

const AddProductModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    mainImage: null,
    extraImages: [null, null, null, null],
    name: '',
    description: '',
    quantity: '',
    price: '',
    discount: '',
    selectedHoliday: '',
  });

  const [showHolidayDropdown, setShowHolidayDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHolidayDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        mainImage: file,
      }));
    }
  };

  const handleExtraImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...formData.extraImages];
      updatedImages[index] = file;
      setFormData((prev) => ({
        ...prev,
        extraImages: updatedImages,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHolidaySelect = (holiday) => {
    setFormData((prev) => ({
      ...prev,
      selectedHoliday: holiday,
    }));
    setShowHolidayDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Math.floor(Math.random() * 100000).toString(),
      ...formData,
      unitPrice: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      discount: parseFloat(formData.discount),
      value: parseFloat(formData.price) * parseInt(formData.quantity, 10),
    };
    onSubmit(newProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <Container>
        <Header>
          <Title>Add New Product</Title>
          <CloseButton onClick={onClose}>✖</CloseButton>
        </Header>

        <Content onSubmit={handleSubmit}>
          <TopSection>
            <FormSection>
              <SectionTitle>General Information</SectionTitle>

              <Section>
                <Label>Product Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Section>

              <Section>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Section>

              <SectionTitle>Pricing and Stock</SectionTitle>
              <FlexRow>
                <Section style={{ flex: 1 }}>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </Section>

                <Section style={{ flex: 1 }}>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </Section>
              </FlexRow>

              <Section>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                />
              </Section>
            </FormSection>

            <ImageUploadSection>
              <SectionTitle>Product Images</SectionTitle>
              <MainImageWrapper>
                {formData.mainImage ? (
                  <img
                    src={URL.createObjectURL(formData.mainImage)}
                    alt="Main"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                ) : (
                  <Placeholder>+</Placeholder>
                )}
                <HiddenInput type="file" id="main-image" accept="image/*" onChange={handleMainImageChange} />
                <ImageLabel htmlFor="main-image" />
              </MainImageWrapper>

              <SmallImagesWrapper>
                {formData.extraImages.map((img, index) => (
                  <SmallImageBox key={index}>
                    {img ? (
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Extra ${index + 1}`}
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                    ) : (
                      <SmallPlaceholder>+</SmallPlaceholder>
                    )}
                    <HiddenInput type="file" id={`extra-image-${index}`} accept="image/*" onChange={(e) => handleExtraImageChange(index, e)} />
                    <ImageLabel htmlFor={`extra-image-${index}`} />
                  </SmallImageBox>
                ))}
              </SmallImagesWrapper>

              <SectionTitle style={{ marginTop: '20px' }}>Product Category</SectionTitle>

              <HolidaySelectWrapper ref={dropdownRef}>
                <HolidayInput
                  type="text"
                  readOnly
                  value={formData.selectedHoliday}
                  placeholder="Select Holiday"
                />
                <HolidayButton type="button" onClick={() => setShowHolidayDropdown(!showHolidayDropdown)}>
                  ▼
                </HolidayButton>

                {showHolidayDropdown && (
                  <Dropdown>
                    {holidays.map((holiday, idx) => (
                      <DropdownItem key={idx} onClick={() => handleHolidaySelect(holiday)}>
                        {holiday}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
              </HolidaySelectWrapper>
            </ImageUploadSection>
          </TopSection>

          <ButtonRow>
            <DraftButton type="button" onClick={onClose}>Save Draft</DraftButton>
            <AddButton type="submit">Add Product</AddButton>
          </ButtonRow>
        </Content>
      </Container>
    </Overlay>
  );
};

export default AddProductModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Container = styled.div`
  background: #fff;
  width: 90%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  font-family: 'Poppins', sans-serif;

  /* Firefox */
  scrollbar-width: none;

  /* WebKit (Chrome, Safari) */
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const Header = styled.div`
  background: #f8f8f8;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Content = styled.form`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TopSection = styled.div`
  display: flex;
  gap: 30px;
`;

const FormSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 10px;
  color: #333;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;

  &:focus {
    border-color: #A52A2A;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  resize: none;

  &:focus {
    border-color: #A52A2A;
    outline: none;
  }
`;

const ImageUploadSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MainImageWrapper = styled.div`
  width: 250px;
  height: 250px;
  background: #eee;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SmallImagesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
`;

const SmallImageBox = styled.div`
  width: 55px;
  height: 55px;
  background: #eee;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  font-size: 3rem;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SmallPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  font-size: 2rem;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImageLabel = styled.label`
  position: absolute;
  inset: 0;
  cursor: pointer;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const DraftButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #A52A2A;
  background: white;
  color: #A52A2A;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #e8f5e9;
  }
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background: #A52A2A;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #A52A2A;
  }
`;

const HolidaySelectWrapper = styled.div`
  position: relative;
  display: flex;
  margin-top: 10px;
`;

const HolidayInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px 0 0 10px;
  font-size: 1rem;
  background: #fafafa;
`;

const HolidayButton = styled.button`
  padding: 0 20px;
  background: #A52A2A;
  color: white;
  border: none;
  border-radius: 0 10px 10px 0;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 110%;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 5px 15px rgba(0,0,0,0.1);
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`;
