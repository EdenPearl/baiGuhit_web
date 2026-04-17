import React, { useEffect } from 'react';
import styled from 'styled-components';
import Logo from '../../../Assests/logo1.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useRegister from '../../../Hooks/RegisterHooks/useRegister';
import useToggleRegister from '../../../Hooks/RegisterHooks/useToggleRegister';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterModal = ({ isOpen, openLoginModal }) => {
  const { toggleModal } = useToggleRegister();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    setError,
    setSuccess,
    showPassword,
    setShowPassword,
    handleSubmit,
  } = useRegister();

  useEffect(() => {
    if (success) {
      toast.success(success, { autoClose: 3000 });
      setSuccess(null); 
    }
    if (error) {
      toast.error(error, { autoClose: 3000 });
      setError(null);
    }
  }, [success, error,  setSuccess, setError]);

  if (!isOpen) return null;

  return (
    <Modal>
    <StyledToastContainer />
      <ModalContent>
        <RightContainer>
          <LogoContainer>
            <LogoImage src={Logo} alt="bAIguhit" />
            <BrandName>
              <B1>b</B1><B2>AI</B2><B3>guhit</B3>
            </BrandName>
            <BrandLine />
            <BrandTag>Revive the Ancient Script.<br />Master Baybayin through Play.</BrandTag>
          </LogoContainer>
        </RightContainer>
        <LeftContainer>
          <CloseButton onClick={toggleModal}>&times;</CloseButton>
          <SignInForm>
            <FormLabel>Create new account</FormLabel>
            <FormField>
              <InputLabel>Email</InputLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField>
              <InputLabel>Password</InputLabel>
              <PasswordInputWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <PasswordToggleIcon onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggleIcon>
              </PasswordInputWrapper>
            </FormField>
            <FormField>
              <InputLabel>Confirm Password</InputLabel>
              <PasswordInputWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <PasswordToggleIcon onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggleIcon>
              </PasswordInputWrapper>
            </FormField>
            {error && <ErrorText>{error}</ErrorText>}
            <SubmitButton onClick={handleSubmit}>Sign Up</SubmitButton>
            <SignUpPrompt>
              Already have an account? <SignUpLink onClick={openLoginModal}>Login here</SignUpLink>
            </SignUpPrompt>
          </SignInForm>
        </LeftContainer>
      </ModalContent>
    </Modal>
  );
};

export default RegisterModal;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background:linear-gradient(160deg,rgba(43,16,4,.85),rgba(74,23,6,.85));
  backdrop-filter:blur(8px);
  padding: 16px;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: min(760px, 100%);
  height: min(500px, 90vh);
  background-color: #2b1004;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  border:1px solid rgba(251,196,23,.15);
  box-shadow:0 24px 60px rgba(0,0,0,.45),0 0 60px rgba(251,196,23,.1);
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  flex: 1;
  position: relative;
  padding: 40px 36px;
  background:linear-gradient(160deg,#2b1004 0%,#4a1706 100%);
  overflow-y: auto;
`;
const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(160deg,#fff8ee 0%,#fffdf8 100%);
  color: #7a2100;
  padding: 36px 28px;
  position: relative; 

  @media (max-width: 560px) {
    display: none;
  }
`;
const CloseButton = styled.span`
  position: absolute; 
  top: 0;
  right: 20px;
  cursor: pointer;
  font-size: 2.5rem;
  color:rgba(255,246,235,.5);
  &:hover {
    color: #fbc417;
  }
`;
const SignInForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 80%;
`;

const FormLabel = styled.h2`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 20px;
  color: #fff6eb;
`;

const FormField = styled.div`
  margin-bottom: 15px;
  width: 100%; 
  display: flex;
  flex-direction: column;
  align-items: center; 
`;

const InputLabel = styled.label`
  align-self: flex-start;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #fde68a;
`;

const Input = styled.input`
  font-family: 'Poppins';
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid rgba(251,196,23,.25);
  background:rgba(42,16,4,.6);
  font-size: 12px;
  box-sizing: border-box;
  color:#fff6eb;

  &::placeholder{
    color:rgba(255,246,235,.3);
  }

  &:focus{
    border-color: rgba(251,196,23,.5);
    background:rgba(42,16,4,.8);
    outline: none;
    box-shadow:0 0 0 3px rgba(251,196,23,.15);
  }
`;


const SubmitButton = styled.button`
  align-self: center;
  width: 100%;
  font-family: 'Poppins';
  padding: 10px;
  background: linear-gradient(135deg,#c24010,#9a3000);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 0.8rem;
  box-shadow:0 4px 16px rgba(194,64,12,.28);
  transition:transform .15s,box-shadow .15s;
  &:hover {
    transform:translateY(-2px);
    box-shadow:0 7px 22px rgba(194,64,12,.38);
  }
  &:active{
    transform:translateY(1px);
  }
`;

const SignUpPrompt = styled.p`
  margin-top: 10px;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255,246,235,.65);
`;

const SignUpLink = styled.a`
  cursor: pointer;
  color: #fbc417;
  text-decoration: none;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;

const OtherWaysToSignIn = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const OtherWaysText = styled.p`
  font-size: 0.7rem;
  color: rgba(255,246,235,.5);
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const IconLink = styled.a`
  margin: 0 10px;
  cursor: pointer;
  text-decoration: none;
  transition:all .15s;
  &:hover{
    opacity:.8;
    transform:translateY(-2px);
  }
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const LogoContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

const LogoImage = styled.img`
  width: 88px;
  height: 88px;
  margin-bottom: 0;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid rgba(122,33,0,.18);
  box-shadow: 0 8px 28px rgba(122,33,0,.12);
`;

const BrandName = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 1;
`;

const B1 = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 30px;
  font-weight: 900;
  color: #7a2100;
`;

const B2 = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 30px;
  font-weight: 900;
  background: linear-gradient(90deg,#fde68a,#fbc417,#fde68a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const B3 = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 30px;
  font-weight: 900;
  color: rgba(122,33,0,.55);
`;

const BrandLine = styled.div`
  width: 50px;
  height: 1px;
  background: rgba(122,33,0,.18);
`;

const BrandTag = styled.p`
  margin: 0;
  text-align: center;
  font-family: 'Georgia', serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1.7;
  color: rgba(122,33,0,.7);
`;

const ErrorText = styled.p`
  color: #ffb36b;
  font-size: 0.8rem;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggleIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: rgba(255,246,235,.4);
  font-size: 18px;
  &:hover{
    color:#fbc417;
  }
`;

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
  }
`;
