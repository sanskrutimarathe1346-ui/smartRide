import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBus, FaUser, FaSignOutAlt, FaHome, FaTicketAlt, FaIdCard, FaMapMarkedAlt } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FaBus className="text-2xl" />
            <span className="font-display font-bold text-xl">SmartRide PMPML</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-accent-300 transition flex items-center gap-2">
              <FaHome /> Home
            </Link>
            <Link to="/tracking" className="hover:text-accent-300 transition flex items-center gap-2">
              <FaMapMarkedAlt /> Live Tracking
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-accent-300 transition">Dashboard</Link>
                <Link to="/book-ticket" className="hover:text-accent-300 transition flex items-center gap-2">
                  <FaTicketAlt /> Book Ticket
                </Link>
                <Link to="/buy-pass" className="hover:text-accent-300 transition flex items-center gap-2">
                  <FaIdCard /> Buy Pass
                </Link>
                <Link to="/profile" className="hover:text-accent-300 transition flex items-center gap-2">
                  <FaUser /> {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-accent flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent-300 transition">Login</Link>
                <Link to="/register" className="btn-accent px-6 py-2">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
