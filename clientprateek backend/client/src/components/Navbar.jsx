import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <h2>🎶 ConcertHub</h2>
    <div className="nav-links">
      <NavLink exact to="/" activeClassName="active-link">Home</NavLink>
      <NavLink to="/concerts" activeClassName="active-link">Concerts</NavLink>
      <NavLink to="/login" activeClassName="active-link">Login</NavLink>
      <NavLink to="/register" activeClassName="active-link">Register</NavLink>
    </div>
  </nav>
);

export default Navbar;
