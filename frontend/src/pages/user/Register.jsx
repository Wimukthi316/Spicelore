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
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
    });

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "name") {
            // Allow only letters and spaces, and limit length
            if (!/^[a-zA-Z\s]*$/.test(value)) {
                return;
            }
            if (value.length > 50) {
                return;
            }
        }

        if (name === "phoneNumber") {
            // Allow only numbers, spaces, hyphens, and plus sign, limit length
            if (!/^[0-9\s\-+]*$/.test(value)) {
                return;
            }
            if (value.length > 20) {
                return;
            }
        }

        if (name === "email") {
            // Limit email length
            if (value.length > 100) {
                return;
            }
        }

        if (name === "address") {
            // Limit address length
            if (value.length > 200) {
                return;
            }
        }

        // Update password strength when password changes
        if (name === "password") {
            setPasswordStrength({
                length: value.length >= 8,
                lowercase: /(?=.*[a-z])/.test(value),
                uppercase: /(?=.*[A-Z])/.test(value),
                number: /(?=.*\d)/.test(value),
                special: /(?=.*[@$!%*?&])/.test(value)
            });
        }

        setFormData({ ...formData, [name]: value });
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Full name is required.';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters long.';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Name cannot exceed 50 characters.';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            newErrors.name = 'Name can only contain letters and spaces.';
        } else if (formData.name.trim().split(' ').length < 2) {
            newErrors.name = 'Please enter your full name (first and last name).';
        }

        if (!formData.email) {
            newErrors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address (e.g., user@example.com).';
        } else if (formData.email.length > 100) {
            newErrors.email = 'Email address is too long (maximum 100 characters).';
        } else if (formData.email.includes('..')) {
            newErrors.email = 'Email address cannot contain consecutive dots.';
        }

        if (!formData.address) {
            newErrors.address = 'Address is required.';
        } else if (formData.address.length < 10) {
            newErrors.address = 'Address must be at least 10 characters long for a complete address.';
        } else if (formData.address.length > 200) {
            newErrors.address = 'Address cannot exceed 200 characters.';
        } else if (!/[a-zA-Z]/.test(formData.address)) {
            newErrors.address = 'Address must contain letters, not just numbers.';
        } else if (formData.address.trim().split(/\s+/).length < 3) {
            newErrors.address = 'Please provide a complete address (street, city, etc.).';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required.';
        } else if (formData.phoneNumber.replace(/[\s\-+]/g, '').length < 7) {
            newErrors.phoneNumber = 'Phone number must be at least 7 digits long.';
        } else if (formData.phoneNumber.replace(/[\s\-+]/g, '').length > 15) {
            newErrors.phoneNumber = 'Phone number cannot exceed 15 digits.';
        } else if (!/^[+]?[0-9\s-]{7,20}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number format. Use only numbers, spaces, hyphens, and + sign.';
        } else if (!/^\d/.test(formData.phoneNumber.replace(/[\s\-+]/g, ''))) {
            newErrors.phoneNumber = 'Phone number must start with a digit.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter.';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter.';
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number.';
        } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one special character (@$!%*?&).';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match. Please make sure both passwords are identical.';
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

            <div className="min-h-screen flex items-center justify-center bg-cover bg-center py-8" style={{ backgroundImage: "url('/src/assets/Registerbackground.jpg')" }}>
                <div className="bg-white/50 backdrop-blur-xs p-6 rounded-2xl shadow-lg w-full max-w-md mx-4 my-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                    <h2 className="text-2xl font-bold text-[#351108] mb-4 text-center">Create Your Account</h2>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-3 p-2 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name Field */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1 text-sm">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Enter your name"
                            />
                            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1 text-sm">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Address Field */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1 text-sm">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Enter your full address"
                            />
                            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                        </div>

                        {/* Phone Number Field */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1 text-sm">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Enter your phone number"
                            />
                            {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1 text-sm">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Enter your password"
                            />
                            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                            
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Password requirements:</p>
                                    <div className="space-y-1">
                                        <div className={`flex items-center text-xs ${passwordStrength.length ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="mr-1 text-xs">{passwordStrength.length ? '✓' : '✗'}</span>
                                            At least 8 characters
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordStrength.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="mr-1 text-xs">{passwordStrength.lowercase ? '✓' : '✗'}</span>
                                            One lowercase letter
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="mr-1 text-xs">{passwordStrength.uppercase ? '✓' : '✗'}</span>
                                            One uppercase letter
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordStrength.number ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="mr-1 text-xs">{passwordStrength.number ? '✓' : '✗'}</span>
                                            One number
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordStrength.special ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="mr-1 text-xs">{passwordStrength.special ? '✓' : '✗'}</span>
                                            One special character (@$!%*?&)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1 text-sm">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] text-sm"
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-4 text-sm">
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
