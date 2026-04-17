import React from 'react';
import { FaBus, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaBus className="text-primary-400 text-2xl" />
              <span className="font-display font-bold text-xl text-white">SmartRide PMPML</span>
            </div>
            <p className="text-sm">Digital transformation of Pune's public bus transportation system.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/tracking" className="hover:text-primary-400">Live Tracking</a></li>
              <li><a href="/book-ticket" className="hover:text-primary-400">Book Ticket</a></li>
              <li><a href="/buy-pass" className="hover:text-primary-400">Buy Pass</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/feedback" className="hover:text-primary-400">Feedback</a></li>
              <li><a href="#" className="hover:text-primary-400">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-400">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">Connect</h3>
            <div className="flex space-x-4">
              <FaFacebook className="text-2xl hover:text-primary-400 cursor-pointer" />
              <FaTwitter className="text-2xl hover:text-primary-400 cursor-pointer" />
              <FaInstagram className="text-2xl hover:text-primary-400 cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025-2026 SmartRide PMPML. Academic Project - DIT Pune.</p>
          <p className="mt-1">Team: Sanskruti Marathe, Abhijeet Gaikar, Yuvraj Pardeshi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
