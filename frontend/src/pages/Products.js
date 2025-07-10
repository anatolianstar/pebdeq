import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../pages/Home.css'; // Import CSS for card styles
import ImagePreviewModal from '../components/ImagePreviewModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewModal, setPreviewModal] = useState({ isOpen: false, images: [], currentIndex: 0, altText: '' });
  const [siteSettings, setSiteSettings] = useState({
    products_page_per_row: 4,
    products_page_max_items_per_page: 12,
    products_page_show_images: true,
    products_page_show_favorite: true,
    products_page_show_buy_now: true,
    products_page_show_details: true,
    products_page_show_price: true,
    products_page_show_original_price: true,
    products_page_show_stock: true,
    products_page_show_category: true,
    products_page_default_sort_by: 'newest',
    products_page_card_style: 'modern',
    products_page_card_shadow: true,
    products_page_card_hover_effect: true,
    products_page_show_badges: true,
    products_page_show_rating: false,
    products_page_show_quick_view: false,
    products_page_enable_pagination: true,
    products_page_enable_filters: true,
    products_page_enable_search: true
  });

  // Get query parameters
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = searchParams.get('page') || 1;
  const sort = searchParams.get('sort') || siteSettings.products_page_default_sort_by;

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [category, search, page, sort, siteSettings.products_page_max_items_per_page]);

  // Fetch categories for filter
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch site settings
  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5005/api/products/?';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('sort', sort);
      params.append('per_page', siteSettings.products_page_max_items_per_page || 18);
      
      url += params.toString();
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/site-settings');
      const data = await response.json();
      if (response.ok) {
        console.log('Products page - Site settings loaded:', data);
        console.log('Products page - Image preview setting:', data.products_page_enable_image_preview);
        setSiteSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  };

  const handleCategoryFilter = (categorySlug) => {
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page'); // Reset page when filtering
    setSearchParams(newParams);
  };

  const handleSort = (sortBy) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortBy);
    newParams.delete('page'); // Reset page when sorting
    setSearchParams(newParams);
  };

  const handleSearch = (searchTerm) => {
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    newParams.delete('page'); // Reset page when searching
    setSearchParams(newParams);
  };

  const openPreviewModal = (images, currentIndex, altText) => {
    setPreviewModal({ isOpen: true, images, currentIndex, altText });
  };

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, images: [], currentIndex: 0, altText: '' });
  };

  const ProductCard = ({ product }) => (
    <div className={`product-card ${siteSettings.products_page_card_shadow ? 'with-shadow' : ''} ${siteSettings.products_page_card_hover_effect ? 'with-hover' : ''}`}>
      {/* Product Image */}
      {siteSettings.products_page_show_images && (
        <div className="product-image image-preview-hover">
          {product.images && product.images.length > 0 ? (
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
              {(siteSettings.products_page_enable_image_preview !== false) && (
                <div 
                  className="image-zoom-overlay"
                  onClick={(e) => {
                    console.log('Products Page - Clicked! Setting:', siteSettings.products_page_enable_image_preview);
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
          ) : (
            <div className="no-image">
              <span>📦</span>
            </div>
          )}
          
          {/* Badges */}
          {siteSettings.products_page_show_badges && (
            <div className="product-badges">
              {product.is_featured && <span className="badge featured">Featured</span>}
              {product.original_price && product.original_price > product.price && (
                <span className="badge sale">Sale</span>
              )}
              {product.stock_quantity === 0 && <span className="badge out-of-stock">Out of Stock</span>}
            </div>
          )}
          
          {/* Favorite Button */}
          {siteSettings.products_page_show_favorite && (
            <button 
              className="favorite-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle favorite functionality
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
          {siteSettings.products_page_show_category && (
            <div className="product-category" style={{
              color: siteSettings.products_page_product_category_color || '#666666',
              fontFamily: siteSettings.products_page_product_category_font_family || 'Arial, sans-serif',
              fontSize: `${siteSettings.products_page_product_category_font_size || 14}px`,
              fontWeight: siteSettings.products_page_product_category_font_weight || 'normal',
              fontStyle: siteSettings.products_page_product_category_font_style || 'normal'
            }}>
              {product.category}
            </div>
          )}
          
          {/* Product Name */}
          <h3 className="product-name" style={{
            color: siteSettings.products_page_product_name_color || '#333333',
            fontFamily: siteSettings.products_page_product_name_font_family || 'Arial, sans-serif',
            fontSize: `${siteSettings.products_page_product_name_font_size || 18}px`,
            fontWeight: siteSettings.products_page_product_name_font_weight || 'bold',
            fontStyle: siteSettings.products_page_product_name_font_style || 'normal'
          }}>{product.name}</h3>
          
          {/* Price */}
          {siteSettings.products_page_show_price && (
            <div className="product-price">
              <span className="current-price" style={{
                color: siteSettings.products_page_product_price_color || '#007bff',
                fontFamily: siteSettings.products_page_product_price_font_family || 'Arial, sans-serif',
                fontSize: `${siteSettings.products_page_product_price_font_size || 16}px`,
                fontWeight: siteSettings.products_page_product_price_font_weight || 'bold',
                fontStyle: siteSettings.products_page_product_price_font_style || 'normal'
              }}>₺{product.price}</span>
              {siteSettings.products_page_show_original_price && product.original_price && product.original_price > product.price && (
                <span className="original-price">₺{product.original_price}</span>
              )}
            </div>
          )}
          
          {/* Stock Status */}
          {siteSettings.products_page_show_stock && (
            <div className="product-stock">
              {product.stock_quantity > 0 ? (
                <span className="in-stock" style={{
                  color: siteSettings.products_page_stock_info_color || '#28a745',
                  fontFamily: siteSettings.products_page_stock_info_font_family || 'Arial, sans-serif',
                  fontSize: `${siteSettings.products_page_stock_info_font_size || 12}px`,
                  fontWeight: siteSettings.products_page_stock_info_font_weight || 'normal',
                  fontStyle: siteSettings.products_page_stock_info_font_style || 'normal'
                }}>In Stock ({product.stock_quantity})</span>
              ) : (
                <span className="out-of-stock" style={{
                  color: '#dc3545',
                  fontFamily: siteSettings.products_page_stock_info_font_family || 'Arial, sans-serif',
                  fontSize: `${siteSettings.products_page_stock_info_font_size || 12}px`,
                  fontWeight: siteSettings.products_page_stock_info_font_weight || 'normal',
                  fontStyle: siteSettings.products_page_stock_info_font_style || 'normal'
                }}>Out of Stock</span>
              )}
            </div>
          )}
          
          {/* Variations */}
          {product.has_variations && product.variation_type && (
            <div className="product-variations">
              <small>
                {product.variation_type === 'custom' ? product.variation_name : 
                                    product.variation_type === 'color' ? 'Color' :
                                         product.variation_type === 'size' ? 'Size' :
                                    product.variation_type === 'weight' ? 'Weight' : 'Options'} variations available
              </small>
            </div>
          )}
        </Link>
        
        {/* Buttons */}
        <div className="product-buttons">
          {siteSettings.products_page_show_details && (
            <Link to={`/product/${product.slug}`} className="btn btn-details" style={{
              backgroundColor: siteSettings.products_page_view_details_button_color || '#007bff',
              color: siteSettings.products_page_view_details_button_text_color || '#ffffff',
              fontFamily: siteSettings.products_page_view_details_button_font_family || 'Arial, sans-serif',
              fontSize: `${siteSettings.products_page_view_details_button_font_size || 14}px`,
              fontWeight: siteSettings.products_page_view_details_button_font_weight || 'normal',
              fontStyle: siteSettings.products_page_view_details_button_font_style || 'normal',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              textDecoration: 'none',
              display: 'inline-block',
              cursor: 'pointer'
            }}>
              View Details
            </Link>
          )}
          {siteSettings.products_page_show_buy_now && (
            <button 
              className="btn btn-buy-now"
              disabled={product.stock_quantity === 0}
              style={{
                backgroundColor: siteSettings.products_page_add_to_cart_button_color || '#28a745',
                color: siteSettings.products_page_add_to_cart_button_text_color || '#ffffff',
                fontFamily: siteSettings.products_page_add_to_cart_button_font_family || 'Arial, sans-serif',
                fontSize: `${siteSettings.products_page_add_to_cart_button_font_size || 14}px`,
                fontWeight: siteSettings.products_page_add_to_cart_button_font_weight || 'normal',
                fontStyle: siteSettings.products_page_add_to_cart_button_font_style || 'normal',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                opacity: product.stock_quantity === 0 ? 0.6 : 1
              }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const Pagination = () => {
    if (!pagination.pages || pagination.pages <= 1) return null;

    const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);
    
    return (
      <div className="pagination">
        {pages.map(pageNum => (
          <button
            key={pageNum}
            className={`pagination-btn ${pageNum === pagination.page ? 'active' : ''}`}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', pageNum);
              setSearchParams(newParams);
            }}
          >
            {pageNum}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products">
        <div className="container">
          <div className="loading">
            <h2>Loading products...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products">
        <div className="container">
          <div className="error">
            <h2>Error loading products</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="products"
      style={{
        backgroundColor: siteSettings.products_page_background_color || '#ffffff'
      }}
    >
      <div className="container products-container">
        <div className="products-header">
          <h1 style={{
            color: siteSettings.products_page_title_color || '#333333',
            fontFamily: siteSettings.products_page_title_font_family || 'Arial, sans-serif',
            fontSize: `${siteSettings.products_page_title_font_size || 32}px`,
            fontWeight: siteSettings.products_page_title_font_weight || 'bold',
            fontStyle: siteSettings.products_page_title_font_style || 'normal'
          }}>Products</h1>
          <p style={{
            color: siteSettings.products_page_subtitle_color || '#666666',
            fontFamily: siteSettings.products_page_subtitle_font_family || 'Arial, sans-serif',
            fontSize: `${siteSettings.products_page_subtitle_font_size || 16}px`,
            fontWeight: siteSettings.products_page_subtitle_font_weight || 'normal',
            fontStyle: siteSettings.products_page_subtitle_font_style || 'normal'
          }}>Discover our amazing collection of products</p>
        </div>

        {/* Search and Filters */}
        {(siteSettings.products_page_enable_search || siteSettings.products_page_enable_filters) && (
          <div className="products-controls">
            {/* Search Section */}
            {siteSettings.products_page_enable_search && (
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search products..."
                  defaultValue={search || ''}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.target.value);
                    }
                  }}
                  className="search-input"
                />
                <button 
                  onClick={() => handleSearch(document.querySelector('.search-input').value)}
                  className="search-btn"
                >
                  Search
                </button>
              </div>
            )}

            {/* Filter Section */}
            {siteSettings.products_page_enable_filters && (
              <div className="filter-section">
                <div className="category-filters">
                  <button 
                    className={`filter-btn ${!category ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(null)}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`filter-btn ${category === cat.slug ? 'active' : ''}`}
                      onClick={() => handleCategoryFilter(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="sort-section">
                  <select 
                    value={sort} 
                    onChange={(e) => handleSort(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div 
          className={`products-grid ${siteSettings.products_page_card_style}`}
          style={{
            '--products-per-row': siteSettings.products_page_per_row || 4,
            '--products-per-row-tablet': Math.min(siteSettings.products_page_per_row || 4, 4),
            '--products-per-row-mobile': Math.min(siteSettings.products_page_per_row || 4, 3),
            '--products-per-row-small': Math.min(siteSettings.products_page_per_row || 4, 2),
            '--image-size': `${Math.max(180, Math.min(600, 1368 / (siteSettings.products_page_per_row || 4) - 50))}px`,
            '--image-size-tablet': `${Math.max(180, Math.min(500, 1200 / Math.min(siteSettings.products_page_per_row || 4, 4) - 50))}px`,
            '--image-size-mobile': `${Math.max(180, Math.min(400, 900 / Math.min(siteSettings.products_page_per_row || 4, 3) - 50))}px`,
            '--image-size-small': `${Math.max(200, Math.min(350, 700 / Math.min(siteSettings.products_page_per_row || 4, 2) - 50))}px`
          }}
        >
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products" style={{
              gridColumn: `1 / -1`,
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {siteSettings.products_page_enable_pagination && <Pagination />}

        {/* Results Info */}
        {pagination.total > 0 && (
          <div className="results-info">
            <p>
              Showing {(pagination.page - 1) * pagination.per_page + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </p>
          </div>
        )}
      </div>
      
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

export default Products; 