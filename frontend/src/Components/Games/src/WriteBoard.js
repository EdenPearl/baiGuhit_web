import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import useGetLeaderboardByStatus from "../../../Hooks/GameHooks/useGetLeaderboardByStatus.js";

/* ═══════════════════════════════════
   COMPONENT
═══════════════════════════════════ */

const TABS = ["easy", "medium", "hard", "expert", "master"];

const TAB_META = {
  easy:   { icon: "🌱", color: "#fbc417", label: "Easy" },
  medium: { icon: "🌿", color: "#fbc417", label: "Medium" },
  hard:   { icon: "🔥", color: "#fbc417", label: "Hard" },
  expert: { icon: "⚡", color: "#fbc417", label: "Expert" },
  master: { icon: "💎", color: "#fbc417", label: "Master" },
};

const WriteLeaderboard = () => {
  const [activeTab, setActiveTab] = useState("easy");
  const [currentUser, setCurrentUser] = useState(null);
  const { leaderboard, loading, error, refetch } = useGetLeaderboardByStatus(activeTab, 10, true);
  const navigate = useNavigate();

  useEffect(() => {
    const loginData = localStorage.getItem("loginData");
    if (loginData) {
      try { setCurrentUser(JSON.parse(loginData)); }
      catch { console.error("Failed to parse user data"); }
    }
  }, []);

  const statusData = leaderboard || [];
  const filteredData = statusData;

  const getRowPoints = (row) => Number(row?.points ?? row?.score ?? 0) || 0;
  const getRowDate   = (row) => row?.created_at || row?.DATE || row?.date || null;

  const isCurrentUser = (row) => {
    if (!currentUser) return false;
    if (row?.user_id && currentUser?.id) return String(row.user_id) === String(currentUser.id);
    if (row?.player && currentUser?.username) return String(row.player) === String(currentUser.username);
    const emailPrefix = String(currentUser?.email || "").split("@")[0];
    if (row?.player && emailPrefix) return String(row.player) === emailPrefix;
    return !!row?.email && row.email === currentUser.email;
  };

  const formatPlayerName = (row) => {
    const player = String(row?.player || "").trim();
    if (player) return player;
    const username = String(row?.username || "").trim();
    if (username) return username;
    const email = String(row?.email || "").trim();
    if (email.includes("@")) return email.split("@")[0];
    return email || "Anonymous";
  };

  const getRankMeta = (index) => {
    if (index === 0) return { icon: "👑", label: "1st", glow: "rgba(251,196,23,0.5)", ring: "#fbc417", bg: "linear-gradient(135deg,#fbc417,#fffdf8)" };
    if (index === 1) return { icon: "🥈", label: "2nd", glow: "rgba(122,33,0,0.35)", ring: "#7a2100", bg: "linear-gradient(135deg,#fffdf8,#fbc417)" };
    if (index === 2) return { icon: "🥉", label: "3rd", glow: "rgba(251,196,23,0.35)", ring: "#fbc417", bg: "linear-gradient(135deg,#7a2100,#fbc417)" };
    return { icon: `${index + 1}`, label: `#${index + 1}`, glow: "transparent", ring: "rgba(122,33,0,0.12)", bg: "rgba(255,253,248,0.9)" };
  };

  const stats = {
    count:   statusData.length,
    best:    statusData.length > 0 ? Math.max(...statusData.map(getRowPoints)) : 0,
    average: statusData.length > 0 ? Math.round(statusData.reduce((s, r) => s + getRowPoints(r), 0) / statusData.length) : 0,
  };

  return (
    <PageRoot>
      {/* Layered background */}
      <BgBase />
      <BgTexture />
      <BgRadial />

      {/* Floating particles */}
      {Array.from({ length: 14 }, (_, i) => (
        <Particle
          key={i}
          style={{
            left:   `${(i * 7.3 + 5) % 100}%`,
            top:    `${(i * 13.7 + 8) % 100}%`,
            width:  2 + (i % 3),
            height: 2 + (i % 3),
          }}
          $delay={i * 0.45}
          $duration={4 + (i % 5)}
        />
      ))}

      {/* ── Back button ── */}
      <BackBtn onClick={() => navigate("/HomeGame")}>
        <span>←</span>
        <span>Back</span>
      </BackBtn>

      {/* ── Main card ── */}
      <Card>
        <CardTopBar />

        <CardInner>
          {/* ════ LEFT PANEL ════ */}
          <LeftPanel>
            {/* Trophy header */}
            <TrophyArea>
              <TrophyWrap>
                <TrophyEmoji>🏆</TrophyEmoji>
                <TrophyHalo />
              </TrophyWrap>
              <PanelTitle>Leaderboard</PanelTitle>
              <PanelSubtitle>Writing Challenge</PanelSubtitle>
              <ChampionBadge>
                <BadgeDot />
                Top 10 Champions
              </ChampionBadge>
            </TrophyArea>

            {/* Difficulty tabs */}
            <TabsSection>
              <TabsLabel>Difficulty</TabsLabel>
              <TabList>
                {TABS.map(tab => (
                  <TabBtn
                    key={tab}
                    $active={activeTab === tab}
                    $color={TAB_META[tab].color}
                    onClick={() => setActiveTab(tab)}
                  >
                    <TabBtnLabel>{TAB_META[tab].label}</TabBtnLabel>
                    {activeTab === tab && <TabActivePip $color={TAB_META[tab].color} />}
                  </TabBtn>
                ))}
              </TabList>
            </TabsSection>

            {/* Stats row */}
            <StatsRow>
              <StatBox>
                <StatBoxIcon>👥</StatBoxIcon>
                <StatBoxVal>{stats.count}</StatBoxVal>
                <StatBoxLabel>Players</StatBoxLabel>
              </StatBox>
              <StatSep />
              <StatBox>
                <StatBoxIcon>⭐</StatBoxIcon>
                <StatBoxVal>{stats.best}</StatBoxVal>
                <StatBoxLabel>Best</StatBoxLabel>
              </StatBox>
              <StatSep />
              <StatBox>
                <StatBoxIcon>📊</StatBoxIcon>
                <StatBoxVal>{stats.average}</StatBoxVal>
                <StatBoxLabel>Average</StatBoxLabel>
              </StatBox>
            </StatsRow>

            {/* Action buttons */}
            <ActionRow>
              <PrimaryBtn onClick={() => navigate("/write")}>
                <BtnShimmer />
                <BtnContent><span>▶</span> Play Game</BtnContent>
              </PrimaryBtn>
              <GhostBtn onClick={refetch}>
                <BtnContent><span>↻</span> Refresh</BtnContent>
              </GhostBtn>
            </ActionRow>
          </LeftPanel>

          {/* ════ RIGHT PANEL ════ */}
          <RightPanel>
            <RightPanelHeader>
              <RightPanelTitle>
                {TAB_META[activeTab].icon}&nbsp; {TAB_META[activeTab].label} Rankings
              </RightPanelTitle>
              <ActiveTabPill $color={TAB_META[activeTab].color}>
                Top {filteredData.length}
              </ActiveTabPill>
            </RightPanelHeader>

            <TableWrap>
              {loading ? (
                <StateBox>
                  <RingSpinner />
                  <StateText>Loading rankings…</StateText>
                </StateBox>
              ) : error ? (
                <StateBox>
                  <StateEmoji>⚠️</StateEmoji>
                  <StateTitle>Something went wrong</StateTitle>
                  <StateText>{error}</StateText>
                  <StateBtn onClick={refetch}>Try Again</StateBtn>
                </StateBox>
              ) : filteredData.length === 0 ? (
                <StateBox>
                  <StateEmoji>🎯</StateEmoji>
                  <StateTitle>No scores yet!</StateTitle>
                  <StateText>Be the first to play {TAB_META[activeTab].label} mode</StateText>
                  <StateBtn onClick={() => navigate("/write")}>Play Now →</StateBtn>
                </StateBox>
              ) : (
                <ScoreTable>
                  <ScoreTableHead>
                    <tr>
                      <HeadCell $w="64px">Rank</HeadCell>
                      <HeadCell>Player</HeadCell>
                      <HeadCell $hide>Date</HeadCell>
                      <HeadCell $align="right">Score</HeadCell>
                    </tr>
                  </ScoreTableHead>
                  <tbody>
                    {filteredData.map((row, index) => {
                      const meta = getRankMeta(index);
                      const isMe = isCurrentUser(row);
                      return (
                        <ScoreRow
                          key={row.id || index}
                          $isMe={isMe}
                          $isTop3={index < 3}
                          style={{ animationDelay: `${index * 0.045}s` }}
                        >
                          {/* Rank */}
                          <RankTd>
                            <RankBubble $bg={meta.bg} $ring={meta.ring} $glow={meta.glow} $isTop3={index < 3}>
                              {index < 3 ? meta.icon : <RankNum>{index + 1}</RankNum>}
                            </RankBubble>
                          </RankTd>

                          {/* Player */}
                          <PlayerTd>
                            <PlayerRow>
                              <PlayerAvatar $isMe={isMe}>
                                {formatPlayerName(row).charAt(0).toUpperCase()}
                              </PlayerAvatar>
                              <PlayerMeta>
                                <PlayerNameText $isMe={isMe}>
                                  {formatPlayerName(row)}
                                </PlayerNameText>
                                {isMe && <YouPill>YOU</YouPill>}
                              </PlayerMeta>
                            </PlayerRow>
                          </PlayerTd>

                          {/* Date */}
                          <DateTd>
                            {getRowDate(row)
                              ? new Date(getRowDate(row)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              : "—"}
                          </DateTd>

                          {/* Score */}
                          <ScoreTd>
                            <ScoreNum $isTop3={index < 3}>{getRowPoints(row)}</ScoreNum>
                            <ScoreUnit>pts</ScoreUnit>
                          </ScoreTd>
                        </ScoreRow>
                      );
                    })}
                  </tbody>
                </ScoreTable>
              )}
            </TableWrap>
          </RightPanel>
        </CardInner>
      </Card>
    </PageRoot>
  );
};

export default WriteLeaderboard;

/* ═══════════════════════════════════
   KEYFRAMES
═══════════════════════════════════ */

const floatTrophy = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
`;

const haloBreath = keyframes`
  0%, 100% { opacity: 0.45; transform: translate(-50%,-50%) scale(1); }
  50%       { opacity: 0.8;  transform: translate(-50%,-50%) scale(1.15); }
`;

const shimmerGold = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const floatParticle = keyframes`
  0%   { transform: translateY(0) scale(1);    opacity: 0; }
  20%  { opacity: 0.6; }
  80%  { opacity: 0.3; }
  100% { transform: translateY(-100px) scale(0.4); opacity: 0; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.88); }
  60%  { transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1); }
`;

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const spinRing = keyframes`
  to { transform: rotate(360deg); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const dotPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(251,196,23,0.7); }
  50%       { box-shadow: 0 0 0 5px rgba(251,196,23,0); }
`;

/* ═══════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════ */

/* ── Root & Background ── */
const PageRoot = styled.div`
  position: relative;
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  font-family: 'Georgia', serif;
  box-sizing: border-box;

  @media (max-width: 860px) {
    align-items: flex-start;
    max-height: none;
    overflow-y: auto;
    padding: 14px;
  }
`;

const BgBase = styled.div`
  position: absolute;
  inset: 0;
  background: #6b1f00;
`;

const BgTexture = styled.div`
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg, transparent, transparent 60px,
    rgba(0,0,0,0.04) 60px, rgba(0,0,0,0.04) 61px
  );
  pointer-events: none;
`;

const BgRadial = styled.div`
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 80vw;
  max-width: 700px;
  max-height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,196,23,0.1) 0%, transparent 70%);
  pointer-events: none;
`;

const Particle = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(251,196,23,0.55);
  box-shadow: 0 0 5px rgba(251,196,23,0.4);
  pointer-events: none;
  animation: ${floatParticle} ${({ $duration }) => $duration}s ${({ $delay }) => $delay}s ease-in infinite;
`;

/* ── Back button ── */
const BackBtn = styled.button`
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.9);
  color: #7a2100;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255,255,255,1);
    border-color: rgba(122,33,0,0.22);
    transform: translateX(-3px);
  }
`;

/* ── Main card ── */
const Card = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1180px;
  max-height: calc(100vh - 40px);
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, #fffdf8 0%, #fff8ee 100%);
  border: 1px solid rgba(122,33,0,0.14);
  box-shadow: 0 32px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7);
  animation: ${popIn} 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards;
  display: flex;
  flex-direction: column;

  @media (max-width: 860px) {
    max-height: none;
    min-height: calc(100vh - 28px);
  }
`;

const CardTopBar = styled.div`
  height: 4px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a);
  background-size: 300% 100%;
  animation: ${shimmerGold} 3s linear infinite;
`;

const CardInner = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 860px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

/* ── Left Panel ── */
const LeftPanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 28px 22px;
  border-right: 1px solid rgba(251,196,23,0.14);
  background: linear-gradient(180deg, #7a2100 0%, #6b1f00 100%);
  animation: ${slideUp} 0.5s 0.1s ease both;

  @media (max-width: 860px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(251,196,23,0.14);
    padding: 20px;
  }
`;

const TrophyArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TrophyWrap = styled.div`
  position: relative;
  display: inline-flex;
  margin-bottom: 8px;
`;

const TrophyEmoji = styled.div`
  font-size: 52px;
  position: relative;
  z-index: 2;
  animation: ${floatTrophy} 3s ease-in-out infinite;
  filter: drop-shadow(0 6px 16px rgba(251,196,23,0.35));
`;

const TrophyHalo = styled.div`
  position: absolute;
  top: 50%; left: 50%;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,196,23,0.3) 0%, transparent 70%);
  animation: ${haloBreath} 2.4s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
`;

const PanelTitle = styled.h1`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 24px;
  font-weight: 900;
  color: #fffdf8;
  letter-spacing: 0.3px;
  text-align: center;
`;

const PanelSubtitle = styled.p`
  margin: 0;
  font-family: sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,253,248,0.78);
  letter-spacing: 0.8px;
  text-transform: uppercase;
`;

const ChampionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(251,196,23,0.32);
  background: rgba(251,196,23,0.12);
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #fffdf8;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fbc417;
  box-shadow: 0 0 5px rgba(251,196,23,0.9);
  animation: ${blink} 1.4s ease-in-out infinite;
  flex-shrink: 0;
`;

/* ── Tabs ── */
const TabsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TabsLabel = styled.div`
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,253,248,0.7);
`;

const TabList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const TabBtn = styled.button`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 12px;
  align-items: center;
  justify-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid ${({ $active, $color }) => $active ? `${$color}60` : 'rgba(251,196,23,0.18)'};
  background: ${({ $active, $color }) => $active ? `${$color}22` : 'rgba(255,253,248,0.05)'};
  color: ${({ $active }) => $active ? '#fffdf8' : 'rgba(255,253,248,0.78)'};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  overflow: hidden;
  &:hover {
    background: ${({ $color }) => `${$color}14`};
    border-color: ${({ $color }) => `${$color}44`};
    color: #fffdf8;
    transform: translateX(3px);
  }
`;

const TabBtnLabel = styled.span`
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  text-align: center;
  justify-self: center;
`;

const TabActivePip = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: ${({ $color }) => `0 0 8px ${$color}99`};
  animation: ${dotPulse} 1.6s ease-in-out infinite;
  flex-shrink: 0;
  justify-self: end;
`;

/* ── Stats row ── */
const StatsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255,253,248,0.08);
  border: 1px solid rgba(251,196,23,0.16);
`;

const StatBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const StatBoxIcon = styled.div`
  font-size: 16px;
  opacity: 0.7;
`;

const StatBoxVal = styled.div`
  font-family: 'Georgia', serif;
  font-size: 22px;
  font-weight: 900;
  color: #fbc417;
  line-height: 1;
`;

const StatBoxLabel = styled.div`
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,253,248,0.65);
`;

const StatSep = styled.div`
  width: 1px;
  height: 38px;
  background: rgba(251,196,23,0.18);
`;

/* ── Action buttons ── */
const ActionRow = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
`;

const PrimaryBtn = styled.button`
  position: relative;
  flex: 2;
  height: 46px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #fde68a 0%, #fbc417 40%, #f59e0b 100%);
  box-shadow: 0 5px 20px rgba(251,196,23,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(251,196,23,0.45); }
  &:active { transform: translateY(1px); }
`;

const BtnShimmer = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: ${shimmerGold} 2.4s linear infinite;
`;

const BtnContent = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 900;
  color: #3d2401;
`;

const GhostBtn = styled.button`
  flex: 1;
  height: 46px;
  border-radius: 12px;
  border: 1.5px solid rgba(251,196,23,0.28);
  background: rgba(255,253,248,0.06);
  cursor: pointer;
  transition: all 0.18s ease;
  &:hover { background: rgba(251,196,23,0.1); border-color: rgba(251,196,23,0.5); transform: translateY(-1px); }
  &:active { transform: translateY(1px); }
  ${BtnContent} { font-size: 13px; color: #fffdf8; }
`;

/* ── Right Panel ── */
const RightPanel = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 14px;
  overflow: hidden;
  background: rgba(255,253,248,0.96);
  animation: ${slideUp} 0.5s 0.18s ease both;

  @media (max-width: 860px) {
    padding: 16px;
    overflow: visible;
  }
`;

const RightPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const RightPanelTitle = styled.h2`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 18px;
  font-weight: 900;
  color: #7a2100;
  letter-spacing: 0.2px;
`;

const ActiveTabPill = styled.div`
  padding: 4px 12px;
  border-radius: 999px;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: ${({ $color }) => `${$color}20`};
  border: 1px solid ${({ $color }) => `${$color}50`};
  color: ${({ $color }) => $color};
`;

/* ── Table container ── */
const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(122,33,0,0.08);
  background: #fff;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(122,33,0,0.25); border-radius: 4px; }
  overflow-y: auto;

  @media (max-width: 860px) {
    min-height: 320px;
    max-height: 56vh;
  }
`;

/* ── State views ── */
const StateBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 50px 24px;
`;

const StateEmoji = styled.div`
  font-size: 56px;
  opacity: 0.7;
`;

const StateTitle = styled.div`
  font-family: 'Georgia', serif;
  font-size: 18px;
  font-weight: 900;
  color: #7a2100;
`;

const StateText = styled.div`
  font-family: sans-serif;
  font-size: 13px;
  color: rgba(122,33,0,0.62);
  text-align: center;
`;

const StateBtn = styled.button`
  padding: 10px 26px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  color: #3d2401;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(251,196,23,0.3);
  transition: all 0.18s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(251,196,23,0.4); }
`;

const RingSpinner = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid rgba(122,33,0,0.15);
  border-top-color: #fbc417;
  animation: ${spinRing} 0.9s linear infinite;
`;

/* ── Score table ── */
const ScoreTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const ScoreTableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeadCell = styled.th`
  padding: 13px 16px;
  text-align: ${({ $align }) => $align || 'left'};
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(122,33,0,0.55);
  background: rgba(255,248,238,0.96);
  border-bottom: 1px solid rgba(122,33,0,0.08);
  width: ${({ $w }) => $w || 'auto'};

  @media (max-width: 600px) {
    display: ${({ $hide }) => $hide ? 'none' : 'table-cell'};
  }
`;

const ScoreRow = styled.tr`
  border-left: 3px solid ${({ $isMe }) => $isMe ? '#fbc417' : 'transparent'};
  background: ${({ $isMe, $isTop3 }) =>
    $isMe ? 'rgba(251,196,23,0.08)' :
    $isTop3 ? 'rgba(251,196,23,0.04)' :
    'transparent'};
  transition: background 0.18s ease;
  animation: ${rowIn} 0.35s ease both;

  &:hover {
    background: rgba(122,33,0,0.03);
  }

  &:not(:last-child) td {
    border-bottom: 1px solid rgba(122,33,0,0.05);
  }
`;

const RankTd = styled.td`
  padding: 12px 16px;
  width: 64px;
`;

const RankBubble = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $isTop3 }) => $isTop3 ? '18px' : '13px'};
  font-weight: 800;
  background: ${({ $bg }) => $bg};
  border: 1.5px solid ${({ $ring }) => $ring};
  box-shadow: ${({ $glow, $isTop3 }) => $isTop3 ? `0 0 14px ${$glow}` : 'none'};
`;

const RankNum = styled.span`
  font-family: sans-serif;
  font-size: 12px;
  font-weight: 800;
  color: rgba(122,33,0,0.6);
`;

const PlayerTd = styled.td`
  padding: 12px 10px;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlayerAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 900;
  background: ${({ $isMe }) => $isMe
    ? 'linear-gradient(135deg, #fde68a, #f59e0b)'
    : 'rgba(122,33,0,0.05)'};
  color: ${({ $isMe }) => $isMe ? '#3d2401' : '#7a2100'};
  border: 1.5px solid ${({ $isMe }) => $isMe ? 'rgba(251,196,23,0.5)' : 'rgba(122,33,0,0.08)'};
`;

const PlayerMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PlayerNameText = styled.div`
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $isMe }) => $isMe ? '#fbc417' : '#7a2100'};
  letter-spacing: 0.1px;
`;

const YouPill = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  color: #3d2401;
  font-family: sans-serif;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.8px;
  text-transform: uppercase;
`;

const DateTd = styled.td`
  padding: 12px 10px;
  font-family: sans-serif;
  font-size: 12px;
  color: rgba(122,33,0,0.45);
  font-weight: 500;

  @media (max-width: 600px) { display: none; }
`;

const ScoreTd = styled.td`
  padding: 12px 20px 12px 10px;
  text-align: right;
`;

const ScoreNum = styled.div`
  font-family: 'Georgia', serif;
  font-size: ${({ $isTop3 }) => $isTop3 ? '22px' : '18px'};
  font-weight: 900;
  color: ${({ $isTop3 }) => $isTop3 ? '#fbc417' : '#7a2100'};
  line-height: 1;
  letter-spacing: -0.5px;
`;

const ScoreUnit = styled.div`
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(122,33,0,0.36);
  margin-top: 3px;
`;