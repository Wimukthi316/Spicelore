import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";

const Registration = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "name") {
            // Allow only letters and spaces
            if (!/^[a-zA-Z\s]*$/.test(value)) {
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required.';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password is required.';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Registration successful!');
            setFormData({ name: '', email: '', password: '', confirmPassword: '' }); // Clear form
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/Registerbackground.jpg')" }}>
                <div className="bg-white/50 backdrop-blur-xs p-8 rounded-2xl shadow-lg w-full max-w-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                    <h2 className="text-2xl font-bold text-[#351108] mb-6 text-center">Create Your Account</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Enter your name"
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Enter your password"
                            />
                            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition-all"
                        >
                            Register
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#351108] hover:text-amber-900">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Registration;
