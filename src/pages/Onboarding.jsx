import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Building2,
    BookOpen,
    UserPlus,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    School,
    Calendar,
    ShieldCheck,
    Upload,
    Loader2
} from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui';

// Sub-components moved outside to prevent focus loss during state updates
const Step1 = ({ formData, handleInputChange, onLogoClick, logoPreview }) => (
    <div className="step-content space-y-10">
        <div className="text-center mb-10 text-gray-800">
            <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <School className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Informations de l'école</h2>
            <p className="text-gray-500 text-lg mt-2">Commençons par configurer l'identité de votre établissement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
                onClick={onLogoClick}
                className="md:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100 transition-all cursor-pointer group shadow-sm relative overflow-hidden"
            >
                {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-3" />
                        <p className="text-base font-semibold text-gray-700">Télécharger le logo de l'école</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG jusqu'à 2Mo (Format carré recommandé)</p>
                    </>
                )}
            </div>

            <div className="space-y-1">
                <Input
                    label="Nom de l'établissement"
                    placeholder="Ex: Lycée Moderne de Tokoin"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    icon={Building2}
                    required
                />
            </div>

            <div className="space-y-1">
                <Select
                    label="Type d'établissement"
                    options={[
                        { value: 'PRIMAIRE', label: 'Ecole Primaire' },
                        { value: 'COLLEGE', label: 'Collège' },
                        { value: 'LYCEE', label: 'Lycée' },
                        { value: 'UNIVERSITE', label: 'Université' },
                    ]}
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                />
            </div>

            <div className="md:col-span-2 space-y-1">
                <Input
                    label="Adresse complète"
                    placeholder="Rue, Quartier, Ville, Pays"
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="md:col-span-2 space-y-1">
                <Input
                    label="Téléphone de l'établissement"
                    placeholder="+228 90 00 00 00"
                    name="schoolPhone"
                    value={formData.schoolPhone}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>
    </div>
);

const Step2 = ({ formData, handleInputChange, setFormData }) => (
    <div className="step-content space-y-6">
        <div className="text-center mb-8">
            <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold">Configuration Académique</h2>
            <p className="text-gray-500">Définissez l'année scolaire et le système d'évaluation.</p>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <Input
                    label="Année Académique"
                    placeholder="2024-2025"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                />

                <Select
                    label="Modèle de Période"
                    options={[
                        { value: 'TRIMESTRE', label: 'Trimestres (3 périodes)' },
                        { value: 'SEMESTRE', label: 'Semestres (2 périodes)' },
                    ]}
                    name="periodType"
                    value={formData.periodType}
                    onChange={handleInputChange}
                />
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Pondération des Notes (%)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Interro</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-200 rounded-lg text-center"
                            value={formData.gradingWeights.interro}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradingWeights: { ...prev.gradingWeights, interro: e.target.value } }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Devoirs</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-200 rounded-lg text-center"
                            value={formData.gradingWeights.devoir}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradingWeights: { ...prev.gradingWeights, devoir: e.target.value } }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Compo</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-200 rounded-lg text-center"
                            value={formData.gradingWeights.compo}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradingWeights: { ...prev.gradingWeights, compo: e.target.value } }))}
                        />
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600 flex justify-center">
                    Total: {parseInt(formData.gradingWeights.interro) + parseInt(formData.gradingWeights.devoir) + parseInt(formData.gradingWeights.compo)}% (Doit être 100%)
                </div>
            </div>
        </div>
    </div>
);

const Step3 = ({ formData, handleInputChange }) => (
    <div className="step-content space-y-6">
        <div className="text-center mb-8">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">Compte Administrateur</h2>
            <p className="text-gray-500">Créez le compte pour le Proviseur ou l'Administrateur IT.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <Input
                    label="Nom complet de l'Administrateur"
                    placeholder="Jean Dupont"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="md:col-span-2">
                <Input
                    label="Email professionnel"
                    type="email"
                    placeholder="admin@ecole.tg"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
            />
            <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="••••••••"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
            />
        </div>
    </div>
);

const Step4 = ({ formData, setStep }) => (
    <div className="step-content space-y-6">
        <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">Presque terminé !</h2>
            <p className="text-gray-500">Veuillez vérifier les informations avant de créer votre plateforme.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <School className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Information de l'école</h4>
                    <p className="text-sm text-gray-500">{formData.schoolName || 'Non spécifié'} • {formData.schoolType}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 font-medium hover:underline">Modifier</button>
            </div>

            <div className="flex items-start gap-4 border-t border-gray-200 pt-6">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Année & Évaluation</h4>
                    <p className="text-sm text-gray-500">
                        Année: {formData.academicYear} • Modèle: {formData.periodType}
                    </p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-blue-600 font-medium hover:underline">Modifier</button>
            </div>

            <div className="flex items-start gap-4 border-t border-gray-200 pt-6">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Compte Admin</h4>
                    <p className="text-sm text-gray-500">{formData.adminName || 'Non spécifié'} ({formData.adminEmail || 'Non spécifié'})</p>
                </div>
                <button onClick={() => setStep(3)} className="text-xs text-blue-600 font-medium hover:underline">Modifier</button>
            </div>
        </div>

        <p className="text-xs text-gray-400 text-center px-4">
            En cliquant sur "Créer ma plateforme", vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
    </div>
);

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: School Info
        schoolName: '',
        schoolAddress: '',
        schoolPhone: '',
        schoolType: 'LYCEE',
        logo: null,

        // Step 2: Academic Config
        academicYear: '2024-2025',
        periodType: 'TRIMESTRE',
        gradingWeights: { interro: 25, devoir: 25, compo: 50 },

        // Step 3: Admin Account
        adminName: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
    });

    const totalSteps = 4;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.step-content',
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [step]);

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsSubmitting(true);

        const promise = api.post('/onboarding', formData);

        toast.promise(promise, {
            loading: 'Création de votre plateforme en cours...',
            success: 'Plateforme créée avec succès ! Bienvenue.',
            error: (err) => `Erreur : ${err.response?.data?.message || err.message}`,
        });

        try {
            await promise;
            navigate('/login');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderProgress = () => (
        <div className="flex items-center justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <motion.div
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={false}
                        animate={{
                            scale: step === i ? 1.2 : 1,
                            backgroundColor: step >= i ? '#2563eb' : '#fff',
                            borderColor: step >= i ? '#2563eb' : '#e5e7eb',
                            color: step >= i ? '#fff' : '#9ca3af',
                        }}
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shadow-sm"
                    >
                        {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                    </motion.div>
                    <span className={`text-xs mt-2 font-medium ${step >= i ? 'text-blue-600' : 'text-gray-400'}`}>
                        {i === 1 ? 'École' : i === 2 ? 'Académique' : i === 3 ? 'Admin' : 'Confirmation'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 shadow-inner" ref={containerRef}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
                name="logo-upload"
            />
            <div className="w-full max-w-2xl">
                {renderProgress()}

                <Card className="shadow-2xl shadow-blue-900/10 border-none p-12 md:p-16 bg-white/80 backdrop-blur-sm">
                    <div className="min-h-[500px] flex flex-col h-full">
                        <div className="flex-1">
                            {step === 1 && <Step1
                                formData={formData}
                                handleInputChange={handleInputChange}
                                onLogoClick={handleLogoClick}
                                logoPreview={logoPreview}
                            />}
                            {step === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} setFormData={setFormData} />}
                            {step === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} />}
                            {step === 4 && <Step4 formData={formData} setStep={setStep} />}
                        </div>

                        <div className="flex items-center justify-between mt-16 pt-10 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={step === 1 || isSubmitting}
                                className={`px-6 py-3 ${step === 1 ? 'opacity-0 invisible' : ''}`}
                                icon={ChevronLeft}
                            >
                                Précédent
                            </Button>

                            <Button
                                onClick={step === totalSteps ? handleSubmit : nextStep}
                                disabled={isSubmitting}
                                className="px-10 py-4 h-auto text-lg shadow-lg shadow-blue-600/20 min-w-[180px]"
                                icon={isSubmitting ? Loader2 : (step === totalSteps ? CheckCircle2 : ChevronRight)}
                                iconPosition="right"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Chargement...
                                    </span>
                                ) : (
                                    step === totalSteps ? 'Créer ma plateforme' : 'Continuer'
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Besoin d'aide ? <a href="#" className="text-blue-500 font-medium">Contacter le support</a>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
