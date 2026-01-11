import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Search, Edit, Trash2, UserPlus, Filter, X, FileUp } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import ImportModal from '../components/ImportModal';

const StudentManagement = ({ user }) => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');

    // Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Form State
    const initialFormState = {
        first_name: '',
        last_name: '',
        registration_number: '', // Auto-generated or manual?
        gender: 'M',
        birth_date: '',
        address: '',
        class_id: '',
        parent_name: '',
        parent_phone: '',
        parent_address: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes', {
                params: {
                    establishment_id: user?.establishment_id,
                    academic_year_id: user?.establishment?.active_academic_year?.id
                }
            });
            setClasses(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            let url = '/students';
            // Always filter by establishment
            url += `?establishment_id=${user?.establishment_id}`;

            if (selectedClass !== 'all') {
                url += `&class_id=${selectedClass}`;
            }
            const response = await api.get(url);
            setStudents(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des élèves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.filterClassId) {
            setSelectedClass(location.state.filterClassId);
            // Clear state? No, refreshing might be okay.
        }

        if (location.state?.openCreate) {
            setEditingStudent(null);
            setFormData(prev => ({
                ...initialFormState,
                class_id: location.state.defaultClassId || prev.class_id
            }));
            setIsModalOpen(true);
            // Clear state so it doesn't reopen on refresh?
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        if (user?.establishment_id) {
            fetchClasses();
            fetchStudents();
        }
    }, [user, selectedClass]);

    const handleOpenCreate = () => {
        setEditingStudent(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            first_name: student.first_name,
            last_name: student.last_name,
            registration_number: student.registration_number || '',
            gender: student.gender || 'M',
            birth_date: student.birth_date || '',
            address: student.address || '',
            class_id: student.enrollments?.[0]?.class_id || '', // Pre-fill class if enrolled
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            parent_address: student.parent_address || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.first_name || !formData.last_name) {
            return toast.error("Nom et Prénom requis");
        }

        const payload = {
            ...formData,
            establishment_id: user.establishment_id
        };

        setIsSubmitting(true);
        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent.id}`, payload);
                toast.success("Élève modifié avec succès");
            } else {
                await api.post('/students', payload);
                toast.success("Élève créé avec succès");
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClickDelete = (student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await api.delete(`/students/${studentToDelete.id}`);
            toast.success("Élève supprimé");
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
            fetchStudents();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la suppression");
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
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Élèves</h1>
                    <p className="text-gray-500 mt-1">Gérez les inscriptions et les dossiers élèves.</p>
                </div>
                <div className="flex gap-2">
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-48"
                    >
                        <option value="all">Toutes les classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    <Button variant="outline" icon={FileUp} onClick={() => setIsImportModalOpen(true)}>Importer</Button>
                    <Button icon={UserPlus} onClick={handleOpenCreate}>Nouvel Élève</Button>
                </div>
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="students"
                establishmentId={user?.establishment_id}
                onSuccess={fetchStudents}
            />

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher (Nom, Matricule)..."
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
                                <th className="px-6 py-4">Élève</th>
                                <th className="px-6 py-4">Info Classe</th>
                                <th className="px-6 py-4">Parent</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                students.filter(s =>
                                    s.last_name.toLowerCase().includes(search.toLowerCase()) ||
                                    s.first_name.toLowerCase().includes(search.toLowerCase())
                                ).map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                    {student.last_name[0]}{student.first_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{student.last_name} {student.first_name}</p>
                                                    <p className="text-xs text-gray-500">{student.registration_number || 'No Matricule'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {student.enrollments?.[0]?.school_class?.name || <Badge variant="warning">Non Inscrit</Badge>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{student.parent_name || '-'}</p>
                                                <p className="text-xs text-gray-500">{student.parent_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Edit}
                                                    onClick={() => handleOpenEdit(student)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    icon={Trash2}
                                                    onClick={() => handleClickDelete(student)}
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? "Modifier l'élève" : "Nouvel Élève"}
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
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

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Sexe"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </Select>
                        <Input
                            label="Date de Naissance"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Adresse Élève"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />

                    <Select
                        label="Classe"
                        value={formData.class_id}
                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    >
                        <option value="">Sélectionner une classe...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Informations Parent</h3>
                        <Input
                            label="Nom & Prénom Parent"
                            value={formData.parent_name}
                            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <Input
                                label="Téléphone"
                                value={formData.parent_phone}
                                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                            />
                            <Input
                                label="Adresse Parent"
                                value={formData.parent_address}
                                onChange={(e) => setFormData({ ...formData, parent_address: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full mt-4" disabled={isSubmitting} loading={isSubmitting}>
                        {editingStudent ? "Enregistrer les modifications" : "Créer l'élève"}
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
                        Êtes-vous sûr de vouloir supprimer l'élève <strong>{studentToDelete?.last_name} {studentToDelete?.first_name}</strong> ?
                        Cette action est irréversible.
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

export default StudentManagement;
