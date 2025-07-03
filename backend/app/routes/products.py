from flask import Blueprint, request, jsonify
from app.models.models import Product, Category
from app import db
from sqlalchemy import or_

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
                'category': product.category.name,
                'category_slug': product.category.slug,
                'stock_quantity': product.stock_quantity,
                'is_featured': product.is_featured,
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