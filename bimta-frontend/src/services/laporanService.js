import api from './api';

export const laporanService = {
  generateLaporan: async (params) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/laporan/generate?${queryParams}`);
    return response.data;
  },

  exportLaporan: async (params) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/laporan/export?${queryParams}`, {
      responseType: 'blob', // Important untuk download file
    });
    return response;
  },

  getStatistik: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/laporan/statistik?${queryParams}`);
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};