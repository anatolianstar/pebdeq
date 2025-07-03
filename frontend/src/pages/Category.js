import React from 'react';
import { useParams } from 'react-router-dom';

const Category = () => {
  const { slug } = useParams();
  
  return (
    <div className="category fade-in">
      <div className="container">
        <h1>Category</h1>
        <p>Category slug: {slug}</p>
        
        <p>Products in this category will be listed here</p>
      </div>
    </div>
  );
};

export default Category; 