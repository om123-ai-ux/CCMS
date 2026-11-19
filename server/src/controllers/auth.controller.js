const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.registerUser(req.body);
      return successResponse(res, 'User registered successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.loginUser(req.body);
      return successResponse(res, 'Login successful', result, 200);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.id);
      return successResponse(res, 'User profile fetched successfully', user, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
