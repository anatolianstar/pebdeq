import React from 'react';

const Cart = () => {
  return (
    <div className="cart fade-in">
      <div className="container">
        <h1>Shopping Cart</h1>
        <p>Your cart is currently empty</p>
        
        <div className="cart-actions">
          <button className="btn btn-primary">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 