import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Calendar, FileText, Briefcase, Award, BookOpen, DollarSign, Heart, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const TeacherForm = ({ teacher, onSubmit, loading, establishmentId, academicYearId }) => {
    const [formData, setFormData] = useState({
        // Informations personnelles
        employee_number: teacher?.employee_number || '',
        first_name: teacher?.first_name || '',
        last_name: teacher?.last_name || '',
        birth_date: teacher?.birth_date || '',
        place_of_birth: teacher?.place_of_birth || '',
        gender: teacher?.gender || '',
        nationality: teacher?.nationality || 'Ivoirienne',
        id_card_number: teacher?.id_card_number || '',
        passport_number: teacher?.passport_number || '',
        
        // Contact
        phone: teacher?.phone || '',
        email: teacher?.email || '',
        address: teacher?.address || '',
        city: teacher?.city || '',
        region: teacher?.region || '',
        country: teacher?.country || "Côte d'Ivoire",
        
        // Informations professionnelles
        hire_date: teacher?.hire_date || '',
        employment_type: teacher?.employment_type || 'FULL_TIME',
        contract_type: teacher?.contract_type || '',
        contract_start_date: teacher?.contract_start_date || '',
        contract_end_date: teacher?.contract_end_date || '',
        department: teacher?.department || '',
        position: teacher?.position || '',
        grade: teacher?.grade || '',
        
        // Qualifications
        highest_degree: teacher?.highest_degree || '',
        field_of_study: teacher?.field_of_study || '',
        institution: teacher?.institution || '',
        graduation_date: teacher?.graduation_date || '',
        degrees: teacher?.degrees || [],
        certifications: teacher?.certifications || [],
        specializations: teacher?.specializations || [],
        years_of_experience: teacher?.years_of_experience || 0,
        previous_experience: teacher?.previous_experience || '',
        
        // Enseignement
        subjects_can_teach: teacher?.subjects_can_teach || [],
        levels_can_teach: teacher?.levels_can_teach || [],
        max_teaching_hours: teacher?.max_teaching_hours || 20,
        current_teaching_hours: teacher?.current_teaching_hours || 0,
        teaching_license: teacher?.teaching_license || '',
        teaching_license_expiry: teacher?.teaching_license_expiry || '',
        
        // Informations financières
        base_salary: teacher?.base_salary || '',
        gross_salary: teacher?.gross_salary || '',
        net_salary: teacher?.net_salary || '',
        bank_name: teacher?.bank_name || '',
        bank_account_number: teacher?.bank_account_number || '',
        bank_account_holder: teacher?.bank_account_holder || '',
        payment_method: teacher?.payment_method || 'BANK_TRANSFER',
        allowances: teacher?.allowances || [],
        
        // Informations administratives
        social_security_number: teacher?.social_security_number || '',
        tax_id: teacher?.tax_id || '',
        work_permit_number: teacher?.work_permit_number || '',
        work_permit_expiry: teacher?.work_permit_expiry || '',
        documents: teacher?.documents || [],
        
        // Santé et sécurité
        medical_info: teacher?.medical_info || '',
        emergency_contact_name: teacher?.emergency_contact_name || '',
        emergency_contact_phone: teacher?.emergency_contact_phone || '',
        emergency_contact_relationship: teacher?.emergency_contact_relationship || '',
        last_medical_checkup: teacher?.last_medical_checkup || '',
        vaccinations: teacher?.vaccinations || [],
        
        // Évaluation et performance
        performance_reviews: teacher?.performance_reviews || [],
        performance_rating: teacher?.performance_rating || '',
        achievements: teacher?.achievements || [],
        professional_development: teacher?.professional_development || [],
        
        // Statut et disponibilité
        status: teacher?.status || 'ACTIVE',
        is_class_teacher: teacher?.is_class_teacher ?? false,
        is_department_head: teacher?.is_department_head ?? false,
        can_teach_extra_hours: teacher?.can_teach_extra_hours ?? true,
        availability: teacher?.availability || {},
        
        // Autres informations
        remarks: teacher?.remarks || '',
        extracurricular_supervision: teacher?.extracurricular_supervision || [],
        
        // Relations
        establishment_id: establishmentId || teacher?.establishment_id || '',
        academic_year_id: academicYearId || teacher?.academic_year_id || ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value)
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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
        
        // Champs obligatoires
        if (!formData.employee_number.trim()) newErrors.employee_number = 'Le numéro d\'employé est obligatoire';
        if (!formData.first_name.trim()) newErrors.first_name = 'Le prénom est obligatoire';
        if (!formData.last_name.trim()) newErrors.last_name = 'Le nom est obligatoire';
        if (!formData.birth_date) newErrors.birth_date = 'La date de naissance est obligatoire';
        if (!formData.gender) newErrors.gender = 'Le genre est obligatoire';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
        if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
        if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
        if (!formData.hire_date) newErrors.hire_date = 'La date d\'embauche est obligatoire';
        if (!formData.position.trim()) newErrors.position = 'Le poste est obligatoire';
        if (!formData.establishment_id) newErrors.establishment_id = 'L\'établissement est obligatoire';
        if (!formData.academic_year_id) newErrors.academic_year_id = 'L\'année académique est obligatoire';
        if (!formData.emergency_contact_name.trim()) newErrors.emergency_contact_name = 'Le contact d\'urgence est obligatoire';
        if (!formData.emergency_contact_phone.trim()) newErrors.emergency_contact_phone = 'Le téléphone d\'urgence est obligatoire';
        
        // Validation email
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }
        
        // Validation téléphone
        if (formData.phone && !/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
        }
        
        if (formData.emergency_contact_phone && !/^\+?[0-9\s\-\(\)]+$/.test(formData.emergency_contact_phone)) {
            newErrors.emergency_contact_phone = 'Le téléphone d\'urgence n\'est pas valide';
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
                {/* Informations personnelles */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Numéro d'employé *"
                            name="employee_number"
                            value={formData.employee_number}
                            onChange={handleInputChange}
                            error={errors.employee_number}
                            placeholder="EMP2024001"
                            icon={FileText}
                        />
                        
                        <Input
                            label="Prénom *"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            error={errors.first_name}
                            placeholder="Jean"
                            icon={User}
                        />
                        
                        <Input
                            label="Nom *"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            error={errors.last_name}
                            placeholder="KOUADIO"
                            icon={User}
                        />
                        
                        <Input
                            label="Date de naissance *"
                            name="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={handleInputChange}
                            error={errors.birth_date}
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Lieu de naissance"
                            name="place_of_birth"
                            value={formData.place_of_birth}
                            onChange={handleInputChange}
                            placeholder="Abidjan"
                            icon={MapPin}
                        />
                        
                        <Select
                            label="Genre *"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            error={errors.gender}
                            icon={User}
                        >
                            <option value="">Sélectionner le genre</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                            <option value="OTHER">Autre</option>
                        </Select>
                        
                        <Input
                            label="Nationalité"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            placeholder="Ivoirienne"
                            icon={Shield}
                        />
                        
                        <Input
                            label="Numéro de carte d'identité"
                            name="id_card_number"
                            value={formData.id_card_number}
                            onChange={handleInputChange}
                            placeholder="CI1234567890123"
                            icon={Shield}
                        />
                        
                        <Input
                            label="Numéro de passeport"
                            name="passport_number"
                            value={formData.passport_number}
                            onChange={handleInputChange}
                            placeholder="AB1234567"
                            icon={Shield}
                        />
                    </div>
                </Card>

                {/* Contact et adresse */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Contact et adresse</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            placeholder="enseignant@example.com"
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
                        
                        <div className="md:col-span-2">
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
                            label="Pays"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Côte d'Ivoire"
                            icon={Shield}
                        />
                    </div>
                </Card>

                {/* Informations professionnelles */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations professionnelles</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Date d'embauche *"
                            name="hire_date"
                            type="date"
                            value={formData.hire_date}
                            onChange={handleInputChange}
                            error={errors.hire_date}
                            icon={Calendar}
                        />
                        
                        <Select
                            label="Type d'emploi"
                            name="employment_type"
                            value={formData.employment_type}
                            onChange={handleInputChange}
                            icon={Briefcase}
                        >
                            <option value="FULL_TIME">Temps plein</option>
                            <option value="PART_TIME">Temps partiel</option>
                            <option value="CONTRACT">Contrat</option>
                            <option value="TEMPORARY">Temporaire</option>
                        </Select>
                        
                        <Select
                            label="Type de contrat"
                            name="contract_type"
                            value={formData.contract_type}
                            onChange={handleInputChange}
                            icon={FileText}
                        >
                            <option value="">Sélectionner le type</option>
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="STAGE">Stage</option>
                        </Select>
                        
                        <Input
                            label="Département"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder="Mathématiques"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Poste *"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            error={errors.position}
                            placeholder="Professeur de Mathématiques"
                            icon={Briefcase}
                        />
                        
                        <Input
                            label="Grade/Échelon"
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            placeholder="A1, A2, etc."
                            icon={FileText}
                        />
                        
                        <Input
                            label="Date de début de contrat"
                            name="contract_start_date"
                            type="date"
                            value={formData.contract_start_date}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Date de fin de contrat"
                            name="contract_end_date"
                            type="date"
                            value={formData.contract_end_date}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                    </div>
                </Card>

                {/* Qualifications */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Qualifications</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Diplôme le plus élevé"
                            name="highest_degree"
                            value={formData.highest_degree}
                            onChange={handleInputChange}
                            placeholder="Master en Mathématiques"
                            icon={Award}
                        />
                        
                        <Input
                            label="Domaine d'étude"
                            name="field_of_study"
                            value={formData.field_of_study}
                            onChange={handleInputChange}
                            placeholder="Mathématiques"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleInputChange}
                            placeholder="Université Félix Houphouët-Boigny"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Date de graduation"
                            name="graduation_date"
                            type="date"
                            value={formData.graduation_date}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Années d'expérience"
                            name="years_of_experience"
                            type="number"
                            value={formData.years_of_experience}
                            onChange={handleInputChange}
                            placeholder="5"
                            icon={Calendar}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expérience précédente</label>
                        <textarea
                            name="previous_experience"
                            value={formData.previous_experience}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Description de l'expérience professionnelle..."
                        />
                    </div>
                    
                    {/* Diplômes */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diplômes</label>
                        {formData.degrees.map((degree, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du diplôme"
                                        value={degree.name}
                                        onChange={(e) => handleArrayChange('degrees', index, 'name', e.target.value)}
                                        placeholder="Licence en Mathématiques"
                                    />
                                    <Input
                                        label="Institution"
                                        value={degree.institution}
                                        onChange={(e) => handleArrayChange('degrees', index, 'institution', e.target.value)}
                                        placeholder="Université X"
                                    />
                                    <Input
                                        label="Année d'obtention"
                                        type="number"
                                        value={degree.year}
                                        onChange={(e) => handleArrayChange('degrees', index, 'year', parseInt(e.target.value))}
                                        placeholder="2020"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('degrees', index)}
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
                            onClick={() => addArrayItem('degrees', {
                                name: '',
                                institution: '',
                                year: ''
                            })}
                        >
                            Ajouter un diplôme
                        </Button>
                    </div>
                    
                    {/* Spécialisations */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spécialisations</label>
                        {formData.specializations.map((spec, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Spécialisation"
                                        value={spec.specialization}
                                        onChange={(e) => handleArrayChange('specializations', index, 'specialization', e.target.value)}
                                        placeholder="Algèbre linéaire"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('specializations', index)}
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
                            onClick={() => addArrayItem('specializations', {
                                specialization: ''
                            })}
                        >
                            Ajouter une spécialisation
                        </Button>
                    </div>
                </Card>

                {/* Enseignement */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Enseignement</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Heures d'enseignement maximales"
                            name="max_teaching_hours"
                            type="number"
                            value={formData.max_teaching_hours}
                            onChange={handleInputChange}
                            placeholder="20"
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Heures d'enseignement actuelles"
                            name="current_teaching_hours"
                            type="number"
                            value={formData.current_teaching_hours}
                            onChange={handleInputChange}
                            placeholder="15"
                            icon={Calendar}
                        />
                        
                        <Input
                            label="Permis d'enseignement"
                            name="teaching_license"
                            value={formData.teaching_license}
                            onChange={handleInputChange}
                            placeholder="ENSEIG2024001"
                            icon={Shield}
                        />
                        
                        <Input
                            label="Date d'expiration du permis"
                            name="teaching_license_expiry"
                            type="date"
                            value={formData.teaching_license_expiry}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                    </div>
                    
                    {/* Matières enseignables */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matières enseignables</label>
                        {formData.subjects_can_teach.map((subject, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Matière"
                                        value={subject.subject}
                                        onChange={(e) => handleArrayChange('subjects_can_teach', index, 'subject', e.target.value)}
                                        placeholder="Mathématiques"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('subjects_can_teach', index)}
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
                            onClick={() => addArrayItem('subjects_can_teach', {
                                subject: ''
                            })}
                        >
                            Ajouter une matière
                        </Button>
                    </div>
                    
                    {/* Niveaux enseignables */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Niveaux enseignables</label>
                        {formData.levels_can_teach.map((level, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Niveau"
                                        value={level.level}
                                        onChange={(e) => handleArrayChange('levels_can_teach', index, 'level', e.target.value)}
                                        placeholder="Collège, Lycée"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('levels_can_teach', index)}
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
                            onClick={() => addArrayItem('levels_can_teach', {
                                level: ''
                            })}
                        >
                            Ajouter un niveau
                        </Button>
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
                            label="Salaire de base"
                            name="base_salary"
                            type="number"
                            step="0.01"
                            value={formData.base_salary}
                            onChange={handleInputChange}
                            placeholder="300000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Salaire brut"
                            name="gross_salary"
                            type="number"
                            step="0.01"
                            value={formData.gross_salary}
                            onChange={handleInputChange}
                            placeholder="350000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Salaire net"
                            name="net_salary"
                            type="number"
                            step="0.01"
                            value={formData.net_salary}
                            onChange={handleInputChange}
                            placeholder="280000"
                            icon={DollarSign}
                        />
                        
                        <Select
                            label="Méthode de paiement"
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            icon={DollarSign}
                        >
                            <option value="BANK_TRANSFER">Virement bancaire</option>
                            <option value="CASH">Espèces</option>
                            <option value="CHECK">Chèque</option>
                        </Select>
                        
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
                        
                        <div className="md:col-span-2">
                            <Input
                                label="Titulaire du compte"
                                name="bank_account_holder"
                                value={formData.bank_account_holder}
                                onChange={handleInputChange}
                                placeholder="Jean KOUADIO"
                                icon={User}
                            />
                        </div>
                    </div>
                    
                    {/* Primes et allocations */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primes et allocations</label>
                        {formData.allowances.map((allowance, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Nom de l'allocation"
                                        value={allowance.name}
                                        onChange={(e) => handleArrayChange('allowances', index, 'name', e.target.value)}
                                        placeholder="Prime de responsabilité"
                                    />
                                    <Input
                                        label="Montant"
                                        type="number"
                                        step="0.01"
                                        value={allowance.amount}
                                        onChange={(e) => handleArrayChange('allowances', index, 'amount', parseFloat(e.target.value))}
                                        placeholder="50000"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('allowances', index)}
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
                            onClick={() => addArrayItem('allowances', {
                                name: '',
                                amount: 0
                            })}
                        >
                            Ajouter une allocation
                        </Button>
                    </div>
                </Card>

                {/* Informations médicales */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations médicales</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Informations médicales</label>
                            <textarea
                                name="medical_info"
                                value={formData.medical_info}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Conditions médicales, traitements en cours..."
                            />
                        </div>
                        
                        <Input
                            label="Contact d'urgence - Nom *"
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={handleInputChange}
                            error={errors.emergency_contact_name}
                            placeholder="Mme KONAN"
                            icon={User}
                        />
                        
                        <Input
                            label="Contact d'urgence - Téléphone *"
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={handleInputChange}
                            error={errors.emergency_contact_phone}
                            placeholder="+225 00 00 00 00"
                            icon={Phone}
                        />
                        
                        <Input
                            label="Contact d'urgence - Relation"
                            name="emergency_contact_relationship"
                            value={formData.emergency_contact_relationship}
                            onChange={handleInputChange}
                            placeholder="Épouse, Frère, etc."
                            icon={User}
                        />
                        
                        <Input
                            label="Dernier contrôle médical"
                            name="last_medical_checkup"
                            type="date"
                            value={formData.last_medical_checkup}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                    </div>
                </Card>

                {/* Statut et disponibilité */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Statut et disponibilité</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Statut"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            icon={AlertCircle}
                        >
                            <option value="ACTIVE">Actif</option>
                            <option value="INACTIVE">Inactif</option>
                            <option value="ON_LEAVE">En congé</option>
                            <option value="SUSPENDED">Suspendu</option>
                            <option value="TERMINATED">Licencié</option>
                        </Select>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_class_teacher"
                                checked={formData.is_class_teacher}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Professeur principal
                            </label>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_department_head"
                                checked={formData.is_department_head}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Chef de département
                            </label>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="can_teach_extra_hours"
                                checked={formData.can_teach_extra_hours}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Peut enseigner des heures supplémentaires
                            </label>
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
                        {teacher ? 'Mettre à jour' : 'Créer'} l'enseignant
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default TeacherForm;
