import React from 'react';
import { Clock, CheckCircle2, UserCheck, PlayCircle } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const getStatusConfig = (val) => {
    switch (val) {
      case 'PENDING':
        return {
          label: 'Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: UserCheck
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: PlayCircle
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2
        };
      default:
        return {
          label: val || 'Unknown',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Clock
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
