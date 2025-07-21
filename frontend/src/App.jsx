import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/user/Home';
import AboutUs from './pages/user/AboutUs';
import ContactUs from './pages/user/ContactUs';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Shop from './pages/user/Shop';
import Cart from './pages/user/Cart';
import UserProfile from './pages/user/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManage from './pages/admin/OrderManage';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import SalesManagement from './pages/admin/SalesManagement';
import RegistrationForm from './pages/user/RegistrationForm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/admin/orders" element={<OrderManage />} />
        <Route path="/admin/employee" element={<EmployeeManagement />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/admin/sales" element={<SalesManagement />}/>
        <Route path="/register-form" element={<RegistrationForm />} />


      </Routes>
    </Router>
  );
};

export default App;
