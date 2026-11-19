const userService = require('../services/user.service');
const { successResponse } = require('../utils/response');

class UserController {
  async getStaffList(req, res, next) {
    try {
      const staff = await userService.getAllStaff();
      return successResponse(res, 'Staff list retrieved successfully', staff);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.query.role);
      return successResponse(res, 'Users retrieved successfully', users);
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req, res, next) {
    try {
      const newStaff = await userService.createStaff(req.body);
      return successResponse(res, 'Staff member created successfully', newStaff, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
