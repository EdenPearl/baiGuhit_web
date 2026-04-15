import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Facebook from '../../../Assests/facebookicon.svg';
import Google from '../../../Assests/googleicon.svg';
import Logo from '../../../Assests/logo1.png';
import RegisterModal from './RegisterGame';
import Loader from './CustomizeLoaderGame';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useLogin from '../../../Hooks/LoginHooks/useLogin';
import usePasswordToggle from '../../../Hooks/LoginHooks/usePasswordToggle';
import useToggle from '../../../Hooks/LoginHooks/useToggle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginModal = ({ isOpen, toggleModal }) => {
  const { email, setEmail, password, setPassword, error, setError, loading, handleLogin } = useLogin('game');
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
        <Backdrop>
          <StyledToast />
          <Card>

            {/* Left — brand */}
            <BrandSide>
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
              <CloseBtn onClick={toggleModal}>✕</CloseBtn>

              <FormTitle>Sign in</FormTitle>
              <FormSub>Welcome back! Enter your details.</FormSub>

              <Form onSubmit={handleLogin}>
                <Field>
                  <Label>Email</Label>
                  <Input
                    type="text"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <Label>Password</Label>
                  <PwWrap>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <EyeBtn type="button" onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </EyeBtn>
                  </PwWrap>
                </Field>

                <Forgot href="#">Forgot password?</Forgot>

                <SubmitBtn type="submit">
                  <Shine />
                  Sign In
                </SubmitBtn>

                <OrRow><OrLine /><OrText>or</OrText><OrLine /></OrRow>

                <SocialRow>
                  <SocialBtn href="#"><SIcon src={Facebook} alt="Facebook" /></SocialBtn>
                  <SocialBtn href="#"><SIcon src={Google} alt="Google" /></SocialBtn>
                </SocialRow>

                <Prompt>
                  No account?{' '}
                  <PromptLink onClick={openSignUpModal}>Create one</PromptLink>
                </Prompt>
              </Form>
            </FormSide>

          </Card>
        </Backdrop>
      ) : (
        <RegisterModal isOpen={true} openLoginModal={openLoginModal} />
      )}
    </>
  );
};

export default LoginModal;

/* keyframes */
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;
const popIn   = keyframes`from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:none}`;
const float   = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}`;

/* Backdrop */
const Backdrop = styled.div`
  position:fixed;inset:0;z-index:1000;
  display:flex;align-items:center;justify-content:center;
  background:rgba(20,5,0,.65);backdrop-filter:blur(6px);
  padding:16px;
`;

/* Card */
const Card = styled.div`
  display:flex;
  width:min(760px,100%);
  height:min(500px,90vh);
  border-radius:20px;overflow:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.45);
  animation:${popIn} .4s cubic-bezier(.34,1.56,.64,1) both;
`;

/* ── Brand side ── */
const BrandSide = styled.div`
  width:280px;flex-shrink:0;
  background:linear-gradient(155deg,#7a2100 0%,#9a3000 40%,#c24010 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:36px 28px;
  @media(max-width:560px){display:none;}
`;

const LogoCircle = styled.div`
  width:88px;height:88px;border-radius:50%;overflow:hidden;
  border:2px solid rgba(251,196,23,.45);
  box-shadow:0 8px 28px rgba(0,0,0,.35);
  animation:${float} 4s ease-in-out infinite;
`;
const LogoImg = styled.img`width:100%;height:100%;object-fit:cover;display:block;`;

const BrandName = styled.div`display:flex;align-items:baseline;line-height:1;`;
const B1 = styled.span`font-family:'Cinzel',serif;font-size:30px;font-weight:900;color:#fff8ee;`;
const B2 = styled.span`
  font-family:'Cinzel',serif;font-size:30px;font-weight:900;
  background:linear-gradient(90deg,#fde68a,#fbc417,#fde68a);
  background-size:300% 100%;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:${shimmer} 3s linear infinite;
`;
const B3 = styled.span`font-family:'Cinzel',serif;font-size:30px;font-weight:900;color:rgba(255,245,220,.55);`;

const BrandLine = styled.div`width:50px;height:1px;background:rgba(251,196,23,.35);`;
const BrandTag  = styled.p`
  margin:0;text-align:center;font-family:'Georgia',serif;
  font-size:12px;font-style:italic;line-height:1.7;
  color:rgba(255,245,215,.65);
`;

/* ── Form side ── */
const FormSide = styled.div`
  flex:1;background:#fff;
  display:flex;flex-direction:column;justify-content:center;
  padding:40px 36px;position:relative;
  overflow-y:auto;
`;

const CloseBtn = styled.button`
  position:absolute;top:16px;right:18px;
  background:none;border:none;cursor:pointer;
  font-size:16px;color:#aaa;
  transition:color .15s,transform .15s;
  &:hover{color:#c24010;transform:rotate(90deg);}
`;

const FormTitle = styled.h2`
  margin:0 0 4px;font-family:'Cinzel',serif;
  font-size:20px;font-weight:900;color:#3d1a06;
`;
const FormSub = styled.p`
  margin:0 0 20px;font-family:sans-serif;
  font-size:12px;color:rgba(107,58,31,.5);
`;

const Form  = styled.form`display:flex;flex-direction:column;gap:12px;`;
const Field = styled.div`display:flex;flex-direction:column;gap:5px;`;
const Label = styled.label`
  font-family:sans-serif;font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:.5px;color:#5a2a0a;
`;

const Input = styled.input`
  width:100%;padding:11px 14px;
  border-radius:10px;border:1.5px solid rgba(194,64,12,.15);
  background:#faf7f5;font-family:sans-serif;font-size:13px;color:#3d1a06;
  outline:none;transition:border-color .15s,box-shadow .15s;
  &::placeholder{color:rgba(107,58,31,.3);}
  &:focus{border-color:rgba(194,64,12,.45);box-shadow:0 0 0 3px rgba(194,64,12,.07);background:#fff;}
`;

const PwWrap = styled.div`position:relative;`;
const EyeBtn = styled.button`
  position:absolute;right:12px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;
  color:rgba(107,58,31,.4);font-size:14px;
  &:hover{color:#c24010;}
`;

const Forgot = styled.a`
  font-family:sans-serif;font-size:11px;font-weight:600;
  color:rgba(154,48,0,.5);text-decoration:none;align-self:flex-end;margin-top:-4px;
  &:hover{color:#c24010;text-decoration:underline;}
`;

const Shine = styled.span`
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
  background-size:200% 100%;animation:${shimmer} 2.5s linear infinite;
`;
const SubmitBtn = styled.button`
  position:relative;width:100%;height:46px;overflow:hidden;
  border:none;border-radius:10px;cursor:pointer;
  background:linear-gradient(135deg,#c24010,#9a3000);
  color:#fff;font-family:'Cinzel',serif;font-size:13px;font-weight:700;letter-spacing:.3px;
  box-shadow:0 4px 16px rgba(194,64,12,.28);
  transition:transform .15s,box-shadow .15s;
  &:hover{transform:translateY(-2px);box-shadow:0 7px 22px rgba(194,64,12,.38);}
  &:active{transform:translateY(1px);}
`;

const OrRow  = styled.div`display:flex;align-items:center;gap:8px;`;
const OrLine = styled.div`flex:1;height:1px;background:rgba(0,0,0,.08);`;
const OrText = styled.span`font-family:sans-serif;font-size:10px;color:rgba(0,0,0,.28);letter-spacing:.4px;`;

const SocialRow = styled.div`display:flex;justify-content:center;gap:10px;`;
const SocialBtn = styled.a`
  width:42px;height:42px;border-radius:10px;
  border:1.5px solid rgba(0,0,0,.1);background:#faf7f5;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;text-decoration:none;
  transition:all .15s;
  &:hover{border-color:rgba(194,64,12,.3);background:#fff;transform:translateY(-2px);}
`;
const SIcon = styled.img`width:20px;height:20px;`;

const Prompt = styled.p`
  margin:0;text-align:center;
  font-family:sans-serif;font-size:12px;color:#6b3a1f;
`;
const PromptLink = styled.span`
  font-weight:700;color:#c24010;cursor:pointer;
  &:hover{text-decoration:underline;}
`;

const StyledToast = styled(ToastContainer)`
  .Toastify__toast{font-family:sans-serif;font-size:12px;border-radius:10px;}
`;