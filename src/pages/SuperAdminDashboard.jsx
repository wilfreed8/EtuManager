import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Settings,
    Activity,
    Plus,
    MoreVertical,
    Search,
    Filter,
    Shield,
    CreditCard,
    Ban,
    CheckCircle2,
    ExternalLink,
    Trash2,
    Edit
} from 'lucide-react';
import { Card, Button, Input, Badge, StatsCard } from '../components/ui';

// Mock list of schools
const initialSchools = [
    { id: 1, name: 'Lycée Moderne de Tokoin', location: 'Lomé, Togo', type: 'LYCEE', students: 1240, teachers: 84, status: 'Active', plan: 'Enterprise', createdAt: '2024-01-15' },
    { id: 2, name: 'Collège Notre Dame', location: 'Atakpamé, Togo', type: 'COLLEGE', students: 650, teachers: 32, status: 'Active', plan: 'Pro', createdAt: '2024-03-22' },
    { id: 3, name: 'EPP Centrale Kara', location: 'Kara, Togo', type: 'PRIMAIRE', students: 420, teachers: 15, status: 'Expired', plan: 'Free', createdAt: '2023-11-05' },
    { id: 4, name: 'Lycée de Tsévié', location: 'Tsévié, Togo', type: 'LYCEE', students: 980, teachers: 56, status: 'Active', plan: 'Pro', createdAt: '2024-02-10' },
    { id: 5, name: 'Institution Ste Thérèse', location: 'Kpalimé, Togo', type: 'COLLEGE', students: 310, teachers: 22, status: 'Suspended', plan: 'Enterprise', createdAt: '2024-05-18' },
];

const SuperAdminDashboard = () => {
    const [schools, setSchools] = useState(initialSchools);
    const [search, setSearch] = useState('');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Console d'Administration Platforme
                    </h1>
                    <p className="text-gray-500 mt-1">Super Admin Dashboard • Gestion globale du SaaS EduManager</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={Activity}>Système</Button>
                    <Button icon={Plus}>Nouvel Établissement</Button>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total Écoles" value={152} icon={Building2} trend={12} variant="primary" />
                <StatsCard title="Total Utilisateurs" value="14.2k" icon={Users} trend={8} />
                <StatsCard title="Revenu Mensuel (MRR)" value="8.4M FCFA" icon={CreditCard} trend={15} />
                <StatsCard title="Uptime Système" value="99.9%" icon={Activity} variant="success" />
            </div>

            {/* Schools Management */}
            <Card className="p-0 overflow-hidden">
                <Card.Header className="p-6 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Card.Title>Gestion des Établissements</Card.Title>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une école..."
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" icon={Filter}>Filtres</Button>
                        </div>
                    </div>
                </Card.Header>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Nom de l'Institution</th>
                                <th className="px-6 py-4">Type & Localisation</th>
                                <th className="px-6 py-4">Utilisateurs</th>
                                <th className="px-6 py-4">Plan / Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((school) => (
                                <tr key={school.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {school.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{school.name}</span>
                                                <span className="text-xs text-gray-400">Inscrit le {school.createdAt}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-600">{school.type}</span>
                                            <span className="text-xs text-gray-400">{school.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{school.students} Élèves</span>
                                            <span className="text-xs text-gray-500">{school.teachers} Profs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Badge variant="primary" size="sm">{school.plan}</Badge>
                                            <Badge
                                                variant={
                                                    school.status === 'Active' ? 'success' :
                                                        school.status === 'Expired' ? 'warning' : 'danger'
                                                }
                                                size="sm"
                                                dot
                                            >
                                                {school.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" icon={ExternalLink} />
                                            <Button variant="secondary" size="sm" icon={Edit} />
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" icon={Trash2} />
                                        </div>
                                        <MoreVertical className="w-5 h-5 text-gray-400 group-hover:hidden ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Affichage de {schools.length} établissements actifs</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Précédent</Button>
                        <Button variant="outline" size="sm" disabled>Suivant</Button>
                    </div>
                </div>
            </Card>

            {/* Audit Logs Quick View */}
            <Card>
                <Card.Header>
                    <div className="flex items-center justify-between">
                        <Card.Title>Logs Système Récents</Card.Title>
                        <Badge variant="pending">Live</Badge>
                    </div>
                </Card.Header>
                <div className="space-y-4 pt-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-500">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">Nouvelle école <span className="font-semibold text-blue-600">Complex St Joseph</span> a finalisé l'onboarding.</p>
                                <p className="text-xs text-gray-400 mt-1">Il y a {i * 15} minutes • Action système</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
};

export default SuperAdminDashboard;
