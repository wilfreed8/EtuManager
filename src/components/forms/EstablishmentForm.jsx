import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, Globe, User, Calendar, DollarSign, FileText, Award, Users, BookOpen, Clock, Star, Target, Eye, Heart, Shield, Briefcase } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const EstablishmentForm = ({ establishment, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        // Informations de base
        name: establishment?.name || '',
        type: establishment?.type || '',
        email: establishment?.email || '',
        phone: establishment?.phone || '',
        address: establishment?.address || '',
        city: establishment?.city || '',
        region: establishment?.region || '',
        department: establishment?.department || '',
        sub_prefecture: establishment?.sub_prefecture || '',
        country: establishment?.country || "Côte d'Ivoire",
        website: establishment?.website || '',
        logo_url: establishment?.logo_url || '',
        
        // Direction
        principal_name: establishment?.principal_name || '',
        principal_phone: establishment?.principal_phone || '',
        principal_email: establishment?.principal_email || '',
        academic_director_name: establishment?.academic_director_name || '',
        academic_director_phone: establishment?.academic_director_phone || '',
        academic_director_email: establishment?.academic_director_email || '',
        accounting_manager_name: establishment?.accounting_manager_name || '',
        accounting_manager_phone: establishment?.accounting_manager_phone || '',
        accounting_manager_email: establishment?.accounting_manager_email || '',
        
        // Informations légales et financières
        registration_number: establishment?.registration_number || '',
        tax_id: establishment?.tax_id || '',
        bank_name: establishment?.bank_name || '',
        bank_account_number: establishment?.bank_account_number || '',
        bank_account_holder: establishment?.bank_account_holder || '',
        
        // Capacités et configuration
        max_students: establishment?.max_students || '',
        max_teachers: establishment?.max_teachers || '',
        period_type: establishment?.period_type || 'TRIMESTRE',
        grading_config: establishment?.grading_config || {
            min_passing_grade: 10,
            max_grade: 20,
            grade_scale: '20'
        },
        
        // Informations générales
        founding_date: establishment?.founding_date || '',
        language: establishment?.language || 'Français',
        curriculum: establishment?.curriculum || '',
        description: establishment?.description || '',
        mission_statement: establishment?.mission_statement || '',
        vision_statement: establishment?.vision_statement || '',
        core_values: establishment?.core_values || '',
        
        // Localisation géographique
        latitude: establishment?.latitude || '',
        longitude: establishment?.longitude || '',
        
        // Configuration système
        operating_hours: establishment?.operating_hours || {
            monday: { open: '08:00', close: '17:00' },
            tuesday: { open: '08:00', close: '17:00' },
            wednesday: { open: '08:00', close: '17:00' },
            thursday: { open: '08:00', close: '17:00' },
            friday: { open: '08:00', close: '17:00' },
            saturday: { open: '08:00', close: '12:00' },
            sunday: { open: '', close: '' }
        },
        
        // JSON fields
        social_media: establishment?.social_media || {},
        facilities: establishment?.facilities || [],
        programs: establishment?.programs || [],
        accreditations: establishment?.accreditations || [],
        awards: establishment?.awards || [],
        vacation_periods: establishment?.vacation_periods || []
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
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

    const handleJsonFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Champs obligatoires
        if (!formData.name.trim()) newErrors.name = 'Le nom est obligatoire';
        if (!formData.type) newErrors.type = 'Le type est obligatoire';
        if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
        if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
        
        // Validation email
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }
        
        // Validation téléphone
        if (formData.phone && !/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
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
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations de base</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom de l'établissement *"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Ex: Lycée Moderne de Yamoussoukro"
                            icon={Building2}
                        />
                        
                        <Select
                            label="Type d'établissement *"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            error={errors.type}
                            icon={Building2}
                        >
                            <option value="">Sélectionner le type</option>
                            <option value="PRIMAIRE">École Primaire</option>
                            <option value="COLLEGE">Collège</option>
                            <option value="LYCEE">Lycée</option>
                            <option value="UNIVERSITY">Université</option>
                            <option value="TECHNICAL">École Technique</option>
                        </Select>
                        
                        <Input
                            label="Email *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            placeholder="contact@etablissement.edu.ci"
                            icon={Mail}
                        />
                        
                        <Input
                            label="Téléphone *"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                            placeholder="+225 00 00 00 00"
                            icon={Phone}
                        />
                        
                        <Input
                            label="Site web"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://www.etablissement.edu.ci"
                            icon={Globe}
                        />
                        
                        <Input
                            label="Logo URL"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/logo.png"
                            icon={Building2}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <Input
                            label="Adresse complète *"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={errors.address}
                            placeholder="10 Rue des Écoles, Abidjan"
                            icon={MapPin}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <Input
                            label="Ville *"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            error={errors.city}
                            placeholder="Abidjan"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Région"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            placeholder="Abidjan"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Département"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder="Abidjan"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Sous-préfecture"
                            name="sub_prefecture"
                            value={formData.sub_prefecture}
                            onChange={handleInputChange}
                            placeholder="Cocody"
                            icon={MapPin}
                        />
                    </div>
                </Card>

                {/* Direction et administration */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Direction et administration</h2>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Principal */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Principal/Directeur</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Nom complet"
                                    name="principal_name"
                                    value={formData.principal_name}
                                    onChange={handleInputChange}
                                    placeholder="M. Jean KOUADIO"
                                    icon={User}
                                />
                                <Input
                                    label="Téléphone"
                                    name="principal_phone"
                                    value={formData.principal_phone}
                                    onChange={handleInputChange}
                                    placeholder="+225 00 00 00 00"
                                    icon={Phone}
                                />
                                <Input
                                    label="Email"
                                    name="principal_email"
                                    type="email"
                                    value={formData.principal_email}
                                    onChange={handleInputChange}
                                    placeholder="principal@etablissement.edu.ci"
                                    icon={Mail}
                                />
                            </div>
                        </div>
                        
                        {/* Directeur académique */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Directeur académique</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Nom complet"
                                    name="academic_director_name"
                                    value={formData.academic_director_name}
                                    onChange={handleInputChange}
                                    placeholder="M. Marie KONAN"
                                    icon={User}
                                />
                                <Input
                                    label="Téléphone"
                                    name="academic_director_phone"
                                    value={formData.academic_director_phone}
                                    onChange={handleInputChange}
                                    placeholder="+225 00 00 00 00"
                                    icon={Phone}
                                />
                                <Input
                                    label="Email"
                                    name="academic_director_email"
                                    type="email"
                                    value={formData.academic_director_email}
                                    onChange={handleInputChange}
                                    placeholder="academic@etablissement.edu.ci"
                                    icon={Mail}
                                />
                            </div>
                        </div>
                        
                        {/* Gestionnaire comptable */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestionnaire comptable</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Nom complet"
                                    name="accounting_manager_name"
                                    value={formData.accounting_manager_name}
                                    onChange={handleInputChange}
                                    placeholder="M. Paul YAO"
                                    icon={User}
                                />
                                <Input
                                    label="Téléphone"
                                    name="accounting_manager_phone"
                                    value={formData.accounting_manager_phone}
                                    onChange={handleInputChange}
                                    placeholder="+225 00 00 00 00"
                                    icon={Phone}
                                />
                                <Input
                                    label="Email"
                                    name="accounting_manager_email"
                                    type="email"
                                    value={formData.accounting_manager_email}
                                    onChange={handleInputChange}
                                    placeholder="comptable@etablissement.edu.ci"
                                    icon={Mail}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Informations légales et financières */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations légales et financières</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Numéro d'enregistrement"
                            name="registration_number"
                            value={formData.registration_number}
                            onChange={handleInputChange}
                            placeholder="REG-2024-001234"
                            icon={FileText}
                        />
                        
                        <Input
                            label="Identifiant fiscal"
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleInputChange}
                            placeholder="TX-123456789"
                            icon={FileText}
                        />
                        
                        <Input
                            label="Banque"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            placeholder="SGBCI"
                            icon={Briefcase}
                        />
                        
                        <Input
                            label="Numéro de compte bancaire"
                            name="bank_account_number"
                            value={formData.bank_account_number}
                            onChange={handleInputChange}
                            placeholder="01 12345 67890 12345678901"
                            icon={Briefcase}
                        />
                        
                        <Input
                            label="Titulaire du compte"
                            name="bank_account_holder"
                            value={formData.bank_account_holder}
                            onChange={handleInputChange}
                            placeholder="Lycée Moderne de Yamoussoukro"
                            icon={User}
                        />
                        
                        <Input
                            label="Date de création"
                            name="founding_date"
                            type="date"
                            value={formData.founding_date}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                    </div>
                </Card>

                {/* Configuration académique */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Configuration académique</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Capacité maximale d'élèves"
                            name="max_students"
                            type="number"
                            value={formData.max_students}
                            onChange={handleInputChange}
                            placeholder="500"
                            icon={Users}
                        />
                        
                        <Input
                            label="Capacité maximale d'enseignants"
                            name="max_teachers"
                            type="number"
                            value={formData.max_teachers}
                            placeholder="50"
                            icon={Users}
                        />
                        
                        <Select
                            label="Type de période"
                            name="period_type"
                            value={formData.period_type}
                            onChange={handleInputChange}
                            icon={Clock}
                        >
                            <option value="TRIMESTRE">Trimestre</option>
                            <option value="SEMESTRE">Semestre</option>
                            <option value="ANNEE">Année</option>
                        </Select>
                        
                        <Select
                            label="Langue d'enseignement"
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            icon={Globe}
                        >
                            <option value="Français">Français</option>
                            <option value="Anglais">Anglais</option>
                            <option value="Bilingue">Bilingue</option>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Input
                            label="Programme académique"
                            name="curriculum"
                            value={formData.curriculum}
                            onChange={handleInputChange}
                            placeholder="National, International Baccalaureate, etc."
                            icon={BookOpen}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Note minimale de passage"
                                type="number"
                                step="0.1"
                                value={formData.grading_config?.min_passing_grade || 10}
                                onChange={(e) => handleNestedChange('grading_config', 'min_passing_grade', parseFloat(e.target.value))}
                                icon={Target}
                            />
                            <Input
                                label="Note maximale"
                                type="number"
                                step="0.1"
                                value={formData.grading_config?.max_grade || 20}
                                onChange={(e) => handleNestedChange('grading_config', 'max_grade', parseFloat(e.target.value))}
                                icon={Target}
                            />
                        </div>
                    </div>
                </Card>

                {/* Description et vision */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Description et vision</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'établissement</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Décrivez votre établissement, son histoire, ses valeurs..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                            <textarea
                                name="mission_statement"
                                value={formData.mission_statement}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Quelle est la mission de votre établissement ?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
                            <textarea
                                name="vision_statement"
                                value={formData.vision_statement}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Quelle est votre vision pour l'avenir ?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valeurs fondamentales</label>
                            <textarea
                                name="core_values"
                                value={formData.core_values}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Excellence, Intégrité, Respect, Innovation..."
                            />
                        </div>
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
                        {establishment ? 'Mettre à jour' : 'Créer'} l'établissement
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default EstablishmentForm;
