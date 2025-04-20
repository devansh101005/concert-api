import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const Home = () => (
  <div className="home-container">
    <h1>Welcome to ConcertHub 🎤</h1>
    <p>Your one-stop platform to discover and manage concerts effortlessly.</p>
    <div className="home-buttons">
      <Link to="/concerts" className="btn btn-primary">View Concerts</Link>
      <Link to="/login" className="btn btn-secondary">Login</Link>
      <Link to="/register" className="btn btn-secondary">Register</Link>
    </div>
  </div>
);

export default Home;
