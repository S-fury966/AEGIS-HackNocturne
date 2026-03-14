import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Optimizer from './pages/Optimizer'; // <-- ADDED THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/optimize" element={<Optimizer />} /> {/* <-- ADDED THIS */}
      </Routes>
    </Router>
  );
}

export default App;