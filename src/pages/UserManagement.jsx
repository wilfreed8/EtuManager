import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Phone,
    BookOpen,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    CheckCircle2,
    X,
    Plus
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../components/ui';
import api from '../lib/api';
import { useEffect } from 'react';

import { toast } from 'react-hot-toast';
import AssignmentForm from '../components/AssignmentForm';

// Mock Teachers Data
const initialTeachers = [
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Dubois Marc', email: 'm.dubois@ecole.tg', phone: '+228 90 12 34 56', status: 'Active', assignments: ['Maths (6ème A)', 'Maths (5ème B)'] },
    { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Salami Fatou', email: 'f.salami@ecole.tg', phone: '+228 91 23 45 67', status: 'Active', assignments: ['SVT (4ème A)', 'SVT (3ème B)'] },
    { id: '323e4567-e89b-12d3-a456-426614174002', name: 'Kpodar Jean', email: 'j.kpodar@ecole.tg', phone: '+228 92 34 56 78', status: 'On Leave', assignments: ['Français (6ème C)'] },
    { id: '423e4567-e89b-12d3-a456-426614174003', name: 'Agbessi Claire', email: 'c.agbessi@ecole.tg', phone: '+228 93 45 67 89', status: 'Active', assignments: ['Physique (1ère D)', 'Maths (Terminal D)'] },
];

const UserManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Teachers
    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users?role=ENSEIGNANT');
            // Transform response to match UI expected format if needed, or update UI to match API
            // API returns: { id, name, email, role, ... }
            // UI expects attributes like 'phone', 'status', 'assignments' (which are not in User model yet)
            // We'll mock the missing ones for now or fetch them.
            // Teacher assignments are fetched separately or we assume 0 for list view?
            // For now, simple mapping:
            const mapped = response.data.map(u => ({
                ...u,
                phone: 'N/A', // Not in User model
                status: 'Active',
                assignments: [] // We'd need to fetch these or just show count
            }));
            setTeachers(mapped);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des enseignants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const handleEditAssignments = (teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignmentModalOpen(true);
    };

    // Create Teacher Logic
    const [newTeacherData, setNewTeacherData] = useState({ name: '', email: '' });
    const handleCreateTeacher = async () => {
        if (!newTeacherData.name || !newTeacherData.email) return toast.error("Champs requis");
        try {
            await api.post('/users', {
                ...newTeacherData,
                is_super_admin: false,
                can_generate_bulletins: false
            });
            toast.success("Enseignant créé !");
            setIsCreateModalOpen(false);
            setNewTeacherData({ name: '', email: '' });
            fetchTeachers();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Erreur création");
        }
    };

    const [assignmentData, setAssignmentData] = useState({
        subject_id: '',
        class_id: ''
    });

    const handleAddAssignment = async () => {
        if (!selectedTeacher || !assignmentData.subject_id || !assignmentData.class_id) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        const promise = api.post('/teachers/assignments', {
            user_id: selectedTeacher.id,
            subject_id: assignmentData.subject_id,
            class_id: assignmentData.class_id,
            academic_year_id: 'cd173595-6a56-4c56-978d-6a56cd173595' // TODO: Get active year
        });

        toast.promise(promise, {
            loading: 'Assignation en cours...',
            success: 'Assignation créée avec succès !',
            error: (err) => `Erreur : ${err.response?.data?.detail || err.message}`,
        });

        try {
            await promise;
            setIsAssignmentModalOpen(false);
            // Refresh logic if needed
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* ... Header ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
                    <p className="text-gray-500 mt-1">Gérez les comptes enseignants et leurs assignations de cours.</p>
                </div>
                <Button icon={UserPlus} onClick={() => setIsCreateModalOpen(true)}>Nouvel Enseignant</Button>
            </div>

            {/* ... Stats ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card padding="sm" className="bg-blue-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Total Enseignants</p>
                            <p className="text-2xl font-bold">84</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Comptes Actifs</p>
                            <p className="text-2xl font-bold text-gray-900">82</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Shield className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Rôles Admin</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Teachers List Card */}
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4">Enseignant</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Classes & Matières</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                {teacher.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{teacher.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Mail className="w-3 h-3" /> {teacher.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                <Phone className="w-3 h-3" /> {teacher.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {teacher.assignments.map((as, idx) => (
                                                <Badge key={idx} variant="primary" size="sm">{as}</Badge>
                                            ))}
                                            <button
                                                onClick={() => handleEditAssignments(teacher)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={teacher.status === 'Active' ? 'success' : 'warning'}
                                            dot
                                        >
                                            {teacher.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" icon={Edit}>Profil</Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" icon={Trash2} />
                                        </div>
                                        <MoreVertical className="w-5 h-5 text-gray-400 group-hover:hidden ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assignment Modal */}
            <Modal
                isOpen={isAssignmentModalOpen}
                onClose={() => setIsAssignmentModalOpen(false)}
                title={`Assignations: ${selectedTeacher?.name}`}
                description="Gérez les classes et matières pour cet enseignant."
            >
                <AssignmentForm
                    teacher={selectedTeacher}
                    onSuccess={() => setIsAssignmentModalOpen(false)}
                    assignmentData={assignmentData}
                    setAssignmentData={setAssignmentData}
                    handleAddAssignment={handleAddAssignment}
                />
            </Modal>

            {/* Create Teacher Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nouvel Enseignant"
                description="Créer un nouveau compte enseignant."
            >
                <div className="space-y-4">
                    <Input
                        label="Nom Complet"
                        value={newTeacherData.name}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, name: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={newTeacherData.email}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                    />
                    <Button onClick={handleCreateTeacher} className="w-full">Créer</Button>
                </div>
            </Modal>
        </motion.div>
    );
};

export default UserManagement;
