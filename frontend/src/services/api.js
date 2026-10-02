import axios from 'axios';

const API_BASE = '/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mbmc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('mbmc_token', response.data.token);
      localStorage.setItem('mbmc_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('mbmc_token', response.data.token);
      localStorage.setItem('mbmc_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('mbmc_token');
    localStorage.removeItem('mbmc_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('mbmc_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  fetchProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Complaint Services
export const complaintService = {
  // Submit complaint supporting multipart/form-data for image uploads
  submitComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getComplaintById: async (complaintId) => {
    const response = await api.get(`/complaints/${encodeURIComponent(complaintId)}`);
    return response.data;
  },

  getMapMarkers: async () => {
    const response = await api.get('/complaints/map');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
};

// Admin Services
export const adminService = {
  updateStatus: async (complaintId, status) => {
    const response = await api.put(`/admin/complaints/${complaintId}/status`, { status });
    return response.data;
  },

  assignDepartment: async (complaintId, departmentId, notes) => {
    const response = await api.post(`/admin/complaints/${complaintId}/assign`, {
      department_id: departmentId,
      notes,
    });
    return response.data;
  },

  deleteComplaint: async (complaintId) => {
    const response = await api.delete(`/admin/complaints/${complaintId}`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  addDepartment: async (name) => {
    const response = await api.post('/admin/departments', { department_name: name });
    return response.data;
  },
};

export default api;
