import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Clock, DollarSign, BookOpen, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const ClassForm = ({ classData, onSubmit, loading, establishmentId, academicYearId, availableTeachers }) => {
    const [formData, setFormData] = useState({
        name: classData?.name || '',
        code: classData?.code || '',
        description: classData?.description || '',
        level: classData?.level || '',
        cycle: classData?.cycle || '',
        section: classData?.section || '',
        max_students: classData?.max_students || 30,
        current_students: classData?.current_students || 0,
        
        // Localisation
        room: classData?.room || '',
        classroom_number: classData?.classroom_number || '',
        floor: classData?.floor || '',
        building: classData?.building || '',
        
        // Personnel
        class_teacher_id: classData?.class_teacher_id || '',
        assistant_teacher_id: classData?.assistant_teacher_id || '',
        
        // Finances
        tuition_fee: classData?.tuition_fee || '',
        additional_fees: classData?.additional_fees || [],
        
        // Configuration
        schedule: classData?.schedule || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        },
        
        subjects_list: classData?.subjects_list || [],
        teaching_materials: classData?.teaching_materials || [],
        class_rules: classData?.class_rules || [],
        special_requirements: classData?.special_requirements || '',
        
        // Relations
        establishment_id: establishmentId || classData?.establishment_id || '',
        academic_year_id: academicYearId || classData?.academic_year_id || '',
        
        status: classData?.status || 'ACTIVE'
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
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
        
        if (!formData.name.trim()) newErrors.name = 'Le nom de la classe est obligatoire';
        if (!formData.establishment_id) newErrors.establishment_id = 'L\'établissement est obligatoire';
        if (!formData.academic_year_id) newErrors.academic_year_id = 'L\'année académique est obligatoire';
        if (!formData.level) newErrors.level = 'Le niveau est obligatoire';
        
        if (formData.max_students && (formData.max_students < 1 || formData.max_students > 100)) {
            newErrors.max_students = 'Le nombre d\'élèves doit être entre 1 et 100';
        }
        
        if (formData.current_students && formData.current_students > formData.max_students) {
            newErrors.current_students = 'Le nombre d\'élèves actuels ne peut dépasser la capacité maximale';
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
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations de base</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom de la classe *"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Ex: 6ème A"
                            icon={Users}
                        />
                        
                        <Input
                            label="Code de la classe"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="Ex: 6A-2024"
                            icon={FileText}
                        />
                        
                        <Select
                            label="Niveau *"
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            error={errors.level}
                            icon={BookOpen}
                        >
                            <option value="">Sélectionner le niveau</option>
                            <option value="CP">CP</option>
                            <option value="CE1">CE1</option>
                            <option value="CE2">CE2</option>
                            <option value="CM1">CM1</option>
                            <option value="CM2">CM2</option>
                            <option value="6ème">6ème</option>
                            <option value="5ème">5ème</option>
                            <option value="4ème">4ème</option>
                            <option value="3ème">3ème</option>
                            <option value="2nde">2nde</option>
                            <option value="1ère">1ère</option>
                            <option value="Terminale">Terminale</option>
                        </Select>
                        
                        <Select
                            label="Cycle"
                            name="cycle"
                            value={formData.cycle}
                            onChange={handleInputChange}
                            icon={BookOpen}
                        >
                            <option value="">Sélectionner le cycle</option>
                            <option value="Primaire">Primaire</option>
                            <option value="Collège">Collège</option>
                            <option value="Lycée">Lycée</option>
                        </Select>
                        
                        <Input
                            label="Section"
                            name="section"
                            value={formData.section}
                            onChange={handleInputChange}
                            placeholder="A, B, C, etc."
                            icon={FileText}
                        />
                        
                        <Select
                            label="Statut"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            icon={AlertCircle}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ARCHIVED">Archivée</option>
                        </Select>
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Description de la classe..."
                        />
                    </div>
                </Card>

                {/* Localisation */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Localisation</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Salle"
                            name="room"
                            value={formData.room}
                            onChange={handleInputChange}
                            placeholder="Salle 101"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Numéro de salle"
                            name="classroom_number"
                            value={formData.classroom_number}
                            onChange={handleInputChange}
                            placeholder="101"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Étage"
                            name="floor"
                            value={formData.floor}
                            onChange={handleInputChange}
                            placeholder="1er étage"
                            icon={MapPin}
                        />
                        
                        <Input
                            label="Bâtiment"
                            name="building"
                            value={formData.building}
                            onChange={handleInputChange}
                            placeholder="Bâtiment A"
                            icon={MapPin}
                        />
                    </div>
                </Card>

                {/* Capacité et effectif */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Capacité et effectif</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Capacité maximale *"
                            name="max_students"
                            type="number"
                            value={formData.max_students}
                            onChange={handleInputChange}
                            error={errors.max_students}
                            placeholder="30"
                            icon={Users}
                        />
                        
                        <Input
                            label="Effectif actuel"
                            name="current_students"
                            type="number"
                            value={formData.current_students}
                            onChange={handleInputChange}
                            error={errors.current_students}
                            placeholder="0"
                            icon={Users}
                        />
                    </div>
                </Card>

                {/* Personnel */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Personnel</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Professeur principal"
                            name="class_teacher_id"
                            value={formData.class_teacher_id}
                            onChange={handleInputChange}
                            icon={User}
                        >
                            <option value="">Sélectionner un professeur</option>
                            {availableTeachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </option>
                            ))}
                        </Select>
                        
                        <Select
                            label="Professeur assistant"
                            name="assistant_teacher_id"
                            value={formData.assistant_teacher_id}
                            onChange={handleInputChange}
                            icon={User}
                        >
                            <option value="">Sélectionner un assistant</option>
                            {availableTeachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </option>
                            ))}
                        </Select>
                    </div>
                </Card>

                {/* Informations financières */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations financières</h2>
                    </div>
                    
                    <div className="space-y-4">
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
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Frais supplémentaires</label>
                            {formData.additional_fees.map((fee, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="Nom"
                                            value={fee.name}
                                            onChange={(e) => handleArrayChange('additional_fees', index, 'name', e.target.value)}
                                            placeholder="Frais de transport"
                                        />
                                        <Input
                                            label="Montant (FCFA)"
                                            type="number"
                                            step="0.01"
                                            value={fee.amount}
                                            onChange={(e) => handleArrayChange('additional_fees', index, 'amount', parseFloat(e.target.value))}
                                            placeholder="50000"
                                        />
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => removeArrayItem('additional_fees', index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Input
                                            label="Description"
                                            value={fee.description}
                                            onChange={(e) => handleArrayChange('additional_fees', index, 'description', e.target.value)}
                                            placeholder="Description du frais"
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayItem('additional_fees', {
                                    name: '',
                                    amount: 0,
                                    description: ''
                                })}
                            >
                                Ajouter un frais supplémentaire
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Matériel pédagogique */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Matériel pédagogique</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.teaching_materials.map((material, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du matériel"
                                        value={material.name}
                                        onChange={(e) => handleArrayChange('teaching_materials', index, 'name', e.target.value)}
                                        placeholder="Tableau blanc"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('teaching_materials', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Quantité"
                                        type="number"
                                        value={material.quantity}
                                        onChange={(e) => handleArrayChange('teaching_materials', index, 'quantity', parseInt(e.target.value))}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('teaching_materials', {
                                name: '',
                                quantity: 1
                            })}
                        >
                            Ajouter du matériel
                        </Button>
                    </div>
                </Card>

                {/* Règles de classe */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Règles de classe</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.class_rules.map((rule, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Règle"
                                        value={rule.rule}
                                        onChange={(e) => handleArrayChange('class_rules', index, 'rule', e.target.value)}
                                        placeholder="Respect du silence pendant les cours"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('class_rules', index)}
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
                            onClick={() => addArrayItem('class_rules', {
                                rule: ''
                            })}
                        >
                            Ajouter une règle
                        </Button>
                    </div>
                </Card>

                {/* Exigences spéciales */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Exigences spéciales</h2>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exigences spéciales pour cette classe</label>
                        <textarea
                            name="special_requirements"
                            value={formData.special_requirements}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Exigences spéciales, besoins particuliers, etc."
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
                        {classData ? 'Mettre à jour' : 'Créer'} la classe
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default ClassForm;
