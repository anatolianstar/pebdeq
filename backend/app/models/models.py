from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    orders = db.relationship('Order', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    background_image_url = db.Column(db.String(255))  # Kategori arka plan resmi
    background_color = db.Column(db.String(7))  # Kategori arka plan rengi (hex)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    stock_quantity = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    images = db.Column(db.JSON)  # Array of image URLs
    video_url = db.Column(db.String(255))  # Single video URL
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Basit Varyasyon Alanları
    has_variations = db.Column(db.Boolean, default=False)
    variation_type = db.Column(db.String(50))  # 'color', 'size', 'weight', 'custom'
    variation_name = db.Column(db.String(100))  # Özel varyasyon adı
    variation_options = db.Column(db.JSON)  # [{name: 'Kırmızı', value: 'red', price_modifier: 0, stock: 10, images: []}]
    
    # Product Properties
    weight = db.Column(db.String(50))  # Weight information
    dimensions = db.Column(db.String(100))  # Size information
    material = db.Column(db.String(100))  # Material information
    
    # Relationships
    product_variations = db.relationship('ProductVariation', backref='product', lazy=True, cascade='all, delete-orphan')

class VariationType(db.Model):
    """Variation types (e.g: Color, Size, Material)"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)  # Color, Size, Material
    slug = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    variation_options = db.relationship('VariationOption', backref='variation_type', lazy=True, cascade='all, delete-orphan')

class VariationOption(db.Model):
    """Varyasyon seçenekleri (örn: Kırmızı, Mavi, Küçük, Büyük)"""
    id = db.Column(db.Integer, primary_key=True)
    variation_type_id = db.Column(db.Integer, db.ForeignKey('variation_type.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # Kırmızı, Mavi, Küçük
    value = db.Column(db.String(100), nullable=False)  # red, blue, small
    hex_color = db.Column(db.String(7))  # Renk için hex kodu (opsiyonel)
    image_url = db.Column(db.String(255))  # Bu seçenek için özel resim
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ProductVariation(db.Model):
    """Product-Variation relationships and combinations"""
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    variation_option1_id = db.Column(db.Integer, db.ForeignKey('variation_option.id'))  # İlk varyasyon
    variation_option2_id = db.Column(db.Integer, db.ForeignKey('variation_option.id'))  # İkinci varyasyon
    
    # Bu kombinasyona özel veriler
    sku = db.Column(db.String(100))  # Stok kodu
    price_modifier = db.Column(db.Float, default=0)  # Fiyat farkı (+/-)
    stock_quantity = db.Column(db.Integer, default=0)
    images = db.Column(db.JSON)  # Bu kombinasyona özel resimler
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    variation_option1 = db.relationship('VariationOption', foreign_keys=[variation_option1_id], backref='product_variations1')
    variation_option2 = db.relationship('VariationOption', foreign_keys=[variation_option2_id], backref='product_variations2')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, paid, shipped, delivered, cancelled
    shipping_address = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(50), default='pending')
    stripe_payment_intent_id = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order_items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    
    product = db.relationship('Product', backref='order_items')

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    author = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100))
    featured_image = db.Column(db.String(255))
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SiteSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Site Identity
    site_name = db.Column(db.String(100), default='pebdeq')
    site_logo = db.Column(db.String(255))  # Logo resmi URL'si
    use_logo = db.Column(db.Boolean, default=False)  # Logo kullanılsın mı yoksa yazı mı
    logo_width = db.Column(db.Integer, default=120)  # Logo genişliği (piksel)
    logo_height = db.Column(db.Integer, default=40)  # Logo yüksekliği (piksel)
    site_logo2 = db.Column(db.String(255))  # İkinci logo resmi URL'si
    use_logo2 = db.Column(db.Boolean, default=False)  # İkinci logo kullanılsın mı
    logo2_width = db.Column(db.Integer, default=120)  # İkinci logo genişliği (piksel)
    logo2_height = db.Column(db.Integer, default=40)  # İkinci logo yüksekliği (piksel)
    
    # Marquee Settings
    marquee_enabled = db.Column(db.Boolean, default=False)
    marquee_text = db.Column(db.Text, default='Welcome to our store! Special offers available now.')
    marquee_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    marquee_font_size = db.Column(db.String(20), default='14px')
    marquee_font_weight = db.Column(db.String(20), default='normal')
    marquee_color = db.Column(db.String(7), default='#ffffff')
    marquee_background_color = db.Column(db.String(7), default='#ff6b6b')
    marquee_speed = db.Column(db.Integer, default=30)
    marquee_direction = db.Column(db.String(10), default='left')  # left, right
    marquee_pause_on_hover = db.Column(db.Boolean, default=True)
    
    # Welcome Section Settings
    welcome_title = db.Column(db.String(200), default='Welcome to Pebdeq')
    welcome_subtitle = db.Column(db.String(200), default='Crafted. Vintage. Smart.')
    welcome_background_image = db.Column(db.String(255))  # Arka plan resmi URL'si
    welcome_background_color = db.Column(db.String(7), default='#667eea')  # Arka plan rengi (hex)
    welcome_text_color = db.Column(db.String(7), default='#ffffff')  # Yazı rengi (hex)
    welcome_button_text = db.Column(db.String(100), default='Explore Products')
    welcome_button_link = db.Column(db.String(255), default='/products')
    welcome_button_color = db.Column(db.String(7), default='#00b894')  # Buton rengi (hex)
    
    # Collections Section Settings
    collections_title = db.Column(db.String(200), default='Our Collections')
    collections_show_categories = db.Column(db.JSON, default=lambda: [])  # Gösterilecek kategori ID'leri
    collections_categories_per_row = db.Column(db.Integer, default=4)  # Satırda kaç kategori
    collections_max_rows = db.Column(db.Integer, default=1)  # Maksimum satır sayısı
    collections_show_section = db.Column(db.Boolean, default=True)  # Bölüm gösterilsin mi
    
    # Contact & Social Settings
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(120))
    contact_address = db.Column(db.Text)
    social_instagram = db.Column(db.String(100))
    social_facebook = db.Column(db.String(100))
    social_twitter = db.Column(db.String(100))
    social_youtube = db.Column(db.String(100))
    social_linkedin = db.Column(db.String(100))
    
    # SEO Settings
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.Text)
    meta_keywords = db.Column(db.Text)
    
    # Business Settings
    currency_symbol = db.Column(db.String(10), default='₺')
    currency_code = db.Column(db.String(3), default='TRY')
    shipping_cost = db.Column(db.Float, default=0.0)
    free_shipping_threshold = db.Column(db.Float, default=0.0)
    
    # Feature Flags
    enable_reviews = db.Column(db.Boolean, default=True)
    enable_wishlist = db.Column(db.Boolean, default=True)
    enable_compare = db.Column(db.Boolean, default=True)
    enable_newsletter = db.Column(db.Boolean, default=True)
    maintenance_mode = db.Column(db.Boolean, default=False)
    
    # Footer Settings
    footer_show_section = db.Column(db.Boolean, default=True)
    footer_background_color = db.Column(db.String(7), default='#2c3e50')
    footer_text_color = db.Column(db.String(7), default='#ffffff')
    footer_company_name = db.Column(db.String(100), default='PEBDEQ')
    footer_company_description = db.Column(db.Text, default='Crafted with passion, delivered with precision.')
    footer_copyright_text = db.Column(db.String(200), default='© 2024 PEBDEQ. All rights reserved.')
    footer_use_logo = db.Column(db.Boolean, default=False)
    footer_logo = db.Column(db.String(255))  # Footer logo URL'si
    footer_logo_width = db.Column(db.Integer, default=120)
    footer_logo_height = db.Column(db.Integer, default=40)
    
    # Footer Support Section
    footer_support_title = db.Column(db.String(100), default='Support')
    footer_support_show_section = db.Column(db.Boolean, default=True)
    footer_support_links = db.Column(db.JSON, default=lambda: [
        {'title': 'Contact Us', 'url': '/contact', 'is_external': False},
        {'title': 'FAQ', 'url': '/faq', 'is_external': False},
        {'title': 'Shipping Info', 'url': '/shipping', 'is_external': False},
        {'title': 'Returns', 'url': '/returns', 'is_external': False}
    ])
    
    # Footer Quick Links Section
    footer_quick_links_title = db.Column(db.String(100), default='Quick Links')
    footer_quick_links_show_section = db.Column(db.Boolean, default=True)
    footer_quick_links = db.Column(db.JSON, default=lambda: [
        {'title': 'About Us', 'url': '/about', 'is_external': False},
        {'title': 'Products', 'url': '/products', 'is_external': False},
        {'title': 'Blog', 'url': '/blog', 'is_external': False},
        {'title': 'Privacy Policy', 'url': '/privacy', 'is_external': False}
    ])
    
    # Footer Social Section
    footer_social_title = db.Column(db.String(100), default='Follow Us')
    footer_social_show_section = db.Column(db.Boolean, default=True)
    
    # Footer Newsletter Section
    footer_newsletter_title = db.Column(db.String(100), default='Newsletter')
    footer_newsletter_show_section = db.Column(db.Boolean, default=True)
    footer_newsletter_description = db.Column(db.Text, default='Subscribe to get updates about new products and offers.')
    footer_newsletter_placeholder = db.Column(db.String(100), default='Enter your email address')
    footer_newsletter_button_text = db.Column(db.String(50), default='Subscribe')
    
    # Homepage Products Settings
    homepage_products_show_section = db.Column(db.Boolean, default=True)
    homepage_products_title = db.Column(db.String(200), default='Featured Products')
    homepage_products_subtitle = db.Column(db.String(200), default='Discover our most popular items')
    homepage_products_max_rows = db.Column(db.Integer, default=2)
    homepage_products_per_row = db.Column(db.Integer, default=4)
    homepage_products_max_items = db.Column(db.Integer, default=8)
    homepage_products_show_images = db.Column(db.Boolean, default=True)
    homepage_products_image_height = db.Column(db.Integer, default=200)
    homepage_products_image_width = db.Column(db.Integer, default=300)
    homepage_products_show_favorite = db.Column(db.Boolean, default=True)
    homepage_products_show_buy_now = db.Column(db.Boolean, default=True)
    homepage_products_show_details = db.Column(db.Boolean, default=True)
    homepage_products_show_price = db.Column(db.Boolean, default=True)
    homepage_products_show_original_price = db.Column(db.Boolean, default=True)
    homepage_products_show_stock = db.Column(db.Boolean, default=True)
    homepage_products_show_category = db.Column(db.Boolean, default=True)
    homepage_products_sort_by = db.Column(db.String(50), default='featured')  # featured, newest, price_low, price_high, name
    homepage_products_filter_categories = db.Column(db.JSON, default=lambda: [])
    homepage_products_show_view_all = db.Column(db.Boolean, default=True)
    homepage_products_view_all_text = db.Column(db.String(100), default='View All Products')
    homepage_products_view_all_link = db.Column(db.String(255), default='/products')
    homepage_products_card_style = db.Column(db.String(50), default='modern')  # modern, classic, minimal
    homepage_products_card_shadow = db.Column(db.Boolean, default=True)
    homepage_products_card_hover_effect = db.Column(db.Boolean, default=True)
    homepage_products_show_badges = db.Column(db.Boolean, default=True)
    homepage_products_show_rating = db.Column(db.Boolean, default=False)
    homepage_products_show_quick_view = db.Column(db.Boolean, default=False)
    
    # Homepage Products 2 Settings
    homepage_products2_show_section = db.Column(db.Boolean, default=True)
    homepage_products2_title = db.Column(db.String(200), default='Latest Products')
    homepage_products2_subtitle = db.Column(db.String(200), default='Check out our newest arrivals')
    homepage_products2_max_rows = db.Column(db.Integer, default=2)
    homepage_products2_per_row = db.Column(db.Integer, default=4)
    homepage_products2_max_items = db.Column(db.Integer, default=8)
    homepage_products2_show_images = db.Column(db.Boolean, default=True)
    homepage_products2_image_height = db.Column(db.Integer, default=200)
    homepage_products2_image_width = db.Column(db.Integer, default=300)
    homepage_products2_show_favorite = db.Column(db.Boolean, default=True)
    homepage_products2_show_buy_now = db.Column(db.Boolean, default=True)
    homepage_products2_show_details = db.Column(db.Boolean, default=True)
    homepage_products2_show_price = db.Column(db.Boolean, default=True)
    homepage_products2_show_original_price = db.Column(db.Boolean, default=True)
    homepage_products2_show_stock = db.Column(db.Boolean, default=True)
    homepage_products2_show_category = db.Column(db.Boolean, default=True)
    homepage_products2_sort_by = db.Column(db.String(50), default='newest')  # featured, newest, price_low, price_high, name
    homepage_products2_filter_categories = db.Column(db.JSON, default=lambda: [])
    homepage_products2_show_view_all = db.Column(db.Boolean, default=True)
    homepage_products2_view_all_text = db.Column(db.String(100), default='View All Products')
    homepage_products2_view_all_link = db.Column(db.String(255), default='/products')
    homepage_products2_card_style = db.Column(db.String(50), default='modern')  # modern, classic, minimal
    homepage_products2_card_shadow = db.Column(db.Boolean, default=True)
    homepage_products2_card_hover_effect = db.Column(db.Boolean, default=True)
    homepage_products2_show_badges = db.Column(db.Boolean, default=True)
    homepage_products2_show_rating = db.Column(db.Boolean, default=False)
    homepage_products2_show_quick_view = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 