# ReelCast - Creator & Influencer Marketplace

India's #1 platform connecting brands with verified models, creators, influencers, and Instagram page owners.

## 🚀 Features

- **Multi-Role System**: Talent, Instagram Pages, Brands, and Admin dashboards
- **Secure Authentication**: JWT-based auth with refresh tokens and HTTP-only cookies
- **Admin Approval Workflow**: Contact details revealed only after admin approval
- **Advanced Search & Filtering**: Find talent by category, city, and more
- **Subscription Management**: Multiple brand subscription tiers
- **Profile Management**: Comprehensive profiles for talent and Instagram pages
- **Booking System**: Request management with status tracking
- **File Upload**: Secure profile picture and document uploads
- **Email Notifications**: Automated notifications for key events

## 🏗️ Architecture

### Backend (Node.js + Express)
```
src/
├── config/         # Configuration (DB, JWT, etc.)
├── controllers/    # Route controllers
├── middleware/     # Custom middleware (auth, validation, etc.)
├── models/         # Mongoose schemas
├── routes/         # API routes
├── services/       # Business logic layer
├── repositories/   # Database operations
├── validators/     # Input validation schemas
├── utils/          # Helper functions
└── app.js         # Express app setup
```

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   ├── store/         # State management
│   ├── utils/         # Utilities
│   └── App.jsx       # Main app component
```

## 🔧 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd reelcast
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
- MongoDB connection string
- JWT secrets (generate strong random strings)
- SMTP credentials for email
- Other application settings

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Run the application**

**Development mode (both backend + frontend):**
```bash
npm run dev:all
```

**Backend only:**
```bash
npm run dev
```

**Frontend only:**
```bash
npm run client
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 📋 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+91 98765 43210",
  "role": "talent",
  // Role-specific fields
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Logout
```http
POST /api/v1/auth/logout
```

### Talent Endpoints
- `GET /api/v1/talent` - Get all talent (paginated, filterable)
- `GET /api/v1/talent/:id` - Get talent by ID
- `PUT /api/v1/talent/:id` - Update talent profile (authenticated)
- `DELETE /api/v1/talent/:id` - Delete talent (admin only)

### Instagram Pages Endpoints
- `GET /api/v1/instagram-pages` - Get all pages (paginated, filterable)
- `GET /api/v1/instagram-pages/:id` - Get page by ID
- `PUT /api/v1/instagram-pages/:id` - Update page (authenticated)

### Booking Endpoints
- `POST /api/v1/bookings` - Create booking request
- `GET /api/v1/bookings` - Get user's bookings
- `PUT /api/v1/bookings/:id/approve` - Approve booking (admin)
- `PUT /api/v1/bookings/:id/reject` - Reject booking (admin)

### Brand Endpoints
- `GET /api/v1/brands/me` - Get brand profile
- `PUT /api/v1/brands/me` - Update brand profile

### Admin Endpoints
- `GET /api/v1/admin/stats` - Platform statistics
- `GET /api/v1/admin/users` - All users
- `PUT /api/v1/admin/users/:id/verify` - Verify user

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Access + refresh token strategy
- **HTTP-Only Cookies**: Secure token storage
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive validation with express-validator
- **XSS Protection**: XSS-clean middleware
- **NoSQL Injection Protection**: mongo-sanitize
- **HPP Protection**: Prevent HTTP parameter pollution
- **Helmet**: Security headers
- **CORS**: Configured for specific origins
- **Account Lockout**: After failed login attempts
- **File Upload Validation**: Type, size, and content validation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📦 Production Build

1. **Build frontend**
```bash
npm run build
```

2. **Set production environment**
```bash
export NODE_ENV=production
```

3. **Start server**
```bash
npm start
```

## 🚢 Deployment

### Environment Checklist
- [ ] Set strong JWT secrets
- [ ] Configure production MongoDB URL
- [ ] Set COOKIE_SECURE=true
- [ ] Configure SMTP for emails
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Configure file storage (S3/CDN)
- [ ] Set up monitoring
- [ ] Configure backup strategy

### Recommended Platforms
- **Backend**: Railway, Render, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **File Storage**: AWS S3, Cloudinary

## 📁 Project Structure

```
reelcast/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/                   # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── uploads/               # File uploads
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Nodemailer
- Multer (file uploads)

### Frontend
- React 18
- Vite
- React Router
- React Query (TanStack Query)
- Zustand (state management)
- Axios
- Bootstrap 5

### Security
- Helmet
- express-rate-limit
- express-mongo-sanitize
- xss-clean
- hpp
- cors

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/reelcast
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env
PORT=3000
```

### CORS Errors
- Ensure CLIENT_URL in `.env` matches your frontend URL
- Check CORS configuration in `src/config/cors.js`

## 📞 Support

For issues and questions:
- Email: support@reelcast.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
