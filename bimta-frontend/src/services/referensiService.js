import api from './api';

export const referensiService = {
  getAllReferensi: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/referensi?${params}`);
    return response.data;
  },

  getReferensiById: async (nim) => {
    const response = await api.get(`/referensi/${nim}`);
    return response.data;
  },

  createReferensi: async (formData) => {
    const response = await api.post('/referensi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateReferensi: async (nim, formData) => {
    const response = await api.put(`/referensi/${nim}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteReferensi: async (nim) => {
    const response = await api.delete(`/referensi/${nim}`);
    return response.data;
  },
};