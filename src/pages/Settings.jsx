import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, School, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const Settings = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [establishment, setEstablishment] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        period_type: 'TRIMESTRE',
    });

    // Grading Config State (Generic JSON editor style or specific fields)
    // Assuming simple structure for now or just school details + grading type
    // The user mentioned "toutes les informations saisie lors de l onboarding"
    // Onboarding had: schoolName, schoolType, schoolAddress, schoolPhone, academicYear, periodType, gradingWeights.

    // We'll focus on School Details first. Academic Year/Periods are complex to change mid-year.

    useEffect(() => {
        const fetchEstablishment = async () => {
            if (!user?.establishment_id) return;
            try {
                const response = await api.get(`/establishments/${user.establishment_id}`);
                setEstablishment(response.data);
                setFormData({
                    name: response.data.name || '',
                    type: response.data.type || '',
                    address: response.data.address || '',
                    phone: response.data.phone || '',
                    period_type: response.data.period_type || 'TRIMESTRE'
                });
            } catch (error) {
                console.error(error);
                toast.error("Erreur chargement paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchEstablishment();
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                            <h2 className="font-semibold text-gray-900">Année Scolaire</h2>
                        </div>
                        <div className="py-2">
                            <p className="text-sm text-gray-500">Année Active</p>
                            <p className="font-bold text-lg text-green-600">{user?.establishment?.active_academic_year?.label || 'Non définie'}</p>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
