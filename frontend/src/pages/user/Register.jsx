import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import authService from '../../services/authService';

const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        phoneNumber: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "name") {
            // Allow only letters and spaces
            if (!/^[a-zA-Z\s]*$/.test(value)) {
                return;
            }
        }

        if (name === "phoneNumber") {
            // Allow only numbers, spaces, hyphens, and plus sign
            if (!/^[0-9\s\-+]*$/.test(value)) {
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

        if (!formData.address) {
            newErrors.address = 'Address is required.';
        } else if (formData.address.length < 10) {
            newErrors.address = 'Address must be at least 10 characters.';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required.';
        } else if (!/^[+]?[0-9\s-]{7,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Invalid phone number format. Must be 7-15 digits.';
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            setErrors({});
            setSuccessMessage('');

            try {
                const result = await authService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    address: formData.address,
                    phoneNumber: formData.phoneNumber
                });
                
                if (result.success) {
                    // Show success message
                    setSuccessMessage(result.message || 'Registration successful! Please login with your credentials.');
                    
                    // Clear form
                    setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        address: '',
                        phoneNumber: '',
                    });
                    
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        navigate('/login', { 
                            state: { message: 'Registration successful! Please login with your credentials.' }
                        });
                    }, 2000);
                } else {
                    setErrors({ general: result.message });
                }
            } catch (error) {
                console.error('Registration error:', error);
                setErrors({ general: 'Registration failed. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/Registerbackground.jpg')" }}>
                <div className="bg-white/50 backdrop-blur-xs p-8 rounded-2xl shadow-lg w-full max-w-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                    <h2 className="text-2xl font-bold text-[#351108] mb-6 text-center">Create Your Account</h2>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                            {errors.general}
                        </div>
                    )}

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

                        {/* Address Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] resize-none"
                                placeholder="Enter your full address"
                            />
                            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                        </div>

                        {/* Phone Number Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Enter your phone number"
                            />
                            {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
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
                            disabled={isLoading}
                            className="w-full bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
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
