import React, { useRef } from 'react';
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
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden font-['Poppins']">
      <Navbar 
        scrollToSection={scrollToSection} 
        refs={{ heroRef, pricingRef, researchRef ,aboutRef }} 
      />
      <section ref={heroRef} className="w-full">
        <HeroSection />
      </section>
      <section ref={pricingRef} className="w-full">
        <PricingSection />
      </section>
      <section ref={researchRef} className="w-full">
        <ResearchSection />  {/* Add the ResearchSection here */}
      </section>
      <section ref={aboutRef} className="w-full">
        <AboutSection />
      </section>
      <section className="w-full">
        <TeamMembers />
      </section>
      <section className="w-full">
        <Footer />
      </section>
    </div>
  );
};

export default HomePage;
