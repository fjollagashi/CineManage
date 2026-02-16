const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(url, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const auth = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const movies = {
  list: (params) => api('/movies?' + new URLSearchParams(params || {})),
  get: (id) => api(`/movies/${id}`),
  create: (body) => api('/movies', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/movies/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/movies/${id}`, { method: 'DELETE' }),
};

export const shows = {
  list: (params) => api('/shows?' + new URLSearchParams(params || {})),
  get: (id) => api(`/shows/${id}`),
  create: (body) => api('/shows', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/shows/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/shows/${id}`, { method: 'DELETE' }),
};

export const bookings = {
  list: () => api('/bookings'),
  get: (id) => api(`/bookings/${id}`),
  create: (body) => api('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  confirm: (id, body) => api(`/bookings/${id}/confirm`, { method: 'POST', body: JSON.stringify(body) }),
  refund: (id) => api(`/bookings/${id}/refund`, { method: 'POST' }),
};

export const reviews = {
  byMovie: (movieId) => api(`/reviews/movie/${movieId}`),
  submit: (movieId, body) => api(`/reviews/movie/${movieId}`, { method: 'PUT', body: JSON.stringify(body) }),
  listAdmin: () => api('/reviews/admin'),
  moderate: (id, isApproved) => api(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ isApproved }) }),
};

export const analytics = {
  sales: (period) => api('/analytics/sales?' + new URLSearchParams({ period: period || 'day' })),
  refunds: (params) => api('/analytics/refunds?' + new URLSearchParams(params || {})),
  dashboard: () => api('/analytics/dashboard'),
};

export const admin = {
  employees: {
    list: () => api('/admin/employees'),
    create: (body) => api('/admin/employees', { method: 'POST', body: JSON.stringify(body) }),
  },
  promotions: {
    list: () => api('/admin/promotions'),
    create: (body) => api('/admin/promotions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => api(`/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};
