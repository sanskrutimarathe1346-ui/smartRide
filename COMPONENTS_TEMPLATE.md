# SmartRide PMPML - Frontend Components Template

This file contains all the React component code. Create these files in your frontend/src directory.

## Component Files to Create

### 1. components/Navbar.js
```jsx
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
```

### 2. components/Footer.js
```jsx
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
```

### 3. components/PrivateRoute.js
```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
```

### 4. components/Loading.js
```jsx
import React from 'react';
import { FaBus } from 'react-icons/fa';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FaBus className="text-6xl text-primary-600 animate-bounce" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default Loading;
```

### 5. components/QRCodeDisplay.js
```jsx
import React from 'react';
import QRCode from 'qrcode.react';
import { FaDownload } from 'react-icons/fa';

const QRCodeDisplay = ({ value, title, subtitle }) => {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${title}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="qr-container">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      
      <QRCode
        id="qr-code"
        value={value}
        size={256}
        level="H"
        includeMargin={true}
      />
      
      <button
        onClick={downloadQR}
        className="mt-4 btn-primary flex items-center gap-2"
      >
        <FaDownload /> Download QR Code
      </button>
    </div>
  );
};

export default QRCodeDisplay;
```

---

## Page Files to Create

### 6. pages/Home.js
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaQrcode, FaMapMarkedAlt, FaClock, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaQrcode className="text-4xl" />,
      title: 'QR-Based Ticketing',
      description: 'Book tickets online and get instant QR codes. No more waiting in queues!'
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: 'Live Bus Tracking',
      description: 'Track your bus in real-time on the map. Know exactly when it will arrive.'
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: 'Daily & Monthly Passes',
      description: 'Purchase passes online with special discounts for students and seniors.'
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: 'Secure Payments',
      description: 'Integrated with Razorpay for safe and secure digital payments.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaBus className="text-6xl mx-auto mb-6 animate-bounce-slow" />
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
            SmartRide PMPML
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Your Digital Companion for Pune City Buses
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-accent px-8 py-4 text-lg">
              Get Started
            </Link>
            <Link to="/tracking" className="bg-white text-primary-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100">
              Track Live Buses
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Why Choose SmartRide?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:scale-105 transition-transform">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">250+</div>
              <div className="text-primary-200">Active Buses</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-primary-200">Routes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-200">Daily Passengers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-200">Service Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to Experience Smart Travel?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of commuters who travel smartly with SmartRide PMPML
          </p>
          <Link to="/register" className="btn-primary px-10 py-4 text-lg inline-block">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
```

