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
    const [rememberMe, setRememberMe] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    // Check if there's a success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from navigation state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Load saved credentials on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        const wasRemembered = localStorage.getItem('rememberMe') === 'true';

        if (wasRemembered && savedEmail && savedPassword) {
            setFormData({
                email: savedEmail,
                password: savedPassword,
            });
            setRememberMe(true);
        }
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle forgot password
    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            setErrors({ forgotPassword: 'Please enter your email address.' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
            setErrors({ forgotPassword: 'Please enter a valid email address.' });
            return;
        }

        setForgotPasswordLoading(true);
        setErrors({});

        try {
            const result = await authService.forgotPassword(forgotPasswordEmail);
            if (result.success) {
                setSuccessMessage('Password reset link has been sent to your email.');
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
            } else {
                setErrors({ forgotPassword: result.message || 'Failed to send reset email.' });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setErrors({ forgotPassword: 'Failed to send reset email. Please try again.' });
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address (e.g., user@example.com).';
        } else if (formData.email.length > 100) {
            newErrors.email = 'Email address is too long.';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
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
                    // Handle remember me functionality
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', formData.email);
                        localStorage.setItem('rememberedPassword', formData.password);
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberedEmail');
                        localStorage.removeItem('rememberedPassword');
                        localStorage.removeItem('rememberMe');
                    }

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
                        <div className="mb-4">
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

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-[#351108] focus:ring-[#351108] border-gray-300 rounded"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-[#351108] hover:text-amber-900"
                            >
                                Forgot password?
                            </button>
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

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-[#351108] mb-4">Reset Password</h3>
                        <p className="text-gray-600 mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                placeholder="Enter your email address"
                            />
                            {errors.forgotPassword && (
                                <p className="text-red-600 text-sm mt-1">{errors.forgotPassword}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordEmail('');
                                    setErrors({});
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={forgotPasswordLoading}
                                className="px-4 py-2 bg-[#351108] text-white rounded-lg hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Login;