import React from 'react';
import { useParams } from 'react-router-dom';

const BlogPost = () => {
  const { slug } = useParams();
  
  return (
    <div className="blog-post fade-in">
      <div className="container">
        <h1>Blog Post</h1>
        <p>Blog slug: {slug}</p>
        
        <div className="blog-post-content">
          <h2>Blog Post Title</h2>
          <div className="blog-meta">
            <span className="blog-date">May 1, 2024</span>
            <span className="blog-author">By PEBDEQ Team</span>
          </div>
          <p>Blog post content will be here. This is a sample blog post about our products and services.</p>
          
          <h3>About Our Services</h3>
          <p>We offer a wide range of services including 3D printing, vintage bulb collection, professional tools, and laser engraving.</p>
          
          <div className="blog-actions">
            <button className="btn btn-primary">Share</button>
            <button className="btn btn-secondary">Like</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost; 