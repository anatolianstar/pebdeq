import React from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  return (
    <div className="cart">
      <div className="container">
        <h1>Sepet</h1>
        <p>Sepetinizde henüz ürün bulunmuyor</p>
        <Link to="/products" className="btn btn-primary">Alışverişe Devam Et</Link>
      </div>
    </div>
  );
};

export default Cart; 