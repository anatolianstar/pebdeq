import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings');
      const data = await response.json();
      
      if (response.ok) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't render footer while loading
  }

  // If footer is disabled, don't render it
  if (!siteSettings?.footer_settings?.footer_show_section) {
    return null;
  }

  const footerSettings = siteSettings.footer_settings;
  const contactSocial = siteSettings.contact_social;

  const footerStyle = {
    backgroundColor: footerSettings.footer_background_color || '#2c3e50',
    color: footerSettings.footer_text_color || '#ffffff'
  };

  const renderSocialLinks = () => {
    if (!footerSettings.footer_social_show_section) return null;

    const socialLinks = [];
    
    if (contactSocial.social_instagram) {
      socialLinks.push(
        <a key="instagram" href={contactSocial.social_instagram.startsWith('http') ? contactSocial.social_instagram : `https://instagram.com/${contactSocial.social_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem', display: 'inline-block'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      );
    }
    
    if (contactSocial.social_twitter) {
      socialLinks.push(
        <a key="twitter" href={contactSocial.social_twitter.startsWith('http') ? contactSocial.social_twitter : `https://x.com/${contactSocial.social_twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem', display: 'inline-block'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      );
    }
    
    if (contactSocial.social_facebook) {
      socialLinks.push(
        <a key="facebook" href={contactSocial.social_facebook.startsWith('http') ? contactSocial.social_facebook : `https://facebook.com/${contactSocial.social_facebook}`} target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem', display: 'inline-block'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      );
    }

    if (contactSocial.social_youtube) {
      socialLinks.push(
        <a key="youtube" href={contactSocial.social_youtube.startsWith('http') ? contactSocial.social_youtube : `https://youtube.com/${contactSocial.social_youtube}`} target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem', display: 'inline-block'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
      );
    }

    if (contactSocial.social_linkedin) {
      socialLinks.push(
        <a key="linkedin" href={contactSocial.social_linkedin.startsWith('http') ? contactSocial.social_linkedin : `https://linkedin.com/in/${contactSocial.social_linkedin}`} target="_blank" rel="noopener noreferrer" style={{display: 'inline-block'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      );
    }

    return socialLinks.length > 0 ? (
      <div className="footer-section">
        <h4>{footerSettings.footer_social_title || 'Follow Us'}</h4>
        <div className="footer-social-icons">
          {socialLinks}
        </div>
      </div>
    ) : null;
  };

  const renderQuickLinks = () => {
    if (!footerSettings.footer_quick_links_show_section || !footerSettings.footer_quick_links) return null;

    return (
      <div className="footer-section">
        <h4>{footerSettings.footer_quick_links_title || 'Quick Links'}</h4>
        <ul>
          {footerSettings.footer_quick_links.map((link, index) => (
            <li key={index}>
              {link.is_external ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
              ) : (
                <Link to={link.url}>{link.title}</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSupportLinks = () => {
    if (!footerSettings.footer_support_show_section || !footerSettings.footer_support_links) return null;

    return (
      <div className="footer-section">
        <h4>{footerSettings.footer_support_title || 'Support'}</h4>
        <ul>
          {footerSettings.footer_support_links.map((link, index) => (
            <li key={index}>
              {link.is_external ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
              ) : (
                <Link to={link.url}>{link.title}</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderNewsletter = () => {
    if (!footerSettings.footer_newsletter_show_section) return null;

    return (
      <div className="footer-section">
        <h4>{footerSettings.footer_newsletter_title || 'Newsletter'}</h4>
        <p>{footerSettings.footer_newsletter_description || 'Subscribe to get updates about new products and offers.'}</p>
        <div style={{marginTop: '1rem'}}>
          <input
            type="email"
            placeholder={footerSettings.footer_newsletter_placeholder || 'Enter your email address'}
            style={{
              padding: '0.5rem',
              marginRight: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px'
            }}
          />
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {footerSettings.footer_newsletter_button_text || 'Subscribe'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <footer className="footer" style={footerStyle}>
      <div className="container">
        <div className="footer-content">
          {/* Follow Us Section - Top Center */}
          <div className="footer-social-section">
            <div className="footer-section">
              {footerSettings.footer_use_logo && footerSettings.footer_logo ? (
                <div className="footer-logo-container">
                  <img 
                    src={`http://localhost:5005${footerSettings.footer_logo}`} 
                    alt={footerSettings.footer_company_name || 'Company Logo'} 
                    style={{
                      width: `${footerSettings.footer_logo_width || 120}px`,
                      height: `${footerSettings.footer_logo_height || 40}px`,
                      objectFit: 'contain',
                      marginBottom: '1rem'
                    }}
                  />
                </div>
              ) : (
                <h3>{footerSettings.footer_company_name || 'PEBDEQ'}</h3>
              )}
              <p>{footerSettings.footer_company_description || 'Crafted with passion, delivered with precision.'}</p>
            </div>
            {renderSocialLinks()}
          </div>
          
          {/* Links Section - Middle */}
          <div className="footer-links-section">
            {renderQuickLinks()}
            {renderSupportLinks()}
          </div>
          
          {/* Newsletter Section - Bottom Center */}
          <div className="footer-newsletter-section">
            {renderNewsletter()}
          </div>
        </div>
        <div className="footer-bottom">
          <p>{footerSettings.footer_copyright_text || '© 2024 PEBDEQ. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 