import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Plus, Edit, Trash2, UserPlus, Users, LayoutGrid } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ClassManagement = ({ user }) => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newClassData, setNewClassData] = useState({ name: '' });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Edit/Delete State
    const [editingClass, setEditingClass] = useState(null);
    const [classToDelete, setClassToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/classes', {
                params: {
                    academic_year_id: user.establishment.selected_academic_year_id || user.establishment.active_academic_year.id,
                    establishment_id: user.establishment_id
                }
            });
            // Fetch student counts - simpler to do 1 query or assume backend sends it?
            // Backend currently sends plain model. We'd need to count.
            // For now, let's assume we can fetch counts or updated SchoolClassController to return withCount('students').
            // If not, we show 0 or "N/A" until backend is updated.
            setClasses(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des classes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.establishment?.id) {
            fetchClasses();
        }
    }, [user, user?.establishment?.selected_academic_year_id]);

    const handleOpenCreate = () => {
        setEditingClass(null);
        setNewClassData({ name: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cls) => {
        setEditingClass(cls);
        setNewClassData({ name: cls.name });
        setIsModalOpen(true);
    };

    const handleCreateOrUpdate = async () => {
        if (!newClassData.name) return toast.error("Nom de la classe requis");
        setIsSubmitting(true);
        try {
            if (editingClass) {
                await api.put(`/classes/${editingClass.id}`, { name: newClassData.name });
                toast.success("Classe modifiée");
            } else {
                await api.post('/classes', {
                    name: newClassData.name,
                    establishment_id: user.establishment_id,
                    academic_year_id: user.establishment.selected_academic_year_id || user.establishment.active_academic_year.id
                });
                toast.success("Classe créée");
            }
            setIsModalOpen(false);
            fetchClasses();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'opération");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClickDelete = (cls) => {
        setClassToDelete(cls);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;
        try {
            await api.delete(`/classes/${classToDelete.id}`);
            toast.success("Classe supprimée");
            setIsDeleteModalOpen(false);
            setClassToDelete(null);
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast.error("Erreur suppression (classe peut-être non vide)");
        }
    };

    const handleAddStudentToClass = (cls) => {
        // Navigate to StudentManagement with state to open create modal for this class
        navigate('/students', { state: { openCreate: true, defaultClassId: cls.id } });
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
                    <p className="text-gray-500 mt-1">Année Scolaire {user?.establishment?.active_academic_year?.label || '...'}</p>
                </div>
                <Button icon={Plus} onClick={handleOpenCreate}>Nouvelle Classe</Button>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher une classe..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>
                        ))
                    ) : (
                        <>
                            {classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((cls) => (
                                <div key={cls.id} className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <LayoutGrid className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleOpenEdit(cls)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleClickDelete(cls)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cls.name}</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>{cls.students_count || 0} Élèves</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-50 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => navigate('/students', { state: { filterClassId: cls.id } })}
                                        >
                                            Voir Liste
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs"
                                            icon={UserPlus}
                                            onClick={() => handleAddStudentToClass(cls)}
                                        >
                                            Ajouter Élève
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State / Add New Card */}
                            <button
                                onClick={handleOpenCreate}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 h-full min-h-[200px]"
                            >
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400 group-hover:text-blue-500">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-medium text-gray-600 group-hover:text-blue-600">Créer une classe</span>
                            </button>
                        </>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClass ? "Modifier la Classe" : "Nouvelle Classe"}
            >
                <div className="space-y-4">
                    <Input
                        label="Nom de la classe"
                        placeholder="Ex: Tle D"
                        value={newClassData.name}
                        onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                        autoFocus
                    />
                    <Button onClick={handleCreateOrUpdate} className="w-full" disabled={isSubmitting} loading={isSubmitting}>
                        {editingClass ? "Enregistrer" : "Créer"}
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
                        Êtes-vous sûr de vouloir supprimer la classe <strong>{classToDelete?.name}</strong> ?
                        Attention : La classe doit être vide (sans élèves) pour être supprimée.
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

export default ClassManagement;
