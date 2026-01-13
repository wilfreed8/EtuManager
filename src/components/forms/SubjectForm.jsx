import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Target, Clock, Award, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

const SubjectForm = ({ subject, onSubmit, loading, establishmentId, availableTeachers }) => {
    const [formData, setFormData] = useState({
        name: subject?.name || '',
        code: subject?.code || '',
        description: subject?.description || '',
        category: subject?.category || '',
        department: subject?.department || '',
        level: subject?.level || '',
        
        // Personnel
        head_of_department_id: subject?.head_of_department_id || '',
        
        // Configuration académique
        weekly_hours: subject?.weekly_hours || 1,
        total_hours: subject?.total_hours || '',
        exam_type: subject?.exam_type || '',
        passing_grade: subject?.passing_grade || 10,
        is_optional: subject?.is_optional ?? false,
        is_core_subject: subject?.is_core_subject ?? false,
        
        // Contenu pédagogique
        learning_objectives: subject?.learning_objectives || [],
        teaching_methods: subject?.teaching_methods || [],
        assessment_methods: subject?.assessment_methods || [],
        prerequisites: subject?.prerequisites || [],
        resources: subject?.resources || [],
        bibliography: subject?.bibliography || [],
        
        // Relations
        establishment_id: establishmentId || subject?.establishment_id || '',
        
        status: subject?.status || 'ACTIVE'
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
        
        if (!formData.name.trim()) newErrors.name = 'Le nom de la matière est obligatoire';
        if (!formData.establishment_id) newErrors.establishment_id = 'L\'établissement est obligatoire';
        if (!formData.category) newErrors.category = 'La catégorie est obligatoire';
        
        if (formData.weekly_hours && (formData.weekly_hours < 1 || formData.weekly_hours > 20)) {
            newErrors.weekly_hours = 'Le nombre d\'heures doit être entre 1 et 20';
        }
        
        if (formData.passing_grade && (formData.passing_grade < 0 || formData.passing_grade > 20)) {
            newErrors.passing_grade = 'La note de passage doit être entre 0 et 20';
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
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Informations de base</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nom de la matière *"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Ex: Mathématiques"
                            icon={BookOpen}
                        />
                        
                        <Input
                            label="Code de la matière"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="Ex: MATH"
                            icon={FileText}
                        />
                        
                        <Select
                            label="Catégorie *"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            error={errors.category}
                            icon={BookOpen}
                        >
                            <option value="">Sélectionner la catégorie</option>
                            <option value="MATIERES LITTERAIRES">Matières Littéraires</option>
                            <option value="MATIERES SCIENTIFIQUES">Matières Scientifiques</option>
                            <option value="MATIERES ARTISTIQUES">Matières Artistiques</option>
                            <option value="MATIERES SPORTIVES">Matières Sportives</option>
                            <option value="MATIERES TECHNOLOGIQUES">Matières Technologiques</option>
                            <option value="LANGUES">Langues</option>
                            <option value="SCIENCES HUMAINES">Sciences Humaines</option>
                            <option value="AUTRES">Autres</option>
                        </Select>
                        
                        <Input
                            label="Département"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder="Ex: Département de Mathématiques"
                            icon={BookOpen}
                        />
                        
                        <Select
                            label="Niveau"
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            icon={Target}
                        >
                            <option value="">Tous niveaux</option>
                            <option value="Primaire">Primaire</option>
                            <option value="Collège">Collège</option>
                            <option value="Lycée">Lycée</option>
                            <option value="Supérieur">Supérieur</option>
                        </Select>
                        
                        <Select
                            label="Chef de département"
                            name="head_of_department_id"
                            value={formData.head_of_department_id}
                            onChange={handleInputChange}
                            icon={User}
                        >
                            <option value="">Sélectionner un chef de département</option>
                            {availableTeachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </option>
                            ))}
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
                            placeholder="Description de la matière..."
                        />
                    </div>
                </Card>

                {/* Configuration académique */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Configuration académique</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Heures par semaine *"
                            name="weekly_hours"
                            type="number"
                            value={formData.weekly_hours}
                            onChange={handleInputChange}
                            error={errors.weekly_hours}
                            placeholder="4"
                            icon={Clock}
                        />
                        
                        <Input
                            label="Total d'heures annuelles"
                            name="total_hours"
                            type="number"
                            value={formData.total_hours}
                            onChange={handleInputChange}
                            placeholder="120"
                            icon={Clock}
                        />
                        
                        <Select
                            label="Type d'examen"
                            name="exam_type"
                            value={formData.exam_type}
                            onChange={handleInputChange}
                            icon={FileText}
                        >
                            <option value="">Sélectionner le type</option>
                            <option value="ECRIT">Écrit</option>
                            <option value="ORAL">Oral</option>
                            <option value="PRATIQUE">Pratique</option>
                            <option value="MIXTE">Mixte</option>
                        </Select>
                        
                        <Input
                            label="Note de passage"
                            name="passing_grade"
                            type="number"
                            step="0.1"
                            value={formData.passing_grade}
                            onChange={handleInputChange}
                            error={errors.passing_grade}
                            placeholder="10"
                            icon={Target}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_optional"
                                checked={formData.is_optional}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Matière optionnelle
                            </label>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                name="is_core_subject"
                                checked={formData.is_core_subject}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Matière principale
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Objectifs d'apprentissage */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Objectifs d'apprentissage</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.learning_objectives.map((objective, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Objectif"
                                        value={objective.objective}
                                        onChange={(e) => handleArrayChange('learning_objectives', index, 'objective', e.target.value)}
                                        placeholder="Maîtriser les concepts fondamentaux"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('learning_objectives', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Compétences attendues"
                                        value={objective.skills}
                                        onChange={(e) => handleArrayChange('learning_objectives', index, 'skills', e.target.value)}
                                        placeholder="Résolution de problèmes, analyse critique..."
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('learning_objectives', {
                                objective: '',
                                skills: ''
                            })}
                        >
                            Ajouter un objectif
                        </Button>
                    </div>
                </Card>

                {/* Méthodes d'enseignement */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Méthodes d'enseignement</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.teaching_methods.map((method, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Méthode"
                                        value={method.method}
                                        onChange={(e) => handleArrayChange('teaching_methods', index, 'method', e.target.value)}
                                        placeholder="Cours magistral, travaux pratiques..."
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('teaching_methods', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Description"
                                        value={method.description}
                                        onChange={(e) => handleArrayChange('teaching_methods', index, 'description', e.target.value)}
                                        placeholder="Description de la méthode"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('teaching_methods', {
                                method: '',
                                description: ''
                            })}
                        >
                            Ajouter une méthode
                        </Button>
                    </div>
                </Card>

                {/* Méthodes d'évaluation */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Méthodes d'évaluation</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.assessment_methods.map((method, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Type d'évaluation"
                                        value={method.type}
                                        onChange={(e) => handleArrayChange('assessment_methods', index, 'type', e.target.value)}
                                        placeholder="Examen, devoir, projet..."
                                    />
                                    <Input
                                        label="Pondération (%)"
                                        type="number"
                                        value={method.weight}
                                        onChange={(e) => handleArrayChange('assessment_methods', index, 'weight', parseFloat(e.target.value))}
                                        placeholder="30"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('assessment_methods', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Description"
                                        value={method.description}
                                        onChange={(e) => handleArrayChange('assessment_methods', index, 'description', e.target.value)}
                                        placeholder="Description de l'évaluation"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('assessment_methods', {
                                type: '',
                                weight: 0,
                                description: ''
                            })}
                        >
                            Ajouter une méthode d'évaluation
                        </Button>
                    </div>
                </Card>

                {/* Prérequis */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Prérequis</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.prerequisites.map((prerequisite, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Prérequis"
                                        value={prerequisite.prerequisite}
                                        onChange={(e) => handleArrayChange('prerequisites', index, 'prerequisite', e.target.value)}
                                        placeholder="Connaissances de base en algèbre"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('prerequisites', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Description"
                                        value={prerequisite.description}
                                        onChange={(e) => handleArrayChange('prerequisites', index, 'description', e.target.value)}
                                        placeholder="Description du prérequis"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('prerequisites', {
                                prerequisite: '',
                                description: ''
                            })}
                        >
                            Ajouter un prérequis
                        </Button>
                    </div>
                </Card>

                {/* Ressources pédagogiques */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Ressources pédagogiques</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.resources.map((resource, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom de la ressource"
                                        value={resource.name}
                                        onChange={(e) => handleArrayChange('resources', index, 'name', e.target.value)}
                                        placeholder="Manuel scolaire"
                                    />
                                    <Input
                                        label="Type"
                                        value={resource.type}
                                        onChange={(e) => handleArrayChange('resources', index, 'type', e.target.value)}
                                        placeholder="Livre, vidéo, site web..."
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="URL/Lien"
                                        value={resource.url}
                                        onChange={(e) => handleArrayChange('resources', index, 'url', e.target.value)}
                                        placeholder="https://example.com/resource"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('resources', index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Input
                                        label="Description"
                                        value={resource.description}
                                        onChange={(e) => handleArrayChange('resources', index, 'description', e.target.value)}
                                        placeholder="Description de la ressource"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('resources', {
                                name: '',
                                type: '',
                                url: '',
                                description: ''
                            })}
                        >
                            Ajouter une ressource
                        </Button>
                    </div>
                </Card>

                {/* Bibliographie */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Bibliographie</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.bibliography.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Auteur(s)"
                                        value={item.author}
                                        onChange={(e) => handleArrayChange('bibliography', index, 'author', e.target.value)}
                                        placeholder="Nom de l'auteur"
                                    />
                                    <Input
                                        label="Titre"
                                        value={item.title}
                                        onChange={(e) => handleArrayChange('bibliography', index, 'title', e.target.value)}
                                        placeholder="Titre de l'ouvrage"
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Éditeur"
                                        value={item.publisher}
                                        onChange={(e) => handleArrayChange('bibliography', index, 'publisher', e.target.value)}
                                        placeholder="Nom de l'éditeur"
                                    />
                                    <Input
                                        label="Année"
                                        type="number"
                                        value={item.year}
                                        onChange={(e) => handleArrayChange('bibliography', index, 'year', parseInt(e.target.value))}
                                        placeholder="2024"
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayItem('bibliography', index)}
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
                            onClick={() => addArrayItem('bibliography', {
                                author: '',
                                title: '',
                                publisher: '',
                                year: ''
                            })}
                        >
                            Ajouter une référence
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
                        {subject ? 'Mettre à jour' : 'Créer'} la matière
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default SubjectForm;
