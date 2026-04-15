import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import notoSansTagalog from '../Assests/NotoSansTagalog-Regular.ttf';
import logo1 from '../Assests/logo1.png';
import LoginGame from './Games/src/LoginGame';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

  @font-face {
    font-family: 'NotoSansTagalog';
    src: url(${notoSansTagalog}) format('truetype');
    font-display: swap;
  }

  :root{
    --bg0: #fff8f2;
    --bg1: #fff0e5;
    --bg2: #ffe6d6;

    --ink: #3d1a06;
    --muted: rgba(61,26,6,.62);

    --gold: #fbc417;
    --amber: #f59e0b;
    --rust: #c24010;
    --brick:#9a3000;
    --deep:#7a2100;

    --ring: rgba(251,196,23,.55);
    --ring2: rgba(0,0,0,.28);
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; overflow-x: hidden; background: var(--bg0); color: var(--ink); }
  button { font: inherit; }

  /* Accessible focus ring everywhere */
  :focus-visible{
    outline: none;
    box-shadow: 0 0 0 3px var(--ring), 0 0 0 6px var(--ring2);
    border-radius: 12px;
  }

  /* Reduce motion */
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
    accent: '#c24010',
    bg: '#fff4ec',
  },
  {
    icon: '👆',
    title: 'Tap Mode',
    desc: 'Tap the correct Baybayin character that matches the visual prompt',
    accent: '#9a3000',
    bg: '#fff1e8',
  },
  {
    icon: '🔄',
    title: 'Translate Mode',
    desc: 'Multiple choice, character ID, typing & drag-and-drop challenges',
    accent: '#7a2100',
    bg: '#ffeee5',
  },
];

const HeroSection = () => {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  const scrollToModes = () => document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' });

  // small perf: stable list instance
  const modes = useMemo(() => MODES, []);

  return (
    <>
      <GlobalStyle />
      <PageRoot>
        {/* ══════════ HERO ══════════ */}
        <HeroWrap>
          <TopBar aria-hidden="true" />

          {/* subtle decorative orbs */}
          <OrbA aria-hidden="true" />
          <OrbB aria-hidden="true" />

          <HeroStage>
            <HeroCard>
              <HeroCopy>
                <CardTopLine aria-hidden="true" />

                <Eyebrow>AI-Powered · Philippine Baybayin</Eyebrow>

                <Title aria-label="bAIguhit">
                  <TB>b</TB>
                  <TAI>AI</TAI>
                  <TRest>guhit</TRest>
                </Title>

                <TitleRule aria-hidden="true" />

                <Tagline>
                  Revive the Ancient Script. <TagBold>Master Baybayin through Play.</TagBold>
                </Tagline>

                <BodyText>
                  Practice writing, tapping, and translating Philippine Baybayin characters through AI-powered interactive
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
                    <SNum>AI</SNum>
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

          <ScrollCue type="button" onClick={scrollToModes} aria-label="Scroll to game modes section">
            <Pip />
            <Pip $d=".16s" />
            <Pip $d=".32s" />
            <ScrollLabel>scroll</ScrollLabel>
          </ScrollCue>
        </HeroWrap>

        {/* ══════════ MODES ══════════ */}
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
                  <ModeFooter $accent={m.accent} aria-hidden="true">→</ModeFooter>
                </ModeCard>
              ))}
            </ModesGrid>
          </ModesInner>
        </ModesSection>

        {isGameModalOpen && (
          <LoginGame isOpen={isGameModalOpen} toggleModal={() => setIsGameModalOpen(false)} />
        )}
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

/* ═══════════════════════════
   PAGE
═══════════════════════════ */

const PageRoot = styled.div`
  width: 100%;
  overflow-x: hidden;
  font-family: 'DM Sans', sans-serif;
`;

/* ═══════════════════════════
   HERO
═══════════════════════════ */

const HeroWrap = styled.section`
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 18%, rgba(251, 196, 23, 0.18) 0%, transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(194, 64, 12, 0.16) 0%, transparent 30%),
    linear-gradient(160deg, var(--bg0) 0%, var(--bg1) 46%, var(--bg2) 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const OrbA = styled.div`
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  left: -180px;
  top: 18%;
  background: radial-gradient(circle, rgba(251,196,23,.18) 0%, transparent 62%);
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

  @media (max-width: 900px) {
    width: 100%;
    padding: 24px 0 8px;
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
  border: 1px solid rgba(194,64,12,.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55);
  pointer-events: none;
`;

const LogoImg = styled.img`
  position: relative;
  z-index: 1;
  width: min(100%, 320px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
  filter: drop-shadow(0 14px 28px rgba(122, 33, 0, 0.16));
  animation: ${floatImg} 14s ease-in-out infinite;
`;

const LogoCaption = styled.div`
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(154,48,0,.55);
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
  top: 0; left: 24px; right: 24px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, #fbc417, #c24010, #9a3000, #c24010, #fbc417);
  background-size: 300% 100%;
  animation: ${shimmer} 3.5s linear infinite;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(154, 48, 0, 0.6);
`;

/* Wordmark */
const Title = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 1;
`;

const TB = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  color: #c24010;
`;

const TAI = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  background: linear-gradient(90deg, #c24010, #fbc417, #f59e0b, #fbc417, #c24010);
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
  color: #3d1a06;
`;

const TitleRule = styled.div`
  width: 50px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(194,64,12,.4), transparent);
  border-radius: 2px;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(15px, 2vw, 18px);
  font-weight: 400;
  font-style: italic;
  color: rgba(61, 26, 6, 0.72);
  line-height: 1.55;
`;

const TagBold = styled.span`
  font-style: normal;
  font-weight: 700;
  color: #c24010;
`;

const BodyText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(61, 26, 6, 0.62);
  max-width: 460px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(194,64,12,.15), transparent);
`;

/* CTA */
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
  background: linear-gradient(135deg, #c24010 0%, #9a3000 55%, #7a2100 100%);
  box-shadow: 0 5px 20px rgba(194, 64, 12, 0.38), inset 0 1px 0 rgba(255,255,255,.14);
  transition: transform .15s, box-shadow .15s;

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(194,64,12,.48); }
  &:active { transform: translateY(1px); }
`;

const BtnGlow = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
  background-size: 200% 100%;
  animation: ${shimmer} 2.4s linear infinite;
`;

const BtnLabel = styled.span`
  position: relative;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .3px;
  color: #fff;
`;

const ExploreBtn = styled.button`
  height: 50px;
  padding: 0 26px;
  border-radius: 12px;
  border: 1.5px solid rgba(194, 64, 12, 0.35);
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .3px;
  color: #9a3000;
  transition: all .18s ease;

  &:hover { background: rgba(255,255,255,.75); border-color: rgba(194,64,12,.6); transform: translateY(-2px); }
  &:active { transform: translateY(1px); }
`;

/* Stats */
const StatRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(194, 64, 12, 0.06);
  border: 1px solid rgba(194, 64, 12, 0.12);
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
  color: #c24010;
  line-height: 1;
`;

const SLab = styled.div`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: rgba(154,48,0,.5);
`;

const SDot = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(194,64,12,.15);
`;

/* Scroll cue */
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
  opacity: .55;
  transition: opacity .2s;

  &:hover { opacity: 1; }
`;

const Pip = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(253, 230, 138, 0.85);
  animation: ${pipBounce} 1.4s ${({ $d }) => $d || '0s'} ease-in-out infinite;
`;

const ScrollLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(253,230,138,.6);
  margin-top: 3px;
`;

/* ═══════════════════════════
   MODES SECTION
═══════════════════════════ */

const ModesSection = styled.section`
  width: 100%;
  background: linear-gradient(160deg, #fef8f3 0%, #fff4ec 50%, #ffeedd 100%);
  border-top: 1px solid rgba(194, 64, 12, 0.07);
`;

const ModesTopBar = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #fbc417, #c24010, #9a3000, #c24010, #fbc417);
  background-size: 300% 100%;
  animation: ${shimmer} 3.5s linear infinite;
`;

const ModesInner = styled.div`
  width: 88%;
  max-width: 960px;
  margin: 0 auto;
  padding: 58px 0 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
`;

const ModesEyebrow = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(194, 64, 12, 0.42);
`;

const ModesHeading = styled.h2`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: clamp(17px, 2.5vw, 26px);
  font-weight: 700;
  color: #3d1a06;
  text-align: center;
`;

const ModesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
`;

const ModeCard = styled.button`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(194, 64, 12, 0.09);
  box-shadow: 0 2px 12px rgba(194, 64, 12, 0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  animation: ${cardPop} 0.5s ease both;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
  text-align: left;
  padding: 0;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 14px 36px rgba(194, 64, 12, 0.13);
    border-color: ${({ $accent }) => `${$accent}44`};
  }
`;

const ModeStripe = styled.div`
  height: 4px;
  background: ${({ $accent }) => $accent};
  flex-shrink: 0;
`;

const ModeBody = styled.div`
  padding: 24px 20px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModeIconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $accent }) => `${$accent}20`};
  flex-shrink: 0;
`;

const ModeTitle = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $accent }) => $accent};
`;

const ModeDesc = styled.div`
  font-size: 12.5px;
  line-height: 1.65;
  color: #6b3a1f;
  opacity: .82;
`;

const ModeFooter = styled.div`
  padding: 10px 20px 16px;
  text-align: right;
  font-size: 16px;
  color: ${({ $accent }) => $accent};
  opacity: .4;
  transition: transform .2s, opacity .2s;

  ${ModeCard}:hover & { transform: translateX(5px); opacity: 1; }
`;