import authService from './authService';

const API_URL = 'http://localhost:5000/api';

class ProductService {
    // Get all products (public access for shop)
    async getProducts(searchQuery = '', page = 1, limit = 25, category = '', minPrice = '', maxPrice = '') {
        try {
            let queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (searchQuery) queryParams.append('search', searchQuery);
            if (category && category !== 'all') queryParams.append('category', category);
            if (minPrice) queryParams.append('minPrice', minPrice);
            if (maxPrice) queryParams.append('maxPrice', maxPrice);

            const response = await fetch(`${API_URL}/products?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products');
            }

            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Get single product
    async getProduct(productId) {
        try {
            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch product');
            }

            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    // Create new product (admin only)
    async createProduct(productData) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create product');
            }

            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    // Update product (admin only)
    async updateProduct(productId, productData) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product');
            }

            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Delete product (admin only)
    async deleteProduct(productId) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete product');
            }

            return data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Update product stock (for inventory management)
    async updateProductStock(productId, newStock) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/products/${productId}/stock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ stock: newStock })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product stock');
            }

            return data;
        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }

    // Purchase product (reduce stock after purchase)
    async purchaseProduct(productId, quantity) {
        try {
            const response = await fetch(`${API_URL}/products/${productId}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to purchase product');
            }

            return data;
        } catch (error) {
            console.error('Error purchasing product:', error);
            throw error;
        }
    }

    // Get product statistics (admin only)
    async getProductStats() {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/products/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch product stats');
            }

            return data;
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw error;
        }
    }
}

export default new ProductService();
