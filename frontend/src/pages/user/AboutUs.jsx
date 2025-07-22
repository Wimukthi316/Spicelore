import React from 'react';
import spicesImage from '../../assets/Story.jpg'; // Image for Our Story
import missionImage from '../../assets/Mission.png'; // Image for Our Mission
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import { FaPepperHot, FaHeartbeat, FaGlobeAmericas } from "react-icons/fa";

const AboutUs = () => {
    return (
        <>
            <Navbar />
            <div className="font-kulim bg-white">
                {/* Hero Section */}
                <div className="text-[#351108] py-20">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <h1 className="text-5xl sm:text-6xl font-bold mb-3">About Us</h1>
                        <p className="text-lg max-w-2xl mx-auto">
                            Discover the story behind Spicelore and our passion for bringing the world's finest spices to your kitchen.
                        </p>
                    </div>
                </div>

                {/* Our Expertise Section */}
                <div className="bg-white py-10">
                    <div className="max-w-7xl mx-auto px-6 text-center">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Professionals Count */}
                            <div className="p-8 bg-[#484240] text-[#ffffff] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <h3 className="text-6xl font-bold">50+</h3>
                                <p className="text-lg mt-2">Skilled Professionals</p>
                            </div>

                            {/* Spices Variety */}
                            <div className="p-8 bg-[#484240] text-[#ffffff] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <h3 className="text-6xl font-bold">100+</h3>
                                <p className="text-lg mt-2">Varieties of Spices</p>
                            </div>

                            {/* Global Customers */}
                            <div className="p-8 bg-[#484240] text-[#ffffff] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <h3 className="text-6xl font-bold">10K+</h3>
                                <p className="text-lg mt-2">Satisfied Customers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="bg-[#f8f8f8] py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {/* Image */}
                            <div className="order-1">
                                <img src={spicesImage} alt="Our Story" className="w-full h-96 object-cover rounded-lg shadow-lg" />
                            </div>

                            {/* Text Content */}
                            <div className="order-2">
                                <h2 className="text-4xl sm:text-5xl font-bold text-[#351108] mb-6">Our Story</h2>
                                <p className="text-lg text-[#351108] leading-relaxed">
                                    Spicelore was founded in 2020 with a simple mission: to bring the world's finest spices to your kitchen.
                                    Our journey began in a small kitchen, where we experimented with flavors from around the globe.
                                    Today, we are proud to offer a curated selection of premium spices that inspire creativity and elevate every dish.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Mission Section */}
                <div className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {/* Text Content */}
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl sm:text-5xl font-bold text-[#351108] mb-6">Our Mission</h2>
                                <p className="text-lg text-[#351108] leading-relaxed">
                                    At Spicelore, we are committed to sourcing the highest quality spices while supporting sustainable farming practices.
                                    We believe that every spice tells a story, and we are dedicated to sharing these stories with you.
                                </p>
                            </div>

                            {/* Image */}
                            <div className="order-1 md:order-2">
                                <img src={missionImage} alt="Our Mission" className="w-full h-96 object-cover rounded-lg shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fun Facts Section */}
                <div className="bg-[#f8f8f8] py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl sm:text-5xl font-bold text-[#351108] text-center mb-16">Did You Know?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1: Spice Origins */}
                            <div className="bg-[#484240] p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaPepperHot className="text-4xl text-[#ffffff]" />
                                    <h3 className="text-2xl font-semibold text-[#ffffff]">Spice Origins</h3>
                                </div>
                                <p className="text-[#ffffff] leading-relaxed">
                                    Did you know that black pepper, known as the "king of spices," was once so valuable that it was used as currency?
                                </p>
                            </div>

                            {/* Card 2: Health Benefits */}
                            <div className="bg-[#484240] p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaHeartbeat className="text-4xl text-[#ffffff]" />
                                    <h3 className="text-2xl font-semibold text-[#ffffff]">Health Benefits</h3>
                                </div>
                                <p className="text-[#ffffff] leading-relaxed">
                                    Many spices, like turmeric and cinnamon, have powerful anti-inflammatory and antioxidant properties.
                                </p>
                            </div>

                            {/* Card 3: Global Influence */}
                            <div className="bg-[#484240] p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaGlobeAmericas className="text-4xl text-[#ffffff]" />
                                    <h3 className="text-2xl font-semibold text-[#ffffff]">Global Influence</h3>
                                </div>
                                <p className="text-[#ffffff] leading-relaxed">
                                    Spices have shaped world history, leading to the discovery of new lands and the establishment of trade routes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutUs;