import React, { useState, useEffect } from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({});
  const [ordersFilters, setOrdersFilters] = useState({
    status: 'All',
    search: '',
    page: 1
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showStats, setShowStats] = useState(true);

  const fetchUserOrders = async (page = 1) => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: ordersFilters.status !== 'All' ? ordersFilters.status : '',
        search: ordersFilters.search
      });

      const response = await fetch(`http://localhost:5000/api/orders/my-orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setOrdersPagination(data.pagination || {});
      } else {
        setMessage({ type: 'error', text: 'Failed to load orders' });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchUserOrders();
    }
  }, [activeTab, ordersFilters.status, ordersFilters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOrdersFilterChange = (key, value) => {
    setOrdersFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          street: data.data.address?.street || '',
          city: data.data.address?.city || '',
          state: data.data.address?.state || '',
          zipCode: data.data.address?.zipCode || '',
          country: data.data.address?.country || ''
        });
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to upload avatar' });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-[#351108]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#351108] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800">Please login to view your profile</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <Navbar />
      
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#351108] via-amber-900 to-[#2a0e06] text-white mt-4">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-gradient-to-tl from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Profile Info */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-transparent overflow-hidden shadow-xl">
                    <img
                      src={user.avatar && user.avatar !== 'default-avatar.png' ? user.avatar : '/default-avatar.svg'}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="absolute -bottom-1 -right-1 bg-white text-[#351108] rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* User Details */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold mb-1 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <p className="text-lg text-white/80 mb-2">{user.email}</p>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-1 md:space-y-0 md:space-x-4 text-xs text-white/60">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Member since {formatDate(user.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {user.status} Account
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-xl font-bold mb-1">{orders.length}</div>
                <div className="text-xs text-white/70">Total Orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-xl font-bold mb-1 capitalize">{user.role}</div>
                <div className="text-xs text-white/70">Account Type</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 relative z-10">{/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg border backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-50/90 text-green-700 border-green-200' 
              : 'bg-red-50/90 text-red-700 border-red-200'
          } transition-all duration-300`}>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-xl font-bold hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Modern Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 mb-6">
          <nav className="flex p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-[#351108] text-white shadow-lg'
                  : 'text-gray-600 hover:text-[#351108] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile Information</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'bg-[#351108] text-white shadow-lg'
                  : 'text-gray-600 hover:text-[#351108] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>My Orders</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === 'security'
                  ? 'bg-[#351108] text-white shadow-lg'
                  : 'text-gray-600 hover:text-[#351108] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Security</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Profile Information</h2>
                <p className="text-sm text-gray-600">Manage your personal information and preferences</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                  isEditing 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-[#351108] text-white hover:bg-amber-900'
                }`}
              >
                {isEditing ? (
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </span>
                )}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your state or province"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your ZIP or postal code"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#351108] text-white rounded-lg hover:bg-amber-900 transition-all duration-300 font-medium text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Full Name</label>
                    <p className="text-xl font-medium text-gray-900">{user.name}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Email Address</label>
                    <p className="text-xl font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Phone Number</label>
                    <p className="text-xl font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Account Role</label>
                    <p className="text-xl font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Account Status</label>
                    <p className="text-xl font-medium">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Member Since</label>
                    <p className="text-xl font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                {user.address && (
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Address</label>
                      <p className="text-xl font-medium text-gray-900">
                        {[user.address.street, user.address.city, user.address.state, user.address.zipCode, user.address.country]
                          .filter(Boolean)
                          .join(', ') || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">My Orders</h2>
                <p className="text-sm text-gray-600">Track and manage your order history</p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <select
                  value={ordersFilters.status}
                  onChange={(e) => handleOrdersFilterChange('status', e.target.value)}
                  className="px-3 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={ordersFilters.search}
                  onChange={(e) => handleOrdersFilterChange('search', e.target.value)}
                  className="px-3 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent"
                />
                
                <button
                  onClick={() => fetchUserOrders(ordersFilters.page)}
                  className="px-4 py-2 bg-[#351108] text-white rounded-lg hover:bg-amber-900 transition-all duration-300 text-sm font-medium"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#351108]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#351108] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <a
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 bg-[#351108] text-white rounded-lg hover:bg-amber-900 transition-all duration-300 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Placed on {formatDate(order.date)}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        {/* Order Items */}
                        <div className="space-y-2 mb-3">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                {item.product?.images && item.product.images.length > 0 && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.productName}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.productName}</p>
                                  <p className="text-gray-600">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">{order.product}</p>
                              <p>Qty: {order.quantity}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Ship to:</span> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                        )}
                      </div>
                      
                      {/* Order Total & Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount || order.subtotal)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.paymentMethod || 'Cash on Delivery'}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                            className="px-3 py-1 text-xs font-medium text-[#351108] bg-white border border-[#351108] rounded-lg hover:bg-[#351108] hover:text-white transition-all duration-300"
                          >
                            View Details
                          </button>
                          
                          {order.status === 'Delivered' && (
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-300">
                              Review
                            </button>
                          )}
                          
                          {order.status === 'Shipped' && order.tracking && (
                            <button className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-300">
                              Track Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {ordersPagination && (ordersPagination.next || ordersPagination.prev) && (
                  <div className="flex justify-center items-center space-x-4 pt-6">
                    {ordersPagination.prev && (
                      <button
                        onClick={() => fetchUserOrders(ordersPagination.prev.page)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
                      >
                        Previous
                      </button>
                    )}
                    
                    <span className="text-sm text-gray-600">
                      Page {ordersFilters.page}
                    </span>
                    
                    {ordersPagination.next && (
                      <button
                        onClick={() => fetchUserOrders(ordersPagination.next.page)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#351108] border border-[#351108] rounded-lg hover:bg-amber-900 transition-all duration-300"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Security Settings</h2>
              <p className="text-sm text-gray-600">Keep your account secure by updating your password regularly</p>
            </div>
            
            <div className="max-w-md">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300 pr-10"
                      required
                      placeholder="Enter your current password"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300 pr-10"
                      minLength="6"
                      required
                      placeholder="Enter your new password"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] focus:border-transparent transition-all duration-300 pr-10"
                      minLength="6"
                      required
                      placeholder="Confirm your new password"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#351108] text-white rounded-lg hover:bg-amber-900 transition-all duration-300 font-medium text-sm"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Update Password</span>
                    </span>
                  </button>
                </div>
              </form>
              
              {/* Security Tips */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Security Tips</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start space-x-2">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Use a strong password with at least 8 characters</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Include uppercase, lowercase, numbers, and symbols</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Don't reuse passwords from other accounts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;