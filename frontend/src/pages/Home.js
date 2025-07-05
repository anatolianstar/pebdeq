import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [siteSettings, setSiteSettings] = useState({
    welcome_title: 'Welcome to Pebdeq',
    welcome_subtitle: 'Crafted. Vintage. Smart.',
    welcome_background_image: null,
    welcome_background_color: '#667eea',
    welcome_text_color: '#ffffff',
    welcome_button_text: 'Explore Products',
    welcome_button_link: '/products',
    welcome_button_color: '#00b894',
    collections_title: 'Our Collections',
    collections_show_categories: [],
    collections_categories_per_row: 4,
    collections_max_rows: 1,
    collections_show_section: true
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteResponse, categoriesResponse] = await Promise.all([
          fetch('/api/site-settings'),
          fetch('/api/categories')
        ]);
        
        const siteData = await siteResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        if (siteResponse.ok) {
          setSiteSettings(siteData);
        }
        
        if (categoriesResponse.ok) {
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Get categories to display based on settings
  const getDisplayCategories = () => {
    if (!siteSettings.collections_show_section) {
      return [];
    }

    let categoriesToShow = categories.filter(cat => cat.is_active);
    
    // If specific categories are selected, filter by them
    if (siteSettings.collections_show_categories.length > 0) {
      categoriesToShow = categoriesToShow.filter(cat => 
        siteSettings.collections_show_categories.includes(cat.id)
      );
    }
    
    // Limit by max categories (per_row * max_rows)
    const maxCategories = siteSettings.collections_categories_per_row * siteSettings.collections_max_rows;
    return categoriesToShow.slice(0, maxCategories);
  };

  const displayCategories = getDisplayCategories();

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
      {siteSettings.collections_show_section && displayCategories.length > 0 && (
        <section className="category-section">
          <h2 className="section-title">{siteSettings.collections_title}</h2>
          <div 
            className="category-grid"
            style={{
              gridTemplateColumns: `repeat(${siteSettings.collections_categories_per_row}, 1fr)`
            }}
          >
            {displayCategories.map((category) => (
              <a 
                href={`/products?category=${category.slug}`} 
                key={category.id} 
                className="category-card"
                style={{
                  background: category.background_image_url 
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(http://localhost:5005${category.background_image_url}) center/cover`
                    : category.background_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: category.background_image_url || category.background_color ? '#fff' : '#333'
                }}
              >
                <div className="category-content">
                  {category.image_url && (
                    <div className="category-icon">
                      <img 
                        src={`http://localhost:5005${category.image_url}`} 
                        alt={category.name}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '50%',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>
                  )}
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Discover our collection'}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

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
