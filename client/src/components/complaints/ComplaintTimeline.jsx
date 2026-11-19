import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Clock, CheckCircle2, User, UserCheck, PlayCircle, MessageSquare } from 'lucide-react';

export default function ComplaintTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        No history records available yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-4 h-4 text-purple-600" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => {
          const isLast = eventIdx === history.length - 1;
          const formattedDate = new Date(event.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {/* Connecting vertical line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Status Indicator Icon */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                      {getStatusIcon(event.status)}
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={event.status} />
                        <span className="text-xs font-semibold text-slate-700">
                          {event.user_name || 'System'}
                        </span>
                        {event.user_role && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {event.user_role}
                          </span>
                        )}
                      </div>

                      <time className="text-xs text-slate-400 font-mono">
                        {formattedDate}
                      </time>
                    </div>

                    {event.remarks && (
                      <div className="mt-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="whitespace-pre-line">{event.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
