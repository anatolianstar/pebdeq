import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>PEBDEQ</h1>
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 