import { Bell, Search, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user }) => {
    const location = useLocation();

    // Generate breadcrumbs from path
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Accueil', path: '/' }];

        const labels = {
            'dashboard': 'Tableau de bord',
            'students': 'Élèves',
            'teachers': 'Enseignants',
            'classes': 'Classes',
            'grades': 'Notes',
            'reports': 'Bulletins',
            'settings': 'Paramètres',
            'super-admin': 'Super Admin',
            'schools': 'Établissements',
            'users': 'Utilisateurs',
            'my-classes': 'Mes Classes',
        };

        let currentPath = '';
        paths.forEach((path) => {
            currentPath += `/${path}`;
            breadcrumbs.push({
                label: labels[path] || path,
                path: currentPath,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        {index === breadcrumbs.length - 1 ? (
                            <span className="text-gray-900 font-medium">{crumb.label}</span>
                        ) : (
                            <Link
                                to={crumb.path}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-medium text-gray-600">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
