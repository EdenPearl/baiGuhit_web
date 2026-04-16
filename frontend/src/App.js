// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { UserProvider } from './contexts/UserContext';
import HeroSection from './Components/Home';
import About from './Components/About';

// Game Auth
import LoginGame from './Components/Games/src/LoginGame';
import HomeGame from './Components/Games/src/HomeGame';

// Game Modes
import WriteMode from './Components/Games/src/WriteMode';
import TapMode from './Components/Games/src/TapMode';

import Multiple from './Components/Games/src/Multiple';
import Typing from './Components/Games/src/Typing';
import Drag from './Components/Games/src/Drag';
import LeaderBoard from './Components/Games/src/LeaderBoard';

import MultipleBoard from './Components/Games/src/MultipleBoard';
import TypingBoard from './Components/Games/src/TypingBoard';
import DragBoard from './Components/Games/src/DragBoard';
import WriteBoard from './Components/Games/src/WriteBoard';
import TapBoard from './Components/Games/src/TapBoard';

// Difficulties
import DifficultyTap from './Components/Games/src/DifficultyTap';
import DifficultyMultiple from './Components/Games/src/DifficultyMultiple';
import DifficultyTyping from './Components/Games/src/DifficultyTyping';
import DifficultyDrag from './Components/Games/src/DifficultyDrag';
import DifficultyWrite from './Components/Games/src/DifficultyWrite';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>

          {/* ================= PAGES ================= */}
          <Route path="/" element={<HeroSection />} />
          <Route path="/about" element={<About />} />
          <Route path="/LoginGame" element={<LoginGame isOpen toggleModal={() => {}} />} />
          <Route path="/HomeGame" element={<HomeGame />} />
          

          {/* ================= GAME MODES ================= */}
          <Route path="/write" element={<WriteMode />} />
          <Route path="/tapmode" element={<TapMode />} />
         
          <Route path="/multiple" element={<Multiple />} />
          <Route path="/typing" element={<Typing />} />
          <Route path="/drag" element={<Drag />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          
          <Route path="/multiple-board" element={<MultipleBoard />} />
          <Route path="/typing-board" element={<TypingBoard />} />
          <Route path="/drag-board" element={<DragBoard />} />
          <Route path="/write-board" element={<WriteBoard />} />
          <Route path="/tap-board" element={<TapBoard />} />

          {/* ================= DIFFICULTY ================= */}
          <Route path="/difficulty-tap" element={<DifficultyTap />} />
          <Route path="/difficulty-multiple" element={<DifficultyMultiple />} />
          <Route path="/difficulty-typing" element={<DifficultyTyping />} />
          <Route path="/difficulty-drag" element={<DifficultyDrag />} />
          <Route path="/difficulty-write" element={<DifficultyWrite />} />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;