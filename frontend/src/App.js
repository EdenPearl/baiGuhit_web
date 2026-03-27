// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { UserProvider } from './contexts/UserContext';

// Pages
import HomePage from './Pages/Homepage';
import Dashboard from './Pages/Dashboard';
import DashboardGame from './Pages/DashboardGame';
import Admindashboard from './Pages/Admindashboard';


// Components
import LoginModal from './Components/Login';
import OrderList from './Components/OrderList';
import OrderPlaced from './Components/OrderPlaced';

// Game Auth
import LoginGame from './Components/Games/src/LoginGame';
import HomeGame from './Components/Games/src/HomeGame';

// Game Modes
import WriteMode from './Components/Games/src/WriteMode';
import TapMode from './Components/Games/src/TapMode';
import TranslationMode from './Components/Games/src/TranslationMode';
import Multiple from './Components/Games/src/Multiple';
import Typing from './Components/Games/src/Typing';
import Drag from './Components/Games/src/Drag';
import LeaderBoard from './Components/Games/src/LeaderBoard';

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

          {/* ================= MARKETPLACE ================= */}
          <Route path="/*" element={<HomePage />} />
          <Route path="/Login" element={<LoginModal />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Admindashboard" element={<Admindashboard />} />
          <Route path="/OrderList" element={<OrderList />} />
          <Route path="/OrderPlaced" element={<OrderPlaced />} />

          {/* ================= GAME ================= */}
          <Route path="/LoginGame" element={<LoginGame />} />
          <Route path="/DashboardGame" element={<DashboardGame />} />
          <Route path="/HomeGame" element={<HomeGame />} />
          

          {/* ================= GAME MODES ================= */}
          <Route path="/write" element={<WriteMode />} />
          <Route path="/tapmode" element={<TapMode />} />
          <Route path="/translate" element={<TranslationMode />} />
          <Route path="/multiple" element={<Multiple />} />
          <Route path="/typing" element={<Typing />} />
          <Route path="/drag" element={<Drag />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />

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