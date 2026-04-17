import React from 'react';
import { Link } from 'react-router-dom';

const MyPasses = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-4">MyPasses</h1>
        <p className="text-gray-600 mb-6">This feature is under development</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyPasses;
