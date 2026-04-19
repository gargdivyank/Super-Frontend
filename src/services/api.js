import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // baseURL: process.env.REACT_APP_API_URL || 'https://super-backend-eosin.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
};

// Super Admin API endpoints
export const superAdminAPI = {
  // Landing Pages
  getLandingPages: (filters = {}) => api.get('/super-admin/landing-pages', { params: filters }),
  createLandingPage: (data) => api.post('/super-admin/landing-pages', data),
  updateLandingPage: (id, data) => api.put(`/super-admin/landing-pages/${id}`, data),
  deleteLandingPage: (id) => api.delete(`/super-admin/landing-pages/${id}`),
  
  // Landing Page Form Configuration
  getLandingPageFormConfig: (id) => api.get(`/landing-pages/${id}/form-config`),
  updateLandingPageFormFields: (id, data) => api.put(`/landing-pages/${id}/form-fields`, data),
  testLandingPageForm: (id, formData) => api.post(`/landing-pages/${id}/test-form`, { formData }),
  
  // Sub Admins
  getSubAdmins: (filters = {}) => api.get('/super-admin/sub-admins', { params: filters }),
  createSubAdmin: (data) => api.post('/super-admin/sub-admins', data),
  updateSubAdmin: (id, data) => api.put(`/super-admin/sub-admins/${id}`, data),
  deleteSubAdmin: (id) => api.delete(`/super-admin/sub-admins/${id}`),
  approveSubAdmin: (id) => api.put(`/admin/approve-user/${id}`),
  rejectSubAdmin: (id, reason) => api.put(`/admin/reject-user/${id}`, { reason }),
  
  // Access Requests
  getAccessRequests: () => api.get('/access-requests'),
  approveAccessRequest: (id, landingPageId) => api.put(`/access-requests/${id}/approve`, { landingPageId }),
  rejectAccessRequest: (id, reason) => api.put(`/access-requests/${id}/reject`, { reason }),
  
  // All Leads
  getAllLeads: (filters = {}) => api.get('/super-admin/leads', { params: filters }),
  exportLeads: (filters = {}) => api.get('/super-admin/leads/export', { params: filters }),
  updateLead: (id, data) => api.put(`/super-admin/leads/${id}`, data),
  uploadLeads: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/super-admin/leads/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  
  // Dashboard Stats
  getDashboardStats: () => api.get('/dashboard/super-admin'),

  // Analytics (leads by landing page)
  getAnalytics: (params = {}) => api.get('/super-admin/analytics', { params }),
};

// Sub Admin API endpoints
export const subAdminAPI = {
  // Profile
  getProfile: () => api.get('/sub-admin/profile'),
  updateProfile: (data) => api.put('/sub-admin/profile', data),
  
  // Landing Page
  getLandingPage: () => api.get('/sub-admin/landing-page'),
  
  // Leads
  getLeads: (filters = {}) => api.get('/sub-admin/leads', { params: filters }),
  exportLeads: (filters = {}) => api.get('/sub-admin/leads/export', { params: filters }),
  updateLeadStatus: (id, status) => api.put(`/sub-admin/leads/${id}/status`, { status }),
  updateLead: (id, data) => api.put(`/sub-admin/leads/${id}`, data),
  uploadLeads: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/sub-admin/leads/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  
  // Dashboard Stats
  getDashboardStats: () => api.get('/sub-admin/dashboard-stats'),

  // Analytics (assigned landing page(s) only — no query params)
  getAnalytics: () => api.get('/sub-admin/analytics'),

  // Sub Admins / Users (assigned landing page(s) only)
  getSubAdmins: (filters = {}) => api.get('/sub-admin/sub-admins', { params: filters }),
  createSubAdmin: (data) => api.post('/sub-admin/sub-admins', data),
  updateSubAdmin: (id, data) => api.put(`/sub-admin/sub-admins/${id}`, data),
  deleteSubAdmin: (id) => api.delete(`/sub-admin/sub-admins/${id}`),
  
  // Access Requests
  createAccessRequest: (landingPageId, message) => api.post('/access-requests', { landingPageId, message }),
  getMyAccessRequests: () => api.get('/access-requests/my-requests'),
};

// Landing Page API endpoints
export const landingPageAPI = {
  getLandingPages: () => api.get('/landing-pages'),
  getLandingPage: (id) => api.get(`/landing-pages/${id}`),
  submitLead: (landingPageId, leadData) => api.post(`/landing-pages/${landingPageId}/leads`, leadData),
};


export default api; 