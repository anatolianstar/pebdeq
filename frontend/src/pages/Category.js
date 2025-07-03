import React from 'react';
import { useParams } from 'react-router-dom';

const Category = () => {
  const { slug } = useParams();
  
  return (
    <div className="category">
      <div className="container">
        <h1>Kategori</h1>
        <p>Kategori slug: {slug}</p>
        <div className="category-products">
          <p>Bu kategorideki ürünler burada listelenecek</p>
        </div>
      </div>
    </div>
  );
};

export default Category; 