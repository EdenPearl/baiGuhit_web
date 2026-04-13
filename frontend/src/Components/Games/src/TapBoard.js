import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const TapBoard = () => {
    const [leaderboard, setLeaderboard] = useState({
        animal: [],
        profession: [],
        fruit: [],
        things: [],
        color: []
    });
    const [activeTab, setActiveTab] = useState("animal");
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
            const response = await fetch("http://localhost:8000/tap/top10");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            if (json.success) {
                setLeaderboard({
                    animal: json.leaderboards?.animal || [],
                    profession: json.leaderboards?.profession || [],
                    fruit: json.leaderboards?.fruit || [],
                    things: json.leaderboards?.things || [],
                    color: json.leaderboards?.color || []
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
            best: tabData.length > 0 ? Math.max(...tabData.map(d => d.score || 0)) : 0,
            average: tabData.length > 0 ? Math.round(tabData.reduce((a, b) => a + (b.score || 0), 0) / tabData.length) : 0
        };
    };

    const stats = getStats();

    const categories = [
        { key: "animal", label: "Animal", icon: "🦁" },
        { key: "profession", label: "Profession", icon: "👔" },
        { key: "fruit", label: "Fruit", icon: "🍎" },
        { key: "things", label: "Things", icon: "📦" },
        { key: "color", label: "Color", icon: "🎨" }
    ];

    return (
        <Container>
            <BackgroundPattern />
            
            <NavButtonsContainer>
                <BackButton onClick={() => navigate("/HomeGame")}>
                    <ButtonIcon>←</ButtonIcon>
                    <ButtonText>Back to Home</ButtonText>
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
                            <Title>Tap Mode</Title>
                            <Subtitle>Leaderboard</Subtitle>
                            <BadgeRow>
                                <Badge>🏅 Top 10 Champions</Badge>
                            </BadgeRow>
                        </Header>

                        <TabGroup>
                            {categories.map((cat) => (
                                <Tab
                                    key={cat.key}
                                    $active={activeTab === cat.key}
                                    onClick={() => setActiveTab(cat.key)}
                                    title={cat.label}
                                >
                                    <TabIndicator $active={activeTab === cat.key} />
                                    <TabIcon>{cat.icon}</TabIcon>
                                    <TabLabel>{cat.label}</TabLabel>
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
                            <ActionButton $secondary onClick={() => navigate("/difficulty-tap")}>
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
                                    <EmptyText>Be the first to play the {activeTab} category</EmptyText>
                                    <PlayNowButton onClick={() => navigate("/difficulty-tap")}>
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
    {row.created_at || row.createdAt 
        ? new Date(row.created_at || row.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        }) 
        : "Recently"}
</DateCell>
                                                    <ScoreCell>
                                                        <ScoreValue>{row.score || 0}</ScoreValue>
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

export default TapBoard;

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
    background: linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F97316 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-sizing: border-box;
`;

const BackgroundPattern = styled.div`
    position: absolute;
    inset: 0;
    background-image: 
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
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
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 12px;
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    
    &:hover {
        background: rgba(255,255,255,0.25);
        transform: translateX(-2px);
        border-color: rgba(255,255,255,0.4);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
    }
    
    &:active {
        transform: translateX(0);
    }
    
    @media (max-width: 640px) {
        padding: 10px 14px;
        
        ${ButtonText} {
            display: none;
        }
    }
`;

const ButtonIcon = styled.span`
    font-size: 16px;
    display: flex;
    align-items: center;
`;

const LeaderboardCard = styled.div`
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 1200px;
    max-height: calc(100vh - 40px);
    color: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 
        0 25px 50px -12px rgba(0,0,0,0.25),
        0 0 0 1px rgba(255,255,255,0.1) inset;
    position: relative;
    z-index: 1;
    animation: ${slideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    @media (max-width: 900px) {
        padding: 24px;
        max-width: 640px;
    }
`;

const TopSection = styled.div`
    display: flex;
    gap: 32px;
    height: 100%;
    min-height: 0;
    
    @media (max-width: 900px) {
        flex-direction: column;
        gap: 20px;
    }
`;

const LeftPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 300px;
    max-width: 350px;
    flex-shrink: 0;
    gap: 20px;
    
    @media (max-width: 900px) {
        max-width: 100%;
        min-width: auto;
    }
`;

const RightPanel = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    background: linear-gradient(135deg, #C2410C, #EA580C);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
    line-height: 1.2;
    
    @media (max-width: 640px) {
        font-size: 24px;
    }
`;

const Subtitle = styled.p`
    text-align: center;
    color: #64748B;
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
    background: linear-gradient(135deg, rgba(194, 65, 12, 0.1), rgba(234, 88, 12, 0.1));
    color: #C2410C;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(194, 65, 12, 0.2);
`;

const TabGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #F1F5F9;
    padding: 8px;
    border-radius: 16px;
    position: relative;
    width: 100%;
`;

const TabIndicator = styled.div`
    position: absolute;
    inset: 0;
    background: white;
    border-radius: 12px;
    z-index: -1;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
`;

const Tab = styled.button`
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: ${props => props.$active ? "white" : "transparent"};
    color: ${props => props.$active ? "#C2410C" : "#64748B"};
    font-weight: 700;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: ${props => props.$active ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none"};
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;

    &:hover { 
        color: ${props => props.$active ? "#C2410C" : "#475569"};
        transform: translateX(4px);
    }
    
    &:active {
        transform: translateX(0);
    }
`;

const TabIcon = styled.span`
    font-size: 20px;
    width: 24px;
    text-align: center;
`;

const TabLabel = styled.span`
    flex: 1;
`;

const StatsBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #FEF3F0 0%, #FFF7ED 100%);
    border-radius: 16px;
    border: 1px solid rgba(194, 65, 12, 0.1);
    width: 100%;
`;

const Stat = styled.div`
    text-align: center;
    flex: 1;
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
    color: #C2410C;
    line-height: 1;
    letter-spacing: -0.5px;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
    font-weight: 600;
`;

const StatDivider = styled.div`
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, #E2E8F0, transparent);
`;

const TableContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    border-radius: 16px;
    background: #FAFAFA;
    border: 1px solid #E2E8F0;
    position: relative;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 4px;
        border: 2px solid #FAFAFA;
        
        &:hover {
            background: #94A3B8;
        }
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #64748B;
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
    border: 4px solid #F1F5F9;
    border-top: 4px solid #EA580C;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const ErrorState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #DC2626;
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
    color: #991B1B;
`;

const RetryButton = styled.button`
    padding: 12px 28px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #C2410C, #EA580C);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(194, 65, 12, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(194, 65, 12, 0.4);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #64748B;
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
    color: #334155;
    margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
    font-size: 14px;
    color: #94A3B8;
    margin: 0 0 24px 0;
`;

const PlayNowButton = styled.button`
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #C2410C, #EA580C);
    color: white;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(194, 65, 12, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(194, 65, 12, 0.4);
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
    color: #64748B;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #F8FAFC;
    border-bottom: 2px solid #E2E8F0;
    
    &:first-child {
        padding-left: 24px;
    }
    
    &:last-child {
        padding-right: 24px;
    }
`;

const TableRow = styled.tr`
    background: ${props => props.$isCurrentUser 
        ? "linear-gradient(135deg, rgba(194, 65, 12, 0.08), rgba(234, 88, 12, 0.08))" 
        : "white"};
    border-left: 4px solid ${props => props.$isCurrentUser ? "#EA580C" : "transparent"};
    transition: all 0.2s ease;
    animation: ${slideIn} 0.4s ease backwards;
    position: relative;
    
    &:hover {
        background: ${props => props.$isCurrentUser 
            ? "linear-gradient(135deg, rgba(194, 65, 12, 0.12), rgba(234, 88, 12, 0.12))" 
            : "#F8FAFC"};
        transform: scale(1.005);
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    &:not(:last-child) {
        border-bottom: 1px solid #F1F5F9;
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
    color: ${props => props.$isTop3 ? 'white' : '#475569'};
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
    color: ${props => props.$isCurrentUser ? "#C2410C" : "#1E293B"};
    font-size: 15px;
    letter-spacing: -0.2px;
`;

const YouTag = styled.span`
    background: linear-gradient(135deg, #C2410C, #EA580C);
    color: white;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(194, 65, 12, 0.3);
`;

const DateCell = styled.td`
    padding: 14px 12px;
    font-size: 13px;
    color: #64748B;
    font-weight: 500;
`;

const ScoreCell = styled.td`
    padding: 14px 24px 14px 12px;
    text-align: right;
`;

const ScoreValue = styled.div`
    font-size: 20px;
    font-weight: 800;
    color: #C2410C;
    line-height: 1;
    letter-spacing: -0.5px;
`;

const ScoreLabel = styled.div`
    font-size: 11px;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
    font-weight: 600;
`;

const ActionBar = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
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
    background: ${props => props.$secondary 
        ? "white" 
        : "linear-gradient(135deg, #C2410C, #EA580C)"};
    color: ${props => props.$secondary ? "#C2410C" : "white"};
    border: ${props => props.$secondary ? "2px solid #E2E8F0" : "none"};
    box-shadow: ${props => props.$secondary 
        ? "0 1px 3px rgba(0,0,0,0.1)" 
        : "0 4px 6px -1px rgba(194, 65, 12, 0.3)"};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$secondary 
            ? "0 10px 15px -3px rgba(0,0,0,0.1)" 
            : "0 10px 20px -3px rgba(194, 65, 12, 0.4)"};
        border-color: ${props => props.$secondary ? "#C2410C" : "none"};
    }
    
    &:active {
        transform: translateY(0);
    }
`;