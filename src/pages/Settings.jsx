import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Building2, School, AlertCircle, Upload, Lock, X, Plus, Check, CheckCircle2, Info } from 'lucide-react';
import { Card, Button, Input, Select } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const Settings = ({ user, onUpdateUser }) => {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [periods, setPeriods] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    // Unified selection state
    const [selectedYearId, setSelectedYearId] = useState('');
    const [selectedPeriodId, setSelectedPeriodId] = useState('');

    const [establishment, setEstablishment] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(true);
    const [password, setPassword] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [showNewYearModal, setShowNewYearModal] = useState(false);
    const [hasTeachers, setHasTeachers] = useState(false); // Track if there are teachers to copy
    const [newYearData, setNewYearData] = useState({
        label: '',
        start_date: '',
        end_date: '',
        copy_teachers: false,
        initial_active_period: 1 // Default to 1st period
    });

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        period_type: 'TRIMESTRE',
        bulletin_template: 'template1',
    });

    const isAdmin = ['PROVISEUR', 'CENSEUR', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    // Password verification
    const handlePasswordVerify = async () => {
        try {
            const response = await api.post('/verify-password', { password });
            if (response.data.valid) {
                setIsVerified(true);
                setShowPasswordModal(false);
                toast.success('Accès autorisé');
            }
        } catch (error) {
            toast.error('Mot de passe incorrect');
        }
    };

    useEffect(() => {
        if (!isVerified) return;

        const fetchData = async () => {
            if (!user?.establishment_id) return;
            try {
                const estResponse = await api.get(`/establishments/${user.establishment_id}`);
                setEstablishment(estResponse.data);
                setFormData({
                    name: estResponse.data.name || '',
                    type: estResponse.data.type || '',
                    address: estResponse.data.address || '',
                    phone: estResponse.data.phone || '',
                    period_type: estResponse.data.period_type || 'TRIMESTRE',
                    bulletin_template: estResponse.data.bulletin_template || 'template1',
                });

                if (estResponse.data.logo) {
                    setLogoPreview(estResponse.data.logo);
                }

                // Fetch academic years - with error handling
                try {
                    const yearsResponse = await api.get('/academic-years');
                    setAcademicYears(yearsResponse.data || []);
                    setSelectedYearId(estResponse.data.selected_academic_year_id || estResponse.data.active_academic_year?.id || '');
                } catch (err) {
                    console.error('Error fetching years:', err);
                    setAcademicYears([]);
                }

                // Check for existing teachers
                try {
                    const teachersResponse = await api.get(`/users?role=ENSEIGNANT&establishment_id=${user.establishment_id}`);
                    setHasTeachers(teachersResponse.data && teachersResponse.data.length > 0);
                } catch (err) {
                    console.error('Error checking teachers:', err);
                    setHasTeachers(false);
                }

            } catch (error) {
                console.error('Settings error:', error);
                toast.error(error.response?.data?.message || "Erreur chargement paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, isVerified]);

    // Fetch periods whenever selectedYear changes (local state)
    useEffect(() => {
        const fetchPeriods = async () => {
            if (!selectedYearId) return;
            try {
                const periodResponse = await api.get('/periods', {
                    params: { academic_year_id: selectedYearId }
                });
                const fetchedPeriods = periodResponse.data || [];
                setPeriods(fetchedPeriods);

                // Pre-select the active period if exists
                const active = fetchedPeriods.find(p => p.is_active);
                if (active) setSelectedPeriodId(active.id);
            } catch (err) {
                console.error('Error fetching periods:', err);
                setPeriods([]);
            }
        };
        fetchPeriods();
    }, [selectedYearId]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('logo', file);

        try {
            const response = await api.post(`/establishments/${user.establishment_id}/logo`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setLogoPreview(response.data.logo);
            toast.success('Logo mis à jour');
        } catch (error) {
            toast.error('Erreur lors du téléchargement');
        }
    };



    const handleSavePeriod = async () => {
        if (!selectedPeriodId) return;

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <AlertCircle className="h-10 w-10 text-amber-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Confirmation Requise</p>
                            <p className="mt-1 text-sm text-gray-500">Voulez-vous vraiment changer la période active ? Cela affectera l'affichage pour tous les utilisateurs.</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.post(`/periods/${selectedPeriodId}/activate`);
                                toast.success("Période active mise à jour");
                                // Refresh periods
                                const response = await api.get('/periods', {
                                    params: { academic_year_id: establishment.selected_academic_year_id || establishment.active_academic_year.id }
                                });
                                setPeriods(response.data);
                                if (onUpdateUser) onUpdateUser();
                            } catch (error) {
                                toast.error("Erreur lors de l'activation");
                            }
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleActivateYear = async (yearId) => {
        if (!yearId) return;
        const year = academicYears.find(y => y.id === yearId);

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-amber-500`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <AlertCircle className="h-10 w-10 text-amber-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Passer en "LIVE" : {year?.label}</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Attention : Cette action définit officiellement l'année scolaire de référence pour toute l'école. Tous les personnels seront basculés sur cette année par défaut.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.post(`/academic-years/${yearId}/activate`);
                                toast.success(`L'année ${year?.label} est maintenant en LIVE !`);
                                if (onUpdateUser) onUpdateUser();
                                // Refresh years list to update badges
                                const yearsResponse = await api.get('/academic-years');
                                setAcademicYears(yearsResponse.data);
                            } catch (error) {
                                toast.error('Erreur lors de l\'activation');
                            }
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const handleSaveYear = async () => {
        if (!selectedYearId) return;

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <Info className="h-10 w-10 text-blue-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Changement d'Espace de Travail</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Vous allez basculer sur l'année sélectionnée. Toutes vos actions (ajout d'élèves, classes...) se feront dans cette année.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.post(`/academic-years/${selectedYearId}/select`);
                                toast.success('Année académique sélectionnée');
                                if (onUpdateUser) onUpdateUser();
                            } catch (error) {
                                toast.error('Erreur lors de la sélection');
                            }
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleCreateYear = async () => {
        try {
            const response = await api.post('/academic-years', newYearData);
            toast.success('Nouvelle année créée');

            // Auto-select the new year
            if (response.data && response.data.id) {
                await api.post(`/academic-years/${response.data.id}/select`);
                setSelectedYearId(response.data.id);
                if (onUpdateUser) onUpdateUser();
            }

            setShowNewYearModal(false);
            // Refresh years
            const yearsResponse = await api.get('/academic-years');
            setAcademicYears(yearsResponse.data);
            setNewYearData({ label: '', start_date: '', end_date: '', copy_teachers: false, initial_active_period: 1 });
            if (onUpdateUser) onUpdateUser();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la création');
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await api.put(`/establishments/${user.establishment_id}`, formData);
            toast.success("Paramètres mis à jour avec succès");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    if (!isVerified) {
        return (
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Vérification Requise</h2>
                                    <p className="text-sm text-gray-500">Accès aux paramètres administrateur</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Pour des raisons de sécurité, veuillez confirmer votre mot de passe avant d'accéder aux paramètres.
                            </p>

                            <Input
                                type="password"
                                label="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Entrez votre mot de passe"
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerify()}
                            />

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handlePasswordVerify}
                                    className="flex-1"
                                >
                                    Vérifier
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'Établissement</h1>
                <p className="text-gray-500 mt-1">Modifiez les informations générales de votre école.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <Building2 className="text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Informations Générales</h2>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Nom de l'établissement"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Type d'enseignement"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={saving}
                                >
                                    <option value="General">Enseignement Général</option>
                                    <option value="Technique">Enseignement Technique</option>
                                    <option value="Professionnel">Formation Professionnelle</option>
                                </Select>

                                <Select
                                    label="Système Périodique"
                                    name="period_type"
                                    value={formData.period_type}
                                    onChange={handleChange}
                                    disabled={true}
                                >
                                    <option value="TRIMESTRE">Trimestre</option>
                                    <option value="SEMESTRE">Semestre</option>
                                </Select>
                            </div>

                            <Input
                                label="Adresse postale / Localisation"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={saving}
                            />

                            <Input
                                label="Téléphone Officiel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={saving}
                            />

                            {/* Bulletin Template Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Modèle de Bulletin
                                    </label>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="text-xs"
                                    >
                                        Sauvegarder le modèle
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'template1', img: '/images/template1.png' },
                                        { id: 'template2', img: '/images/template2.png' },
                                        { id: 'template3', img: '/images/template3.png' }
                                    ].map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bulletin_template: template.id })}
                                            className={`relative p-3 border-2 rounded-xl transition-all group ${formData.bulletin_template === template.id
                                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="aspect-[3/4] bg-white rounded-lg mb-3 overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                <img
                                                    src={template.img}
                                                    alt={`Template ${template.id.slice(-1)}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`text-sm font-medium ${formData.bulletin_template === template.id ? 'text-blue-700' : 'text-gray-600'}`}>
                                                    Modèle {template.id.slice(-1)}
                                                </span>
                                                {formData.bulletin_template === template.id && (
                                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo de l'établissement
                                </label>
                                <div className="flex items-center gap-4">
                                    {logoPreview && (
                                        <img
                                            src={logoPreview}
                                            alt="Logo"
                                            className="w-20 h-20 object-contain border rounded-lg"
                                        />
                                    )}
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">Télécharger</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    loading={saving}
                                    disabled={saving}
                                    icon={Save}
                                >
                                    Enregistrer les modifications
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900">Note Importante</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Certaines modifications comme le système périodique ne peuvent être modifiées qu'en début d'année scolaire.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <School className="text-gray-400" />
                                <h2 className="font-semibold text-gray-900">Année Académique</h2>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowNewYearModal(true)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-blue-600" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Année Sélectionnée</p>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Select
                                            value={selectedYearId}
                                            onChange={(e) => setSelectedYearId(e.target.value)}
                                        >
                                            {academicYears.map(year => (
                                                <option key={year.id} value={year.id}>
                                                    {year.label} {year.is_active ? '(LIVE)' : ''}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleSaveYear}
                                        disabled={selectedYearId === (establishment?.selected_academic_year_id || establishment?.active_academic_year?.id)}
                                        className={selectedYearId === (establishment?.selected_academic_year_id || establishment?.active_academic_year?.id) ? 'opacity-50' : ''}
                                    >
                                        Espace de travail
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleActivateYear(selectedYearId)}
                                        disabled={academicYears.find(y => y.id === selectedYearId)?.is_active}
                                        className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${academicYears.find(y => y.id === selectedYearId)?.is_active ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        Activer (Live)
                                    </Button>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Période Active</p>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Select
                                                value={selectedPeriodId}
                                                onChange={(e) => setSelectedPeriodId(e.target.value)}
                                                placeholder="Sélectionner la période active"
                                            >
                                                {periods.map(period => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name} {period.is_active ? '(Actuelle)' : ''}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleSavePeriod}
                                            disabled={!selectedPeriodId || periods.find(p => p.id === selectedPeriodId)?.is_active}
                                            className={!selectedPeriodId || periods.find(p => p.id === selectedPeriodId)?.is_active ? 'opacity-50' : ''}
                                        >
                                            Valider
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* New Year Modal */}
            <AnimatePresence>
                {showNewYearModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Nouvelle Année Académique</h2>
                                <button
                                    onClick={() => setShowNewYearModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Libellé (ex: 2024-2025)"
                                    value={newYearData.label}
                                    onChange={(e) => setNewYearData({ ...newYearData, label: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Date de début"
                                        type="date"
                                        value={newYearData.start_date}
                                        onChange={(e) => setNewYearData({ ...newYearData, start_date: e.target.value })}
                                    />
                                    <Input
                                        label="Date de fin"
                                        type="date"
                                        value={newYearData.end_date}
                                        onChange={(e) => setNewYearData({ ...newYearData, end_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Période Active Initiale
                                    </label>
                                    <Select
                                        value={newYearData.initial_active_period}
                                        onChange={(e) => setNewYearData({ ...newYearData, initial_active_period: parseInt(e.target.value) })}
                                        className="w-full h-11 text-sm text-gray-900 bg-gray-50 border-none rounded-2xl"
                                    >
                                        <option value={1}>1ère Période (Trimestre 1 / Semestre 1)</option>
                                        <option value={2}>2ème Période</option>
                                        <option value={3}>3ème Période (Si Trimestre)</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewYearModal(false)}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleCreateYear}
                                    className="flex-1"
                                    disabled={!newYearData.label || !newYearData.start_date || !newYearData.end_date}
                                >
                                    Créer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Settings;
