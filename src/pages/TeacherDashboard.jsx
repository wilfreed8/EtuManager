import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight
} from 'lucide-react';
import StatCard from '../components/ui/StatsCard';
import ClassCard from '../components/ui/ClassCard';
import api from '../lib/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TeacherDashboard = ({ user }) => {
    const [myClasses, setMyClasses] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyClasses = async () => {
            if (!user?.id) return;
            try {
                const response = await api.get(`/teachers/my-assignments?user_id=${user.id}`);
                const mappedClasses = response.data.map(a => ({
                    id: a.id,
                    name: a.class_name,
                    subject: a.subject_name,
                    totalStudents: a.students || 0,
                    room: a.room || '-',
                    progress: a.grading_progress || 0,
                    studentsGraded: a.students_graded || 0,
                    status: a.status || 'pending',
                    class_id: a.class_id,
                    subject_id: a.subject_id,
                    statusIcon: a.status === 'completed' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />
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

    useEffect(() => {
        const fetchAdminMessages = async () => {
            try {
                const response = await api.get('/admin-messages');
                setAdminMessages(response.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };
        fetchAdminMessages();
    }, []);

    const pendingClassesCount = myClasses.filter(c => c.status === 'pending').length;
    const totalStudentsCount = myClasses.reduce((acc, c) => acc + (c.totalStudents || 0), 0);

    // Get current date
    const now = new Date();
    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500"
        >
            {/* Admin Messages Alert */}
            {adminMessages.length > 0 && (
                <div className="space-y-3">
                    {adminMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border-l-4 ${msg.priority === 'urgent'
                                    ? 'bg-red-50 border-red-500'
                                    : msg.priority === 'warning'
                                        ? 'bg-orange-50 border-orange-500'
                                        : 'bg-blue-50 border-blue-500'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    className={`w-5 h-5 mt-0.5 ${msg.priority === 'urgent'
                                            ? 'text-red-600'
                                            : msg.priority === 'warning'
                                                ? 'text-orange-600'
                                                : 'text-blue-600'
                                        }`}
                                />
                                <div className="flex-1">
                                    <p
                                        className={`font-medium ${msg.priority === 'urgent'
                                                ? 'text-red-900'
                                                : msg.priority === 'warning'
                                                    ? 'text-orange-900'
                                                    : 'text-blue-900'
                                            }`}
                                    >
                                        {msg.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            {/* Greeting Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bonjour, {user?.first_name || 'Claire'}.</h1>
                    <p className="text-slate-500 mt-1 font-medium text-lg">Here's what's happening in your classes today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-slate-700 font-semibold hover:bg-slate-50 transition-all">
                        <Calendar size={18} className="text-blue-600" />
                        <span>{formattedDate}</span>
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 px-6 py-2.5 rounded-xl shadow-lg shadow-slate-200 text-white font-semibold hover:bg-slate-800 transition-all">
                        <Plus size={18} />
                        <span>New Event</span>
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    type="alert"
                    label="Pending Grades"
                    value={String(pendingClassesCount)}
                    subtext="Action needed"
                    icon={<AlertCircle className="text-orange-500" size={24} />}
                />
                <StatCard
                    type="info"
                    label="Total Students"
                    value={String(totalStudentsCount)}
                    subtext={`Across ${myClasses.length} classes`}
                    icon={<Users className="text-blue-500" size={24} />}
                />
                <StatCard
                    type="highlight"
                    label="Next Class"
                    value="10:00"
                    unit="AM"
                    subtext="Next lesson scheduled"
                    icon={<Clock className="text-white/80" size={24} />}
                />
            </motion.div>

            {/* My Classes Grid */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-slate-400 font-medium">{myClasses.length} Assigned</span>
                    </div>
                    <Link to="/classes" className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors">
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {myClasses.map((cls) => (
                        <ClassCard key={cls.id} classData={cls} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TeacherDashboard;
