import { useState, useEffect, useRef } from "react";
import { MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard"; // Import ProductCard

const Shop = () => {
    const navigate = useNavigate();
    const [products] = useState([
        { id: 1, name: "Turmeric Powder", price: 12.99, description: "Rich in flavor and health benefits.", image: "/src/assets/turmeric.jpg", category: "powder" },
        { id: 2, name: "Cloves", price: 8.99, description: "Aromatic and perfect for curries.", image: "/src/assets/cloves.jpg", category: "whole" },
        { id: 3, name: "Cinnamon Sticks", price: 10.99, description: "Sweet and spicy, ideal for desserts.", image: "/src/assets/cinnamon.jpg", category: "whole" },
        { id: 4, name: "Black Pepper", price: 9.99, description: "Bold and pungent, perfect for seasoning.", image: "/src/assets/black pepper.jpg", category: "whole" },
        { id: 5, name: "Cardamom Pods", price: 14.99, description: "Fragrant and sweet, great for tea and desserts.", image: "/src/assets/Cardamon.jpg", category: "whole" },
        { id: 6, name: "Chili Powder", price: 7.99, description: "Spicy and vibrant, adds heat to any dish.", image: "/src/assets/chili-powder.jpg", category: "powder" },
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showCartIcon, setShowCartIcon] = useState(true);
    const footerRef = useRef(null);

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

    const handleAddToCart = (product) => {
        console.log("Added to cart:", product);
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                    <input type="text" placeholder="Search spices..." className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#351108]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#351108]" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="powder">Powder</option>
                        <option value="whole">Whole</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No spices found matching your criteria.</p>
                    </div>
                )}
            </div>

            <div ref={footerRef}>
                <Footer />
            </div>
        </>
    );
};

export default Shop;
