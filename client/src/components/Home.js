// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to the Social Media App</h1>
      <div className="home-links">
        <Link to="/register" className="home-link">Register</Link>
        <Link to="/login" className="home-link">Login</Link>
      </div>
    </div>
  );
};

export default Home;

