// Shop Service - For user-facing product operations
const API_BASE_URL = 'http://localhost:5000/api';

const shopService = {
  // Get all products for shop (public endpoint)
  getProducts: async (filters = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.append('search', filters.search);
      if (filters.category && filters.category !== 'all') searchParams.append('category', filters.category);
      if (filters.minPrice) searchParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) searchParams.append('maxPrice', filters.maxPrice);
      if (filters.minRating) searchParams.append('minRating', filters.minRating);
      if (filters.inStock) searchParams.append('inStock', 'true');
      if (filters.page) searchParams.append('page', filters.page);
      if (filters.limit) searchParams.append('limit', filters.limit);

      const response = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  },

  // Get single product details (public endpoint)
  getProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(error.message || 'Failed to fetch product details');
    }
  },

  // Get featured products for homepage
  getFeaturedProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error(error.message || 'Failed to fetch featured products');
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Search products
  searchProducts: async (searchQuery) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(error.message || 'Failed to search products');
    }
  },

  // Purchase product (authenticated endpoint)
  purchaseProduct: async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error purchasing product:', error);
      throw new Error(error.message || 'Failed to purchase product');
    }
  },

  // Add product review (authenticated endpoint)
  addReview: async (productId, reviewData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error(error.message || 'Failed to add review');
    }
  }
};

export default shopService;
