from app import create_app, db
from app.models.models import User, Category, Product, Order, OrderItem, BlogPost, ContactMessage
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Category': Category,
        'Product': Product,
        'Order': Order,
        'OrderItem': OrderItem,
        'BlogPost': BlogPost,
        'ContactMessage': ContactMessage
    }

def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        db.create_all()
        
        # Create sample categories if they don't exist
        if not Category.query.first():
            categories = [
                Category(name='3D Print', slug='3d-print', description='Custom 3D printed items and prototypes'),
                Category(name='Tools', slug='tools', description='Second-hand tools and equipment'),
                Category(name='Vintage Light Bulbs', slug='vintage-bulbs', description='Antique and vintage light bulbs'),
                Category(name='Laser Engraving', slug='laser-engraving', description='Custom laser engraving services')
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
            admin = User(
                username='admin',
                email='admin@pebdeq.com',
                first_name='Admin',
                last_name='User',
                is_admin=True
            )
            admin.set_password('adminx999')
            db.session.add(admin)
            db.session.commit()
            print("Admin user created! Email: admin@pebdeq.com, Password: adminx999")

if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000) 