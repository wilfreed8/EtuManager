import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout';
import { Toaster } from 'react-hot-toast';
import {
  Landing,
  Login,
  AdminDashboard,
  TeacherDashboard,
  Onboarding,
  StudentRegistration,
  UserManagement,
  ClassManagement,
  StudentManagement,
  GradeEntry,
  ReportCardGenerator,
  SuperAdminDashboard,
  Settings
} from './pages';
import './index.css';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Determine which dashboard to show based on role
  const getDashboardComponent = () => {
    if (!user) return null;

    if (user.is_super_admin) {
      return <SuperAdminDashboard user={user} />;
    }

    if (['PROVISEUR', 'CENSEUR', 'SECRETAIRE'].includes(user.role)) {
      return <AdminDashboard user={user} />;
    }

    return <TeacherDashboard user={user} />;
  };

  return (
    <>
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              user ? (
                <MainLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route path="dashboard" element={getDashboardComponent()} />

            {/* Academic Routes */}
            <Route path="students" element={<StudentManagement user={user} />} />
            <Route path="students/register" element={<StudentRegistration user={user} />} />
            <Route path="teachers" element={<UserManagement user={user} />} />
            <Route path="classes" element={<ClassManagement user={user} />} />
            <Route path="my-classes" element={<TeacherDashboard user={user} />} />
            <Route path="grades" element={<GradeEntry user={user} />} />
            <Route path="reports" element={<ReportCardGenerator user={user} />} />
            <Route path="settings" element={<Settings user={user} />} />

            {/* Super Admin Routes */}
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="super-admin/schools" element={<div className="p-8 text-center text-gray-500">Gestion des Établissements (TBD)</div>} />
            <Route path="super-admin/users" element={<div className="p-8 text-center text-gray-500">Gestion des Utilisateurs (TBD)</div>} />
            <Route path="super-admin/settings" element={<div className="p-8 text-center text-gray-500">Paramètres Plateforme (TBD)</div>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
