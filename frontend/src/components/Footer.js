import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PEBDEQ</h3>
            <p>Modern E-ticaret Platformu</p>
            <div style={{marginTop: '1rem', fontSize: '1.5rem'}}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>📸</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>🐦</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Hızlı Bağlantılar</h4>
            <ul>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/products">Ürünler</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Kategoriler</h4>
            <ul>
              <li><Link to="/category/3d-print">3D Print</Link></li>
              <li><Link to="/category/tools">Aletler</Link></li>
              <li><Link to="/category/vintage-bulbs">Vintage Bulbs</Link></li>
              <li><Link to="/category/laser-engraving">Laser Engraving</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PEBDEQ. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 