import React, { useEffect } from 'react';
import styled from 'styled-components';
import Facebook from '../../../Assests/facebookicon.svg';
import Google from '../../../Assests/googleicon.svg';
import Logo from '../../../Assests/logo1.jpg';
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
        <LeftContainer>
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
              Already have an account? <SignUpLink onClick={openLoginModal}>Login here</SignUpLink>
            </SignUpPrompt>
          </SignInForm>
        </LeftContainer>
        <RightContainer>
          <CloseButton onClick={toggleModal}>&times;</CloseButton>
          <LogoContainer>
            <LogoImage src={Logo} alt="Logo1" />
            <LogoText>EBaybayMo</LogoText>
          </LogoContainer>
        </RightContainer>
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
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91)); /* Changed from #a52a2a to gradient */
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
    color: rgb(170, 39, 13); /* Changed from red to gradient's starting color */
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
  color: #a52a2a;
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

  &:focus{
    border-color: #a52a2a;
    outline: none;
  }
`;


const SubmitButton = styled.button`
  align-self: center;
  width: 100%;
  font-family: 'Poppins';
  padding: 10px;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91)); /* Changed from #a52a2a to gradient */
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 0.8rem;
  &:hover {
    background: linear-gradient(90deg, rgb(120, 27, 9), rgb(185, 116, 73)); /* Darkened gradient for hover */
  }
`;

const SignUpPrompt = styled.p`
  margin-top: 10px;
  text-align: center;
  font-size: 0.7rem;
  color: #333;
`;

const SignUpLink = styled.a`
  cursor: pointer;
  color: #a52a2a;
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
  border: 2px solid #ffffff
  
`;

const LogoText = styled.p`
  font-family: 'Poppins';
  font-size: 2rem;
  color: #ffffff;
  margin-top: 1rem;
  font-weight: 800;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  `;

const ErrorText = styled.p`
  color: red;
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
  color: #757575;
  font-size: 18px;
`;

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
  }
`;
