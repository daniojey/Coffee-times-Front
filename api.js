import axios from "axios";

// В .env файле укажите адрес вашего API
export const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
    headers: {
        'Content-Type': 'application/json',
    },
})

export const s3Api = axios.create({
    baseURL: import.meta.env.VITE_REACT_S3_BUCKET_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
