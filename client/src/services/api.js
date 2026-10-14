import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Centralized Axios API client
 * All requests go through this single instance
 */
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send cookies on every request
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor ────────────────────────────────────────────────
let isRefreshing = false;
let failQueue = [];

const processQueue = (error) => {
  failQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // If 401 and we haven't retried yet, attempt token refresh
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Clear user state via custom event
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ── Helper to extract error message ──────────────────────────────────────
export const getErrorMsg = (err) =>
  err?.response?.data?.error?.message || err?.message || 'Something went wrong';

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  registerTalent:  (data) => api.post('/auth/register/talent',  data),
  registerIGPage:  (data) => api.post('/auth/register/igpage',  data),
  registerBrand:   (data) => api.post('/auth/register/brand',   data),
  login:           (data) => api.post('/auth/login',            data),
  logout:          ()     => api.post('/auth/logout'),
  refresh:         ()     => api.post('/auth/refresh'),
  getMe:           ()     => api.get('/auth/me'),
  updatePassword:  (data) => api.put('/auth/update-password',   data),
};

// ── Talent ────────────────────────────────────────────────────────────────
export const talentApi = {
  getAll:      (params) => api.get('/talent',             { params }),
  getById:     (id)     => api.get(`/talent/${id}`),
  update:      (id, d)  => api.put(`/talent/${id}`,       d),
  delete:      (id)     => api.delete(`/talent/${id}`),
  getStats:    ()       => api.get('/talent/stats/overview'),
};

// ── Instagram Pages ───────────────────────────────────────────────────────
export const igApi = {
  getAll:      (params) => api.get('/instagram-pages',        { params }),
  getById:     (id)     => api.get(`/instagram-pages/${id}`),
  update:      (id, d)  => api.put(`/instagram-pages/${id}`,  d),
  delete:      (id)     => api.delete(`/instagram-pages/${id}`),
  getStats:    ()       => api.get('/instagram-pages/stats/overview'),
};

// ── Bookings ──────────────────────────────────────────────────────────────
export const bookingApi = {
  createTalent:    (data) => api.post('/bookings/talent',           data),
  createInstagram: (data) => api.post('/bookings/instagram',        data),
  getAll:          (p)    => api.get('/bookings',                   { params: p }),
  getById:         (id)   => api.get(`/bookings/${id}`),
  approve:         (id, d) => api.put(`/bookings/${id}/approve`,    d),
  reject:          (id, d) => api.put(`/bookings/${id}/reject`,     d),
  complete:        (id)   => api.put(`/bookings/${id}/complete`),
  addReview:       (id, d) => api.post(`/bookings/${id}/review`,    d),
};

// ── Brand ─────────────────────────────────────────────────────────────────
export const brandApi = {
  getProfile:     ()    => api.get('/brands/me'),
  updateProfile:  (d)   => api.put('/brands/me', d),
  getSubscription:()    => api.get('/brands/subscription'),
  getDashboard:   ()    => api.get('/brands/dashboard'),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard:  ()       => api.get('/admin/dashboard'),
  getStats:      ()       => api.get('/admin/stats'),
  getUsers:      (p)      => api.get('/admin/users',    { params: p }),
  verifyUser:    (id)     => api.put(`/admin/users/${id}/verify`),
  deactivate:    (id)     => api.put(`/admin/users/${id}/deactivate`),
  activate:      (id)     => api.put(`/admin/users/${id}/activate`),
  getBookings:   (p)      => api.get('/admin/bookings', { params: p }),
};

// ── Upload ────────────────────────────────────────────────────────────────
export const uploadApi = {
  profilePicture: (file) => {
    const fd = new FormData();
    fd.append('profilePicture', file);
    return api.post('/upload/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
