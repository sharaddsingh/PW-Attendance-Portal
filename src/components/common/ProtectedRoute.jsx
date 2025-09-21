// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireProfile = true, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Or a spinner component

  // Redirect if not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if profile is required but incomplete
  if (requireProfile && user && !user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Redirect if role not allowed
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // All good, render the children
  return children;
};

export default ProtectedRoute;
