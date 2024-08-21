import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'; // Import your homepage component
import RootRivalsGame from './RootRivalsGame'; // Import your game component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<RootRivalsGame />} />
      </Routes>
    </Router>
  );
};

export default App;