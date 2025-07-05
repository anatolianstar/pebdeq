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
    
    # Ürün Özellikleri
    weight = db.Column(db.String(50))  # Ağırlık bilgisi
    dimensions = db.Column(db.String(100))  # Boyut bilgisi
    material = db.Column(db.String(100))  # Malzeme bilgisi
    
    # Relationships
    product_variations = db.relationship('ProductVariation', backref='product', lazy=True, cascade='all, delete-orphan')

class VariationType(db.Model):
    """Varyasyon türleri (örn: Renk, Boyut, Malzeme)"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)  # Renk, Boyut, Malzeme
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
    """Ürün-Varyasyon ilişkisi ve kombinasyonları"""
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
    site_name = db.Column(db.String(100), default='pebdeq')
    site_logo = db.Column(db.String(255))  # Logo resmi URL'si
    use_logo = db.Column(db.Boolean, default=False)  # Logo kullanılsın mı yoksa yazı mı
    logo_width = db.Column(db.Integer, default=120)  # Logo genişliği (piksel)
    logo_height = db.Column(db.Integer, default=40)  # Logo yüksekliği (piksel)
    site_logo2 = db.Column(db.String(255))  # İkinci logo resmi URL'si
    use_logo2 = db.Column(db.Boolean, default=False)  # İkinci logo kullanılsın mı
    logo2_width = db.Column(db.Integer, default=120)  # İkinci logo genişliği (piksel)
    logo2_height = db.Column(db.Integer, default=40)  # İkinci logo yüksekliği (piksel)
    
    # Welcome Section Settings
    welcome_title = db.Column(db.String(200), default='Welcome to Pebdeq')
    welcome_subtitle = db.Column(db.String(200), default='Crafted. Vintage. Smart.')
    welcome_background_image = db.Column(db.String(255))  # Arka plan resmi URL'si
    welcome_background_color = db.Column(db.String(7), default='#667eea')  # Arka plan rengi (hex)
    welcome_text_color = db.Column(db.String(7), default='#ffffff')  # Yazı rengi (hex)
    welcome_button_text = db.Column(db.String(100), default='Explore Products')
    welcome_button_link = db.Column(db.String(255), default='/products')
    welcome_button_color = db.Column(db.String(7), default='#00b894')  # Buton rengi (hex)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 