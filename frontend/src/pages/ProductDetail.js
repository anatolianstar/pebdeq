import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { slug } = useParams();
  
  return (
    <div className="product-detail">
      <div className="container">
        <h1>Ürün Detay</h1>
        <p>Ürün slug: {slug}</p>
        <div className="product-info">
          <h2>Ürün Başlığı</h2>
          <p>Ürün açıklaması buraya gelecek</p>
          <span className="price">₺100</span>
          <button className="btn btn-primary">Sepete Ekle</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 