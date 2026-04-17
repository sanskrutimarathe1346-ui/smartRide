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
