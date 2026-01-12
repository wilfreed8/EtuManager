import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Phone,
    Edit,
    Trash2,
    Shield,
    CheckCircle2,
    MoreVertical
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import AssignmentForm from '../components/AssignmentForm';
import ImportModal from '../components/ImportModal';
import { FileUp } from 'lucide-react';

const UserManagement = ({ user }) => {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const initialFormState = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '' // Only for create
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Teachers
    const fetchTeachers = async () => {
        try {
            setLoading(true);
            // Fetch users with audit info
            const response = await api.get('/users-with-audit');
            const mapped = response.data.map(u => ({
                ...u,
                status: 'Active',
                assignments: u.teacher_assignments?.map(a => a.subject?.name + ' (' + a.school_class?.name + ')') || []
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
        if (user?.establishment_id) {
            fetchTeachers();
        }
    }, [user]);

    const handleOpenCreate = () => {
        setEditingTeacher(null);
        setFormData(initialFormState);
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (teacher) => {
        // Splitting name is a bit hacky if stored as one string, but okay for now
        // Or just ask for full name in edit? User wanted "Nom, Prenom".
        // Let's try to split by space, or just use "Nom Complet" field if easier. 
        // User explicitly asked for "Nom, Prenom". I will assume last word is First Name? No, that's bad.
        // I will use two fields and just joining them.

        const nameParts = teacher.name.split(' ');
        const firstName = nameParts.pop() || '';
        const lastName = nameParts.join(' ');

        setEditingTeacher(teacher);
        setFormData({
            first_name: firstName,
            last_name: lastName,
            email: teacher.email,
            phone: teacher.phone || '',
            address: teacher.address || '',
            password: '' // Keep empty
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateOrUpdate = async () => {
        if (!formData.last_name || !formData.first_name || !formData.email) {
            return toast.error("Nom, Prénom et Email requis");
        }
        if (!editingTeacher && !formData.password) {
            return toast.error("Mot de passe requis pour la création");
        }

        const payload = {
            name: `${formData.last_name} ${formData.first_name}`,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            establishment_id: user.establishment_id,
            role: 'ENSEIGNANT'
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        setIsSubmitting(true);
        try {
            if (editingTeacher) {
                await api.put(`/users/${editingTeacher.id}`, payload);
                toast.success("Enseignant modifié !");
            } else {
                await api.post('/users', {
                    ...payload,
                    is_super_admin: false,
                    can_generate_bulletins: false
                });
                toast.success("Enseignant créé !");
            }
            setIsCreateModalOpen(false);
            fetchTeachers();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.response?.data?.detail || "Erreur de traitement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClickDelete = (teacher) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            await api.delete(`/users/${teacherToDelete.id}`);
            toast.success("Enseignant supprimé");
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
            fetchTeachers();
        } catch (error) {
            console.error(error);
            toast.error("Erreur suppression");
        }
    };

    const handleEditAssignments = (teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignmentModalOpen(true);
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

        const promise = api.post('/teacher-assignments', {
            user_id: selectedTeacher.id,
            subject_id: assignmentData.subject_id,
            class_id: assignmentData.class_id,
            academic_year_id: user?.establishment?.selected_academic_year_id || user?.establishment?.active_academic_year?.id
        });

        toast.promise(promise, {
            loading: 'Assignation en cours...',
            success: 'Assignation créée avec succès !',
            error: (err) => `Erreur : ${err.response?.data?.detail || err.message}`,
        });

        try {
            await promise;
            setIsAssignmentModalOpen(false);
            fetchTeachers(); // Refresh to show new assignment count/badge
        } catch (error) {
            console.error(error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
                    <p className="text-gray-500 mt-1">Gérez les comptes enseignants et leurs assignations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={FileUp} onClick={() => setIsImportModalOpen(true)}>Importer</Button>
                    <Button icon={UserPlus} onClick={handleOpenCreate}>Nouvel Enseignant</Button>
                </div>
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="teachers"
                establishmentId={user?.establishment_id}
                onSuccess={fetchTeachers}
            />

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher par nom, email..."
                            className="pl-10"
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
                                <th className="px-6 py-4">Dernière Connexion</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                teachers.filter(t => (t.name || '').toLowerCase().includes(search.toLowerCase())).map((teacher) => (
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
                                                {teacher.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                        <Phone className="w-3 h-3" /> {teacher.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {teacher.assignments.map((as, idx) => (
                                                    <Badge key={idx} variant="primary" size="sm" className="text-[10px]">{as}</Badge>
                                                ))}
                                                <button
                                                    onClick={() => handleEditAssignments(teacher)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Assigner des cours"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {teacher.last_login ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-900">
                                                        {new Date(teacher.last_login.date).toLocaleDateString('fr-FR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                        {teacher.last_login.ip}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Jamais</span>
                                            )}
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
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Edit}
                                                    onClick={() => handleOpenEdit(teacher)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    icon={Trash2}
                                                    onClick={() => handleClickDelete(teacher)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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

            {/* Create/Edit Teacher Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={editingTeacher ? "Modifier l'Enseignant" : "Nouvel Enseignant"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nom"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                        <Input
                            label="Prénom"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Téléphone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="Adresse"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <Input
                        label={editingTeacher ? "Nouveau Mot de passe (laisser vide si inchangé)" : "Mot de passe"}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <Button onClick={handleCreateOrUpdate} className="w-full" disabled={isSubmitting} loading={isSubmitting}>
                        {editingTeacher ? "Mettre à jour" : "Créer"}
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmer la suppression"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir supprimer l'enseignant <strong>{teacherToDelete?.name}</strong> ?
                        Cette action supprimera également ses accès et assignations.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Supprimer</Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default UserManagement;
