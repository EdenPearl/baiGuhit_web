import React, { useEffect, useState, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import bannerImage from '../Assests/sir1.png';
import adsImage from '../Assests/ads.gif';
import getImageUrl from '../Utils/getImageUrl';
import Product from '../models/Product';
import Loader from './CustomizeLoader';
import { FaHeart } from 'react-icons/fa';
import ChatbotButton from './ChatbotButton'; // Import the new ChatbotButton component
import download from '../Assests/download.jpg';


const url_t = "http://localhost:8000/";
// Custom Hooks
const useCartInsert = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addToCart = useCallback(async ({ userId, productId, quantity, totalAmount, imageUrl }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) throw new Error('No session ID found');

      const response = await fetch(url_t +'cart/cart_insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          total_amount: totalAmount,
          quantity,
        }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      await localStorage.setItem(`cartImage_${productId}`, imageUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { addToCart, isLoading, error, success };
};

const useOrderInsert = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData, callback) => {
    setIsLoading(true);
    setError(null);
    try {
      await localStorage.setItem('orderData', JSON.stringify(orderData));
      callback(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createOrder, isLoading, error };
};

const useFetchReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url_t +
          `product/${productId}/reviews`
        );
        if (response.status === 404) {
          setReviews([]);
          return;
        }
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  return { reviews, loading, error };
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    background-color: ${(props) => (props.darkMode ? '#454444' : '#fff')};
    color: ${(props) => (props.darkMode ? '#fff' : '#000')};
    transition: background-color 0.3s ease;
    font-family: 'Poppins', sans-serif;
  }
`;

const Market = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [actionType, setActionType] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [orderSummaryVisible, setOrderSummaryVisible] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [name, setName] = useState('Juan Dela Cruz');
  const [phone, setPhone] = useState('09858544267');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [orderSuccess,] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);

  const { addToCart, isLoading: cartLoading, error: cartError, success } = useCartInsert();
  const { createOrder, isLoading: orderLoading, error: orderInsertError } = useOrderInsert();
  const { reviews, loading: reviewsLoading, error: reviewsError } = useFetchReviews(
    selectedProduct?.id
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          url_t +'product/products'
        );
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const productList = await Promise.all(
          data.map(async (item) => {
            const imageUrl = await getImageUrl(item.id);
            return new Product(
              item.id,
              item.product_name,
              item.price,
              item.description,
              item.review_id,
              imageUrl,
              item.brand || 'Generic Brand'
            );
          })
        );
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          console.warn('No session ID found');
          return;
        }
        const response = await fetch(url_t +
          'auth/user_profile',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'session-id': sessionId,
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.user) {
            setUser(result.user);
            localStorage.setItem('userId', result.user.id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (orderData) {
      setTotalPrice(orderData.price * orderData.quantity);
    }
  }, [orderData]);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setEstimatedDate(formattedDate);
  }, []);

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = useCallback((change) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + change)));
  }, []);

  const handleAction = useCallback(async () => {
    if (!user) {
      alert('Please log in to perform this action.');
      return;
    }
    const totalAmount = selectedProduct.price * quantity;
    if (actionType === 'addToCart') {
      await addToCart({
        userId: user.id,
        productId: selectedProduct.id,
        quantity,
        totalAmount,
        imageUrl: selectedProduct.imageUrl,
      });
      if (!cartError) setCart([...cart, { ...selectedProduct, quantity }]);
    } else if (actionType === 'buyNow') {
      const orderData = {
        product_id: selectedProduct.id,
        user_id: user.id,
        product_name: selectedProduct.productName,
        image: selectedProduct.imageUrl,
        price: selectedProduct.price,
        quantity,
      };
      await createOrder(orderData, (data) => {
        setOrderData(data);
        setOrderSummaryVisible(true);
        setSelectedProduct(null);
      });
    }
  }, [user, selectedProduct, quantity, actionType, addToCart, createOrder, cart, cartError]);

  const handleConfirmOrder = async () => {
    setIsConfirmLoading(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedEstimatedDate = tomorrow.toISOString().split('T')[0];

      const response = await fetch(url_t +'order/order_insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: orderData.product_id,
          total_amount: totalPrice,
          status: 'Pending',
          quantity: orderData.quantity,
          contact_number: phone,
          name: name,
          estimated_date: formattedEstimatedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to insert order');
      }

      const result = await response.json();
      console.log('Order inserted successfully, Order ID:', result.order_id);
      setOrderSummaryVisible(false);
      setThankYouVisible(true);
    } catch (error) {
      console.error('Error confirming order:', error.message);
      setOrderError(error.message);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowAllReviews(false);
  };

  const closeModal = () => setSelectedProduct(null);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleCreatePost = () => {
    console.log('Create Post button clicked!');
  };

  const closeOrderSummary = () => {
    setOrderSummaryVisible(false);
    setOrderData(null);
  };

  const closeThankYou = () => {
    setThankYouVisible(false);
    setOrderData(null);
  };

  const handleEditPress = () => setEditModalVisible(true);

  const handleSaveEdit = () => setEditModalVisible(false);

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.ratings, 0) / reviews.length : 0;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <>
      <GlobalStyle darkMode={darkMode} />
      <PageContainer>
        <MainContent>
          <TopBar>
            <Spacer />
            <SearchBar
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <RightSection>
              <ToggleContainer onClick={toggleDarkMode}>
                <ToggleLabel>{darkMode ? 'Dark' : 'Light'}</ToggleLabel>
                <ToggleSwitch isOn={darkMode} />
              </ToggleContainer>
              <ProfileImage src={download} alt="Profile" />
            </RightSection>
          </TopBar>

          <BannerRow>
            <Banner>
              <BannerText>
                <h1>Rediscover Culture.<br />Redefine Style</h1>
                <p>
                  Explore unique shirts, apparel, and lifestyle pieces proudly
                  crafted with Baybayin designs. Celebrate Filipino heritage
                  through fashion, and wear your identity with pride.
                </p>
              </BannerText>
              <BannerImage src={bannerImage} alt="Market Banner" />
            </Banner>

            <ShoppingList visible={darkMode}>
              <AdsWrapper>
                <AdsImage src={adsImage} alt="Advertisement" />
                <CreatePostButton onClick={handleCreatePost}>Create Post</CreatePostButton>
              </AdsWrapper>
              <AnimatedText>
                Share Your Thoughts! <br />
                Tell us what you love about eBayBayMo products! 💬
              </AnimatedText>
            </ShoppingList>
          </BannerRow>

          {loading ? (
            <Loader />
          ) : (
            <ProductList>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} onClick={() => openModal(product)} darkMode={darkMode}>
                  {product.imageUrl ? (
                    <ProductImage src={product.imageUrl} alt={product.productName} />
                  ) : (
                    <PlaceholderImage>Loading...</PlaceholderImage>
                  )}
                  <ProductInfo>
                    <ProductName>{product.productName}</ProductName>
                    <ProductBrand>{product.brand}</ProductBrand>
                    <PriceContainer>
                      <CurrentPrice>₱{product.price.toFixed(2)}</CurrentPrice>
                      {product.originalPrice && (
                        <OriginalPrice>₱{product.originalPrice.toFixed(2)}</OriginalPrice>
                      )}
                    </PriceContainer>
                  </ProductInfo>
                  <HeartIcon>
                    <FaHeart />
                  </HeartIcon>
                </ProductCard>
              ))}
            </ProductList>
          )}

          {selectedProduct && (
            <ModalOverlay>
              <Modal>
                <CloseButton onClick={closeModal}>×</CloseButton>
                {success && (
                  <SuccessMessage>Product Added to Cart Successfully!</SuccessMessage>
                )}
                {(cartLoading || orderLoading || reviewsLoading) && (
                  <LoadingOverlay>Loading...</LoadingOverlay>
                )}
                {(cartError || orderInsertError || reviewsError) && (
                  <ErrorMessage>Error: {cartError || orderInsertError || reviewsError}</ErrorMessage>
                )}
                <ModalContent>
                  <ImageContainer>
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} />
                  </ImageContainer>
                  <DetailsContainer>
                    <h2>{selectedProduct.productName}</h2>
                    <Price>₱{selectedProduct.price.toFixed(2)}</Price>
                    <AverageRating>
                      ⭐ {averageRating.toFixed(1)} / 5 ({reviews.length} reviews)
                    </AverageRating>
                    <p>{selectedProduct.description}</p>
                    <QuantityContainer>
                      <QuantityLabel>Quantity</QuantityLabel>
                      <QuantitySelector>
                        <QuantityButton onClick={() => handleQuantityChange(-1)}>-</QuantityButton>
                        <QuantityText>{quantity}</QuantityText>
                        <QuantityButton onClick={() => handleQuantityChange(1)}>+</QuantityButton>
                      </QuantitySelector>
                    </QuantityContainer>
                    <ButtonContainer>
                      <ActionButton
                        onClick={() => {
                          setActionType('addToCart');
                          handleAction();
                        }}
                        disabled={cartLoading || orderLoading}
                      >
                        Add to Cart
                      </ActionButton>
                      <ActionButton
                        buyNow
                        onClick={() => {
                          setActionType('buyNow');
                          handleAction();
                        }}
                        disabled={cartLoading || orderLoading}
                      >
                        Buy Now
                      </ActionButton>
                    </ButtonContainer>
                  </DetailsContainer>
                </ModalContent>
                <ReviewSection>
                  <ReviewHeaderContainer>
                    <ReviewHeader>Customer Reviews</ReviewHeader>
                    {reviews.length > 2 && (
                      <ViewMoreText onClick={() => setShowAllReviews(!showAllReviews)}>
                        {showAllReviews ? 'View Less' : 'View All'}
                      </ViewMoreText>
                    )}
                  </ReviewHeaderContainer>
                  {reviews.length === 0 && !reviewsLoading && (
                    <NoReviews>No reviews available.</NoReviews>
                  )}
                  {displayedReviews.map((review, index) => (
                    <ReviewItem key={index}>
                      <ReviewLeft>
                        <ReviewerName>{review.username}</ReviewerName>
                        <ReviewRating>
                          {Array.from({ length: review.ratings }, (_, i) => (
                            <StarIcon key={i}>⭐</StarIcon>
                          ))}
                        </ReviewRating>
                        <ReviewText>{review.reviews}</ReviewText>
                      </ReviewLeft>
                      <ReviewDate>
                        {new Date(review.transdate).toLocaleDateString()}
                      </ReviewDate>
                    </ReviewItem>
                  ))}
                </ReviewSection>
              </Modal>
            </ModalOverlay>
          )}

          {orderSummaryVisible && orderData && (
            <ModalOverlay>
              <OrderSummaryModal>
                <OrderSummaryHeader>
                  <CloseButton onClick={closeOrderSummary}>×</CloseButton>
                </OrderSummaryHeader>

                {orderSuccess && (
                  <SuccessMessage>Order Placed Successfully!</SuccessMessage>
                )}
                {orderError && (
                  <ErrorMessage>Error: {orderError}</ErrorMessage>
                )}
                {isConfirmLoading && (
                  <LoaderContainer>
                    <Loader />
                  </LoaderContainer>
                )}

                <OrderSummaryContent>
                  <Section>
                    <InfoHeader>
                      <SectionTitle>Your Information</SectionTitle>
                      <EditText onClick={handleEditPress}>Edit</EditText>
                    </InfoHeader>
                    <InputBox>
                      <InfoText>{name}</InfoText>
                      <InfoText>{phone}</InfoText>
                    </InputBox>
                  </Section>

                  <ProductSection>
                    <ProductDetailsRow>
                      <ProductImage
                        src={orderData.image || 'https://via.placeholder.com/100'}
                        alt={orderData.product_name}
                      />
                      <ProductInfo>
                        <ProductTitle>{orderData.product_name || 'Loading...'}</ProductTitle>
                        <ProductPrice>₱{orderData.price.toFixed(0)}</ProductPrice>
                      </ProductInfo>
                    </ProductDetailsRow>
                    <ProductQuantity>x{orderData.quantity}</ProductQuantity>
                  </ProductSection>

                  <PickupSection>
                    <PickupText>
                      Your order will be available for pickup on
                      <BoldText> BISU-BILAR Campus</BoldText> at
                      <BoldText> [COMSOC office]</BoldText> the day after purchase.
                    </PickupText>
                  </PickupSection>

                  <DetailsSection>
                    <EstimatedDateLabel>Estimated Date:</EstimatedDateLabel>
                    <EstimatedDate>{estimatedDate}</EstimatedDate>
                    <PaymentMethodLabel>Payment Method:</PaymentMethodLabel>
                    <PaymentMethodText>
                      Payment will be made in person upon pickup.
                    </PaymentMethodText>
                  </DetailsSection>

                  <TotalAmountContainer>
                    <Label>Total amount:</Label>
                    <TotalAmount>₱{totalPrice.toFixed(0)}</TotalAmount>
                  </TotalAmountContainer>
                </OrderSummaryContent>

                <Footer>
                  <ConfirmButton onClick={handleConfirmOrder} disabled={isConfirmLoading || orderLoading}>
                    <ConfirmText>Confirm Order</ConfirmText>
                  </ConfirmButton>
                </Footer>
              </OrderSummaryModal>
            </ModalOverlay>
          )}

          {editModalVisible && (
            <ModalOverlay>
              <EditModal>
                <CloseButton onClick={() => setEditModalVisible(false)}>×</CloseButton>
                <ModalTitle>Edit Information</ModalTitle>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                />
                <ButtonContainer>
                  <ActionButton onClick={handleSaveEdit}>Save</ActionButton>
                  <ActionButton buyNow onClick={() => setEditModalVisible(false)}>
                    Cancel
                  </ActionButton>
                </ButtonContainer>
              </EditModal>
            </ModalOverlay>
          )}

          {thankYouVisible && (
            <ModalOverlay>
              <ThankYouModal>
                <CloseButton onClick={closeThankYou}>×</CloseButton>
                <ThankYouTitle>Thank You for Your Order!</ThankYouTitle>
                <ThankYouMessage>
                  Your order has been successfully placed. You'll receive a confirmation soon. 
                  Pick up your order at <BoldText>BISU-BILAR Campus, COMSOC office</BoldText> on {estimatedDate}.
                </ThankYouMessage>
                <ButtonContainer>
                  <ActionButton onClick={closeThankYou}>
                    Back to Market
                  </ActionButton>
                </ButtonContainer>
              </ThankYouModal>
            </ModalOverlay>
          )}

          <ChatbotButton /> {/* Add the ChatbotButton component */}
        </MainContent>
      </PageContainer>
    </>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  width: 100%;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Spacer = styled.div`
  width: 300px;
`;

const SearchBar = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 300px;
  font-size: 16px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
`;

const ToggleSwitch = styled.div`
  width: 40px;
  height: 20px;
  background-color: ${(props) => (props.isOn ? '#666' : '#ccc')};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${(props) => (props.isOn ? '20px' : '3px')};
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s ease;
  }
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const BannerRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 3rem;
`;

const Banner = styled.div`
  position: relative;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  color: white;
  flex: 2;
  height: auto;
  overflow: visible;
`;

const BannerText = styled.div`
  flex: 1;
  max-width: 80%;
  padding-right: 180px;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;
    color: white;
    position: relative;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.9) 50%,
      transparent 100%
    );
    background-size: 20% 100%;
    background-repeat: no-repeat;
    background-clip: text;
    -webkit-background-clip: text;
    animation: glimmer 2s linear infinite, pulse 2s ease-in-out infinite;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  @keyframes glimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const BannerImage = styled.img`
  position: absolute;
  right: 20px;
  bottom: -1px;
  height: 310px;
  object-fit: contain;
  pointer-events: none;
`;

const ShoppingList = styled.div`
  flex: 1;
  background: ${(props) => (props.visible ? '#1a1a1a' : '#f1f1f1')};
  color: ${(props) => (props.visible ? '#fff' : '#000')};
  padding: 1rem;
  border-radius: 20px;
  min-height: 250px;
  transition: background 0.3s ease, color 0.3s ease;
  box-shadow: ${(props) => (props.visible ? '0 0 10px #333' : '0 0 5px #ccc')};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const AdsWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
`;

const buttonPulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const buttonSlantGlimmer = keyframes`
  0% {
    background-position: -200% -200%;
  }
  100% {
    background-position: 200% 200%;
  }
`;

const CreatePostButton = styled.button`
  position: absolute;
  top: 1%;
  left: 10px;
  transform: translateY(-50%);
  padding: 0.5rem 1rem;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 1;
  animation: ${buttonPulse} 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.8) 50%,
      transparent 60%
    );
    background-size: 200% 200%;
    animation: ${buttonSlantGlimmer} 4s linear infinite;
  }
`;

const AdsImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
`;

const typing = keyframes`
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
`;

const cursorMove = keyframes`
  0% { left: -1em; opacity: 0; }
  2.5% { left: 0; opacity: 1; }
  5% { transform: scale(1.2); }
  7.5% { transform: scale(1); }
  10% { left: 1em; opacity: 1; }
  12.5% { opacity: 0; }
  15% { left: 2em; opacity: 1; }
  17.5% { transform: scale(1.2); }
  20% { transform: scale(1); }
  22.5% { opacity: 0; }
  25% { left: 3em; opacity: 1; }
  27.5% { transform: scale(1.2); }
  30% { transform: scale(1); }
  32.5% { opacity: 0; }
  35% { left: 4em; opacity: 1; }
  37.5% { transform: scale(1.2); }
  40% { transform: scale(1); }
  42.5% { opacity: 0; }
  45% { left: 5em; opacity: 1; }
  47.5% { transform: scale(1.2); }
  50% { transform: scale(1); }
  52.5% { opacity: 0; }
  55% { left: 6em; opacity: 1; }
  57.5% { transform: scale(1.2); }
  60% { transform: scale(1); }
  62.5% { opacity: 0; }
  65% { left: 7em; opacity: 1; }
  67.5% { transform: scale(1.2); }
  70% { transform: scale(1); }
  72.5% { opacity: 0; }
  75% { left: 8em; opacity: 1; }
  77.5% { transform: scale(1.2); }
  80% { transform: scale(1); }
  82.5% { opacity: 0; }
  85% { left: 9em; opacity: 1; }
  87.5% { transform: scale(1.2); }
  90% { transform: scale(1); }
  92.5% { opacity: 0; }
  95% { left: 10em; opacity: 1; }
  97.5% { transform: scale(1.2); }
  100% { left: 11em; transform: scale(1); opacity: 0; }
`;

const AnimatedText = styled.div`
  font-size: 1rem;
  font-weight: 800;
  font-family: 'Poppins', sans-serif;
  line-height: 1.2;
  text-align: center;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
  animation: ${typing} 3s steps(40, end) infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -1em;
    width: 1em;
    height: 100%;
    background: white;
    animation: ${cursorMove} 3s steps(40, end) infinite;
    z-index: 1;
  }
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-bottom: 1rem;
`;

const ProductCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: contain;
  background-color: #f0f0f0;
`;

const ProductInfo = styled.div`
  padding: 0.75rem;
`;

const ProductName = styled.h3`
  margin: 0.3rem 0;
  font-size: 0.95rem;
  color: #333;
`;

const ProductBrand = styled.p`
  margin: 0.2rem 0;
  font-size: 0.8rem;
  color: #666;
`;

const PriceContainer = styled.div`
  margin-top: 0.3rem;
`;

const CurrentPrice = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #007bff;
  display: inline;
`;

const OriginalPrice = styled.p`
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
  display: inline;
  margin-left: 0.4rem;
`;

const HeartIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #ff4d4d;
  cursor: pointer;
  font-size: 1rem;
`;

const PlaceholderImage = styled.div`
  height: 120px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const ModalContent = styled.div`
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
`;

const ImageContainer = styled.div`
  flex: 1;
  img {
    width: 100%;
    height: 250px;
    object-fit: contain;
    border-radius: 4px;
  }
`;

const DetailsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  p {
    font-size: 0.9rem;
    color: #666;
    margin: 0.5rem 0;
  }
`;

const Price = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: #e91e63;
  margin: 0.5rem 0;
`;

const AverageRating = styled.p`
  font-size: 0.9rem;
  color: #f39c12;
  margin: 0.5rem 0;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const QuantityLabel = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  background: #f5f5f5;
  border: none;
  padding: 0.3rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #e0e0e0;
  }
`;

const QuantityText = styled.span`
  padding: 0.3rem 1rem;
  font-size: 0.9rem;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${(props) => (props.buyNow ? 
    'linear-gradient(90deg, rgb(240, 74, 9), rgb(202, 134, 33))' : 
    'linear-gradient(90deg, rgb(233, 236, 16), rgb(207, 94, 49))')};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${(props) => (props.buyNow ? 
      'linear-gradient(90deg, rgb(240, 74, 9), rgb(167, 111, 27))' : 
      'linear-gradient(90deg, rgb(233, 236, 16), rgb(207, 94, 49))')};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%
    );
    animation: glimmerEffect 2s infinite;
  }
  
  @keyframes glimmerEffect {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

const LoadingOverlay = styled.div`
  text-align: center;
  color: #999;
  padding: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 1.5rem;
  font-size: 0.9rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 1.5rem;
  font-size: 0.9rem;
  text-align: center;
`;

const ReviewSection = styled.div`
  border-top: 1px solid #eee;
  padding: 1rem 1.5rem;
`;

const ReviewHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ReviewHeader = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const ViewMoreText = styled.span`
  color: #007bff;
  cursor: pointer;
  font-size: 0.85rem;
  &:hover {
    text-decoration: underline;
  }
`;

const NoReviews = styled.p`
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
  margin: 0;
`;

const ReviewItem = styled.div`
  border-bottom: 1px solid #eee;
  padding: 0.75rem 0;
  display: flex;
  justify-content: space-between;
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewLeft = styled.div`
  flex: 1;
`;

const ReviewerName = styled.p`
  font-weight: bold;
  margin: 0;
  font-size: 0.9rem;
  color: #333;
`;

const ReviewRating = styled.div`
  color: #f39c12;
  margin: 0.3rem 0;
`;

const StarIcon = styled.span`
  margin-right: 2px;
  font-size: 0.9rem;
`;

const ReviewText = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: #666;
`;

const ReviewDate = styled.span`
  color: #aaa;
  font-size: 0.8rem;
  white-space: nowrap;
`;

const OrderSummaryModal = styled.div`
  background: white;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow-y: auto;
  font-family: 'Poppins', sans-serif;
`;

const OrderSummaryHeader = styled.div`
  position: relative;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
`;

const OrderSummaryContent = styled.div`
  padding: 1.5rem;
`;

const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
`;

const Section = styled.div`
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
  padding: 1rem;
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const EditText = styled.span`
  color: #a52a2a;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const InputBox = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: #333;
  margin: 0.25rem 0;
`;

const ProductSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
`;

const ProductDetailsRow = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const ProductTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const ProductPrice = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #a52a2a;
  margin: 0.5rem 0 0;
`;

const ProductQuantity = styled.p`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const PickupSection = styled.div`
  margin: 0.5rem 0;
  text-align: center;
`;

const PickupText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const BoldText = styled.span`
  font-weight: 600;
  color: #333;
`;

const DetailsSection = styled.div`
  margin: 0.5rem 0;
`;

const EstimatedDateLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  color: #333;
`;

const EstimatedDate = styled.p`
  font-size: 0.9rem;
  color: #a52a2a;
  margin: 0 0 0.5rem;
`;

const PaymentMethodLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  color: #333;
`;

const PaymentMethodText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem;
`;

const TotalAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 10px;
  margin: 0.5rem 0;
`;

const Label = styled.p`
  font-size: 1rem;
  margin: 0;
  color: #333;
`;

const TotalAmount = styled.p`
  font-size: 1.375rem;
  font-weight: 600;
  color: #a52a2a;
  margin: 0;
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
`;

const ConfirmButton = styled.button`
  background: white;
  border-radius: 4px;
  padding: 0.75rem;
  border: none;
  cursor: pointer;
  width: 150px;
  margin-left: auto;
  display: block;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #f0f0f0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%
    );
    animation: glimmerEffect 2s infinite;
  }
`;

const ConfirmText = styled.span`
  font-size: 0.9rem;
  color: #a52a2a;
  font-weight: 600;
`;

const EditModal = styled.div`
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
`;

const ThankYouModal = styled.div`
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  text-align: center;
  font-family: 'Poppins', sans-serif;
`;

const ThankYouTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #a52a2a;
  margin: 1rem 0;
`;

const ThankYouMessage = styled.p`
  font-size: 0.9rem;
  color: #333;
  margin: 0 0 1.5rem;
  line-height: 1.5;
`;

const ModalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
`;

export default Market;