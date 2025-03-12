import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Login successful!');
            setFormData({ email: '', password: '' }); // Clear form
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/path/to/background.jpg')" }}>
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold text-[#351108] mb-6 text-center">Spice Up Your Journey!</h2>
                    <p className="text-center text-gray-600 mb-8">Log in to explore our rich flavors and bring the taste of tradition to your kitchen.</p>

                    <form onSubmit={handleSubmit}>
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
                        <div className="mb-6">
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition-all"
                        >
                            Login
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-300" />
                        <span className="px-4 text-gray-600">or Log in with</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Google Login */}
                    <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-100">
                        <img src="/src/assets/Google.png" alt="Google Logo" className="w-11 h-6" />
                    </button>

                    {/* Registration Link */}
                    <p className="text-center mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#351108] hover:text-amber-900">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Login;
