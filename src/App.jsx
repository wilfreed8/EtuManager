import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  GradeEntry,
  ReportCardGenerator,
  SuperAdminDashboard
} from './pages';
import './index.css';

function App() {
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
      return <SuperAdminDashboard />;
    }

    if (user.role === 'PROVISEUR' || user.role === 'CENSEUR' || user.role === 'SECRETAIRE') {
      return <AdminDashboard />;
    }

    return <TeacherDashboard user={user} />;
  };

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Toaster position="top-right" />
        <Routes>
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
            <Route path="students" element={<Navigate to="/students/register" replace />} />
            <Route path="students/register" element={<StudentRegistration />} />
            <Route path="teachers" element={<UserManagement />} />
            <Route path="classes" element={<PlaceholderPage title="Gestion des Classes" />} />
            <Route path="my-classes" element={<TeacherDashboard user={user} />} />
            <Route path="grades" element={<GradeEntry user={user} />} />
            <Route path="reports" element={<ReportCardGenerator />} />
            <Route path="settings" element={<PlaceholderPage title="Paramètres" />} />

            {/* Super Admin Routes */}
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="super-admin/schools" element={<PlaceholderPage title="Gestion des Établissements" />} />
            <Route path="super-admin/users" element={<PlaceholderPage title="Gestion des Utilisateurs" />} />
            <Route path="super-admin/settings" element={<PlaceholderPage title="Paramètres Plateforme" />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

// Temporary placeholder component
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">Cette page sera implémentée prochainement.</p>
      </div>
    </div>
  );
}

export default App;
