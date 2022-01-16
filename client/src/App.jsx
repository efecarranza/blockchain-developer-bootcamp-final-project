import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Admin } from './pages/admin';
import { Home } from './pages/home';

const App = () => {
  return (
  <>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </Router>
  </>
  );
};

export default App;
