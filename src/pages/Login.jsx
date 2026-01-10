import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, GraduationCap, Shield } from 'lucide-react';
import { Button, Input, Select } from '../components/ui';
import api from '../lib/api';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'ENSEIGNANT',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roleOptions = [
        { value: 'ENSEIGNANT', label: 'Enseignant' },
        { value: 'SECRETAIRE', label: 'Secrétaire' },
        { value: 'CENSEUR', label: 'Censeur' },
        { value: 'PROVISEUR', label: 'Proviseur / Directeur' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call backend API
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            const user = response.data;

            // Save token
            localStorage.setItem('token', user.token);

            onLogin(user);

            // Navigate based on role
            if (user.is_super_admin) {
                navigate('/super-admin');
            } else if (user.role === 'ENSEIGNANT') {
                navigate('/my-classes'); // Direct teacher to their classes/dashboard
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80')`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-gray-900/50" />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16">
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="flex justify-center mb-10"
                    >
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                            <GraduationCap className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Bienvenue</h1>
                        <p className="text-gray-500 mt-2">Connectez-vous à votre espace EduManager</p>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Portail Scolaire</h1>
                        <p className="text-gray-500 mt-2">
                            Veuillez vous identifier pour accéder à l'espace de gestion.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Select
                            label="Profil"
                            options={roleOptions}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />

                        <Input
                            label="Identifiant / Email"
                            type="email"
                            icon={User}
                            placeholder="ex: admin@ecole.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Oublié ?
                                </button>
                            </div>
                            <Input
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={loading}
                        >
                            Se connecter
                            <span className="ml-2">→</span>
                        </Button>
                    </form>

                    {/* Security Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                            <Shield className="w-4 h-4" />
                            <span>CONNEXION SÉCURISÉE - IP LOGGED</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <p className="text-center text-white/70 text-sm mt-6">
                    © 2024 School Management System. Tous droits réservés.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
