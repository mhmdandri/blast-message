import axios from 'axios';

// Defaults directly to backend port 8083 (CORS is enabled on backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export default axiosClient;
