import { useState } from 'react';
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
    Shield
} from 'lucide-react';
import { Card, Button, Badge, StatsCard } from '../components/ui';
import { DonutChart } from '../components/charts';
import api from '../lib/api';
import { useEffect } from 'react';

// Mock data
const recentLogins = [
    { user: 'Sarah Jenkins', role: 'Teacher', time: 'Today, 09:41 AM', ip: '192.168.1.42', status: 'success' },
    { user: 'Mark Davis', role: 'Admin', time: 'Today, 09:15 AM', ip: '192.168.1.10', status: 'success' },
    { user: 'Emily Chen', role: 'Staff', time: 'Today, 08:30 AM', ip: '10.0.0.55', status: '2fa' },
    { user: 'James Wilson', role: 'Teacher', time: 'Yesterday, 11:45 PM', ip: '172.16.0.23', status: 'failed' },
];

const AdminDashboard = () => {
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/establishments/stats');
                setStats(prev => ({ ...prev, ...response.data }));
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);


    const gradePercentage = Math.round(
        (stats.gradesSubmitted / (stats.gradesSubmitted + stats.gradesPending)) * 100
    );

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
                    <Button variant="outline" icon={UserPlus}>
                        Add Teacher
                    </Button>
                    <Button variant="outline" icon={FileText}>
                        Generate Bulletins
                    </Button>
                    <Button icon={Activity}>
                        View Logs
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={GraduationCap}
                    trend={stats.studentsTrend}
                    trendLabel="vs last month"
                />
                <StatsCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={Users}
                    trend={stats.teachersTrend}
                    trendLabel="vs last month"
                />
                <StatsCard
                    title="Classes Managed"
                    value={stats.classesManaged}
                    icon={BookOpen}
                    trend={0}
                    trendLabel="vs last month"
                />
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
                                <Button variant="ghost" size="sm">
                                    View all logs
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="pb-3">User</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Timestamp</th>
                                            <th className="pb-3">IP Address</th>
                                            <th className="pb-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentLogins.map((login, idx) => (
                                            <tr key={idx} className="text-sm">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {login.user.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">{login.user}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-gray-600">{login.role}</td>
                                                <td className="py-3 text-gray-600">{login.time}</td>
                                                <td className="py-3 font-mono text-gray-600">{login.ip}</td>
                                                <td className="py-3">
                                                    <Badge
                                                        variant={
                                                            login.status === 'success' ? 'success' :
                                                                login.status === 'failed' ? 'danger' : 'warning'
                                                        }
                                                        dot
                                                    >
                                                        {login.status === 'success' ? 'Success' :
                                                            login.status === 'failed' ? 'Failed' : '2FA Required'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
        </motion.div>
    );
};

export default AdminDashboard;
