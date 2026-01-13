import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Calendar, FileText, Heart, Users, DollarSign, AlertCircle, CheckCircle, BookOpen, Globe, Shield } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const StudentForm = ({ student, onSubmit, loading, establishmentId, academicYearId, availableClasses }) => {
    const [formData, setFormData] = useState({
        // Informations utilisateur
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        
        // Informations personnelles
        birth_date: student?.birth_date || '',
        place_of_birth: student?.place_of_birth || '',
        gender: student?.gender || '',
        nationality: student?.nationality || 'Ivoirienne',
        id_card_number: student?.id_card_number || '',
        passport_number: student?.passport_number || '',
        
        // Contact et adresse
        address: student?.address || '',
        city: student?.city || '',
        region: student?.region || '',
        country: student?.country || "Côte d'Ivoire",
        
        // Informations académiques
        student_number: student?.student_number || '',
        admission_number: student?.admission_number || '',
        admission_date: student?.admission_date || '',
        admission_type: student?.admission_type || 'NEW',
        previous_school: student?.previous_school || '',
        last_class_attended: student?.last_class_attended || '',
        last_grade_average: student?.last_grade_average || '',
        study_level: student?.study_level || '',
        current_level: student?.current_level || '',
        current_class_id: student?.current_class_id || '',
        
        // Informations médicales
        medical_info: student?.medical_info || '',
        allergies: student?.allergies || '',
        chronic_diseases: student?.chronic_diseases || '',
        blood_type: student?.blood_type || '',
        emergency_contact_name: student?.emergency_contact_name || '',
        emergency_contact_phone: student?.emergency_contact_phone || '',
        emergency_contact_relationship: student?.emergency_contact_relationship || '',
        
        // Informations familiales - Père
        father_name: student?.father_name || '',
        father_phone: student?.father_phone || '',
        father_email: student?.father_email || '',
        father_occupation: student?.father_occupation || '',
        father_workplace: student?.father_workplace || '',
        
        // Informations familiales - Mère
        mother_name: student?.mother_name || '',
        mother_phone: student?.mother_phone || '',
        mother_email: student?.mother_email || '',
        mother_occupation: student?.mother_occupation || '',
        mother_workplace: student?.mother_workplace || '',
        
        // Informations familiales - Tuteur
        guardian_name: student?.guardian_name || '',
        guardian_phone: student?.guardian_phone || '',
        guardian_email: student?.guardian_email || '',
        guardian_relationship: student?.guardian_relationship || '',
        guardian_occupation: student?.guardian_occupation || '',
        
        // Statut et frais
        status: student?.status || 'ACTIVE',
        is_scholarship_holder: student?.is_scholarship_holder ?? false,
        scholarship_amount: student?.scholarship_amount || 0,
        tuition_fee: student?.tuition_fee || '',
        paid_amount: student?.paid_amount || 0,
        remaining_balance: student?.remaining_balance || '',
        payment_history: student?.payment_history || [],
        
        // Autres informations
        religion: student?.religion || '',
        mother_tongue: student?.mother_tongue || '',
        languages_spoken: student?.languages_spoken || [],
        extracurricular_activities: student?.extracurricular_activities || [],
        talents_hobbies: student?.talents_hobbies || [],
        remarks: student?.remarks || '',
        
        // Relations
        establishment_id: establishmentId || student?.establishment_id || '',
        academic_year_id: academicYearId || student?.academic_year_id || ''
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
        if (!formData.first_name.trim()) newErrors.first_name = 'Le prénom est obligatoire';
        if (!formData.last_name.trim()) newErrors.last_name = 'Le nom est obligatoire';
        if (!formData.birth_date) newErrors.birth_date = 'La date de naissance est obligatoire';
        if (!formData.gender) newErrors.gender = 'Le genre est obligatoire';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
        if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
        if (!formData.establishment_id) newErrors.establishment_id = 'L\'établissement est obligatoire';
        if (!formData.academic_year_id) newErrors.academic_year_id = 'L\'année académique est obligatoire';
        if (!formData.study_level) newErrors.study_level = 'Le niveau d\'étude est obligatoire';
        if (!formData.current_level) newErrors.current_level = 'Le niveau actuel est obligatoire';
        if (!formData.admission_date) newErrors.admission_date = 'La date d\'admission est obligatoire';
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
        
        // Validation âge (doit avoir entre 5 et 25 ans)
        if (formData.birth_date) {
            const age = Math.floor((new Date() - new Date(formData.birth_date)) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 5 || age > 25) {
                newErrors.birth_date = 'L\'âge doit être entre 5 et 25 ans';
            }
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
                            icon={Globe}
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
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            placeholder="etudiant@example.com"
                            icon={Mail}
                        />
                        
                        <Input
                            label="Téléphone"
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
                            icon={Globe}
                        />
                    </div>
                </Card>

                {/* Informations académiques */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations académiques</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Numéro d'étudiant"
                            name="student_number"
                            value={formData.student_number}
                            onChange={handleInputChange}
                            placeholder="ETU2024001"
                            icon={FileText}
                        />
                        
                        <Input
                            label="Numéro d'admission"
                            name="admission_number"
                            value={formData.admission_number}
                            onChange={handleInputChange}
                            placeholder="ADM2024001"
                            icon={FileText}
                        />
                        
                        <Input
                            label="Date d'admission *"
                            name="admission_date"
                            type="date"
                            value={formData.admission_date}
                            onChange={handleInputChange}
                            error={errors.admission_date}
                            icon={Calendar}
                        />
                        
                        <Select
                            label="Type d'admission"
                            name="admission_type"
                            value={formData.admission_type}
                            onChange={handleInputChange}
                            icon={FileText}
                        >
                            <option value="NEW">Nouveau</option>
                            <option value="TRANSFER">Transfert</option>
                            <option value="READMISSION">Réadmission</option>
                        </Select>
                        
                        <Select
                            label="Niveau d'étude *"
                            name="study_level"
                            value={formData.study_level}
                            onChange={handleInputChange}
                            error={errors.study_level}
                            icon={BookOpen}
                        >
                            <option value="">Sélectionner le niveau</option>
                            <option value="PRIMAIRE">Primaire</option>
                            <option value="COLLEGE">Collège</option>
                            <option value="LYCEE">Lycée</option>
                        </Select>
                        
                        <Input
                            label="Niveau actuel *"
                            name="current_level"
                            value={formData.current_level}
                            onChange={handleInputChange}
                            error={errors.current_level}
                            placeholder="6ème, 5ème, 4ème, 3ème..."
                            icon={BookOpen}
                        />
                        
                        <Select
                            label="Classe actuelle"
                            name="current_class_id"
                            value={formData.current_class_id}
                            onChange={handleInputChange}
                            icon={Users}
                        >
                            <option value="">Sélectionner une classe</option>
                            {availableClasses?.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </Select>
                        
                        <Input
                            label="École précédente"
                            name="previous_school"
                            value={formData.previous_school}
                            onChange={handleInputChange}
                            placeholder="École précédente"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Dernière classe fréquentée"
                            name="last_class_attended"
                            value={formData.last_class_attended}
                            onChange={handleInputChange}
                            placeholder="CM2"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Dernière moyenne générale"
                            name="last_grade_average"
                            type="number"
                            step="0.1"
                            value={formData.last_grade_average}
                            onChange={handleInputChange}
                            placeholder="12.5"
                            icon={FileText}
                        />
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
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                            <textarea
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Allergies alimentaires, médicamenteuses..."
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maladies chroniques</label>
                            <textarea
                                name="chronic_diseases"
                                value={formData.chronic_diseases}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Maladies chroniques à noter..."
                            />
                        </div>
                        
                        <Input
                            label="Groupe sanguin"
                            name="blood_type"
                            value={formData.blood_type}
                            onChange={handleInputChange}
                            placeholder="A+, B-, O+, etc."
                            icon={Heart}
                        />
                        
                        <Input
                            label="Contact d'urgence - Nom *"
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={handleInputChange}
                            error={errors.emergency_contact_name}
                            placeholder="Mme KONAN"
                            icon={Users}
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
                            placeholder="Mère, Père, Tuteur..."
                            icon={Users}
                        />
                    </div>
                </Card>

                {/* Informations familiales - Père */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations familiales - Père</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom du père"
                            name="father_name"
                            value={formData.father_name}
                            onChange={handleInputChange}
                            placeholder="M. KOUADIO Jean"
                            icon={User}
                        />
                        
                        <Input
                            label="Téléphone du père"
                            name="father_phone"
                            value={formData.father_phone}
                            onChange={handleInputChange}
                            placeholder="+225 00 00 00 00"
                            icon={Phone}
                        />
                        
                        <Input
                            label="Email du père"
                            name="father_email"
                            type="email"
                            value={formData.father_email}
                            onChange={handleInputChange}
                            placeholder="pere@example.com"
                            icon={Mail}
                        />
                        
                        <Input
                            label="Profession du père"
                            name="father_occupation"
                            value={formData.father_occupation}
                            onChange={handleInputChange}
                            placeholder="Ingénieur"
                            icon={User}
                        />
                        
                        <div className="md:col-span-2">
                            <Input
                                label="Lieu de travail du père"
                                name="father_workplace"
                                value={formData.father_workplace}
                                onChange={handleInputChange}
                                placeholder="SOCIETE X, Abidjan"
                                icon={MapPin}
                            />
                        </div>
                    </div>
                </Card>

                {/* Informations familiales - Mère */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations familiales - Mère</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom de la mère"
                            name="mother_name"
                            value={formData.mother_name}
                            onChange={handleInputChange}
                            placeholder="Mme KONAN Marie"
                            icon={User}
                        />
                        
                        <Input
                            label="Téléphone de la mère"
                            name="mother_phone"
                            value={formData.mother_phone}
                            onChange={handleInputChange}
                            placeholder="+225 00 00 00 00"
                            icon={Phone}
                        />
                        
                        <Input
                            label="Email de la mère"
                            name="mother_email"
                            type="email"
                            value={formData.mother_email}
                            onChange={handleInputChange}
                            placeholder="mere@example.com"
                            icon={Mail}
                        />
                        
                        <Input
                            label="Profession de la mère"
                            name="mother_occupation"
                            value={formData.mother_occupation}
                            onChange={handleInputChange}
                            placeholder="Enseignante"
                            icon={User}
                        />
                        
                        <div className="md:col-span-2">
                            <Input
                                label="Lieu de travail de la mère"
                                name="mother_workplace"
                                value={formData.mother_workplace}
                                onChange={handleInputChange}
                                placeholder="École Y, Abidjan"
                                icon={MapPin}
                            />
                        </div>
                    </div>
                </Card>

                {/* Informations familiales - Tuteur */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations familiales - Tuteur</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom du tuteur"
                            name="guardian_name"
                            value={formData.guardian_name}
                            onChange={handleInputChange}
                            placeholder="M. YAO Paul"
                            icon={User}
                        />
                        
                        <Input
                            label="Téléphone du tuteur"
                            name="guardian_phone"
                            value={formData.guardian_phone}
                            onChange={handleInputChange}
                            placeholder="+225 00 00 00 00"
                            icon={Phone}
                        />
                        
                        <Input
                            label="Email du tuteur"
                            name="guardian_email"
                            type="email"
                            value={formData.guardian_email}
                            onChange={handleInputChange}
                            placeholder="tuteur@example.com"
                            icon={Mail}
                        />
                        
                        <Input
                            label="Relation avec l'étudiant"
                            name="guardian_relationship"
                            value={formData.guardian_relationship}
                            onChange={handleInputChange}
                            placeholder="Oncle, Tante, Grand-parent..."
                            icon={Users}
                        />
                        
                        <div className="md:col-span-2">
                            <Input
                                label="Profession du tuteur"
                                name="guardian_occupation"
                                value={formData.guardian_occupation}
                                onChange={handleInputChange}
                                placeholder="Commerçant"
                                icon={User}
                            />
                        </div>
                    </div>
                </Card>

                {/* Statut et frais */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Statut et frais</h2>
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
                            <option value="GRADUATED">Diplômé</option>
                            <option value="EXPELLED">Exclu</option>
                            <option value="TRANSFERRED">Transféré</option>
                        </Select>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_scholarship_holder"
                                checked={formData.is_scholarship_holder}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Boursier
                            </label>
                        </div>
                        
                        <Input
                            label="Montant de la bourse (FCFA)"
                            name="scholarship_amount"
                            type="number"
                            step="0.01"
                            value={formData.scholarship_amount}
                            onChange={handleInputChange}
                            placeholder="50000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Frais de scolarité (FCFA)"
                            name="tuition_fee"
                            type="number"
                            step="0.01"
                            value={formData.tuition_fee}
                            onChange={handleInputChange}
                            placeholder="250000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Montant payé (FCFA)"
                            name="paid_amount"
                            type="number"
                            step="0.01"
                            value={formData.paid_amount}
                            onChange={handleInputChange}
                            placeholder="100000"
                            icon={DollarSign}
                        />
                        
                        <Input
                            label="Solde restant (FCFA)"
                            name="remaining_balance"
                            type="number"
                            step="0.01"
                            value={formData.remaining_balance}
                            onChange={handleInputChange}
                            placeholder="150000"
                            icon={DollarSign}
                        />
                    </div>
                </Card>

                {/* Autres informations */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Autres informations</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Religion"
                            name="religion"
                            value={formData.religion}
                            onChange={handleInputChange}
                            placeholder="Chrétienne, Musulmane, etc."
                            icon={Heart}
                        />
                        
                        <Input
                            label="Langue maternelle"
                            name="mother_tongue"
                            value={formData.mother_tongue}
                            onChange={handleInputChange}
                            placeholder="Français, Dioula, etc."
                            icon={Globe}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarques</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Remarques supplémentaires..."
                        />
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
                        {student ? 'Mettre à jour' : 'Créer'} l'étudiant
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default StudentForm;
