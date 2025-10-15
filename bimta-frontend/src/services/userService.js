import api from './api';

export const userService = {
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (formData) => {
    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateUser: async (userId, formData) => {
    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  resetPassword: async (userId, newPassword) => {
    const response = await api.patch(`/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};