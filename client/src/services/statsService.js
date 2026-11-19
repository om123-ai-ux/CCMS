import api from './api';

export const statsService = {
  async getDashboardStats() {
    const response = await api.get('/stats');
    return response.data;
  },

  async getStaffList() {
    const response = await api.get('/users/staff');
    return response.data;
  },

  async getAllUsers(role = null) {
    const response = await api.get('/users', { params: role ? { role } : {} });
    return response.data;
  },

  async createStaff(staffData) {
    const response = await api.post('/users/staff', staffData);
    return response.data;
  }
};
