import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Loader from './CustomizeLoader';
import { FaStar } from 'react-icons/fa';
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";

const Review = ({ product_id, order_id, imageUrl, closeReview }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [productName, setProductName] = useState('N/A');
  const [userId, setUserId] = useState(null);

  // Fetch product details and user ID when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setError('No session ID found');
        return;
      }

      try {
        // Fetch product details
        if (product_id) {
          const productResponse = await axios.get(url_t +'product/products');
          const products = productResponse.data;
          const product = products.find((p) => p.product_id === product_id);
          if (product) {
            setProductName(product.product_name || 'N/A');
          } else {
            setError('Product not found');
          }
        } else {
          setError('Missing product information');
        }

        // Fetch user ID using /user_profile endpoint
        const userResponse = await axios.get(url_t +'auth/user_profile', {
          headers: {
            'session-id': sessionId,
          },
        });

        if (userResponse.data.user && userResponse.data.user.id) {
          setUserId(userResponse.data.user.id);
        } else {
          setError('Failed to fetch user information');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch product or user details');
      }
    };

    fetchData();
  }, [product_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product_id || !order_id || !userId) {
      setError('Missing product, order, or user information.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      const response = await axios.post(
        url_t +'product/add_review',
        {
          user_id: userId,
          product_id,
          reviews: comment.trim() || 'No comment provided',
          ratings: rating,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      setTimeout(() => {
        closeReview();
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <h1>Submit Your Review</h1>
          <p>Share your feedback for {productName} (Order #{order_id || 'N/A'})</p>
        </Header>

        {loading && <Loader />}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Review submitted successfully!</SuccessMessage>}

        <ReviewForm onSubmit={handleSubmit}>
          {imageUrl && (
            <ProductImageContainer>
              <ProductImage src={imageUrl} alt={productName} />
            </ProductImageContainer>
          )}
          <RatingContainer>
            <RatingLabel>Rating:</RatingLabel>
            <Stars>
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <StarLabel key={index}>
                    <StarInput
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar
                      size={30}
                      color={ratingValue <= (hover || rating) ? '#A52A2A' : '#e4e5e9'}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </StarLabel>
                );
              })}
            </Stars>
          </RatingContainer>

          <CommentContainer>
            <CommentLabel>Comment:</CommentLabel>
            <CommentTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              rows="5"
            />
          </CommentContainer>

          <ButtonContainer>
            <SubmitButton type="submit" disabled={loading}>
              Submit Review
            </SubmitButton>
            <BackButton onClick={closeReview}>
              Back to Orders
            </BackButton>
          </ButtonContainer>
        </ReviewForm>
      </MainContent>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  font-family: 'Poppins', sans-serif;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #fff, #f8f8f8);
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #333;
  }

  p {
    font-size: 1.1rem;
    color: #666;
  }
`;

const ReviewForm = styled.form`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
`;

const ProductImageContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ProductImage = styled.img`
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const RatingContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const RatingLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 0.5rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StarLabel = styled.label`
  cursor: pointer;
`;

const StarInput = styled.input`
  display: none;
`;

const CommentContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CommentLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 0.5rem;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  resize: vertical;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  flex: 1;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(90deg, rgb(150, 34, 11), rgb(200, 126, 79));
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
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const BackButton = styled.button`
  flex: 1;
  background: #f8f8f8;
  color: #A52A2A;
  border: 1px solid #A52A2A;
  padding: 0.8rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;

  &:hover {
    background: #A52A2A;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

export default Review;