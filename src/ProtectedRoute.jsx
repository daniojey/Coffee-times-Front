import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading , authChecked} = useContext(AuthContext);
    console.log(user)
    console.log(authChecked)

    if (loading) {
        return <div class='protected-loading-container'>Проверка авторизации...</div>;
    }

    if (!user && authChecked) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;