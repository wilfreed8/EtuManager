import { motion } from 'framer-motion';
import {
    Users,
    MapPin,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    Plus,
    BookOpen
} from 'lucide-react';
import { Card, Button, Badge, StatsCard } from '../components/ui';
import api from '../lib/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TeacherDashboard = ({ user }) => {
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyClasses = async () => {
            if (!user?.id) return;
            try {
                // Use the new teachers/my-assignments endpoint
                const response = await api.get(`/teachers/my-assignments?user_id=${user.id}`);
                // Map response to expected format
                const mappedClasses = response.data.map(a => ({
                    id: a.id,
                    name: a.class_name,
                    subject: a.subject_name,
                    students: a.students || 0,
                    room: a.room || '-',
                    gradingProgress: a.grading_progress || 0,
                    studentsGraded: a.students_graded || 0,
                    status: a.status || 'pending',
                    class_id: a.class_id,
                    subject_id: a.subject_id,
                }));
                setMyClasses(mappedClasses);
            } catch (err) {
                console.error("Error fetching classes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyClasses();
    }, [user?.id]);

    const pendingClasses = myClasses.filter(c => c.status === 'pending').length;
    const totalStudents = myClasses.reduce((acc, c) => acc + (c.students || 0), 0);


    // Get current date
    const now = new Date();
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', dateOptions);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto pb-12"
        >
            {/* Greeting Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Bonjour, <span className="text-blue-600">{user?.first_name || 'Professeur'}.</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Prêt à accompagner vos élèves aujourd'hui ?</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-black text-gray-700 capitalize">{formattedDate}</span>
                    </div>
                    <Button icon={Plus} className="rounded-2xl font-black px-6 py-3 shadow-lg shadow-blue-500/20">
                        Nouvel événement
                    </Button>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Grades */}
                <Card className="relative overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-3xl group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative p-8">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-1">{pendingClasses}</h3>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Notes en attente</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider italic">
                            Action requise
                        </div>
                    </div>
                </Card>

                {/* Total Students */}
                <Card className="relative overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-3xl group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative p-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-1">{totalStudents}</h3>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Total Élèves</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider italic">
                            Sur {myClasses.length} classes
                        </div>
                    </div>
                </Card>

                {/* Next Class - Gradient Card */}
                <Card className="relative overflow-hidden border-none shadow-2xl shadow-blue-500/30 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl group-hover:scale-125 transition-transform duration-700" title="Next card decorative" role="presentation" />
                    <div className="relative p-8 flex flex-col h-full justify-between">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest">
                                Prochain cours
                            </Badge>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-5xl font-black tracking-tighter mb-1">10:00</h3>
                            <p className="text-blue-100 font-bold italic">Salle 102 • 6ème A (SVT)</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* My Classes section header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mt-12 mb-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Classes</h2>
                    <div className="h-2 w-2 rounded-full bg-gray-200 mt-1" />
                    <span className="text-sm font-black text-gray-400 mt-1 uppercase tracking-widest">{myClasses.length} Assigned</span>
                </div>
                <Link to="/classes" className="text-sm font-black text-gray-500 hover:text-blue-600 flex items-center gap-2 group transition-colors">
                    View All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>

            {/* Classes Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myClasses.map((cls, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="relative overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] bg-white group p-0">
                            {/* Class Decoration */}
                            <div className={`h-3 w-full ${cls.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{cls.name}</h3>
                                        <p className="text-gray-400 font-bold italic">{cls.subject}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cls.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {cls.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-5 h-5" />}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-400">Progression</span>
                                            <span className={cls.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}>
                                                {cls.gradingProgress}%
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cls.gradingProgress}%` }}
                                                className={`h-full rounded-full ${cls.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'}`}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 italic">
                                            {cls.studentsGraded}/{cls.students} élèves notés
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span className="text-xs font-black">{cls.students} élèves</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-black">Salle {cls.room}</span>
                                        </div>
                                    </div>

                                    <Link to={`/grade-entry?class_id=${cls.class_id}&subject_id=${cls.subject_id}`}>
                                        <Button className="w-full rounded-2xl font-black py-4 group-hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                            {cls.status === 'completed' ? 'Voir la Classe' : 'Continuer la Saisie'}
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default TeacherDashboard;
