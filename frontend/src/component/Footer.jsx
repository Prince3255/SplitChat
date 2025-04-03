import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-50 text-green-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to={'/'}>
              <img src={logo} alt='SplithChat' className="h-15 w-20 mb-4 rounded mix-blend-multiply object-contain" />
            </Link>
            <p className="text-sm mt-2">
              SplitChat: The smart way to manage expenses and stay connected with friends.
              Split bills, track expenses, and chat all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/?tab=about" className="hover:text-green-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors">Pricing</a></li>
              <li><a href="/contact" className="hover:text-green-600 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media and Copyright */}
        <div className="mt-8 pt-8 border-t border-green-200 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
              <FaFacebookF className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
              <FaTwitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
              <FaInstagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
              <FaLinkedinIn className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
          <p className="text-sm text-green-700">
            &copy; {currentYear} SplitChat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};