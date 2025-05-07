import React, {useState, createContext, useEffect} from "react";
import { api } from '../api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null);

    const getCSRFToken = () => {
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
        return csrfCookie ? csrfCookie.split('=')[1] : '';
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/api/v1/csrf_token/', {withCredentials: true});

                const response = await api.get('/api/v1/check_user/', {withCredentials: true});
                console.log(response.data.user)
                setUser(response.data.user);
                setError(null);
            } catch (err) {
                console.error('Ошибка выхода:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);


    const login = async (username, password) => {
        try {
            setIsLogin(true)
            await api.post( '/api/v1/login/', 
                { username, password },
                { withCredentials: true, headers: {
                    'X-CSRFToken': getCSRFToken(), // Функция для получения токена
                  },}
            );

            
            const userResponse = await api.get('/api/v1/check_user/', {
                withCredentials: true
            });

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
            await api.post(
              '/api/v1/logout/', 
              {}, 
              {
                withCredentials: true,
                headers: {
                  'X-CSRFToken': getCSRFToken(), // Функция для получения токена
                },
              }
            );
            setUser(null);
          } catch (err) {
            setError(err);
            console.error('Ошибка выхода:', err);
          }
    };

    const registration = async (username, phone, password1, password2) => {
        try {
            await api.post('/api/v1/register/', {
                username,
                phone,
                password1,
                password2
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': getCSRFToken(), // Функция для получения токена
                  },
            })

            const userResponse = await api.get('/api/v1/check_user/', {
                withCredentials: true
            });

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