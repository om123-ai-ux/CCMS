import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardList,
  LogIn,
  LogOut,
  PlusCircle,
  UserPlus,
  Users
} from 'lucide-react';

const navigationByRole = {
  STUDENT: [
    { path: '/student', label: 'My Complaints', icon: ClipboardList },
    { path: '/student/new-complaint', label: 'New Complaint', icon: PlusCircle }
  ],
  STAFF: [
    { path: '/staff', label: 'Assigned Worklist', icon: CheckSquare }
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { path: '/admin/staff', label: 'Staff Directory', icon: Users }
  ]
};

const dashboardByRole = {
  STUDENT: '/student',
  STAFF: '/staff',
  ADMIN: '/admin'
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardPath = dashboardByRole[user?.role] || '/login';
  const navigation = isAuthenticated ? navigationByRole[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderLinks = (mobile = false) => (
    <nav
      aria-label="Main navigation"
      className={mobile
        ? 'flex gap-2 overflow-x-auto px-4 pb-3'
        : 'flex flex-col gap-1'}
    >
      {navigation.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path ||
          (path !== dashboardPath && location.pathname.startsWith(`${path}/`));

        return (
          <Link
            key={path}
            to={path}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const logo = (
    <Link
      to={dashboardPath}
      className="flex items-center gap-3"
      aria-label="Campus Complaint Management System home"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-bold tracking-tight text-slate-900">Campus CCMS</span>
        <span className="block text-xs text-slate-500">Complaint management</span>
      </span>
    </Link>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <div className="px-2">{logo}</div>

        {isAuthenticated ? (
          <>
            <div className="mb-3 mt-10 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workspace
            </div>
            {renderLinks()}
            <div className="mt-auto border-t border-slate-200 pt-4">
              <p className="truncate px-3 text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate px-3 pt-1 text-xs text-slate-500">{user.email}</p>
              <div className="mt-3 flex items-center justify-between px-3">
                <span className="text-xs font-semibold text-sky-700">{user.role}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Register as student
            </Link>
          </div>
        )}
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {logo}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link to="/login" className="text-slate-600">Sign in</Link>
              <Link to="/register" className="text-sky-700">Register</Link>
            </div>
          )}
        </div>
        {isAuthenticated && renderLinks(true)}
      </header>
    </>
  );
}
