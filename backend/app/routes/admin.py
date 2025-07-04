from flask import Blueprint, request, jsonify, send_from_directory
from app.models.models import Product, Category, Order, User, ContactMessage, BlogPost
from app import db
import jwt
import os
from functools import wraps
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token required'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user or not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
            
            return f(*args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_products():
    try:
        products = Product.query.order_by(Product.created_at.desc()).all()
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'description': p.description,
                'price': p.price,
                'original_price': p.original_price,
                'stock_quantity': p.stock_quantity,
                'category': p.category.name,
                'category_id': p.category_id,
                'images': p.images or [],
                'video_url': p.video_url,
                'is_featured': p.is_featured,
                'is_active': p.is_active
            } for p in products]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'slug', 'price', 'category_id')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        product = Product(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            price=data['price'],
            original_price=data.get('original_price'),
            stock_quantity=data.get('stock_quantity', 0),
            category_id=data['category_id'],
            images=data.get('images', []),
            video_url=data.get('video_url'),
            is_featured=data.get('is_featured', False),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'original_price' in data:
            product.original_price = data['original_price']
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        if 'category_id' in data:
            product.category_id = data['category_id']
        if 'images' in data:
            product.images = data['images']
        if 'video_url' in data:
            product.video_url = data['video_url']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'is_active' in data:
            product.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Product updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_orders():
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'orders': [{
                'id': o.id,
                'user_email': o.user.email,
                'total_amount': o.total_amount,
                'status': o.status,
                'payment_status': o.payment_status,
                'created_at': o.created_at.isoformat()
            } for o in orders]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()
        
        if 'status' in data:
            order.status = data['status']
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        
        db.session.commit()
        
        return jsonify({'message': 'Order updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages', methods=['GET'])
@admin_required
def get_messages():
    try:
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        
        return jsonify({
            'messages': [{
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'subject': m.subject,
                'message': m.message,
                'is_read': m.is_read,
                'created_at': m.created_at.isoformat()
            } for m in messages]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<int:message_id>/read', methods=['PUT'])
@admin_required
def mark_message_read(message_id):
    try:
        message = ContactMessage.query.get_or_404(message_id)
        message.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Message marked as read'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    try:
        categories = Category.query.order_by(Category.name).all()
        
        return jsonify({
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url,
                'is_active': c.is_active,
                'products_count': len(c.products)
            } for c in categories]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'slug')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if slug already exists
        if Category.query.filter_by(slug=data['slug']).first():
            return jsonify({'error': 'Slug already exists'}), 409
        
        category = Category(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            image_url=data.get('image_url', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({'message': 'Category created successfully', 'category_id': category.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            category.name = data['name']
        if 'slug' in data:
            # Check if slug already exists (exclude current category)
            existing = Category.query.filter(Category.slug == data['slug'], Category.id != category_id).first()
            if existing:
                return jsonify({'error': 'Slug already exists'}), 409
            category.slug = data['slug']
        if 'description' in data:
            category.description = data['description']
        if 'image_url' in data:
            category.image_url = data['image_url']
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Category updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        # Check if category has products
        if category.products:
            return jsonify({'error': 'Cannot delete category with existing products'}), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Category deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB

def allowed_file(filename, file_type):
    if file_type == 'image':
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == 'video':
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS
    return False

def generate_unique_filename(filename):
    """Generate a unique filename to avoid conflicts"""
    ext = filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name

def create_upload_folders():
    """Create upload folders if they don't exist"""
    base_path = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')
    
    folders = ['categories', 'products', 'videos']
    for folder in folders:
        folder_path = os.path.join(base_path, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
    
    return base_path

@admin_bp.route('/upload/category-image', methods=['POST'])
@admin_required
def upload_category_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF, WEBP allowed'}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_IMAGE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 5MB'}), 400
        
        # Create upload folders
        base_path = create_upload_folders()
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        
        # Save file
        file_path = os.path.join(base_path, 'categories', unique_filename)
        file.save(file_path)
        
        # Return the URL
        file_url = f'/uploads/categories/{unique_filename}'
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'file_url': file_url,
            'filename': unique_filename
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/product-images', methods=['POST'])
@admin_required
def upload_product_images():
    try:
        if 'images' not in request.files:
            return jsonify({'error': 'No image files provided'}), 400
        
        files = request.files.getlist('images')
        
        if len(files) > 10:
            return jsonify({'error': 'Maximum 10 images allowed'}), 400
        
        # Create upload folders
        base_path = create_upload_folders()
        
        uploaded_files = []
        
        for file in files:
            if file.filename == '':
                continue
            
            if not allowed_file(file.filename, 'image'):
                return jsonify({'error': f'Invalid file type for {file.filename}. Only PNG, JPG, JPEG, GIF, WEBP allowed'}), 400
            
            # Check file size
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning
            
            if file_size > MAX_IMAGE_SIZE:
                return jsonify({'error': f'File {file.filename} too large. Maximum size is 5MB'}), 400
            
            # Generate unique filename
            unique_filename = generate_unique_filename(file.filename)
            
            # Save file
            file_path = os.path.join(base_path, 'products', unique_filename)
            file.save(file_path)
            
            # Add to uploaded files list
            file_url = f'/uploads/products/{unique_filename}'
            uploaded_files.append({
                'original_name': file.filename,
                'filename': unique_filename,
                'url': file_url
            })
        
        return jsonify({
            'message': f'{len(uploaded_files)} images uploaded successfully',
            'files': uploaded_files
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/product-video', methods=['POST'])
@admin_required
def upload_product_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'video'):
            return jsonify({'error': 'Invalid file type. Only MP4, AVI, MOV, MKV, WEBM allowed'}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_VIDEO_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 50MB'}), 400
        
        # Create upload folders
        base_path = create_upload_folders()
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        
        # Save file
        file_path = os.path.join(base_path, 'videos', unique_filename)
        file.save(file_path)
        
        # Return the URL
        file_url = f'/uploads/videos/{unique_filename}'
        
        return jsonify({
            'message': 'Video uploaded successfully',
            'file_url': file_url,
            'filename': unique_filename
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/delete-file', methods=['POST'])
@admin_required
def delete_file():
    try:
        data = request.get_json()
        file_url = data.get('file_url')
        
        if not file_url:
            return jsonify({'error': 'File URL required'}), 400
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        folder = file_url.split('/')[-2]
        
        # Build file path
        base_path = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')
        file_path = os.path.join(base_path, folder, filename)
        
        # Delete file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'error': 'File not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 