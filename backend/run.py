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
        
        # Create admin user if it doesn't exist
        if not User.query.filter_by(is_admin=True).first():
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
            print("Admin user created! Email: admin@pebdeq.com, Password: admin123")

if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000) 