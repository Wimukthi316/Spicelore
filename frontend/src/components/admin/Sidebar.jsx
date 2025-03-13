import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBox, FaShoppingCart, FaUsers, FaUser, FaChartLine, FaTimes, FaSignOutAlt, FaBoxOpen } from "react-icons/fa";

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation(); // Get the current route

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to determine if the link is active
    const isActive = (path) =>
        location.pathname === path ? "bg-white text-black font-bold" : "text-black";

    return (
        <>
            {/* Sidebar Toggle Button (Mobile) */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                    />
                </svg>
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-[#8f8988] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 z-40 flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6">
                    <h1 className="text-2xl font-bold ml-8 text-black">Dashboard</h1>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-400 hover:text-black"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <ul className="space-y-6">
                            <li>
                                <Link to="/admin/users" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/users")}`}>
                                    <FaUser className={`w-5 h-5 mr-3 ${isActive("/admin/users")}`} />
                                    <span>User Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/employee" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/employee")}`}>
                                    <FaUsers className={`w-5 h-5 mr-3 ${isActive("/admin/employee")}`} />
                                    <span>Employee Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/products" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/products")}`}>
                                    <FaBox className={`w-5 h-5 mr-3 ${isActive("/admin/products")}`} />
                                    <span>Product Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/orders" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/orders")}`}>
                                    <FaShoppingCart className={`w-5 h-5 mr-3 ${isActive("/admin/orders")}`} />
                                    <span>Order Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/inventory" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/inventory")}`}>
                                    <FaBoxOpen className={`w-5 h-5 mr-3 ${isActive("/admin/inventory")}`} />
                                    <span>Inventory Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/sales" className={`flex items-center p-3 rounded-lg hover:bg-white hover:text-black transition-all ${isActive("/admin/sales")}`}>
                                    <FaChartLine className={`w-5 h-5 mr-3 ${isActive("/admin/sales")}`} />
                                    <span>Sales Management</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Log Out Section */}
                    <div className="p-2">
                        <Link to="/logout" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-black transition-all text-black">
                            <FaSignOutAlt className="w-5 h-5 mr-3" />
                            <span>Log Out</span>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                ></div>
            )}
        </>
    );
};

export default Sidebar;
