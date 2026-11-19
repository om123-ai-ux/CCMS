const { errorResponse } = require('../utils/response');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - 'STUDENT', 'ADMIN', 'STAFF'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Authentication required before authorization.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
