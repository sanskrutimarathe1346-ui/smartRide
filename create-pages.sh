#!/bin/bash

# This script creates all remaining frontend page files for SmartRide PMPML
# Run this after extracting the project

cd "$(dirname "$0")/frontend/src/pages"

echo "Creating Login page..."
cat > Login.js << 'EOF'
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-8">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field pl-10" placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-gray-400" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field pl-10" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="mt-6 text-center text-gray-600">Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;
EOF

echo "Creating Register page..."
cat > Register.js << 'EOF'
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-8">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input type="tel" pattern="[0-9]{10}" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="9876543210" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Creating Account...' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-gray-600">Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;
EOF

echo "Creating Dashboard page..."
cat > Dashboard.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ticketAPI, passAPI } from '../services/api';
import { FaTicketAlt, FaIdCard, FaMapMarkedAlt, FaComments } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState([]);
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ticketsRes, passRes] = await Promise.all([
        ticketAPI.getMyTickets({ limit: 5 }),
        passAPI.getActivePass().catch(() => ({ data: { pass: null } }))
      ]);
      setRecentTickets(ticketsRes.data.tickets);
      setActivePass(passRes.data.pass);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Book Ticket', icon: <FaTicketAlt />, link: '/book-ticket', color: 'bg-blue-500' },
    { title: 'Buy Pass', icon: <FaIdCard />, link: '/buy-pass', color: 'bg-green-500' },
    { title: 'Live Tracking', icon: <FaMapMarkedAlt />, link: '/tracking', color: 'bg-purple-500' },
    { title: 'Feedback', icon: <FaComments />, link: '/feedback', color: 'bg-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-gray-600 mb-8">Manage your bus travel efficiently</p>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link} className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col items-center justify-center text-center`}>
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="font-semibold text-lg">{action.title}</h3>
          </Link>
        ))}
      </div>
      {activePass && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Active Pass</h2>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <p className="text-sm opacity-90">Pass Number</p>
            <p className="text-2xl font-bold mb-2">{activePass.passNumber}</p>
            <p className="text-sm">Valid until: {new Date(activePass.validUntil).toLocaleDateString()}</p>
            <Link to="/my-passes" className="mt-4 inline-block bg-white text-green-600 px-4 py-2 rounded-lg font-medium">View Details</Link>
          </div>
        </div>
      )}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentTickets.length > 0 ? (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{ticket.fromStop} → {ticket.toStop}</p>
                  <p className="text-sm text-gray-600">{ticket.ticketNumber}</p>
                </div>
                <span className={`badge ${ticket.status === 'booked' ? 'badge-success' : ticket.status === 'used' ? 'badge-info' : 'badge-danger'}`}>{ticket.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No tickets found. <Link to="/book-ticket" className="text-primary-600">Book your first ticket!</Link></p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
EOF

echo "Creating placeholder pages..."
for page in BookTicket MyTickets BuyPass MyPasses LiveTracking Feedback Profile; do
  cat > ${page}.js << EOF
import React from 'react';
import { Link } from 'react-router-dom';

const ${page} = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-4">${page}</h1>
        <p className="text-gray-600 mb-6">This feature is under development</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ${page};
EOF
done

# Create admin dashboard
mkdir -p admin
cat > admin/AdminDashboard.js << 'EOF'
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-xl mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600">1,234</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-xl mb-2">Active Buses</h3>
          <p className="text-3xl font-bold text-green-600">87</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-xl mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">₹45,678</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
EOF

echo "✅ All frontend pages created successfully!"
echo "You can now run: npm start"
