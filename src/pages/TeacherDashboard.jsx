import { motion } from 'framer-motion';
import {
    Users,
    MapPin,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    Plus
} from 'lucide-react';
import { Card, Button, Badge, StatsCard } from '../components/ui';
import api from '../lib/api';
import { useState, useEffect } from 'react';

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
            className="space-y-6"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bonjour, {user?.name?.split(' ')[0] || 'Claire'}.
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Today is {formattedDate}</span>
                    </div>
                </div>
                <Button icon={Plus}>
                    New Event
                </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Classes Pending Grades</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">{pendingClasses}</span>
                            <span className="text-sm text-orange-500">Action needed</span>
                        </div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">{totalStudents}</span>
                            <span className="text-sm text-gray-400">Across {myClasses.length} classes</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <p className="text-sm text-blue-100">Next Class</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold">10:00</span>
                        <span className="text-lg">AM</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-1">3ème B - Room 104</p>
                </Card>
            </motion.div>

            {/* My Classes */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
                        <span className="text-sm text-gray-500">{myClasses.length} Assigned</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Showing only assigned classes</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {myClasses.map((classItem) => (
                        <Card key={classItem.id} hover className="cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{classItem.name}</h3>
                                    <p className="text-sm text-gray-500">{classItem.subject}</p>
                                </div>
                                <Badge
                                    variant={classItem.status === 'completed' ? 'completed' : 'pending'}
                                    size="sm"
                                >
                                    {classItem.status === 'completed' ? '● COMPLETED' : '● PENDING'}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{classItem.students} Students</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Room {classItem.room}</span>
                                </div>
                            </div>

                            {classItem.status === 'completed' ? (
                                <Button variant="outline" className="w-full">
                                    View
                                </Button>
                            ) : (
                                <Button className="w-full">
                                    Enter Grades
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TeacherDashboard;
