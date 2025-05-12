import axios from "axios";

// В .env файле укажите адрес вашего API
export const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

const getCSRFTokenFromCookie = () => {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

    console.log(cookieValue)

    return cookieValue ? decodeURIComponent(cookieValue) : '';
};

// Перехватчик для автоматического обновления CSRF
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFTokenFromCookie();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  console.log(config)
  return config;
});

// Функция получения токена
export const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/api/v1/csrf_token/');
    const newToken = response.headers['x-csrftoken'];
    if (newToken) {
      document.cookie = `csrftoken=${newToken}; Path=/; Secure; SameSite=None`;
    }

    console.log('NEW TOKEN', newToken)
    return newToken;
  } catch (error) {
    console.error('CSRF token fetch failed:', error);
    return null;
  }
};



export const s3Api = axios.create({
    baseURL: import.meta.env.VITE_REACT_S3_BUCKET_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
