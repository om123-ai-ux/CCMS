const statsService = require('../services/stats.service');
const { successResponse } = require('../utils/response');

class StatsController {
  async getDashboardStats(req, res, next) {
    try {
      if (req.user.role === 'ADMIN') {
        const stats = await statsService.getAdminStats();
        return successResponse(res, 'Admin stats retrieved successfully', stats);
      } else if (req.user.role === 'STAFF') {
        const stats = await statsService.getStaffStats(req.user.id);
        return successResponse(res, 'Staff stats retrieved successfully', stats);
      } else {
        const stats = await statsService.getStudentStats(req.user.id);
        return successResponse(res, 'Student stats retrieved successfully', stats);
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StatsController();
