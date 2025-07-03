# 🚀 PEBDEQ - Modern E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com)

> Modern, responsive ve kullanıcı dostu e-ticaret platformu. 3D baskı, vintage ürünler, el aletleri ve lazer gravür hizmetleri için özel tasarlanmış.

## ✨ Özellikler

### 🎨 Frontend (React)
- **Modern UI/UX**: Montserrat font, gradient renkler, hover animasyonları
- **Responsive Design**: Mobil ve desktop uyumlu tasarım
- **Single Page Application**: React Router ile hızlı sayfa geçişleri
- **Context API**: Auth ve Cart state yönetimi
- **Component-Based**: Modüler ve yeniden kullanılabilir component yapısı

### ⚙️ Backend (Flask)
- **RESTful API**: Modern API endpoint'leri
- **JWT Authentication**: Güvenli kullanıcı doğrulama sistemi
- **Database ORM**: SQLAlchemy ile veritabanı yönetimi
- **Admin Panel**: Yönetici paneli route'ları
- **CORS Support**: Frontend-backend entegrasyonu

### 🏪 E-Ticaret Özellikleri
- **Kategori Yönetimi**: 4 ana kategori (3D Print, Tools, Vintage Bulbs, Laser Engraving)
- **Ürün Yönetimi**: Ürün ekleme, düzenleme, silme
- **Sepet Sistemi**: Dinamik sepet yönetimi
- **Kullanıcı Sistemi**: Kayıt, giriş, profil yönetimi
- **Blog Sistemi**: İçerik yönetimi
- **İletişim Formu**: Müşteri iletişimi

## 🛠️ Teknoloji Stack

### Backend
- **Flask 2.3.3** - Web framework
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **SQLite** - Database
- **CORS** - Cross-origin support
- **Werkzeug** - WSGI utilities

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Context API** - State management
- **CSS3** - Modern styling
- **Google Fonts** - Typography

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.11+
- Node.js 18+
- npm

### Backend Kurulumu

```bash
# Repository'yi klonlayın
git clone https://github.com/anatolianstar/pebdeq.git
cd pebdeq

# Backend klasörüne gidin
cd backend

# Virtual environment oluşturun
python -m venv venv

# Virtual environment'i aktif edin
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt

# Uygulamayı çalıştırın
python run.py
```

Backend http://localhost:5000 adresinde çalışacak.

### Frontend Kurulumu

```bash
# Frontend klasörüne gidin (yeni terminal)
cd frontend

# Paketleri yükleyin
npm install

# Development server'ı başlatın
npm start
```

Frontend http://localhost:3000 adresinde çalışacak.

## 🔧 Admin Bilgileri

- **Email**: admin@pebdeq.com
- **Password**: admin123

## 📁 Proje Yapısı

```
pebdeq/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   └── models.py
│   │   └── routes/
│   │       ├── admin.py
│   │       ├── auth.py
│   │       ├── main.py
│   │       └── products.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   └── Footer.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── Login.js
│   │   │   └── ...
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🌐 API Endpoints

### Genel
- `GET /` - Ana sayfa kategorileri
- `GET /api/categories` - Tüm kategoriler

### Ürünler
- `GET /api/products` - Tüm ürünler
- `GET /api/products/<id>` - Tek ürün
- `POST /api/products` - Ürün ekleme (Admin)

### Kullanıcı
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/profile` - Profil

### Admin
- `GET /api/admin/dashboard` - Admin paneli
- `POST /api/admin/products` - Ürün yönetimi

## 🎨 UI/UX Özellikleri

- **Modern Color Palette**: Mavi gradient tonları
- **Typography**: Montserrat font ailesi
- **Animations**: Hover ve transition efektleri
- **Cards**: Gölgeli ve interactive kartlar
- **Responsive Grid**: Mobil uyumlu grid sistemi
- **Social Media Icons**: Footer'da sosyal medya bağlantıları

## 📱 Responsive Design

- **Desktop**: 1200px+ tam özellik
- **Tablet**: 768px-1199px optimized layout
- **Mobile**: 320px-767px stack layout

## 🔒 Güvenlik

- JWT token authentication
- Password hashing
- CORS policy
- Input validation
- Admin role protection

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Website**: [PEBDEQ](http://localhost:3000)
- **Email**: developer@pebdeq.com
- **Repository**: [GitHub](https://github.com/anatolianstar/pebdeq)

---

**Made with ❤️ by PEBDEQ Team**
