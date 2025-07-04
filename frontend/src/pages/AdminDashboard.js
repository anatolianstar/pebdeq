import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category_id: '',
    images: [],
    video_url: '',
    is_featured: false,
    is_active: true
  });

  const [editingProduct, setEditingProduct] = useState(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [uploadingProductVideo, setUploadingProductVideo] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products', { headers: getAuthHeaders() }),
        fetch('/api/admin/orders', { headers: getAuthHeaders() })
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (productsRes.ok && ordersRes.ok) {
        const totalRevenue = ordersData.orders.reduce((sum, order) => sum + order.total_amount, 0);
        
        setStats({
          totalProducts: productsData.products.length,
          totalOrders: ordersData.orders.length,
          totalUsers: ordersData.orders.length, // Approximation
          totalRevenue: totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error fetching messages');
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...newProduct,
        slug: newProduct.slug || generateSlug(newProduct.name),
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity),
        category_id: parseInt(newProduct.category_id)
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setNewProduct({
          name: '',
          slug: '',
          description: '',
          price: '',
          original_price: '',
          stock_quantity: '',
          category_id: '',
          images: [],
          video_url: '',
          is_featured: false,
          is_active: true
        });
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error creating product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...editingProduct,
        slug: editingProduct.slug || generateSlug(editingProduct.name),
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price ? parseFloat(editingProduct.original_price) : null,
        stock_quantity: parseInt(editingProduct.stock_quantity),
        category_id: parseInt(editingProduct.category_id)
      };

      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success('Product updated successfully');
        fetchProducts();
        setEditingProduct(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('Product deleted successfully');
          fetchProducts();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_read: true })
      });

      if (response.ok) {
        toast.success('Message marked as read');
        fetchMessages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to mark message as read');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Error marking message as read');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...newCategory,
        slug: newCategory.slug || generateSlug(newCategory.name)
      };

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        toast.success('Category created successfully');
        setNewCategory({
          name: '',
          slug: '',
          description: '',
          image_url: '',
          is_active: true
        });
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...editingCategory,
        slug: editingCategory.slug || generateSlug(editingCategory.name)
      };

      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        fetchCategories();
        setEditingCategory(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error updating category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('Category deleted successfully');
          fetchCategories();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category');
      }
    }
  };

  const handleCategoryImageUpload = async (file) => {
    if (!file) return null;
    
    setUploadingCategoryImage(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/admin/upload/category-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Image uploaded successfully');
        return data.file_url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Upload failed');
      return null;
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleProductImagesUpload = async (files) => {
    if (!files || files.length === 0) return [];
    
    setUploadingProductImages(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    try {
      const response = await fetch('/api/admin/upload/product-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.files.length} images uploaded successfully`);
        return data.files.map(file => file.url);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return [];
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Upload failed');
      return [];
    } finally {
      setUploadingProductImages(false);
    }
  };

  const handleProductVideoUpload = async (file) => {
    if (!file) return null;
    
    setUploadingProductVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    
    try {
      const response = await fetch('/api/admin/upload/product-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Video uploaded successfully');
        return data.file_url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Upload failed');
      return null;
    } finally {
      setUploadingProductVideo(false);
    }
  };

  const handleDeleteFile = async (fileUrl) => {
    try {
      const response = await fetch('/api/admin/delete-file', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_url: fileUrl })
      });
      
      if (response.ok) {
        toast.success('File deleted successfully');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Delete failed');
        return false;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Delete failed');
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.is_admin) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(),
        fetchCategories(),
        fetchMessages()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="admin-dashboard fade-in">
        <div className="container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user || !user.is_admin) {
    return (
      <div className="admin-dashboard fade-in">
        <div className="container">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard fade-in">
        <div className="container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard fade-in">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
          <button 
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Products</h3>
                <span className="stat-number">{stats.totalProducts}</span>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <span className="stat-number">{stats.totalOrders}</span>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <span className="stat-number">{stats.totalUsers}</span>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <span className="stat-number">${stats.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="recent-activities">
              <h3>Recent Orders</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user_email}</td>
                        <td>${order.total_amount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-content">
            <div className="section-header">
              <h2>Products Management</h2>
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('add-product-form').scrollIntoView()}
              >
                Add Product
              </button>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>{product.stock_quantity}</td>
                      <td>
                        <span className={`badge ${product.is_featured ? 'featured' : 'not-featured'}`}>
                          {product.is_featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.is_active ? 'active' : 'inactive'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setEditingProduct({
                              id: product.id,
                              name: product.name,
                              slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
                              description: product.description || '',
                              price: product.price,
                              original_price: product.original_price || '',
                              stock_quantity: product.stock_quantity,
                              category_id: product.category_id || '',
                              images: product.images || [],
                              video_url: product.video_url || '',
                              is_featured: product.is_featured,
                              is_active: product.is_active
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="add-product-form" className="add-product-form">
              <h3>Add New Product</h3>
              <form onSubmit={handleCreateProduct}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewProduct({
                          ...newProduct, 
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug (otomatik oluşturulur)</label>
                    <input
                      type="text"
                      value={newProduct.slug}
                      onChange={(e) => setNewProduct({...newProduct, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label>Product Images (Maximum 10)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 10) {
                        toast.error('Maximum 10 images allowed');
                        return;
                      }
                      if (files.length > 0) {
                        const imageUrls = await handleProductImagesUpload(files);
                        if (imageUrls.length > 0) {
                          setNewProduct({...newProduct, images: imageUrls});
                        }
                      }
                    }}
                    disabled={uploadingProductImages}
                  />
                  {uploadingProductImages && <span>Uploading images...</span>}
                  {newProduct.images.length > 0 && (
                    <div className="image-preview-grid">
                      {newProduct.images.map((imageUrl, index) => (
                        <div key={index} className="image-preview-item">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index + 1}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <button 
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newImages = newProduct.images.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, images: newImages});
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Product Video (Optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const videoUrl = await handleProductVideoUpload(file);
                        if (videoUrl) {
                          setNewProduct({...newProduct, video_url: videoUrl});
                        }
                      }
                    }}
                    disabled={uploadingProductVideo}
                  />
                  {uploadingProductVideo && <span>Uploading video...</span>}
                  {newProduct.video_url && (
                    <div className="video-preview">
                      <video 
                        src={newProduct.video_url} 
                        controls
                        style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                      />
                      <button 
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setNewProduct({...newProduct, video_url: ''})}
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.original_price}
                      onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newProduct.category_id}
                      onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newProduct.is_featured}
                        onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})}
                      />
                      Featured Product
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newProduct.is_active}
                        onChange={(e) => setNewProduct({...newProduct, is_active: e.target.checked})}
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Create Product
                </button>
              </form>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Product</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setEditingProduct(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateProduct}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setEditingProduct({
                              ...editingProduct,
                              name,
                              slug: generateSlug(name)
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Slug (otomatik oluşturulur)</label>
                        <input
                          type="text"
                          value={editingProduct.slug}
                          onChange={(e) => setEditingProduct({...editingProduct, slug: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                                          <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          rows="3"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Product Images (Maximum 10)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            if (files.length > 10) {
                              toast.error('Maximum 10 images allowed');
                              return;
                            }
                            if (files.length > 0) {
                              const imageUrls = await handleProductImagesUpload(files);
                              if (imageUrls.length > 0) {
                                setEditingProduct({...editingProduct, images: [...(editingProduct.images || []), ...imageUrls]});
                              }
                            }
                          }}
                          disabled={uploadingProductImages}
                        />
                        {uploadingProductImages && <span>Uploading images...</span>}
                        {editingProduct.images && editingProduct.images.length > 0 && (
                          <div className="image-preview-grid">
                            {editingProduct.images.map((imageUrl, index) => (
                              <div key={index} className="image-preview-item">
                                <img 
                                  src={imageUrl} 
                                  alt={`Product ${index + 1}`}
                                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    const newImages = editingProduct.images.filter((_, i) => i !== index);
                                    setEditingProduct({...editingProduct, images: newImages});
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Product Video (Optional)</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const videoUrl = await handleProductVideoUpload(file);
                              if (videoUrl) {
                                setEditingProduct({...editingProduct, video_url: videoUrl});
                              }
                            }
                          }}
                          disabled={uploadingProductVideo}
                        />
                        {uploadingProductVideo && <span>Uploading video...</span>}
                        {editingProduct.video_url && (
                          <div className="video-preview">
                            <video 
                              src={editingProduct.video_url} 
                              controls
                              style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                            />
                            <button 
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setEditingProduct({...editingProduct, video_url: ''})}
                            >
                              Remove Video
                            </button>
                          </div>
                        )}
                      </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Original Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.original_price}
                          onChange={(e) => setEditingProduct({...editingProduct, original_price: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Stock Quantity</label>
                        <input
                          type="number"
                          value={editingProduct.stock_quantity}
                          onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={editingProduct.category_id}
                          onChange={(e) => setEditingProduct({...editingProduct, category_id: e.target.value})}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingProduct.is_featured}
                            onChange={(e) => setEditingProduct({...editingProduct, is_featured: e.target.checked})}
                          />
                          Featured Product
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingProduct.is_active}
                            onChange={(e) => setEditingProduct({...editingProduct, is_active: e.target.checked})}
                          />
                          Active
                        </label>
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Update Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-content">
            <h2>Orders Management</h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user_email}</td>
                      <td>${order.total_amount}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-content">
            <h2>Contact Messages</h2>
            <div className="messages-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(message => (
                    <tr key={message.id} className={message.is_read ? 'read' : 'unread'}>
                      <td>{message.name}</td>
                      <td>{message.email}</td>
                      <td>{message.subject}</td>
                      <td>{new Date(message.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${message.is_read ? 'read' : 'unread'}`}>
                          {message.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        {!message.is_read && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleMarkMessageRead(message.id)}
                          >
                            Mark as Read
                          </button>
                        )}
                        <button className="btn btn-sm btn-secondary">
                          Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-content">
            <div className="section-header">
              <h2>Categories Management</h2>
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('add-category-form').scrollIntoView()}
              >
                Add Category
              </button>
            </div>

            <div className="categories-table">
              <table>
                <thead>
                                      <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th>Image</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                                          <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.slug}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </td>
                        <td>{category.products_count || 0}</td>
                        <td>
                          <span className={`badge ${category.is_active ? 'active' : 'inactive'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setEditingCategory({
                              id: category.id,
                              name: category.name,
                              slug: category.slug,
                              description: category.description || '',
                              image_url: category.image_url || '',
                              is_active: category.is_active
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.products_count > 0}
                          title={category.products_count > 0 ? 'Cannot delete category with products' : ''}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="add-category-form" className="add-category-form">
              <h3>Add New Category</h3>
              <form onSubmit={handleCreateCategory}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewCategory({
                          ...newCategory, 
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug (otomatik oluşturulur)</label>
                    <input
                      type="text"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      rows="3"
                      placeholder="Category description (optional)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category Image</label>
                    {newCategory.image_url && (
                      <div className="image-preview">
                        <img 
                          src={newCategory.image_url} 
                          alt="Category"
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button 
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setNewCategory({...newCategory, image_url: ''})}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = await handleCategoryImageUpload(file);
                          if (imageUrl) {
                            setNewCategory({...newCategory, image_url: imageUrl});
                          }
                        }
                      }}
                      disabled={uploadingCategoryImage}
                    />
                    {uploadingCategoryImage && <span>Uploading...</span>}
                  </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newCategory.is_active}
                      onChange={(e) => setNewCategory({...newCategory, is_active: e.target.checked})}
                    />
                    Active Category
                  </label>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Create Category
                </button>
              </form>
            </div>

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Category</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setEditingCategory(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateCategory}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setEditingCategory({
                              ...editingCategory,
                              name,
                              slug: generateSlug(name)
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Slug (otomatik oluşturulur)</label>
                        <input
                          type="text"
                          value={editingCategory.slug}
                          onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                                          <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                          rows="3"
                          placeholder="Category description (optional)"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Category Image</label>
                        {editingCategory.image_url && (
                          <div className="image-preview">
                            <img 
                              src={editingCategory.image_url} 
                              alt="Category"
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <button 
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setEditingCategory({...editingCategory, image_url: ''})}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const imageUrl = await handleCategoryImageUpload(file);
                              if (imageUrl) {
                                setEditingCategory({...editingCategory, image_url: imageUrl});
                              }
                            }
                          }}
                          disabled={uploadingCategoryImage}
                        />
                        {uploadingCategoryImage && <span>Uploading...</span>}
                      </div>
                    
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editingCategory.is_active}
                          onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                        />
                        Active Category
                      </label>
                    </div>
                    
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Update Category
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 