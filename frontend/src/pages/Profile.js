import React from 'react';

const Profile = () => {
  return (
    <div className="profile fade-in">
      <div className="container">
        <h1>User Profile</h1>
        <div className="profile-info">
          <h2>User Information</h2>
          <p>Name: John Doe</p>
          <p>Email: john@example.com</p>
          <p>Member since: January 2024</p>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-secondary">Change Password</button>
          <button className="btn btn-danger">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 