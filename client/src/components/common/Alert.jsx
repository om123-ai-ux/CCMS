import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose, className = '' }) {
  if (!message) return null;

  const config = {
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-500'
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500'
    },
    info: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  }[type] || {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: AlertCircle,
    iconColor: 'text-rose-500'
  };

  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm ${config.bg} ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
