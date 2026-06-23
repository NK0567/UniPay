// Centralisation des appels API vers ton backend Node.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('unipay_admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue côté serveur.');
  }

  return data;
};