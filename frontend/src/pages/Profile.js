import React from 'react';

const Profile = () => {
  return (
    <div className="profile">
      <div className="container">
        <h1>Profil</h1>
        <div className="profile-info">
          <h2>Kullanıcı Bilgileri</h2>
          <p>Ad: Kullanıcı Adı</p>
          <p>Email: user@example.com</p>
          <p>Üyelik Tarihi: 2024-01-01</p>
        </div>
        <div className="profile-actions">
          <button className="btn btn-primary">Profili Düzenle</button>
          <button className="btn btn-secondary">Siparişlerim</button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 