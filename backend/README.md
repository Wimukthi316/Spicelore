# Spicelore Backend API

A comprehensive backend API for the Spicelore spice e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with admin controls
- **Product Management**: Full product catalog management with categories and inventory tracking
- **Order Management**: Order processing, tracking, and status management
- **Inventory Management**: Stock tracking, low stock alerts, and movement history
- **Employee Management**: Staff management with roles and departments
- **Sales Management**: Sales tracking, analytics, and reporting
- **Category Management**: Hierarchical product categorization
- **Security**: Rate limiting, input validation, and data sanitization
- **File Upload**: Support for product images and documents

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer
- **Logging**: Morgan

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order (admin)
- `DELETE /api/orders/:id` - Delete order (admin)
- `GET /api/orders/stats` - Get order statistics (admin)

### Employees (Admin only)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Inventory (Admin only)
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get single inventory item
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/low-stock` - Get low stock items

### Sales (Admin only)
- `GET /api/Sale` - Get all sales
- `GET /api/Sale/:id` - Get single sale
- `POST /api/Sale` - Create sale
- `PUT /api/Sale/:id` - Update sale
- `DELETE /api/Sale/:id` - Delete sale
- `GET /api/Sale/stats` - Get sales statistics

### Categories
- `GET /api/categories` - Get all categories (public)
- `GET /api/categories/:id` - Get single category (public)
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `GET /api/categories/tree` - Get category tree

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `CLIENT_URL` - Frontend URL for CORS

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Project Structure

```
backend/
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/              # Mongoose models
├── routes/              # Express routes
├── utils/               # Utility functions
├── uploads/             # File uploads directory
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── server.js           # Entry point
```

## Models

- **User**: User accounts and authentication
- **Product**: Product catalog with images and specifications
- **Order**: Customer orders and order items
- **Employee**: Staff management with roles and departments
- **Inventory**: Stock management and tracking
- **Sale**: Sales records and analytics
- **Category**: Product categorization

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Input validation and sanitization
- XSS protection
- NoSQL injection prevention

## Error Handling

The API uses a centralized error handling system with custom error responses and proper HTTP status codes.

## Logging

Request logging is implemented using Morgan for development and debugging purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
