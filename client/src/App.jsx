import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Board from './pages/Board';

function App() {
  const basePath = window.BASE_PATH || '/';

  return (
    <Router basename={basePath}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:filename" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default App;
