import axios from 'axios';

// Dynamically resolves API Base URL for both local development and remote VPS access
function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // If explicitly configured to an external domain/URL, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // If running in browser
  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location;
    // When accessed from a remote host (VPS IP or domain)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // If served through reverse proxy on standard port 80/443, use relative '/api'
      if (!port || port === '80' || port === '443') {
        return '/api';
      }
      // If accessed directly via port (e.g. :5173), target backend on port 8083
      return `${protocol}//${hostname}:8083/api`;
    }
  }

  return envUrl || 'http://localhost:8083/api';
}

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export default axiosClient;
