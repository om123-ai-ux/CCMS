import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import CreateComplaint from './pages/student/CreateComplaint';
import ComplaintDetail from './pages/student/ComplaintDetail';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminStaff from './pages/admin/AdminStaff';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" className="flex min-h-[calc(100vh-4rem)] items-center justify-center gap-3">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-600">Loading your workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }

  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] lg:ml-64 lg:min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/new-complaint" element={<CreateComplaint />} />
                <Route path="/student/complaints/:id" element={<ComplaintDetail />} />
              </Route>

              {/* Staff Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/staff/complaints/:id" element={<ComplaintDetail />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/complaints" element={<AdminComplaints />} />
                <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
