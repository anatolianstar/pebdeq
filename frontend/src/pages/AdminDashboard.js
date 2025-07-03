import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard fade-in">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <span className="stat-number">0</span>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <span className="stat-number">0</span>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <span className="stat-number">0</span>
          </div>
        </div>
        
        <div className="admin-actions">
          <button className="btn btn-primary">Add Product</button>
          <button className="btn btn-secondary">View Orders</button>
          <button className="btn btn-secondary">Manage Users</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 