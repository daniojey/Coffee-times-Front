import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, isLoading , authChecked} = useContext(AuthContext);

    if (isLoading) {
        return <div>Проверка авторизации...</div>;
    }

    if (!user && authChecked) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;