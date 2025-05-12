import axios from "axios";

// В .env файле укажите адрес вашего API
const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})


// Функция получения токена
const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/api/v1/csrf_token/');
    return response.headers['x-csrftoken'];
  } catch (error) {
    console.error('CSRF fetch error:', error);
    return null;
  }
};


// Перехватчик для автоматического обновления CSRF
api.interceptors.request.use((config) => {
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        if (token) config.headers['X-CSRFToken'] = decodeURIComponent(token);
    }
    return config;
});


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Если ошибка 403 и это не запрос на обновление токена
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // Помечаем запрос как повторный
      
      // Обновляем токен
      const newToken = await fetchCSRFToken();
      if (newToken) {
        // Обновляем заголовок для повторного запроса
        originalRequest.headers['X-CSRFToken'] = newToken;
        return api(originalRequest); // Повторяем исходный запрос
      }
    }
    
    return Promise.reject(error);
  }
);



const s3Api = axios.create({
    baseURL: import.meta.env.VITE_REACT_S3_BUCKET_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})


export { api, s3Api, fetchCSRFToken };