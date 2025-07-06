from flask import Blueprint, request, jsonify, send_from_directory
from app.models.models import Product, Category, Order, User, ContactMessage, BlogPost, VariationType, VariationOption, ProductVariation, SiteSettings
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
                'is_active': p.is_active,
                'has_variations': p.has_variations,
                'variation_type': p.variation_type,
                'variation_name': p.variation_name,
                'variation_options': p.variation_options or []
            } for p in products]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def filter_empty_variations(variation_options):
    """Boş varyasyonları filtrele"""
    if not variation_options:
        return []
    
    filtered_options = []
    for option in variation_options:
        if isinstance(option, dict) and option.get('name', '').strip():
            filtered_options.append(option)
    
    return filtered_options

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'slug', 'price', 'category_id')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Boş varyasyonları filtrele
        variation_options = filter_empty_variations(data.get('variation_options', []))
        
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
            is_active=data.get('is_active', True),
            has_variations=data.get('has_variations', False),
            variation_type=data.get('variation_type', ''),
            variation_name=data.get('variation_name', ''),
            variation_options=variation_options,
            weight=data.get('weight', ''),
            dimensions=data.get('dimensions', ''),
            material=data.get('material', '')
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
        if 'has_variations' in data:
            product.has_variations = data['has_variations']
        if 'variation_type' in data:
            product.variation_type = data['variation_type']
        if 'variation_name' in data:
            product.variation_name = data['variation_name']
        if 'variation_options' in data:
            product.variation_options = filter_empty_variations(data['variation_options'])
        if 'weight' in data:
            product.weight = data['weight']
        if 'dimensions' in data:
            product.dimensions = data['dimensions']
        if 'material' in data:
            product.material = data['material']
        
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
                'background_image_url': c.background_image_url,
                'background_color': c.background_color,
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
            background_image_url=data.get('background_image_url', ''),
            background_color=data.get('background_color', ''),
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
        if 'background_image_url' in data:
            category.background_image_url = data['background_image_url']
        if 'background_color' in data:
            category.background_color = data['background_color']
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

@admin_bp.route('/upload/category-background', methods=['POST'])
@admin_required
def upload_category_background():
    try:
        if 'background' not in request.files:
            return jsonify({'error': 'No background file provided'}), 400
        
        file = request.files['background']
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
            'message': 'Background image uploaded successfully',
            'background_url': file_url,
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

# Variation Type Management
@admin_bp.route('/variation-types', methods=['GET'])
@admin_required
def get_variation_types():
    try:
        variation_types = VariationType.query.order_by(VariationType.name).all()
        
        return jsonify({
            'variation_types': [{
                'id': vt.id,
                'name': vt.name,
                'slug': vt.slug,
                'description': vt.description,
                'is_active': vt.is_active,
                'options_count': len(vt.variation_options)
            } for vt in variation_types]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-types', methods=['POST'])
@admin_required
def create_variation_type():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'slug')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if slug already exists
        if VariationType.query.filter_by(slug=data['slug']).first():
            return jsonify({'error': 'Slug already exists'}), 409
        
        variation_type = VariationType(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(variation_type)
        db.session.commit()
        
        return jsonify({'message': 'Variation type created successfully', 'variation_type_id': variation_type.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-types/<int:variation_type_id>', methods=['PUT'])
@admin_required
def update_variation_type(variation_type_id):
    try:
        variation_type = VariationType.query.get_or_404(variation_type_id)
        data = request.get_json()
        
        if 'name' in data:
            variation_type.name = data['name']
        if 'slug' in data:
            # Check if slug already exists (exclude current)
            existing = VariationType.query.filter(VariationType.slug == data['slug'], VariationType.id != variation_type_id).first()
            if existing:
                return jsonify({'error': 'Slug already exists'}), 409
            variation_type.slug = data['slug']
        if 'description' in data:
            variation_type.description = data['description']
        if 'is_active' in data:
            variation_type.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Variation type updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-types/<int:variation_type_id>', methods=['DELETE'])
@admin_required
def delete_variation_type(variation_type_id):
    try:
        variation_type = VariationType.query.get_or_404(variation_type_id)
        db.session.delete(variation_type)
        db.session.commit()
        
        return jsonify({'message': 'Variation type deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Variation Option Management
@admin_bp.route('/variation-options', methods=['GET'])
@admin_required
def get_variation_options():
    try:
        variation_type_id = request.args.get('variation_type_id')
        
        if variation_type_id:
            variation_options = VariationOption.query.filter_by(variation_type_id=variation_type_id).order_by(VariationOption.sort_order, VariationOption.name).all()
        else:
            variation_options = VariationOption.query.order_by(VariationOption.variation_type_id, VariationOption.sort_order, VariationOption.name).all()
        
        return jsonify({
            'variation_options': [{
                'id': vo.id,
                'variation_type_id': vo.variation_type_id,
                'variation_type_name': vo.variation_type.name,
                'name': vo.name,
                'value': vo.value,
                'hex_color': vo.hex_color,
                'image_url': vo.image_url,
                'sort_order': vo.sort_order,
                'is_active': vo.is_active
            } for vo in variation_options]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-options', methods=['POST'])
@admin_required
def create_variation_option():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('variation_type_id', 'name', 'value')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        variation_option = VariationOption(
            variation_type_id=data['variation_type_id'],
            name=data['name'],
            value=data['value'],
            hex_color=data.get('hex_color'),
            image_url=data.get('image_url'),
            sort_order=data.get('sort_order', 0),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(variation_option)
        db.session.commit()
        
        return jsonify({'message': 'Variation option created successfully', 'variation_option_id': variation_option.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-options/<int:variation_option_id>', methods=['PUT'])
@admin_required
def update_variation_option(variation_option_id):
    try:
        variation_option = VariationOption.query.get_or_404(variation_option_id)
        data = request.get_json()
        
        if 'name' in data:
            variation_option.name = data['name']
        if 'value' in data:
            variation_option.value = data['value']
        if 'hex_color' in data:
            variation_option.hex_color = data['hex_color']
        if 'image_url' in data:
            variation_option.image_url = data['image_url']
        if 'sort_order' in data:
            variation_option.sort_order = data['sort_order']
        if 'is_active' in data:
            variation_option.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Variation option updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/variation-options/<int:variation_option_id>', methods=['DELETE'])
@admin_required
def delete_variation_option(variation_option_id):
    try:
        variation_option = VariationOption.query.get_or_404(variation_option_id)
        db.session.delete(variation_option)
        db.session.commit()
        
        return jsonify({'message': 'Variation option deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Site Settings Management
# Site Settings - Ana endpoint (tüm ayarları döndürür)
@admin_bp.route('/site-settings', methods=['GET'])
@admin_required
def get_site_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            # Create default settings
            settings = SiteSettings(
                site_name='pebdeq',
                use_logo=False
            )
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            # Site Identity
            'site_identity': {
                'site_name': settings.site_name,
                'site_logo': settings.site_logo,
                'use_logo': settings.use_logo,
                'logo_width': settings.logo_width,
                'logo_height': settings.logo_height,
                'site_logo2': settings.site_logo2,
                'use_logo2': settings.use_logo2,
                'logo2_width': settings.logo2_width,
                'logo2_height': settings.logo2_height
            },
            # Welcome Section
            'welcome_section': {
                'welcome_title': settings.welcome_title,
                'welcome_subtitle': settings.welcome_subtitle,
                'welcome_background_image': settings.welcome_background_image,
                'welcome_background_color': settings.welcome_background_color,
                'welcome_text_color': settings.welcome_text_color,
                'welcome_button_text': settings.welcome_button_text,
                'welcome_button_link': settings.welcome_button_link,
                'welcome_button_color': settings.welcome_button_color
            },
            # Collections Section
            'collections_section': {
                'collections_title': settings.collections_title,
                'collections_show_categories': settings.collections_show_categories,
                'collections_categories_per_row': settings.collections_categories_per_row,
                'collections_max_rows': settings.collections_max_rows,
                'collections_show_section': settings.collections_show_section
            },
            # Contact & Social
            'contact_social': {
                'contact_phone': settings.contact_phone,
                'contact_email': settings.contact_email,
                'contact_address': settings.contact_address,
                'social_instagram': settings.social_instagram,
                'social_facebook': settings.social_facebook,
                'social_twitter': settings.social_twitter,
                'social_youtube': settings.social_youtube,
                'social_linkedin': settings.social_linkedin
            },
            # SEO Settings
            'seo_settings': {
                'meta_title': settings.meta_title,
                'meta_description': settings.meta_description,
                'meta_keywords': settings.meta_keywords
            },
            # Business Settings
            'business_settings': {
                'currency_symbol': settings.currency_symbol,
                'currency_code': settings.currency_code,
                'shipping_cost': settings.shipping_cost,
                'free_shipping_threshold': settings.free_shipping_threshold
            },
            # Feature Flags
            'feature_flags': {
                'enable_reviews': settings.enable_reviews,
                'enable_wishlist': settings.enable_wishlist,
                'enable_compare': settings.enable_compare,
                'enable_newsletter': settings.enable_newsletter,
                'maintenance_mode': settings.maintenance_mode
            },
            # Footer Settings
            'footer_settings': {
                'footer_show_section': settings.footer_show_section,
                'footer_background_color': settings.footer_background_color,
                'footer_text_color': settings.footer_text_color,
                'footer_company_name': settings.footer_company_name,
                'footer_company_description': settings.footer_company_description,
                'footer_copyright_text': settings.footer_copyright_text,
                'footer_support_title': settings.footer_support_title,
                'footer_support_show_section': settings.footer_support_show_section,
                'footer_support_links': settings.footer_support_links,
                'footer_quick_links_title': settings.footer_quick_links_title,
                'footer_quick_links_show_section': settings.footer_quick_links_show_section,
                'footer_quick_links': settings.footer_quick_links,
                'footer_social_title': settings.footer_social_title,
                'footer_social_show_section': settings.footer_social_show_section,
                'footer_newsletter_title': settings.footer_newsletter_title,
                'footer_newsletter_show_section': settings.footer_newsletter_show_section,
                'footer_newsletter_description': settings.footer_newsletter_description,
                'footer_newsletter_placeholder': settings.footer_newsletter_placeholder,
                'footer_newsletter_button_text': settings.footer_newsletter_button_text
            },
            # Homepage Products Settings
            'homepage_products_settings': {
                'homepage_products_show_section': settings.homepage_products_show_section,
                'homepage_products_title': settings.homepage_products_title,
                'homepage_products_subtitle': settings.homepage_products_subtitle,
                'homepage_products_max_rows': settings.homepage_products_max_rows,
                'homepage_products_per_row': settings.homepage_products_per_row,
                'homepage_products_max_items': settings.homepage_products_max_items,
                'homepage_products_show_images': settings.homepage_products_show_images,
                'homepage_products_image_height': settings.homepage_products_image_height,
                'homepage_products_image_width': settings.homepage_products_image_width,
                'homepage_products_show_favorite': settings.homepage_products_show_favorite,
                'homepage_products_show_buy_now': settings.homepage_products_show_buy_now,
                'homepage_products_show_details': settings.homepage_products_show_details,
                'homepage_products_show_price': settings.homepage_products_show_price,
                'homepage_products_show_original_price': settings.homepage_products_show_original_price,
                'homepage_products_show_stock': settings.homepage_products_show_stock,
                'homepage_products_show_category': settings.homepage_products_show_category,
                'homepage_products_sort_by': settings.homepage_products_sort_by,
                'homepage_products_filter_categories': settings.homepage_products_filter_categories,
                'homepage_products_show_view_all': settings.homepage_products_show_view_all,
                'homepage_products_view_all_text': settings.homepage_products_view_all_text,
                'homepage_products_view_all_link': settings.homepage_products_view_all_link,
                'homepage_products_card_style': settings.homepage_products_card_style,
                'homepage_products_card_shadow': settings.homepage_products_card_shadow,
                'homepage_products_card_hover_effect': settings.homepage_products_card_hover_effect,
                'homepage_products_show_badges': settings.homepage_products_show_badges,
                'homepage_products_show_rating': settings.homepage_products_show_rating,
                'homepage_products_show_quick_view': settings.homepage_products_show_quick_view
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Site Settings - Genel güncelleme endpoint'i (geriye uyumluluk için)
@admin_bp.route('/site-settings', methods=['PUT'])
@admin_required
def update_site_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Site Identity
        if 'site_name' in data:
            settings.site_name = data['site_name']
        if 'site_logo' in data:
            settings.site_logo = data['site_logo']
        if 'use_logo' in data:
            settings.use_logo = data['use_logo']
        if 'logo_width' in data:
            settings.logo_width = data['logo_width']
        if 'logo_height' in data:
            settings.logo_height = data['logo_height']
        if 'site_logo2' in data:
            settings.site_logo2 = data['site_logo2']
        if 'use_logo2' in data:
            settings.use_logo2 = data['use_logo2']
        if 'logo2_width' in data:
            settings.logo2_width = data['logo2_width']
        if 'logo2_height' in data:
            settings.logo2_height = data['logo2_height']
        
        # Welcome section settings
        if 'welcome_title' in data:
            settings.welcome_title = data['welcome_title']
        if 'welcome_subtitle' in data:
            settings.welcome_subtitle = data['welcome_subtitle']
        if 'welcome_background_image' in data:
            settings.welcome_background_image = data['welcome_background_image']
        if 'welcome_background_color' in data:
            settings.welcome_background_color = data['welcome_background_color']
        if 'welcome_text_color' in data:
            settings.welcome_text_color = data['welcome_text_color']
        if 'welcome_button_text' in data:
            settings.welcome_button_text = data['welcome_button_text']
        if 'welcome_button_link' in data:
            settings.welcome_button_link = data['welcome_button_link']
        if 'welcome_button_color' in data:
            settings.welcome_button_color = data['welcome_button_color']
        
        # Collections settings
        if 'collections_title' in data:
            settings.collections_title = data['collections_title']
        if 'collections_show_categories' in data:
            settings.collections_show_categories = data['collections_show_categories']
        if 'collections_categories_per_row' in data:
            settings.collections_categories_per_row = data['collections_categories_per_row']
        if 'collections_max_rows' in data:
            settings.collections_max_rows = data['collections_max_rows']
        if 'collections_show_section' in data:
            settings.collections_show_section = data['collections_show_section']
        
        # Contact & Social
        if 'contact_phone' in data:
            settings.contact_phone = data['contact_phone']
        if 'contact_email' in data:
            settings.contact_email = data['contact_email']
        if 'contact_address' in data:
            settings.contact_address = data['contact_address']
        if 'social_instagram' in data:
            settings.social_instagram = data['social_instagram']
        if 'social_facebook' in data:
            settings.social_facebook = data['social_facebook']
        if 'social_twitter' in data:
            settings.social_twitter = data['social_twitter']
        if 'social_youtube' in data:
            settings.social_youtube = data['social_youtube']
        if 'social_linkedin' in data:
            settings.social_linkedin = data['social_linkedin']
        
        # SEO Settings
        if 'meta_title' in data:
            settings.meta_title = data['meta_title']
        if 'meta_description' in data:
            settings.meta_description = data['meta_description']
        if 'meta_keywords' in data:
            settings.meta_keywords = data['meta_keywords']
        
        # Business Settings
        if 'currency_symbol' in data:
            settings.currency_symbol = data['currency_symbol']
        if 'currency_code' in data:
            settings.currency_code = data['currency_code']
        if 'shipping_cost' in data:
            settings.shipping_cost = data['shipping_cost']
        if 'free_shipping_threshold' in data:
            settings.free_shipping_threshold = data['free_shipping_threshold']
        
        # Feature Flags
        if 'enable_reviews' in data:
            settings.enable_reviews = data['enable_reviews']
        if 'enable_wishlist' in data:
            settings.enable_wishlist = data['enable_wishlist']
        if 'enable_compare' in data:
            settings.enable_compare = data['enable_compare']
        if 'enable_newsletter' in data:
            settings.enable_newsletter = data['enable_newsletter']
        if 'maintenance_mode' in data:
            settings.maintenance_mode = data['maintenance_mode']
        
        # Footer Settings
        if 'footer_show_section' in data:
            settings.footer_show_section = data['footer_show_section']
        if 'footer_background_color' in data:
            settings.footer_background_color = data['footer_background_color']
        if 'footer_text_color' in data:
            settings.footer_text_color = data['footer_text_color']
        if 'footer_company_name' in data:
            settings.footer_company_name = data['footer_company_name']
        if 'footer_company_description' in data:
            settings.footer_company_description = data['footer_company_description']
        if 'footer_copyright_text' in data:
            settings.footer_copyright_text = data['footer_copyright_text']
        
        # Footer Support Section
        if 'footer_support_title' in data:
            settings.footer_support_title = data['footer_support_title']
        if 'footer_support_show_section' in data:
            settings.footer_support_show_section = data['footer_support_show_section']
        if 'footer_support_links' in data:
            settings.footer_support_links = data['footer_support_links']
        
        # Footer Quick Links Section
        if 'footer_quick_links_title' in data:
            settings.footer_quick_links_title = data['footer_quick_links_title']
        if 'footer_quick_links_show_section' in data:
            settings.footer_quick_links_show_section = data['footer_quick_links_show_section']
        if 'footer_quick_links' in data:
            settings.footer_quick_links = data['footer_quick_links']
        
        # Footer Social Section
        if 'footer_social_title' in data:
            settings.footer_social_title = data['footer_social_title']
        if 'footer_social_show_section' in data:
            settings.footer_social_show_section = data['footer_social_show_section']
        
        # Footer Newsletter Section
        if 'footer_newsletter_title' in data:
            settings.footer_newsletter_title = data['footer_newsletter_title']
        if 'footer_newsletter_show_section' in data:
            settings.footer_newsletter_show_section = data['footer_newsletter_show_section']
        if 'footer_newsletter_description' in data:
            settings.footer_newsletter_description = data['footer_newsletter_description']
        if 'footer_newsletter_placeholder' in data:
            settings.footer_newsletter_placeholder = data['footer_newsletter_placeholder']
        if 'footer_newsletter_button_text' in data:
            settings.footer_newsletter_button_text = data['footer_newsletter_button_text']
        
        # Homepage Products Settings
        if 'homepage_products_show_section' in data:
            settings.homepage_products_show_section = data['homepage_products_show_section']
        if 'homepage_products_title' in data:
            settings.homepage_products_title = data['homepage_products_title']
        if 'homepage_products_subtitle' in data:
            settings.homepage_products_subtitle = data['homepage_products_subtitle']
        if 'homepage_products_max_rows' in data:
            settings.homepage_products_max_rows = data['homepage_products_max_rows']
        if 'homepage_products_per_row' in data:
            settings.homepage_products_per_row = data['homepage_products_per_row']
        if 'homepage_products_max_items' in data:
            settings.homepage_products_max_items = data['homepage_products_max_items']
        if 'homepage_products_show_images' in data:
            settings.homepage_products_show_images = data['homepage_products_show_images']
        if 'homepage_products_image_height' in data:
            settings.homepage_products_image_height = data['homepage_products_image_height']
        if 'homepage_products_image_width' in data:
            settings.homepage_products_image_width = data['homepage_products_image_width']
        if 'homepage_products_show_favorite' in data:
            settings.homepage_products_show_favorite = data['homepage_products_show_favorite']
        if 'homepage_products_show_buy_now' in data:
            settings.homepage_products_show_buy_now = data['homepage_products_show_buy_now']
        if 'homepage_products_show_details' in data:
            settings.homepage_products_show_details = data['homepage_products_show_details']
        if 'homepage_products_show_price' in data:
            settings.homepage_products_show_price = data['homepage_products_show_price']
        if 'homepage_products_show_original_price' in data:
            settings.homepage_products_show_original_price = data['homepage_products_show_original_price']
        if 'homepage_products_show_stock' in data:
            settings.homepage_products_show_stock = data['homepage_products_show_stock']
        if 'homepage_products_show_category' in data:
            settings.homepage_products_show_category = data['homepage_products_show_category']
        if 'homepage_products_sort_by' in data:
            settings.homepage_products_sort_by = data['homepage_products_sort_by']
        if 'homepage_products_filter_categories' in data:
            settings.homepage_products_filter_categories = data['homepage_products_filter_categories']
        if 'homepage_products_show_view_all' in data:
            settings.homepage_products_show_view_all = data['homepage_products_show_view_all']
        if 'homepage_products_view_all_text' in data:
            settings.homepage_products_view_all_text = data['homepage_products_view_all_text']
        if 'homepage_products_view_all_link' in data:
            settings.homepage_products_view_all_link = data['homepage_products_view_all_link']
        if 'homepage_products_card_style' in data:
            settings.homepage_products_card_style = data['homepage_products_card_style']
        if 'homepage_products_card_shadow' in data:
            settings.homepage_products_card_shadow = data['homepage_products_card_shadow']
        if 'homepage_products_card_hover_effect' in data:
            settings.homepage_products_card_hover_effect = data['homepage_products_card_hover_effect']
        if 'homepage_products_show_badges' in data:
            settings.homepage_products_show_badges = data['homepage_products_show_badges']
        if 'homepage_products_show_rating' in data:
            settings.homepage_products_show_rating = data['homepage_products_show_rating']
        if 'homepage_products_show_quick_view' in data:
            settings.homepage_products_show_quick_view = data['homepage_products_show_quick_view']
        
        db.session.commit()
        
        return jsonify({'message': 'Site settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/site-logo', methods=['POST'])
@admin_required
def upload_site_logo():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            file_path = os.path.join('uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Logo uploaded successfully',
                'logo_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/site-logo2', methods=['POST'])
@admin_required
def upload_site_logo2():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            file_path = os.path.join('uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Second logo uploaded successfully',
                'logo_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/welcome-background', methods=['POST'])
@admin_required
def upload_welcome_background():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            file_path = os.path.join('uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Welcome background uploaded successfully',
                'background_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Kategorilere göre ayrılmış site settings endpoint'leri

# Site Identity Settings
@admin_bp.route('/site-settings/identity', methods=['GET'])
@admin_required
def get_site_identity():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'site_name': settings.site_name,
            'site_logo': settings.site_logo,
            'use_logo': settings.use_logo,
            'logo_width': settings.logo_width,
            'logo_height': settings.logo_height,
            'site_logo2': settings.site_logo2,
            'use_logo2': settings.use_logo2,
            'logo2_width': settings.logo2_width,
            'logo2_height': settings.logo2_height
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/identity', methods=['PUT'])
@admin_required
def update_site_identity():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Site Identity fields
        if 'site_name' in data:
            settings.site_name = data['site_name']
        if 'site_logo' in data:
            settings.site_logo = data['site_logo']
        if 'use_logo' in data:
            settings.use_logo = data['use_logo']
        if 'logo_width' in data:
            settings.logo_width = data['logo_width']
        if 'logo_height' in data:
            settings.logo_height = data['logo_height']
        if 'site_logo2' in data:
            settings.site_logo2 = data['site_logo2']
        if 'use_logo2' in data:
            settings.use_logo2 = data['use_logo2']
        if 'logo2_width' in data:
            settings.logo2_width = data['logo2_width']
        if 'logo2_height' in data:
            settings.logo2_height = data['logo2_height']
        
        db.session.commit()
        return jsonify({'message': 'Site identity updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Welcome Section Settings
@admin_bp.route('/site-settings/welcome', methods=['GET'])
@admin_required
def get_welcome_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'welcome_title': settings.welcome_title,
            'welcome_subtitle': settings.welcome_subtitle,
            'welcome_background_image': settings.welcome_background_image,
            'welcome_background_color': settings.welcome_background_color,
            'welcome_text_color': settings.welcome_text_color,
            'welcome_button_text': settings.welcome_button_text,
            'welcome_button_link': settings.welcome_button_link,
            'welcome_button_color': settings.welcome_button_color
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/welcome', methods=['PUT'])
@admin_required
def update_welcome_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Welcome section fields
        if 'welcome_title' in data:
            settings.welcome_title = data['welcome_title']
        if 'welcome_subtitle' in data:
            settings.welcome_subtitle = data['welcome_subtitle']
        if 'welcome_background_image' in data:
            settings.welcome_background_image = data['welcome_background_image']
        if 'welcome_background_color' in data:
            settings.welcome_background_color = data['welcome_background_color']
        if 'welcome_text_color' in data:
            settings.welcome_text_color = data['welcome_text_color']
        if 'welcome_button_text' in data:
            settings.welcome_button_text = data['welcome_button_text']
        if 'welcome_button_link' in data:
            settings.welcome_button_link = data['welcome_button_link']
        if 'welcome_button_color' in data:
            settings.welcome_button_color = data['welcome_button_color']
        
        db.session.commit()
        return jsonify({'message': 'Welcome section updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Collections Section Settings
@admin_bp.route('/site-settings/collections', methods=['GET'])
@admin_required
def get_collections_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'collections_title': settings.collections_title,
            'collections_show_categories': settings.collections_show_categories,
            'collections_categories_per_row': settings.collections_categories_per_row,
            'collections_max_rows': settings.collections_max_rows,
            'collections_show_section': settings.collections_show_section
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/collections', methods=['PUT'])
@admin_required
def update_collections_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Collections section fields
        if 'collections_title' in data:
            settings.collections_title = data['collections_title']
        if 'collections_show_categories' in data:
            settings.collections_show_categories = data['collections_show_categories']
        if 'collections_categories_per_row' in data:
            settings.collections_categories_per_row = data['collections_categories_per_row']
        if 'collections_max_rows' in data:
            settings.collections_max_rows = data['collections_max_rows']
        if 'collections_show_section' in data:
            settings.collections_show_section = data['collections_show_section']
        
        db.session.commit()
        return jsonify({'message': 'Collections section updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Contact & Social Settings
@admin_bp.route('/site-settings/contact-social', methods=['GET'])
@admin_required
def get_contact_social_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'contact_phone': settings.contact_phone,
            'contact_email': settings.contact_email,
            'contact_address': settings.contact_address,
            'social_instagram': settings.social_instagram,
            'social_facebook': settings.social_facebook,
            'social_twitter': settings.social_twitter,
            'social_youtube': settings.social_youtube,
            'social_linkedin': settings.social_linkedin
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/contact-social', methods=['PUT'])
@admin_required
def update_contact_social_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Contact & Social fields
        if 'contact_phone' in data:
            settings.contact_phone = data['contact_phone']
        if 'contact_email' in data:
            settings.contact_email = data['contact_email']
        if 'contact_address' in data:
            settings.contact_address = data['contact_address']
        if 'social_instagram' in data:
            settings.social_instagram = data['social_instagram']
        if 'social_facebook' in data:
            settings.social_facebook = data['social_facebook']
        if 'social_twitter' in data:
            settings.social_twitter = data['social_twitter']
        if 'social_youtube' in data:
            settings.social_youtube = data['social_youtube']
        if 'social_linkedin' in data:
            settings.social_linkedin = data['social_linkedin']
        
        db.session.commit()
        return jsonify({'message': 'Contact & social settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# SEO Settings
@admin_bp.route('/site-settings/seo', methods=['GET'])
@admin_required
def get_seo_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'meta_title': settings.meta_title,
            'meta_description': settings.meta_description,
            'meta_keywords': settings.meta_keywords
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/seo', methods=['PUT'])
@admin_required
def update_seo_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # SEO fields
        if 'meta_title' in data:
            settings.meta_title = data['meta_title']
        if 'meta_description' in data:
            settings.meta_description = data['meta_description']
        if 'meta_keywords' in data:
            settings.meta_keywords = data['meta_keywords']
        
        db.session.commit()
        return jsonify({'message': 'SEO settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Business Settings
@admin_bp.route('/site-settings/business', methods=['GET'])
@admin_required
def get_business_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'currency_symbol': settings.currency_symbol,
            'currency_code': settings.currency_code,
            'shipping_cost': settings.shipping_cost,
            'free_shipping_threshold': settings.free_shipping_threshold
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/business', methods=['PUT'])
@admin_required
def update_business_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Business fields
        if 'currency_symbol' in data:
            settings.currency_symbol = data['currency_symbol']
        if 'currency_code' in data:
            settings.currency_code = data['currency_code']
        if 'shipping_cost' in data:
            settings.shipping_cost = data['shipping_cost']
        if 'free_shipping_threshold' in data:
            settings.free_shipping_threshold = data['free_shipping_threshold']
        
        db.session.commit()
        return jsonify({'message': 'Business settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Feature Flags
@admin_bp.route('/site-settings/features', methods=['GET'])
@admin_required
def get_feature_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'enable_reviews': settings.enable_reviews,
            'enable_wishlist': settings.enable_wishlist,
            'enable_compare': settings.enable_compare,
            'enable_newsletter': settings.enable_newsletter,
            'maintenance_mode': settings.maintenance_mode
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/site-settings/features', methods=['PUT'])
@admin_required
def update_feature_settings():
    try:
        data = request.get_json()
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Feature flag fields
        if 'enable_reviews' in data:
            settings.enable_reviews = data['enable_reviews']
        if 'enable_wishlist' in data:
            settings.enable_wishlist = data['enable_wishlist']
        if 'enable_compare' in data:
            settings.enable_compare = data['enable_compare']
        if 'enable_newsletter' in data:
            settings.enable_newsletter = data['enable_newsletter']
        if 'maintenance_mode' in data:
            settings.maintenance_mode = data['maintenance_mode']
        
        db.session.commit()
        return jsonify({'message': 'Feature settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 