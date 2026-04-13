import React, { useState, useEffect } from 'react';
import LoginModal from './Login';

const Navbar = ({ scrollToSection, refs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollAndClose = (sectionRef) => {
    scrollToSection(sectionRef);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full border-b border-white/20 px-4 py-3 text-white transition-all md:px-8 ${
        isScrolled
          ? 'bg-orange-700/90 shadow-lg backdrop-blur'
          : 'market-gradient bg-[length:300%_300%]'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="text-xl font-extrabold italic tracking-wide">eBaybayMo</div>

        <button
          type="button"
          onClick={toggleMenu}
          className="rounded-md border border-white/40 px-3 py-2 text-sm font-semibold md:hidden"
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button className="rounded-full px-4 py-2 hover:bg-white/20" onClick={() => scrollAndClose(refs.heroRef)}>Home</button>
          <button className="rounded-full px-4 py-2 hover:bg-white/20" onClick={() => scrollAndClose(refs.pricingRef)}>Pricing</button>
          <button className="rounded-full px-4 py-2 hover:bg-white/20" onClick={() => scrollAndClose(refs.researchRef)}>Research</button>
          <button className="rounded-full px-4 py-2 hover:bg-white/20" onClick={() => scrollAndClose(refs.aboutRef)}>About</button>
          <button
            onClick={toggleModal}
            className="ml-3 rounded-full bg-white px-5 py-2 font-semibold text-orange-700 transition hover:scale-105"
          >
            Login
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mx-auto mt-3 flex w-full max-w-7xl flex-col gap-2 rounded-xl bg-orange-700/95 p-3 md:hidden">
          <button className="rounded-lg px-3 py-2 text-left hover:bg-white/20" onClick={() => scrollAndClose(refs.heroRef)}>Home</button>
          <button className="rounded-lg px-3 py-2 text-left hover:bg-white/20" onClick={() => scrollAndClose(refs.pricingRef)}>Pricing</button>
          <button className="rounded-lg px-3 py-2 text-left hover:bg-white/20" onClick={() => scrollAndClose(refs.researchRef)}>Research</button>
          <button className="rounded-lg px-3 py-2 text-left hover:bg-white/20" onClick={() => scrollAndClose(refs.aboutRef)}>About</button>
          <button
            onClick={toggleModal}
            className="rounded-lg bg-white px-3 py-2 text-left font-semibold text-orange-700"
          >
            Login
          </button>
        </div>
      )}

      <LoginModal isOpen={isModalOpen} toggleModal={toggleModal} />
    </nav>
  );
};

export default Navbar;
