import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Shield,
    Database,
    Monitor,
    HardDrive,
    Wifi,
    AlertTriangle,
    CheckCircle,
    Activity,
    TrendingUp,
    Users,
    Building2,
    RefreshCw,
    Save,
    Edit,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Download,
    Upload,
    Plus,
    Trash2,
    Search,
    Filter
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal, StatsCard } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const PlatformSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingSettingId, setDeletingSettingId] = useState(null);
    const [backingUp, setBackingUp] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        value: '',
        description: '',
        type: 'string',
        category: 'general'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/super-admin/settings').catch(() => ({ data: [] }));
            setSettings(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            toast.error('Erreur lors du chargement des paramètres');
            setSettings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedSetting) {
                await api.put(`/super-admin/settings/${selectedSetting.id}`, formData);
                toast.success('Paramètre mis à jour avec succès');
            } else {
                await api.post('/super-admin/settings', formData);
                toast.success('Paramètre créé avec succès');
            }
            setShowModal(false);
            fetchSettings();
            resetForm();
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (setting) => {
        setSelectedSetting(setting);
        setFormData({
            key: setting.key,
            value: setting.value,
            description: setting.description,
            type: setting.type,
            category: setting.category
        });
        setShowModal(true);
    };

    const handleDelete = async (settingId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
            setDeletingSettingId(settingId);
            try {
                await api.delete(`/super-admin/settings/${settingId}`);
                toast.success('Paramètre supprimé avec succès');
                fetchSettings();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            } finally {
                setDeletingSettingId(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            key: '',
            value: '',
            description: '',
            type: 'string',
            category: 'general'
        });
        setSelectedSetting(null);
    };

    const handleBackup = async () => {
        setBackingUp(true);
        try {
            const response = await api.post('/super-admin/backup');
            toast.success('Sauvegarde créée avec succès');
            // Télécharger le fichier de sauvegarde
            const link = document.createElement('a');
            link.href = response.data.download_url;
            link.download = response.data.filename;
            link.click();
        } catch (error) {
            toast.error('Erreur lors de la création de la sauvegarde');
        } finally {
            setBackingUp(false);
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backup_file', file);

        setRestoring(true);
        try {
            await api.post('/super-admin/restore', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Restauration effectuée avec succès');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            toast.error('Erreur lors de la restauration');
        } finally {
            setRestoring(false);
        }
    };

    const systemStats = {
        total_schools: settings.total_schools || 0,
        total_users: settings.total_users || 0,
        total_students: settings.total_students || 0,
        storage_used: settings.storage_used || '0 GB',
        database_size: settings.database_size || '0 MB',
        last_backup: settings.last_backup || 'Jamais',
        system_version: settings.system_version || '1.0.0',
        uptime: settings.uptime || '99.9%'
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
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Écoles" value={systemStats.total_schools} icon={<Building2 className="w-5 h-5" />} />
                <StatsCard label="Utilisateurs" value={systemStats.total_users} icon={<Users className="w-5 h-5" />} />
                <StatsCard label="Étudiants" value={systemStats.total_students} icon={<Shield className="w-5 h-5" />} />
                <StatsCard label="Uptime" value={systemStats.uptime} icon={<Activity className="w-5 h-5" />} type="highlight" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard label="Stockage" value={systemStats.storage_used} icon={<HardDrive className="w-5 h-5" />} />
                <StatsCard label="Base de données" value={systemStats.database_size} icon={<Database className="w-5 h-5" />} />
                <StatsCard label="Version" value={systemStats.system_version} icon={<Monitor className="w-5 h-5" />} />
            </div>

            {/* Quick Actions */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            onClick={handleBackup}
                            icon={Download}
                            variant="outline"
                            className="w-full"
                            loading={backingUp}
                            disabled={backingUp || restoring || saving}
                        >
                            Sauvegarder
                        </Button>
                        <label className="block">
                            <Button
                                icon={Upload}
                                variant="outline"
                                className="w-full cursor-pointer"
                                loading={restoring}
                                disabled={backingUp || restoring || saving}
                            >
                                Restaurer
                            </Button>
                            <input
                                type="file"
                                accept=".sql,.zip"
                                onChange={handleRestore}
                                className="hidden"
                                disabled={backingUp || restoring || saving}
                            />
                        </label>
                        <Button
                            onClick={() => window.open('/super-admin/logs', '_blank')}
                            icon={Eye}
                            variant="outline"
                            className="w-full"
                        >
                            Voir Logs
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            icon={RefreshCw}
                            variant="outline"
                            className="w-full"
                        >
                            Rafraîchir
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Settings Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Paramètres Généraux</h3>
                            <Button
                                onClick={() => {
                                    setFormData({...formData, category: 'general'});
                                    setShowModal(true);
                                }}
                                icon={Plus}
                                size="sm"
                                disabled={saving || deletingSettingId !== null}
                            >
                                Ajouter
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {Array.isArray(settings) && settings.filter(s => s.category === 'general').map((setting, index) => (
                                <motion.div
                                    key={setting.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{setting.key}</div>
                                        <div className="text-sm text-gray-500">{setting.description}</div>
                                        <div className="text-sm font-medium text-blue-600">{setting.value}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(setting)}
                                            icon={Edit}
                                            disabled={saving || deletingSettingId === setting.id}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(setting.id)}
                                            icon={Trash2}
                                            loading={deletingSettingId === setting.id}
                                            disabled={saving || deletingSettingId === setting.id}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Security Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                            <Button
                                onClick={() => {
                                    setFormData({...formData, category: 'security'});
                                    setShowModal(true);
                                }}
                                icon={Plus}
                                size="sm"
                                disabled={saving || deletingSettingId !== null}
                            >
                                Ajouter
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {Array.isArray(settings) && settings.filter(s => s.category === 'security').map((setting, index) => (
                                <motion.div
                                    key={setting.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{setting.key}</div>
                                        <div className="text-sm text-gray-500">{setting.description}</div>
                                        <div className="text-sm font-medium text-blue-600">{setting.value}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(setting)}
                                            icon={Edit}
                                            disabled={saving || deletingSettingId === setting.id}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(setting.id)}
                                            icon={Trash2}
                                            loading={deletingSettingId === setting.id}
                                            disabled={saving || deletingSettingId === setting.id}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Add/Edit Setting Modal */}
            <Modal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={selectedSetting ? 'Modifier le paramètre' : 'Nouveau paramètre'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Clé du paramètre</label>
                        <Input
                            value={formData.key}
                            onChange={(e) => setFormData({...formData, key: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
                        <textarea
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="string">Texte</option>
                                <option value="number">Nombre</option>
                                <option value="boolean">Booléen</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="general">Général</option>
                                <option value="security">Sécurité</option>
                                <option value="email">Email</option>
                                <option value="storage">Stockage</option>
                            </select>
                        </div>
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
                            disabled={saving || !formData.key || !formData.value}
                        >
                            {selectedSetting ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default PlatformSettings;
