import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo1 from '../Assests/logo1.jpg';
import CheckoutCart from './checkoutcart.js';
import Loader from './CustomizeLoader';

const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const deleteCartItem = async (cartId, retries = MAX_RETRIES) => {
  if (!cartId) {
    console.warn('Skipping deletion: cart_id is missing');
    return { success: false, message: 'Missing cart_id' };
  }

  const sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    console.error('No session ID found');
    throw new Error('No session ID found');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url_t +`cart/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'session-id': sessionId,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (response.ok) {
      console.log('Deleted:', data.message);
      return { success: true, message: data.message };
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`Error deleting cart item ${cartId} (Attempt ${MAX_RETRIES - retries + 1}):`, err);
    if (retries > 0 && err.name !== 'AbortError') {
      console.log(`Retrying deletion for cart item ${cartId}... (${retries} retries left)`);
      return deleteCartItem(cartId, retries - 1);
    }
    throw err;
  }
};

const Cart = ({ closeCart, userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://ebaybaymo-server-b084d082cda7.herokuapp.com';
  const CART_API = `${API_BASE_URL}/cart/cart_get`;
  const USER_PROFILE_API = `${API_BASE_URL}/auth/user_profile`;

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('No session ID found. Please log in.');
          setLoading(false);
          return;
        }
        const response = await fetch(USER_PROFILE_API, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'session-id': sessionId },
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const data = await response.json();
        console.log('User Profile API Response:', data); // Keep for debugging
        if (data.user?.id) {
          setUserName(data.user.username || 'User');
          localStorage.setItem('userId', data.user.id.toString());
        } else {
          throw new Error('User ID not found in response. Response: ' + JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, [USER_PROFILE_API]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await axios.get(`${CART_API}?user_id=${userId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (Array.isArray(response.data)) {
          const processedItems = response.data
            .sort((a, b) => new Date(b.transdate) - new Date(a.transdate))
            .map((item) => ({
              id: item.cart_id?.toString() || `${userId}-${item.product_id}`,
              product_id: item.product_id,
              product_name: item.product_name || 'Unnamed Product',
              description: item.description || 'No description available',
              price: parseFloat(item.price) || 0,
              total_amount: parseFloat(item.total_amount) || parseFloat(item.price) * (parseInt(item.quantity, 10) || 1),
              quantity: parseInt(item.quantity, 10) || 1,
              imageUrl: item.image || 'https://via.placeholder.com/150',
              transdate: item.transdate,
              selected: false,
            }));
          setCartItems(processedItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to fetch cart items.');
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [userId, CART_API]);

  const toggleSelectItem = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: newSelectAll })));
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selected
          ? { ...item, quantity: item.quantity + 1, total_amount: (item.quantity + 1) * item.price }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selected && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1, total_amount: (item.quantity - 1) * item.price }
          : item
      )
    );
  };

  const handleRemoveItem = async (cart_id) => {
    try {
      const result = await deleteCartItem(cart_id);
      if (result.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== cart_id));
        window.alert('Item removed from cart successfully!');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
      window.alert('Failed to remove item from cart: ' + err.message);
    }
  };

  const handleDeleteSelectedItems = async () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      window.alert('No Items Selected', 'Please select at least one item to delete.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      try {
        for (const item of selectedItems) {
          if (item.id) {
            const result = await deleteCartItem(item.id);
            if (!result.success) {
              throw new Error(result.message);
            }
          }
        }
        setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
        window.alert('Success', 'Selected items deleted successfully.');
      } catch (error) {
        console.error('Error deleting selected items:', error);
        window.alert('Error', 'Failed to delete some items: ' + error.message);
      }
    }
  };

  const handleCheckout = () => {
    const itemsToCheckout = cartItems
      .filter((item) => item.selected)
      .map(({ id, product_id, product_name, imageUrl, description, quantity, price }) => ({
        id: product_id,
        product_name,
        imageUrl,
        description,
        quantity,
        price,
      }));

    if (itemsToCheckout.length === 0) {
      window.alert('Please select at least one item to checkout.');
      return;
    }

    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const handleOrderPlaced = async () => {
    const selectedItemIds = cartItems.filter((item) => item.selected).map((item) => item.id);
    try {
      for (const cartId of selectedItemIds) {
        const result = await deleteCartItem(cartId);
        if (!result.success) {
          throw new Error(result.message);
        }
      }
      setCartItems((prev) => prev.filter((item) => !item.selected));
      setShowCheckout(false);
      navigate("/Order");
      window.location.reload(); // Move reload after navigate if needed
    } catch (error) {
      console.error('Error removing cart items after order:', error);
      window.alert('Failed to update cart after order: ' + error.message);
    }
  };

  const totalPrice = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.total_amount, 0)
    .toFixed(2);

  const getCartTitle = () => {
    if (!userName) return "Your Cart";
    const firstName = userName.split(' ')[0];
    if (firstName.endsWith('s') || firstName.endsWith('S')) {
      return `${firstName}' Cart`;
    }
    return `${firstName}, Your added Cart Items`;
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <Header>
        <Logo src={logo1} alt="Logo" onClick={() => navigate('/')} />
        <Title>{getCartTitle()}</Title>
        <CloseButton onClick={closeCart}>×</CloseButton>
      </Header>

      <FixedHeader>
        <Row header>
          <ColumnSelect>
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
          </ColumnSelect>
          <ColumnProduct>Cart</ColumnProduct>
          <ColumnPrice>Price</ColumnPrice>
          <ColumnQty>Qty</ColumnQty>
          <ColumnTotal>Total</ColumnTotal>
          <ColumnRemove />
        </Row>
      </FixedHeader>

      <ScrollableCartContent>
        {error === 'Failed to fetch cart items.' ? (
          <NoItemsMessage>There are no cart items.</NoItemsMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : cartItems.length === 0 ? (
          <NoItemsMessage>There are no cart items.</NoItemsMessage>
        ) : (
          cartItems.map((item) => (
            <Row key={item.id} selected={item.selected}>
              <ColumnSelect>
                <input type="checkbox" checked={item.selected} onChange={() => toggleSelectItem(item.id)} />
              </ColumnSelect>

              <ColumnProduct>
                <Image src={item.imageUrl} alt={item.product_name} />
                <div>
                  <Name>{item.product_name}</Name>
                  <Description>{item.description}</Description>
                </div>
              </ColumnProduct>

              <ColumnPrice>₱{item.price.toFixed(2)}</ColumnPrice>

              <ColumnQty>
                <Button onClick={() => decreaseQuantity(item.id)}>-</Button>
                <span>{item.quantity}</span>
                <Button onClick={() => increaseQuantity(item.id)}>+</Button>
              </ColumnQty>

              <ColumnTotal>₱{item.total_amount.toFixed(2)}</ColumnTotal>

              <ColumnRemove>
                <RemoveButton onClick={() => handleRemoveItem(item.id)}>×</RemoveButton>
              </ColumnRemove>
            </Row>
          ))
        )}
      </ScrollableCartContent>

      <CheckoutSection>
        <TotalPrice>Total: ₱{totalPrice}</TotalPrice>
        <ButtonGroup>
          <DeleteSelectedButton onClick={handleDeleteSelectedItems}>
            Delete Selected
          </DeleteSelectedButton>
          <CheckoutButton onClick={handleCheckout}>Checkout</CheckoutButton>
        </ButtonGroup>
      </CheckoutSection>

      {showCheckout && (
        <ModalOverlay>
          <CheckoutCart
            state={{
              cartItems: cartItems
                .filter((item) => item.selected)
                .map(({ id, product_id, product_name, imageUrl, description, quantity, price }) => ({
                  id: product_id,
                  product_name,
                  imageUrl,
                  description,
                  quantity,
                  price,
                })),
              totalPrice: parseFloat(totalPrice),
            }}
            onClose={handleCloseCheckout}
            onOrderPlaced={handleOrderPlaced}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(237, 221, 221);
  width: 100%;
  font-family: 'Poppins', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const Logo = styled.img`
  height: 40px;
  width: 40px;
  margin-right: 10px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 22px;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #ddd;
  }
`;

const FixedHeader = styled.div`
  background: rgba(193, 177, 177, 0.99);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 8px 20px;
  border-bottom: 2px solid #e0e0e0;
`;

const ScrollableCartContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: #ff5c5c #f0f0f0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ff5c5c;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) =>
    props.header
      ? '#f0f0f0'
      : props.selected
      ? '#ffe5e5'
      : '#ffffff'};
  padding: ${(props) => (props.header ? '12px 15px' : '16px 15px')};
  border-radius: ${(props) => (props.header ? '10px' : '12px')};
  margin-bottom: 15px;
  font-weight: ${(props) => (props.header ? 'bold' : 'normal')};
  font-size: ${(props) => (props.header ? '14px' : '13px')};
  text-transform: ${(props) => (props.header ? 'uppercase' : 'none')};
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background: ${(props) => (!props.header ? '#ffeaea' : '')};
    transform: ${(props) => (!props.header ? 'scale(1.01)' : 'none')};
`;

const ColumnSelect = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: center;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #ff5c5c;
    cursor: pointer;
  }
`;

const ColumnProduct = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ColumnPrice = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: #333;
`;

const ColumnQty = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const ColumnTotal = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: #222;
`;

const ColumnRemove = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: center;
`;

const Image = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #ddd;
`;

const Name = styled.h2`
  font-size: 16px;
  margin: 0;
  color: #222;
`;

const Description = styled.p`
  font-size: 12px;
  color: #777;
  margin: 3px 0 0 0;
`;

const Button = styled.button`
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  background-color: #f3f3f3;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #e2e2e2;
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  color: #888;
  font-size: 20px;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #ff5c5c;
  }
`;

const CheckoutSection = styled.div`
  padding: 20px;
  text-align: right;
  border-top: 1px solid #e0e0e0;
  background-color: #ffffff;
`;

const TotalPrice = styled.div`
  font-size: 20px;
  margin-bottom: 15px;
  font-weight: bold;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const DeleteSelectedButton = styled.button`
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
  }
`;

const CheckoutButton = styled.button`
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 15px;
`;
const NoItemsMessage = styled.div`
  font-size: 16px;
  color: #777;
  text-align: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 15px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #e74c3c;
  text-align: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 15px;
`;

export default Cart;