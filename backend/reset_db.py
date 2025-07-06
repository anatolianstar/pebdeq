#!/usr/bin/env python

"""
Database Reset Script

Bu script veritabanını tamamen sıfırlar ve örnek verileri yeniden oluşturur.
Dikkat: Tüm mevcut veriler silinecektir!

Kullanım:
    python reset_db.py
"""

from app import create_app, db
from app.models.models import User, Category, Product, Order, OrderItem, BlogPost, ContactMessage, VariationType, VariationOption, ProductVariation, SiteSettings
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

def reset_database():
    """Reset the database by dropping all tables and recreating them"""
    try:
        with app.app_context():
            print("Dropping all tables...")
            db.drop_all()
            print("All tables dropped successfully!")

            print("Recreating all tables...")
            db.create_all()
            print("All tables recreated successfully!")
    except Exception as e:
        print(f"Error resetting database: {e}")

def init_database():
    """Initialize database with sample data"""
    try:
        with app.app_context():
            # Create sample categories if they don't existh
            if not Category.query.first():
                categories = [
                    Category(
                        name='3D Print', 
                        slug='3d-print', 
                        description='Custom 3D printed items and prototypes',
                        background_color='#667eea'
                    ),
                    Category(
                        name='Tools', 
                        slug='tools', 
                        description='Second-hand tools and equipment',
                        background_color='#f093fb'
                    ),
                    Category(
                        name='Vintage Light Bulbs', 
                        slug='vintage-bulbs', 
                        description='Antique and vintage light bulbs',
                        background_color='#ffecd2'
                    ),
                    Category(
                        name='Laser Engraving', 
                        slug='laser-engraving', 
                        description='Custom laser engraving services',
                        background_color='#a8edea'
                    )
                ]

                for category in categories:
                    db.session.add(category)

                db.session.commit()
                print("Sample categories created!")

            # Create sample products if they don't exist
            if not Product.query.first():
                products = [
                    # 3D Print products
                    Product(
                        name='Custom 3D Printed Miniature',
                        slug='custom-3d-printed-miniature',
                        description='High-quality custom 3D printed miniature figures for gaming, collectibles, or personal use.',
                        price=25.99,
                        original_price=35.99,
                        stock_quantity=15,
                        category_id=1,
                        is_featured=True,
                        images=['/images/3d-miniature.jpg']
                    ),
                    Product(
                        name='3D Printed Phone Case',
                        slug='3d-printed-phone-case',
                        description='Durable and stylish 3D printed phone case with custom designs.',
                        price=12.99,
                        stock_quantity=25,
                        category_id=1,
                        images=['/images/phone-case.jpg']
                    ),
                    Product(
                        name='Architectural Model Prototype',
                        slug='architectural-model-prototype',
                        description='Precision 3D printed architectural models for presentations and planning.',
                        price=89.99,
                        stock_quantity=8,
                        category_id=1,
                        images=['/images/arch-model.jpg']
                    ),

                    # Tools products
                    Product(
                        name='Vintage Hammer Set',
                        slug='vintage-hammer-set',
                        description='Well-maintained vintage hammer set with wooden handles. Perfect for collectors.',
                        price=45.00,
                        original_price=65.00,
                        stock_quantity=5,
                        category_id=2,
                        is_featured=True,
                        images=['/images/hammer-set.jpg']
                    ),
                    Product(
                        name='Antique Drill Press',
                        slug='antique-drill-press',
                        description='Restored antique drill press from the 1950s. Fully functional and ready to use.',
                        price=250.00,
                        stock_quantity=2,
                        category_id=2,
                        images=['/images/drill-press.jpg']
                    ),
                    Product(
                        name='Hand Plane Collection',
                        slug='hand-plane-collection',
                        description='Collection of vintage hand planes in excellent condition.',
                        price=125.00,
                        stock_quantity=3,
                        category_id=2,
                        images=['/images/hand-planes.jpg']
                    ),

                    # Vintage Light Bulbs products
                    Product(
                        name='Edison Bulb 40W',
                        slug='edison-bulb-40w',
                        description='Authentic vintage Edison bulb with warm amber glow. Perfect for decorative lighting.',
                        price=15.99,
                        stock_quantity=50,
                        category_id=3,
                        is_featured=True,
                        images=['/images/edison-bulb.jpg']
                    ),
                    Product(
                        name='Vintage Chandelier Bulbs',
                        slug='vintage-chandelier-bulbs',
                        description='Set of 6 vintage chandelier bulbs with decorative filaments.',
                        price=32.99,
                        original_price=45.99,
                        stock_quantity=12,
                        category_id=3,
                        images=['/images/chandelier-bulbs.jpg']
                    ),
                    Product(
                        name='Antique Street Lamp Bulb',
                        slug='antique-street-lamp-bulb',
                        description='Rare antique street lamp bulb from the early 1900s. Collector\'s item.',
                        price=75.00,
                        stock_quantity=3,
                        category_id=3,
                        images=['/images/street-lamp-bulb.jpg']
                    ),

                    # Laser Engraving products
                    Product(
                        name='Custom Wooden Plaque',
                        slug='custom-wooden-plaque',
                        description='Personalized wooden plaque with laser engraving. Perfect for awards or gifts.',
                        price=29.99,
                        stock_quantity=20,
                        category_id=4,
                        is_featured=True,
                        images=['/images/wooden-plaque.jpg']
                    ),
                    Product(
                        name='Engraved Metal Business Cards',
                        slug='engraved-metal-business-cards',
                        description='Premium metal business cards with precision laser engraving.',
                        price=55.00,
                        stock_quantity=15,
                        category_id=4,
                        images=['/images/metal-cards.jpg']
                    ),
                    Product(
                        name='Personalized Acrylic Photo Frame',
                        slug='personalized-acrylic-photo-frame',
                        description='Custom acrylic photo frame with laser-engraved personal message.',
                        price=18.99,
                        stock_quantity=30,
                        category_id=4,
                        images=['/images/acrylic-frame.jpg']
                    )
                ]

                for product in products:
                    db.session.add(product)

                db.session.commit()
                print("Sample products created!")

            # Create admin user if it doesn't exist
            if not User.query.filter_by(is_admin=True).first():
                admin_password = os.getenv('ADMIN_PASSWORD', 'adminx999')
                admin = User(
                    username='admin',
                    email='admin@pebdeq.com',
                    first_name='Admin',
                    last_name='User',
                    is_admin=True
                )
                admin.set_password(admin_password)
                db.session.add(admin)
                db.session.commit()
                print(f"Admin user created! Email: admin@pebdeq.com, Password: {admin_password}")

            # Create sample variation types if they don't exist
            if not VariationType.query.first():
                variation_types = [
                    VariationType(name='Color', slug='color', description='Product color options'),
                    VariationType(name='Size', slug='size', description='Product size options'),
                    VariationType(name='Material', slug='material', description='Product material options'),
                    VariationType(name='Style', slug='style', description='Product style options')
                ]

                for vtype in variation_types:
                    db.session.add(vtype)

                db.session.commit()
                print("Sample variation types created!")

                # Create sample variation options
                variation_options = [
                    # Color options
                    VariationOption(variation_type_id=1, name='Red', value='red', hex_color='#FF0000'),
                    VariationOption(variation_type_id=1, name='Blue', value='blue', hex_color='#0000FF'),
                    VariationOption(variation_type_id=1, name='Green', value='green', hex_color='#00FF00'),
                    VariationOption(variation_type_id=1, name='Yellow', value='yellow', hex_color='#FFFF00'),
                    VariationOption(variation_type_id=1, name='Black', value='black', hex_color='#000000'),
                    VariationOption(variation_type_id=1, name='White', value='white', hex_color='#FFFFFF'),

                    # Size options
                    VariationOption(variation_type_id=2, name='XS', value='xs'),
                    VariationOption(variation_type_id=2, name='S', value='small'),
                    VariationOption(variation_type_id=2, name='M', value='medium'),
                    VariationOption(variation_type_id=2, name='L', value='large'),
                    VariationOption(variation_type_id=2, name='XL', value='xl'),
                    VariationOption(variation_type_id=2, name='XXL', value='xxl'),

                    # Material options
                    VariationOption(variation_type_id=3, name='Plastic', value='plastic'),
                    VariationOption(variation_type_id=3, name='Metal', value='metal'),
                    VariationOption(variation_type_id=3, name='Wood', value='wood'),
                    VariationOption(variation_type_id=3, name='Glass', value='glass'),

                    # Style options
                    VariationOption(variation_type_id=4, name='Modern', value='modern'),
                    VariationOption(variation_type_id=4, name='Classic', value='classic'),
                    VariationOption(variation_type_id=4, name='Vintage', value='vintage'),
                    VariationOption(variation_type_id=4, name='Minimalist', value='minimalist')
                ]

                for option in variation_options:
                    db.session.add(option)

                db.session.commit()
                print("Sample variation options created!")

            # Create comprehensive site settings if they don't exist
            if not SiteSettings.query.first():
                settings = SiteSettings(
                    # Site Identity
                    site_name='PEBDEQ',
                    site_logo='/images/logo.png',
                    use_logo=True,
                    logo_width=120,
                    logo_height=40,
                    
                    # Welcome Section
                    welcome_title='Craft, Vintage, Innovation',
                    welcome_subtitle='Discover unique products and custom designs',
                    welcome_background_color='#667eea',
                    welcome_text_color='#ffffff',
                    welcome_button_text='Shop Now',
                    welcome_button_link='/products',
                    welcome_button_color='#00b894',
                    
                    # Collections Section
                    collections_title='Our Collections',
                    collections_show_section=True,
                    collections_categories_per_row=4,
                    collections_max_rows=1,
                    
                    # Contact & Social
                    contact_phone='+90 555 123 4567',
                    contact_email='info@pebdeq.com',
                    contact_address='Istanbul, Turkey',
                    social_instagram='@pebdeq',
                    social_facebook='pebdeq',
                    social_twitter='@pebdeq',
                    
                    # SEO Settings
                    meta_title='PEBDEQ - Craft, Vintage, Innovation',
                    meta_description='Discover unique 3D printed items, vintage tools, antique light bulbs, and custom laser engraving services.',
                    meta_keywords='3D printing, vintage tools, antique bulbs, laser engraving, custom products',
                    
                    # Business Settings
                    currency_symbol='₺',
                    currency_code='TRY',
                    shipping_cost=15.00,
                    free_shipping_threshold=200.00,
                    
                    # Feature Flags
                    enable_reviews=True,
                    enable_wishlist=True,
                    enable_compare=True,
                    enable_newsletter=True,
                    maintenance_mode=False,
                    
                    # Footer Settings
                    footer_show_section=True,
                    footer_background_color='#2c3e50',
                    footer_text_color='#ffffff',
                    footer_company_name='PEBDEQ',
                    footer_company_description='Crafted with passion, delivered with precision.',
                    footer_copyright_text='© 2024 PEBDEQ. All rights reserved.',
                    
                    # Footer Support Section
                    footer_support_title='Support',
                    footer_support_show_section=True,
                    footer_support_links=[
                        {'title': 'Contact Us', 'url': '/contact', 'is_external': False},
                        {'title': 'FAQ', 'url': '/faq', 'is_external': False},
                        {'title': 'Shipping Info', 'url': '/shipping', 'is_external': False},
                        {'title': 'Returns', 'url': '/returns', 'is_external': False}
                    ],
                    
                    # Footer Quick Links Section
                    footer_quick_links_title='Quick Links',
                    footer_quick_links_show_section=True,
                    footer_quick_links=[
                        {'title': 'About Us', 'url': '/about', 'is_external': False},
                        {'title': 'Products', 'url': '/products', 'is_external': False},
                        {'title': 'Blog', 'url': '/blog', 'is_external': False},
                        {'title': 'Privacy Policy', 'url': '/privacy', 'is_external': False}
                    ],
                    
                    # Footer Social Section
                    footer_social_title='Follow Us',
                    footer_social_show_section=True,
                    
                    # Footer Newsletter Section
                    footer_newsletter_title='Newsletter',
                    footer_newsletter_show_section=True,
                    footer_newsletter_description='Subscribe to get updates about new products and offers.',
                    footer_newsletter_placeholder='Enter your email address',
                    footer_newsletter_button_text='Subscribe',
                    
                    # Homepage Products Settings
                    homepage_products_show_section=True,
                    homepage_products_title='Featured Products',
                    homepage_products_subtitle='Discover our most popular items',
                    homepage_products_max_rows=2,
                    homepage_products_per_row=4,
                    homepage_products_max_items=8,
                    homepage_products_show_images=True,
                    homepage_products_image_height=200,
                    homepage_products_image_width=300,
                    homepage_products_show_favorite=True,
                    homepage_products_show_buy_now=True,
                    homepage_products_show_details=True,
                    homepage_products_show_price=True,
                    homepage_products_show_original_price=True,
                    homepage_products_show_stock=True,
                    homepage_products_show_category=True,
                    homepage_products_sort_by='featured',
                    homepage_products_filter_categories=[],
                    homepage_products_show_view_all=True,
                    homepage_products_view_all_text='View All Products',
                    homepage_products_view_all_link='/products',
                    homepage_products_card_style='modern',
                    homepage_products_card_shadow=True,
                    homepage_products_card_hover_effect=True,
                    homepage_products_show_badges=True,
                    homepage_products_show_rating=False,
                    homepage_products_show_quick_view=False
                )
                db.session.add(settings)
                db.session.commit()
                print("Comprehensive site settings created!")

    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == '__main__':
    print("⚠️  WARNING: This operation will delete all data in the database! ⚠️")
    
    # Auto confirmation
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        confirm = 'y'
    else:
        confirm = input("Are you sure you want to reset the database? (y/N): ")

    if confirm.lower() in ['e', 'evet', 'y', 'yes']:
        reset_database()
        init_database()
        print("\n✅ Database has been reset and reinitialized successfully!")
    else:
        print("\n❌ Database reset operation cancelled.")
