import { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    UserCircle,
    GraduationCap,
    Users,
    Save,
    Trash2,
    Camera
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { toast } from 'react-hot-toast';

const StudentRegistration = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/classes/');
                setClasses(response.data);
            } catch (err) {
                console.error(err);
                toast.error("Impossible de charger les classes");
            }
        };
        fetchClasses();
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: 'M',
        address: '',
        city: 'Lomé',
        phoneNumber: '',
        email: '',

        // Academic Info
        classId: '',
        academicYear: '2024-2025',
        registrationNumber: 'REG-2024-001', // Ideally auto-generated

        // Parent Info
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        parentProfession: '',
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const promise = fetch('http://localhost:8000/api/students/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: formData.firstName,
                last_name: formData.lastName,
                birth_date: formData.birthDate || null,
                gender: formData.gender,
                address: formData.address,
                phone: formData.phoneNumber,
                email: formData.email || null,
                registration_number: formData.registrationNumber,
                establishment_id: '8ded3123-5e93-4702-861f-9c60e3cc6a34',
                class_id: '67448d3c-6f81-4b71-97b7-6de7112000ed',
                academic_year_id: 'cd173595-6a56-4c56-978d-6a56cd173595',
                parent_name: formData.parentName,
                parent_phone: formData.parentPhone,
                parent_email: formData.parentEmail || null,
                parent_profession: formData.parentProfession
            }),
        }).then(async res => {
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Failed to register student');
            }
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Enregistrement de l\'élève en cours...',
            success: 'Élève enregistré avec succès !',
            error: (err) => `Erreur : ${err.message}`,
        });

        try {
            setLoading(true);
            await promise;
            // Reset form or redirect
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nouvel Élève</h1>
                    <p className="text-gray-500 mt-1">Enregistrement d'un nouvel élève dans le système.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={Trash2}>Annuler</Button>
                    <Button icon={Save} loading={loading} onClick={handleSubmit}>Enregistrer l'élève</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Photo & Academic Info */}
                <div className="space-y-6">
                    <Card className="text-center">
                        <div className="relative inline-block mx-auto">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                <UserCircle className="w-20 h-20 text-gray-300" />
                            </div>
                            <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-900">Photo de l'élève</h3>
                            <p className="text-xs text-gray-500 mt-1">Format recommandé: 300x300px</p>
                        </div>
                    </Card>

                    <Card>
                        <Card.Header>
                            <Card.Title>Informations Académiques</Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-4">
                            <Input
                                label="Matricule"
                                value={formData.registrationNumber}
                                disabled
                                className="bg-gray-50 font-mono text-xs"
                            />
                            <Select
                                label="Classe"
                                placeholder="Sélectionner la classe"
                                options={classes.map(c => ({ value: c.id, label: c.name }))}
                                name="classId"
                                value={formData.classId}
                                onChange={handleInputChange}
                                icon={Users}
                            />
                            <Input
                                label="Année Académique"
                                value={formData.academicYear}
                                disabled
                                className="bg-gray-50"
                                icon={Calendar}
                            />
                        </Card.Content>
                    </Card>
                </div>

                {/* Right Column: Personal & Parent Info */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <Card.Header>
                                <Card.Title>Données Personnelles</Card.Title>
                            </Card.Header>
                            <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nom"
                                    placeholder="Ex: ADJO"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    label="Prénoms"
                                    placeholder="Ex: Koffi"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Genre</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'M' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${formData.gender === 'M'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            Masculin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'F' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${formData.gender === 'F'
                                                ? 'bg-pink-50 border-pink-500 text-pink-700 font-semibold shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            Féminin
                                        </button>
                                    </div>
                                </div>

                                <Input
                                    label="Date de Naissance"
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                    icon={Calendar}
                                />

                                <div className="md:col-span-2">
                                    <Input
                                        label="Adresse"
                                        placeholder="Quartier, Rue, Maison..."
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        icon={MapPin}
                                    />
                                </div>

                                <Input
                                    label="Email (Optionnel)"
                                    type="email"
                                    placeholder="eleve@ecole.tg"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    icon={Mail}
                                />
                                <Input
                                    label="Téléphone"
                                    placeholder="+228 90 00 00 00"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    icon={Phone}
                                />
                            </Card.Content>
                        </Card>

                        <Card>
                            <Card.Header>
                                <Card.Title>Informations Parent / Tuteur</Card.Title>
                            </Card.Header>
                            <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nom complet du Parent"
                                    placeholder="Ex: ADJO Yawovi"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Profession"
                                    placeholder="Enseignant, Commerçant..."
                                    name="parentProfession"
                                    value={formData.parentProfession}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Téléphone Parent"
                                    placeholder="+228 90 00 00 00"
                                    name="parentPhone"
                                    value={formData.parentPhone}
                                    onChange={handleInputChange}
                                    icon={Phone}
                                />
                                <Input
                                    label="Email Parent"
                                    type="email"
                                    placeholder="parent@gmail.com"
                                    name="parentEmail"
                                    value={formData.parentEmail}
                                    onChange={handleInputChange}
                                    icon={Mail}
                                />
                            </Card.Content>
                        </Card>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentRegistration;
