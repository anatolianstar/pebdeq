import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="register">
      <div className="container">
        <h1>Kayıt Ol</h1>
        <form className="register-form">
          <div className="form-group">
            <label>Ad:</label>
            <input type="text" placeholder="Adınız" />
          </div>
          <div className="form-group">
            <label>Soyad:</label>
            <input type="text" placeholder="Soyadınız" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>Şifre:</label>
            <input type="password" placeholder="Şifreniz" />
          </div>
          <button type="submit" className="btn btn-primary">Kayıt Ol</button>
        </form>
        <p>Hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
      </div>
    </div>
  );
};

export default Register; 