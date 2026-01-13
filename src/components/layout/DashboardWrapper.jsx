import React from 'react';
import { SuperAdminDashboard, AdminDashboard, TeacherDashboard } from '../../pages';

const DashboardWrapper = ({ user }) => {
  if (!user) return null;
  if (user.is_super_admin) return <SuperAdminDashboard user={user} />;
  if (['PROVISEUR', 'CENSEUR', 'SECRETAIRE', 'ADMIN'].includes(user.role)) {
    return <AdminDashboard user={user} />;
  }
  return <TeacherDashboard user={user} />;
};

export default DashboardWrapper;
