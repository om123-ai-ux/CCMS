import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { statsService } from '../../services/statsService';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import AssignModal from '../../components/complaints/AssignModal';
import Alert from '../../components/common/Alert';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Wrench, 
  Paperclip, 
  Loader2 
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'IT and Wi-Fi',
  'Electrical',
  'Infrastructure',
  'Hostel',
  'Cleaning',
  'Other'
];

const STATUSES = [
  'All Statuses',
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED'
];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedStaff, setSelectedStaff] = useState('All Staff');

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, staffRes] = await Promise.all([
        complaintService.getComplaints(),
        statsService.getStaffList()
      ]);

      if (compRes.success) {
        setComplaints(compRes.data);
      }
      if (staffRes.success) {
        setStaffList(staffRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || c.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Statuses' || c.status === selectedStatus;

    const matchesStaff =
      selectedStaff === 'All Staff' ||
      (selectedStaff === 'Unassigned' && !c.staff_id) ||
      String(c.staff_id) === selectedStaff;

    return matchesSearch && matchesCategory && matchesStatus && matchesStaff;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-sky-600" />
            <span>Campus Grievance Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total of {complaints.length} registered issues across campus facilities
          </p>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, student, hostel..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="All Staff">All Staff Assignments</option>
            <option value="Unassigned">Unassigned Only</option>
            {staffList.map((st) => (
              <option key={st.id} value={String(st.id)}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Title & Category</th>
                <th className="px-5 py-3">Student Submitter</th>
                <th className="px-5 py-3">Current Status</th>
                <th className="px-5 py-3">Assigned Staff</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 text-sky-600 animate-spin mx-auto mb-2" />
                    <span className="text-slate-400 font-medium">Loading complaints...</span>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No complaints match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const dateStr = new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400">#{c.id}</td>
                      <td className="px-5 py-3.5 max-w-sm">
                        <span className="font-bold text-slate-900 block truncate mb-1">
                          {c.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={c.category} />
                          {c.attachment_url && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3" />
                              File
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {c.student_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {c.student_department || c.student_email}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {c.staff_name ? (
                          <div>
                            <span className="font-medium text-sky-800 block">
                              {c.staff_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {c.staff_department}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono">
                        {dateStr}
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
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
            fetchData();
          }}
        />
      )}

    </div>
  );
}
