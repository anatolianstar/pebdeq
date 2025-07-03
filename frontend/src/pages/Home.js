import React from 'react';
import './Home.css';

const categories = [
  {
    title: "3D Print",
    icon: "🔧",
    className: "print-3d",
    description: "Custom 3D designs and prints",
    link: "/products?category=3dprint"
  },
  {
    title: "Tools",
    icon: "🔨",
    className: "tools",
    description: "Quality second-hand tools",
    link: "/products?category=tools"
  },
  {
    title: "Vintage Bulbs",
    icon: "💡",
    className: "bulbs",
    description: "Decorative antique lamps",
    link: "/products?category=bulbs"
  },
  {
    title: "Laser Engraving",
    icon: "⚡",
    className: "laser",
    description: "Personalized laser engraving",
    link: "/products?category=laser"
  }
];

const Home = () => {
  return (
    <div className="home-container">

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to Pebdeq</h1>
          <p className="hero-subtitle">Crafted. Vintage. Smart.</p>
          <a href="/products" className="hero-button">Explore Products</a>
        </div>
      </section>

      {/* Categories */}
      <section className="category-section">
        <h2 className="section-title">Our Collections</h2>
                 <div className="category-grid">
           {categories.map((cat, index) => (
             <a href={cat.link} key={index} className="category-card">
               <div className={`category-image ${cat.className}`}>
                 {cat.icon}
               </div>
               <h3>{cat.title}</h3>
               <p>{cat.description}</p>
             </a>
           ))}
         </div>
      </section>

      {/* Highlights */}
      <section className="features-section">
        <div className="feature-card">🚚 Fast Shipping</div>
        <div className="feature-card">🔒 Secure Checkout</div>
        <div className="feature-card">📦 Quality Guarantee</div>
      </section>
    </div>
  );
};

export default Home;
