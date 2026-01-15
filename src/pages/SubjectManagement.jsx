import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { Settings, Plus, Save, BookOpen, AlertCircle, FileUp, Filter, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import ImportModal from '../components/ImportModal';

const SubjectManagement = ({ user }) => {
    const [activeTab, setActiveTab] = useState('library'); // 'library' or 'config'
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [classConfig, setClassConfig] = useState([]); // List of {subject_id, coefficient, enabled}
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [deletingSubjectId, setDeletingSubjectId] = useState(null);

    // New Subject Form
    const [newSubject, setNewSubject] = useState({ name: '', code: '', category: '', default_coefficient: 1 });
    const [showNewModal, setShowNewModal] = useState(false);

    const academicYearId = user?.establishment?.selected_academic_year_id || user?.establishment?.active_academic_year?.id;

    useEffect(() => {
        fetchData();
        fetchClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYearId]);

    useEffect(() => {
        if (selectedClass && activeTab === 'config') {
            fetchClassConfig(selectedClass);
        }
    }, [selectedClass, activeTab]);

    const fetchData = async () => {
        try {
            const response = await api.get('/subjects', {
                params: academicYearId ? { academic_year_id: academicYearId } : undefined,
            });
            setSubjects(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes', {
                params: academicYearId ? { academic_year_id: academicYearId } : undefined,
            });
            setClasses(response.data);
            if (response.data.length > 0) setSelectedClass(response.data[0].id);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClassConfig = async (classId) => {
        setLoading(true);
        try {
            // Get current assignments
            const response = await api.get(`/classes/${classId}/subjects`);
            const assignments = response.data;

            // Merge with all subjects to show checkboxes
            // We want to list ALL subjects, and check/set coeff for those assigned
            const mergedConfig = subjects.map(subject => {
                const assigned = assignments.find(a => a.id === subject.id);
                return {
                    subject_id: subject.id,
                    name: subject.name,
                    category: subject.category,
                    enabled: !!assigned,
                    coefficient: assigned ? assigned.pivot.coefficient : (subject.coefficient || 1)
                };
            });

            setClassConfig(mergedConfig);
        } catch (error) {
            toast.error("Erreur de chargement de la config");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async () => {
        try {
            await api.post('/subjects', {
                ...newSubject,
                academic_year_id: academicYearId,
            });
            toast.success("Matière créée");
            setShowNewModal(false);
            setNewSubject({ name: '', code: '', category: '', default_coefficient: 1 });
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        const confirmed = await new Promise((resolve) => {
            toast((t) => (
                <div className="flex items-center gap-4">
                    <span>Êtes-vous sûr de vouloir supprimer cette matière pour l'année académique sélectionnée ?</span>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(true);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Oui
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(false);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Non
                    </button>
                </div>
            ), {
                duration: Infinity,
            });
        });
        
        if (!confirmed) return;
        
        setDeletingSubjectId(subjectId);
        try {
            const response = await api.delete(`/subjects/${subjectId}?academic_year_id=${academicYearId}`);
            console.log('Delete response:', response);
            toast.success('Matière supprimée pour cette année');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setDeletingSubjectId(null);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            // Filter only enabled or previously enabled (so we can detach)
            // Actually API expects a list to sync. We probably should send ONLY enabled ones with coeffs?
            // If I send only enabled, others are detached? My API implementation uses a loop.
            // Let's refine API logic or send explicit status.
            // My API: foreach input, if enabled=false detach, else sync.
            // So we send ALL.

            await api.post(`/classes/${selectedClass}/subjects`, {
                subjects: classConfig
            });
            toast.success("Configuration enregistrée");
            // Refresh to confirm
            fetchClassConfig(selectedClass);
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Matières</h1>
                    <p className="text-gray-500">Gérez la bibliothèque des matières et leurs coefficients par classe.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'library' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Bibliothèque
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'config' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Configuration par Classe
                    </button>
                </div>
            </div>

            {activeTab === 'library' && (
                <div className="space-y-6">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Bibliothèque Globale ({subjects.length})
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" icon={FileUp} onClick={() => setIsImportModalOpen(true)}>Importer</Button>
                                <Button onClick={() => setShowNewModal(true)} icon={Plus}>Nouvelle Matière</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Nom</th>
                                        <th className="px-6 py-3">Code</th>
                                        <th className="px-6 py-3">Catégorie</th>
                                        <th className="px-6 py-3">Coeff. Défaut</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((sub) => (
                                        <tr key={sub.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{sub.name}</td>
                                            <td className="px-6 py-4"><Badge>{sub.code || '-'}</Badge></td>
                                            <td className="px-6 py-4 text-gray-500">{sub.category || '-'}</td>
                                            <td className="px-6 py-4">{sub.coefficient}</td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    icon={Trash2}
                                                    loading={deletingSubjectId === sub.id}
                                                    disabled={deletingSubjectId === sub.id}
                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {subjects.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                Aucune matière. Commencez par en créer une ou importer un fichier.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="subjects"
                establishmentId={user?.establishment_id}
                academicYearId={academicYearId}
                onSuccess={fetchData}
            />

            {activeTab === 'config' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Filter className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Sélectionner la classe à configurer :</span>
                        <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="flex-1 max-w-xs"
                        >
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold">Fonctionnement des coefficients</p>
                            <p>Cochez les matières enseignées dans cette classe et définissez leur coefficient spécifique. Ce coefficient sera utilisé pour le calcul des moyennes et sur les bulletins de cette classe uniquement.</p>
                        </div>
                    </div>

                    <Card>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Chargement...</div>
                        ) : (
                            <React.Fragment>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-800">Configuration : {classes.find(c => c.id === selectedClass)?.name}</h3>
                                    <Button onClick={handleSaveConfig} loading={saving} icon={Save}>Enregistrer les modifications</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {classConfig.map((item, idx) => (
                                        <div key={item.subject_id} className={`p-4 rounded-xl border transition-all ${item.enabled ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={item.enabled}
                                                    onChange={(e) => {
                                                        const newConfig = [...classConfig];
                                                        newConfig[idx].enabled = e.target.checked;
                                                        setClassConfig(newConfig);
                                                    }}
                                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mb-2">{item.category}</div>

                                                    {item.enabled && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <label className="text-xs font-semibold text-gray-600">Coeff:</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.coefficient}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    const newConfig = [...classConfig];
                                                                    newConfig[idx].coefficient = val;
                                                                    setClassConfig(newConfig);
                                                                }}
                                                                className="w-16 px-2 py-1 text-sm border rounded hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </React.Fragment>
                        )}
                    </Card>
                </div>
            )}

            {/* New Subject Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nouvelle Matière</h3>
                        <div className="space-y-4">
                            <Input label="Nom" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
                            <Input label="Code (ex: MATH)" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />
                            <Select label="Catégorie" value={newSubject.category} onChange={e => setNewSubject({ ...newSubject, category: e.target.value })}>
                                <option value="">Choisir...</option>
                                <option value="MATIERES LITTERAIRES">MATIERES LITTERAIRES</option>
                                <option value="MATIERES SCIENTIFIQUES">MATIERES SCIENTIFIQUES</option>
                                <option value="AUTRES MATIERES">AUTRES MATIERES</option>
                            </Select>
                            <Input type="number" label="Coefficient par défaut" value={newSubject.default_coefficient} onChange={e => setNewSubject({ ...newSubject, default_coefficient: parseInt(e.target.value) })} />
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" onClick={() => setShowNewModal(false)} className="flex-1">Annuler</Button>
                                <Button onClick={handleCreateSubject} className="flex-1">Créer</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
