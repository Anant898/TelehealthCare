import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const patientStr = localStorage.getItem('patient');
  
  // Check if user is authenticated
  if (!token) {
    // Redirect to home/login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  // Determine user role - check both user and patient storage
  let userRole = 'patient'; // Default role for patients
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role || 'patient';
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  } else if (patientStr) {
    // Patient logged in
    userRole = 'patient';
  }
  
  // Check role-based access
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'doctor') {
        return <Navigate to="/doctor/dashboard" replace />;
      } else if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  
  return children;
};

export default ProtectedRoute;
