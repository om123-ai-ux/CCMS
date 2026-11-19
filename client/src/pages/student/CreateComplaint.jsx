import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import Alert from '../../components/common/Alert';
import { 
  Building2, 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Wifi, 
  Zap, 
  Home, 
  Sparkles, 
  HelpCircle, 
  Loader2 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'IT and Wi-Fi', label: 'IT and Wi-Fi', icon: Wifi, desc: 'Internet, router, lab systems, connectivity' },
  { id: 'Electrical', label: 'Electrical', icon: Zap, desc: 'Lights, fans, sockets, power cuts, AC units' },
  { id: 'Infrastructure', label: 'Infrastructure', icon: Building2, desc: 'Classrooms, benches, doors, windows, civil repair' },
  { id: 'Hostel', label: 'Hostel', icon: Home, desc: 'Room furniture, water supply, washrooms, mess' },
  { id: 'Cleaning', label: 'Cleaning', icon: Sparkles, desc: 'Housekeeping, waste management, sanitation' },
  { id: 'Other', label: 'Other', icon: HelpCircle, desc: 'General queries or miscellaneous campus issues' },
];

export default function CreateComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'IT and Wi-Fi',
    description: '',
  });

  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must not exceed 5MB.');
        setAttachment(null);
        e.target.value = '';
        return;
      }
      setAttachment(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      if (attachment) {
        data.append('attachment', attachment);
      }

      const res = await complaintService.createComplaint(data);
      if (res.success && res.data) {
        navigate(`/student/complaints/${res.data.id}`);
      } else {
        setError(res.message || 'The complaint could not be submitted.');
      }
    } catch (err) {
      setError(
        err.response?.data?.errors
          ? err.response.data.errors.map((e) => e.message).join(', ')
          : err.response?.data?.message || err.message || 'Failed to submit complaint'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation & Header */}
      <div>
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Submit Campus Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide accurate details to help campus support personnel resolve your grievance promptly
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Select Radio/Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Complaint Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 text-sky-900 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold block">{cat.label}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Subject / Title * (min 5 characters)
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wi-Fi router on Hostel B Floor 2 not functioning"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description * (min 10 characters)
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Specify the exact location (block, room, lab), symptoms, duration of the issue, and any other relevant context..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attach Supporting Image or PDF (Optional, max 5MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <Paperclip className="w-4 h-4 text-slate-500" />
                <span>{attachment ? 'Replace File' : 'Choose File'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {attachment && (
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="font-medium text-sky-700 truncate max-w-xs">{attachment.name}</span>
                  <span className="text-slate-400">({Math.round(attachment.size / 1024)} KB)</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-rose-600 hover:text-rose-700 font-bold ml-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/student"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to CCMS...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
