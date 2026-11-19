import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { statsService } from '../../services/statsService';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Alert from '../../components/common/Alert';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  ClipboardList, 
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

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, statRes] = await Promise.all([
        complaintService.getComplaints(),
        statsService.getDashboardStats()
      ]);

      if (compRes.success) {
        setComplaints(compRes.data);
      }
      if (statRes.success) {
        setStats(statRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints locally for quick responsiveness
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || c.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Statuses' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Complaint Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit issues and track real-time resolution progress on campus
          </p>
        </div>

        <Link
          to="/student/new-complaint"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Complaint</span>
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Lodged
              </span>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.total || 0}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Pending
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 mt-2">{stats.pending || 0}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                In Progress
              </span>
              <PlayCircle className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600 mt-2">
              {(stats.in_progress || 0) + (stats.assigned || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Resolved
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-2">{stats.resolved || 0}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your complaints..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaint List / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No complaints found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {complaints.length === 0
              ? 'You have not submitted any complaints yet. Use the button above to lodge an issue.'
              : 'No complaints match your current search or filter criteria.'}
          </p>
          {complaints.length === 0 && (
            <Link
              to="/student/new-complaint"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Complaint</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              linkPrefix="/student/complaints"
            />
          ))}
        </div>
      )}

    </div>
  );
}
