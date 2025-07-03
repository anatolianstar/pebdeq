import React from 'react';

const Blog = () => {
  return (
    <div className="blog fade-in">
      <div className="container">
        <h1>Blog</h1>
        <p>Read our latest articles</p>
        
        <div className="blog-posts">
          <div className="blog-post-card">
            <h3>Sample Blog Post 1</h3>
            <p>Blog post description</p>
            <span className="blog-date">May 1, 2024</span>
          </div>
          <div className="blog-post-card">
            <h3>Sample Blog Post 2</h3>
            <p>Blog post description</p>
            <span className="blog-date">April 19, 2024</span>
          </div>
          <div className="blog-post-card">
            <h3>3D Printing Tips</h3>
            <p>Learn the best practices for 3D printing</p>
            <span className="blog-date">April 15, 2024</span>
          </div>
          <div className="blog-post-card">
            <h3>Vintage Bulb Collection</h3>
            <p>Explore our collection of vintage light bulbs</p>
            <span className="blog-date">April 10, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 