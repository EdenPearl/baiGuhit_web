import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import getImageUrl from '../Utils/getImageUrl';
import Product from '../models/Product';
import Loader from './CustomizeLoader';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [productForm, setProductForm] = useState({
    id: null,
    product_name: '',
    price: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false, type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const BASE_API_URL = 'https://ebaybaymo-server-b084d082cda7.herokuapp.com';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('Please log in to manage products.');
          return;
        }
        const response = await axios.get(`${BASE_API_URL}/auth/user_profile`, {
          headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId,
          },
        });
        if (response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('userId', response.data.user.id.toString());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to authenticate user');
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_API_URL}/product/products`);
        const productData = response.data.data || response.data || [];
        if (!Array.isArray(productData)) {
          throw new Error('Expected an array of products');
        }
        const productList = await Promise.all(
          productData.map(async (item) => {
            const imageUrl = await getImageUrl(item.id);
            return new Product(
              item.id,
              item.product_name,
              item.price,
              item.description,
              null,
              imageUrl,
              'Generic Brand',
              item.transdate // Added transdate
            );
          })
        );
        setProducts(productList);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
        showNotification('Failed to fetch products', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchProducts();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, visible: true, type });
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: 'success' });
    }, 3000);
  };

  const resetForm = () => {
    setProductForm({ id: null, product_name: '', price: '', description: '', image: null });
    setImagePreview(null);
    setIsEditing(false);
    setShowPanel(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price' && value < 0) return; // Prevent negative prices
    setProductForm({ ...productForm, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductForm({ ...productForm, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      showNotification('Please log in to perform this action.', 'error');
      return;
    }

    if (!productForm.product_name.trim()) {
      showNotification('Product name is required.', 'error');
      return;
    }

    if (productForm.price <= 0) {
      showNotification('Price must be greater than 0.', 'error');
      return;
    }

    if (!productForm.description.trim()) {
      showNotification('Description is required.', 'error');
      return;
    }

    if (!isEditing && !productForm.image) {
      showNotification('Please upload an image for new products.', 'error');
      return;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('No session ID found');
      showNotification('No session ID found', 'error');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('product_name', productForm.product_name);
    formData.append('price', productForm.price);
    formData.append('description', productForm.description);
    if (isEditing) {
      formData.append('id', productForm.id);
    }
    if (productForm.image) {
      formData.append('image', productForm.image);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'session-id': sessionId,
        },
      };
      let newProduct;

      if (isEditing) {
        await axios.put(`${BASE_API_URL}/product/product_update`, formData, config);
        showNotification('Product updated successfully');
        newProduct = new Product(
          productForm.id,
          productForm.product_name,
          parseFloat(productForm.price),
          productForm.description,
          null,
          productForm.image ? URL.createObjectURL(productForm.image) : products.find(p => p.id === productForm.id)?.imageUrl,
          'Generic Brand',
          products.find(p => p.id === productForm.id)?.transdate
        );
        setProducts(products.map(p => (p.id === newProduct.id ? newProduct : p)));
      } else {
        const response = await axios.post(`${BASE_API_URL}/product/product_insert`, formData, config);
        showNotification('Product added successfully');
        const imageUrl = await getImageUrl(response.data.id); // Assuming API returns product ID
        newProduct = new Product(
          response.data.id,
          productForm.product_name,
          parseFloat(productForm.price),
          productForm.description,
          null,
          imageUrl,
          'Generic Brand',
          new Date().toISOString()
        );
        setProducts([...products, newProduct]);
      }

      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
      showNotification(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setProductForm({
      id: product.id,
      product_name: product.productName,
      price: product.price,
      description: product.description,
      image: null,
    });
    setImagePreview(product.imageUrl);
    setIsEditing(true);
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    if (!user) {
      showNotification('Please log in to perform this action.', 'error');
      return;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('No session ID found');
      showNotification('No session ID found', 'error');
      return;
    }

    try {
      await axios.delete(`${BASE_API_URL}/product/product_delete`, {
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        data: { id },
      });
      showNotification('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      showNotification(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (isEditing && !showPanel) {
      resetForm();
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return <Container>Please log in to manage products.</Container>;
  if (loading) return <Container><Loader /></Container>;
  if (error) return <Container>Error: {error}</Container>;

  return (
    <Container>
      <HeaderWrapper>
        <Title>Product Management</Title>
      </HeaderWrapper>
      <AddProductWrapper>
        <ShopIcon />
        <AddProductText>Add New Product</AddProductText>
        <TopButton onClick={togglePanel}>Open Form</TopButton>
        <Input
          type="text"
          placeholder="Search Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '200px', marginLeft: 'auto' }}
          aria-label="Search Products"
        />
      </AddProductWrapper>

      <ArrowButton
        onClick={togglePanel}
        aria-label={showPanel ? 'Close form panel' : 'Open form panel'}
      >
        {showPanel ? '←' : '→'}
      </ArrowButton>
      <SlidePanel show={showPanel} aria-hidden={!showPanel}>
        <FormWrapper>
          <FormSection $type="left">
            <ContentWrapper>
              <SectionTitle>{isEditing ? 'Edit Product' : 'Add Product'}</SectionTitle>
              <ImageUpload>
                <UploadLabel>Product Image</UploadLabel>
                <UploadBox>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                  ) : (
                    <Plus>+</Plus>
                  )}
                  <input type="file" name="image" onChange={handleImageChange} accept="image/*" aria-label="Upload Product Image" />
                </UploadBox>
              </ImageUpload>
            </ContentWrapper>
          </FormSection>
          <FormSection>
            <ContentWrapper>
              <Form onSubmit={handleSubmit}>
                <Input
                  type="text"
                  name="product_name"
                  value={productForm.product_name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  required
                  aria-label="Product Name"
                />
                <Input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  required
                  aria-label="Product Price"
                />
                <TextArea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  required
                  aria-label="Product Description"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : isEditing ? 'Update Product' : 'Add Product'}
                </Button>
                {isEditing && (
                  <Button type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </Form>
            </ContentWrapper>
          </FormSection>
        </FormWrapper>
      </SlidePanel>

      {notification.visible && (
        <Notification $type={notification.type}>
          {notification.message}
        </Notification>
      )}

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Description</th>
              <th scope="col">Image</th>
              <th scope="col">Transaction Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7">No products found.</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.productName}</td>
                  <td>₱{product.price.toFixed(2)}</td>
                  <td>{product.description}</td>
                  <td>
                    {product.imageUrl && product.imageUrl !== 'default-image-url.jpg' ? (
                      <ProductImage src={product.imageUrl} alt={product.productName} />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td>{product.transdate ? new Date(product.transdate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Button onClick={() => handleEdit(product)}>Edit</Button>
                    <Button onClick={() => handleDelete(product.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 1rem 3rem 2rem 3rem;
  font-family: 'Poppins', sans-serif;
  background-color: transparent;
  box-sizing: border-box;
  min-height: 100vh;
  border-radius: 10px;
  position: relative;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0 3rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const AddProductWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 3rem;
  margin-bottom: 1rem;
`;

const AddProductText = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-transform: uppercase;
`;

const ShopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" fill="none" />
    <path d="M7 9h10l-1 8H8l-1-8z" stroke="#333" strokeWidth="2" fill="none" />
    <circle cx="12" cy="14" r="1" fill="#333" />
    <text x="11" y="16" fontSize="12" fill="#333" textAnchor="middle">+</text>
  </svg>
);

const TopButton = styled.button`
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #d0d0d0;
  }
`;

const ArrowButton = styled.button`
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  border: none;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  padding: 1rem;
  font-size: 1.5rem;
  z-index: 1100;
  cursor: pointer;
`;

const SlidePanel = styled.div`
  position: fixed;
  top: 0;
  right: ${({ show }) => (show ? '0' : '-100%')};
  width: 90%;
  max-width: 1000px;
  height: 100vh;
  background: white;
  padding: 0.5rem 2rem 2rem 2rem;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.2);
  transition: right 0.5s ease-in-out, transform 0.5s ease-in-out;
  transform: ${({ show }) => (show ? 'translateX(0) rotateY(0deg)' : 'translateX(0) rotateY(90deg)')};
  transform-origin: right center;
  z-index: 1050;
  overflow-y: auto;

  @keyframes rollIn {
    0% {
      right: -100%;
      transform: translateX(0) rotateY(-90deg);
    }
    100% {
      right: 0;
      transform: translateX(0) rotateY(0deg);
    }
  }

  @keyframes rollOut {
    0% {
      right: 0;
      transform: translateX(0) rotateY(0deg);
    }
    100% {
      right: -100%;
      transform: translateX(0) rotateY(90deg);
    }
  }

  animation: ${({ show }) => (show ? 'rollIn 0.5s ease-in-out forwards' : 'rollOut 0.5s ease-in-out forwards')};
`;

const FormWrapper = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-top: 1rem;
`;

const FormSection = styled.div`
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  width: ${({ $type }) => ($type === 'left' ? '320px' : '100%')};
  max-width: ${({ $type }) => ($type === 'left' ? '320px' : '600px')};
`;

const ContentWrapper = styled.div`
  padding: 1.5rem;
`;

const ImageUpload = styled.div`
  display: flex;
  flex-direction: column;
`;

const UploadLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const UploadBox = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #ccc;
  height: 300px;
  width: 100%;
  border-radius: 16px;
  background: #f5f5f5;
  cursor: pointer;
  input {
    display: none;
  }
`;

const Plus = styled.span`
  font-size: 2rem;
  color: #666;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0;
  margin-left: 1rem;
  text-transform: uppercase;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
  font-size: 1rem;
  color: #333;
  &::placeholder {
    color: #999;
    text-transform: uppercase;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  color: #333;
  &::placeholder {
    color: #999;
    text-transform: uppercase;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: linear-gradient(90deg, rgb(150, 35, 12), rgb(211, 125, 71));
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
    vertical-align: top;
  }

  th {
    background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
    color: white;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  td:last-child {
    display: flex;
    gap: 0.5rem;
  }
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
`;

const Notification = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ $type }) => ($type === 'success' ? '#28a745' : '#dc3545')};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1200;
  animation: fadeInOut 3s ease-in-out forwards;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    10% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
  }
`;

export default ProductManagement;