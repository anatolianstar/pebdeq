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
            <Link to="/">Ana Sayfa</Link>
            <Link to="/products">Ürünler</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">İletişim</Link>
            <Link to="/about">Hakkımızda</Link>
            <Link to="/cart">Sepet</Link>
            <Link to="/login">Giriş</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 