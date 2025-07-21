import { useState, useEffect, useRef } from "react";
import { MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import shopService from "../../services/shopService";
import cartService from "../../services/cartService";

const Shop = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showCartIcon, setShowCartIcon] = useState(true);
    const footerRef = useRef(null);

    // Fetch products and categories on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch products from backend
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await shopService.getProducts({
                inStock: true, // Only show products that are in stock
                limit: 100 // Get more products for shop display
            });
            setProducts(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load products');
            console.error('Error fetching products:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search with backend
    const handleSearch = async (query) => {
        if (!query.trim()) {
            fetchProducts();
            return;
        }

        try {
            setIsLoading(true);
            const response = await shopService.searchProducts(query);
            setProducts(response.data || []);
        } catch (err) {
            setError(err.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle category filter with backend
    const handleCategoryFilter = async (category) => {
        try {
            setIsLoading(true);
            const response = await shopService.getProducts({
                category: category,
                inStock: true,
                search: searchQuery || undefined
            });
            setProducts(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to filter products');
        } finally {
            setIsLoading(false);
        }
    };

    // Update search query and trigger search
    const onSearchChange = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            handleSearch(query);
        } else {
            handleCategoryFilter(selectedCategory);
        }
    };

    // Update category and trigger filter
    const onCategoryChange = (category) => {
        setSelectedCategory(category);
        handleCategoryFilter(category);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (footerRef.current) {
                const footerTop = footerRef.current.getBoundingClientRect().top;
                setShowCartIcon(footerTop > window.innerHeight);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCartClick = () => {
        navigate("/cart");
    };

    const handleAddToCart = async (product) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to add items to cart');
                navigate('/login');
                return;
            }

            await cartService.addToCart(product._id, 1);
            alert(`${product.name} added to cart successfully!`);
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert(err.message || 'Failed to add to cart');
        }
    };

    return (
        <>
            <Navbar />
            
            {showCartIcon && (
                <div className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-50">
                    <div 
                        className="bg-white p-4 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                        onClick={handleCartClick}
                    >
                        <MdShoppingCart className="h-10 w-10 text-[#351108]" />
                    </div>
                </div>
            )}

            <section className="relative h-[60vh] flex items-center justify-center bg-[url('/src/assets/shop.jpg')] bg-cover bg-center pt-24">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative text-center text-white px-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Our Spice Collection</h1>
                    <p className="text-lg sm:text-xl mb-8">Explore Premium Spices From Around The World.</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
                    <input 
                        type="text" 
                        placeholder="Search spices..." 
                        className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#351108]" 
                        value={searchQuery} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                    />
                    <select 
                        className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#351108]" 
                        value={selectedCategory} 
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        <option value="powder">Powder</option>
                        <option value="whole">Whole</option>
                        <option value="blends">Blends</option>
                        <option value="organic">Organic</option>
                        <option value="exotic">Exotic</option>
                    </select>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#351108]"></div>
                        <span className="ml-2 text-gray-600">Loading products...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <ProductCard 
                                    key={product._id || product.id} 
                                    product={{
                                        ...product,
                                        image: product.images && product.images[0] ? product.images[0].url : '/src/assets/turmeric.jpg'
                                    }} 
                                    onAddToCart={handleAddToCart} 
                                />
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No spices found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div ref={footerRef}>
                <Footer />
            </div>
        </>
    );
};

export default Shop;
