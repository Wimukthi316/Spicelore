import { useState, useEffect, useRef } from "react";
import { FaBell, FaUserCircle, FaChevronDown } from "react-icons/fa";
import authService from "../../services/authService";

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef(null);

    // Get logged-in admin user data
    useEffect(() => {
        const userData = authService.getUser();
        if (userData) {
            setUser(userData);
        }
        setIsLoading(false);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle admin logout
    const handleLogout = () => {
        authService.logout();
        setIsDropdownOpen(false);
    };

    return (
        <div className="bg-
         p-6 shadow-md flex justify-end items-center">
            {/* Notifications */}
            <button className="relative mr-6">
                <FaBell className="w-6 h-6 text-gray-600 cursor-pointer" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">3</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <FaUserCircle className="w-8 h-8 text-gray-600" />
                    <span className="text-gray-800 font-medium">
                        {isLoading ? 'Loading...' : (user?.name || 'Admin User')}
                    </span>
                    <FaChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-gray-200">
                            <p className="text-gray-800 font-medium">
                                {isLoading ? 'Loading...' : (user?.name || 'Admin User')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {isLoading ? 'Loading...' : (user?.email || 'admin@example.com')}
                            </p>
                        </div>
                        <ul className="py-2">
                            <li>
                                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all">
                                    Profile
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all">
                                    Settings
                                </a>
                            </li>
                            <li>
                                <button 
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;