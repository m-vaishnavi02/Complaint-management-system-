import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Response interceptor: unwrap data ─────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message
             || err.response?.data?.error
             || err.message
             || 'Network error';
    return Promise.reject({ message: msg, errors: err.response?.data?.errors, status: err.response?.status });
  }
);

// ── Complaints ────────────────────────────────────────────────
export const complaintsApi = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  summary:             () => api.get('/analytics/summary'),
  byStatus:            () => api.get('/analytics/by-status'),
  byCategory:          () => api.get('/analytics/by-category'),
  byPriority:          () => api.get('/analytics/by-priority'),
  resolutionByCategory:() => api.get('/analytics/resolution-by-category'),
  monthlyTrend:        () => api.get('/analytics/monthly-trend'),
};
