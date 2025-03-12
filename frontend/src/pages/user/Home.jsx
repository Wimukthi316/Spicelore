import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import { useState } from "react";

// Sample Product Data (You should replace this with actual data from API or Context)
const sampleProducts = [
    {
        id: 1,
        name: "Turmeric Powder",
        description: "Fresh organic turmeric powder from India.",
        price: 10.99,
        image: "/src/assets/turmeric.jpg",
    },
    {
        id: 2,
        name: "Cinnamon Sticks",
        description: "Aromatic cinnamon sticks from Sri Lanka.",
        price: 12.99,
        image: "/src/assets/cinnamon.jpg",
    },
    {
        id: 3,
        name: "Black Pepper",
        description: "Premium black pepper with strong aroma.",
        price: 8.99,
        image: "/src/assets/black_pepper.jpg",
    },
];

const Home = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [filteredProducts] = useState(sampleProducts);

    // Handle add to cart function (replace this with actual cart logic)
    const handleAddToCart = (product) => {
        console.log(`Added to cart: ${product.name}`);
    };

    return (
        <>
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center bg-[url('/src/assets/hero.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative text-center text-white px-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        Discover the Essence of Flavor
                    </h1>
                    <p className="text-lg sm:text-xl mb-8">
                        Premium spices from around the world, delivered to your kitchen.
                    </p>
                    <button
                        onClick={() => navigate("/shop")}
                        className="flex justify-center gap-2 items-center mx-auto shadow-xl text-lg backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group cursor-pointer"
                    >
                        Shop Now
                    </button>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white px-4 sm:px-6 lg:px-16">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.slice(0, 3).map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            </section>

            {/* Parallax CTA Section */}
            <section
                className="relative h-[40vh] flex items-center justify-center bg-[url('/src/assets/parallaximage.jpg')] bg-cover bg-center bg-fixed px-4"
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-50"></div>

                {/* Content */}
                <div className="relative text-center text-white px-6 sm:px-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                        Ready to Spice Up Your Kitchen?
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl">
                        Join the Spicelore family and explore our premium collection today.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </>
    );
};

export default Home;