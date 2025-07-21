import React, { useState, useEffect } from 'react';
import { FaEdit, FaUser, FaLock, FaChartBar, FaCog, FaShieldAlt, FaUpload } from 'react-icons/fa';
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { uploadAvatar } from "../../utils/cloudinaryUtils";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
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

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
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
        setAdmin(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          department: data.data.department || 'Administration',
          employeeId: data.data.employeeId || 'ADM001',
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
      console.error('Error fetching admin profile:', error);
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
        setAdmin(data.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
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
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, JPG, PNG, and GIF files are allowed' });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadAvatar(file);
      
      if (result.success) {
        // Update the admin state with the new avatar URL
        setAdmin(prev => ({ ...prev, avatar: result.data.avatar }));
        setMessage({ type: 'success', text: result.message || 'Avatar updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to upload avatar' });
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
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="lg:ml-64">
          <Topbar />
          <div className="flex justify-center items-center py-12 mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#745249]"></div>
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="lg:ml-64">
          <Topbar />
          <div className="flex justify-center items-center py-12 mt-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile not found</h2>
              <p className="text-gray-600">Please try refreshing the page or contact support.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <Topbar />

        {/* Admin Profile Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#745249] via-amber-900 to-[#5a3d32] text-white mt-4">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-gradient-to-tl from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
              {/* Admin Info */}
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-transparent overflow-hidden shadow-xl">
                      <img
                        src={admin.avatar && admin.avatar !== 'default-avatar.png' ? admin.avatar : '/default-avatar.svg'}
                        alt="Admin Avatar"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <label className="absolute -bottom-1 -right-1 bg-white text-[#745249] rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                      <FaUpload className="w-3 h-3" />
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
                
                {/* Admin Details */}
                <div className="text-center md:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                    {admin.name}
                  </h1>
                  <p className="text-lg text-white/80 mb-2">{admin.email}</p>
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-1 md:space-y-0 md:space-x-4 text-xs text-white/60">
                    <span className="flex items-center">
                      <FaShieldAlt className="w-3 h-3 mr-1" />
                      Administrator
                    </span>
                    <span className="flex items-center">
                      <FaUser className="w-3 h-3 mr-1" />
                      Member since {formatDate(admin.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Message Display */}
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'border-[#745249] text-[#745249]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaUser className="mr-2" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === 'security'
                      ? 'border-[#745249] text-[#745249]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaLock className="mr-2" />
                  Security Settings
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === 'settings'
                      ? 'border-[#745249] text-[#745249]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaCog className="mr-2" />
                  Admin Settings
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 bg-[#745249] text-white px-4 py-2 rounded-lg hover:bg-[#5a3d32] transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 border-b pb-2">Personal Information</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          >
                            <option value="Administration">Administration</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                            <option value="Customer Service">Customer Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                          <input
                            type="text"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 border-b pb-2">Address Information</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249] disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#745249] text-white rounded-lg hover:bg-[#5a3d32] transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Security Settings Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                  
                  <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#745249] text-white py-2 rounded-lg hover:bg-[#5a3d32] transition-colors"
                    >
                      Update Password
                    </button>
                  </form>

                  {/* Security Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Security Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use a strong password with at least 8 characters</li>
                      <li>• Include uppercase, lowercase, numbers, and symbols</li>
                      <li>• Don't share your admin credentials with anyone</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Admin Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Admin Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Admin Privileges</h4>
                      <p className="text-sm text-yellow-700">
                        As an administrator, you have full access to all system features and user data. 
                        Please use these privileges responsibly.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">System Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="font-medium text-gray-800 capitalize">{admin.role}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Account Status</p>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Last Login</p>
                          <p className="font-medium text-gray-800">Today</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Account Created</p>
                          <p className="font-medium text-gray-800">{formatDate(admin.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
