class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token to localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Set user data to localStorage
  setUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Get user data from localStorage
  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Remove auth token from localStorage
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Get headers with auth token
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.setToken(data.token);
        this.setUser(data.data); // Store user data including role
        return { success: true, data: data.data, user: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Don't automatically log in the user after registration
        // User needs to login manually after registration
        return { success: true, data: data.data, message: 'Registration successful! Please login with your credentials.' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        if (response.status === 401) {
          this.logout();
        }
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, message: 'Failed to fetch profile.' };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Failed to update profile.' };
    }
  }

  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/profile/password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, message: 'Failed to update password.' };
    }
  }

  // Upload avatar
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseURL}/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, message: 'Failed to upload avatar.' };
    }
  }

  // Logout user
  logout() {
    this.removeToken();
    window.location.href = '/';
  }
}

export default new AuthService();
