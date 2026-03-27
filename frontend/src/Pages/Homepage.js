import React, { useRef } from 'react';
import styled from 'styled-components';
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/Home';
import PricingSection from '../Components/Pricing';
import AboutSection from '../Components/About';
import TeamMembers from '../Components/TeamMembers';
import Footer from '../Components/footer';
import ResearchSection from '../Components/Research'; // Import the ResearchSection

const HomePage = () => {

    const heroRef = useRef(null);
    const pricingRef = useRef(null);
    const researchRef = useRef(null);
    const aboutRef = useRef(null);
  
    const scrollToSection = (sectionRef) => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

  return (
    <HomePageContainer>
      <Navbar 
        scrollToSection={scrollToSection} 
        refs={{ heroRef, pricingRef, researchRef ,aboutRef }} 
      />
      <Section ref={heroRef}>
        <HeroSection />
      </Section>
      <Section ref={pricingRef}>
        <PricingSection />
      </Section>
      <Section ref={researchRef}>
        <ResearchSection />  {/* Add the ResearchSection here */}
      <Section ref={aboutRef}>
        <AboutSection />
      </Section>
      </Section>
      <Section>
        <TeamMembers />
      </Section>
      <Section>
        <Footer />
      </Section>
    </HomePageContainer>
  );
};

export default HomePage;

const HomePageContainer = styled.div`
  overflow-x: hidden;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.div`
  width: 100%;
`;
