import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    GraduationCap,
    BookOpen,
    UserPlus,
    FileText,
    Activity,
    CheckCircle,
    AlertCircle,
    Shield,
    MessageSquare,
    Plus,
    X,
    Trash2,
    LayoutGrid,
    Clock,
    Monitor,
    Eye
} from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '../components/ui';
import { DonutChart } from '../components/charts';
import api from '../lib/api';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Note: Recent logins would need a separate audit log API - keeping placeholder for now
const recentLogins = [
    { user: 'Sarah Jenkins', role: 'Teacher', time: 'Today, 09:41 AM', ip: '192.168.1.42', status: 'success' },
    { user: 'Mark Davis', role: 'Admin', time: 'Today, 09:15 AM', ip: '192.168.1.10', status: 'success' },
];

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        classesManaged: 0,
        studentsTrend: 0,
        teachersTrend: 0,
        gradesSubmitted: 0,
        gradesPending: 0,
    });
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [newMessage, setNewMessage] = useState({
        message: '',
        priority: 'info',
        expires_at: '',
    });
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats(prev => ({
                    ...prev,
                    totalStudents: response.data.students_count || 0,
                    totalTeachers: response.data.teachers_count || 0,
                    classesManaged: response.data.classes_count || 0,
                    gradesSubmitted: response.data.grades_submitted || 0,
                    gradesPending: response.data.grades_pending || 0,
                }));
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get('/admin-messages/all');
                setMessages(response.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };
        fetchMessages();
    }, []);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const response = await api.get('/audit-logs?limit=20');
                setAuditLogs(response.data);
            } catch (err) {
                console.error("Error fetching audit logs:", err);
            } finally {
                setLogsLoading(false);
            }
        };
        fetchAuditLogs();
    }, []);

    const handleCreateMessage = async () => {
        try {
            await api.post('/admin-messages', newMessage);
            toast.success('Message créé');
            setShowMessageModal(false);
            setNewMessage({ message: '', priority: 'info', expires_at: '' });
            // Refresh messages
            const response = await api.get('/admin-messages/all');
            setMessages(response.data);
        } catch (error) {
            toast.error('Erreur lors de la création');
        }
    };

    const handleDeleteMessage = async (id) => {
        try {
            await api.delete(`/admin-messages/${id}`);
            toast.success('Message supprimé');
            setMessages(messages.filter(m => m.id !== id));
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };


    const gradePercentage = stats.gradesSubmitted + stats.gradesPending > 0
        ? Math.round((stats.gradesSubmitted / (stats.gradesSubmitted + stats.gradesPending)) * 100)
        : 0;

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
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Here is what's happening at your school today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={UserPlus} onClick={() => navigate('/teachers')}>
                        Add Teacher
                    </Button>
                    <Button variant="outline" icon={FileText} onClick={() => navigate('/reports')}>
                        Generate Bulletins
                    </Button>
                    <Button icon={MessageSquare} onClick={() => setShowMessageModal(true)}>
                        New Message
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <Card.Content className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                                {stats.studentsTrend !== 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.studentsTrend > 0 ? '+' : ''}{stats.studentsTrend}% vs last month
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTeachers}</p>
                                {stats.teachersTrend !== 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.teachersTrend > 0 ? '+' : ''}{stats.teachersTrend}% vs last month
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Classes Managed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.classesManaged}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <LayoutGrid className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </motion.div>

            {/* Security Monitor & Grade Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Security Monitor */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Card.Title>Security Monitor</Card.Title>
                                    <Card.Description>Recent login activity and access logs</Card.Description>
                                </div>
                                <Button variant="ghost" size="sm" icon={Eye}>
                                    View all logs
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            {logsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Aucune activité récente</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <th className="pb-3">User</th>
                                                <th className="pb-3">Action</th>
                                                <th className="pb-3">Timestamp</th>
                                                <th className="pb-3">IP Address</th>
                                                <th className="pb-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {auditLogs.map((log, idx) => (
                                                <tr key={log.id || idx} className="text-sm">
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-medium text-gray-600">
                                                                    {log.user ? log.user.name.split(' ').map(n => n[0]).join('') : '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-900">
                                                                    {log.user ? log.user.name : 'Unknown'}
                                                                </span>
                                                                <div className="text-xs text-gray-500">{log.user?.role}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge
                                                            variant={
                                                                log.action === 'login' ? 'success' :
                                                                log.action === 'logout' ? 'warning' :
                                                                log.action === 'delete' ? 'danger' :
                                                                'info'
                                                            }
                                                            size="sm"
                                                        >
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        {new Date(log.created_at).toLocaleString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-3 font-mono text-gray-600">{log.ip_address}</td>
                                                    <td className="py-3">
                                                        <Badge
                                                            variant={
                                                                log.status === 'success' ? 'success' :
                                                                log.status === 'failed' ? 'danger' : 'warning'
                                                            }
                                                            dot
                                                        >
                                                            {log.status === 'success' ? 'Success' :
                                                             log.status === 'failed' ? 'Failed' : 'Warning'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Content>
                    </Card>
                </motion.div>

                {/* Grade Submissions */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <Card.Header>
                            <Card.Title>Grade Submissions</Card.Title>
                            <Card.Description>Current term progress overview</Card.Description>
                        </Card.Header>
                        <Card.Content className="flex flex-col items-center pt-4">
                            <DonutChart
                                percentage={gradePercentage}
                                size={150}
                                sublabel="COMPLETED"
                            />

                            <div className="w-full mt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                        <span className="text-sm text-gray-600">Submitted</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {stats.gradesSubmitted.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                        <span className="text-sm text-gray-600">Pending</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {stats.gradesPending.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button variant="ghost" size="sm" className="mt-4 w-full">
                                View Department Breakdown
                            </Button>
                        </Card.Content>
                    </Card>
                </motion.div>
            </div>

            {/* Active Messages Section */}
            {messages.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Messages Actifs</Card.Title>
                            <Card.Description>Messages envoyés aux enseignants</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            <div className="space-y-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-4 rounded-lg border-l-4 ${msg.priority === 'urgent'
                                            ? 'bg-red-50 border-red-500'
                                            : msg.priority === 'warning'
                                                ? 'bg-orange-50 border-orange-500'
                                                : 'bg-blue-50 border-blue-500'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{msg.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(msg.created_at).toLocaleDateString('fr-FR')} • {msg.priority}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Content>
                    </Card>
                </motion.div>
            )}

            {/* Message Creation Modal */}
            <AnimatePresence>
                {showMessageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Nouveau Message</h2>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={newMessage.message}
                                        onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows="4"
                                        placeholder="Entrez votre message..."
                                    />
                                </div>

                                <Select
                                    label="Priorité"
                                    value={newMessage.priority}
                                    onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                                >
                                    <option value="info">Information</option>
                                    <option value="warning">Avertissement</option>
                                    <option value="urgent">Urgent</option>
                                </Select>

                                <Input
                                    label="Date d'expiration (optionnel)"
                                    type="datetime-local"
                                    value={newMessage.expires_at}
                                    onChange={(e) => setNewMessage({ ...newMessage, expires_at: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleCreateMessage}
                                    className="flex-1"
                                    disabled={!newMessage.message}
                                >
                                    Envoyer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminDashboard;
