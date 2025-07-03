import React from 'react';

const Blog = () => {
  return (
    <div className="blog">
      <div className="container">
        <h1>Blog</h1>
        <p>En son yazılarımızı okuyun</p>
        <div className="blog-posts">
          <div className="post-card">
            <h3>Örnek Blog Yazısı 1</h3>
            <p>Blog yazısı açıklaması</p>
            <span className="date">2024-01-01</span>
          </div>
          <div className="post-card">
            <h3>Örnek Blog Yazısı 2</h3>
            <p>Blog yazısı açıklaması</p>
            <span className="date">2024-01-02</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 