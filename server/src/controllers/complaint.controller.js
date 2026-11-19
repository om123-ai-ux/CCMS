const complaintService = require('../services/complaint.service');
const { uploadFile } = require('../utils/attachment');
const { successResponse, errorResponse } = require('../utils/response');

class ComplaintController {
  /**
   * Submit a complaint (Student)
   */
  async createComplaint(req, res, next) {
    try {
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = await uploadFile(req.file);
      }

      const { title, description, category } = req.body;
      const complaint = await complaintService.createComplaint({
        studentId: req.user.id,
        title,
        description,
        category,
        attachmentUrl
      });

      return successResponse(res, 'Complaint submitted successfully', complaint, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * List complaints based on role and query parameters
   */
  async getComplaints(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        status: req.query.status,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
      };

      // Role-based visibility
      if (req.user.role === 'STUDENT') {
        filters.studentId = req.user.id;
      } else if (req.user.role === 'STAFF') {
        filters.assignedStaffId = req.user.id;
      } else if (req.user.role === 'ADMIN') {
        if (req.query.assignedStaffId) {
          filters.assignedStaffId = req.query.assignedStaffId;
        }
        if (req.query.studentId) {
          filters.studentId = req.query.studentId;
        }
      }

      const complaints = await complaintService.getComplaints(filters);
      return successResponse(res, 'Complaints retrieved successfully', complaints);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single complaint by ID with timeline
   */
  async getComplaintById(req, res, next) {
    try {
      const complaintId = parseInt(req.params.id, 10);
      const complaint = await complaintService.getComplaintById(complaintId);

      if (!complaint) {
        return errorResponse(res, 'Complaint not found', 404);
      }

      // Authorization check
      if (req.user.role === 'STUDENT' && complaint.student_id !== req.user.id) {
        return errorResponse(res, 'Forbidden: You cannot access this complaint.', 403);
      }

      if (req.user.role === 'STAFF' && complaint.staff_id !== req.user.id) {
        return errorResponse(res, 'Forbidden: This complaint is not assigned to you.', 403);
      }

      return successResponse(res, 'Complaint details retrieved successfully', complaint);
    } catch (err) {
      next(err);
    }
  }

  async getComplaintHistory(req, res, next) {
    try {
      const complaint = await complaintService.getComplaintById(parseInt(req.params.id, 10));

      if (!complaint) {
        return errorResponse(res, 'Complaint not found', 404);
      }

      if (req.user.role === 'STUDENT' && complaint.student_id !== req.user.id) {
        return errorResponse(res, 'Forbidden: You cannot access this complaint.', 403);
      }

      if (req.user.role === 'STAFF' && complaint.staff_id !== req.user.id) {
        return errorResponse(res, 'Forbidden: This complaint is not assigned to you.', 403);
      }

      return successResponse(res, 'Complaint history retrieved successfully', complaint.history);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Assign complaint to staff (Admin only)
   */
  async assignStaff(req, res, next) {
    try {
      const complaintId = parseInt(req.params.id, 10);
      const { staffId, remarks } = req.body;

      const updatedComplaint = await complaintService.assignStaff(
        complaintId,
        staffId,
        req.user.id,
        remarks
      );

      return successResponse(res, 'Complaint assigned successfully', updatedComplaint);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update complaint status (Admin or Assigned Staff)
   */
  async updateStatus(req, res, next) {
    try {
      const complaintId = parseInt(req.params.id, 10);
      const { status, remarks } = req.body;

      const updatedComplaint = await complaintService.updateStatus(
        complaintId,
        status,
        req.user.id,
        remarks,
        req.user.role
      );

      return successResponse(res, 'Complaint status updated successfully', updatedComplaint);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ComplaintController();
