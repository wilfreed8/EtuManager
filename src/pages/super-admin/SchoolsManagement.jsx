import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Settings,
    Activity,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    ExternalLink,
    Shield,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    UserPlus,
    Key,
    Mail,
    Phone,
    MapPin,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    School,
    BookOpen,
    FileText
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal, StatsCard } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const SchoolsManagement = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingSchoolId, setDeletingSchoolId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LYCEE',
        city: '',
        phone: '',
        email: '',
        address: '',
        country: 'Côte d\'Ivoire',
        is_active: true
    });

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await api.get('/super-admin/schools').catch(() => ({ data: [] }));
            setSchools(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des établissements:', error);
            toast.error('Erreur lors du chargement des établissements');
            setSchools([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedSchool) {
                await api.put(`/super-admin/schools/${selectedSchool.id}`, formData);
                toast.success('Établissement mis à jour avec succès');
            } else {
                await api.post('/super-admin/schools', formData);
                toast.success('Établissement créé avec succès');
            }
            setShowModal(false);
            fetchSchools();
            resetForm();
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (school) => {
        setSelectedSchool(school);
        setFormData(school);
        setShowModal(true);
    };

    const handleDelete = async (schoolId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
            setDeletingSchoolId(schoolId);
            try {
                await api.delete(`/super-admin/schools/${schoolId}`);
                toast.success('Établissement supprimé avec succès');
                fetchSchools();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            } finally {
                setDeletingSchoolId(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'LYCEE',
            city: '',
            phone: '',
            email: '',
            address: '',
            country: 'Côte d\'Ivoire',
            is_active: true
        });
        setSelectedSchool(null);
    };

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: schools.length,
        active: schools.filter(school => school.is_active).length,
        inactive: schools.filter(school => !school.is_active).length,
        lycee: schools.filter(school => school.type === 'LYCEE').length,
        college: schools.filter(school => school.type === 'COLLEGE').length,
        primaire: schools.filter(school => school.type === 'PRIMAIRE').length
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatsCard label="Total" value={stats.total} icon={<School className="w-5 h-5" />} />
                <StatsCard label="Actifs" value={stats.active} icon={<CheckCircle className="w-5 h-5" />} type="highlight" />
                <StatsCard label="Inactifs" value={stats.inactive} icon={<XCircle className="w-5 h-5" />} type="alert" />
                <StatsCard label="Lycées" value={stats.lycee} icon={<BookOpen className="w-5 h-5" />} />
                <StatsCard label="Collèges" value={stats.college} icon={<BookOpen className="w-5 h-5" />} />
                <StatsCard label="Primaires" value={stats.primaire} icon={<Building2 className="w-5 h-5" />} />
            </div>

            {/* Header Actions */}
            <Card>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestion des Établissements</h2>
                            <p className="text-gray-500 mt-1">Gérez tous les établissements scolaires de la plateforme</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Rechercher un établissement..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Button
                                onClick={() => setShowModal(true)}
                                icon={Plus}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Nouvel Établissement
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Schools Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left p-4 font-semibold text-gray-900">Nom</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Type</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Ville</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Statut</th>
                                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchools.map((school, index) => (
                                <motion.tr
                                    key={school.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{school.name}</div>
                                            <div className="text-sm text-gray-500">{school.address}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={school.type === 'LYCEE' ? 'primary' : school.type === 'COLLEGE' ? 'secondary' : 'success'}>
                                            {school.type}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            {school.city}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                {school.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {school.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={school.is_active ? 'success' : 'danger'}>
                                            {school.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(school)}
                                                icon={Edit}
                                                disabled={saving || deletingSchoolId === school.id}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(school.id)}
                                                icon={Trash2}
                                                loading={deletingSchoolId === school.id}
                                                disabled={saving || deletingSchoolId === school.id}
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
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
                title={selectedSchool ? 'Modifier l\'établissement' : 'Nouvel établissement'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'établissement</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="PRIMAIRE">Primaire</option>
                                <option value="COLLEGE">Collège</option>
                                <option value="LYCEE">Lycée</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            required
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
                            Établissement actif
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
                            disabled={saving}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            loading={saving}
                            disabled={saving || !formData.name}
                        >
                            {selectedSchool ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default SchoolsManagement;
