import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PEBDEQ</h3>
            <p>Your trusted e-commerce platform for 3D printing, tools, vintage bulbs, and laser engraving.</p>
            <div style={{marginTop: '1rem', fontSize: '1.5rem'}}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>📸</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>🐦</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/category/3d-print">3D Printing</Link></li>
              <li><Link to="/category/tools">Tools</Link></li>
              <li><Link to="/category/vintage-bulbs">Vintage Bulbs</Link></li>
              <li><Link to="/category/laser-engraving">Laser Engraving</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PEBDEQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 