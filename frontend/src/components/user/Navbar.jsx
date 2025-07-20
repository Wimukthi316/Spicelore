import { useState, useEffect } from 'react';
import { HiMenu, HiX, HiUser, HiLogout } from 'react-icons/hi';
import spicelogo from "../../assets/Spicelogo.png";
import { Link } from 'react-router-dom';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Shop', href: '/shop' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setIsUserMenuOpen(false);
        window.location.href = '/';
    };

    return (
        <nav className="bg-white/80 backdrop-blur-xs shadow-lg sticky top-4 z-50 rounded-3xl mx-6 px-6 py-3">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <img src={spicelogo} alt="Spicelore" className="h-14 w-auto" />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex text-lg font-medium items-center space-x-8 lg:space-x-12">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-[#351108] hover:text-amber-900 relative group transition-all"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#351108] transition-all group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

               {/* Desktop Buttons/User Menu */}
               <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                    {isLoggedIn && user ? (
                        <div className="relative">
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center space-x-3 px-4 py-2 text-[#351108] hover:bg-amber-50 rounded-lg transition-all duration-200 border border-transparent hover:border-amber-200"
                            >
                                <img
                                    src={user.avatar ? `http://localhost:5000/uploads/avatars/${user.avatar}` : '/default-avatar.svg'}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border-2 border-amber-200"
                                />
                                <span className="font-medium text-gray-700 hidden sm:block">{user.name}</span>
                                <svg 
                                    className="w-4 h-4 text-gray-500 transition-transform duration-200" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-amber-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={user.avatar ? `http://localhost:5000/uploads/avatars/${user.avatar}` : '/default-avatar.svg'}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <Link 
                                            to="/profile" 
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors duration-200"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <HiUser className="mr-3 w-4 h-4 text-amber-600" />
                                            My Profile
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                        >
                                            <HiLogout className="mr-3 w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="w-28 lg:w-32 px-5 py-2 text-white bg-[#351108] hover:bg-amber-900 transition-all rounded-full text-center flex justify-center"
                            >
                                Sign In
                            </Link>

                            <Link 
                                to="/register" 
                                className="w-28 lg:w-32 px-5 py-2 text-[#351108] border border-[#351108] hover:bg-[#351108] hover:text-white transition-all rounded-full text-center flex justify-center"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-600 hover:text-amber-900"
                    >
                        {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white/80 backdrop-blur-lg border-t rounded-3xl shadow-lg p-4 mt-2">
                    <div className="space-y-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="block px-4 py-2 text-gray-700 hover:bg-amber-50 rounded-md"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                    
                    {isLoggedIn && user ? (
                        <div className="pt-4 border-t border-amber-200">
                            <div className="bg-amber-50 rounded-lg p-4 mb-3 border border-amber-200">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.avatar ? `http://localhost:5000/uploads/avatars/${user.avatar}` : '/default-avatar.svg'}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Link 
                                    to="/profile" 
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <HiUser className="mr-3 w-5 h-5 text-amber-600" />
                                    My Profile
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                    <HiLogout className="mr-3 w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-5 border-t flex space-x-4">
                            <Link to="/login" className="flex-1 px-4 py-2 text-white bg-[#351108] hover:bg-amber-900 rounded-full text-center text-sm">Sign In</Link>
                            <Link to="/register" className="flex-1 px-4 py-2 text-[#351108] border border-[#351108] hover:bg-[#351108] hover:text-white rounded-full text-center text-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
