import React from 'react';

const Products = () => {
  return (
    <div className="products">
      <div className="container">
        <h1>Ürünler</h1>
        <p>Ürünlerimizi keşfedin</p>
        <div className="products-grid">
          <div className="product-card">
            <h3>Örnek Ürün 1</h3>
            <p>Ürün açıklaması</p>
            <span className="price">₺100</span>
          </div>
          <div className="product-card">
            <h3>Örnek Ürün 2</h3>
            <p>Ürün açıklaması</p>
            <span className="price">₺200</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 