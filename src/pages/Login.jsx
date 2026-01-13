import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Input } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', {
                email: formData.email,
                password: formData.password
            });

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            onLogin(user);

            // Navigate based on role
            if (user.is_super_admin) {
                navigate('/super-admin');
            } else if (user.role === 'ENSEIGNANT') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">EduManager</h2>
                            <p className="text-sm text-gray-500">Gestion Scolaire</p>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h1>
                        <p className="text-gray-600">Connectez-vous pour accéder à votre espace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="votre.email@ecole.com"
                                icon={Mail}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mot de passe oublié?
                                </button>
                            </div>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-full"
                            icon={loading ? Loader2 : ArrowRight}
                            iconPosition={loading ? 'left' : 'right'}
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        © 2024 EduManager. Tous droits réservés.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Image & Branding */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center overflow-hidden"
            >
                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <h2 className="text-5xl font-bold mb-6 leading-tight">
                            Gérez votre établissement en toute simplicité
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Une plateforme complète pour la gestion des notes, des élèves, et des bulletins scolaires.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                'Saisie rapide des notes',
                                'Génération automatique des bulletins',
                                'Suivi en temps réel des performances',
                                'Gestion multi-années académiques'
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                    <span className="text-blue-50">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
