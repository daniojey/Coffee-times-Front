import React, { useState, createContext, useEffect } from "react";
import { api } from '../api.js';
import { verifyToken } from "../tokens_func.js";

import { fetchCSRFToken } from "../api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [auth, setAuth] = useState({
        accessToken: null,
    }
    )

    const getCSRFTokenFromCookie = () => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        // console.log(cookieValue)

        // console.log(document.cookie)
        return cookieValue ? decodeURIComponent(cookieValue) : '';
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const accessTokenSorage = localStorage.getItem('accessToken');

                if (accessTokenSorage) {
                    setAuth({
                        accessToken: accessTokenSorage,
                    })
                }

                // Получаем токен при инициализации
                await fetchCSRFToken();
                
                const response = await verifyToken(accessTokenSorage)
                
                console.log('RESPONSE VERIFY', response)
                setError(null);

                if (response?.user) {
                    setUser(response?.user);
                    localStorage.setItem('user', JSON.stringify(response?.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }

            } catch (err) {
                console.error('Ошибка выхода:', err);
                setError(err);
                setUser(null)
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
            const response = await api.post('/api/v1/token/',
                { username, password },
                {
                    withCredentials: true, headers: {
                        'X-CSRFToken': getCSRFTokenFromCookie(), // Функция для получения токена
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log("COOKIES",document.cookie)
            // console.log(response.data.access)

            localStorage.setItem('accessToken', response.data.access);
            setAuth({
                accessToken: response.data.access,
            })

            const userResponse = await api.post('/api/v1/token/verify/', {
                withCredentials: true,
                // headers: {
                //     "Authorization": `Bearer ${response.data.access}`
                // },
                token: response.data.access,
            });


            setUser(userResponse.data.user);
            setError(null)
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
        // try {
        //     await fetchCSRFToken()

        //     // 2. Отправляем запрос на выход
        //     await api.post(
        //         '/api/v1/logout/',
        //         {},
        //         {
        //             withCredentials: true,
        //             headers: {
        //                 'X-CSRFToken': getCSRFTokenFromCookie(),
        //             },
        //         }
        //     );

        //     // 3. Очищаем данные клиента
        //     setUser(null);
        //     localStorage.removeItem('user');

        //     // 4. Обновляем CSRF токен
        //     await fetchCSRFToken()

        //     window.location.href = '/';
        // } catch (err) {
        //     console.error('Logout error:', err.response?.data || err);
        // }
        localStorage.removeItem('accessToken');
        setAuth({
            accessToken: null,
        })
        setUser(null)
        window.location.href = '/'
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
                    'X-CSRFToken': getCSRFTokenFromCookie(), // Функция для получения токена
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
        <AuthContext.Provider value={{ user, loading, login, registration, logout, isLogin, error, authChecked}}>
            {loading ? <div className="Loading-container">Loading...</div> : children}
        </AuthContext.Provider>
    );
};

