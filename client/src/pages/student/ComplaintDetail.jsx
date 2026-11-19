import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import AssignModal from '../../components/complaints/AssignModal';
import Alert from '../../components/common/Alert';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Wrench, 
  Paperclip, 
  ExternalLink, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  MessageSquare, 
  Loader2 
} from 'lucide-react';

const STATUSES = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals and Actions
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [updateStatusVal, setUpdateStatusVal] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setUpdateStatusVal(res.data.status);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updateStatusVal) return;

    setUpdatingStatus(true);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await complaintService.updateStatus(complaint.id, updateStatusVal, statusRemarks);
      if (res.success && res.data) {
        setComplaint(res.data);
        setStatusRemarks('');
        setActionSuccess(`Status successfully updated to ${updateStatusVal}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const backLink = user?.role === 'ADMIN' 
    ? '/admin/complaints' 
    : user?.role === 'STAFF' 
    ? '/staff' 
    : '/student';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Alert type="error" message={error || 'Complaint not found.'} />
        <div className="mt-4">
          <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(complaint.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const canManageStatus = user?.role === 'ADMIN' || (user?.role === 'STAFF' && complaint.staff_id === user.id);
  const canAssignStaff = user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top back link */}
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                Ticket #{complaint.id}
              </span>
              <CategoryBadge category={complaint.category} />
              <StatusBadge status={complaint.status} />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>

          {/* Quick Actions (Assign / Update) */}
          <div className="flex items-center gap-2 flex-wrap">
            {canAssignStaff && (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>{complaint.staff_name ? 'Reassign Staff' : 'Assign to Staff'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="block text-slate-400 font-medium mb-1">Submitted By</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{complaint.student_name}</span>
            </div>
            <span className="text-slate-500">{complaint.student_department || complaint.student_email}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Assigned Support Staff</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Wrench className="w-3.5 h-3.5 text-sky-600" />
              <span>{complaint.staff_name || 'Unassigned'}</span>
            </div>
            <span className="text-slate-500">{complaint.staff_department || 'Pending assignment'}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Date Lodged</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="py-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Complaint Description
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 rounded-xl p-4 border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Attachment Section */}
        {complaint.attachment_url && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Attached Evidence
            </h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Paperclip className="w-5 h-5 text-sky-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {complaint.attachment_url.split('/').pop()}
                </span>
                <span className="text-[11px] text-slate-500">
                  {complaint.attachment_url.startsWith('http') ? 'External attachment' : 'Stored with the server'}
                </span>
              </div>
              <a
                href={complaint.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200"
              >
                <span>View File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Role-based Status Update Box (Staff & Admin) */}
      {canManageStatus && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Update Ticket Status & Progress Remarks
            </h3>
          </div>

          <form onSubmit={handleStatusUpdate} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution / Progress Note
                </label>
                <input
                  type="text"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Technician replaced router; connectivity restored."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updatingStatus}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Status</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audit Trail Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">
              Audit Trail & Timeline
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {complaint.history?.length || 0} event{(complaint.history?.length || 0) === 1 ? '' : 's'} recorded
          </span>
        </div>

        <ComplaintTimeline history={complaint.history} />
      </div>

      {/* Assign Modal (Admin only) */}
      {canAssignStaff && (
        <AssignModal
          complaint={complaint}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssigned={(updated) => {
            setComplaint(updated);
            setActionSuccess('Complaint assigned to staff member successfully.');
          }}
        />
      )}

    </div>
  );
}
