import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Loader from './CustomizeLoader';

const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";

// ModalContainer styled component
const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 150%;
  max-width: 900px;
  padding: 40px;
  position: relative;
  max-height: 100vh;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Checkout = ({ state, onClose, onOrderPlaced }) => {
  const [userId, setUserId] = useState(null);
  const product = state?.product || {};
  const totalPrice = state?.totalPrice || 0;

  const [formData, setFormData] = useState({
    contact_number: "",
    name: "",
    estimated_date: "",
  });

  useEffect(() => {
    // Fetch user ID
    const fetchUserId = async () => {
      try {
        const sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          console.error("No session ID found");
          return;
        }

        const response = await fetch(url_t + "auth/user_profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "session-id": sessionId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.id) {
            setUserId(data.user.id);
          }
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    // Set estimated delivery date to one day after the current date
    const calculateEstimatedDate = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Format date to YYYY-MM-DD for the input field
      const formattedDate = tomorrow.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, estimated_date: formattedDate }));
    };

    calculateEstimatedDate();
  }, []); // Empty dependency array to run once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!userId) {
      alert("User not found. Please log in first.");
      return;
    }

    try {
      const orderData = {
        user_id: userId,
        product_id: product.id,
        total_amount: totalPrice,
        status: "Pending",
        quantity: product.quantity,
        contact_number: formData.contact_number,
        name: formData.name,
        estimated_date: formData.estimated_date,
      };

      const response = await fetch(url_t + "order/order_insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        onOrderPlaced();
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing your order. Please try again.");
    }
  };

  return (
    <ModalContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <CheckoutTitle>Checkout</CheckoutTitle>
      <CheckoutInfo>
        <ProductSection>
          <ProductDetails>
            <ProductImage src={product.imageUrl} alt={product.product_name} />
            <ProductInfo>
              <ProductName>{product.product_name}</ProductName>
              <ProductDescription>{product.description || "No description available"}</ProductDescription>
              <PriceQuantityContainer>
                <ProductPrice>₱{totalPrice.toFixed(2)}</ProductPrice>
                <ProductQuantity>Quantity: {product.quantity}</ProductQuantity>
              </PriceQuantityContainer>
            </ProductInfo>
          </ProductDetails>

          <FormSection>
  <FormField>
    <Label>Name</Label>
    <Input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      placeholder="Enter your name"
      required
    />
  </FormField>

  <FormField>
    <Label>Contact Number</Label>
    <Input
      type="tel"
      name="contact_number"
      value={formData.contact_number}
      onChange={handleInputChange}
      placeholder="Enter contact number"
      required
    />
  </FormField>

  <FormField>
    <label className="text-sm text-gray-600">Estimated Delivery Date</label>
    <div className="font-bold text-black mt-1">
      {formData.estimated_date
        ? new Date(formData.estimated_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : ""}
    </div>
  </FormField>
</FormSection>
        </ProductSection>

        <TotalPriceSection>
          <TotalPriceContainer>
            <TotalPriceTitle>Total Amount</TotalPriceTitle>
            <TotalPrice>₱{totalPrice.toFixed(2)}</TotalPrice>
          </TotalPriceContainer>
          <PlaceOrderButton onClick={handlePlaceOrder}>Place Order</PlaceOrderButton>
        </TotalPriceSection>
      </CheckoutInfo>
    </ModalContainer>
  );
};

// Styled Components (unchanged)
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #cc0000;
  }
`;

const CheckoutTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
`;

const CheckoutInfo = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const ProductSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProductDetails = styled.div`
  display: flex;
  gap: 20px;
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const PriceQuantityContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ProductName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
`;

const ProductDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ProductPrice = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
`;

const ProductQuantity = styled.p`
  font-size: 14px;
  color: #666;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormattedDate = styled.p`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #e74c3c;
    outline: none;
  }
`;

const TotalPriceSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
`;

const TotalPriceContainer = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  text-align: right;
`;

const TotalPriceTitle = styled.h4`
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const TotalPrice = styled.p`
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
`;

const PlaceOrderButton = styled.button`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(45deg, #c0392b, #e74c3c);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default Checkout;