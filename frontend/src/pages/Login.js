import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="login fade-in">
      <div className="container">
        <h1>Login</h1>
        <form className="login-form">
          <div className="form-group">
            <label>Email:</label>
            <input type="email" placeholder="Your email address" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" placeholder="Your password" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" /> Remember me
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </div>
    </div>
  );
};

export default Login; 