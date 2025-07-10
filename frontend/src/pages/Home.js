import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import ImagePreviewModal from '../components/ImagePreviewModal';

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
    homepage_background_color: '#ffffff',
    collections_title: 'Our Collections',
    collections_show_categories: [],
    collections_categories_per_row: 4,
    collections_max_rows: 1,
    collections_show_section: true,
    // Homepage Products Settings
    homepage_products_show_section: true,
    homepage_products_title: 'Featured Products',
    homepage_products_subtitle: 'Discover our most popular items',
    homepage_products_max_rows: 2,
    homepage_products_per_row: 4,
    homepage_products_max_items: 8,
    homepage_products_show_images: true,
    homepage_products_show_favorite: true,
    homepage_products_show_buy_now: true,
    homepage_products_show_details: true,
    homepage_products_show_price: true,
    homepage_products_show_original_price: true,
    homepage_products_show_stock: true,
    homepage_products_show_category: true,
    homepage_products_sort_by: 'featured',
    homepage_products_filter_categories: [],
    homepage_products_show_view_all: true,
    homepage_products_view_all_text: 'View All Products',
    homepage_products_view_all_link: '/products',
    homepage_products_card_style: 'modern',
    homepage_products_card_shadow: true,
    homepage_products_card_hover_effect: true,
    homepage_products_show_badges: true,
    homepage_products_show_rating: false,
    homepage_products_show_quick_view: false,
    // Homepage Products 2 Settings
    homepage_products2_show_section: true,
    homepage_products2_title: 'Latest Products',
    homepage_products2_subtitle: 'Check out our newest arrivals',
    homepage_products2_max_rows: 2,
    homepage_products2_per_row: 4,
    homepage_products2_max_items: 8,
    homepage_products2_show_images: true,
    homepage_products2_show_favorite: true,
    homepage_products2_show_buy_now: true,
    homepage_products2_show_details: true,
    homepage_products2_show_price: true,
    homepage_products2_show_original_price: true,
    homepage_products2_show_stock: true,
    homepage_products2_show_category: true,
    homepage_products2_sort_by: 'newest',
    homepage_products2_filter_categories: [],
    homepage_products2_show_view_all: true,
    homepage_products2_view_all_text: 'View All Products',
    homepage_products2_view_all_link: '/products',
    homepage_products2_card_style: 'modern',
    homepage_products2_card_shadow: true,
    homepage_products2_card_hover_effect: true,
    homepage_products2_show_badges: true,
    homepage_products2_show_rating: false,
    homepage_products2_show_quick_view: false
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, images: [], currentIndex: 0, altText: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [siteResponse, categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/site-settings'),
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        
        const siteData = await siteResponse.json();
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        
        if (siteResponse.ok) {
          console.log('Site settings loaded:', siteData);
          console.log('Image preview settings:', {
            homepage_products: siteData.homepage_products_enable_image_preview,
            homepage_products2: siteData.homepage_products2_enable_image_preview,
            full_data: siteData
          });
          setSiteSettings(siteData);
        }
        
        if (categoriesResponse.ok) {
          setCategories(categoriesData.categories);
        }
        
        if (productsResponse.ok) {
          setProducts(productsData.products);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
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

  // Get products to display based on settings
  const getDisplayProducts = () => {
    if (!siteSettings.homepage_products_show_section) {
      return [];
    }

    let productsToShow = products.filter(product => product.is_active);
    
    // Filter by categories if specified
    if (siteSettings.homepage_products_filter_categories.length > 0) {
      productsToShow = productsToShow.filter(product => 
        siteSettings.homepage_products_filter_categories.includes(product.category_id)
      );
    }
    
    // Sort products
    switch (siteSettings.homepage_products_sort_by) {
      case 'featured':
        productsToShow = productsToShow.filter(product => product.is_featured);
        break;
      case 'newest':
        productsToShow.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_low':
        productsToShow.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        productsToShow.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        productsToShow.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default: featured first, then by name
        productsToShow.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.name.localeCompare(b.name);
        });
    }
    
    // Limit by max rows and per row
    const maxItems = siteSettings.homepage_products_max_rows * siteSettings.homepage_products_per_row;
    return productsToShow.slice(0, maxItems);
  };

  const displayProducts = getDisplayProducts();

  // Get products for second section
  const getDisplayProducts2 = () => {
    if (!siteSettings.homepage_products2_show_section) {
      return [];
    }

    let productsToShow = products.filter(product => product.is_active);
    
    // Filter by categories if specified
    if (siteSettings.homepage_products2_filter_categories.length > 0) {
      productsToShow = productsToShow.filter(product => 
        siteSettings.homepage_products2_filter_categories.includes(product.category_id)
      );
    }
    
    // Sort products
    switch (siteSettings.homepage_products2_sort_by) {
      case 'featured':
        productsToShow = productsToShow.filter(product => product.is_featured);
        break;
      case 'newest':
        productsToShow.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_low':
        productsToShow.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        productsToShow.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        productsToShow.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default: newest first
        productsToShow.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Limit by max rows and per row
    const maxItems = siteSettings.homepage_products2_max_rows * siteSettings.homepage_products2_per_row;
    return productsToShow.slice(0, maxItems);
  };

  const displayProducts2 = getDisplayProducts2();

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (productId) => {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for product:', productId);
  };

  // Handle buy now
  const handleBuyNow = (product) => {
    // TODO: Implement buy now functionality
    console.log('Buy now:', product);
  };

  const openPreviewModal = (images, currentIndex, altText) => {
    setPreviewModal({ isOpen: true, images, currentIndex, altText });
  };

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, images: [], currentIndex: 0, altText: '' });
  };

  return (
    <div 
      className="home-container"
      style={{
        backgroundColor: siteSettings.homepage_background_color || '#ffffff'
      }}
    >

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
        <section 
          className="category-section"
          style={{
            backgroundColor: siteSettings.homepage_background_color || '#ffffff'
          }}
        >
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

      {/* Homepage Products */}
      {siteSettings.homepage_products_show_section && displayProducts.length > 0 && (
        <section 
          className="homepage-products-section"
          style={{
            backgroundColor: siteSettings.homepage_background_color || '#f8f9fa'
          }}
        >
          <div className="section-header">
            <h2 className="section-title">{siteSettings.homepage_products_title}</h2>
            {siteSettings.homepage_products_subtitle && siteSettings.homepage_products_subtitle.trim() !== '' && (
              <p className="section-subtitle">{siteSettings.homepage_products_subtitle}</p>
            )}
          </div>
          
          <div 
            className={`products-grid ${siteSettings.homepage_products_card_style}`}
            style={{
              '--products-per-row': siteSettings.homepage_products_per_row || 4,
              '--products-per-row-tablet': Math.min(siteSettings.homepage_products_per_row || 4, 4),
              '--products-per-row-mobile': Math.min(siteSettings.homepage_products_per_row || 4, 3),
              '--products-per-row-small': Math.min(siteSettings.homepage_products_per_row || 4, 2),
              '--image-size': `${Math.max(180, Math.min(600, 1368 / (siteSettings.homepage_products_per_row || 4) - 50))}px`,
              '--image-size-tablet': `${Math.max(180, Math.min(500, 1200 / Math.min(siteSettings.homepage_products_per_row || 4, 4) - 50))}px`,
              '--image-size-mobile': `${Math.max(180, Math.min(400, 900 / Math.min(siteSettings.homepage_products_per_row || 4, 3) - 50))}px`,
              '--image-size-small': `${Math.max(200, Math.min(350, 700 / Math.min(siteSettings.homepage_products_per_row || 4, 2) - 50))}px`
            }}
          >
            {displayProducts.map((product) => (
              <div 
                key={product.id} 
                className={`product-card ${siteSettings.homepage_products_card_shadow ? 'with-shadow' : ''} ${siteSettings.homepage_products_card_hover_effect ? 'with-hover' : ''}`}
              >
                {/* Product Image */}
                {siteSettings.homepage_products_show_images && product.images && product.images.length > 0 && (
                  <div className="product-image image-preview-hover">
                    <div style={{ position: 'relative' }}>
                      <Link to={`/product/${product.slug}`}>
                        <img 
                          src={`http://localhost:5005${product.images[0]}`} 
                          alt={product.name}
                          style={{
                            cursor: 'pointer',
                            display: 'block'
                          }}
                        />
                      </Link>
                      {(siteSettings.homepage_products_enable_image_preview !== false) && (
                        <div 
                          className="image-zoom-overlay"
                          onClick={(e) => {
                            console.log('Homepage Products 1 - Clicked! Setting:', siteSettings.homepage_products_enable_image_preview);
                            e.preventDefault();
                            e.stopPropagation();
                            const productImages = product.images.map(img => `http://localhost:5005${img}`);
                            openPreviewModal(productImages, 0, product.name);
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            cursor: 'zoom-in',
                            zIndex: 5
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Badges */}
                    {siteSettings.homepage_products_show_badges && (
                      <div className="product-badges">
                        {product.is_featured && <span className="badge featured">Featured</span>}
                        {product.original_price && product.original_price > product.price && (
                          <span className="badge sale">Sale</span>
                        )}
                        {product.stock_quantity === 0 && <span className="badge out-of-stock">Out of Stock</span>}
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    {siteSettings.homepage_products_show_favorite && (
                      <button 
                        className="favorite-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavoriteToggle(product.id);
                        }}
                      >
                        ❤️
                      </button>
                    )}
                  </div>
                )}
                
                {/* Product Info */}
                <div className="product-info">
                  <Link to={`/product/${product.slug}`} className="product-info-link">
                    {/* Category */}
                    {siteSettings.homepage_products_show_category && (
                      <div className="product-category">
                        {getCategoryName(product.category_id)}
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="product-name" style={{
                      color: siteSettings.homepage_products_product_name_color || '#333333',
                      fontFamily: siteSettings.homepage_products_product_name_font_family || 'Arial, sans-serif',
                      fontSize: `${siteSettings.homepage_products_product_name_font_size || 18}px`,
                      fontWeight: siteSettings.homepage_products_product_name_font_weight || 'bold',
                      fontStyle: siteSettings.homepage_products_product_name_font_style || 'normal'
                    }}>{product.name}</h3>
                    
                    {/* Price */}
                    {siteSettings.homepage_products_show_price && (
                      <div className="product-price">
                        <span className="current-price" style={{
                          color: siteSettings.homepage_products_product_price_color || '#007bff',
                          fontFamily: siteSettings.homepage_products_product_price_font_family || 'Arial, sans-serif',
                          fontSize: `${siteSettings.homepage_products_product_price_font_size || 16}px`,
                          fontWeight: siteSettings.homepage_products_product_price_font_weight || 'bold',
                          fontStyle: siteSettings.homepage_products_product_price_font_style || 'normal'
                        }}>₺{product.price}</span>
                        {siteSettings.homepage_products_show_original_price && product.original_price && product.original_price > product.price && (
                          <span className="original-price">₺{product.original_price}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Stock Status */}
                    {siteSettings.homepage_products_show_stock && (
                      <div className="product-stock">
                        {product.stock_quantity > 0 ? (
                          <span className="in-stock">In Stock ({product.stock_quantity})</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                    )}
                  </Link>
                  
                  {/* Buttons */}
                  <div className="product-buttons">
                    {siteSettings.homepage_products_show_details && (
                      <Link to={`/product/${product.slug}`} className="btn btn-details" style={{
                        backgroundColor: siteSettings.homepage_products_view_details_button_color || '#007bff',
                        color: siteSettings.homepage_products_view_details_button_text_color || '#ffffff',
                        fontFamily: siteSettings.homepage_products_view_details_button_font_family || 'Arial, sans-serif',
                        fontSize: `${siteSettings.homepage_products_view_details_button_font_size || 14}px`,
                        fontWeight: siteSettings.homepage_products_view_details_button_font_weight || 'normal',
                        fontStyle: siteSettings.homepage_products_view_details_button_font_style || 'normal',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}>
                        Details
                      </Link>
                    )}
                    {siteSettings.homepage_products_show_buy_now && product.stock_quantity > 0 && (
                      <button 
                        className="btn btn-buy-now"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        style={{
                          backgroundColor: siteSettings.homepage_products_add_to_cart_button_color || '#28a745',
                          color: siteSettings.homepage_products_add_to_cart_button_text_color || '#ffffff',
                          fontFamily: siteSettings.homepage_products_add_to_cart_button_font_family || 'Arial, sans-serif',
                          fontSize: `${siteSettings.homepage_products_add_to_cart_button_font_size || 14}px`,
                          fontWeight: siteSettings.homepage_products_add_to_cart_button_font_weight || 'normal',
                          fontStyle: siteSettings.homepage_products_add_to_cart_button_font_style || 'normal',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Button */}
          {siteSettings.homepage_products_show_view_all && (
            <div className="view-all-container">
              <a href={siteSettings.homepage_products_view_all_link} className="btn btn-view-all">
                {siteSettings.homepage_products_view_all_text}
              </a>
            </div>
          )}
        </section>
      )}

      {/* Homepage Products 2 */}
      {siteSettings.homepage_products2_show_section && displayProducts2.length > 0 && (
        <section 
          className="homepage-products-section homepage-products2-section"
          style={{
            backgroundColor: siteSettings.homepage_background_color || '#ffffff'
          }}
        >
          <div className="section-header">
            <h2 className="section-title">{siteSettings.homepage_products2_title}</h2>
            {siteSettings.homepage_products2_subtitle && siteSettings.homepage_products2_subtitle.trim() !== '' && (
              <p className="section-subtitle">{siteSettings.homepage_products2_subtitle}</p>
            )}
          </div>
          
          <div 
            className={`products-grid ${siteSettings.homepage_products2_card_style}`}
            style={{
              '--products-per-row': siteSettings.homepage_products2_per_row || 4,
              '--products-per-row-tablet': Math.min(siteSettings.homepage_products2_per_row || 4, 4),
              '--products-per-row-mobile': Math.min(siteSettings.homepage_products2_per_row || 4, 3),
              '--products-per-row-small': Math.min(siteSettings.homepage_products2_per_row || 4, 2),
              '--image-size': `${Math.max(180, Math.min(600, 1368 / (siteSettings.homepage_products2_per_row || 4) - 50))}px`,
              '--image-size-tablet': `${Math.max(180, Math.min(500, 1200 / Math.min(siteSettings.homepage_products2_per_row || 4, 4) - 50))}px`,
              '--image-size-mobile': `${Math.max(180, Math.min(400, 900 / Math.min(siteSettings.homepage_products2_per_row || 4, 3) - 50))}px`,
              '--image-size-small': `${Math.max(200, Math.min(350, 700 / Math.min(siteSettings.homepage_products2_per_row || 4, 2) - 50))}px`
            }}
          >
            {displayProducts2.map((product) => (
              <div 
                key={`product2-${product.id}`} 
                className={`product-card ${siteSettings.homepage_products2_card_shadow ? 'with-shadow' : ''} ${siteSettings.homepage_products2_card_hover_effect ? 'with-hover' : ''}`}
              >
                {/* Product Image */}
                {siteSettings.homepage_products2_show_images && product.images && product.images.length > 0 && (
                  <div className="product-image image-preview-hover">
                    <div style={{ position: 'relative' }}>
                      <Link to={`/product/${product.slug}`}>
                        <img 
                          src={`http://localhost:5005${product.images[0]}`} 
                          alt={product.name}
                          style={{
                            cursor: 'pointer',
                            display: 'block'
                          }}
                        />
                      </Link>
                      {(siteSettings.homepage_products2_enable_image_preview !== false) && (
                        <div 
                          className="image-zoom-overlay"
                          onClick={(e) => {
                            console.log('Homepage Products 2 - Clicked! Setting:', siteSettings.homepage_products2_enable_image_preview);
                            e.preventDefault();
                            e.stopPropagation();
                            const productImages = product.images.map(img => `http://localhost:5005${img}`);
                            openPreviewModal(productImages, 0, product.name);
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            cursor: 'zoom-in',
                            zIndex: 5
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Badges */}
                    {siteSettings.homepage_products2_show_badges && (
                      <div className="product-badges">
                        {product.is_featured && <span className="badge featured">Featured</span>}
                        {product.original_price && product.original_price > product.price && (
                          <span className="badge sale">Sale</span>
                        )}
                        {product.stock_quantity === 0 && <span className="badge out-of-stock">Out of Stock</span>}
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    {siteSettings.homepage_products2_show_favorite && (
                      <button 
                        className="favorite-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavoriteToggle(product.id);
                        }}
                      >
                        ❤️
                      </button>
                    )}
                  </div>
                )}
                
                {/* Product Info */}
                <div className="product-info">
                  <Link to={`/product/${product.slug}`} className="product-info-link">
                    {/* Category */}
                    {siteSettings.homepage_products2_show_category && (
                      <div className="product-category">
                        {getCategoryName(product.category_id)}
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="product-name" style={{
                      color: siteSettings.homepage_products2_product_name_color || '#333333',
                      fontFamily: siteSettings.homepage_products2_product_name_font_family || 'Arial, sans-serif',
                      fontSize: `${siteSettings.homepage_products2_product_name_font_size || 18}px`,
                      fontWeight: siteSettings.homepage_products2_product_name_font_weight || 'bold',
                      fontStyle: siteSettings.homepage_products2_product_name_font_style || 'normal'
                    }}>{product.name}</h3>
                    
                    {/* Price */}
                    {siteSettings.homepage_products2_show_price && (
                      <div className="product-price">
                        <span className="current-price" style={{
                          color: siteSettings.homepage_products2_product_price_color || '#007bff',
                          fontFamily: siteSettings.homepage_products2_product_price_font_family || 'Arial, sans-serif',
                          fontSize: `${siteSettings.homepage_products2_product_price_font_size || 16}px`,
                          fontWeight: siteSettings.homepage_products2_product_price_font_weight || 'bold',
                          fontStyle: siteSettings.homepage_products2_product_price_font_style || 'normal'
                        }}>₺{product.price}</span>
                        {siteSettings.homepage_products2_show_original_price && product.original_price && product.original_price > product.price && (
                          <span className="original-price">₺{product.original_price}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Stock Status */}
                    {siteSettings.homepage_products2_show_stock && (
                      <div className="product-stock">
                        {product.stock_quantity > 0 ? (
                          <span className="in-stock">In Stock ({product.stock_quantity})</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                    )}
                  </Link>
                  
                  {/* Buttons */}
                  <div className="product-buttons">
                    {siteSettings.homepage_products2_show_details && (
                      <Link to={`/product/${product.slug}`} className="btn btn-details" style={{
                        backgroundColor: siteSettings.homepage_products2_view_details_button_color || '#007bff',
                        color: siteSettings.homepage_products2_view_details_button_text_color || '#ffffff',
                        fontFamily: siteSettings.homepage_products2_view_details_button_font_family || 'Arial, sans-serif',
                        fontSize: `${siteSettings.homepage_products2_view_details_button_font_size || 14}px`,
                        fontWeight: siteSettings.homepage_products2_view_details_button_font_weight || 'normal',
                        fontStyle: siteSettings.homepage_products2_view_details_button_font_style || 'normal',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}>
                        Details
                      </Link>
                    )}
                    {siteSettings.homepage_products2_show_buy_now && product.stock_quantity > 0 && (
                      <button 
                        className="btn btn-buy-now"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        style={{
                          backgroundColor: siteSettings.homepage_products2_add_to_cart_button_color || '#28a745',
                          color: siteSettings.homepage_products2_add_to_cart_button_text_color || '#ffffff',
                          fontFamily: siteSettings.homepage_products2_add_to_cart_button_font_family || 'Arial, sans-serif',
                          fontSize: `${siteSettings.homepage_products2_add_to_cart_button_font_size || 14}px`,
                          fontWeight: siteSettings.homepage_products2_add_to_cart_button_font_weight || 'normal',
                          fontStyle: siteSettings.homepage_products2_add_to_cart_button_font_style || 'normal',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Button */}
          {siteSettings.homepage_products2_show_view_all && (
            <div className="view-all-container">
              <a href={siteSettings.homepage_products2_view_all_link} className="btn btn-view-all">
                {siteSettings.homepage_products2_view_all_text}
              </a>
            </div>
          )}
        </section>
      )}

      {/* Highlights */}
      <section className="features-section">
        <div className="feature-card">🚚 Fast Shipping</div>
        <div className="feature-card">🔒 Secure Checkout</div>
        <div className="feature-card">📦 Quality Guarantee</div>
      </section>
      
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        images={previewModal.images}
        currentIndex={previewModal.currentIndex}
        altText={previewModal.altText}
      />
    </div>
  );
};

export default Home;
