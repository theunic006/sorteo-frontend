import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Servicios públicos
export const sorteoService = {
  getAll: () => api.get('/sorteos'),
  getActivos: () => api.get('/sorteos/activos'),
  getById: (id) => api.get(`/sorteos/${id}`),
  getPremios: (id) => api.get(`/sorteos/${id}/premios`),
};

export const participanteService = {
  registrar: (data) => api.post('/participantes/registrar', data),
  consultar: (dni) => api.get(`/participantes/consultar/${dni}`),
  uploadComprobante: (formData) => api.post('/participantes/comprobante', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const ganadoresService = {
  getAll: () => api.get('/ganadores'),
  getBySorteo: (id) => api.get(`/ganadores/sorteo/${id}`),
};

export const testimoniosService = {
  getAll: () => api.get('/testimonios'),
  getParaHome: () => api.get('/testimonios/home'),
};

export const configuracionService = {
  getMetodosPago: () => api.get('/configuracion/metodos-pago'),
  getContacto: () => api.get('/configuracion/contacto'),
  getTerminos: () => api.get('/configuracion/terminos'),
};

// Servicios administrativos
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const adminDashboardService = {
  getStats: () => api.get('/admin/dashboard'),
  getEstadisticas: () => api.get('/admin/reportes/estadisticas'),
};

export const adminReporteService = {
  participantes: (params) => api.get('/admin/reportes/participantes', { params }),
  ventas: (params) => api.get('/admin/reportes/ventas', { params }),
  ingresos: (params) => api.get('/admin/reportes/ingresos', { params }),
  participantesDepartamento: () => api.get('/admin/reportes/participantes-departamento'),
  ticketsSorteo: (sorteoId) => api.get(`/admin/reportes/tickets-sorteo/${sorteoId}`),
  exportarExcel: (tipo, params) => api.get(`/admin/reportes/exportar/${tipo}`, { 
    params, 
    responseType: 'blob' 
  }),
};

export const adminSorteoGanadoresService = {
  sortearAutomatico: (sorteoId) => api.post(`/admin/sorteos/${sorteoId}/sortear`),
  asignarManual: (data) => api.post('/admin/sorteos/ganador/asignar', data),
  obtenerGanadores: (sorteoId) => api.get(`/admin/sorteos/${sorteoId}/ganadores`),
  notificarGanador: (ganadorId) => api.post(`/admin/sorteos/ganador/${ganadorId}/notificar`),
  eliminarGanador: (ganadorId) => api.delete(`/admin/sorteos/ganador/${ganadorId}`),
};
