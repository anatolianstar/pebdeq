import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="register fade-in">
      <div className="container">
        <h1>Register</h1>
        <form className="register-form">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" placeholder="Your email address" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" placeholder="Your password" />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input type="password" placeholder="Confirm your password" />
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register; 