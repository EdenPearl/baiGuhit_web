import React, { useEffect } from 'react';
import styled from 'styled-components';
import Facebook from '../Assests/facebookicon.svg';
import Google from '../Assests/googleicon.svg';
import Logo from '../Assests/logo1.jpg';
import RegisterModal from './Register';
import Loader from './CustomizeLoader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useLogin from '../Hooks/LoginHooks/useLogin';
import usePasswordToggle from '../Hooks/LoginHooks/usePasswordToggle';
import useToggle from '../Hooks/LoginHooks/useToggle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const LoginModal = ({ isOpen, toggleModal }) => {
  
  const { email, setEmail, password, setPassword, error, setError, loading, handleLogin } = useLogin('marketplace');
  const { showLogin, openSignUpModal, openLoginModal } = useToggle();
  const { showPassword, togglePasswordVisibility } = usePasswordToggle();

  useEffect(() => {
    if (error) {
      toast.error(error, { autoClose: 3000 });
      setError(null);
    }
  }, [error, setError]);

  if (!isOpen) return null;

  return (
    <>
      {loading && <Loader />}
      {showLogin ? (
        <Modal>
          <StyledToastContainer />
          <ModalContent>
            <LeftContainer>
              <SignInForm onSubmit={handleLogin}>
                <FormLabel>Sign in to your account</FormLabel>
                <FormField>
                  <InputLabel>Email</InputLabel>
                  <Input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    />
                    <PasswordToggleIcon onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggleIcon>
                  </PasswordInputWrapper>
                </FormField>
                <ForgotPasswordLink href="#">Forgot Password?</ForgotPasswordLink>
                <SubmitButton type="submit">Sign In</SubmitButton>
                <OtherWaysToSignIn>
                  <OtherWaysText>Other ways to sign in</OtherWaysText>
                  <IconsContainer>
                    <IconLink href="#">
                      <Icon src={Facebook} alt="Facebook" />
                    </IconLink>
                    <IconLink href="#">
                      <Icon src={Google} alt="Google" />
                    </IconLink>
                  </IconsContainer>
                </OtherWaysToSignIn>
                <SignUpPrompt>
                  Don’t have an account?{' '}
                  <SignUpLink onClick={openSignUpModal}>Create Account</SignUpLink>
                </SignUpPrompt>
              </SignInForm>
            </LeftContainer>
            <RightContainer>
              <CloseButton onClick={toggleModal}>&times;</CloseButton>
              <LogoContainer>
                <LogoImage src={Logo} alt="Logo1" />
                <LogoText>eBaybayMo</LogoText>
              </LogoContainer>
            </RightContainer>
          </ModalContent>
        </Modal>
      ) : (
        <RegisterModal isOpen={true} openLoginModal={openLoginModal} />
      )}
    </>
  );
};

export default LoginModal;
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 800px;
  height: 80vh;
  background-color: white;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  width: 50%;
  padding: 20px;
  background-color: #ffffff;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  background: linear-gradient(135deg, #C2410C, #EA580C); // Complement HomeGame gradient
  color: white;
  padding: 20px;
  border-radius: 25px 0 0 25px;
  position: relative; 
`;


const CloseButton = styled.span`
  position: absolute; 
  top: 0;
  right: 20px;
  cursor: pointer;
  font-size: 2.5rem;
  &:hover {
    color: #C2410C; // Matches gradient start
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
  color: #C2410C; // Matches gradient start
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
  color: #000000;
`;

const Input = styled.input`
  font-family: 'Poppins';
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #C4C4C4;
  font-size: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: #C2410C; // Matches gradient start
    outline: none;
  }
`;

const ForgotPasswordLink = styled.a`
  font-weight: bold;
  color: #757575;
  text-decoration: none;
  font-size: 12px;
  align-self: flex-end;
  margin-bottom: 15px;
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  align-self: center;
  width: 100%;
  font-family: 'Poppins';
  padding: 10px;
  background: linear-gradient(135deg, #C2410C, #EA580C); // Complement HomeGame gradient
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 0.8rem;
  &:hover {
    background: linear-gradient(135deg, #9E2B05, #D96A3F); // Darker hover for contrast
  }
`;

const SignUpPrompt = styled.p`
  margin-top: 10px;
  text-align: center;
  font-size: 0.7rem;
  color: #333;
  cursor: pointer;
`;

const SignUpLink = styled.a`
  color: #C2410C; // Matches gradient start
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
  color: #757575;
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
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const LogoContainer = styled.div`
  text-align: center;
`;

const LogoImage = styled.img`
  width: 200px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 50%;
  border: 2px solid #ffffff;
`;

const LogoText = styled.p`
  font-family: 'Poppins';
  font-size: 2rem;
  color: #ffffff;
  margin-top: 1rem;
  font-weight: 800;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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
  color: #757575;
  font-size: 18px;
`;

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
  }
`;