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
