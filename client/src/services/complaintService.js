import api from './api';

export const complaintService = {
  async getComplaints(params = {}) {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  async getComplaintById(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  async createComplaint(formData) {
    const response = await api.post('/complaints', formData);
    return response.data;
  },

  async assignStaff(id, staffId, remarks = '') {
    const response = await api.put(`/complaints/${id}/assign`, { staffId, remarks });
    return response.data;
  },

  async updateStatus(id, status, remarks = '') {
    const response = await api.put(`/complaints/${id}/status`, { status, remarks });
    return response.data;
  }
};
