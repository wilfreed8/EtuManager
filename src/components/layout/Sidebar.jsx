import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    Settings,
    LogOut,
    Building2,
    Shield
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
    const location = useLocation();

    // Navigation items based on user role
    const getNavItems = () => {
        const isSuperAdmin = user?.is_super_admin;
        const role = user?.role;

        if (isSuperAdmin) {
            return [
                { icon: Shield, label: 'Platform', path: '/super-admin' },
                { icon: Building2, label: 'Établissements', path: '/super-admin/schools' },
                { icon: Users, label: 'Utilisateurs', path: '/super-admin/users' },
                { icon: Settings, label: 'Paramètres', path: '/super-admin/settings' },
            ];
        }

        if (role === 'PROVISEUR' || role === 'CENSEUR') {
            return [
                { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
                { icon: GraduationCap, label: 'Élèves', path: '/students' },
                { icon: Users, label: 'Enseignants', path: '/teachers' },
                { icon: BookOpen, label: 'Classes', path: '/classes' },
                { icon: FileText, label: 'Bulletins', path: '/reports' },
                { icon: Settings, label: 'Paramètres', path: '/settings' },
            ];
        }

        if (role === 'SECRETAIRE') {
            return [
                { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
                { icon: GraduationCap, label: 'Élèves', path: '/students' },
                { icon: BookOpen, label: 'Classes', path: '/classes' },
            ];
        }

        // Teacher
        return [
            { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
            { icon: BookOpen, label: 'Mes Classes', path: '/my-classes' },
            { icon: FileText, label: 'Saisie des notes', path: '/grades' },
        ];
    };

    const navItems = getNavItems();

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40"
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">EduManager</h1>
                        <p className="text-xs text-gray-500">
                            {user?.is_super_admin ? 'Super Admin' : 'Portail Scolaire'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        location.pathname.startsWith(item.path + '/');
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                transition-all duration-200
                ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-sm font-medium text-gray-600">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.role || 'Role'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
