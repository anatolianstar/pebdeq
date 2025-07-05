import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  // Get query parameters
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = searchParams.get('page') || 1;
  const sort = searchParams.get('sort') || 'newest';

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [category, search, page, sort]);

  // Fetch categories for filter
  useEffect(() => {
    fetchCategories();
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
      const response = await fetch('http://localhost:5005/api/categories/');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="no-image">
            <span>📦</span>
          </div>
        )}
        {product.is_featured && (
          <span className="featured-badge">Featured</span>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-price">
          <span className="current-price">${product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="original-price">${product.original_price}</span>
          )}
        </div>
        <div className="product-stock">
          {product.stock_quantity > 0 ? (
            <span className="in-stock">In Stock ({product.stock_quantity})</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        {product.has_variations && product.variation_type && (
          <div className="product-variations">
            <small>
              {product.variation_type === 'custom' ? product.variation_name : 
               product.variation_type === 'color' ? 'Renk' :
               product.variation_type === 'size' ? 'Boyut' :
               product.variation_type === 'weight' ? 'Ağırlık' : 'Seçenekler'} varyasyonları mevcut
            </small>
          </div>
        )}
        <div className="product-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = `/product/${product.slug}`}
          >
            View Details
          </button>
          <button 
            className="btn btn-secondary"
            disabled={product.stock_quantity === 0}
          >
            Add to Cart
          </button>
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
    <div className="products">
      <div className="container">
        <div className="products-header">
          <h1>Products</h1>
          <p>Discover our amazing collection of products</p>
        </div>

        {/* Search and Filters */}
        <div className="products-controls">
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
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination />

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
    </div>
  );
};

export default Products; 