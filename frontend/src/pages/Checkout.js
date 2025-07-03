import React from 'react';

const Checkout = () => {
  return (
    <div className="checkout fade-in">
      <div className="container">
        <h1>Checkout</h1>
        <p>Complete your order</p>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form>
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" placeholder="Your email address" />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input type="tel" placeholder="Your phone number" />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea placeholder="Your shipping address" rows="3"></textarea>
              </div>
            </form>
          </div>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-item">
              <span>Subtotal: $0.00</span>
            </div>
            <div className="order-item">
              <span>Shipping: $10.00</span>
            </div>
            <div className="order-total">
              <span>Total: $10.00</span>
            </div>
            <button className="btn btn-primary">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 