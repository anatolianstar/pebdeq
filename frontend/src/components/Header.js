import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'pebdeq',
    site_logo: null,
    use_logo: false,
    logo_width: 120,
    logo_height: 40,
    site_logo2: null,
    use_logo2: false,
    logo2_width: 120,
    logo2_height: 40
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-container">
              {siteSettings.use_logo && siteSettings.site_logo ? (
                <img 
                  src={`http://localhost:5005${siteSettings.site_logo}`} 
                  alt={siteSettings.site_name} 
                  className="site-logo"
                  style={{
                    width: `${siteSettings.logo_width}px`,
                    height: `${siteSettings.logo_height}px`
                  }}
                />
              ) : (
                <h1>{siteSettings.site_name}</h1>
              )}
              {siteSettings.use_logo2 && siteSettings.site_logo2 && (
                <img 
                  src={`http://localhost:5005${siteSettings.site_logo2}`} 
                  alt={`${siteSettings.site_name} Logo 2`} 
                  className="site-logo site-logo2"
                  style={{
                    width: `${siteSettings.logo2_width}px`,
                    height: `${siteSettings.logo2_height}px`
                  }}
                />
              )}
            </div>
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile">Profile</Link>
                {user?.is_admin && <Link to="/admin">Admin</Link>}
                <button onClick={handleLogout} className="nav-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 