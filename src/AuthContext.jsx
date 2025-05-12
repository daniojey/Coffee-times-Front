import React, {useState, createContext, useEffect} from "react";
import { api } from '../api.js';

import { fetchCSRFToken } from "../api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // const getCSRFTokenFromCookie = () => {
    //     const cookieValue = document.cookie
    //         .split('; ')
    //         .find(row => row.startsWith('csrftoken='))
    //         ?.split('=')[1];

    //     console.log(cookieValue)

    //     return cookieValue ? decodeURIComponent(cookieValue) : '';
    // };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Получаем токен при инициализации
                await fetchCSRFToken();

                const response = await api.get('/api/v1/check_user/');
                console.log(response.data.user)
                setUser(response.data.user);
                setError(null);

                if (response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }

            } catch (err) {
                console.error('Ошибка выхода:', err);
                setError(err);
                localStorage.removeItem('user');
                setAuthChecked(false);
            } finally {
                setLoading(false);
                setAuthChecked(true);
            }
        }

        checkAuth();
    }, []);


    const login = async (username, password) => {
        try {
            setIsLogin(true)
            await api.post( '/api/v1/login/', 
                { username, password },
            );

            
            const userResponse = await api.get('/api/v1/check_user/');

            setUser(userResponse.data.user);
            return true

        } catch (err) {
            console.error('Ошибка выхода:', err);
            setError(err);
            return false
        } finally {
            setIsLogin(false)
        }
    };


    const logout = async () => {
        try {

            // 2. Отправляем запрос на выход
            await api.post(
            '/api/v1/logout/', 
            {}, 
            );

            // 3. Очищаем данные клиента
            setUser(null);
            localStorage.removeItem('user');
            
            // 4. Обновляем CSRF токен
           await fetchCSRFToken();

            window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err.response?.data || err);
        }
    };

    const registration = async (username, phone, password1, password2) => {
        try {
            await api.post('/api/v1/register/', {
                username,
                phone,
                password1,
                password2
            },)

            const userResponse = await api.get('/api/v1/check_user/');

            setUser(userResponse.data.user);
            return true
            
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            setError(err);
            return false
        } finally {
            setIsLogin(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, registration, logout, isLogin, error }}>
            {loading ? <div className="Loading-container">Loading...</div> : children}
        </AuthContext.Provider>
    );
};