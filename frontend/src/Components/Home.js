import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import notoSansTagalog from '../Assests/NotoSansTagalog-Regular.ttf';
import logo1 from '../Assests/logo1.png';
import bay1 from '../Assests/bay1.png';
import bay2 from '../Assests/bay2.png';
import bay3 from '../Assests/bay3.png';
import bay4 from '../Assests/bay4.png';
import bay5 from '../Assests/bay5.png';
import bay6 from '../Assests/bay6.png';
import bay7 from '../Assests/bay7.png';
import bay8 from '../Assests/bay8.png';
import bay9 from '../Assests/bay9.png';
import LoginGame from './Games/src/LoginGame';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

  @font-face {
    font-family: 'NotoSansTagalog';
    src: url(${notoSansTagalog}) format('truetype');
    font-display: swap;
  }

  :root{
    /* DARKER / RICHER BACKGROUND so floating Baybayin images show up */
    --bg0: #2b1004;   /* deep cocoa */
    --bg1: #4a1706;   /* warm mahogany */
    --bg2: #8a2a08;   /* burnt sienna */

    --ink: #fff6eb;
    --muted: rgba(255,246,235,.72);

    --gold: #fbc417;
    --amber: #f59e0b;
    --rust: #c24010;
    --brick:#9a3000;
    --deep:#7a2100;

    --ring: rgba(251,196,23,.6);
    --ring2: rgba(0,0,0,.35);
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; overflow-x: hidden; background: var(--bg0); color: var(--ink); }
  button { font: inherit; }

  :focus-visible{
    outline: none;
    box-shadow: 0 0 0 3px var(--ring), 0 0 0 6px var(--ring2);
    border-radius: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;

const MODES = [
  {
    icon: '✍️',
    title: 'Write Mode',
    desc: 'Write the Baybayin equivalent of each Latin letter shown on screen',
    accent: '#fbc417', // brighter on dark bg
    bg: 'rgba(251,196,23,0.14)',
  },
  {
    icon: '👆',
    title: 'Tap Mode',
    desc: 'Tap the correct Baybayin character that matches the visual prompt',
    accent: '#fde68a',
    bg: 'rgba(253,230,138,0.12)',
  },
  {
    icon: '🔄',
    title: 'Translate Mode',
    desc: 'Multiple choice, character ID, typing & drag-and-drop challenges',
    accent: '#ffb36b',
    bg: 'rgba(255,179,107,0.12)',
  },
];

const rand = (min, max) => min + Math.random() * (max - min);

const HeroSection = () => {
  const navigate = useNavigate();
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToModes = () =>
    document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const modes = useMemo(() => MODES, []);

  const floatingImages = useMemo(() => {
    const base = [
      { src: bay1, top: '12%', left: '10%' },
      { src: bay2, top: '42%', left: '8%' },
      { src: bay3, top: '72%', left: '12%' },
      { src: bay4, top: '7%', left: '70%' },
      { src: bay5, top: '22%', left: '82%' },
      { src: bay6, top: '42%', left: '68%' },
      { src: bay7, top: '58%', left: '78%' },
      { src: bay8, top: '74%', left: '85%' },
      { src: bay9, top: '88%', left: '72%' },
    ];

    return base.map((img, i) => ({
      id: `bay-${i}`,
      ...img,
      widthPx: Math.round(rand(120, 190)),
      rotDeg: rand(-6, 6),
      floatDur: rand(8, 16),
      floatDelay: rand(0, 2.2),
      fadeDur: rand(4.2, 7.2),
      fadeDelay: rand(0, 2),
      // stronger base opacity (images were too faint on light bg)
      opacity: rand(0.28, 0.45),
      blur: rand(0, 0.8),
    }));
  }, []);

  return (
    <>
      <GlobalStyle />
      <PageRoot>
        {/* Navigation Bar */}
        <NavBar>
          <NavBrand>bAIguhit</NavBrand>
          <HamburgerBtn
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
          >
            <HamburgerLine />
            <HamburgerLine />
            <HamburgerLine />
          </HamburgerBtn>
        </NavBar>

        {/* Sidebar Overlay */}
        <SidebarOverlay $isOpen={isSidebarOpen} onClick={closeSidebar} />

        {/* Sidebar */}
        <Sidebar $isOpen={isSidebarOpen}>
          <SidebarHeader>
            <SidebarTitle>Menu</SidebarTitle>
            <CloseBtn
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              ✕
            </CloseBtn>
          </SidebarHeader>
          <SidebarNav>
            <SidebarLink
              as="a"
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                closeSidebar();
                window.location.href = '/about';
              }}
            >
              About
            </SidebarLink>
            <SidebarLink
              href="#modes"
              onClick={(e) => {
                e.preventDefault();
                closeSidebar();
                scrollToModes();
              }}
            >
              Explore Modes
            </SidebarLink>
          </SidebarNav>
        </Sidebar>
        <HeroWrap>
          <TopBar aria-hidden="true" />

          {/* Floating baybayin images layer */}
          <FloatingLayer aria-hidden="true">
            {floatingImages.map((img) => (
              <FloatingImage
                key={img.id}
                src={img.src}
                alt=""
                $top={img.top}
                $left={img.left}
                $w={img.widthPx}
                $rot={img.rotDeg}
                $floatDur={img.floatDur}
                $floatDelay={img.floatDelay}
                $fadeDur={img.fadeDur}
                $fadeDelay={img.fadeDelay}
                $opacity={img.opacity}
                $blur={img.blur}
              />
            ))}
          </FloatingLayer>

          {/* extra dark vignette to increase contrast */}
          <Vignette aria-hidden="true" />

          {/* subtle decorative orbs */}
          <OrbA aria-hidden="true" />
          <OrbB aria-hidden="true" />

          <HeroStage>
            <HeroCard>
              <HeroCopy>
                <CardTopLine aria-hidden="true" />

                <Eyebrow>ML-Powered · Philippine Baybayin</Eyebrow>

                <Title aria-label="bAIguhit">
                  <TB>b</TB>
                  <TAI>AI</TAI>
                  <TRest>guhit</TRest>
                </Title>

                <TitleRule aria-hidden="true" />

                <Tagline>
                  Revive the Ancient Script.{' '}
                  <TagBold>Master Baybayin through Play.</TagBold>
                </Tagline>

                <BodyText>
                  Practice writing, tapping, and translating Philippine Baybayin characters through ML-powered interactive
                  game modes — one stroke at a time.
                </BodyText>

                <Divider aria-hidden="true" />

                <CTARow>
                  <PlayBtn
                    type="button"
                    onClick={() => setIsGameModalOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={isGameModalOpen}
                  >
                    <BtnGlow aria-hidden="true" />
                    <BtnLabel>▶&nbsp; Start Playing</BtnLabel>
                  </PlayBtn>

                  <ExploreBtn type="button" onClick={scrollToModes}>
                    Explore Modes&nbsp;↓
                  </ExploreBtn>
                </CTARow>

                <StatRow role="list" aria-label="Highlights">
                  <StatItem role="listitem">
                    <SNum>3</SNum>
                    <SLab>Game Modes</SLab>
                  </StatItem>
                  <SDot aria-hidden="true" />
                  <StatItem role="listitem">
                    <SNum>ML</SNum>
                    <SLab>Powered</SLab>
                  </StatItem>
                  <SDot aria-hidden="true" />
                  <StatItem role="listitem">
                    <SNum>∞</SNum>
                    <SLab>Practice</SLab>
                  </StatItem>
                </StatRow>
              </HeroCopy>

              <HeroLogoPanel aria-label="Logo">
                <LogoAura aria-hidden="true" />
                <LogoFrame aria-hidden="true" />
                <LogoImg src={logo1} alt="bAIguhit logo" />
                <LogoCaption>Learn Baybayin with games</LogoCaption>
              </HeroLogoPanel>
            </HeroCard>
          </HeroStage>

          <ScrollCue
            type="button"
            onClick={scrollToModes}
            aria-label="Scroll to game modes section"
          >
            <Pip />
            <Pip $d=".16s" />
            <Pip $d=".32s" />
            <ScrollLabel>scroll</ScrollLabel>
          </ScrollCue>
        </HeroWrap>

        <ModesSection id="modes">
          <ModesTopBar aria-hidden="true" />
          <ModesInner>
            <ModesEyebrow>What you can do</ModesEyebrow>
            <ModesHeading>Three Ways to Learn Baybayin</ModesHeading>

            <ModesGrid>
              {modes.map((m, i) => (
                <ModeCard
                  key={m.title}
                  type="button"
                  $accent={m.accent}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => setIsGameModalOpen(true)}
                  aria-label={`${m.title}. ${m.desc}. Open game.`}
                >
                  <ModeStripe $accent={m.accent} aria-hidden="true" />
                  <ModeBody>
                    <ModeIconBox $bg={m.bg} $accent={m.accent} aria-hidden="true">
                      {m.icon}
                    </ModeIconBox>
                    <ModeTitle $accent={m.accent}>{m.title}</ModeTitle>
                    <ModeDesc>{m.desc}</ModeDesc>
                  </ModeBody>
                  <ModeFooter $accent={m.accent} aria-hidden="true">
                    →
                  </ModeFooter>
                </ModeCard>
              ))}
            </ModesGrid>
          </ModesInner>
        </ModesSection>

        {/* About Section */}
        <AboutSection>
          <AboutInner>
            <AboutEyebrow>Learn More</AboutEyebrow>
            <AboutHeading>About bAIguhit</AboutHeading>
            <AboutDescription>
              Discover the story behind bAIguhit — an ML-powered platform dedicated to reviving and preserving the ancient Philippine Baybayin script through engaging, interactive learning experiences.
            </AboutDescription>
            <MoreBtn type="button" onClick={() => navigate('/about')}>
              Learn More →
            </MoreBtn>
          </AboutInner>
        </AboutSection>
          <LoginGame
            isOpen={isGameModalOpen}
            toggleModal={() => setIsGameModalOpen(false)}
          />
      </PageRoot>
    </>
  );
};

export default HeroSection;

/* ═══════════════════════════
   KEYFRAMES
═══════════════════════════ */

const shimmer = keyframes`
  0%{background-position:-200% center}
  100%{background-position:200% center}
`;
const floatImg = keyframes`
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.035)}
`;
const fadeUp = keyframes`
  from{opacity:0;transform:translateY(22px)}
  to{opacity:1;transform:translateY(0)}
`;
const pipBounce = keyframes`
  0%,100%{transform:translateY(0);opacity:.4}
  50%{transform:translateY(5px);opacity:.85}
`;
const cardPop = keyframes`
  from{opacity:0;transform:translateY(14px) scale(.97)}
  to{opacity:1;transform:translateY(0) scale(1)}
`;
const haloBreath = keyframes`
  0%,100%{opacity:.5}
  50%{opacity:.9}
`;

/* Floating image animations */
const bayFade = keyframes`
  0%, 100% { opacity: 0.18; }
  50%      { opacity: 0.55; }
`;
const bayDrift = keyframes`
  0%, 100% { transform: translate(-50%, -50%) translateY(0)     rotate(var(--rot)); }
  50%      { transform: translate(-50%, -50%) translateY(-18px) rotate(var(--rot)); }
`;

/* ═══════════════════════════
   PAGE
═══════════════════════════ */

const PageRoot = styled.div`
  width: 100%;
  overflow-x: hidden;
  font-family: 'DM Sans', sans-serif;
`;

/* ═══════════════════════════
   NAVIGATION BAR
═══════════════════════════ */

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(180deg, rgba(42, 16, 4, 0.95) 0%, rgba(42, 16, 4, 0.85) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(251, 196, 23, 0.15);
`;

const NavBrand = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 900;
  background: linear-gradient(90deg, #fbc417, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
`;

const HamburgerBtn = styled.button`
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

const HamburgerLine = styled.span`
  width: 24px;
  height: 2px;
  background: #fbc417;
  border-radius: 1px;
  transition: all 0.3s;
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s, visibility 0.3s;
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  z-index: 1001;
  background: linear-gradient(180deg, #4a1706 0%, #2b1004 100%);
  border-left: 1px solid rgba(251, 196, 23, 0.15);
  padding: 80px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  transform: translateX(${({ $isOpen }) => ($isOpen ? 0 : '100%')});
  transition: transform 0.3s ease;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(251, 196, 23, 0.15);
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  color: #fbc417;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #fbc417;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SidebarLink = styled.a`
  color: #fff6eb;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  display: block;

  &:hover {
    background: rgba(251, 196, 23, 0.12);
    color: #fbc417;
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`;

/* ═══════════════════════════
   HERO
═══════════════════════════ */

const HeroWrap = styled.section`
  position: relative;
  min-height: 100vh;
  padding-top: 64px;

  /* darker base background for contrast */
  background:
    radial-gradient(circle at 18% 18%, rgba(251, 196, 23, 0.14) 0%, transparent 30%),
    radial-gradient(circle at 82% 24%, rgba(194, 64, 12, 0.14) 0%, transparent 32%),
    linear-gradient(160deg, var(--bg0) 0%, var(--bg1) 46%, var(--bg2) 100%);

  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Vignette = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 30%, transparent 0%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.42) 100%),
    linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.28));
`;

/* Floating images layer */
const FloatingLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const FloatingImage = styled.img`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $w }) => `${$w}px`};
  height: auto;
  transform: translate(-50%, -50%);
  opacity: ${({ $opacity }) => $opacity};

  /* boost contrast & visibility */
  filter: ${({ $blur }) =>
    `blur(${$blur}px) drop-shadow(0 10px 22px rgba(0,0,0,0.35)) brightness(1.15) contrast(1.2)`};

  /* try 'screen' too, but 'lighten' usually works well */
  mix-blend-mode: lighten;

  --rot: ${({ $rot }) => `${$rot}deg`};
  animation:
    ${bayFade} ${({ $fadeDur }) => $fadeDur}s ${({ $fadeDelay }) => $fadeDelay}s ease-in-out infinite,
    ${bayDrift} ${({ $floatDur }) => $floatDur}s ${({ $floatDelay }) => $floatDelay}s ease-in-out infinite;

  will-change: transform, opacity;

  @media (max-width: 720px) {
    opacity: ${({ $opacity }) => Math.min(0.3, $opacity)};
    width: ${({ $w }) => `${Math.max(84, Math.round($w * 0.72))}px`};
  }
`;

const OrbA = styled.div`
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  left: -180px;
  top: 18%;
  background: radial-gradient(circle, rgba(251,196,23,.16) 0%, transparent 62%);
  filter: blur(2px);
  pointer-events: none;
  z-index: 0;
`;

const OrbB = styled.div`
  position: absolute;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  right: -220px;
  top: 8%;
  background: radial-gradient(circle, rgba(194,64,12,.14) 0%, transparent 62%);
  filter: blur(2px);
  pointer-events: none;
  z-index: 0;
`;

const HeroStage = styled.div`
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 96px 24px 88px;
  display: flex;
  justify-content: center;

  @media (max-width: 900px) {
    padding: 86px 20px 102px;
  }
`;

const HeroCard = styled.div`
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1080px;
  display: flex;
  align-items: stretch;
  gap: clamp(24px, 4vw, 48px);
  padding: 0;
  margin: 0;
  animation: ${fadeUp} 0.75s 0.1s ease both;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  padding: 44px 0 40px;

  /* add subtle glass panel for readability on darker bg */
  background: linear-gradient(180deg, rgba(0,0,0,0.24), rgba(0,0,0,0.10));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 46px rgba(0,0,0,0.22);
  padding-left: 28px;
  padding-right: 28px;

  @media (max-width: 900px) {
    width: 100%;
    padding: 22px 18px;
    align-items: center;
    text-align: center;
  }
`;

const HeroLogoPanel = styled.div`
  position: relative;
  z-index: 1;
  flex: 0 0 min(36vw, 360px);
  display: grid;
  place-items: center;
  min-height: 420px;
  padding: 44px 0 40px;

  @media (max-width: 900px) {
    width: 100%;
    min-height: 0;
    padding: 12px 0 0;
  }
`;

const LogoAura = styled.div`
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(100%, 360px);
  height: min(100%, 360px);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(251, 196, 23, 0.18) 0%, rgba(194, 64, 12, 0.08) 38%, transparent 72%);
  filter: blur(4px);
  pointer-events: none;
  animation: ${haloBreath} 4.2s ease-in-out infinite;
`;

const LogoFrame = styled.div`
  position: absolute;
  width: min(100%, 332px);
  aspect-ratio: 1/1;
  border-radius: 999px;
  border: none;
  box-shadow: none;
  pointer-events: none;
`;

const LogoImg = styled.img`
  position: relative;
  z-index: 1;
  width: min(100%, 320px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
  filter: drop-shadow(0 20px 44px rgba(0, 0, 0, 0.35));
  animation: ${floatImg} 14s ease-in-out infinite;
`;

const LogoCaption = styled.div`
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,.72);
`;

/* Shimmer top bar */
const TopBar = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  z-index: 10;
  background: linear-gradient(90deg, #fde68a, #fbc417, #c24010, #fbc417, #fde68a);
  background-size: 300% 100%;
  animation: ${shimmer} 4s linear infinite;
`;

/* Coloured accent line at top of card */
const CardTopLine = styled.div`
  position: absolute;
  top: 0; left: 18px; right: 18px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, #fbc417, #c24010, #9a3000, #c24010, #fbc417);
  background-size: 300% 100%;
  animation: ${shimmer} 3.5s linear infinite;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(253, 230, 138, 0.68);
`;

const Title = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 1;
`;

const TB = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  color: #fde68a;
`;

const TAI = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
`;

const TRest = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  color: rgba(255,246,235,.92);
`;

const TitleRule = styled.div`
  width: 50px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(251,196,23,.55), transparent);
  border-radius: 2px;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(15px, 2vw, 18px);
  font-weight: 400;
  font-style: italic;
  color: rgba(255,246,235,.86);
  line-height: 1.55;
`;

const TagBold = styled.span`
  font-style: normal;
  font-weight: 800;
  color: #fbc417;
`;

const BodyText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255,246,235,.75);
  max-width: 460px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
`;

const CTARow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 900px){
    width: 100%;
  }
`;

const PlayBtn = styled.button`
  position: relative;
  height: 50px;
  padding: 0 32px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #fde68a 0%, #fbc417 45%, #f59e0b 100%);
  box-shadow: 0 12px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,.22);
  transition: transform .15s, box-shadow .15s;

  &:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(0,0,0,.40); }
  &:active { transform: translateY(1px); }
`;

const BtnGlow = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  background-size: 200% 100%;
  animation: ${shimmer} 2.4s linear infinite;
`;

const BtnLabel = styled.span`
  position: relative;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .3px;
  color: #3d2401;
`;

const ExploreBtn = styled.button`
  height: 50px;
  padding: 0 26px;
  border-radius: 12px;
  border: 1.5px solid rgba(251, 196, 23, 0.42);
  background: rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .3px;
  color: rgba(255,246,235,.92);
  transition: all .18s ease;

  &:hover { background: rgba(0,0,0,.26); border-color: rgba(251,196,23,.7); transform: translateY(-2px); }
  &:active { transform: translateY(1px); }
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(0,0,0,0.18);
  border: 1px solid rgba(255,255,255,0.10);
  width: fit-content;

  @media (max-width: 900px){
    width: 100%;
    justify-content: center;
  }
`;

const StatItem = styled.div`
  flex: 1;
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const SNum = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 900;
  color: #fbc417;
  line-height: 1;
`;

const SLab = styled.div`
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: rgba(255,246,235,.70);
`;

const SDot = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,.14);
`;

const ScrollCue = styled.button`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: .6;
  transition: opacity .2s;

  &:hover { opacity: 1; }
`;

const Pip = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(253, 230, 138, 0.92);
  animation: ${pipBounce} 1.4s ${({ $d }) => $d || '0s'} ease-in-out infinite;
`;

const ScrollLabel = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(253,230,138,.75);
  margin-top: 3px;
`;

/* ═══════════════════════════
   MODES SECTION (updated to complement dark hero)
═══════════════════════════ */

const ModesSection = styled.section`
  width: 100%;
  position: relative;
  background:
    radial-gradient(circle at 20% 15%, rgba(251,196,23,0.10) 0%, transparent 45%),
    radial-gradient(circle at 85% 40%, rgba(194,64,12,0.10) 0%, transparent 46%),
    linear-gradient(180deg, #2b1004 0%, #3b1405 45%, #1f0b03 100%);
  border-top: 1px solid rgba(251,196,23,0.12);
`;

const ModesTopBar = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #fde68a, #fbc417, #c24010, #fbc417, #fde68a);
  background-size: 300% 100%;
  animation: ${shimmer} 3.5s linear infinite;
`;

const ModesInner = styled.div`
  width: 88%;
  max-width: 980px;
  margin: 0 auto;
  padding: 66px 0 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
`;

const ModesEyebrow = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.6px;
  text-transform: uppercase;
  color: rgba(253,230,138,0.70);
`;

const ModesHeading = styled.h2`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: clamp(20px, 2.7vw, 30px);
  font-weight: 900;
  text-align: center;

  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fde68a);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
`;

const ModesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
`;

const ModeCard = styled.button`
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  padding: 0;
  text-align: left;
  cursor: pointer;

  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(251,196,23,0.14);
  backdrop-filter: blur(10px);

  box-shadow:
    0 14px 40px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.10);

  display: flex;
  flex-direction: column;

  animation: ${cardPop} 0.5s ease both;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;

  &:hover {
    transform: translateY(-7px);
    border-color: rgba(251,196,23,0.34);
    box-shadow:
      0 22px 64px rgba(0,0,0,0.42),
      0 0 0 1px rgba(251,196,23,0.20) inset;
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const ModeStripe = styled.div`
  height: 4px;
  background: ${({ $accent }) => $accent};
  flex-shrink: 0;
`;

const ModeBody = styled.div`
  padding: 22px 20px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModeIconBox = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;

  /* gold-tinted tile so emoji stands out on dark bg */
  background: linear-gradient(135deg, rgba(253,230,138,0.16), rgba(251,196,23,0.10));
  border: 1px solid rgba(251,196,23,0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
`;

const ModeTitle = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 900;
  color: rgba(255,246,235,0.92);
  letter-spacing: 0.2px;
`;

const ModeDesc = styled.div`
  font-size: 12.5px;
  line-height: 1.65;
  color: rgba(255,246,235,0.72);
`;

const ModeFooter = styled.div`
  padding: 10px 20px 16px;
  text-align: right;
  font-size: 18px;
  color: rgba(251,196,23,0.75);
  opacity: .6;
  transition: transform .2s ease, opacity .2s ease;

  ${ModeCard}:hover & { transform: translateX(6px); opacity: 1; }
`;

/* ═══════════════════════════
   ABOUT SECTION
═══════════════════════════ */

const AboutSection = styled.section`
  width: 100%;
  position: relative;
  background: linear-gradient(180deg, #1f0b03 0%, #2b1004 45%, #3b1405 100%);
  border-top: 1px solid rgba(251, 196, 23, 0.12);
  padding: 80px 24px;
`;

const AboutInner = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: ${fadeUp} 0.6s ease-out;
`;

const AboutEyebrow = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2.8px;
  text-transform: uppercase;
  color: rgba(253, 230, 138, 0.65);
`;

const AboutHeading = styled.h2`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: clamp(24px, 2.5vw, 36px);
  font-weight: 900;
  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.35));
`;

const AboutDescription = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(255, 246, 235, 0.82);
  max-width: 600px;
`;

const MoreBtn = styled.button`
  margin-top: 16px;
  padding: 14px 36px;
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #fff6eb;
  background: linear-gradient(135deg, rgba(251, 196, 23, 0.3), rgba(245, 158, 11, 0.2));
  border: 1.5px solid rgba(251, 196, 23, 0.5);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(251, 196, 23, 0.15);

  &:hover {
    background: linear-gradient(135deg, rgba(251, 196, 23, 0.5), rgba(245, 158, 11, 0.3));
    border-color: rgba(251, 196, 23, 0.8);
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(251, 196, 23, 0.25);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(251, 196, 23, 0.8);
    outline-offset: 2px;
  }
`;