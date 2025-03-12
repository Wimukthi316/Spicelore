import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="text-center opacity-90 max-w-8xl mx-auto p-6 relative font-montserrat">
            {/* Large Devion Text with Image Mask */}
            <div className="relative mt-0.5">
                <h1
                    className="text-[15vw] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-200"
                    style={{
                        backgroundImage: "url(/src/assets/loginbackground.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    Spicelore
                </h1>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mt-6 text-sm sm:text-base md:text-lg px-4 sm:px-8 md:px-12 max-w-4xl mx-auto">
                Explore the World of Spices and Uncover Exotic Flavors. Let Spicelore Bring the Essence of Global Cuisines to Your Kitchen.
            </p>

            <div className="mt-16 px-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                {/* Social Media Icons */}
                <div className="w-full sm:w-1/2 flex justify-center sm:justify-start items-center gap-6">
                    <a href="#" className="text-black hover:text-gray-800"><FaFacebookF size={24} /></a>
                    <a href="#" className="text-black hover:text-gray-800"><FaInstagram size={24} /></a>
                    <a href="#" className="text-black hover:text-gray-800"><FaTwitter size={24} /></a>
                    <a href="#" className="text-black hover:text-gray-800"><FaLinkedinIn size={24} /></a>
                </div>

                {/* Right Section (Button & Text) */}
                <div className="w-full sm:w-1/2 flex flex-col sm:flex-row sm:justify-end items-center gap-6 sm:gap-20 mt-6 sm:mt-0">
                    <h3 className="text-black text-lg sm:text-xl font-semibold text-center sm:text-left">
                        Elevate Your Culinary Creations <br /> with Spices That Inspire <span className="text-gray-500">Every Dish</span>
                    </h3>
                    <Link to="/contact">
                        <button className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-base hover:bg-gray-800 cursor-pointer whitespace-nowrap">
                            Contact Us
                        </button>
                    </Link>
                </div>
            </div>

            <div className="mt-12 border-t border-gray-400 px-6 sm:px-10 pt-6 text-gray-600 text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <Link to="/" className="text-black">Home</Link>
                    <Link to="/about" className="text-black">About Us</Link>
                    <Link to="/contact" className="text-black">Contact Us</Link>
                    <Link to="/shop" className="text-black">Shop</Link>
                </div>
                <p className="text-black text-center sm:text-left">
                    © 2025 Spicelore. All Rights Reserved. Wimukthi Gunarathna.
                </p>
            </div>
        </div>
    );
};

export default Footer;