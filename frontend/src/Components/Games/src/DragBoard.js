import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const DragLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState({ easy: [], medium: [], hard: [] });
    const [activeTab, setActiveTab] = useState("easy");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loginData = localStorage.getItem("loginData");
        if (loginData) {
            try {
                const parsed = JSON.parse(loginData);
                setCurrentUser(parsed);
            } catch (e) {
                console.error("Failed to parse user data");
            }
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8000/drag/top10");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            if (json.success) {
                setLeaderboard({
                    easy: json.easy || [],
                    medium: json.medium || [],
                    hard: json.hard || []
                });
            } else {
                throw new Error(json.message || "Failed to fetch data");
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = leaderboard[activeTab] || [];

    const getRankStyle = (index) => {
        if (index === 0) return { color: "#FFD700", icon: "👑", bg: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" };
        if (index === 1) return { color: "#C0C0C0", icon: "🥈", bg: "linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)" };
        if (index === 2) return { color: "#CD7F32", icon: "🥉", bg: "linear-gradient(135deg, #D4A574 0%, #CD7F32 100%)" };
        return { color: "#64748B", icon: `#${index + 1}`, bg: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)" };
    };

    const isCurrentUser = (email) => currentUser && currentUser.email === email;

    const formatPlayerName = (email) => email ? email.split("@")[0] : "Anonymous";

    const getStats = () => {
        const tabData = filteredData;
        return {
            count: tabData.length,
            best: tabData.length > 0 ? Math.max(...tabData.map(d => d.points || 0)) : 0,
            average: tabData.length > 0 ? Math.round(tabData.reduce((a, b) => a + (b.points || 0), 0) / tabData.length) : 0
        };
    };

    const stats = getStats();

    return (
        <Container>
            <BackgroundPattern />
            
            <NavButtonsContainer>
                <BackButton onClick={() => navigate("/HomeGame")}>
                    <ButtonIcon>←</ButtonIcon>
                    <ButtonText>Back</ButtonText>
                </BackButton>
            </NavButtonsContainer>

            <LeaderboardCard>
                <TopSection>
                    <LeftPanel>
                        <Header>
                            <TrophyContainer>
                                <Trophy>🏆</Trophy>
                                <TrophyGlow />
                            </TrophyContainer>
                            <Title>Leaderboard</Title>
                            <Subtitle>Drag & Drop Challenge</Subtitle>
                            <BadgeRow>
                                <Badge>🏅 Top 10 Champions</Badge>
                            </BadgeRow>
                        </Header>

                        <TabGroup>
                            {["easy", "medium", "hard"].map((tab) => (
                                <Tab
                                    key={tab}
                                    $active={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    <TabIndicator $active={activeTab === tab} />
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Tab>
                            ))}
                        </TabGroup>

                        <StatsBar>
                            <Stat>
                                <StatIcon>👥</StatIcon>
                                <StatValue>{stats.count}</StatValue>
                                <StatLabel>Players</StatLabel>
                            </Stat>
                            <StatDivider />
                            <Stat>
                                <StatIcon>⭐</StatIcon>
                                <StatValue>{stats.best}</StatValue>
                                <StatLabel>Best Score</StatLabel>
                            </Stat>
                            <StatDivider />
                            <Stat>
                                <StatIcon>📊</StatIcon>
                                <StatValue>{stats.average}</StatValue>
                                <StatLabel>Average</StatLabel>
                            </Stat>
                        </StatsBar>

                        <ActionBar>
                            <ActionButton $secondary onClick={() => navigate("/difficulty-drag")}>
                                <BtnIcon>🎮</BtnIcon>
                                Play Game
                            </ActionButton>
                            <ActionButton onClick={fetchLeaderboard}>
                                <BtnIcon>↻</BtnIcon>
                                Refresh
                            </ActionButton>
                        </ActionBar>
                    </LeftPanel>

                    <RightPanel>
                        <TableContainer>
                            {loading ? (
                                <LoadingState>
                                    <Spinner />
                                    <LoadingText>Loading rankings...</LoadingText>
                                </LoadingState>
                            ) : error ? (
                                <ErrorState>
                                    <ErrorIcon>⚠️</ErrorIcon>
                                    <ErrorText>{error}</ErrorText>
                                    <RetryButton onClick={fetchLeaderboard}>Try Again</RetryButton>
                                </ErrorState>
                            ) : filteredData.length === 0 ? (
                                <EmptyState>
                                    <EmptyIcon>🎯</EmptyIcon>
                                    <EmptyTitle>No scores yet!</EmptyTitle>
                                    <EmptyText>Be the first to play the {activeTab} mode</EmptyText>
                                    <PlayNowButton onClick={() => navigate("/difficulty-drag")}>
                                        Play Now
                                    </PlayNowButton>
                                </EmptyState>
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>Rank</Th>
                                            <Th>Player</Th>
                                            <Th>Date</Th>
                                            <Th align="right">Score</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, index) => {
                                            const rankStyle = getRankStyle(index);
                                            const currentUserRow = isCurrentUser(row.email);

                                            return (
                                                <TableRow
                                                    key={row.id || index}
                                                    $isCurrentUser={currentUserRow}
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <RankCell>
                                                        <RankBadge $bg={rankStyle.bg} $isTop3={index < 3}>
                                                            {rankStyle.icon}
                                                        </RankBadge>
                                                    </RankCell>
                                                    <PlayerCell>
                                                        <PlayerInfo>
                                                            <PlayerName $isCurrentUser={currentUserRow}>
                                                                {formatPlayerName(row.email)}
                                                            </PlayerName>
                                                            {currentUserRow && <YouTag>YOU</YouTag>}
                                                        </PlayerInfo>
                                                    </PlayerCell>
                                                    <DateCell>
                                                        {row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric'
                                                        }) : "Recently"}
                                                    </DateCell>
                                                    <ScoreCell>
                                                        <ScoreValue>{row.points || 0}</ScoreValue>
                                                        <ScoreLabel>points</ScoreLabel>
                                                    </ScoreCell>
                                                </TableRow>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </TableContainer>
                    </RightPanel>
                </TopSection>
            </LeaderboardCard>
        </Container>
    );
};

export default DragLeaderboard;

/* ---------------- ANIMATIONS ---------------- */
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const slideIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
`;

/* ---------------- STYLES ---------------- */
const Container = styled.div`
    min-height: 100vh;
    max-height: 100vh;
    background: linear-gradient(160deg, #7a2100 0%, #9a3000 30%, #c24010 65%, #a83008 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    font-family: "Segoe UI", sans-serif;
    box-sizing: border-box;

    @media (max-width: 860px) {
        align-items: flex-start;
        max-height: none;
        overflow-y: auto;
        padding: 14px;
    }
`;

const BackgroundPattern = styled.div`
    position: absolute;
    inset: 0;
    background-image: 
        repeating-linear-gradient(
            45deg,
            transparent,
            transparent 55px,
            rgba(0,0,0,0.04) 55px,
            rgba(0,0,0,0.04) 56px
        ),
        radial-gradient(circle at 50% -25%, rgba(251,196,23,0.11) 0%, transparent 68%);
    pointer-events: none;
`;

const NavButtonsContainer = styled.div`
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
`;

const ButtonText = styled.span`
    letter-spacing: 0.5px;
`;

const BackButton = styled.button`
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(251,196,23,0.35);
    border-radius: 12px;
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fde68a;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    
    &:hover {
        background: rgba(251,196,23,0.12);
        transform: translateX(-2px);
        border-color: rgba(251,196,23,0.6);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
    }
    
    &:active {
        transform: translateX(0);
    }
`;

const ButtonIcon = styled.span`
    font-size: 16px;
    display: flex;
    align-items: center;
`;

const LeaderboardCard = styled.div`
    background: linear-gradient(155deg, #2c1204 0%, #3d1a06 50%, #1e0d03 100%);
    backdrop-filter: blur(16px);
    border-radius: 22px;
    padding: 0;
    width: 100%;
    max-width: 1180px;
    max-height: calc(100vh - 40px);
    color: #fff4df;
    border: 1px solid rgba(251,196,23,0.22);
    box-shadow: 
        0 32px 80px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,220,120,0.1);
    position: relative;
    z-index: 1;
    animation: ${slideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 860px) {
        max-width: 640px;
        max-height: none;
        min-height: calc(100vh - 28px);
    }
`;

const TopSection = styled.div`
    display: flex;
    gap: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    
    @media (max-width: 860px) {
        flex-direction: column;
        overflow-y: auto;
    }
`;

const LeftPanel = styled.div`
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 28px 22px;
    border-right: 1px solid rgba(251,196,23,0.12);
    background: rgba(0,0,0,0.18);
    animation: ${slideIn} 0.5s 0.1s ease both;
    
    @media (max-width: 860px) {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid rgba(251,196,23,0.12);
        padding: 20px;
    }
`;

const RightPanel = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 14px;
    overflow: hidden;
    animation: ${slideIn} 0.5s 0.18s ease both;

    @media (max-width: 860px) {
        padding: 16px;
        overflow: visible;
    }
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 0;
`;

const TrophyContainer = styled.div`
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
`;

const Trophy = styled.div`
    font-size: 48px;
    display: inline-block;
    animation: ${float} 3s ease-in-out infinite;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
`;

const TrophyGlow = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${pulse} 2s ease-in-out infinite;
    z-index: 1;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #fde68a;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 640px) {
        font-size: 24px;
    }
`;

const Subtitle = styled.p`
    text-align: center;
    color: rgba(255,255,255,0.45);
    margin-top: 6px;
    font-size: 14px;
    font-weight: 500;
`;

const BadgeRow = styled.div`
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 8px;
`;

const Badge = styled.span`
    background: rgba(251,196,23,0.1);
    color: #fde68a;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(251,196,23,0.35);
`;

const TabGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: transparent;
    padding: 8px;
    border-radius: 16px;
    position: relative;
    width: 100%;
`;

const TabIndicator = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(251,196,23,0.12);
    border-radius: 12px;
    z-index: -1;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s ease;
    box-shadow: none;
`;

const Tab = styled.button`
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: ${props => props.$active ? "rgba(251,196,23,0.18)" : "rgba(255,255,255,0.04)"};
    color: ${props => props.$active ? "#fff4df" : "rgba(255,255,255,0.5)"};
    font-weight: 700;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: none;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;

    &:hover { 
        color: #fff;
        transform: translateX(4px);
    }
    
    &:active {
        transform: translateX(0);
    }
`;

const StatsBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: rgba(255,255,255,0.03);
    border-radius: 16px;
    border: 1px solid rgba(251,196,23,0.12);
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 860px) {
        padding: 14px;
        gap: 8px;
    }
`;

const Stat = styled.div`
    text-align: center;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StatIcon = styled.div`
    font-size: 18px;
    margin-bottom: 4px;
    opacity: 0.8;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 800;
    color: #fde68a;
    line-height: 1;
    letter-spacing: -0.5px;

    @media (max-width: 860px) {
        font-size: 21px;
    }
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
    font-weight: 600;
    white-space: nowrap;

    @media (max-width: 860px) {
        font-size: 10px;
        letter-spacing: 0.7px;
    }
`;

const StatDivider = styled.div`
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, rgba(251,196,23,0.25), transparent);

    @media (max-width: 860px) {
        height: 34px;
    }
`;

const TableContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    border-radius: 16px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(251,196,23,0.14);
    position: relative;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(251,196,23,0.25);
        border-radius: 4px;
        border: 2px solid transparent;
        
        &:hover {
            background: rgba(251,196,23,0.45);
        }
    }

    @media (max-width: 860px) {
        min-height: 320px;
        max-height: 56vh;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: rgba(255,255,255,0.45);
    gap: 16px;
    height: 100%;
`;

const LoadingText = styled.p`
    font-size: 15px;
    font-weight: 500;
    margin: 0;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid rgba(251,196,23,0.15);
    border-top: 3px solid #fbc417;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const ErrorState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #ffb36b;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    margin-bottom: 12px;
`;

const ErrorText = styled.p`
    font-size: 15px;
    font-weight: 500;
    margin: 0 0 20px 0;
    color: #ffb36b;
`;

const RetryButton = styled.button`
    padding: 12px 28px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #fde68a, #f59e0b);
    color: #3d2401;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(251,196,23,0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(251,196,23,0.4);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: rgba(255,255,255,0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

const EmptyIcon = styled.div`
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
`;

const EmptyTitle = styled.p`
    font-size: 18px;
    font-weight: 700;
    color: #fde68a;
    margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    margin: 0 0 24px 0;
`;

const PlayNowButton = styled.button`
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #fde68a, #f59e0b);
    color: #3d2401;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(251,196,23,0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(251,196,23,0.4);
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    
    thead {
        position: sticky;
        top: 0;
        z-index: 10;
    }
`;

const Th = styled.th`
    padding: 16px;
    text-align: ${props => props.align || 'left'};
    color: rgba(253,230,138,0.45);
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: rgba(0,0,0,0.35);
    border-bottom: 1px solid rgba(251,196,23,0.12);
    
    &:first-child {
        padding-left: 24px;
    }
    
    &:last-child {
        padding-right: 24px;
    }
`;

const TableRow = styled.tr`
    background: ${props => props.$isCurrentUser 
        ? "rgba(251,196,23,0.08)" 
        : "transparent"};
    border-left: 3px solid ${props => props.$isCurrentUser ? "#fbc417" : "transparent"};
    transition: all 0.2s ease;
    animation: ${slideIn} 0.4s ease backwards;
    position: relative;
    
    &:hover {
        background: ${props => props.$isCurrentUser 
            ? "rgba(251,196,23,0.12)" 
            : "rgba(251,196,23,0.06)"};
        transform: scale(1.005);
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    &:not(:last-child) {
        border-bottom: 1px solid rgba(255,255,255,0.04);
    }
`;

const RankCell = styled.td`
    padding: 14px 16px;
    width: 70px;
`;

const RankBadge = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.$isTop3 ? '18px' : '13px'};
    font-weight: 800;
    background: ${props => props.$bg};
    color: ${props => props.$isTop3 ? 'white' : 'rgba(255,255,255,0.55)'};
    box-shadow: ${props => props.$isTop3 
        ? '0 4px 12px rgba(0,0,0,0.15)' 
        : '0 2px 4px rgba(0,0,0,0.05)'};
    border: ${props => props.$isTop3 ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent'};
`;

const PlayerCell = styled.td`
    padding: 14px 12px;
`;

const PlayerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const PlayerName = styled.div`
    font-weight: 700;
    color: ${props => props.$isCurrentUser ? "#fbc417" : "#fff4df"};
    font-size: 15px;
    letter-spacing: -0.2px;
`;

const YouTag = styled.span`
    background: linear-gradient(135deg, #fde68a, #f59e0b);
    color: #3d2401;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(251,196,23,0.35);
`;

const DateCell = styled.td`
    padding: 14px 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
`;

const ScoreCell = styled.td`
    padding: 14px 24px 14px 12px;
    text-align: right;
`;

const ScoreValue = styled.div`
    font-size: 20px;
    font-weight: 800;
    color: #fde68a;
    line-height: 1;
    letter-spacing: -0.5px;
`;

const ScoreLabel = styled.div`
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
    font-weight: 600;
`;

const ActionBar = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
`;

const BtnIcon = styled.span`
    font-size: 16px;
    display: flex;
    align-items: center;
`;

const ActionButton = styled.button`
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    width: 0;
    background: ${props => props.$secondary 
        ? "linear-gradient(135deg, #fde68a, #fbc417, #f59e0b)" 
        : "rgba(255,255,255,0.07)"};
    color: ${props => props.$secondary ? "#3d2401" : "#fff7e7"};
    border: ${props => props.$secondary ? "none" : "1.5px solid rgba(251,196,23,0.4)"};
    box-shadow: ${props => props.$secondary 
        ? "0 6px 20px rgba(251,196,23,0.35), 0 1px 0 rgba(255,255,255,0.24) inset" 
        : "none"};
    white-space: nowrap;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$secondary 
            ? "0 9px 24px rgba(251,196,23,0.45)" 
            : "0 0 0 1px rgba(251,196,23,0.55)"};
        border-color: ${props => props.$secondary ? "transparent" : "rgba(251,196,23,0.65)"};
    }
    
    &:active {
        transform: translateY(0);
    }

    @media (max-width: 860px) {
        padding: 12px 14px;
        font-size: 14px;
        gap: 6px;
    }
`;
