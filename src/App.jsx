import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout';
import api from './lib/api';
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
  Settings,
  SubjectManagement
} from './pages';
import { SchoolsManagement, UsersManagement, PlatformSettings } from './pages/super-admin';
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

  // Function to determine redirect path based on user role
  const getRedirectPath = () => {
    if (!user) return '/login';

    if (user.is_super_admin) {
      return '/super-admin';
    }

    if (['PROVISEUR', 'CENSEUR', 'SECRETAIRE', 'ADMIN'].includes(user.role)) {
      // Pour les admins d'école, on a besoin de l'établissement
      // Pour l'instant, on utilise un chemin par défaut
      return `/etablissements/admin`;
    }

    // Pour les enseignants
    return `/etablissements/teachers`;
  };

  // Determine which dashboard to show based on role
  const getDashboardComponent = () => {
    if (!user) return null;

    if (user.is_super_admin) {
      return <SuperAdminDashboard user={user} />;
    }

    if (['PROVISEUR', 'CENSEUR', 'SECRETAIRE', 'ADMIN'].includes(user.role)) {
      return <AdminDashboard user={user} />;
    }

    return <TeacherDashboard user={user} />;
  };

  // Function to refresh user data (e.g., after changing settings)
  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data);
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
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
                <Navigate to={getRedirectPath()} replace />
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
            <Route path="subjects" element={<SubjectManagement user={user} />} />
            <Route path="reports" element={<ReportCardGenerator user={user} />} />
            <Route path="settings" element={<Settings user={user} onUpdateUser={refreshUser} />} />

            {/* Super Admin Routes */}
            <Route path="super-admin" element={<SuperAdminDashboard user={user} />} />
            <Route path="super-admin/schools" element={<SchoolsManagement />} />
            <Route path="super-admin/users" element={<UsersManagement />} />
            <Route path="super-admin/settings" element={<PlatformSettings />} />

            {/* Établissements Routes */}
            <Route path="etablissements/admin" element={<AdminDashboard user={user} />} />
            <Route path="etablissements/teachers" element={<TeacherDashboard user={user} />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
