import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <h2>🎶 ConcertHub</h2>
    <div>
      <Link to="/">Home</Link>
      <Link to="/concerts">Concerts</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  </nav>
);

export default Navbar;
