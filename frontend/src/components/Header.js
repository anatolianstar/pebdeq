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
    logo2_height: 40,
    // Marquee Settings
    marquee_enabled: false,
    marquee_text: 'Welcome to our store! Special offers available now.',
    marquee_font_family: 'Arial, sans-serif',
    marquee_font_size: '14px',
    marquee_font_weight: 'normal',
    marquee_color: '#ffffff',
    marquee_background_color: '#ff6b6b',
    marquee_speed: 30,
    marquee_direction: 'left',
    marquee_pause_on_hover: true
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
    <header 
      className={`header ${siteSettings.header_sticky ? 'sticky' : ''}`}
      style={{
        backgroundColor: siteSettings.header_background_color || '#ffffff',
        color: siteSettings.header_text_color || '#2c3e50',
        borderBottom: siteSettings.header_border_bottom ? `1px solid ${siteSettings.header_border_color || '#e9ecef'}` : 'none',
        boxShadow: siteSettings.header_shadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      {/* Marquee Banner */}
      {siteSettings.marquee_enabled && (
        <div 
          className={`marquee-banner ${siteSettings.marquee_pause_on_hover ? 'pause-on-hover' : ''}`}
          style={{
            backgroundColor: siteSettings.marquee_background_color,
            color: siteSettings.marquee_color,
            fontFamily: siteSettings.marquee_font_family,
            fontSize: siteSettings.marquee_font_size,
            fontWeight: siteSettings.marquee_font_weight
          }}
        >
          <div 
            className={`marquee-content ${siteSettings.marquee_direction === 'right' ? 'marquee-right' : 'marquee-left'}`}
            style={{
              animationDuration: `${1000 / siteSettings.marquee_speed}s`
            }}
          >
            <span style={{ whiteSpace: 'pre-wrap' }}>{siteSettings.marquee_text}</span>
          </div>
        </div>
      )}
      
      <div className="container">
        <div 
          className="header-content"
          style={{
            padding: `${siteSettings.header_padding || 15}px 0`,
            justifyContent: siteSettings.header_logo_position === 'center' ? 'center' : 'space-between',
            minHeight: `${Math.min((siteSettings.use_logo ? (siteSettings.logo_height || 60) : 30) + (siteSettings.header_padding || 15) * 2, 200)}px`
          }}
        >
          <Link to="/" className="logo" style={{ color: siteSettings.header_text_color || '#2c3e50' }}>
            <div 
              className="logo-container"
              style={{
                minHeight: `${Math.min(siteSettings.use_logo ? (siteSettings.logo_height || 60) : 30, 120)}px`
              }}
            >
              {siteSettings.use_logo && siteSettings.site_logo ? (
                <img 
                  src={`http://localhost:5005${siteSettings.site_logo}`} 
                  alt={siteSettings.site_name} 
                  className="site-logo"
                  style={{
                    width: `${siteSettings.logo_width || 120}px`,
                    height: `${siteSettings.logo_height || 60}px`
                  }}
                />
              ) : (
                <h1 style={{ color: siteSettings.header_text_color || '#2c3e50' }}>{siteSettings.site_name}</h1>
              )}
              {siteSettings.use_logo2 && siteSettings.site_logo2 && (
                <img 
                  src={`http://localhost:5005${siteSettings.site_logo2}`} 
                  alt={`${siteSettings.site_name} Logo 2`} 
                  className="site-logo site-logo2"
                  style={{
                    width: `${siteSettings.logo2_width || 120}px`,
                    height: `${siteSettings.logo2_height || 40}px`
                  }}
                />
              )}
            </div>
          </Link>
          <nav 
            className="nav"
            style={{
              gap: `${siteSettings.header_nav_spacing || 20}px`,
              justifyContent: siteSettings.header_nav_position === 'center' ? 'center' : 
                            siteSettings.header_nav_position === 'left' ? 'flex-start' : 'flex-end'
            }}
          >
            {siteSettings.navigation_links && siteSettings.navigation_links
              .filter(link => link.enabled)
              .sort((a, b) => a.order - b.order)
              .filter(link => {
                // Filter based on authentication status
                if (link.show_for === 'guest' && isAuthenticated) return false;
                if (link.show_for === 'user' && !isAuthenticated) return false;
                if (link.show_for === 'admin' && (!isAuthenticated || !user?.is_admin)) return false;
                return true;
              })
              .map(link => {
                const linkStyle = {
                  color: siteSettings.nav_link_color || '#2c3e50',
                  fontSize: `${siteSettings.nav_link_font_size || 16}px`,
                  fontWeight: siteSettings.nav_link_font_weight || '500',
                  textTransform: siteSettings.nav_link_text_transform || 'none',
                  textDecoration: siteSettings.nav_link_underline ? 'underline' : 'none',
                  fontFamily: siteSettings.nav_link_font_family || 'inherit',
                  textShadow: siteSettings.nav_link_text_shadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.3s ease'
                };

                const hoverStyle = {
                  color: siteSettings.nav_link_hover_color || '#007bff'
                };

                if (link.url === 'logout') {
                  return (
                    <button 
                      key={link.id} 
                      onClick={handleLogout} 
                      className="nav-logout-btn"
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        e.target.style.color = hoverStyle.color;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = linkStyle.color;
                      }}
                    >
                      {link.title}
                    </button>
                  );
                }
                
                if (link.is_internal) {
                  return (
                    <Link 
                      key={link.id} 
                      to={link.url}
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        e.target.style.color = hoverStyle.color;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = linkStyle.color;
                      }}
                    >
                      {link.title}
                    </Link>
                  );
                } else {
                  return (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        e.target.style.color = hoverStyle.color;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = linkStyle.color;
                      }}
                    >
                      {link.title}
                    </a>
                  );
                }
              })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 