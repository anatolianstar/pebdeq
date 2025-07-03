import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>PEBDEQ'e Hoş Geldiniz</h1>
          <p>Modern E-ticaret Platformunuz</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Ürünlere Göz At</Link>
            <Link to="/about" className="btn btn-secondary">Hakkımızda</Link>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Kategoriler</h2>
          <div className="category-grid">
            <div className="category-card">
              <h3>3D Print</h3>
              <p>Özel 3D baskı ürünler ve prototipler</p>
            </div>
            <div className="category-card">
              <h3>Aletler</h3>
              <p>İkinci el aletler ve ekipmanlar</p>
            </div>
            <div className="category-card">
              <h3>Vintage Bulbs</h3>
              <p>Antika ve vintage ampuller</p>
            </div>
            <div className="category-card">
              <h3>Laser Engraving</h3>
              <p>Özel lazer gravür hizmetleri</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 