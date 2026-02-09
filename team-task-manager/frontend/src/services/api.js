import axios from 'axios';

// Create axios instance
// In development, use relative path to leverage Vite proxy
// In production, use the configured API URL
const baseURL = process.env.NODE_ENV === 'development'
  ? '/api'  // Use proxy in development
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');

const api = axios.create({
  baseURL,
  // Include credentials to ensure session cookies are sent
  // Needed for cross-origin requests in production and same-origin in development
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to potentially handle additional headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add additional logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor - no need for auth token since we're using sessions
// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Only clear localStorage and redirect if not on auth endpoints
      const isAuthEndpoint = error.config.url.includes('/auth/');

      if (!isAuthEndpoint) {
        localStorage.removeItem('isLoggedIn');
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login' && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams/all'),
  create: (teamData) => api.post('/teams/add', teamData),
  getById: (id) => api.get(`/teams/get/${id}`),
  update: (id, teamData) => api.put(`/teams/update/${id}`, teamData),
  delete: (id) => api.delete(`/teams/delete/${id}`),
  getMembers: (id) => api.get(`/teams/${id}/members`),
  addMember: (id, userId, role = 'member') => api.post(`/teams/${id}/members`, { userId, role }),
  removeMember: (id, userId) => api.delete(`/teams/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) => api.put(`/teams/${id}/members/${userId}`, { role }),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks/all', { params }),
  create: (taskData) => api.post('/tasks/add', taskData),
  getById: (id) => api.get(`/tasks/get/${id}`),
  update: (id, taskData) => api.put(`/tasks/update/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/delete/${id}`),
  getStats: () => api.get('/tasks/stats'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users/all', { params }),
  getById: (id) => api.get(`/users/get/${id}`),
  getTasks: (id) => api.get(`/users/get/${id}/tasks`),
  updateProfile: (id, profileData) => api.put(`/users/update/${id}`, profileData),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getCount: () => api.get('/notifications/count'),
  markAsRead: (id) => api.put(`/notifications/read/${id}`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;