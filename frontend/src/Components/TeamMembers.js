import React from 'react';
import styled from 'styled-components';
import Img1 from '../Assests/perin.jpg';
import Img2 from '../Assests/cardana.jpg';
import Img3 from '../Assests/gumanoy.jpg';
import Img4 from '../Assests/Malarejes.png';
import Img5 from '../Assests/mercado.gif';
import Img6 from '../Assests/pabalate.png';
import Img7 from '../Assests/J.jpg';
import Img8 from '../Assests/download.jpg';
import Img9 from '../Assests/rr.jpg';
import Img10 from '../Assests/gera.png';

const teamMembers = [
    {
        name: 'MAX ANGELO D. PERIN',
        title: 'Co-Founder / Senior Fullstack Developer',
        img: Img1
    },
    {
        name: 'DARREL A. CARDAÑA',
        title: 'Co-Founder / Data Analyst',
        img: Img2
    },
    {
        name: 'CECILIA T. GUMANOY',
        title: 'Co-Founder / Business Analyst',
        img: Img3
    },
    {
        name: 'JOHN STEPHEN B. MALAREJES',
        title: 'Web Developer',
        img: Img4
    },
    {
        name: 'MARCO PIOLO P. MERCADO',
        title: 'Server Developer',
        img: Img5
    },
    {
        name: 'ROCKY M. PABALATE',
        title: 'Mobile Developer',
        img: Img6
    },
    {
        name: 'JEANY BABE G. PAILANAN',
        title: 'Lead Programmer',
        img: Img7
    },
    {
        name: 'EDEN PEARL F. CUTURA',
        title: 'Mobile Programmer',
        img: Img8
    },
    {
        name: 'ELVIN M. PERATER',
        title: 'Web Programmer',
        img: Img9
    },
    {
        name: 'ANGELA L. GERA',
        title: 'UI Designer',
        img: Img10
    }
];

// Split team members into chunks of 9 (3x3 grid)
const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

const TeamMembers = () => {
    const memberChunks = chunkArray(teamMembers, 9);

    return (
        <Container>
            <Title>OUR TEAM MEMBERS</Title>
            {memberChunks.map((chunk, pageIndex) => (
                <Members key={pageIndex}>
                    {chunk.map((member, index) => (
                        <React.Fragment key={index}>
                            {/* Add phase labels for the first three rows on the first page */}
                            {pageIndex === 0 && index === 0 && (
                                <PhaseLabel>Phase 1</PhaseLabel>
                            )}
                            {pageIndex === 0 && index === 3 && (
                                <PhaseLabel>Phase 2</PhaseLabel>
                            )}
                            {pageIndex === 0 && index === 6 && (
                                <PhaseLabel>Phase 4</PhaseLabel>
                            )}
                            <Member>
                                <ImageContainer>
                                    <Image src={member.img} alt={member.name} />
                                    <Overlay />
                                </ImageContainer>
                                <NameContainer>
                                    <Name>{member.name}</Name>
                                </NameContainer>
                                <TitleText>{member.title}</TitleText>
                            </Member>
                        </React.Fragment>
                    ))}
                    {/* Fill remaining slots with empty placeholders if less than 9 */}
                    {chunk.length < 9 &&
                        Array.from({ length: 9 - chunk.length }).map((_, index) => (
                            <EmptyMember key={`empty-${index}`} />
                        ))}
                </Members>
            ))}
        </Container>
    );
};

export default TeamMembers;

const Container = styled.div`
    text-align: center;
    background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
    padding: 60px 20px;
    min-height: 100vh;
`;

const Title = styled.h1`
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 50px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    @media (max-width: 640px) {
        font-size: 2rem;
    }
`;

const Members = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto 40px auto;
    justify-items: center;
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: auto;
    }
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const Member = styled.div`
    text-align: center;
    background: white;
    border-radius: 16px;
    padding: 20px;
    max-width: 260px;
    width: 100%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    }
`;

const EmptyMember = styled.div`
    width: 260px;
    height: 0;
    visibility: hidden;
`;

const ImageContainer = styled.div`
    position: relative;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
    border: 5px solid #A52A2A;
    transition: border-color 0.3s ease;
    ${Member}:hover & {
        border-color: #E7915B;
    }
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(170, 39, 13, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    ${Member}:hover & {
        opacity: 1;
    }
`;

const NameContainer = styled.div`
    margin-top: 20px;
    background-color: #A52A2A;
    padding: 8px 16px;
    border-radius: 50px;
    display: inline-block;
    transition: background-color 0.3s ease, transform 0.3s ease;
    ${Member}:hover & {
        background-color: #E7915B;
        transform: translateY(-5px);
    }
`;

const Name = styled.h3`
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;
    color: white;
    margin: 0;
    font-weight: 600;
`;

const TitleText = styled.p`
    font-family: 'Poppins', sans-serif;
    font-size: 0.75rem;
    color: #333;
    margin-top: 12px;
    font-weight: 500;
    line-height: 1.4;
`;

const PhaseLabel = styled.div`
    grid-column: 1 / -1;
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 20px;
    text-align: left;
    @media (max-width: 640px) {
        font-size: 1.2rem;
    }
`;