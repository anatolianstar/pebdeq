import React, { useState, useEffect } from 'react';
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
  const [siteSettings, setSiteSettings] = useState({
    welcome_title: 'Welcome to Pebdeq',
    welcome_subtitle: 'Crafted. Vintage. Smart.',
    welcome_background_image: null,
    welcome_background_color: '#667eea',
    welcome_text_color: '#ffffff',
    welcome_button_text: 'Explore Products',
    welcome_button_link: '/products',
    welcome_button_color: '#00b894'
  });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        
        if (response.ok) {
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <div className="home-container">

      {/* Hero */}
      <section 
        className="hero-section"
        style={{
          background: siteSettings.welcome_background_image 
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(http://localhost:5005${siteSettings.welcome_background_image}) center/cover`
            : `linear-gradient(135deg, ${siteSettings.welcome_background_color} 0%, #764ba2 100%)`
        }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title" style={{ color: siteSettings.welcome_text_color }}>
            {siteSettings.welcome_title}
          </h1>
          <p className="hero-subtitle" style={{ color: siteSettings.welcome_text_color }}>
            {siteSettings.welcome_subtitle}
          </p>
          <a 
            href={siteSettings.welcome_button_link} 
            className="hero-button"
            style={{ backgroundColor: siteSettings.welcome_button_color }}
          >
            {siteSettings.welcome_button_text}
          </a>
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
