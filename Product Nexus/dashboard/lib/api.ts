import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions

export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; name?: string; companyName?: string }) =>
    api.post('/auth/register', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

export const leads = {
  list: (params?: any) =>
    api.get('/leads', { params }),
  
  get: (id: string) =>
    api.get(`/leads/${id}`),
  
  create: (data: any) =>
    api.post('/leads', data),
  
  update: (id: string, data: any) =>
    api.put(`/leads/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/leads/${id}`),
  
  enrich: (id: string) =>
    api.post(`/leads/${id}/enrich`),
  
  score: (id: string) =>
    api.post(`/leads/${id}/score`),
  
  sendToCrm: (id: string, crmType?: string) =>
    api.post(`/leads/${id}/send-to-crm`, { crmType }),
};

export const analytics = {
  getDashboard: (params?: any) =>
    api.get('/analytics/dashboard', { params }),
  
  getFunnel: (params?: any) =>
    api.get('/analytics/funnel', { params }),
  
  getSources: (params?: any) =>
    api.get('/analytics/sources', { params }),
  
  getROI: (params?: any) =>
    api.get('/analytics/roi', { params }),
  
  getLeadQuality: (params?: any) =>
    api.get('/analytics/lead-quality', { params }),
  
  getTimeline: (params?: any) =>
    api.get('/analytics/timeline', { params }),
};

export const integrations = {
  list: () =>
    api.get('/integrations'),
  
  configurePipedrive: (data: { apiToken: string; domain: string }) =>
    api.post('/integrations/crm/pipedrive', data),
  
  configureRDStation: (data: { accessToken: string }) =>
    api.post('/integrations/crm/rd-station', data),
  
  configureHubSpot: (data: { apiKey: string }) =>
    api.post('/integrations/crm/hubspot', data),
  
  test: (integrationId: string) =>
    api.post('/integrations/test', { integrationId }),
  
  remove: (id: string) =>
    api.delete(`/integrations/${id}`),
};

export const agents = {
  list: (params?: any) =>
    api.get('/agents', { params }),
  
  get: (id: string) =>
    api.get(`/agents/${id}`),
  
  create: (data: any) =>
    api.post('/agents', data),
  
  update: (id: string, data: any) =>
    api.put(`/agents/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/agents/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/agents/${id}/status`, { status }),
  
  execute: (id: string) =>
    api.post(`/agents/${id}/execute`),
};

export const companies = {
  list: () =>
    api.get('/companies'),
  
  get: (id: string) =>
    api.get(`/companies/${id}`),
};

export const users = {
  list: (params?: any) =>
    api.get('/users', { params }),
  
  get: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

export default api;

