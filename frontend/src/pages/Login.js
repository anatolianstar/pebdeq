import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="login">
      <div className="container">
        <h1>Giriş Yap</h1>
        <form className="login-form">
          <div className="form-group">
            <label>Email:</label>
            <input type="email" placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>Şifre:</label>
            <input type="password" placeholder="Şifreniz" />
          </div>
          <button type="submit" className="btn btn-primary">Giriş Yap</button>
        </form>
        <p>Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link></p>
      </div>
    </div>
  );
};

export default Login; 