import axios from "axios";

// В .env файле укажите адрес вашего API
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
})