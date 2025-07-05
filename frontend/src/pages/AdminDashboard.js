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
  const [variationTypes, setVariationTypes] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
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
    is_active: true,
    has_variations: false,
    variation_type: '', // 'color', 'size', 'weight', 'custom'
    variation_name: '', // Özel varyasyon adı
    variation_options: [], // [{name: 'Kırmızı', value: 'red', price_modifier: 0, stock: 10, images: []}]
    weight: '',
    dimensions: '',
    material: ''
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

  const [newVariationType, setNewVariationType] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });

  const [editingVariationType, setEditingVariationType] = useState(null);

  const [newVariationOption, setNewVariationOption] = useState({
    variation_type_id: '',
    name: '',
    value: '',
    hex_color: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });

  const [editingVariationOption, setEditingVariationOption] = useState(null);
  const [selectedProductForVariations, setSelectedProductForVariations] = useState(null);
  
  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'pebdeq',
    site_logo: null,
    use_logo: false,
    logo_width: 120,
    logo_height: 40,
    site_logo2: null,
    use_logo2: false,
    logo2_width: 120,
    logo2_height: 40,
    welcome_title: 'Welcome to Pebdeq',
    welcome_subtitle: 'Crafted. Vintage. Smart.',
    welcome_background_image: null,
    welcome_background_color: '#667eea',
    welcome_text_color: '#ffffff',
    welcome_button_text: 'Explore Products',
    welcome_button_link: '/products',
    welcome_button_color: '#00b894'
  });
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false);
  const [uploadingSiteLogo2, setUploadingSiteLogo2] = useState(false);
  const [uploadingWelcomeBackground, setUploadingWelcomeBackground] = useState(false);

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

  const fetchVariationTypes = async () => {
    try {
      const response = await fetch('/api/admin/variation-types', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setVariationTypes(data.variation_types);
      } else {
        toast.error('Failed to fetch variation types');
      }
    } catch (error) {
      console.error('Error fetching variation types:', error);
      toast.error('Error fetching variation types');
    }
  };

  const fetchVariationOptions = async () => {
    try {
      const response = await fetch('/api/admin/variation-options', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setVariationOptions(data.variation_options);
      } else {
        toast.error('Failed to fetch variation options');
      }
    } catch (error) {
      console.error('Error fetching variation options:', error);
      toast.error('Error fetching variation options');
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings', { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (response.ok) {
        setSiteSettings(data);
      } else {
        toast.error('Failed to fetch site settings');
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast.error('Error fetching site settings');
    }
  };

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        toast.success('Site settings updated successfully');
        fetchSiteSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update site settings');
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Error updating site settings');
    }
  };

  const handleSiteLogoUpload = async (file) => {
    if (!file) return;
    
    setUploadingSiteLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload/site-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSiteSettings(prev => ({
          ...prev,
          site_logo: data.logo_url
        }));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error uploading logo');
    } finally {
      setUploadingSiteLogo(false);
    }
  };

  const handleSiteLogo2Upload = async (file) => {
    if (!file) return;
    
    setUploadingSiteLogo2(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload/site-logo2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSiteSettings(prev => ({
          ...prev,
          site_logo2: data.logo_url
        }));
        toast.success('Second logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload second logo');
      }
    } catch (error) {
      console.error('Error uploading second logo:', error);
      toast.error('Error uploading second logo');
    } finally {
      setUploadingSiteLogo2(false);
    }
  };

  const handleWelcomeBackgroundUpload = async (file) => {
    if (!file) return;
    
    setUploadingWelcomeBackground(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload/welcome-background', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSiteSettings(prev => ({
          ...prev,
          welcome_background_image: data.background_url
        }));
        toast.success('Welcome background uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload welcome background');
      }
    } catch (error) {
      console.error('Error uploading welcome background:', error);
      toast.error('Error uploading welcome background');
    } finally {
      setUploadingWelcomeBackground(false);
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

  const filterEmptyVariations = (variationOptions) => {
    if (!variationOptions || !Array.isArray(variationOptions)) return [];
    return variationOptions.filter(option => 
      option && typeof option === 'object' && option.name && option.name.trim()
    );
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Boş varyasyonları filtrele
      const filteredVariations = filterEmptyVariations(newProduct.variation_options);
      
      const productData = {
        ...newProduct,
        slug: newProduct.slug || generateSlug(newProduct.name),
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity),
        category_id: parseInt(newProduct.category_id),
        variation_options: filteredVariations
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
      // Boş varyasyonları filtrele
      const filteredVariations = filterEmptyVariations(editingProduct.variation_options);
      
      const productData = {
        ...editingProduct,
        slug: editingProduct.slug || generateSlug(editingProduct.name),
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price ? parseFloat(editingProduct.original_price) : null,
        stock_quantity: parseInt(editingProduct.stock_quantity),
        category_id: parseInt(editingProduct.category_id),
        variation_options: filteredVariations
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

  // Variation Type CRUD
  const createVariationType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/variation-types', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVariationType)
      });
      
      if (response.ok) {
        setNewVariationType({
          name: '',
          slug: '',
          description: '',
          is_active: true
        });
        fetchVariationTypes();
        toast.success('Variation type created successfully');
      } else {
        toast.error('Failed to create variation type');
      }
    } catch (error) {
      console.error('Error creating variation type:', error);
      toast.error('Error creating variation type');
    }
  };

  const updateVariationType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/variation-types/${editingVariationType.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingVariationType)
      });
      
      if (response.ok) {
        setEditingVariationType(null);
        fetchVariationTypes();
        toast.success('Variation type updated successfully');
      } else {
        toast.error('Failed to update variation type');
      }
    } catch (error) {
      console.error('Error updating variation type:', error);
      toast.error('Error updating variation type');
    }
  };

  const deleteVariationType = async (typeId) => {
    try {
      const response = await fetch(`/api/admin/variation-types/${typeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchVariationTypes();
        toast.success('Variation type deleted successfully');
      } else {
        toast.error('Failed to delete variation type');
      }
    } catch (error) {
      console.error('Error deleting variation type:', error);
      toast.error('Error deleting variation type');
    }
  };

  // Variation Option CRUD
  const createVariationOption = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/variation-options', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVariationOption)
      });
      
      if (response.ok) {
        setNewVariationOption({
          variation_type_id: '',
          name: '',
          value: '',
          hex_color: '',
          image_url: '',
          sort_order: 0,
          is_active: true
        });
        fetchVariationOptions();
        toast.success('Variation option created successfully');
      } else {
        toast.error('Failed to create variation option');
      }
    } catch (error) {
      console.error('Error creating variation option:', error);
      toast.error('Error creating variation option');
    }
  };

  const updateVariationOption = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/variation-options/${editingVariationOption.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingVariationOption)
      });
      
      if (response.ok) {
        setEditingVariationOption(null);
        fetchVariationOptions();
        toast.success('Variation option updated successfully');
      } else {
        toast.error('Failed to update variation option');
      }
    } catch (error) {
      console.error('Error updating variation option:', error);
      toast.error('Error updating variation option');
    }
  };

  const deleteVariationOption = async (optionId) => {
    try {
      const response = await fetch(`/api/admin/variation-options/${optionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchVariationOptions();
        toast.success('Variation option deleted successfully');
      } else {
        toast.error('Failed to delete variation option');
      }
    } catch (error) {
      console.error('Error deleting variation option:', error);
      toast.error('Error deleting variation option');
    }
  };

  const saveProductVariations = async (product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variation_options: product.variation_options
        })
      });
      
      if (response.ok) {
        setSelectedProductForVariations(null);
        fetchProducts();
        toast.success('Varyasyonlar başarıyla kaydedildi');
      } else {
        toast.error('Varyasyonlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Error saving variations:', error);
      toast.error('Varyasyonlar kaydedilemedi');
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
        fetchMessages(),
        fetchSiteSettings()
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
          <button 
            className={activeTab === 'variations' ? 'active' : ''}
            onClick={() => setActiveTab('variations')}
          >
            Variations
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Site Settings
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
                              is_active: product.is_active,
                              has_variations: product.has_variations || false,
                              variation_type: product.variation_type || '',
                              variation_name: product.variation_name || '',
                              variation_options: product.variation_options || [],
                              weight: product.weight || '',
                              dimensions: product.dimensions || '',
                              material: product.material || ''
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
                            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', padding: '5px' }}
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
                
                {/* Varyasyon Seçenekleri */}
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProduct.has_variations}
                      onChange={(e) => {
                        setNewProduct({
                          ...newProduct, 
                          has_variations: e.target.checked,
                          variation_type: e.target.checked ? newProduct.variation_type : '',
                          variation_name: e.target.checked ? newProduct.variation_name : '',
                          variation_options: e.target.checked ? newProduct.variation_options : []
                        });
                      }}
                    />
                    Bu ürünün varyasyonları var (renk, boyut, ağırlık vs.)
                  </label>
                </div>

                {newProduct.has_variations && (
                  <div className="variation-setup">
                    <h4>Varyasyon Ayarları</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Varyasyon Türü</label>
                        <select
                          value={newProduct.variation_type}
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct, 
                              variation_type: e.target.value,
                              variation_name: e.target.value === 'custom' ? newProduct.variation_name : ''
                            });
                          }}
                          required
                        >
                          <option value="">Seçin</option>
                          <option value="color">Renk</option>
                          <option value="size">Boyut</option>
                          <option value="weight">Ağırlık</option>
                          <option value="custom">Özel</option>
                        </select>
                      </div>
                      
                      {newProduct.variation_type === 'custom' && (
                        <div className="form-group">
                          <label>Özel Varyasyon Adı</label>
                          <input
                            type="text"
                            value={newProduct.variation_name}
                            onChange={(e) => setNewProduct({...newProduct, variation_name: e.target.value})}
                            placeholder="Örn: Malzeme, Stil, vs."
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="variation-options-setup">
                      <h5>Varyasyon Seçenekleri</h5>
                      <p>Ürün kaydedildikten sonra Varyasyon sekmesinde detayları ayarlayabilirsiniz.</p>
                      
                      {newProduct.variation_options.map((option, index) => (
                        <div key={index} className="variation-option-item">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => {
                              const newOptions = [...newProduct.variation_options];
                              newOptions[index].name = e.target.value;
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                            placeholder="Seçenek adı (Örn: Kırmızı, Large, 1kg)"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newOptions = newProduct.variation_options.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          const newOptions = [...newProduct.variation_options, {
                            name: '',
                            value: '',
                            price_modifier: 0,
                            stock: 0,
                            images: []
                          }];
                          setNewProduct({...newProduct, variation_options: newOptions});
                        }}
                      >
                        + Seçenek Ekle
                      </button>
                    </div>
                  </div>
                )}

                {/* Ürün Özellikleri */}
                <div className="form-section">
                  <h4>Ürün Özellikleri</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ağırlık</label>
                      <input
                        type="text"
                        value={newProduct.weight}
                        onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                        placeholder="Örn: 1.5kg, 250g"
                      />
                    </div>
                    <div className="form-group">
                      <label>Boyutlar</label>
                      <input
                        type="text"
                        value={newProduct.dimensions}
                        onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                        placeholder="Örn: 30x20x10 cm"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Malzeme</label>
                    <input
                      type="text"
                      value={newProduct.material}
                      onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                      placeholder="Örn: Plastik, Metal, Ahşap"
                    />
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
                    {/* Varyasyon Yönetimi - Üst Kısım */}
                    <div className="variation-management-section">
                      <h4>🎨 Varyasyon Yönetimi</h4>
                      
                      {editingProduct.has_variations ? (
                        <>
                          <div className="variation-controls">
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={() => {
                                if (window.confirm('Tüm varyasyonları sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                  // Varyasyonları sıfırla
                                  setEditingProduct({
                                    ...editingProduct,
                                    has_variations: false,
                                    variation_type: '',
                                    variation_name: '',
                                    variation_options: []
                                  });
                                  toast.success('Varyasyonlar sıfırlandı');
                                }
                              }}
                            >
                              🗑️ Varyasyonları Sıfırla
                            </button>
                          </div>
                          
                          <div className="current-variation-info">
                            <p><strong>Mevcut Varyasyon Türü:</strong> {
                              editingProduct.variation_type === 'custom' ? editingProduct.variation_name :
                              editingProduct.variation_type === 'color' ? 'Renk' :
                              editingProduct.variation_type === 'size' ? 'Boyut' :
                              editingProduct.variation_type === 'weight' ? 'Ağırlık' : 'Bilinmeyen'
                            }</p>
                            <p><strong>Seçenek Sayısı:</strong> {editingProduct.variation_options?.length || 0}</p>
                            <p><strong>Seçenekler:</strong> {
                              editingProduct.variation_options?.map(opt => opt.name).join(', ') || 'Yok'
                            }</p>
                          </div>
                        </>
                      ) : (
                        <div className="no-variation-info">
                          <p>Bu ürünün henüz varyasyonu yok. Aşağıdaki checkbox'ı işaretleyerek varyasyon ekleyebilirsiniz.</p>
                        </div>
                      )}
                    </div>
                    
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
                            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', padding: '5px' }}
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
                    

                    
                    {/* Varyasyon Ekleme/Düzenleme */}
                    <div className="variation-setup">
                      <h4>🎨 Varyasyon Yönetimi</h4>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingProduct.has_variations || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setEditingProduct({
                                ...editingProduct,
                                has_variations: isChecked,
                                variation_type: isChecked ? 'color' : '',
                                variation_name: '',
                                variation_options: isChecked ? [{ name: '', price_modifier: 0, stock: 0, images: [] }] : []
                              });
                            }}
                          />
                          Bu ürün için varyasyon ekle (renk, boyut, ağırlık vs.)
                        </label>
                      </div>
                      
                      {/* Varyasyon Türü Seçimi */}
                      {editingProduct.has_variations && (
                        <div className="variation-type-selection">
                          <div className="form-group">
                            <label>Varyasyon Türü</label>
                            <select
                              value={editingProduct.variation_type || ''}
                              onChange={(e) => {
                                const newType = e.target.value;
                                setEditingProduct({
                                  ...editingProduct,
                                  variation_type: newType,
                                  variation_name: newType === 'custom' ? editingProduct.variation_name : '',
                                  variation_options: newType ? [{ name: '', price_modifier: 0, stock: 0, images: [] }] : []
                                });
                              }}
                            >
                              <option value="">Seçiniz</option>
                              <option value="color">Renk</option>
                              <option value="size">Boyut</option>
                              <option value="weight">Ağırlık</option>
                              <option value="custom">Özel</option>
                            </select>
                          </div>
                          
                          {editingProduct.variation_type === 'custom' && (
                            <div className="form-group">
                              <label>Özel Varyasyon Adı</label>
                              <input
                                type="text"
                                value={editingProduct.variation_name || ''}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  variation_name: e.target.value
                                })}
                                placeholder="Örn: Malzeme, Stil, Desen"
                              />
                            </div>
                          )}
                          
                          {/* Varyasyon Seçenekleri */}
                          {editingProduct.variation_type && (
                            <div className="variation-options-setup">
                              <h5>Varyasyon Seçenekleri</h5>
                              <p>Her varyasyon için seçenek ekleyin:</p>
                              
                              {(editingProduct.variation_options || []).map((option, index) => (
                                <div key={index} className="variation-option-item">
                                  <input
                                    type="text"
                                    value={option.name || ''}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, name: e.target.value };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Seçenek adı"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={option.price_modifier || 0}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, price_modifier: parseFloat(e.target.value) || 0 };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Fiyat farkı"
                                  />
                                  <input
                                    type="number"
                                    value={option.stock || 0}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, stock: parseInt(e.target.value) || 0 };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Stok"
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                      const newOptions = editingProduct.variation_options.filter((_, i) => i !== index);
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                  >
                                    Sil
                                  </button>
                                </div>
                              ))}
                              
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  const newOptions = [...(editingProduct.variation_options || [])];
                                  newOptions.push({ name: '', price_modifier: 0, stock: 0, images: [] });
                                  setEditingProduct({
                                    ...editingProduct,
                                    variation_options: newOptions
                                  });
                                }}
                              >
                                + Seçenek Ekle
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Ürün Özellikleri */}
                    <div className="form-section">
                      <h4>Ürün Özellikleri</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Ağırlık</label>
                          <input
                            type="text"
                            value={editingProduct.weight || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                            placeholder="Örn: 1.5kg, 250g"
                          />
                        </div>
                        <div className="form-group">
                          <label>Boyutlar</label>
                          <input
                            type="text"
                            value={editingProduct.dimensions || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, dimensions: e.target.value})}
                            placeholder="Örn: 30x20x10 cm"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Malzeme</label>
                        <input
                          type="text"
                          value={editingProduct.material || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                          placeholder="Örn: Plastik, Metal, Ahşap"
                        />
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

        {activeTab === 'variations' && (
          <div className="variations-content">
            <div className="section-header">
              <h2>Product Variations Management</h2>
              <p>Varyasyonlu ürünlerin detaylarını yönetin (fiyat, stok, resim vs.)</p>
            </div>

            <div className="variation-products">
              <h3>Varyasyonlu Ürünler</h3>
              
              {products.filter(product => product.has_variations).length === 0 ? (
                <div className="no-variation-products">
                  <p>Henüz varyasyonlu ürün yok. Ürün eklerken "Bu ürünün varyasyonları var" seçeneğini işaretleyin.</p>
                </div>
              ) : (
                <div className="variation-products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Ürün</th>
                        <th>Varyasyon Türü</th>
                        <th>Seçenekler</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(product => product.has_variations).map(product => (
                        <tr key={product.id}>
                          <td>
                            <div className="product-info">
                              <strong>{product.name}</strong>
                              <br />
                              <small>Base Price: ${product.price}</small>
                            </div>
                          </td>
                          <td>
                            <span className="variation-type-badge">
                              {product.variation_type === 'color' && 'Renk'}
                              {product.variation_type === 'size' && 'Boyut'}
                              {product.variation_type === 'weight' && 'Ağırlık'}
                              {product.variation_type === 'custom' && product.variation_name}
                            </span>
                          </td>
                          <td>
                            <div className="variation-options-preview">
                              {product.variation_options && product.variation_options.length > 0 ? (
                                product.variation_options.map((option, index) => (
                                  <span key={index} className="option-tag">
                                    {option.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted">Henüz seçenek eklenmemiş</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelectedProductForVariations(product)}
                            >
                              Varyasyonları Yönet
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Product Variation Management Modal */}
            {selectedProductForVariations && (
              <div className="modal-overlay" onClick={() => setSelectedProductForVariations(null)}>
                <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedProductForVariations.name} - Varyasyon Yönetimi</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setSelectedProductForVariations(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="variation-management">
                    <p>
                      <strong>Varyasyon Türü:</strong> {' '}
                      {selectedProductForVariations.variation_type === 'color' && 'Renk'}
                      {selectedProductForVariations.variation_type === 'size' && 'Boyut'}
                      {selectedProductForVariations.variation_type === 'weight' && 'Ağırlık'}
                      {selectedProductForVariations.variation_type === 'custom' && selectedProductForVariations.variation_name}
                    </p>
                    
                    <div className="variation-options-management">
                      <h4>Varyasyon Seçenekleri</h4>
                      
                      {selectedProductForVariations.variation_options && selectedProductForVariations.variation_options.map((option, index) => (
                        <div key={index} className="variation-option-card">
                          <div className="option-header">
                            <h5>{option.name}</h5>
                          </div>
                          
                          <div className="option-details">
                            <div className="form-row">
                              <div className="form-group">
                                <label>Fiyat Farkı</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={option.price_modifier || 0}
                                  onChange={(e) => {
                                    const newOptions = [...selectedProductForVariations.variation_options];
                                    newOptions[index].price_modifier = parseFloat(e.target.value) || 0;
                                    setSelectedProductForVariations({
                                      ...selectedProductForVariations,
                                      variation_options: newOptions
                                    });
                                  }}
                                  placeholder="0.00"
                                />
                                <small>Ana fiyata eklenecek/çıkarılacak miktar</small>
                              </div>
                              
                              <div className="form-group">
                                <label>Stok</label>
                                <input
                                  type="number"
                                  value={option.stock || 0}
                                  onChange={(e) => {
                                    const newOptions = [...selectedProductForVariations.variation_options];
                                    newOptions[index].stock = parseInt(e.target.value) || 0;
                                    setSelectedProductForVariations({
                                      ...selectedProductForVariations,
                                      variation_options: newOptions
                                    });
                                  }}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            
                            <div className="form-group">
                              <label>Bu Seçeneğe Özel Resimler</label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length > 0) {
                                    const imageUrls = await handleProductImagesUpload(files);
                                    if (imageUrls.length > 0) {
                                      const newOptions = [...selectedProductForVariations.variation_options];
                                      newOptions[index].images = [...(newOptions[index].images || []), ...imageUrls];
                                      setSelectedProductForVariations({
                                        ...selectedProductForVariations,
                                        variation_options: newOptions
                                      });
                                    }
                                  }
                                }}
                              />
                              
                              {option.images && option.images.length > 0 && (
                                <div className="option-images">
                                  {option.images.map((imageUrl, imgIndex) => (
                                    <div key={imgIndex} className="option-image">
                                      <img src={imageUrl} alt={`${option.name} ${imgIndex + 1}`} />
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                          const newOptions = [...selectedProductForVariations.variation_options];
                                          newOptions[index].images = newOptions[index].images.filter((_, i) => i !== imgIndex);
                                          setSelectedProductForVariations({
                                            ...selectedProductForVariations,
                                            variation_options: newOptions
                                          });
                                        }}
                                      >
                                        Sil
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setSelectedProductForVariations(null)}
                      >
                        İptal
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => saveProductVariations(selectedProductForVariations)}
                      >
                        Varyasyonları Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="section-header">
              <h2>Site Ayarları</h2>
            </div>

            <form onSubmit={handleUpdateSiteSettings} className="site-settings-form">
              <div className="form-group">
                <label>Site Adı</label>
                <input
                  type="text"
                  value={siteSettings.site_name}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    site_name: e.target.value
                  }))}
                  placeholder="pebdeq"
                  required
                />
                <small>Header'da gösterilecek site adı (küçük harflerle)</small>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={siteSettings.use_logo}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      use_logo: e.target.checked
                    }))}
                  />
                  Logo kullan (işaretlenmezse yazı gösterilir)
                </label>
              </div>

              {siteSettings.use_logo && (
                <>
                  <div className="form-group">
                    <label>Site Logosu</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleSiteLogoUpload(file);
                        }
                      }}
                      disabled={uploadingSiteLogo}
                    />
                    {uploadingSiteLogo && <p>Logo yükleniyor...</p>}
                    
                    {siteSettings.site_logo && (
                      <div className="logo-preview">
                        <img 
                          src={`http://localhost:5005${siteSettings.site_logo}`} 
                          alt="Site Logo" 
                          style={{ 
                            width: `${siteSettings.logo_width}px`,
                            height: `${siteSettings.logo_height}px`,
                            objectFit: 'contain' 
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setSiteSettings(prev => ({
                            ...prev,
                            site_logo: null
                          }))}
                        >
                          Logoyu Kaldır
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Logo Genişliği (piksel)</label>
                      <input
                        type="number"
                        min="20"
                        max="500"
                        value={siteSettings.logo_width}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          logo_width: parseInt(e.target.value) || 120
                        }))}
                        placeholder="120"
                      />
                      <small>20-500 piksel arası</small>
                    </div>

                    <div className="form-group">
                      <label>Logo Yüksekliği (piksel)</label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={siteSettings.logo_height}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          logo_height: parseInt(e.target.value) || 40
                        }))}
                        placeholder="40"
                      />
                      <small>20-200 piksel arası</small>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={siteSettings.use_logo2}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      use_logo2: e.target.checked
                    }))}
                  />
                  İkinci logo kullan
                </label>
              </div>

              {siteSettings.use_logo2 && (
                <>
                  <div className="form-group">
                    <label>İkinci Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleSiteLogo2Upload(file);
                        }
                      }}
                      disabled={uploadingSiteLogo2}
                    />
                    {uploadingSiteLogo2 && <p>İkinci logo yükleniyor...</p>}
                    
                    {siteSettings.site_logo2 && (
                      <div className="logo-preview">
                        <img 
                          src={`http://localhost:5005${siteSettings.site_logo2}`} 
                          alt="Second Site Logo" 
                          style={{ 
                            width: `${siteSettings.logo2_width}px`,
                            height: `${siteSettings.logo2_height}px`,
                            objectFit: 'contain' 
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setSiteSettings(prev => ({
                            ...prev,
                            site_logo2: null
                          }))}
                        >
                          İkinci Logoyu Kaldır
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>İkinci Logo Genişliği (piksel)</label>
                      <input
                        type="number"
                        min="20"
                        max="500"
                        value={siteSettings.logo2_width}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          logo2_width: parseInt(e.target.value) || 120
                        }))}
                        placeholder="120"
                      />
                      <small>20-500 piksel arası</small>
                    </div>

                    <div className="form-group">
                      <label>İkinci Logo Yüksekliği (piksel)</label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={siteSettings.logo2_height}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          logo2_height: parseInt(e.target.value) || 40
                        }))}
                        placeholder="40"
                      />
                      <small>20-200 piksel arası</small>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <h4>Welcome Section Ayarları</h4>
                <p>Ana sayfadaki karşılama bölümünün görünümünü özelleştirin</p>
              </div>

              <div className="form-group">
                <label>Welcome Başlığı</label>
                <input
                  type="text"
                  value={siteSettings.welcome_title}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    welcome_title: e.target.value
                  }))}
                  placeholder="Welcome to Pebdeq"
                />
              </div>

              <div className="form-group">
                <label>Welcome Alt Başlığı</label>
                <input
                  type="text"
                  value={siteSettings.welcome_subtitle}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    welcome_subtitle: e.target.value
                  }))}
                  placeholder="Crafted. Vintage. Smart."
                />
              </div>

              <div className="form-group">
                <label>Welcome Arka Plan Resmi</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleWelcomeBackgroundUpload(file);
                    }
                  }}
                  disabled={uploadingWelcomeBackground}
                />
                {uploadingWelcomeBackground && <p>Arka plan resmi yükleniyor...</p>}
                
                {siteSettings.welcome_background_image && (
                  <div className="background-preview">
                    <img 
                      src={`http://localhost:5005${siteSettings.welcome_background_image}`} 
                      alt="Welcome Background" 
                      style={{ 
                        width: '200px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => setSiteSettings(prev => ({
                        ...prev,
                        welcome_background_image: null
                      }))}
                    >
                      Arka Plan Resmini Kaldır
                    </button>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Arka Plan Rengi</label>
                  <input
                    type="color"
                    value={siteSettings.welcome_background_color}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      welcome_background_color: e.target.value
                    }))}
                  />
                  <small>Arka plan resmi yoksa kullanılacak renk</small>
                </div>

                <div className="form-group">
                  <label>Yazı Rengi</label>
                  <input
                    type="color"
                    value={siteSettings.welcome_text_color}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      welcome_text_color: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Buton Metni</label>
                <input
                  type="text"
                  value={siteSettings.welcome_button_text}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    welcome_button_text: e.target.value
                  }))}
                  placeholder="Explore Products"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Buton Linki</label>
                  <input
                    type="text"
                    value={siteSettings.welcome_button_link}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      welcome_button_link: e.target.value
                    }))}
                    placeholder="/products"
                  />
                </div>

                <div className="form-group">
                  <label>Buton Rengi</label>
                  <input
                    type="color"
                    value={siteSettings.welcome_button_color}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      welcome_button_color: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <h4>Önizleme</h4>
                <div className="logo-preview-header">
                  <div className="logo-container">
                    {siteSettings.use_logo && siteSettings.site_logo ? (
                      <img 
                        src={`http://localhost:5005${siteSettings.site_logo}`} 
                        alt={siteSettings.site_name} 
                        style={{ 
                          width: `${siteSettings.logo_width}px`,
                          height: `${siteSettings.logo_height}px`,
                          objectFit: 'contain' 
                        }}
                      />
                    ) : (
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '1.8rem', 
                        fontWeight: 700, 
                        color: '#2c3e50' 
                      }}>
                        {siteSettings.site_name}
                      </h1>
                    )}
                    {siteSettings.use_logo2 && siteSettings.site_logo2 && (
                      <img 
                        src={`http://localhost:5005${siteSettings.site_logo2}`} 
                        alt="Second Logo" 
                        style={{ 
                          width: `${siteSettings.logo2_width}px`,
                          height: `${siteSettings.logo2_height}px`,
                          objectFit: 'contain' 
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="welcome-preview" style={{
                  background: siteSettings.welcome_background_image 
                    ? `url(http://localhost:5005${siteSettings.welcome_background_image}) center/cover`
                    : siteSettings.welcome_background_color,
                  padding: '2rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: siteSettings.welcome_text_color,
                  marginTop: '1rem'
                }}>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    margin: '0 0 0.5rem 0',
                    color: siteSettings.welcome_text_color
                  }}>
                    {siteSettings.welcome_title}
                  </h2>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    margin: '0 0 1rem 0',
                    color: siteSettings.welcome_text_color
                  }}>
                    {siteSettings.welcome_subtitle}
                  </p>
                  <button style={{
                    backgroundColor: siteSettings.welcome_button_color,
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    {siteSettings.welcome_button_text}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Ayarları Kaydet
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 