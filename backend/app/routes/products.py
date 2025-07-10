import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app.models.models import Product, Category, db
from werkzeug.utils import secure_filename
import pandas as pd
from PIL import Image, ImageOps
import io
import base64
import numpy as np
from sqlalchemy import or_
from rembg import remove
from transformers import pipeline
import torch

products_bp = Blueprint('products', __name__)

@products_bp.route('/')
def product_list():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category_slug = request.args.get('category')
        search = request.args.get('search')
        sort_by = request.args.get('sort', 'newest')  # newest, oldest, price_low, price_high
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        
        query = Product.query.filter_by(is_active=True)
        
        # Filter by category
        if category_slug:
            category = Category.query.filter_by(slug=category_slug).first()
            if category:
                query = query.filter_by(category_id=category.id)
        
        # Search filter
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%')
                )
            )
        
        # Price filters
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        # Sorting
        if sort_by == 'price_low':
            query = query.order_by(Product.price.asc())
        elif sort_by == 'price_high':
            query = query.order_by(Product.price.desc())
        elif sort_by == 'oldest':
            query = query.order_by(Product.created_at.asc())
        else:  # newest
            query = query.order_by(Product.created_at.desc())
        
        products = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'images': p.images,
                'category': p.category.name,
                'category_slug': p.category.slug,
                'is_featured': p.is_featured,
                'stock_quantity': p.stock_quantity,
                'has_variations': p.has_variations,
                'variation_type': p.variation_type,
                'variation_name': p.variation_name
            } for p in products.items],
            'pagination': {
                'page': products.page,
                'pages': products.pages,
                'per_page': products.per_page,
                'total': products.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<slug>')
def product_detail(slug):
    try:
        product = Product.query.filter_by(slug=slug, is_active=True).first()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Related products from same category
        related_products = Product.query.filter_by(
            category_id=product.category_id,
            is_active=True
        ).filter(Product.id != product.id).limit(4).all()
        
        return jsonify({
            'product': {
                'id': product.id,
                'name': product.name,
                'slug': product.slug,
                'description': product.description,
                'price': product.price,
                'original_price': product.original_price,
                'images': product.images,
                'video_url': product.video_url,
                'category': product.category.name,
                'category_slug': product.category.slug,
                'stock_quantity': product.stock_quantity,
                'is_featured': product.is_featured,
                'is_active': product.is_active,
                'has_variations': product.has_variations,
                'variation_type': product.variation_type,
                'variation_name': product.variation_name,
                'variation_options': product.variation_options,
                'weight': product.weight,
                'dimensions': product.dimensions,
                'material': product.material,
                'created_at': product.created_at.isoformat(),
                'updated_at': product.updated_at.isoformat()
            },
            'related_products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'images': p.images,
                'category': p.category.name
            } for p in related_products]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/category/<slug>')
def products_by_category(slug):
    try:
        category = Category.query.filter_by(slug=slug, is_active=True).first()
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        sort_by = request.args.get('sort', 'newest')
        
        query = Product.query.filter_by(category_id=category.id, is_active=True)
        
        # Sorting
        if sort_by == 'price_low':
            query = query.order_by(Product.price.asc())
        elif sort_by == 'price_high':
            query = query.order_by(Product.price.desc())
        elif sort_by == 'oldest':
            query = query.order_by(Product.created_at.asc())
        else:  # newest
            query = query.order_by(Product.created_at.desc())
        
        products = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'category': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'description': category.description,
                'image_url': category.image_url
            },
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'images': p.images,
                'stock_quantity': p.stock_quantity,
                'is_featured': p.is_featured
            } for p in products.items],
            'pagination': {
                'page': products.page,
                'pages': products.pages,
                'per_page': products.per_page,
                'total': products.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/search')
def search_products():
    try:
        q = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        if not q:
            return jsonify({'error': 'Search query is required'}), 400
        
        products = Product.query.filter(
            Product.is_active == True,
            or_(
                Product.name.ilike(f'%{q}%'),
                Product.description.ilike(f'%{q}%')
            )
        ).order_by(Product.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'query': q,
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'images': p.images,
                'category': p.category.name,
                'category_slug': p.category.slug,
                'stock_quantity': p.stock_quantity
            } for p in products.items],
            'pagination': {
                'page': products.page,
                'pages': products.pages,
                'per_page': products.per_page,
                'total': products.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

def advanced_remove_background_rembg(image):
    """Advanced background removal using REMBG BiRefNet model"""
    try:
        # Convert PIL Image to bytes
        input_buffer = io.BytesIO()
        image.save(input_buffer, format='PNG')
        input_bytes = input_buffer.getvalue()
        
        # Use REMBG to remove background (BiRefNet model by default)
        output_bytes = remove(input_bytes)
        
        # Convert back to PIL Image
        output_image = Image.open(io.BytesIO(output_bytes))
        
        # Ensure RGBA format
        if output_image.mode != 'RGBA':
            output_image = output_image.convert('RGBA')
        
        return output_image
    
    except Exception as e:
        print(f"REMBG error: {str(e)}")
        # Fallback to simple method if REMBG fails
        return simple_remove_background_fallback(image)

def advanced_remove_background_bria(image):
    """Advanced background removal using BRIA RMBG model"""
    try:
        # Initialize the BRIA RMBG pipeline
        pipe = pipeline("image-segmentation", 
                       model="briaai/RMBG-1.4", 
                       trust_remote_code=True,
                       device="cpu")  # Use CPU for compatibility
        
        # Convert PIL image to RGB if needed
        if image.mode != 'RGB':
            rgb_image = image.convert('RGB')
        else:
            rgb_image = image
        
        # Process with BRIA RMBG
        result = pipe(rgb_image)
        
        # Extract the mask from result
        if isinstance(result, list) and len(result) > 0:
            mask = result[0]['mask']
        else:
            mask = result
        
        # Convert to RGBA
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # Apply mask
        image_array = np.array(image)
        mask_array = np.array(mask)
        
        # Make background transparent where mask is black
        if len(mask_array.shape) == 3:
            mask_array = mask_array[:, :, 0]  # Take first channel
        
        # Invert mask if needed (BRIA might return inverted mask)
        if mask_array.mean() < 128:
            mask_array = 255 - mask_array
        
        # Apply transparency
        image_array[:, :, 3] = mask_array
        
        return Image.fromarray(image_array, 'RGBA')
    
    except Exception as e:
        print(f"BRIA RMBG error: {str(e)}")
        # Fallback to REMBG if BRIA fails
        return advanced_remove_background_rembg(image)

def advanced_remove_background(image, model_type="rembg"):
    """Advanced background removal with model selection"""
    if model_type == "bria":
        return advanced_remove_background_bria(image)
    else:  # default to rembg
        return advanced_remove_background_rembg(image)

def simple_remove_background_fallback(image):
    """Fallback method if REMBG fails"""
    # Convert to RGBA
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Get image data as numpy array
    data = np.array(image)
    
    # Get corner colors (assume background is in corners)
    h, w = data.shape[:2]
    corner_colors = [
        data[0, 0],      # top-left
        data[0, w-1],    # top-right
        data[h-1, 0],    # bottom-left
        data[h-1, w-1]   # bottom-right
    ]
    
    # Use the most common corner color as background
    from collections import Counter
    corner_tuples = [tuple(color[:3]) for color in corner_colors]  # RGB only
    bg_color = Counter(corner_tuples).most_common(1)[0][0]
    
    # Create mask for background removal
    # Make pixels transparent if they're similar to background color
    tolerance = 30  # Color tolerance
    
    for i in range(h):
        for j in range(w):
            pixel = data[i, j]
            # Calculate color difference
            diff = abs(int(pixel[0]) - bg_color[0]) + abs(int(pixel[1]) - bg_color[1]) + abs(int(pixel[2]) - bg_color[2])
            if diff < tolerance:
                data[i, j][3] = 0  # Make transparent
    
    # Convert back to PIL Image
    return Image.fromarray(data, 'RGBA')

@products_bp.route('/remove-background', methods=['POST'])
def remove_background():
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Get model type from form data (default to rembg)
        model_type = request.form.get('model_type', 'rembg')
        
        # Read image data
        image_data = image_file.read()
        
        # Open image with PIL
        input_image = Image.open(io.BytesIO(image_data))
        
        # Remove background with selected model
        output_image = advanced_remove_background(input_image, model_type)
        
        # Convert to base64 for preview
        buffer = io.BytesIO()
        output_image.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Create base64 string for preview
        preview_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'preview': f'data:image/png;base64,{preview_base64}',
            'message': f'Background removed successfully using {model_type.upper()}',
            'model_used': model_type
        })
    
    except Exception as e:
        return jsonify({'error': f'Background removal failed: {str(e)}'}), 500

@products_bp.route('/save-processed-image', methods=['POST'])
def save_processed_image():
    try:
        data = request.get_json()
        
        if 'image_data' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Remove data:image/png;base64, prefix
        image_data = data['image_data']
        if image_data.startswith('data:image/png;base64,'):
            image_data = image_data.replace('data:image/png;base64,', '')
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}.png"
        
        # Save to uploads/products directory
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'products')
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, filename)
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        # Return the URL
        image_url = f'/uploads/products/{filename}'
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'message': 'Image saved successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Image save failed: {str(e)}'}), 500

@products_bp.route('/upload-cropped-image', methods=['POST'])
def upload_cropped_image():
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Open image with PIL for processing
        input_image = Image.open(io.BytesIO(image_data))
        
        # Ensure image is in RGB mode and square
        if input_image.mode != 'RGB':
            input_image = input_image.convert('RGB')
        
        # Resize to standard square size (300x300) for consistency
        output_image = input_image.resize((300, 300), Image.Resampling.LANCZOS)
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}.jpg"
        
        # Save to uploads/products directory
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'products')
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, filename)
        
        # Save the image with good quality
        output_image.save(filepath, 'JPEG', quality=90, optimize=True)
        
        # Return the URL
        image_url = f'/uploads/products/{filename}'
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'message': 'Cropped image saved successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Cropped image save failed: {str(e)}'}), 500 