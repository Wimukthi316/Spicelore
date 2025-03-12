import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
    const navigate = useNavigate(); // Initialize useNavigate

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
                        onClick={() => navigate("/shop")} // Navigate to the Shop page
                        className="flex justify-center gap-2 items-center mx-auto shadow-xl text-lg backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
                    >
                        Shop Now
                        <svg
                            className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                            viewBox="0 0 16 19"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                                className="fill-gray-800 group-hover:fill-gray-800"
                            ></path>
                        </svg>
                    </button>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#351108] mb-12">
                        Featured Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
                        {/* Product Card 1 */}
                        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                            <img
                                src="/src/assets/turmeric.jpg"
                                alt="Turmeric"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#351108] mb-2">Turmeric Powder</h3>
                                <p className="text-gray-600 mb-4">
                                    Rich in flavor and health benefits.
                                </p>
                                <button className="bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition-all">
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Product Card 2 */}
                        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                            <img
                                src="/src/assets/cloves.jpg"
                                alt="Cloves"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#351108] mb-2">Cloves</h3>
                                <p className="text-gray-600 mb-4">
                                    Aromatic and perfect for curries.
                                </p>
                                <button className="bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition-all">
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Product Card 3 */}
                        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                            <img
                                src="/src/assets/cinnamon.jpg"
                                alt="Cinnamon"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#351108] mb-2">Cinnamon Sticks</h3>
                                <p className="text-gray-600 mb-4">
                                    Sweet and spicy, ideal for desserts.
                                </p>
                                <button className="bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition-all">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Parallax CTA Section */}
            <section
                className="relative h-[40vh] flex items-center justify-center bg-[url('/src/assets/parallaximage.jpg')] bg-cover bg-center bg-fixed"
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-50"></div>

                {/* Content */}
                <div className="relative text-center text-white px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Spice Up Your Kitchen?
                    </h2>
                    <p className="text-lg mb-8">
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