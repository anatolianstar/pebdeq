import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Paneli</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Toplam Ürün</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Toplam Sipariş</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Toplam Kullanıcı</h3>
            <p>1</p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="btn btn-primary">Ürün Ekle</button>
          <button className="btn btn-secondary">Siparişleri Gör</button>
          <button className="btn btn-info">Kullanıcıları Gör</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 