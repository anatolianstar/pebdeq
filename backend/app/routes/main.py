from flask import Blueprint, request, jsonify, current_app
from app.models.models import Category, Product, BlogPost, ContactMessage, SiteSettings, Order, OrderItem
from app import db
from functools import wraps
import time
from datetime import datetime, timedelta

# Simple cache implementation
_cache = {}

def cached(timeout=300):  # 5 minutes default timeout
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Skip cache in debug mode
            if current_app.debug and request.args.get('no_cache') != '1':
                return f(*args, **kwargs)

            cache_key = f.__name__ + str(args) + str(sorted(request.args.items()))

            # Check if we have a valid cached response
            if cache_key in _cache:
                cached_result, timestamp = _cache[cache_key]
                if timestamp > time.time() - timeout:
                    return cached_result

            # If not cached or expired, generate new response
            result = f(*args, **kwargs)
            _cache[cache_key] = (result, time.time())
            return result
        return decorated_function
    return decorator

main_bp = Blueprint('main', __name__)

# Simple visitor tracking
visitor_stats = {
    'today_count': 0,
    'yesterday_count': 0,
    'last_reset': datetime.now().date(),
    'unique_ips': set()
}

def update_visitor_stats():
    """Update daily visitor statistics"""
    today = datetime.now().date()

    # Reset counters if it's a new day
    if today > visitor_stats['last_reset']:
        visitor_stats['yesterday_count'] = visitor_stats['today_count']
        visitor_stats['today_count'] = 0
        visitor_stats['unique_ips'] = set()
        visitor_stats['last_reset'] = today

    # Count visit
    ip = request.remote_addr
    if ip not in visitor_stats['unique_ips']:
        visitor_stats['unique_ips'].add(ip)
        visitor_stats['today_count'] += 1

@main_bp.route('/')
@cached(timeout=60)  # Cache for 1 minute
def home():
    try:
        # Update visitor stats (outside of cache to track accurately)
        update_visitor_stats()
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

        # Discounted products (products with original_price > price)
        discounted_products = Product.query.filter(
            Product.is_active == True,
            Product.original_price.isnot(None),
            Product.original_price > Product.price
        ).order_by(((Product.original_price - Product.price) / Product.original_price).desc()).limit(4).all()

        # Most popular products (based on order count)
        popular_products = Product.query.join(OrderItem).group_by(Product.id).order_by(
            db.func.count(OrderItem.id).desc()
        ).filter(Product.is_active == True).limit(4).all()
        
        # Function to format product data
        def format_product(p):
            return {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'discount_percentage': round((p.original_price - p.price) / p.original_price * 100) if p.original_price else None,
                'images': p.images,
                'category': p.category.name,
                'category_slug': p.category.slug,
                'stock_quantity': p.stock_quantity,
                'is_featured': p.is_featured
            }

        # Get site settings
        site_settings = SiteSettings.query.first()

        # Get total products and orders counts
        total_products = Product.query.filter_by(is_active=True).count()
        total_orders = Order.query.count()

        return jsonify({
            'featured_products': [format_product(p) for p in featured_products],
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url,
                'background_image_url': c.background_image_url,
                'background_color': c.background_color,
                'is_active': c.is_active,
                'product_count': Product.query.filter_by(category_id=c.id, is_active=True).count()
            } for c in categories],
            'latest_posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'featured_image': p.featured_image,
                'created_at': p.created_at.isoformat()
            } for p in latest_posts],
            'discounted_products': [format_product(p) for p in discounted_products],
            'popular_products': [format_product(p) for p in popular_products],
            'site_stats': {
                'total_products': total_products,
                'total_orders': total_orders,
                'visitors_today': visitor_stats['today_count'],
                'visitors_yesterday': visitor_stats['yesterday_count']
            },
            'site_settings': {
                'site_name': site_settings.site_name if site_settings else 'PEBDEQ',
                'welcome_title': site_settings.welcome_title if site_settings else 'Welcome to PEBDEQ',
                'welcome_subtitle': site_settings.welcome_subtitle if site_settings else 'Crafted. Vintage. Smart.'
            }
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
                'image_url': c.image_url,
                'background_image_url': c.background_image_url,
                'background_color': c.background_color,
                'is_active': c.is_active
            } for c in categories]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/products')
def products():
    try:
        products = Product.query.filter_by(is_active=True).all()
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'description': p.description,
                'price': p.price,
                'original_price': p.original_price,
                'stock_quantity': p.stock_quantity,
                'category_id': p.category_id,
                'images': p.images,
                'video_url': p.video_url,
                'is_featured': p.is_featured,
                'is_active': p.is_active,
                'created_at': p.created_at.isoformat(),
                'updated_at': p.updated_at.isoformat()
            } for p in products]
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
                'welcome_button_color': '#00b894',
                'collections_title': 'Our Collections',
                'collections_show_categories': [],
                'collections_categories_per_row': 4,
                'collections_max_rows': 1,
                'collections_show_section': True,
                'homepage_products_show_section': True,
                'homepage_products_title': 'Featured Products',
                'homepage_products_subtitle': 'Discover our most popular items',
                'homepage_products_max_rows': 2,
                'homepage_products_per_row': 4,
                'homepage_products_max_items': 8,
                'homepage_products_show_images': True,
                'homepage_products_image_height': 200,
                'homepage_products_image_width': 300,
                'homepage_products_show_favorite': True,
                'homepage_products_show_buy_now': True,
                'homepage_products_show_details': True,
                'homepage_products_show_price': True,
                'homepage_products_show_original_price': True,
                'homepage_products_show_stock': True,
                'homepage_products_show_category': True,
                'homepage_products_sort_by': 'featured',
                'homepage_products_filter_categories': [],
                'homepage_products_show_view_all': True,
                'homepage_products_view_all_text': 'View All Products',
                'homepage_products_view_all_link': '/products',
                'homepage_products_card_style': 'modern',
                'homepage_products_card_shadow': True,
                'homepage_products_card_hover_effect': True,
                'homepage_products_show_badges': True,
                'homepage_products_show_rating': False,
                'homepage_products_show_quick_view': False,
                'contact_social': {
                    'contact_phone': '',
                    'contact_email': '',
                    'contact_address': '',
                    'social_instagram': '',
                    'social_facebook': '',
                    'social_twitter': '',
                    'social_youtube': '',
                    'social_linkedin': ''
                },
                'footer_settings': {
                    'footer_show_section': True,
                    'footer_background_color': '#2c3e50',
                    'footer_text_color': '#ffffff',
                    'footer_company_name': 'PEBDEQ',
                    'footer_company_description': 'Crafted with passion, delivered with precision.',
                    'footer_copyright_text': '© 2024 PEBDEQ. All rights reserved.',
                    'footer_support_title': 'Support',
                    'footer_support_show_section': True,
                    'footer_support_links': [
                        {'title': 'Contact Us', 'url': '/contact', 'is_external': False},
                        {'title': 'FAQ', 'url': '/faq', 'is_external': False},
                        {'title': 'Shipping Info', 'url': '/shipping', 'is_external': False},
                        {'title': 'Returns', 'url': '/returns', 'is_external': False}
                    ],
                    'footer_quick_links_title': 'Quick Links',
                    'footer_quick_links_show_section': True,
                    'footer_quick_links': [
                        {'title': 'About Us', 'url': '/about', 'is_external': False},
                        {'title': 'Products', 'url': '/products', 'is_external': False},
                        {'title': 'Blog', 'url': '/blog', 'is_external': False},
                        {'title': 'Privacy Policy', 'url': '/privacy', 'is_external': False}
                    ],
                    'footer_social_title': 'Follow Us',
                    'footer_social_show_section': True,
                    'footer_newsletter_title': 'Newsletter',
                    'footer_newsletter_show_section': True,
                    'footer_newsletter_description': 'Subscribe to get updates about new products and offers.',
                    'footer_newsletter_placeholder': 'Enter your email address',
                    'footer_newsletter_button_text': 'Subscribe'
                }
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
            'welcome_button_color': settings.welcome_button_color,
            'collections_title': settings.collections_title,
            'collections_show_categories': settings.collections_show_categories,
            'collections_categories_per_row': settings.collections_categories_per_row,
            'collections_max_rows': settings.collections_max_rows,
            'collections_show_section': settings.collections_show_section,
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
            'homepage_products_show_quick_view': settings.homepage_products_show_quick_view,
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
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 