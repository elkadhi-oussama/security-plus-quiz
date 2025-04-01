import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is not an admin (checking both role and isAdmin for compatibility)
  if (!user.isAdmin && user.role !== 'admin') {
    console.log('User is not an admin:', user);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 