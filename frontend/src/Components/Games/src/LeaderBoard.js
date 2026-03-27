// src/Components/Leaderboard.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import home from '../../../Assests/backB.png';
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Award, ChevronLeft, Layers, PenTool, MousePointer } from "lucide-react";

// Modes, difficulties, categories
const MODES = [
  { id: "TranslateMode", label: "Translate", icon: Layers },
  { id: "TapMode", label: "Tap Match", icon: MousePointer },
  { id: "WriteMode", label: "Writing", icon: PenTool }
];

const TRANSLATE_SUBMODES = [
  { id: "Multiple", label: "Multiple Choice" },
  { id: "Typing", label: "Typing" },
  { id: "Drag", label: "Drag & Drop" }
];

const DIFFICULTIES = [
  { id: "Easy", label: "Easy", color: "#22c55e" },
  { id: "Medium", label: "Medium", color: "#f59e0b" },
  { id: "Hard", label: "Hard", color: "#ef4444" }
];

const TAP_CATEGORIES = [
  { id: "Animals", label: "Animals", icon: "🦁" },
  { id: "Profession", label: "Professions", icon: "👨‍⚕️" },
  { id: "Fruits", label: "Fruits", icon: "🍎" },
  { id: "Things", label: "Objects", icon: "📦" }
];

// Sample leaderboard data
const LEADERBOARD_DATA = {
  Multiple: {
    Easy: [
      { name: "Juan", score: 120, avatar: "🎮", trend: "up" },
      { name: "Maria", score: 95, avatar: "🎯", trend: "same" },
      { name: "Pedro", score: 80, avatar: "⚡", trend: "down" }
    ],
    Medium: [
      { name: "Ana", score: 150, avatar: "🔥", trend: "up" },
      { name: "Luis", score: 130, avatar: "⭐", trend: "up" },
      { name: "Jose", score: 110, avatar: "💪", trend: "same" }
    ],
    Hard: [
      { name: "Clara", score: 180, avatar: "👑", trend: "up" },
      { name: "Mark", score: 160, avatar: "🚀", trend: "up" },
      { name: "Rina", score: 140, avatar: "💎", trend: "down" }
    ]
  },
  Typing: {
    Easy: [
      { name: "Leo", score: 100, avatar: "⌨️", trend: "up" },
      { name: "Nina", score: 90, avatar: "📝", trend: "same" }
    ],
    Medium: [
      { name: "Paul", score: 140, avatar: "⚡", trend: "up" },
      { name: "Zara", score: 120, avatar: "🎯", trend: "down" }
    ],
    Hard: [
      { name: "Sam", score: 170, avatar: "🏆", trend: "up" },
      { name: "Tina", score: 160, avatar: "🔥", trend: "same" }
    ]
  },
  Drag: {
    Easy: [
      { name: "Ben", score: 85, avatar: "🎲", trend: "same" },
      { name: "Joy", score: 75, avatar: "🎨", trend: "up" }
    ],
    Medium: [
      { name: "Kim", score: 130, avatar: "🧩", trend: "up" },
      { name: "Ray", score: 120, avatar: "🎪", trend: "down" }
    ],
    Hard: [
      { name: "Liam", score: 160, avatar: "🌟", trend: "up" },
      { name: "Mia", score: 150, avatar: "✨", trend: "same" }
    ]
  },
  TapMode: {
    Animals: [
      { name: "Ella", score: 110, avatar: "🦁", trend: "up" },
      { name: "Tom", score: 100, avatar: "🐯", trend: "same" }
    ],
    Profession: [
      { name: "Jake", score: 120, avatar: "👨‍⚕️", trend: "up" },
      { name: "Sophia", score: 110, avatar: "👩‍🏫", trend: "down" }
    ],
    Fruits: [
      { name: "Max", score: 105, avatar: "🍎", trend: "same" },
      { name: "Lucy", score: 95, avatar: "🍊", trend: "up" }
    ],
    Things: [
      { name: "Adam", score: 115, avatar: "📦", trend: "up" },
      { name: "Lara", score: 105, avatar: "🎁", trend: "same" }
    ]
  },
  WriteMode: {
    Easy: [
      { name: "Anna", score: 90, avatar: "✏️", trend: "up" },
      { name: "Leo", score: 80, avatar: "📚", trend: "same" }
    ],
    Medium: [
      { name: "Mona", score: 120, avatar: "🖊️", trend: "up" },
      { name: "Eric", score: 110, avatar: "📖", trend: "down" }
    ],
    Hard: [
      { name: "Nate", score: 150, avatar: "🏅", trend: "up" },
      { name: "Ruth", score: 140, avatar: "🎓", trend: "same" }
    ]
  }
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C2410C, #EA580C);
  font-family: "Inter", "SF Pro Display", -apple-system, sans-serif;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LeaderboardCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  width: 800px;
  max-width: 95%;
  padding: 2.5rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModeButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.8)')};
  background: ${({ active }) => (active ? 'rgba(255, 255, 255, 0.25)' : 'transparent')};
  box-shadow: ${({ active }) => (active ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none')};

  &:hover {
    color: #fff;
    background: ${({ active }) => (active ? '' : 'rgba(255,255,255,0.1)')};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SubModeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.3s ease-out;
`;

const SubModeButton = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  border: 1px solid ${({ active }) => (active ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255,255,255,0.2)')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.9)')};
  background: ${({ active }) => (active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255,255,255,0.05)')};

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const FilterLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  padding-right: 1.5rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;

  option {
    background: #C2410C;
    color: #fff;
    padding: 0.5rem;
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${({ rank }) => {
    if (rank === 1) return 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)';
    if (rank === 2) return 'linear-gradient(135deg, rgba(226, 232, 240, 0.2) 0%, rgba(226, 232, 240, 0.05) 100%)';
    if (rank === 3) return 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.05) 100%)';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  border: 1px solid ${({ rank }) => {
    if (rank === 1) return 'rgba(251, 191, 36, 0.4)';
    if (rank === 2) return 'rgba(226, 232, 240, 0.4)';
    if (rank === 3) return 'rgba(251, 146, 60, 0.4)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 16px;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.4s ease-out;
  animation-delay: ${({ rank }) => rank * 0.05}s;
  animation-fill-mode: both;

  &:hover {
    transform: translateX(5px) scale(1.01);
    background: ${({ rank }) => {
      if (rank === 1) return 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 100%)';
      if (rank === 2) return 'linear-gradient(135deg, rgba(226, 232, 240, 0.3) 0%, rgba(226, 232, 240, 0.1) 100%)';
      if (rank === 3) return 'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.1) 100%)';
      return 'rgba(255, 255, 255, 0.15)';
    }};
    border-color: ${({ rank }) => {
      if (rank === 1) return 'rgba(251, 191, 36, 0.6)';
      if (rank === 2) return 'rgba(226, 232, 240, 0.6)';
      if (rank === 3) return 'rgba(251, 146, 60, 0.6)';
      return 'rgba(255, 255, 255, 0.25)';
    }};
  }
`;

const RankBadge = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  background: ${({ rank }) => {
    if (rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
    if (rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)';
    return 'rgba(255, 255, 255, 0.15)';
  }};
  color: ${({ rank }) => (rank <= 3 ? '#7c2d12' : 'rgba(255,255,255,0.8)')};
  box-shadow: ${({ rank }) => (rank <= 3 ? '0 4px 15px rgba(0,0,0,0.3)' : 'none')};
  animation: ${({ rank }) => rank <= 3 ? float : 'none'} 3s ease-in-out infinite;
`;

const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const PlayerName = styled.div`
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Score = styled.div`
  font-weight: 800;
  font-size: 1.25rem;
  color: ${({ rank }) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#e2e8f0';
    if (rank === 3) return '#fb923c';
    return '#fff';
  }};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const TrendIndicator = styled.div`
  color: ${({ trend }) => {
    if (trend === 'up') return '#86efac';
    if (trend === 'down') return '#fca5a5';
    return 'rgba(255,255,255,0.5)';
  }};
  font-size: 0.9rem;
  font-weight: 700;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 500;
`;

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(MODES[0].id);
  const [translateSubMode, setTranslateSubMode] = useState(TRANSLATE_SUBMODES[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].id);
  const [category, setCategory] = useState(TAP_CATEGORIES[0].id);

  const currentMode = MODES.find(m => m.id === activeMode);
  const ModeIcon = currentMode?.icon || Trophy;

  let displayedData = [];

  if (activeMode === "TapMode") {
    displayedData = LEADERBOARD_DATA[activeMode]?.[category] || [];
  } else if (activeMode === "TranslateMode") {
    displayedData = LEADERBOARD_DATA[translateSubMode]?.[difficulty] || [];
  } else {
    displayedData = LEADERBOARD_DATA[activeMode]?.[difficulty] || [];
  }

  displayedData = [...displayedData].sort((a, b) => b.score - a.score);

  return (
    <Container>
      <BackButton onClick={() => navigate("/HomeGame")}>
        <ChevronLeft />
        Back to Game
      </BackButton>

      <LeaderboardCard>
        <Header>
          <Title>
            <Trophy size={32} color="#fbbf24" />
            Leaderboard
          </Title>
          <Subtitle>Compete with the best players worldwide</Subtitle>
        </Header>

        <ModeSelector>
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <ModeButton
                key={mode.id}
                active={activeMode === mode.id}
                onClick={() => setActiveMode(mode.id)}
              >
                <Icon />
                {mode.label}
              </ModeButton>
            );
          })}
        </ModeSelector>

        {activeMode === "TranslateMode" && (
          <SubModeContainer>
            {TRANSLATE_SUBMODES.map((sub) => (
              <SubModeButton
                key={sub.id}
                active={translateSubMode === sub.id}
                onClick={() => setTranslateSubMode(sub.id)}
              >
                {sub.label}
              </SubModeButton>
            ))}
          </SubModeContainer>
        )}

        <FilterBar>
          {activeMode !== "TapMode" ? (
            <FilterGroup>
              <FilterLabel>Difficulty</FilterLabel>
              <Select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          ) : (
            <FilterGroup>
              <FilterLabel>Category</FilterLabel>
              <Select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {TAP_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          )}
        </FilterBar>

        <LeaderboardList>
          {displayedData.length === 0 ? (
            <EmptyState>No players yet. Be the first to score!</EmptyState>
          ) : (
            displayedData.map((player, index) => {
              const rank = index + 1;
              return (
                <LeaderboardItem key={`${player.name}-${index}`} rank={rank}>
                  <RankBadge rank={rank}>
                    {rank === 1 ? <Trophy size={20} /> : 
                     rank === 2 ? <Medal size={20} /> : 
                     rank === 3 ? <Award size={20} /> : rank}
                  </RankBadge>
                  
                  <PlayerInfo>
                    <Avatar>{player.avatar}</Avatar>
                    <PlayerName>{player.name}</PlayerName>
                  </PlayerInfo>

                  <ScoreSection>
                    <TrendIndicator trend={player.trend}>
                      {player.trend === 'up' ? '↑' : 
                       player.trend === 'down' ? '↓' : '−'}
                    </TrendIndicator>
                    <Score rank={rank}>
                      {player.score.toLocaleString()}
                      <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px' }}>pts</span>
                    </Score>
                  </ScoreSection>
                </LeaderboardItem>
              );
            })
          )}
        </LeaderboardList>
      </LeaderboardCard>
    </Container>
  );
};

export default Leaderboard;