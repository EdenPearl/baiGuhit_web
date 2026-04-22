import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from '../../../Assests/logo1.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useRegister from '../../../Hooks/RegisterHooks/useRegister';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterModal = ({ isOpen, openLoginModal }) => {
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
  }, [success, error, setSuccess, setError]);

  if (!isOpen) return null;

  return (
    <Modal>
      <StyledToast />
      <ModalContent>

        {/* Left — brand (same as LoginGame's BrandSide) */}
        <BrandSide>
          <BrandTopLine />
          <BrandOrb />

          <LogoCircle>
            <LogoImg src={Logo} alt="bAIguhit" />
          </LogoCircle>

          <BrandName>
            <B1>b</B1><B2>AI</B2><B3>guhit</B3>
          </BrandName>

          <BrandLine />

          <BrandTag>Revive the Ancient Script.<br />Master Baybayin through Play.</BrandTag>
        </BrandSide>

        {/* Right — form */}
        <FormSide>
          <CloseBtn onClick={openLoginModal}>✕</CloseBtn>

          <FormTitle>Create new account</FormTitle>
          <FormSub>Join us! Fill in your details below.</FormSub>

          <Form onSubmit={handleSubmit}>
            <Field>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Password</Label>
              <PwWrap>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <EyeBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </EyeBtn>
              </PwWrap>
            </Field>

            <Field>
              <Label>Confirm Password</Label>
              <PwWrap>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <EyeBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </EyeBtn>
              </PwWrap>
            </Field>

            <SubmitBtn type="submit">
              <Shine />
              Sign Up
            </SubmitBtn>

            <OrRow><OrLine /><OrText>or</OrText><OrLine /></OrRow>

            <Prompt>
              Already have an account?{' '}
              <PromptLink onClick={openLoginModal}>Login here</PromptLink>
            </Prompt>
          </Form>
        </FormSide>

      </ModalContent>
    </Modal>
  );
};

export default RegisterModal;

/* ═══════════════════════════
   KEYFRAMES
═══════════════════════════ */

const shimmer = keyframes`
  0%   { background-position: -200% center }
  100% { background-position:  200% center }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(.95) translateY(12px) }
  to   { opacity: 1; transform: none }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0) }
  50%       { transform: translateY(-6px) }
`;
const haloBreath = keyframes`
  0%, 100% { opacity: .45 }
  50%       { opacity: .9 }
`;

/* ═══════════════════════════
   MODAL BACKDROP
═══════════════════════════ */

const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, rgba(43,16,4,.88), rgba(74,23,6,.88));
  backdrop-filter: blur(10px);
  padding: 16px;
`;

/* ═══════════════════════════
   CARD
═══════════════════════════ */

const ModalContent = styled.div`
  display: flex;
  width: min(760px, 100%);
  height: min(500px, 90vh);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(154, 48, 0, .30);
  box-shadow:
    0 24px 60px rgba(0,0,0,.50),
    0 0 60px rgba(194,64,12,.10);
  animation: ${popIn} .4s cubic-bezier(.34,1.56,.64,1) both;
`;

/* ═══════════════════════════
   BRAND SIDE
   Warm parchment/amber — matches LoginGame exactly
═══════════════════════════ */

const BrandSide = styled.div`
  position: relative;
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #f0d5a0 0%, #e4be7a 45%, #c8924a 100%);
  border-right: 1px solid rgba(122,33,0,.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 36px 28px;
  overflow: hidden;

  @media (max-width: 560px) { display: none; }
`;

const BrandTopLine = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #9a3000, #c24010, #fbc417, #c24010, #9a3000);
  background-size: 300% 100%;
  animation: ${shimmer} 3.5s linear infinite;
`;

const BrandOrb = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(154,48,0,.20) 0%, transparent 68%);
  pointer-events: none;
  animation: ${haloBreath} 4.2s ease-in-out infinite;
`;

const LogoCircle = styled.div`
  position: relative;
  z-index: 1;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(122,33,0,.28);
  box-shadow:
    0 8px 28px rgba(122,33,0,.22),
    0 0 0 6px rgba(194,64,12,.10);
  animation: ${float} 4s ease-in-out infinite;
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const BrandName = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  line-height: 1;
`;

const sharedFont = `
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 900;
  text-transform: none;
  font-variant: normal;
  font-variant-caps: normal;
  font-feature-settings: 'smcp' 0, 'c2sc' 0;
`;

const B1 = styled.span`
  ${sharedFont}
  color: #7a2100;
`;

const B2 = styled.span`
  ${sharedFont}
  background: linear-gradient(90deg, #c24010, #7a2100, #c24010);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
`;

const B3 = styled.span`
  ${sharedFont}
  color: rgba(122,33,0,.48);
`;

const BrandLine = styled.div`
  position: relative;
  z-index: 1;
  width: 50px;
  height: 1px;
  background: rgba(122,33,0,.20);
`;

const BrandTag = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  text-align: center;
  font-family: 'Georgia', serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1.75;
  color: rgba(90,20,0,.68);
`;

/* ═══════════════════════════
   FORM SIDE — dark, matches LoginGame
═══════════════════════════ */

const FormSide = styled.div`
  flex: 1;
  background: linear-gradient(160deg, #2b1004 0%, #4a1706 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 36px;
  position: relative;
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 18px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: rgba(255,246,235,.45);
  transition: color .15s, transform .15s;

  &:hover { color: #fbc417; transform: rotate(90deg); }
`;

const FormTitle = styled.h2`
  margin: 0 0 4px;
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 900;
  color: #fff6eb;
  text-transform: none;
  font-variant: normal;
  font-variant-caps: normal;
  font-feature-settings: 'smcp' 0, 'c2sc' 0;
`;

const FormSub = styled.p`
  margin: 0 0 20px;
  font-family: sans-serif;
  font-size: 12px;
  color: rgba(255,246,235,.55);
`;

const Form  = styled.form`display: flex; flex-direction: column; gap: 12px;`;
const Field = styled.div`display: flex; flex-direction: column; gap: 5px;`;

const Label = styled.label`
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: #fde68a;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(251,196,23,.22);
  background: rgba(27,10,2,.55);
  font-family: sans-serif;
  font-size: 13px;
  color: #fff6eb;
  outline: none;
  box-sizing: border-box;
  transition: border-color .15s, box-shadow .15s, background .15s;

  &::placeholder { color: rgba(255,246,235,.28); }
  &:focus {
    border-color: rgba(251,196,23,.55);
    box-shadow: 0 0 0 3px rgba(251,196,23,.12);
    background: rgba(27,10,2,.75);
  }
`;

const PwWrap = styled.div`position: relative;`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,246,235,.38);
  font-size: 14px;
  transition: color .15s;

  &:hover { color: #fbc417; }
`;

const Shine = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
  background-size: 200% 100%;
  animation: ${shimmer} 2.5s linear infinite;
`;

const SubmitBtn = styled.button`
  position: relative;
  width: 100%;
  height: 46px;
  overflow: hidden;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, #c24010, #9a3000);
  color: #fff6eb;
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .3px;
  text-transform: none;
  font-variant: normal;
  font-variant-caps: normal;
  font-feature-settings: 'smcp' 0, 'c2sc' 0;
  box-shadow: 0 4px 18px rgba(194,64,12,.30);
  transition: transform .15s, box-shadow .15s;

  &:hover  { transform: translateY(-2px); box-shadow: 0 7px 24px rgba(194,64,12,.42); }
  &:active { transform: translateY(1px); }
`;

const OrRow  = styled.div`display: flex; align-items: center; gap: 8px;`;
const OrLine = styled.div`flex: 1; height: 1px; background: rgba(251,196,23,.14);`;
const OrText = styled.span`
  font-family: sans-serif;
  font-size: 10px;
  color: rgba(255,246,235,.38);
  letter-spacing: .4px;
`;

const Prompt = styled.p`
  margin: 0;
  text-align: center;
  font-family: sans-serif;
  font-size: 12px;
  color: rgba(255,246,235,.60);
`;

const PromptLink = styled.span`
  font-weight: 700;
  color: #fbc417;
  cursor: pointer;

  &:hover { opacity: .8; text-decoration: underline; }
`;

const StyledToast = styled(ToastContainer)`
  .Toastify__toast {
    font-family: sans-serif;
    font-size: 12px;
    border-radius: 10px;
    background: #2b1004;
    color: #fff6eb;
    border: 1px solid rgba(251,196,23,.22);
  }
  .Toastify__progress-bar { background: #fbc417; }
`;