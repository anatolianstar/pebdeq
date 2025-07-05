from flask import Blueprint, request, jsonify
from app.models.models import Category, Product, BlogPost, ContactMessage, SiteSettings
from app import db

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    try:
        # Featured products
        featured_products = Product.query.filter_by(
            is_featured=True, 
            is_active=True
        ).limit(8).all()
        
        # Categories
        categories = Category.query.filter_by(is_active=True).all()
        
        # Latest blog posts
        latest_posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(BlogPost.created_at.desc()).limit(3).all()
        
        return jsonify({
            'featured_products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'images': p.images,
                'category': p.category.name
            } for p in featured_products],
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url
            } for c in categories],
            'latest_posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'featured_image': p.featured_image,
                'created_at': p.created_at.isoformat()
            } for p in latest_posts]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/categories')
def categories():
    try:
        categories = Category.query.filter_by(is_active=True).all()
        
        return jsonify({
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url
            } for c in categories]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'email', 'message')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        message = ContactMessage(
            name=data['name'],
            email=data['email'],
            subject=data.get('subject', ''),
            message=data['message']
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({'message': 'Message sent successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/blog')
def blog_list():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(BlogPost.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'author': p.author,
                'category': p.category,
                'featured_image': p.featured_image,
                'created_at': p.created_at.isoformat()
            } for p in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/blog/<slug>')
def blog_detail(slug):
    try:
        post = BlogPost.query.filter_by(slug=slug, is_published=True).first()
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        return jsonify({
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'content': post.content,
            'author': post.author,
            'category': post.category,
            'featured_image': post.featured_image,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/site-settings')
def get_site_settings():
    try:
        settings = SiteSettings.query.first()
        if not settings:
            # Return default settings
            return jsonify({
                'site_name': 'pebdeq',
                'site_logo': None,
                'use_logo': False,
                'logo_width': 120,
                'logo_height': 40,
                'site_logo2': None,
                'use_logo2': False,
                'logo2_width': 120,
                'logo2_height': 40,
                'welcome_title': 'Welcome to Pebdeq',
                'welcome_subtitle': 'Crafted. Vintage. Smart.',
                'welcome_background_image': None,
                'welcome_background_color': '#667eea',
                'welcome_text_color': '#ffffff',
                'welcome_button_text': 'Explore Products',
                'welcome_button_link': '/products',
                'welcome_button_color': '#00b894'
            })
        
        return jsonify({
            'site_name': settings.site_name,
            'site_logo': settings.site_logo,
            'use_logo': settings.use_logo,
            'logo_width': settings.logo_width,
            'logo_height': settings.logo_height,
            'site_logo2': settings.site_logo2,
            'use_logo2': settings.use_logo2,
            'logo2_width': settings.logo2_width,
            'logo2_height': settings.logo2_height,
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