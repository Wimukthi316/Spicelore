import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import spicelogo from '../assets/spicelogo.png';
import { Link } from 'react-router-dom';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Shop', href: '/shop' },
    ];

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

               {/* Desktop Buttons */}
               <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
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
                    <div className="pt-5 border-t flex space-x-4">
                        <Link to="/login" className="flex-1 px-4 py-2 text-white bg-[#351108] hover:bg-amber-900 rounded-full text-center text-sm">Sign In</Link>
                        <Link to="/register" className="flex-1 px-4 py-2 text-[#351108] border border-[#351108] hover:bg-[#351108] hover:text-white rounded-full text-center text-sm">Sign Up</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
