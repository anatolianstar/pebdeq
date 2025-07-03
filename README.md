# PEBDEQ - E-Commerce Platform

**PEBDEQ** is a modern e-commerce platform specializing in 3D printing products, tools, vintage light bulbs, and laser engraving services. Built with Flask backend and React frontend.

## 🚀 Features

- **Product Categories**: 3D Print, Tools, Vintage Light Bulbs, Laser Engraving
- **User Authentication**: Registration, login, profile management
- **Shopping Cart**: Add to cart, quantity management, checkout
- **Admin Panel**: Product management, order tracking, customer messages
- **Blog System**: Content management for articles and tutorials
- **Responsive Design**: Mobile-friendly interface
- **Payment Integration**: Stripe payment processing (ready)

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **API**: RESTful endpoints
- **Payment**: Stripe integration

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast
- **Styling**: CSS3 with responsive design

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pebdeq
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   python run.py
   ```

   This will create the SQLite database and add sample categories.

5. **Admin User Created**
   - Email: `admin@pebdeq.com`
   - Password: `admin123`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🚀 Running the Application

### Development Mode

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   python run.py
   ```
   Backend will run on `http://localhost:5000`

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

### Production Deployment

1. **Build React app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy with Gunicorn**
   ```bash
   cd backend
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

## 📁 Project Structure

```
pebdeq/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   └── models.py
│   │   └── routes/
│   │       ├── main.py
│   │       ├── products.py
│   │       ├── auth.py
│   │       └── admin.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── public/
└── README.md
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /` - Home page data
- `GET /api/products` - Product listing
- `GET /api/products/<slug>` - Product details
- `GET /api/blog` - Blog posts
- `POST /api/contact` - Contact form

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - User profile

### Admin Endpoints (Protected)
- `GET /api/admin/products` - Product management
- `POST /api/admin/products` - Create product
- `GET /api/admin/orders` - Order management
- `GET /api/admin/messages` - Customer messages

## 🛡 Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///pebdeq.db
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

## 📱 Pages & Features

### Customer Pages
- **Home**: Featured products, categories, latest blog posts
- **Products**: Product grid with filtering and sorting
- **Product Detail**: Product information, related products
- **Categories**: 3D Print, Tools, Vintage Bulbs, Laser Engraving
- **Cart**: Shopping cart management
- **Checkout**: Payment processing with Stripe
- **Blog**: Articles about 3D printing and tutorials
- **Contact**: Contact form
- **About**: Company information

### Admin Panel
- **Dashboard**: Overview of orders, products, messages
- **Product Management**: Add, edit, delete products
- **Order Management**: Track order status
- **Customer Messages**: View and respond to inquiries
- **Blog Management**: Create and manage blog posts

## 🔄 Development Workflow

1. **Backend Development**
   - Add new models in `app/models/models.py`
   - Create API routes in `app/routes/`
   - Test with Postman or curl

2. **Frontend Development**
   - Create React components in `src/components/`
   - Add pages in `src/pages/`
   - Use context for state management

3. **Database Changes**
   - Use Flask-Migrate for database migrations
   - `flask db migrate -m "description"`
   - `flask db upgrade`

## 🎨 Customization

### Brand Identity
- Logo: Place your logo in `frontend/public/logo.png`
- Colors: Update CSS variables in `App.css`
- Typography: Modify font families in CSS

### Categories
- Default categories: 3D Print, Tools, Vintage Bulbs, Laser Engraving
- Add new categories through admin panel
- Customize category descriptions and images

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@pebdeq.com or create an issue in the repository.

---

**PEBDEQ** - Your trusted source for 3D printing, tools, vintage lighting, and laser engraving services.
