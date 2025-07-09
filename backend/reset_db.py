#!/usr/bin/env python3
"""
Database Reset Script
Bu script veritabanını sıfırlar ve backup'tan ayarları geri yükler
"""

import os
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.models import User, Product, Category, Order, OrderItem, SiteSettings
from backup_current_settings import CURRENT_SETTINGS_BACKUP

def reset_database():
    """Veritabanını sıfırlar ve yeniden oluşturur"""
    print("🔄 Veritabanı sıfırlanıyor...")
    
    # Drop all tables
    db.drop_all()
    print("✅ Tüm tablolar silindi")
    
    # Create all tables
    db.create_all()
    print("✅ Tüm tablolar yeniden oluşturuldu")

def create_admin_user():
    """Admin kullanıcısı oluşturur"""
    print("👤 Admin kullanıcısı oluşturuluyor...")
    
    admin = User(
        username='admin',
        email='admin@pebdeq.com',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    admin.set_password('admin123')
    
    db.session.add(admin)
    db.session.commit()
    print("✅ Admin kullanıcısı oluşturuldu (admin/admin123)")

def restore_settings_from_backup():
    """Backup'tan ayarları geri yükler"""
    print("⚙️ Backup'tan ayarlar geri yükleniyor...")
    
    # Create new settings instance
    settings = SiteSettings()
    
    # Apply backup settings
    for key, value in CURRENT_SETTINGS_BACKUP.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    
    # Set timestamps
    settings.created_at = datetime.now()
    settings.updated_at = datetime.now()
    
    db.session.add(settings)
    db.session.commit()
    print("✅ Backup'tan ayarlar geri yüklendi")

def create_sample_categories():
    """Örnek kategoriler oluşturur"""
    print("📁 Örnek kategoriler oluşturuluyor...")
    
    categories = [
        {
            'name': '3D Printing',
            'description': 'Custom 3D printed items and prototypes',
            'slug': '3d-printing'
        },
        {
            'name': 'Vintage Tools',
            'description': 'Authentic vintage and antique tools',
            'slug': 'vintage-tools'
        },
        {
            'name': 'Antique Bulbs',
            'description': 'Rare and vintage light bulbs',
            'slug': 'antique-bulbs'
        },
        {
            'name': 'Laser Engraving',
            'description': 'Custom laser engraved products',
            'slug': 'laser-engraving'
        }
    ]
    
    for cat_data in categories:
        category = Category(
            name=cat_data['name'],
            description=cat_data['description'],
            slug=cat_data['slug']
        )
        db.session.add(category)
    
    db.session.commit()
    print("✅ Örnek kategoriler oluşturuldu")

def create_sample_products():
    """Örnek ürünler oluşturur"""
    print("🛍️ Örnek ürünler oluşturuluyor...")
    
    # Get categories
    categories = Category.query.all()
    cat_dict = {cat.slug: cat for cat in categories}
    
    products = [
        {
            'name': 'Custom 3D Printed Miniature',
            'description': 'High-quality 3D printed miniature figures',
            'price': 25.99,
            'category': cat_dict.get('3d-printing'),
            'stock_quantity': 50
        },
        {
            'name': 'Vintage Hammer Set',
            'description': 'Authentic vintage hammer collection',
            'price': 89.99,
            'category': cat_dict.get('vintage-tools'),
            'stock_quantity': 5
        },
        {
            'name': 'Edison Bulb Collection',
            'description': 'Rare Edison-style light bulbs',
            'price': 45.99,
            'category': cat_dict.get('antique-bulbs'),
            'stock_quantity': 12
        },
        {
            'name': 'Personalized Wooden Sign',
            'description': 'Custom laser engraved wooden signs',
            'price': 35.99,
            'category': cat_dict.get('laser-engraving'),
            'stock_quantity': 25
        }
    ]
    
    for prod_data in products:
        # Generate slug from name
        slug = prod_data['name'].lower().replace(' ', '-').replace(',', '').replace('.', '')
        
        product = Product(
            name=prod_data['name'],
            slug=slug,
            description=prod_data['description'],
            price=prod_data['price'],
            category=prod_data['category'],
            stock_quantity=prod_data['stock_quantity']
        )
        db.session.add(product)
    
    db.session.commit()
    print("✅ Örnek ürünler oluşturuldu")

def main():
    """Ana fonksiyon"""
    print("🚀 PEBDEQ Veritabanı Reset Script")
    print("=" * 50)
    
    # Create app context
    app = create_app()
    
    with app.app_context():
        try:
            # Reset database
            reset_database()
            
            # Create admin user
            create_admin_user()
            
            # Restore settings from backup
            restore_settings_from_backup()
            
            # Create sample data
            create_sample_categories()
            create_sample_products()
            
            print("\n🎉 Veritabanı başarıyla sıfırlandı ve backup'tan geri yüklendi!")
            print("\n📋 Özet:")
            print("• Admin kullanıcısı: admin/admin123")
            print("• Site ayarları: Backup'tan geri yüklendi")
            print("• Örnek kategoriler: 4 adet")
            print("• Örnek ürünler: 4 adet")
            print("\n✅ Sistem kullanıma hazır!")
            
        except Exception as e:
            print(f"\n❌ Hata oluştu: {str(e)}")
            db.session.rollback()
            return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
