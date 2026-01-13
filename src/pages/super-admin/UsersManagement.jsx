import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Settings,
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    MapPin,
    Calendar,
    UserPlus,
    Key,
    Filter,
    MoreVertical,
    AlertTriangle,
    Building2,
    BookOpen,
    Activity,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal, StatsCard } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        establishment_id: '',
        phone: '',
        address: '',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
        fetchSchools();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/super-admin/users').catch(() => ({ data: [] }));
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const response = await api.get('/super-admin/schools').catch(() => ({ data: [] }));
            setSchools(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des établissements:', error);
            toast.error('Erreur lors du chargement des établissements');
            setSchools([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = selectedUser 
                ? { ...formData, _method: 'PUT' }
                : formData;
                
            if (selectedUser) {
                await api.put(`/super-admin/users/${selectedUser?.id}`, submitData);
                toast.success('Utilisateur mis à jour avec succès');
            } else {
                await api.post('/super-admin/users', submitData);
                toast.success('Utilisateur créé avec succès');
            }
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || 'ADMIN',
            establishment_id: user?.establishment_id || '',
            phone: user?.phone || '',
            address: user?.address || '',
            is_active: user?.is_active ?? true
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await api.delete(`/super-admin/users/${userId}`);
                toast.success('Utilisateur supprimé avec succès');
                fetchUsers();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.put(`/super-admin/users/${user?.id}/toggle-status`);
            toast.success(`Utilisateur ${user?.is_active ? 'désactivé' : 'activé'} avec succès`);
            fetchUsers();
        } catch (error) {
            toast.error('Erreur lors du changement de statut');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'ADMIN',
            establishment_id: '',
            phone: '',
            address: '',
            is_active: true
        });
        setSelectedUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user?.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        super_admin: users.filter(u => u.is_super_admin).length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        teacher: users.filter(u => u.role === 'ENSEIGNANT').length,
        secretary: users.filter(u => u.role === 'SECRETAIRE').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Total Utilisateurs" value={stats.total} icon={<Users className="w-5 h-5" />} />
                <StatsCard label="Actifs" value={stats.active} icon={<CheckCircle className="w-5 h-5" />} type="highlight" />
                <StatsCard label="Inactifs" value={stats.inactive} icon={<XCircle className="w-5 h-5" />} type="alert" />
                <StatsCard label="Super Admins" value={stats.super_admin} icon={<Shield className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard label="Admins" value={stats.admin} icon={<Users className="w-5 h-5" />} />
                <StatsCard label="Enseignants" value={stats.teacher} icon={<BookOpen className="w-5 h-5" />} />
                <StatsCard label="Secrétaires" value={stats.secretary} icon={<BookOpen className="w-5 h-5" />} />
                <StatsCard label="Établissements" value={schools.length} icon={<Building2 className="w-5 h-5" />} />
            </div>

            {/* Header Actions */}
            <Card>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
                            <p className="text-gray-500 mt-1">Gérez tous les utilisateurs de la plateforme</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tous les rôles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="ENSEIGNANT">Enseignant</option>
                                <option value="SECRETAIRE">Secrétaire</option>
                            </select>
                            <Button
                                onClick={() => setShowModal(true)}
                                icon={Plus}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Nouvel Utilisateur
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left p-4 font-semibold text-gray-900">Utilisateur</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Rôle</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Établissement</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Statut</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                (() => {
                                    const isActive = !!user?.is_active;
                                    const StatusIcon = isActive ? XCircle : CheckCircle;
                                    return (
                                <motion.tr
                                    key={user?.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{user?.name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{user?.email || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={
                                            user?.is_super_admin ? 'primary' : 
                                            user?.role === 'ADMIN' ? 'secondary' : 
                                            user?.role === 'ENSEIGNANT' ? 'success' : 'warning'
                                        }>
                                            {user?.is_super_admin ? 'Super Admin' : user?.role || 'N/A'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Building2 className="w-4 h-4" />
                                            {user?.establishment?.name || 'Non assigné'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            {user?.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    {user?.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {user?.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={user?.is_active ? 'success' : 'danger'}>
                                            {user?.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                                icon={Edit}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                variant={isActive ? 'warning' : 'success'}
                                                size="sm"
                                                onClick={() => handleToggleStatus(user)}
                                                icon={StatusIcon}
                                            >
                                                {isActive ? 'Désactiver' : 'Activer'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(user.id)}
                                                icon={Trash2}
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                                    );
                                })()
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {!selectedUser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Laisser vide pour ne pas changer"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="ENSEIGNANT">Enseignant</option>
                                <option value="SECRETAIRE">Secrétaire</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Établissement</label>
                            <select
                                value={formData.establishment_id}
                                onChange={(e) => setFormData({...formData, establishment_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionner un établissement</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                            Utilisateur actif
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={!formData.name || !formData.email}
                        >
                            {selectedUser ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default UsersManagement;
