# 🌶️ Spicelore - Complete Setup Guide

This guide will help you set up the complete Spicelore project (Frontend + Backend) for development.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** - [Download here](https://git-scm.com/)
4. **A code editor** (VS Code recommended)

## 🚀 Quick Start

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd "d:\Spicelore Project\backend"

# Install dependencies (already done)
npm install

# Create environment file (already created)
# The .env file is already configured with default values

# Start MongoDB service
# On Windows: Start MongoDB service from Services
# On macOS: brew services start mongodb/brew/mongodb-community
# On Linux: sudo systemctl start mongod

# Seed the database with sample data
node seedDatabase.js

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd "d:\Spicelore Project\frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Backend Configuration

### Environment Variables

The backend uses environment variables for configuration. The `.env` file has been created with default values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spicelore
JWT_SECRET=spicelore_secret_key_2025_change_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. **Install MongoDB:**
   - Windows: Download and install MongoDB Community Server
   - macOS: `brew install mongodb/brew/mongodb-community`
   - Linux: Follow MongoDB installation guide for your distribution

2. **Start MongoDB:**
   - Windows: Start MongoDB service from Windows Services
   - macOS/Linux: `sudo systemctl start mongod` or `brew services start mongodb/brew/mongodb-community`

3. **Seed Database:**
   ```bash
   cd "d:\Spicelore Project\backend"
   node seedDatabase.js
   ```

### Default Admin Account

After seeding the database, you can log in with:
- **Email:** admin@spicelore.com
- **Password:** admin123

### Sample User Account

- **Email:** john@example.com
- **Password:** password123

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders

### Registration Form
- `POST /api/registration` - Submit registration form
- `GET /api/registration` - Get all registrations (Admin)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Input validation
- SQL injection prevention

## 📱 Frontend Integration

The frontend is already configured to work with the backend. Update the API base URL in your frontend configuration if needed:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🧪 Testing the Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@spicelore.com",
       "password": "admin123"
     }'
   ```

## 🛠️ Development Commands

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
node seedDatabase.js  # Seed database with sample data
```

### Available Scripts for Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📂 Project Structure

```
Spicelore Project/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Main server file
│   ├── seedDatabase.js  # Database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── assets/      # Static assets
│   └── package.json
└── README.md           # This file
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB service is running
   - Check the connection string in .env file
   - Verify MongoDB is installed correctly

2. **Port Already in Use:**
   - Change the PORT in .env file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Dependencies Installation Issues:**
   - Delete node_modules and package-lock.json
   - Run `npm install` again
   - Use `npm ci` for clean install

4. **CORS Issues:**
   - Ensure FRONTEND_URL in .env matches your frontend URL
   - Check if both servers are running on correct ports

### Environment Setup Issues

1. **JWT_SECRET:**
   - Generate a secure secret for production
   - Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Database Connection:**
   - For local MongoDB: `mongodb://localhost:27017/spicelore`
   - For MongoDB Atlas: Get connection string from Atlas dashboard

## 📋 Next Steps

1. **Customize the Frontend:**
   - Update branding and colors
   - Modify product categories
   - Add more features

2. **Configure External Services:**
   - Set up Cloudinary for image uploads
   - Configure Stripe for payments
   - Set up email service (Gmail, SendGrid, etc.)

3. **Deploy to Production:**
   - Set up hosting (Heroku, AWS, DigitalOcean)
   - Configure production environment variables
   - Set up CI/CD pipeline

## 📧 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all services are running
3. Check the .env configuration
4. Ensure all dependencies are installed

## 🎉 Congratulations!

You now have a fully functional spice e-commerce platform with:
- User authentication and authorization
- Product management system
- Shopping cart functionality
- Order processing
- Admin dashboard
- Registration form system

Happy coding! 🌶️
