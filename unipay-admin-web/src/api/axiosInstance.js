import axios from 'axios'

// 🌐 1. Définition de la racine de ton API Backend Node.js
const API_BASE_URL = import.meta.env.VITE_API_URL 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔐 2. INTERCEPTEUR : Injecte automatiquement le token ADMIN avant que la requête ne parte
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unipay_token')
    if (token) {
      // Aligné sur ton middleware de vérification de token backend (Bearer Token)
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 🚨 3. INTERCEPTEUR : Intercepte les erreurs globales (ex: Token expiré ou piraté)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le serveur répond 401 (Non authentifié) ou 403 (Rôle Admin refusé)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("🔒 Accès refusé ou session expirée. Nettoyage et redirection...")
      localStorage.removeItem('unipay_token')
      localStorage.removeItem('unipay_user')
      
      // Force la redirection vers la page login si on est côté client
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance