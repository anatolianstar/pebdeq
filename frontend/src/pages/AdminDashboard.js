import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('identity');
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
      variation_name: '', // Custom variation name
  variation_options: [], // [{name: 'Red', value: 'red', price_modifier: 0, stock: 10, images: []}]
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
    background_image_url: '',
    background_color: '',
    is_active: true
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [uploadingCategoryBackground, setUploadingCategoryBackground] = useState(false);
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
    // Site Identity
    site_name: 'pebdeq',
    site_logo: null,
    use_logo: false,
    logo_width: 120,
    logo_height: 40,
    site_logo2: null,
    use_logo2: false,
    logo2_width: 120,
    logo2_height: 40,
    
    // Marquee Settings
    marquee_enabled: false,
    marquee_text: 'Welcome to our store! Special offers available now.',
    marquee_font_family: 'Arial, sans-serif',
    marquee_font_size: '14px',
    marquee_font_weight: 'normal',
    marquee_color: '#ffffff',
    marquee_background_color: '#ff6b6b',
    marquee_speed: 30,
    marquee_direction: 'left', // left, right
    marquee_pause_on_hover: true,
    
    // Welcome Section
    welcome_title: 'Welcome to Pebdeq',
    welcome_subtitle: 'Crafted. Vintage. Smart.',
    welcome_background_image: null,
    welcome_background_color: '#667eea',
    welcome_text_color: '#ffffff',
    welcome_button_text: 'Explore Products',
    welcome_button_link: '/products',
    welcome_button_color: '#00b894',
    
    // Collections Section
    collections_title: 'Our Collections',
    collections_show_categories: [],
    collections_categories_per_row: 4,
    collections_max_rows: 1,
    collections_show_section: true,
    
    // Contact & Social
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    social_instagram: '',
    social_facebook: '',
    social_twitter: '',
    social_youtube: '',
    social_linkedin: '',
    
    // SEO Settings
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    
    // Business Settings
    currency_symbol: '₺',
    currency_code: 'TRY',
    shipping_cost: 0.0,
    free_shipping_threshold: 0.0,
    
    // Feature Flags
    enable_reviews: true,
    enable_wishlist: true,
    enable_compare: true,
    enable_newsletter: true,
    maintenance_mode: false,
    
    // Footer Settings
    footer_show_section: true,
    footer_background_color: '#2c3e50',
    footer_text_color: '#ffffff',
    footer_company_name: 'PEBDEQ',
    footer_company_description: 'Crafted with passion, delivered with precision.',
    footer_copyright_text: '© 2024 PEBDEQ. All rights reserved.',
    
    // Footer Support Section
    footer_support_title: 'Support',
    footer_support_show_section: true,
    footer_support_links: [
      {title: 'Contact Us', url: '/contact', is_external: false},
      {title: 'FAQ', url: '/faq', is_external: false},
      {title: 'Shipping Info', url: '/shipping', is_external: false},
      {title: 'Returns', url: '/returns', is_external: false}
    ],
    
    // Footer Quick Links Section
    footer_quick_links_title: 'Quick Links',
    footer_quick_links_show_section: true,
    footer_quick_links: [
      {title: 'About Us', url: '/about', is_external: false},
      {title: 'Products', url: '/products', is_external: false},
      {title: 'Blog', url: '/blog', is_external: false},
      {title: 'Privacy Policy', url: '/privacy', is_external: false}
    ],
    
    // Footer Social Section
    footer_social_title: 'Follow Us',
    footer_social_show_section: true,
    
    // Footer Newsletter Section
    footer_newsletter_title: 'Newsletter',
    footer_newsletter_show_section: true,
    footer_newsletter_description: 'Subscribe to get updates about new products and offers.',
    footer_newsletter_placeholder: 'Enter your email address',
    footer_newsletter_button_text: 'Subscribe',
    
    // Homepage Products Settings
    homepage_products_show_section: true,
    homepage_products_title: 'Featured Products',
    homepage_products_subtitle: 'Discover our most popular items',
    homepage_products_max_rows: 2,
    homepage_products_per_row: 4,
    homepage_products_max_items: 8,
    homepage_products_show_images: true,
    homepage_products_image_height: 200,
    homepage_products_image_width: 300,
    homepage_products_show_favorite: true,
    homepage_products_show_buy_now: true,
    homepage_products_show_details: true,
    homepage_products_show_price: true,
    homepage_products_show_original_price: true,
    homepage_products_show_stock: true,
    homepage_products_show_category: true,
    homepage_products_sort_by: 'featured', // featured, newest, price_low, price_high, name
    homepage_products_filter_categories: [],
    homepage_products_show_view_all: true,
    homepage_products_view_all_text: 'View All Products',
    homepage_products_view_all_link: '/products',
    homepage_products_card_style: 'modern', // modern, classic, minimal
    homepage_products_card_shadow: true,
    homepage_products_card_hover_effect: true,
    homepage_products_show_badges: true,
    homepage_products_show_rating: false,
    homepage_products_show_quick_view: false,
    // Homepage Products 2 Settings
    homepage_products2_show_section: true,
    homepage_products2_title: 'Latest Products',
    homepage_products2_subtitle: 'Check out our newest arrivals',
    homepage_products2_max_rows: 2,
    homepage_products2_per_row: 4,
    homepage_products2_max_items: 8,
    homepage_products2_show_images: true,
    homepage_products2_image_height: 200,
    homepage_products2_image_width: 300,
    homepage_products2_show_favorite: true,
    homepage_products2_show_buy_now: true,
    homepage_products2_show_details: true,
    homepage_products2_show_price: true,
    homepage_products2_show_original_price: true,
    homepage_products2_show_stock: true,
    homepage_products2_show_category: true,
    homepage_products2_sort_by: 'newest',
    homepage_products2_filter_categories: [],
    homepage_products2_show_view_all: true,
    homepage_products2_view_all_text: 'View All Products',
    homepage_products2_view_all_link: '/products',
    homepage_products2_card_style: 'modern',
    homepage_products2_card_shadow: true,
    homepage_products2_card_hover_effect: true,
    homepage_products2_show_badges: true,
    homepage_products2_show_rating: false,
    homepage_products2_show_quick_view: false
  });
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false);
  const [uploadingSiteLogo2, setUploadingSiteLogo2] = useState(false);
  const [uploadingWelcomeBackground, setUploadingWelcomeBackground] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);

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
        // Flatten the categorized data structure
        const flattenedData = {
          // Site Identity
          ...data.site_identity,
          // Welcome Section
          ...data.welcome_section,
          // Collections Section
          ...data.collections_section,
          // Contact & Social
          ...data.contact_social,
          // SEO Settings
          ...data.seo_settings,
          // Business Settings
          ...data.business_settings,
          // Feature Flags
          ...data.feature_flags,
          // Footer Settings
          ...data.footer_settings,
          // Homepage Products Settings
          ...data.homepage_products_settings,
          // Homepage Products 2 Settings
          ...data.homepage_products2_settings
        };
        setSiteSettings(flattenedData);
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

  const handleFooterLogoUpload = async (file) => {
    if (!file) return;
    
    setUploadingFooterLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload/footer-logo', {
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
          footer_logo: data.logo_url
        }));
        toast.success('Footer logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload footer logo');
      }
    } catch (error) {
      console.error('Error uploading footer logo:', error);
      toast.error('Error uploading footer logo');
    } finally {
      setUploadingFooterLogo(false);
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
      // Filter empty variations
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
      // Filter empty variations
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
          background_image_url: '',
          background_color: '',
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

  const handleCategoryBackgroundUpload = async (file) => {
    if (!file) return null;
    
    setUploadingCategoryBackground(true);
    const formData = new FormData();
    formData.append('background', file);
    
    try {
      const response = await fetch('/api/admin/upload/category-background', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Background image uploaded successfully');
        return data.background_url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Upload failed');
      return null;
    } finally {
      setUploadingCategoryBackground(false);
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

  // Excel Export/Import Functions
  const handleExportProductsExcel = async () => {
    try {
      const response = await fetch('/api/admin/products/export-excel', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Products exported successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to export products');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Error exporting products');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/products/export-template', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Template downloaded successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error downloading template');
    }
  };

  const handleImportProductsExcel = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header for FormData - browser will set it automatically with boundary
      const authHeaders = getAuthHeaders();
      delete authHeaders['Content-Type']; // Remove if exists

      const response = await fetch('/api/admin/products/import-excel', {
        method: 'POST',
        headers: authHeaders,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Show main result message
        toast.success(data.message);
        
        // Show detailed results if there are errors
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          console.warn('Import errors:', data.errors);
          data.errors.forEach(error => console.warn('Import error:', error));
          // Show error details in a more user-friendly way
          toast.error(`⚠️ ${data.error_count || 0} satır işlenemedi. Detaylar için konsolu kontrol edin.`);
        }
        
        // Show update info separately if there are updates
        if (data.updated_count && data.updated_count > 0) {
          toast.info(`✅ ${data.updated_count} ürün güncellendi`);
        }
        
        // Try to refresh products list
        try {
          await fetchProducts();
        } catch (refreshError) {
          console.error('Error refreshing products list:', refreshError);
          toast.error('⚠️ Import başarılı ama ürün listesi yenilenemedi. Sayfayı yenileyin.');
        }
        
      } else {
        toast.error(data.error || 'Excel import işlemi başarısız');
      }
    } catch (error) {
      console.error('Error importing products:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Only show error if it's a real import failure, not a UI update issue
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
        toast.error(`Excel import hatası: ${error.message}`);
      } else {
        // For other errors (likely UI related), just log them
        console.warn('Non-critical error during import process:', error.message);
        toast.error('Import işlemi tamamlandı ancak sayfa yenilenemedi. Lütfen sayfayı manuel olarak yenileyin.');
      }
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
        toast.success('Variations saved successfully');
      } else {
        toast.error('Failed to save variations');
      }
    } catch (error) {
      console.error('Error saving variations:', error);
      toast.error('Failed to save variations');
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
              <div className="header-actions">
                <div className="excel-actions">
                  <button 
                    className="btn btn-success"
                    onClick={handleExportProductsExcel}
                    title="Export all products to Excel (backup)"
                  >
                    📊 Backup Excel
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={handleDownloadTemplate}
                    title="Download Excel template for import"
                  >
                    📋 Download Template
                  </button>
                  <div className="import-excel-wrapper">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImportProductsExcel(file);
                          e.target.value = ''; // Reset input
                        }
                      }}
                      style={{ display: 'none' }}
                      id="excel-import-input"
                    />
                    <button 
                      className="btn btn-warning"
                      onClick={() => document.getElementById('excel-import-input').click()}
                      title="Import products from Excel (backup or template)"
                    >
                      📥 Restore Excel
                    </button>
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => document.getElementById('add-product-form').scrollIntoView()}
                >
                  Add Product
                </button>
              </div>
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
                    <label>Slug (auto-generated)</label>
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
                  <div className="custom-file-input">
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
                    <div className={`custom-file-button ${newProduct.images.length > 0 ? 'file-selected' : ''}`}>
                      {uploadingProductImages ? 'Uploading...' : 
                       newProduct.images.length > 0 ? `${newProduct.images.length} image(s) selected` : 
                       'Choose Images'}
                    </div>
                  </div>
                  <div className="file-upload-info">
                    Maximum 10 images, formats: JPG, PNG, GIF
                  </div>
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
                  <div className="custom-file-input">
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
                    <div className={`custom-file-button ${newProduct.video_url ? 'file-selected' : ''}`}>
                      {uploadingProductVideo ? 'Uploading...' : 
                       newProduct.video_url ? 'Video selected' : 
                       'Choose Video'}
                    </div>
                  </div>
                  <div className="file-upload-info">
                    Formats: MP4, WebM, AVI
                  </div>
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
                
                {/* Variation Options */}
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
                    This product has variations (color, size, weight, etc.)
                  </label>
                </div>

                {newProduct.has_variations && (
                  <div className="variation-setup">
                    <h4>Variation Settings</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Variation Type</label>
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
                          <option value="">Select</option>
                          <option value="color">Color</option>
                          <option value="size">Size</option>
                          <option value="weight">Weight</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      {newProduct.variation_type === 'custom' && (
                        <div className="form-group">
                          <label>Custom Variation Name</label>
                          <input
                            type="text"
                            value={newProduct.variation_name}
                            onChange={(e) => setNewProduct({...newProduct, variation_name: e.target.value})}
                            placeholder="e.g.: Material, Style, etc."
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="variation-options-setup">
                      <h5>Variation Options</h5>
                      <p>You can configure details in the Variation tab after saving the product.</p>
                      
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
                            placeholder="Option name (e.g.: Red, Large, 1kg)"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newOptions = newProduct.variation_options.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                          >
                            Delete
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
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Product Specifications */}
                <div className="form-section">
                  <h4>Product Specifications</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight</label>
                      <input
                        type="text"
                        value={newProduct.weight}
                        onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                        placeholder="e.g.: 1.5kg, 250g"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dimensions</label>
                      <input
                        type="text"
                        value={newProduct.dimensions}
                        onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                        placeholder="e.g.: 30x20x10 cm"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Material</label>
                    <input
                      type="text"
                      value={newProduct.material}
                      onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                      placeholder="e.g.: Plastic, Metal, Wood"
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
                    {/* Variation Management - Top Section */}
                    <div className="variation-management-section">
                      <h4>🎨 Variation Management</h4>
                      
                      {editingProduct.has_variations ? (
                        <>
                          <div className="variation-controls">
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to reset all variations? This action cannot be undone.')) {
                                  // Reset variations
                                  setEditingProduct({
                                    ...editingProduct,
                                    has_variations: false,
                                    variation_type: '',
                                    variation_name: '',
                                    variation_options: []
                                  });
                                  toast.success('Variations reset');
                                }
                              }}
                            >
                              🗑️ Reset Variations
                            </button>
                          </div>
                          
                          <div className="current-variation-info">
                            <p><strong>Current Variation Type:</strong> {
                              editingProduct.variation_type === 'custom' ? editingProduct.variation_name :
                              editingProduct.variation_type === 'color' ? 'Color' :
                              editingProduct.variation_type === 'size' ? 'Size' :
                              editingProduct.variation_type === 'weight' ? 'Weight' : 'Unknown'
                            }</p>
                            <p><strong>Option Count:</strong> {editingProduct.variation_options?.length || 0}</p>
                            <p><strong>Options:</strong> {
                              editingProduct.variation_options?.map(opt => opt.name).join(', ') || 'None'
                            }</p>
                          </div>
                        </>
                      ) : (
                        <div className="no-variation-info">
                          <p>This product has no variations yet. You can add variations by checking the checkbox below.</p>
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
                        <label>Slug (auto-generated)</label>
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
                    

                    
                    {/* Variation Addition/Editing */}
                    <div className="variation-setup">
                      <h4>🎨 Variation Management</h4>
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
                          Add variations for this product (color, size, weight, etc.)
                        </label>
                      </div>
                      
                      {/* Variation Type Selection */}
                      {editingProduct.has_variations && (
                        <div className="variation-type-selection">
                          <div className="form-group">
                            <label>Variation Type</label>
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
                              <option value="">Select</option>
                              <option value="color">Color</option>
                              <option value="size">Size</option>
                              <option value="weight">Weight</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>
                          
                          {editingProduct.variation_type === 'custom' && (
                            <div className="form-group">
                              <label>Custom Variation Name</label>
                              <input
                                type="text"
                                value={editingProduct.variation_name || ''}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  variation_name: e.target.value
                                })}
                                placeholder="e.g.: Material, Style, Pattern"
                              />
                            </div>
                          )}
                          
                          {/* Variation Options */}
                          {editingProduct.variation_type && (
                            <div className="variation-options-setup">
                              <h5>Variation Options</h5>
                              <p>Add options for each variation:</p>
                              
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
                                    placeholder="Option name"
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
                                    placeholder="Price difference"
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
                                    placeholder="Stock"
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
                                    Delete
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
                                + Add Option
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Specifications */}
                    <div className="form-section">
                      <h4>Product Specifications</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Weight</label>
                          <input
                            type="text"
                            value={editingProduct.weight || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                            placeholder="e.g.: 1.5kg, 250g"
                          />
                        </div>
                        <div className="form-group">
                          <label>Dimensions</label>
                          <input
                            type="text"
                            value={editingProduct.dimensions || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, dimensions: e.target.value})}
                            placeholder="e.g.: 30x20x10 cm"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Material</label>
                        <input
                          type="text"
                          value={editingProduct.material || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                          placeholder="e.g.: Plastic, Metal, Wood"
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
                              src={`http://localhost:5005${category.image_url}`} 
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
                              background_image_url: category.background_image_url || '',
                              background_color: category.background_color || '',
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
                    <label>Slug (auto-generated)</label>
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
                          src={`http://localhost:5005${newCategory.image_url}`} 
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
                    <label>Background Image</label>
                    {newCategory.background_image_url && (
                      <div className="image-preview">
                        <img 
                          src={`http://localhost:5005${newCategory.background_image_url}`} 
                          alt="Category Background"
                          style={{ width: '150px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button 
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setNewCategory({...newCategory, background_image_url: ''})}
                        >
                          Remove Background
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const backgroundUrl = await handleCategoryBackgroundUpload(file);
                          if (backgroundUrl) {
                            setNewCategory({...newCategory, background_image_url: backgroundUrl});
                          }
                        }
                      }}
                      disabled={uploadingCategoryBackground}
                    />
                    {uploadingCategoryBackground && <span>Uploading background...</span>}
                  </div>

                  <div className="form-group">
                    <label>Background Color (Hex)</label>
                    <input
                      type="color"
                      value={newCategory.background_color || '#ffffff'}
                      onChange={(e) => setNewCategory({...newCategory, background_color: e.target.value})}
                    />
                    <small>This color will be used if no background image</small>
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
                        <label>Slug (auto-generated)</label>
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
                              src={`http://localhost:5005${editingCategory.image_url}`} 
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
                        <label>Background Image</label>
                        {editingCategory.background_image_url && (
                          <div className="image-preview">
                            <img 
                              src={`http://localhost:5005${editingCategory.background_image_url}`} 
                              alt="Category Background"
                              style={{ width: '150px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <button 
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setEditingCategory({...editingCategory, background_image_url: ''})}
                            >
                              Remove Background
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const backgroundUrl = await handleCategoryBackgroundUpload(file);
                              if (backgroundUrl) {
                                setEditingCategory({...editingCategory, background_image_url: backgroundUrl});
                              }
                            }
                          }}
                          disabled={uploadingCategoryBackground}
                        />
                        {uploadingCategoryBackground && <span>Uploading background...</span>}
                      </div>

                      <div className="form-group">
                        <label>Background Color (Hex)</label>
                        <input
                          type="color"
                          value={editingCategory.background_color || '#ffffff'}
                          onChange={(e) => setEditingCategory({...editingCategory, background_color: e.target.value})}
                        />
                        <small>This color will be used if no background image</small>
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
              <p>Manage details of products with variations (price, stock, images, etc.)</p>
            </div>

            <div className="variation-products">
              <h3>Products with Variations</h3>
              
              {products.filter(product => product.has_variations).length === 0 ? (
                <div className="no-variation-products">
                  <p>No products with variations yet. When adding products, check "This product has variations" option.</p>
                </div>
              ) : (
                <div className="variation-products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Variation Type</th>
                        <th>Options</th>
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
                              {product.variation_type === 'color' && 'Color'}
                              {product.variation_type === 'size' && 'Size'}
                              {product.variation_type === 'weight' && 'Weight'}
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
                                <span className="text-muted">No options added yet</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelectedProductForVariations(product)}
                            >
                              Manage Variations
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
                    <h3>{selectedProductForVariations.name} - Variation Management</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setSelectedProductForVariations(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="variation-management">
                    <p>
                      <strong>Variation Type:</strong> {' '}
                      {selectedProductForVariations.variation_type === 'color' && 'Color'}
                      {selectedProductForVariations.variation_type === 'size' && 'Size'}
                      {selectedProductForVariations.variation_type === 'weight' && 'Weight'}
                      {selectedProductForVariations.variation_type === 'custom' && selectedProductForVariations.variation_name}
                    </p>
                    
                    <div className="variation-options-management">
                      <h4>Variation Options</h4>
                      
                      {selectedProductForVariations.variation_options && selectedProductForVariations.variation_options.map((option, index) => (
                        <div key={index} className="variation-option-card">
                          <div className="option-header">
                            <h5>{option.name}</h5>
                          </div>
                          
                          <div className="option-details">
                            <div className="form-row">
                              <div className="form-group">
                                <label>Price Difference</label>
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
                                <small>Amount to add/subtract from base price</small>
                              </div>
                              
                              <div className="form-group">
                                <label>Stock</label>
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
                              <label>Images Specific to This Option</label>
                              <div className="custom-file-input">
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
                                <div className={`custom-file-button ${option.images && option.images.length > 0 ? 'file-selected' : ''}`}>
                                  {option.images && option.images.length > 0 ? `${option.images.length} image(s)` : 'Choose Images'}
                                </div>
                              </div>
                              
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
                                        Delete
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
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => saveProductVariations(selectedProductForVariations)}
                      >
                        Save Variations
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
              <h2>Site Settings</h2>
            </div>

            {/* Settings Sub Tabs */}
            <div className="settings-tabs">
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'identity' ? 'active' : ''}`}
                onClick={() => setSettingsTab('identity')}
              >
                Site Identity
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'welcome' ? 'active' : ''}`}
                onClick={() => setSettingsTab('welcome')}
              >
                Welcome Section
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'footer' ? 'active' : ''}`}
                onClick={() => setSettingsTab('footer')}
              >
                Footer Settings
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'homepage-products' ? 'active' : ''}`}
                onClick={() => setSettingsTab('homepage-products')}
              >
                Homepage Products
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'homepage-products2' ? 'active' : ''}`}
                onClick={() => setSettingsTab('homepage-products2')}
              >
                Homepage Products 2
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'collections' ? 'active' : ''}`}
                onClick={() => setSettingsTab('collections')}
              >
                Collections
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'contact' ? 'active' : ''}`}
                onClick={() => setSettingsTab('contact')}
              >
                Contact & Social
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'business' ? 'active' : ''}`}
                onClick={() => setSettingsTab('business')}
              >
                Business Settings
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'seo' ? 'active' : ''}`}
                onClick={() => setSettingsTab('seo')}
              >
                SEO Settings
              </button>
              <button 
                type="button"
                className={`tab-btn ${settingsTab === 'features' ? 'active' : ''}`}
                onClick={() => setSettingsTab('features')}
              >
                Features
              </button>
            </div>

            <form onSubmit={handleUpdateSiteSettings} className="site-settings-form">
              
              {/* Site Identity Tab */}
              {settingsTab === 'identity' && (
                <div className="settings-section">
                  <h3>Site Identity</h3>
                  
                  <div className="form-group">
                    <label>Site Name</label>
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
                    <small>Site name to be displayed in header (lowercase)</small>
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
                      Use logo (if unchecked, text will be shown)
                    </label>
                  </div>

                  {siteSettings.use_logo && (
                    <>
                      <div className="form-group">
                        <label>Site Logo</label>
                        <div className="custom-file-input">
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
                          <div className={`custom-file-button ${siteSettings.site_logo ? 'file-selected' : ''}`}>
                            {uploadingSiteLogo ? 'Uploading...' : 
                             siteSettings.site_logo ? 'Logo uploaded' : 
                             'Choose Logo'}
                          </div>
                        </div>
                        
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
                              Remove Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Logo Width (pixels)</label>
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
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Logo Height (pixels)</label>
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
                          <small>Between 20-200 pixels</small>
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
                      Use second logo
                    </label>
                  </div>

                  {siteSettings.use_logo2 && (
                    <>
                      <div className="form-group">
                        <label>Second Logo</label>
                        <div className="custom-file-input">
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
                          <div className={`custom-file-button ${siteSettings.site_logo2 ? 'file-selected' : ''}`}>
                            {uploadingSiteLogo2 ? 'Uploading...' : 
                             siteSettings.site_logo2 ? 'Second logo uploaded' : 
                             'Choose Second Logo'}
                          </div>
                        </div>
                        
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
                              Remove Second Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Second Logo Width (pixels)</label>
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
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Second Logo Height (pixels)</label>
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
                          <small>Between 20-200 pixels</small>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Marquee Settings */}
                  <div className="settings-divider">
                    <h4>Header Marquee Settings</h4>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.marquee_enabled}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          marquee_enabled: e.target.checked
                        }))}
                      />
                      Enable header marquee
                    </label>
                  </div>

                  {siteSettings.marquee_enabled && (
                    <>
                      <div className="form-group">
                        <label>Marquee Text</label>
                        <textarea
                          value={siteSettings.marquee_text}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            marquee_text: e.target.value
                          }))}
                          placeholder="Enter marquee text..."
                          rows="3"
                          required
                        />
                        <small>Text to display in the scrolling marquee</small>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Font Family</label>
                          <select
                            value={siteSettings.marquee_font_family}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_family: e.target.value
                            }))}
                          >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Impact, sans-serif">Impact</option>
                            <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Font Size</label>
                          <input
                            type="text"
                            value={siteSettings.marquee_font_size}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_size: e.target.value
                            }))}
                            placeholder="14px"
                          />
                          <small>e.g., 14px, 1.2em, 16pt</small>
                        </div>

                        <div className="form-group">
                          <label>Font Weight</label>
                          <select
                            value={siteSettings.marquee_font_weight}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_weight: e.target.value
                            }))}
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="900">900</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Text Color</label>
                          <input
                            type="color"
                            value={siteSettings.marquee_color}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_color: e.target.value
                            }))}
                          />
                        </div>

                        <div className="form-group">
                          <label>Background Color</label>
                          <input
                            type="color"
                            value={siteSettings.marquee_background_color}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_background_color: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Scroll Speed (pixels/second)</label>
                          <input
                            type="number"
                            min="10"
                            max="200"
                            value={siteSettings.marquee_speed}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_speed: parseInt(e.target.value) || 30
                            }))}
                            placeholder="30"
                          />
                          <small>Between 10-200 pixels per second</small>
                        </div>

                        <div className="form-group">
                          <label>Scroll Direction</label>
                          <select
                            value={siteSettings.marquee_direction}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_direction: e.target.value
                            }))}
                          >
                            <option value="left">Left to Right</option>
                            <option value="right">Right to Left</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={siteSettings.marquee_pause_on_hover}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                marquee_pause_on_hover: e.target.checked
                              }))}
                            />
                            Pause on hover
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Welcome Section Tab */}
              {settingsTab === 'welcome' && (
                <div className="settings-section">
                  <h3>Welcome Section</h3>
                  <p>Customize the appearance of the welcome section on the home page</p>

                  <div className="form-group">
                    <label>Welcome Title</label>
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
                    <label>Welcome Subtitle</label>
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
                    <label>Welcome Background Image</label>
                    <div className="custom-file-input">
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
                      <div className={`custom-file-button ${siteSettings.welcome_background_image ? 'file-selected' : ''}`}>
                        {uploadingWelcomeBackground ? 'Uploading...' : 
                         siteSettings.welcome_background_image ? 'Background image uploaded' : 
                         'Choose Background Image'}
                      </div>
                    </div>
                    
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
                          Remove Background Image
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Background Color</label>
                      <input
                        type="color"
                        value={siteSettings.welcome_background_color}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          welcome_background_color: e.target.value
                        }))}
                      />
                      <small>Color to use if no background image</small>
                    </div>

                    <div className="form-group">
                      <label>Text Color</label>
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
                    <label>Button Text</label>
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
                      <label>Button Link</label>
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
                      <label>Button Color</label>
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
                </div>
              )}

              {/* Collections Section Tab */}
              {settingsTab === 'collections' && (
                <div className="settings-section">
                  <h3>Collections Section</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.collections_show_section}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          collections_show_section: e.target.checked
                        }))}
                      />
                      Show collections section
                    </label>
                  </div>

                  {siteSettings.collections_show_section && (
                    <>
                      <div className="form-group">
                        <label>Collections Title</label>
                        <input
                          type="text"
                          value={siteSettings.collections_title}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            collections_title: e.target.value
                          }))}
                          placeholder="Our Collections"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Categories Per Row</label>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={siteSettings.collections_categories_per_row}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              collections_categories_per_row: parseInt(e.target.value) || 4
                            }))}
                            placeholder="4"
                          />
                          <small>Between 1-6</small>
                        </div>

                        <div className="form-group">
                          <label>Maximum Rows</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={siteSettings.collections_max_rows}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              collections_max_rows: parseInt(e.target.value) || 1
                            }))}
                            placeholder="1"
                          />
                          <small>Between 1-5</small>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Contact & Social Tab */}
              {settingsTab === 'contact' && (
                <div className="settings-section">
                  <h3>Contact & Social Media</h3>
                  
                  <div className="form-group">
                    <h4>Contact Information</h4>
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={siteSettings.contact_phone || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        contact_phone: e.target.value
                      }))}
                      placeholder="+90 555 123 4567"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={siteSettings.contact_email || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        contact_email: e.target.value
                      }))}
                      placeholder="info@pebdeq.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      value={siteSettings.contact_address || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        contact_address: e.target.value
                      }))}
                      placeholder="Istanbul, Turkey"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <h4>Social Media Accounts</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Instagram</label>
                      <input
                        type="text"
                        value={siteSettings.social_instagram || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          social_instagram: e.target.value
                        }))}
                        placeholder="@pebdeq"
                      />
                    </div>

                    <div className="form-group">
                      <label>Facebook</label>
                      <input
                        type="text"
                        value={siteSettings.social_facebook || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          social_facebook: e.target.value
                        }))}
                        placeholder="pebdeq"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Twitter</label>
                      <input
                        type="text"
                        value={siteSettings.social_twitter || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          social_twitter: e.target.value
                        }))}
                        placeholder="@pebdeq"
                      />
                    </div>

                    <div className="form-group">
                      <label>YouTube</label>
                      <input
                        type="text"
                        value={siteSettings.social_youtube || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          social_youtube: e.target.value
                        }))}
                        placeholder="pebdeq"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                      type="text"
                      value={siteSettings.social_linkedin || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        social_linkedin: e.target.value
                      }))}
                      placeholder="pebdeq"
                    />
                  </div>
                </div>
              )}

              {/* SEO Settings Tab */}
              {settingsTab === 'seo' && (
                <div className="settings-section">
                  <h3>SEO Settings</h3>
                  
                  <div className="form-group">
                    <label>Meta Title</label>
                    <input
                      type="text"
                      value={siteSettings.meta_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        meta_title: e.target.value
                      }))}
                      placeholder="PEBDEQ - Craft, Vintage, Innovation"
                      maxLength="60"
                    />
                    <small>Maximum 60 characters recommended</small>
                  </div>

                  <div className="form-group">
                    <label>Meta Description</label>
                    <textarea
                      value={siteSettings.meta_description || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        meta_description: e.target.value
                      }))}
                      placeholder="Discover unique 3D printed items, vintage tools, antique light bulbs, and custom laser engraving services."
                      maxLength="160"
                      rows="3"
                    />
                    <small>Maximum 160 characters recommended</small>
                  </div>

                  <div className="form-group">
                    <label>Meta Keywords</label>
                    <textarea
                      value={siteSettings.meta_keywords || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        meta_keywords: e.target.value
                      }))}
                      placeholder="3D printing, vintage tools, antique bulbs, laser engraving, custom products"
                      rows="2"
                    />
                    <small>Separate with commas</small>
                  </div>
                </div>
              )}

              {/* Business Settings Tab */}
              {settingsTab === 'business' && (
                <div className="settings-section">
                  <h3>Business Settings</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Currency Symbol</label>
                      <input
                        type="text"
                        value={siteSettings.currency_symbol || '₺'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          currency_symbol: e.target.value
                        }))}
                        placeholder="₺"
                        maxLength="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Currency Code</label>
                      <input
                        type="text"
                        value={siteSettings.currency_code || 'TRY'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          currency_code: e.target.value.toUpperCase()
                        }))}
                        placeholder="TRY"
                        maxLength="3"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Shipping Cost</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={siteSettings.shipping_cost || 0}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          shipping_cost: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="15.00"
                      />
                      <small>Default shipping cost</small>
                    </div>

                    <div className="form-group">
                      <label>Free Shipping Threshold</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={siteSettings.free_shipping_threshold || 0}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          free_shipping_threshold: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="200.00"
                      />
                      <small>Free shipping above this amount</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {settingsTab === 'features' && (
                <div className="settings-section">
                  <h3>Feature Settings</h3>
                  
                  <div className="form-group">
                    <h4>Site Features</h4>
                    <p>Choose which features to enable</p>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_reviews || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_reviews: e.target.checked
                        }))}
                      />
                      Enable product reviews
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_wishlist || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_wishlist: e.target.checked
                        }))}
                      />
                      Enable wishlist feature
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_compare || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_compare: e.target.checked
                        }))}
                      />
                      Enable product comparison feature
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_newsletter || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_newsletter: e.target.checked
                        }))}
                      />
                      Enable newsletter subscription
                    </label>
                  </div>

                  <div className="form-group">
                    <h4>System Settings</h4>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.maintenance_mode || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          maintenance_mode: e.target.checked
                        }))}
                      />
                      Maintenance mode (Site will be closed for visitors)
                    </label>
                    <small style={{color: 'red'}}>⚠️ If you enable this option, the site will be inaccessible to visitors!</small>
                  </div>
                </div>
              )}

              {/* Footer Tab */}
              {settingsTab === 'footer' && (
                <div className="settings-section">
                  <h3>Footer Settings</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_show_section: e.target.checked
                        }))}
                      />
                      Show footer section
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Footer Background Color</label>
                      <input
                        type="color"
                        value={siteSettings.footer_background_color || '#2c3e50'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_background_color: e.target.value
                        }))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Footer Text Color</label>
                      <input
                        type="color"
                        value={siteSettings.footer_text_color || '#ffffff'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_text_color: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={siteSettings.footer_company_name || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_company_name: e.target.value
                      }))}
                      placeholder="PEBDEQ"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Description</label>
                    <textarea
                      value={siteSettings.footer_company_description || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_company_description: e.target.value
                      }))}
                      placeholder="Crafted with passion, delivered with precision."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Copyright Text</label>
                    <input
                      type="text"
                      value={siteSettings.footer_copyright_text || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_copyright_text: e.target.value
                      }))}
                      placeholder="© 2024 PEBDEQ. All rights reserved."
                    />
                  </div>

                  {/* Footer Logo Settings */}
                  <div className="settings-divider">
                    <h4>Footer Logo Settings</h4>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_use_logo || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_use_logo: e.target.checked
                        }))}
                      />
                      Use footer logo (if unchecked, company name will be shown)
                    </label>
                  </div>

                  {siteSettings.footer_use_logo && (
                    <>
                      <div className="form-group">
                        <label>Footer Logo</label>
                        <div className="custom-file-input">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleFooterLogoUpload(file);
                              }
                            }}
                            disabled={uploadingFooterLogo}
                          />
                          <div className={`custom-file-button ${siteSettings.footer_logo ? 'file-selected' : ''}`}>
                            {uploadingFooterLogo ? 'Uploading...' : 
                             siteSettings.footer_logo ? 'Footer logo uploaded' : 
                             'Choose Footer Logo'}
                          </div>
                        </div>
                        
                        {siteSettings.footer_logo && (
                          <div className="logo-preview">
                            <img 
                              src={`http://localhost:5005${siteSettings.footer_logo}`} 
                              alt="Footer Logo" 
                              style={{ 
                                width: `${siteSettings.footer_logo_width || 120}px`,
                                height: `${siteSettings.footer_logo_height || 40}px`,
                                objectFit: 'contain' 
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setSiteSettings(prev => ({
                                ...prev,
                                footer_logo: null
                              }))}
                            >
                              Remove Footer Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Footer Logo Width (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={siteSettings.footer_logo_width || 120}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              footer_logo_width: parseInt(e.target.value) || 120
                            }))}
                            placeholder="120"
                          />
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Footer Logo Height (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={siteSettings.footer_logo_height || 40}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              footer_logo_height: parseInt(e.target.value) || 40
                            }))}
                            placeholder="40"
                          />
                          <small>Between 20-200 pixels</small>
                        </div>
                      </div>
                    </>
                  )}

                  <hr />

                  {/* Support Section */}
                  <div className="form-group">
                    <h4>Support Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_support_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_support_show_section: e.target.checked
                        }))}
                      />
                      Show support section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Support Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_support_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_support_title: e.target.value
                      }))}
                      placeholder="Support"
                    />
                  </div>

                  <div className="form-group">
                    <label>Support Links</label>
                    <div className="links-manager">
                      {(siteSettings.footer_support_links || []).map((link, index) => (
                        <div key={index} className="link-item">
                          <input
                            type="text"
                            placeholder="Link Title"
                            value={link.title || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_support_links || [])];
                              newLinks[index] = { ...newLinks[index], title: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Link URL"
                            value={link.url || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_support_links || [])];
                              newLinks[index] = { ...newLinks[index], url: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                          />
                          <label>
                            <input
                              type="checkbox"
                              checked={link.is_external || false}
                              onChange={(e) => {
                                const newLinks = [...(siteSettings.footer_support_links || [])];
                                newLinks[index] = { ...newLinks[index], is_external: e.target.checked };
                                setSiteSettings(prev => ({
                                  ...prev,
                                  footer_support_links: newLinks
                                }));
                              }}
                            />
                            External Link
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newLinks = [...(siteSettings.footer_support_links || [])];
                              newLinks.splice(index, 1);
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          const newLinks = [...(siteSettings.footer_support_links || [])];
                          newLinks.push({ title: '', url: '', is_external: false });
                          setSiteSettings(prev => ({
                            ...prev,
                            footer_support_links: newLinks
                          }));
                        }}
                      >
                        Add Support Link
                      </button>
                    </div>
                  </div>

                  <hr />

                  {/* Quick Links Section */}
                  <div className="form-group">
                    <h4>Quick Links Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_quick_links_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_quick_links_show_section: e.target.checked
                        }))}
                      />
                      Show quick links section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Quick Links Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_quick_links_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_quick_links_title: e.target.value
                      }))}
                      placeholder="Quick Links"
                    />
                  </div>

                  <div className="form-group">
                    <label>Quick Links</label>
                    <div className="links-manager">
                      {(siteSettings.footer_quick_links || []).map((link, index) => (
                        <div key={index} className="link-item">
                          <input
                            type="text"
                            placeholder="Link Title"
                            value={link.title || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_quick_links || [])];
                              newLinks[index] = { ...newLinks[index], title: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Link URL"
                            value={link.url || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_quick_links || [])];
                              newLinks[index] = { ...newLinks[index], url: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                          />
                          <label>
                            <input
                              type="checkbox"
                              checked={link.is_external || false}
                              onChange={(e) => {
                                const newLinks = [...(siteSettings.footer_quick_links || [])];
                                newLinks[index] = { ...newLinks[index], is_external: e.target.checked };
                                setSiteSettings(prev => ({
                                  ...prev,
                                  footer_quick_links: newLinks
                                }));
                              }}
                            />
                            External Link
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newLinks = [...(siteSettings.footer_quick_links || [])];
                              newLinks.splice(index, 1);
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          const newLinks = [...(siteSettings.footer_quick_links || [])];
                          newLinks.push({ title: '', url: '', is_external: false });
                          setSiteSettings(prev => ({
                            ...prev,
                            footer_quick_links: newLinks
                          }));
                        }}
                      >
                        Add Quick Link
                      </button>
                    </div>
                  </div>

                  <hr />

                  {/* Social Section */}
                  <div className="form-group">
                    <h4>Social Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_social_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_social_show_section: e.target.checked
                        }))}
                      />
                      Show social section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Social Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_social_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_title: e.target.value
                      }))}
                      placeholder="Follow Us"
                    />
                  </div>

                  <hr />

                  {/* Newsletter Section */}
                  <div className="form-group">
                    <h4>Newsletter Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_newsletter_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_newsletter_show_section: e.target.checked
                        }))}
                      />
                      Show newsletter section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Newsletter Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_newsletter_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_title: e.target.value
                      }))}
                      placeholder="Newsletter"
                    />
                  </div>

                  <div className="form-group">
                    <label>Newsletter Description</label>
                    <textarea
                      value={siteSettings.footer_newsletter_description || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_description: e.target.value
                      }))}
                      placeholder="Subscribe to get updates about new products and offers."
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Newsletter Placeholder Text</label>
                      <input
                        type="text"
                        value={siteSettings.footer_newsletter_placeholder || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_newsletter_placeholder: e.target.value
                        }))}
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="form-group">
                      <label>Newsletter Button Text</label>
                      <input
                        type="text"
                        value={siteSettings.footer_newsletter_button_text || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_newsletter_button_text: e.target.value
                        }))}
                        placeholder="Subscribe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Products Tab */}
              {settingsTab === 'homepage-products' && (
                <div className="settings-section">
                  <h3>Homepage Products Settings</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_section: e.target.checked
                        }))}
                      />
                      Show homepage products section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_title: e.target.value
                      }))}
                      placeholder="Featured Products"
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products_subtitle || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_subtitle: e.target.value
                      }))}
                      placeholder="Discover our most popular items"
                    />
                  </div>

                  <hr />

                  {/* Layout Settings */}
                  <h4>Layout Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={siteSettings.homepage_products_max_rows || 2}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_max_rows: parseInt(e.target.value) || 2
                        }))}
                      />
                      <small>Number of rows to display (1-5)</small>
                    </div>

                    <div className="form-group">
                      <label>Products Per Row</label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={siteSettings.homepage_products_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_per_row: parseInt(e.target.value) || 4
                        }))}
                      />
                      <small>Number of products per row (2-6)</small>
                    </div>

                    <div className="form-group">
                      <label>Maximum Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={siteSettings.homepage_products_max_items || 8}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_max_items: parseInt(e.target.value) || 8
                        }))}
                      />
                      <small>Total number of products to show (4-30)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Image Settings */}
                  <h4>Image Settings</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_images || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_images: e.target.checked
                        }))}
                      />
                      Show product images
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Image Width (px)</label>
                      <input
                        type="number"
                        min="100"
                        max="500"
                        value={siteSettings.homepage_products_image_width || 300}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_image_width: parseInt(e.target.value) || 300
                        }))}
                      />
                      <small>Product image width (100-500px)</small>
                    </div>

                    <div className="form-group">
                      <label>Image Height (px)</label>
                      <input
                        type="number"
                        min="100"
                        max="400"
                        value={siteSettings.homepage_products_image_height || 200}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_image_height: parseInt(e.target.value) || 200
                        }))}
                      />
                      <small>Product image height (100-400px)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Button Settings */}
                  <h4>Button Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_favorite || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_favorite: e.target.checked
                          }))}
                        />
                        Show favorite button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_buy_now || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_buy_now: e.target.checked
                          }))}
                        />
                        Show buy now button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_details || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_details: e.target.checked
                          }))}
                        />
                        Show details button
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Information Display */}
                  <h4>Information Display</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_price: e.target.checked
                          }))}
                        />
                        Show price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_original_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_original_price: e.target.checked
                          }))}
                        />
                        Show original price (if discounted)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_stock || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_stock: e.target.checked
                          }))}
                        />
                        Show stock status
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_category || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_category: e.target.checked
                          }))}
                        />
                        Show category
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Sorting and Filtering */}
                  <h4>Sorting and Filtering</h4>
                  
                  <div className="form-group">
                    <label>Sort Products By</label>
                    <select
                      value={siteSettings.homepage_products_sort_by || 'featured'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_sort_by: e.target.value
                      }))}
                    >
                      <option value="featured">Featured Products</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Filter by Categories</label>
                    <div className="categories-selection">
                      {categories.map(category => (
                        <label key={category.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(siteSettings.homepage_products_filter_categories || []).includes(category.id)}
                            onChange={(e) => {
                              const currentCategories = siteSettings.homepage_products_filter_categories || [];
                              if (e.target.checked) {
                                setSiteSettings(prev => ({
                                  ...prev,
                                  homepage_products_filter_categories: [...currentCategories, category.id]
                                }));
                              } else {
                                setSiteSettings(prev => ({
                                  ...prev,
                                  homepage_products_filter_categories: currentCategories.filter(id => id !== category.id)
                                }));
                              }
                            }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                    <small>Leave empty to show all categories</small>
                  </div>

                  <hr />

                  {/* View All Button */}
                  <h4>View All Button</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_view_all || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_view_all: e.target.checked
                        }))}
                      />
                      Show "View All Products" button
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products_view_all_text || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_view_all_text: e.target.value
                        }))}
                        placeholder="View All Products"
                      />
                    </div>

                    <div className="form-group">
                      <label>Button Link</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products_view_all_link || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_view_all_link: e.target.value
                        }))}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Card Style Settings */}
                  <h4>Card Style Settings</h4>
                  
                  <div className="form-group">
                    <label>Card Style</label>
                    <select
                      value={siteSettings.homepage_products_card_style || 'modern'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_card_style: e.target.value
                      }))}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_card_shadow || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_card_shadow: e.target.checked
                          }))}
                        />
                        Show card shadow
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_card_hover_effect || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_card_hover_effect: e.target.checked
                          }))}
                        />
                        Show hover effects
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_badges || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_badges: e.target.checked
                          }))}
                        />
                        Show badges (Featured, New, etc.)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_rating || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_rating: e.target.checked
                          }))}
                        />
                        Show ratings
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_quick_view || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_quick_view: e.target.checked
                          }))}
                        />
                        Show quick view button
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Products 2 Settings */}
              {activeTab === 'settings' && settingsTab === 'homepage-products2' && (
                <div className="settings-section">
                  <h3>Homepage Products 2 Settings</h3>
                  <p>Configure the second products section on your homepage</p>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_section: e.target.checked
                        }))}
                      />
                      Show homepage products 2 section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products2_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_title: e.target.value
                      }))}
                      placeholder="Latest Products"
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products2_subtitle || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_subtitle: e.target.value
                      }))}
                      placeholder="Check out our newest arrivals"
                    />
                  </div>

                  <hr />

                  {/* Layout Settings */}
                  <h4>Layout Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={siteSettings.homepage_products2_max_rows || 2}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_max_rows: parseInt(e.target.value) || 2
                        }))}
                      />
                      <small>Number of rows to display (1-5)</small>
                    </div>

                    <div className="form-group">
                      <label>Products Per Row</label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={siteSettings.homepage_products2_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_per_row: parseInt(e.target.value) || 4
                        }))}
                      />
                      <small>Number of products per row (2-6)</small>
                    </div>

                    <div className="form-group">
                      <label>Maximum Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={siteSettings.homepage_products2_max_items || 8}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_max_items: parseInt(e.target.value) || 8
                        }))}
                      />
                      <small>Total number of products to show (4-30)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Image Settings */}
                  <h4>Image Settings</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_images || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_images: e.target.checked
                        }))}
                      />
                      Show product images
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Image Width (px)</label>
                      <input
                        type="number"
                        min="100"
                        max="500"
                        value={siteSettings.homepage_products2_image_width || 300}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_image_width: parseInt(e.target.value) || 300
                        }))}
                      />
                      <small>Product image width (100-500px)</small>
                    </div>

                    <div className="form-group">
                      <label>Image Height (px)</label>
                      <input
                        type="number"
                        min="100"
                        max="400"
                        value={siteSettings.homepage_products2_image_height || 200}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_image_height: parseInt(e.target.value) || 200
                        }))}
                      />
                      <small>Product image height (100-400px)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Button Settings */}
                  <h4>Button Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_favorite || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_favorite: e.target.checked
                          }))}
                        />
                        Show favorite button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_buy_now || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_buy_now: e.target.checked
                          }))}
                        />
                        Show buy now button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_details || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_details: e.target.checked
                          }))}
                        />
                        Show details button
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Information Display */}
                  <h4>Information Display</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_price: e.target.checked
                          }))}
                        />
                        Show price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_original_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_original_price: e.target.checked
                          }))}
                        />
                        Show original price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_stock || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_stock: e.target.checked
                          }))}
                        />
                        Show stock status
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_category || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_category: e.target.checked
                        }))}
                      />
                      Show category name
                    </label>
                  </div>

                  <hr />

                  {/* Sorting and Filtering */}
                  <h4>Sorting and Filtering</h4>
                  
                  <div className="form-group">
                    <label>Sort Products By</label>
                    <select
                      value={siteSettings.homepage_products2_sort_by || 'newest'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_sort_by: e.target.value
                      }))}
                    >
                      <option value="featured">Featured Products</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Filter by Categories</label>
                    <div className="categories-selection">
                      {categories.map(category => (
                        <label key={category.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(siteSettings.homepage_products2_filter_categories || []).includes(category.id)}
                            onChange={(e) => {
                              const currentCategories = siteSettings.homepage_products2_filter_categories || [];
                              if (e.target.checked) {
                                setSiteSettings(prev => ({
                                  ...prev,
                                  homepage_products2_filter_categories: [...currentCategories, category.id]
                                }));
                              } else {
                                setSiteSettings(prev => ({
                                  ...prev,
                                  homepage_products2_filter_categories: currentCategories.filter(id => id !== category.id)
                                }));
                              }
                            }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                    <small>Leave empty to show all categories</small>
                  </div>

                  <hr />

                  {/* View All Button */}
                  <h4>View All Button</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_view_all || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_view_all: e.target.checked
                        }))}
                      />
                      Show "View All Products" button
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products2_view_all_text || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_view_all_text: e.target.value
                        }))}
                        placeholder="View All Products"
                      />
                    </div>

                    <div className="form-group">
                      <label>Button Link</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products2_view_all_link || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_view_all_link: e.target.value
                        }))}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Card Style Settings */}
                  <h4>Card Style Settings</h4>
                  
                  <div className="form-group">
                    <label>Card Style</label>
                    <select
                      value={siteSettings.homepage_products2_card_style || 'modern'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_card_style: e.target.value
                      }))}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_card_shadow || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_card_shadow: e.target.checked
                          }))}
                        />
                        Show card shadow
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_card_hover_effect || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_card_hover_effect: e.target.checked
                          }))}
                        />
                        Show hover effects
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_badges || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_badges: e.target.checked
                          }))}
                        />
                        Show badges (Featured, New, etc.)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_rating || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_rating: e.target.checked
                          }))}
                        />
                        Show ratings
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_quick_view || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_quick_view: e.target.checked
                          }))}
                        />
                        Show quick view button
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 