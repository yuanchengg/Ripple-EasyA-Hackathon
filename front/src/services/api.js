import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Farmers
export const getFarmers = () => api.get('/farmers');
export const createFarmer = (data) => api.post('/farmers', data);
export const updateFarmer = (id, data) => api.put(`/farmers/${id}`, data);
export const deleteFarmer = (id) => api.delete(`/farmers/${id}`);

// Escrows
export const getEscrows = () => api.get('/escrows');
export const createEscrow = (data) => api.post('/escrows', data);
export const verifyEscrow = (id, data) => api.post(`/escrows/${id}/verify`, data);
export const cancelEscrow = (id) => api.post(`/escrows/${id}/cancel`);

// Verification Logs
export const getVerificationLogs = () => api.get('/verification-logs');
export const getVerificationLogsByEscrow = (escrowId) => 
  api.get(`/verification-logs/escrow/${escrowId}`);

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
