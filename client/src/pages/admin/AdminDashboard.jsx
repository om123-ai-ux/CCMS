import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import AssignModal from '../../components/complaints/AssignModal';
import Alert from '../../components/common/Alert';
import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  UserCheck, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assign modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        statsService.getDashboardStats(),
        complaintService.getComplaints({ limit: 5 })
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (complaintsRes.success) {
        setRecentComplaints(complaintsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading administrative dashboard...</p>
      </div>
    );
  }

  const cStats = stats?.complaints || {};
  const uStats = stats?.users || {};
  const catStats = stats?.categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Administrator Control Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campus grievance metrics, staff dispatch, and cloud resource tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/complaints"
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            Manage All Complaints
          </Link>
          <Link
            to="/admin/staff"
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
          >
            Staff Directory
          </Link>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{cStats.total || 0}</p>
          <span className="text-[11px] text-slate-400">All student grievances</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">{cStats.pending || 0}</p>
          <span className="text-[11px] text-amber-700">Awaiting staff assignment</span>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-blue-600 mt-2">{cStats.assigned || 0}</p>
          <span className="text-[11px] text-blue-700">Dispatched to staff</span>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-purple-600 mt-2">{cStats.in_progress || 0}</p>
          <span className="text-[11px] text-purple-700">Being serviced</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{cStats.resolved || 0}</p>
          <span className="text-[11px] text-emerald-700">Successfully closed</span>
        </div>
      </div>

      {/* Middle Row: Category Breakdown + User Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">Complaints by Category</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Distribution</span>
          </div>

          <div className="space-y-4">
            {catStats.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No category records yet.</p>
            ) : (
              catStats.map((item) => {
                const percentage = cStats.total ? Math.round((item.count / cStats.total) * 100) : 0;
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={item.category} />
                      </div>
                      <span className="text-slate-600 font-mono">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Campus User Base</h2>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {uStats.total || 0} Total
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Students</span>
                <span className="text-sm font-bold text-slate-900">{uStats.students || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Support Staff</span>
                <span className="text-sm font-bold text-slate-900">{uStats.staff || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Administrators</span>
                <span className="text-sm font-bold text-slate-900">{uStats.admins || 0}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/staff"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200"
          >
            <span>Manage Staff & Assignments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Recent Campus Grievances</h2>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned To</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No recent complaints registered.
                  </td>
                </tr>
              ) : (
                recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400">#{c.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={c.category} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium">
                      {c.student_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.staff_name ? (
                        <span className="font-medium text-sky-700">{c.staff_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAssign(c)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors"
                      >
                        {c.staff_name ? 'Reassign' : 'Assign'}
                      </button>
                      <Link
                        to={`/admin/complaints/${c.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {selectedComplaint && (
        <AssignModal
          complaint={selectedComplaint}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedComplaint(null);
          }}
          onAssigned={() => {
            fetchDashboardData();
          }}
        />
      )}

    </div>
  );
}
