import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, School, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const Settings = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [periods, setPeriods] = useState([]);
    const [establishment, setEstablishment] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        period_type: 'TRIMESTRE',
    });
    const isAdmin = ['PROVISEUR', 'CENSEUR', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    useEffect(() => {
        const fetchEstablishmentData = async () => {
            if (!user?.establishment_id) return;
            try {
                const estResponse = await api.get(`/establishments/${user.establishment_id}`);
                setEstablishment(estResponse.data);
                setFormData({
                    name: estResponse.data.name || '',
                    type: estResponse.data.type || '',
                    address: estResponse.data.address || '',
                    phone: estResponse.data.phone || '',
                    period_type: estResponse.data.period_type || 'TRIMESTRE'
                });

                if (estResponse.data.active_academic_year) {
                    const periodResponse = await api.get('/periods', {
                        params: { academic_year_id: estResponse.data.active_academic_year.id }
                    });
                    setPeriods(periodResponse.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Erreur chargement paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchEstablishmentData();
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleActivatePeriod = async (periodId) => {
        try {
            await api.post(`/periods/${periodId}/activate`);
            toast.success("Semestre actif mis à jour");
            // Refresh periods
            const response = await api.get('/periods', {
                params: { academic_year_id: establishment.active_academic_year.id }
            });
            setPeriods(response.data);
        } catch (error) {
            toast.error("Erreur lors de l'activation");
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="bg-white p-6 rounded-lg h-96"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
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
                                    disabled={true} // Changing period type mid-year is dangerous, keep disabled or warn
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
                                    Certaines modifications comme le système périodique (Trimestre/Semestre) ne peuvent être modifiées qu'en début d'année scolaire pour éviter des incohérences dans les bulletins.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <School className="text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Année & Période Scolaire</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Année Active</p>
                                <p className="font-bold text-lg text-green-600">{establishment?.active_academic_year?.label || 'Non définie'}</p>
                            </div>

                            {isAdmin && (
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Choisir le Semestre Actif</p>
                                    <div className="space-y-2">
                                        {periods.map(period => (
                                            <button
                                                key={period.id}
                                                onClick={() => handleActivatePeriod(period.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${period.is_active
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span>{period.name}</span>
                                                {period.is_active ? (
                                                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Actif</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Activer</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-3 italic">
                                        * Seule la période active est modifiable par les enseignants.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
