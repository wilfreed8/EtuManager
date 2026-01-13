import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Users,
    BarChart3,
    ShieldCheck,
    Building2,
    ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui';

const Landing = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">EduManager</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
                    <a href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</a>
                    <a href="#about" className="hover:text-blue-600 transition-colors">À propos</a>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/login')}>Connexion</Button>
                    <Button onClick={() => navigate('/onboarding')}>Démarrer l'essai</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-48 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Nouveau: Générateur de bulletins automatisé
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8">
                            Gérez votre établissement avec <span className="text-blue-600">excellence.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-12 max-w-xl leading-relaxed">
                            La plateforme SaaS complète pour les écoles modernes au Togo. Gérez vos élèves, notes et bulletins dans une interface fluide et sécurisée.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Button size="lg" className="px-10 py-5 text-xl h-auto shadow-xl shadow-blue-600/20" onClick={() => navigate('/onboarding')}>
                                Créer mon école
                                <ArrowRight className="ml-2 w-6 h-6" />
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 py-5 text-xl h-auto">
                                Voir la démo
                            </Button>
                        </div>
                        <div className="mt-14 flex items-center gap-6 text-base text-gray-500 font-medium">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                                ))}
                            </div>
                            <span>Déjà adopté par +50 établissements au Togo</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
                            <img
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&q=80"
                                alt="Dashboard Preview"
                                className="w-full h-auto"
                            />
                        </div>
                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 z-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Moyenne Générale</p>
                                <p className="text-lg font-bold">14.32 / 20</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Background Gradients */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-[120px] -z-10 opacity-50"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -z-10"></div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-36 bg-gray-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-28">
                        <h2 className="text-4xl font-bold mb-6 tracking-tight">Le système scolaire redéfini</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            EduManager simplifie chaque aspect de la vie scolaire pour que vous puissiez vous concentrer sur l'essentiel : la réussite de vos élèves.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: Building2, title: 'Gestion Centralisée', desc: 'Gérez plusieurs sites et niveaux scolaires depuis un seul compte.' },
                            { icon: Users, title: 'Espace Enseignants', desc: 'Saisie des notes simplifiée et suivi des classes en temps réel.' },
                            { icon: CheckCircle2, title: 'Bulletins Automatisés', desc: 'Générez des milliers de bulletins en PDF en un clic.' },
                            { icon: ShieldCheck, title: 'Sécurité Maximale', desc: 'Vos données sont cryptées et hébergées sur des serveurs sécurisés.' },
                            { icon: BarChart3, title: 'Analyses Avancées', desc: 'Visualisez les performances de chaque classe et chaque élève.' },
                            { icon: GraduationCap, title: 'Inscriptions Digitales', desc: 'Enregistrez les nouveaux élèves avec leurs dossiers complets.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <f.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-base">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg italic">
                            E
                        </div>
                        <span className="text-lg font-bold tracking-tight">EduManager</span>
                    </div>
                    <p className="text-sm text-gray-500">© 2024 EduManager Technologies. Tous droits réservés.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><ExternalLink className="w-5 h-5" /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
