import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import notoSansTagalog from '../Assests/NotoSansTagalog-Regular.ttf';
import logo1 from '../Assests/logo1.png';
import LoginGame from './Games/src/LoginGame';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
  @font-face {
    font-family: 'NotoSansTagalog';
    src: url(${notoSansTagalog}) format('truetype');
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; overflow-x: hidden; }
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

/* ─────────────────────────── */

const HeroSection = () => {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  const scrollToModes = () =>
    document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <GlobalStyle />
      <PageRoot>

        {/* ══════════ HERO ══════════ */}
        <HeroWrap>
          {/* Shimmer accent bar */}
          <TopBar />

          <HeroStage>
            <HeroCard>
              <HeroCopy>
                <CardTopLine />

                <Eyebrow>AI-Powered · Philippine Baybayin</Eyebrow>

                <Title>
                  <TB>b</TB><TAI>AI</TAI><TRest>guhit</TRest>
                </Title>

                <TitleRule />

                <Tagline>
                  Revive the Ancient Script.{' '}
                  <TagBold>Master Baybayin through Play.</TagBold>
                </Tagline>

                <BodyText>
                  Practice writing, tapping, and translating Philippine Baybayin
                  characters through AI-powered interactive game modes —
                  one stroke at a time.
                </BodyText>

                <Divider />

                <CTARow>
                  <PlayBtn onClick={() => setIsGameModalOpen(true)}>
                    <BtnGlow />
                    <BtnLabel>▶&nbsp; Start Playing</BtnLabel>
                  </PlayBtn>
                  <ExploreBtn onClick={scrollToModes}>
                    Explore Modes&nbsp;↓
                  </ExploreBtn>
                </CTARow>

                <StatRow>
                  <StatItem><SNum>3</SNum><SLab>Game Modes</SLab></StatItem>
                  <SDot />
                  <StatItem><SNum>AI</SNum><SLab>Powered</SLab></StatItem>
                  <SDot />
                  <StatItem><SNum>∞</SNum><SLab>Practice</SLab></StatItem>
                </StatRow>
              </HeroCopy>

              <HeroLogoPanel>
                <LogoAura />
                <LogoImg src={logo1} alt="bAIguhit logo" />
              </HeroLogoPanel>
            </HeroCard>
          </HeroStage>

          {/* Scroll cue */}
          <ScrollCue onClick={scrollToModes}>
            <Pip /><Pip $d=".16s" /><Pip $d=".32s" />
            <ScrollLabel>scroll</ScrollLabel>
          </ScrollCue>
        </HeroWrap>

        {/* ══════════ MODES ══════════ */}
        <ModesSection id="modes">
          <ModesTopBar />
          <ModesInner>
            <ModesEyebrow>What you can do</ModesEyebrow>
            <ModesHeading>Three Ways to Learn Baybayin</ModesHeading>

            <ModesGrid>
              {MODES.map((m, i) => (
                <ModeCard
                  key={m.title}
                  $accent={m.accent}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <ModeStripe $accent={m.accent} />
                  <ModeBody>
                    <ModeIconBox $bg={m.bg} $accent={m.accent}>
                      {m.icon}
                    </ModeIconBox>
                    <ModeTitle $accent={m.accent}>{m.title}</ModeTitle>
                    <ModeDesc>{m.desc}</ModeDesc>
                  </ModeBody>
                  <ModeFooter $accent={m.accent}>→</ModeFooter>
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

const shimmer   = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;
const floatImg  = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.035)}`;
const fadeUp    = keyframes`from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}`;
const pipBounce = keyframes`0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(5px);opacity:.85}`;
const cardPop   = keyframes`from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}`;
const haloBreath= keyframes`0%,100%{opacity:.5}50%{opacity:.9}`;

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
    linear-gradient(160deg, #fff8f2 0%, #fff0e5 46%, #ffe6d6 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

  @media (max-width: 600px) {
    padding: 0;
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 44px 0 40px;

  @media (max-width: 900px) {
    width: 100%;
    padding: 24px 0 8px;
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
const TB    = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  color: #c24010;
  line-height: 1;
`;
const TAI   = styled.span`
  font-family: 'Cinzel', serif;
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  line-height: 1;
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
  line-height: 1;
`;

const TitleRule = styled.div`
  width: 50px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(194,64,12,.4), transparent);
  border-radius: 2px;
`;

const Tagline = styled.p`
  margin: 0;
  font-family: 'DM Sans', sans-serif;
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
  max-width: 420px;
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
const StatRow  = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(194, 64, 12, 0.06);
  border: 1px solid rgba(194, 64, 12, 0.12);
`;
const StatItem = styled.div`flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;`;
const SNum     = styled.div`font-family:'Cinzel',serif;font-size:20px;font-weight:900;color:#c24010;line-height:1;`;
const SLab     = styled.div`font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(154,48,0,.5);`;
const SDot     = styled.div`width:1px;height:28px;background:rgba(194,64,12,.15);`;

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
  @media (max-width: 640px) { grid-template-columns: 1fr; max-width: 340px; }
`;

const ModeCard = styled.div`
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
  opacity: .8;
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