import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Instance Axios configurée
const api = axios.create({
    baseURL: API_URL,
});

// Intercepteur pour ajouter le Token JWT à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (username, password) => api.post('/auth/login', { username, password });
export const getTasks = () => api.get('/tasks');
export const createTask = (title) => api.post('/tasks', title, {
    headers: { 'Content-Type': 'text/plain' }
});
export const toggleTask = (id) => api.put(`/tasks/${id}/toggle`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;