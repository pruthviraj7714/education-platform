import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const isAuthenticated = !!sessionStorage.getItem('authToken'); // Replace with your auth check

    return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
