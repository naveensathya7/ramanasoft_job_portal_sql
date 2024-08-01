import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login/admin" />;
};

export default PrivateRoute;
