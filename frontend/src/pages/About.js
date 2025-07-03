import React from 'react';

const About = () => {
  return (
    <div className="about fade-in">
      <div className="container">
        <h1>About Us</h1>
        <p>Welcome to PEBDEQ, your trusted e-commerce platform.</p>
        
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At PEBDEQ, we specialize in providing high-quality products across four main categories:
              3D printing services, professional tools, vintage light bulbs, and custom laser engraving.
            </p>
          </section>
          
          <section className="about-section">
            <h2>Our Categories</h2>
            <div className="categories-grid">
              <div className="category-item">
                <h3>3D Printing</h3>
                <p>Custom 3D printed items and prototypes</p>
              </div>
              <div className="category-item">
                <h3>Tools</h3>
                <p>Second-hand tools and professional equipment</p>
              </div>
              <div className="category-item">
                <h3>Vintage Light Bulbs</h3>
                <p>Antique and vintage lighting solutions</p>
              </div>
              <div className="category-item">
                <h3>Laser Engraving</h3>
                <p>Custom laser engraving services</p>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2>Why Choose PEBDEQ?</h2>
            <ul>
              <li>Quality products and services</li>
              <li>Competitive prices</li>
              <li>Fast and reliable shipping</li>
              <li>Excellent customer support</li>
              <li>Secure payment options</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 