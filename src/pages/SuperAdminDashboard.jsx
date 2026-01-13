import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Settings,
    RefreshCw,
    CheckCircle,
    Ban,
    Shield
} from 'lucide-react';
import { Card, Button, StatsCard } from '../components/ui';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SuperAdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [schools, setSchools] = useState([]);
    const [platformUsers, setPlatformUsers] = useState([]);
    const [settings, setSettings] = useState(null);

    const stats = useMemo(() => {
        const totalSchools = schools.length;
        const activeSchools = schools.filter(s => s?.is_active).length;
        const blockedSchools = totalSchools - activeSchools;

        const totalUsers = platformUsers.length;
        const admins = platformUsers.filter(u => u?.role === 'ADMIN' || u?.role === 'PROVISEUR' || u?.role === 'CENSEUR' || u?.role === 'SECRETAIRE').length;

        return {
            totalSchools,
            activeSchools,
            blockedSchools,
            totalUsers,
            admins,
            hasSettings: !!settings
        };
    }, [schools, platformUsers, settings]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [schoolsRes, usersRes, settingsRes] = await Promise.all([
                api.get('/super-admin/schools').catch(() => ({ data: [] })),
                api.get('/super-admin/users').catch(() => ({ data: [] })),
                api.get('/super-admin/settings').catch(() => ({ data: null }))
            ]);

            setSchools(Array.isArray(schoolsRes.data) ? schoolsRes.data : []);
            setPlatformUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setSettings(settingsRes.data || null);
        } catch (e) {
            console.error('Erreur lors du chargement du dashboard super-admin:', e);
            toast.error('Erreur lors du chargement du dashboard super-admin');
            // Set empty data to prevent crashes
            setSchools([]);
            setPlatformUsers([]);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Card>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
                            </div>
                            <p className="text-gray-500 mt-1">
                                Pilotage global de la plateforme
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                icon={RefreshCw}
                                onClick={fetchAll}
                                disabled={loading}
                            >
                                Actualiser
                            </Button>
                            <Button onClick={() => navigate('/super-admin/schools')} icon={Building2}>
                                Établissements
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    label="Total établissements"
                    value={loading ? '...' : stats.totalSchools}
                    icon={<Building2 className="w-6 h-6" />}
                />
                <StatsCard
                    label="Actifs"
                    value={loading ? '...' : stats.activeSchools}
                    icon={<CheckCircle className="w-6 h-6" />}
                    type="highlight"
                />
                <StatsCard
                    label="Bloqués"
                    value={loading ? '...' : stats.blockedSchools}
                    icon={<Ban className="w-6 h-6" />}
                    type="alert"
                />
                <StatsCard
                    label="Utilisateurs plateforme"
                    value={loading ? '...' : stats.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Établissements</h3>
                                <p className="text-sm text-gray-500 mt-1">Création, édition, activation/désactivation</p>
                            </div>
                            <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button className="flex-1" onClick={() => navigate('/super-admin/schools')}>
                                Gérer
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/super-admin/schools')}
                            >
                                Voir la liste
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
                                <p className="text-sm text-gray-500 mt-1">Admins, proviseurs, censeurs, secrétaires</p>
                            </div>
                            <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button className="flex-1" onClick={() => navigate('/super-admin/users')}>
                                Gérer
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/super-admin/users')}
                            >
                                Voir la liste
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Paramètres plateforme</h3>
                                <p className="text-sm text-gray-500 mt-1">Configuration globale, sauvegardes</p>
                            </div>
                            <Settings className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button className="flex-1" onClick={() => navigate('/super-admin/settings')}>
                                Ouvrir
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/super-admin/settings')}
                            >
                                Configurer
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default SuperAdminDashboard;
