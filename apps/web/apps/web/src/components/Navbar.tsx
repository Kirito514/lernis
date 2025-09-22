'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduNFT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-7">
            <a 
              href="#how-it-works" 
              onClick={(e) => handleSmoothScroll(e, '#how-it-works')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleSmoothScroll(e, '#features')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => handleSmoothScroll(e, '#testimonials')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Testimonials
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleSmoothScroll(e, '#about')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              About
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleSmoothScroll(e, '#pricing')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Pricing
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleSmoothScroll(e, '#faq')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              FAQ
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleSmoothScroll(e, '#contact')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, '#how-it-works')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, '#features')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                Features
              </a>
              <a
                href="#testimonials"
                onClick={(e) => handleSmoothScroll(e, '#testimonials')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                Testimonials
              </a>
              <a
                href="#about"
                onClick={(e) => handleSmoothScroll(e, '#about')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                About
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, '#pricing')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={(e) => handleSmoothScroll(e, '#faq')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, '#contact')}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
              >
                Contact
              </a>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              <Link
                href="/auth/register"
                className="block mx-3 mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center text-xs font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
