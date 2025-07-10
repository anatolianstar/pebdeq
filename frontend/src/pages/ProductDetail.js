import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5005/api/products/${slug}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data.product);
        // Set default variation if product has variations
        if (data.product.has_variations && data.product.variation_options && data.product.variation_options.length > 0) {
          setSelectedVariation(data.product.variation_options[0]);
        }
      } else {
        setError(data.error || 'Product not found');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      const cartItem = {
        product_id: product.id,
        quantity: quantity,
        variation: selectedVariation ? {
          name: selectedVariation.name,
          price_modifier: selectedVariation.price_modifier || 0
        } : null
      };

      await addToCart(cartItem);
              alert('Product added to cart!');
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    let price = product.price;
    if (selectedVariation && selectedVariation.price_modifier) {
      price += selectedVariation.price_modifier;
    }
    return price;
  };

  const getCurrentStock = () => {
    if (!product) return 0;
    if (selectedVariation && selectedVariation.stock !== undefined) {
      return selectedVariation.stock;
    }
    return product.stock_quantity;
  };

  const getCurrentImages = () => {
    if (!product) return [];
    if (selectedVariation && selectedVariation.images && selectedVariation.images.length > 0) {
      return selectedVariation.images;
    }
    return product.images || [];
  };

  const openLightbox = (imageIndex) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    const images = getCurrentImages();
    setLightboxImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getCurrentImages();
    setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading">
            <h2>Loading product...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error">
            <h2>Product not found</h2>
            <p>{error}</p>
            <button onClick={() => window.history.back()} className="btn btn-primary">
                              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = getCurrentImages();
  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  
  return (
    <div className="product-detail fade-in">
      <div className="container">
        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image" onClick={() => images.length > 0 && openLightbox(selectedImage)}>
              {images.length > 0 ? (
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click for large image"
                />
              ) : (
                <div className="no-image">
                  <span>📦</span>
                  <p>No image</p>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                    onDoubleClick={() => openLightbox(index)}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Double click for large image"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="product-meta">
                <span className="category">{product.category}</span>
                {product.is_featured && (
                  <span className="featured-badge">Öne Çıkan</span>
                )}
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">${currentPrice.toFixed(2)}</span>
              {product.original_price && product.original_price > currentPrice && (
                <span className="original-price">${product.original_price.toFixed(2)}</span>
              )}
            </div>

            <div className="product-stock">
              {currentStock > 0 ? (
                <span className="in-stock">
                                          ✅ In stock ({currentStock} units)
                </span>
              ) : (
                                  <span className="out-of-stock">❌ Out of stock</span>
              )}
            </div>

            {/* Variations */}
            {product.has_variations && product.variation_options && product.variation_options.length > 0 && (
              <div className="product-variations">
                <h3>
                  {product.variation_type === 'custom' ? product.variation_name : 
                                        product.variation_type === 'color' ? 'Color' :
                                       product.variation_type === 'size' ? 'Size' :
                                        product.variation_type === 'weight' ? 'Weight' : 'Options'}
                </h3>
                <div className="variation-options">
                  {product.variation_options.map((option, index) => (
                                         <button
                       key={index}
                       className={`variation-option ${selectedVariation === option ? 'selected' : ''}`}
                       onClick={() => setSelectedVariation(option)}
                       disabled={option.stock === 0}
                     >
                       <span className="option-name">{option.name}</span>
                       <span className="option-price">
                         ${(product.price + (option.price_modifier || 0)).toFixed(2)}
                       </span>
                       {option.stock === 0 && (
                         <span className="out-of-stock-badge">Out of stock</span>
                       )}
                     </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Miktar:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="purchase-buttons">
                <button 
                  className="btn btn-primary add-to-cart"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || addingToCart}
                >
                                      {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button 
                  className="btn btn-secondary buy-now"
                  disabled={currentStock === 0}
                >
                  💳 Buy Now
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="product-description">
                              <h3>Product Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="product-details">
                              <h3>Product Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                                      <span className="label">Category:</span>
                  <span className="value">{product.category}</span>
                </div>
                <div className="detail-item">
                                        <span className="label">Stock Code:</span>
                  <span className="value">{product.id}</span>
                </div>
                {product.weight && (
                  <div className="detail-item">
                                          <span className="label">Weight:</span>
                    <span className="value">{product.weight}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="detail-item">
                                          <span className="label">Sizes:</span>
                    <span className="value">{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div className="detail-item">
                    <span className="label">Material:</span>
                    <span className="value">{product.material}</span>
                  </div>
                )}
                <div className="detail-item">
                                      <span className="label">Status:</span>
                                      <span className="value">{product.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            {/* Video if available */}
            {product.video_url && (
              <div className="product-video">
                <h3>Product Video</h3>
                <video controls width="100%">
                  <source src={product.video_url} type="video/mp4" />
                                      Your browser does not support video playback.
                </video>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
            
            {images.length > 1 && (
              <button className="lightbox-prev" onClick={prevImage}>
                ‹
              </button>
            )}
            
            <div className="lightbox-image-container">
              <img 
                src={images[lightboxImageIndex]} 
                alt={`${product.name} ${lightboxImageIndex + 1}`}
                className="lightbox-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              
              <div className="lightbox-info">
                <h3>{product.name}</h3>
                <p>{lightboxImageIndex + 1} / {images.length}</p>
              </div>
            </div>
            
            {images.length > 1 && (
              <button className="lightbox-next" onClick={nextImage}>
                ›
              </button>
            )}
            
            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="lightbox-thumbnails">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`lightbox-thumbnail ${lightboxImageIndex === index ? 'active' : ''}`}
                    onClick={() => setLightboxImageIndex(index)}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .product-detail {
          padding: 2rem 0;
          min-height: 70vh;
        }

        .product-detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-top: 2rem;
        }

        .product-images .main-image {
          width: 100%;
          height: 400px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .product-images .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-images .no-image {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #f5f5f5;
          color: #666;
        }

        .product-images .no-image span {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .image-thumbnails {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .image-thumbnails img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.3s;
        }

        .image-thumbnails img.active {
          border-color: #007bff;
        }

        .product-info {
          padding: 1rem 0;
        }

        .product-header h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .product-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .product-meta .category {
          background: #e9ecef;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          color: #666;
        }

        .featured-badge {
          background: #28a745;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .product-price {
          margin: 1rem 0;
        }

        .current-price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }

        .original-price {
          font-size: 1.1rem;
          color: #666;
          text-decoration: line-through;
          margin-left: 0.5rem;
        }

        .product-stock {
          margin: 1rem 0;
          font-weight: 500;
        }

        .in-stock {
          color: #28a745;
        }

        .out-of-stock {
          color: #dc3545;
        }

        .product-variations {
          margin: 2rem 0;
        }

        .product-variations h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .variation-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .variation-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 80px;
        }

        .variation-option:hover {
          border-color: #007bff;
        }

        .variation-option.selected {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .variation-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

                 .option-name {
           font-weight: 500;
           margin-bottom: 0.25rem;
         }

         .option-price {
           font-size: 0.875rem;
           color: #007bff;
           font-weight: 500;
         }

        .out-of-stock-badge {
          font-size: 0.75rem;
          color: #dc3545;
          margin-top: 0.25rem;
        }

        .purchase-section {
          margin: 2rem 0;
          padding: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls button {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }

        .quantity-controls .quantity {
          padding: 0.25rem 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 40px;
          text-align: center;
        }

        .purchase-buttons {
          display: flex;
          gap: 1rem;
        }

        .purchase-buttons .btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #28a745;
          color: white;
        }

        .btn-secondary:hover {
          background: #1e7e34;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .product-description, .product-details {
          margin: 2rem 0;
        }

        .product-description h3, .product-details h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .detail-item .label {
          font-weight: 500;
          color: #666;
        }

        .detail-item .value {
          color: #333;
        }

        .product-video {
          margin: 2rem 0;
        }

        .product-video h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .loading, .error {
          text-align: center;
          padding: 3rem;
        }

        .error .btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Image Lightbox Styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease-in-out;
        }

        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lightbox-close {
          position: absolute;
          top: -40px;
          right: -40px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          z-index: 1001;
          transition: all 0.3s ease;
        }

        .lightbox-close:hover {
          background: white;
          transform: scale(1.1);
        }

        .lightbox-prev, .lightbox-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          z-index: 1001;
          transition: all 0.3s ease;
        }

        .lightbox-prev {
          left: -60px;
        }

        .lightbox-next {
          right: -60px;
        }

        .lightbox-prev:hover, .lightbox-next:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-image-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .lightbox-image {
          max-width: 80vw;
          max-height: 70vh;
          object-fit: contain;
          display: block;
        }

        .lightbox-info {
          padding: 15px 20px;
          background: white;
          text-align: center;
          border-top: 1px solid #eee;
          width: 100%;
        }

        .lightbox-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 18px;
        }

        .lightbox-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .lightbox-thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          max-width: 80vw;
          overflow-x: auto;
        }

        .lightbox-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .lightbox-thumbnail:hover {
          border-color: #007bff;
          transform: scale(1.05);
        }

        .lightbox-thumbnail.active {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .product-detail-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .purchase-buttons {
            flex-direction: column;
          }

          .variation-options {
            justify-content: center;
          }

          .lightbox-close {
            top: 10px;
            right: 10px;
          }

          .lightbox-prev {
            left: 10px;
          }

          .lightbox-next {
            right: 10px;
          }

          .lightbox-image {
            max-width: 95vw;
            max-height: 60vh;
          }

          .lightbox-thumbnails {
            max-width: 95vw;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail; 