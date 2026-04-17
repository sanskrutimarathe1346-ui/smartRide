import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Ticket APIs
export const ticketAPI = {
  book: (data) => api.post('/tickets/book', data),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  verifyTicket: (id, data) => api.post(`/tickets/${id}/verify`, data),
  cancelTicket: (id, data) => api.put(`/tickets/${id}/cancel`, data),
  getStatistics: (params) => api.get('/tickets/admin/statistics', { params }),
};

// Pass APIs
export const passAPI = {
  purchase: (data) => api.post('/passes/purchase', data),
  getMyPasses: (params) => api.get('/passes/my-passes', { params }),
  getActivePass: () => api.get('/passes/active'),
  getPassById: (id) => api.get(`/passes/${id}`),
  verifyPass: (id, data) => api.post(`/passes/${id}/verify`, data),
  renewPass: (id) => api.post(`/passes/${id}/renew`),
  cancelPass: (id, data) => api.put(`/passes/${id}/cancel`, data),
  getPricing: () => api.get('/passes/pricing/all'),
};

// Bus APIs
export const busAPI = {
  getAll: (params) => api.get('/buses', { params }),
  getLiveBuses: (params) => api.get('/buses/live', { params }),
  getBusById: (id) => api.get(`/buses/${id}`),
  updateLocation: (data) => api.post('/buses/update-location', data),
  updatePassengerCount: (id, data) => api.put(`/buses/${id}/passengers`, data),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
  getByRoute: (routeId) => api.get(`/buses/route/${routeId}`),
};

// Route APIs
export const routeAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  getStops: (id) => api.get(`/routes/${id}/stops`),
  search: (data) => api.post('/routes/search', data),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getMyFeedback: (params) => api.get('/feedback/my-feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  getAll: (params) => api.get('/feedback/admin/all', { params }),
  assign: (id, data) => api.put(`/feedback/${id}/assign`, data),
  respond: (id, data) => api.put(`/feedback/${id}/respond`, data),
  resolve: (id, data) => api.put(`/feedback/${id}/resolve`, data),
  getStatistics: (params) => api.get('/feedback/admin/statistics', { params }),
};

export default api;
