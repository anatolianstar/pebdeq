import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { slug } = useParams();
  
  return (
    <div className="product-detail fade-in">
      <div className="container">
        <h1>Product Detail</h1>
        <p>Product slug: {slug}</p>
        
        <h2>Product Title</h2>
        <p>Product description will be here</p>
        
        <div className="product-actions">
          <button className="btn btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 