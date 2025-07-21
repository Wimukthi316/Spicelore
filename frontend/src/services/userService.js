import authService from './authService';

const API_URL = 'http://localhost:5000/api';

class UserService {
    // Get all users
    async getUsers(searchQuery = '', page = 1, limit = 25) {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users?search=${searchQuery}&page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch users');
            }

            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get single user
    async getUser(userId) {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user');
            }

            return data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update user
    async updateUser(userId, userData) {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            return data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Get user statistics
    async getUserStats() {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/users/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user stats');
            }

            return data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }
}

export default new UserService();
