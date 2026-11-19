import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();

  const homePath = user?.role === 'ADMIN'
    ? '/admin'
    : user?.role === 'STAFF'
    ? '/staff'
    : '/student';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-sm text-slate-600 mt-2">
          Your current account role <span className="font-bold uppercase text-rose-600">{user?.role || 'Guest'}</span> does not possess clearance to view this resource.
        </p>
        <div className="mt-6">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Authorized Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
