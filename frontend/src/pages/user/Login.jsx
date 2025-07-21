import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import authService from '../../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Check if there's a success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from navigation state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
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

            try {
                const result = await authService.login(formData.email, formData.password);
                
                if (result.success) {
                    // Check user role and redirect accordingly
                    const userRole = result.user?.role || result.data?.role;
                    
                    if (userRole === 'admin') {
                        // Redirect admin to admin dashboard
                        navigate('/admin/users');
                    } else {
                        // Redirect regular users to home page
                        navigate('/');
                    }
                } else {
                    setErrors({ general: result.message });
                }
            } catch (error) {
                console.error('Login error:', error);
                setErrors({ general: 'Login failed. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/loginbackground.jpg')" }}>
                {/* Transparent Form Container */}
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md">
                    <h2 className="text-4xl font-bold text-[#351108] mb-6 text-center">Spice Up Your Journey!</h2>
                    <p className="text-center text-gray-700 mb-8">Log in to explore our rich flavors and bring the taste of tradition to your kitchen.</p>

                    {/* Success Message from Registration */}
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
                        {/* Email Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] bg-white/70"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] bg-white/70"
                                placeholder="Enter your password"
                            />
                            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-300" />
                        <span className="px-4 text-gray-700">or Log in with</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Google Login */}
                    <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 bg-white/70">
                        <img src="/src/assets/Google.png" alt="Google Logo" className="w-11 h-6" />
                    </button>

                    {/* Registration Link */}
                    <p className="text-center mt-6 text-gray-700">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#351108] hover:text-amber-900">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Login;