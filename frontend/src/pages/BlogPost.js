import React from 'react';
import { useParams } from 'react-router-dom';

const BlogPost = () => {
  const { slug } = useParams();
  
  return (
    <div className="blog-post">
      <div className="container">
        <h1>Blog Yazısı</h1>
        <p>Blog slug: {slug}</p>
        <div className="post-content">
          <h2>Blog Yazısı Başlığı</h2>
          <p>Blog yazısı içeriği buraya gelecek</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPost; 