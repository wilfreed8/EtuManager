import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Clock, FileText, AlertCircle, CheckCircle, Archive } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const AcademicYearForm = ({ academicYear, onSubmit, loading, establishmentId }) => {
    const [formData, setFormData] = useState({
        label: academicYear?.label || '',
        start_date: academicYear?.start_date || '',
        end_date: academicYear?.end_date || '',
        description: academicYear?.description || '',
        tuition_fee: academicYear?.tuition_fee || '',
        registration_fee: academicYear?.registration_fee || '',
        status: academicYear?.status || 'UPCOMING',
        is_active: academicYear?.is_active ?? false,
        is_locked: academicYear?.is_locked ?? false,
        establishment_id: establishmentId || academicYear?.establishment_id || '',
        
        // Configuration
        configuration: academicYear?.configuration || {
            max_absences: 10,
            min_attendance_rate: 75,
            grading_system: '20',
            passing_grade: 10,
            subject_validation_rules: {
                min_subjects_to_pass: 6,
                compulsory_subjects: []
            }
        },
        
        // Échéancier de paiement
        payment_schedule: academicYear?.payment_schedule || [
            {
                name: '1ère tranche',
                amount_percentage: 40,
                due_date: '',
                description: 'Frais d\'inscription + 1ère tranche'
            },
            {
                name: '2ème tranche',
                amount_percentage: 30,
                due_date: '',
                description: '2ème tranche des frais de scolarité'
            },
            {
                name: '3ème tranche',
                amount_percentage: 30,
                due_date: '',
                description: 'Solde des frais de scolarité'
            }
        ],
        
        // Vacances et jours fériés
        holidays: academicYear?.holidays || [
            {
                name: 'Vacances de Noël',
                start_date: '',
                end_date: '',
                type: 'christmas'
            },
            {
                name: 'Vacances de Pâques',
                start_date: '',
                end_date: '',
                type: 'easter'
            },
            {
                name: 'Grandes Vacances',
                start_date: '',
                end_date: '',
                type: 'summer'
            }
        ],
        
        // Dates importantes
        important_dates: academicYear?.important_dates || [
            {
                name: 'Rentrée des classes',
                date: '',
                type: 'start_of_year'
            },
            {
                name: 'Début des examens',
                date: '',
                type: 'exams_start'
            },
            {
                name: 'Fin des examens',
                date: '',
                type: 'exams_end'
            },
            {
                name: 'Remise des bulletins',
                date: '',
                type: 'report_distribution'
            }
        ]
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addArrayItem = (arrayName, newItem) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem]
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.label.trim()) newErrors.label = 'Le libellé est obligatoire';
        if (!formData.start_date) newErrors.start_date = 'La date de début est obligatoire';
        if (!formData.end_date) newErrors.end_date = 'La date de fin est obligatoire';
        if (!formData.establishment_id) newErrors.establishment_id = 'L\'établissement est obligatoire';
        
        if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
            newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
        }
        
        if (formData.tuition_fee && parseFloat(formData.tuition_fee) < 0) {
            newErrors.tuition_fee = 'Les frais de scolarité ne peuvent être négatifs';
        }
        
        if (formData.registration_fee && parseFloat(formData.registration_fee) < 0) {
            newErrors.registration_fee = 'Les frais d\'inscription ne peuvent être négatifs';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        onSubmit(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations de base */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations de base</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Libellé de l'année académique *"
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            error={errors.label}
                            placeholder="Ex: 2024-2025"
                            icon={Calendar}
                        />
                        
                        <Select
                            label="Statut *"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            error={errors.status}
                            icon={FileText}
                        >
                            <option value="UPCOMING">À venir</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Terminée</option>
                            <option value="ARCHIVED">Archivée</option>
                        </Select>
                        
                        <Input
                            label="Date de début *"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            error={errors.start_date}
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Date de fin *"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            error={errors.end_date}
                            icon={Calendar}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Description de l'année académique..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Année académique active
                            </label>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_locked"
                                checked={formData.is_locked}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Année académique verrouillée
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Informations financières */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations financières</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Frais de scolarité (FCFA)"
                            name="tuition_fee"
                            type="number"
                            step="0.01"
                            value={formData.tuition_fee}
                            onChange={handleInputChange}
                            error={errors.tuition_fee}
                            placeholder="250000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Frais d'inscription (FCFA)"
                            name="registration_fee"
                            type="number"
                            step="0.01"
                            value={formData.registration_fee}
                            onChange={handleInputChange}
                            error={errors.registration_fee}
                            placeholder="50000"
                            icon={DollarSign}
                        />
                    </div>
                </Card>

                {/* Configuration académique */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Configuration académique</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Absences maximales autorisées"
                            type="number"
                            value={formData.configuration?.max_absences || 10}
                            onChange={(e) => handleNestedChange('configuration', 'max_absences', parseInt(e.target.value))}
                            icon={AlertCircle}
                        />
                        
                        <Input
                            label="Taux de présence minimum (%)"
                            type="number"
                            value={formData.configuration?.min_attendance_rate || 75}
                            onChange={(e) => handleNestedChange('configuration', 'min_attendance_rate', parseInt(e.target.value))}
                            icon={CheckCircle}
                        />
                        
                        <Input
                            label="Système de notation"
                            value={formData.configuration?.grading_system || '20'}
                            onChange={(e) => handleNestedChange('configuration', 'grading_system', e.target.value)}
                            icon={FileText}
                        />
                        
                        <Input
                            label="Note de passage"
                            type="number"
                            step="0.1"
                            value={formData.configuration?.passing_grade || 10}
                            onChange={(e) => handleNestedChange('configuration', 'passing_grade', parseFloat(e.target.value))}
                            icon={CheckCircle}
                        />
                    </div>
                </Card>

                {/* Échéancier de paiement */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Échéancier de paiement</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.payment_schedule.map((payment, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        label="Nom"
                                        value={payment.name}
                                        onChange={(e) => handleArrayChange('payment_schedule', index, 'name', e.target.value)}
                                        placeholder="1ère tranche"
                                    />
                                    <Input
                                        label="Pourcentage (%)"
                                        type="number"
                                        value={payment.amount_percentage}
                                        onChange={(e) => handleArrayChange('payment_schedule', index, 'amount_percentage', parseFloat(e.target.value))}
                                        placeholder="40"
                                    />
                                    <Input
                                        label="Date d'échéance"
                                        type="date"
                                        value={payment.due_date}
                                        onChange={(e) => handleArrayChange('payment_schedule', index, 'due_date', e.target.value)}
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('payment_schedule', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Description"
                                        value={payment.description}
                                        onChange={(e) => handleArrayChange('payment_schedule', index, 'description', e.target.value)}
                                        placeholder="Description du paiement"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('payment_schedule', {
                                name: '',
                                amount_percentage: 0,
                                due_date: '',
                                description: ''
                            })}
                        >
                            Ajouter une échéance
                        </Button>
                    </div>
                </Card>

                {/* Vacances et jours fériés */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Vacances et jours fériés</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.holidays.map((holiday, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        label="Nom"
                                        value={holiday.name}
                                        onChange={(e) => handleArrayChange('holidays', index, 'name', e.target.value)}
                                        placeholder="Vacances de Noël"
                                    />
                                    <Input
                                        label="Date de début"
                                        type="date"
                                        value={holiday.start_date}
                                        onChange={(e) => handleArrayChange('holidays', index, 'start_date', e.target.value)}
                                    />
                                    <Input
                                        label="Date de fin"
                                        type="date"
                                        value={holiday.end_date}
                                        onChange={(e) => handleArrayChange('holidays', index, 'end_date', e.target.value)}
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('holidays', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('holidays', {
                                name: '',
                                start_date: '',
                                end_date: '',
                                type: 'custom'
                            })}
                        >
                            Ajouter une période de vacances
                        </Button>
                    </div>
                </Card>

                {/* Dates importantes */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Dates importantes</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.important_dates.map((date, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Nom"
                                        value={date.name}
                                        onChange={(e) => handleArrayChange('important_dates', index, 'name', e.target.value)}
                                        placeholder="Rentrée des classes"
                                    />
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={date.date}
                                        onChange={(e) => handleArrayChange('important_dates', index, 'date', e.target.value)}
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('important_dates', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('important_dates', {
                                name: '',
                                date: '',
                                type: 'custom'
                            })}
                        >
                            Ajouter une date importante
                        </Button>
                    </div>
                </Card>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        loading={loading}
                    >
                        {academicYear ? 'Mettre à jour' : 'Créer'} l'année académique
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default AcademicYearForm;
