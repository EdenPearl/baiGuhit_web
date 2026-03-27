import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaComment, FaTimes } from 'react-icons/fa';

// Animation for the button pulse effect
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(170, 39, 13, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(170, 39, 13, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(170, 39, 13, 0);
  }
`;

// Styled components for the chatbot
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
`;

const StyledChatbotButton = styled.button`
  background: #aa270d;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: ${pulse} 2s infinite;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: #961b0b;
  }
`;

const ChatIcon = styled(FaComment)`
  color: white;
  font-size: 24px;
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: #f0f4f8;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  flex-direction: column;
  padding: 1rem;
  font-family: 'Arial', sans-serif;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const ChatBotIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #aa270d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  color: white;
  font-size: 12px;
  line-height: 1;
`;

const Status = styled.span`
  font-size: 0.8rem;
  color: #aa270d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: scroll;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  /* Hide scrollbar for Chrome, Safari, and Edge */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, and Edge */
  }
`;

const Message = styled.div`
  margin: 0.5rem 0;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 70%;
  background: ${(props) => (props.isUser ? '#aa270d' : '#fff')};
  color: ${(props) => (props.isUser ? 'white' : '#333')};
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChoiceButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #aa270d;
    color: white;
    border-color: #aa270d;
  }

  span {
    margin-left: 0.5rem;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
`;

const SendButton = styled.button`
  background: #aa270d;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #961b0b;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PoweredBy = styled.div`
  font-size: 0.7rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
`;

const LoadingMessage = styled.div`
  color: #666;
  font-size: 0.85rem;
  text-align: center;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.div`
  color: #721c24;
  background: #f8d7da;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  text-align: center;
`;

const ChatbotButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, error]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeMessage = {
        text: "Hello there! 👋 It's nice to meet you! What brings you here today? Please use the navigation below or ask me anything about eBaybayMo product. ✍️",
        isUser: false,
      };
      setMessages([welcomeMessage]);
    }
  }, [isChatOpen, messages.length]);

  const handleSend = async () => {
    if (!message.trim() && !isChoiceSelected) return;

    const userMessage = { text: message || selectedChoice, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);
    setSelectedChoice(null);

    try {
      const response = await fetch('http://192.168.0.84:5000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
    } catch (err) {
      setError(err.message || 'Failed to get response from chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedChoice, setSelectedChoice] = useState(null);
  const isChoiceSelected = selectedChoice !== null;

  const choices = [
    { text: 'I have questions 😄', intent: 'have_questions' },
    { text: 'Just browsing 👀', intent: 'just_browsing' },
  ];

  return (
    <ChatbotContainer>
      <StyledChatbotButton onClick={() => setIsChatOpen(!isChatOpen)}>
        <ChatIcon />
      </StyledChatbotButton>
      <ChatWindow isOpen={isChatOpen}>
        <ChatHeader>
          <HeaderTitle>
            <ChatBotIcon>CB</ChatBotIcon>
            <div>
             eBayBot <Status>Online</Status>
            </div>
          </HeaderTitle>
          <CloseButton onClick={() => setIsChatOpen(false)}>
            <FaTimes />
          </CloseButton>
        </ChatHeader>
        <ChatMessages>
          {messages.map((msg, index) => (
            <Message key={index} isUser={msg.isUser}>
              {msg.text}
            </Message>
          ))}
          {isLoading && <LoadingMessage>Loading...</LoadingMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {!isLoading && !error && messages.length === 1 && (
            choices.map((choice, index) => (
              <ChoiceButton
                key={index}
                onClick={() => {
                  setSelectedChoice(choice.text);
                  setTimeout(handleSend, 0); // Trigger send after setting choice
                }}
              >
                {choice.text} <span>{choice.text.includes('😊') ? '' : '😊'}</span>
              </ChoiceButton>
            ))
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>
        <InputContainer>
          <ChatInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <SendButton onClick={handleSend} disabled={isLoading || (!message && !isChoiceSelected)}>
            →
          </SendButton>
        </InputContainer>
        <PoweredBy>Powered by eBayBot</PoweredBy>
      </ChatWindow>
    </ChatbotContainer>
  );
};

export default ChatbotButton;