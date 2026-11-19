import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { Calendar, User, Paperclip, ChevronRight, Wrench } from 'lucide-react';

export default function ComplaintCard({ complaint, linkPrefix = '/student/complaints' }) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </div>
          <span className="text-xs text-slate-400 font-mono">#{complaint.id}</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">
          {complaint.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {complaint.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>

          {complaint.student_name && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {complaint.student_name}
            </span>
          )}

          {complaint.staff_name && (
            <span className="flex items-center gap-1 text-sky-600 font-medium">
              <Wrench className="w-3.5 h-3.5" />
              {complaint.staff_name}
            </span>
          )}

          {complaint.attachment_url && (
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              File Attached
            </span>
          )}
        </div>

        <Link
          to={`${linkPrefix}/${complaint.id}`}
          className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold"
        >
          <span>Track Status</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
