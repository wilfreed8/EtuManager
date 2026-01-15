import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Search,
    FileDown,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const ReportCardGenerator = ({ user }) => {
    const [classes, setClasses] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadingBulk, setDownloadingBulk] = useState(false);
    const [downloadingIndividuals, setDownloadingIndividuals] = useState({});
    const [downloadFormat, setDownloadFormat] = useState('pdf'); // 'pdf' or 'docx' or 'html'

    const isAnyIndividualDownloading = Object.values(downloadingIndividuals).some(Boolean);

    // Fetch classes and active period
    useEffect(() => {
        const init = async () => {
            if (!user?.establishment_id) return;
            try {
                const activeYearId = user?.establishment?.selected_academic_year_id || user?.establishment?.active_academic_year?.id;

                const [classRes, activePeriodRes] = await Promise.all([
                    api.get('/classes', {
                        params: {
                            establishment_id: user.establishment_id,
                            academic_year_id: activeYearId
                        }
                    }),
                    api.get('/active-period')
                ]);

                setClasses(classRes.data);
                if (classRes.data.length > 0) setSelectedClass(classRes.data[0].id);

                if (activePeriodRes.data) {
                    setPeriods([activePeriodRes.data]); // Set as single option
                    setSelectedPeriod(activePeriodRes.data.id);
                } else {
                    setPeriods([]);
                }

            } catch (err) {
                console.error(err);
                toast.error("Erreur chargement données init");
            }
        };
        init();
    }, [user]);

    // Fetch students when filters change
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass || !selectedPeriod) {
                setStudents([]);
                return;
            }

            setLoading(true);
            try {
                // Fetch students for the class
                const response = await api.get(`/students`, {
                    params: {
                        class_id: selectedClass,
                        establishment_id: user?.establishment_id
                    }
                });

                const mapped = response.data.map(s => ({
                    id: s.id,
                    name: `${s.last_name} ${s.first_name}`,
                    matricule: s.registration_number,
                    status: 'ready',
                }));
                setStudents(mapped);
            } catch (err) {
                console.error(err);
                // toast.error("Erreur chargement élèves");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClass, selectedPeriod, user?.establishment_id]);

    const handleDownloadIndividual = async (studentId) => {
        if (!selectedPeriod) {
            toast.error("Veuillez sélectionner une période");
            return;
        }

        setDownloadingIndividuals((prev) => ({ ...prev, [studentId]: true }));

        try {
            const toastId = toast.loading("Génération du bulletin...");
            const response = await api.get(`/bulletins/${studentId}/${selectedPeriod}`, {
                responseType: 'text' // We expect HTML string
            });

            toast.dismiss(toastId);

            // Open in new window/tab by writing content
            // This bypasses auth requirement for the URL itself
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(response.data);
                win.document.close();
            } else {
                toast.error("Pop-up bloqué. Veuillez autoriser les pop-ups.");
            }

        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error("Erreur génération bulletin");
        } finally {
            setDownloadingIndividuals((prev) => ({ ...prev, [studentId]: false }));
        }
    };

    const handleDownloadBulk = async () => {
        if (!selectedClass || !selectedPeriod) {
            toast.error("Veuillez sélectionner une classe et une période");
            return;
        }

        setDownloadingBulk(true);
        const toastId = toast.loading("Préparation du téléchargement...");

        try {
            // Create direct download link instead of blob
            const token = localStorage.getItem('token');
            const baseUrl = api.defaults.baseURL || 'http://127.0.0.1:8000/api';
            const downloadUrl = `${baseUrl}/bulletins/class/${selectedClass}/period/${selectedPeriod}?format=${downloadFormat}`;
            
            // Use fetch for authenticated download
            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/octet-stream'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get the blob from response
            const blob = await response.blob();
            
            // Check if it's actually an error (JSON disguised as blob)
            if (blob.type === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.error || 'Erreur serveur');
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            const className = classes.find(c => c.id === selectedClass)?.name || 'Classe';
            downloadLink.setAttribute('download', `Bulletins_${className}.zip`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.URL.revokeObjectURL(url);

            toast.dismiss(toastId);
            toast.success("Téléchargement terminé");
        } catch (err) {
            console.error('=== ZIP DOWNLOAD ERROR ===');
            console.error('Error message:', err.message);
            console.error('Full error:', err);
            
            toast.dismiss(toastId);
            
            // Handle specific error messages
            if (err.message?.includes('No students found')) {
                toast.error("Aucun étudiant trouvé dans cette classe");
            } else if (err.message?.includes('No bulletins could be generated')) {
                toast.error("Impossible de générer les bulletins");
            } else if (err.message?.includes('Could not create ZIP archive')) {
                toast.error("Erreur de création du fichier ZIP");
            } else if (err.message?.includes('HTTP 404')) {
                toast.error("Classe ou période non trouvée");
            } else if (err.message?.includes('HTTP 500')) {
                toast.error("Erreur serveur lors de la génération");
            } else {
                toast.error("Erreur lors du téléchargement: " + (err.message || 'Erreur inconnue'));
            }
        } finally {
            // Always set loading to false
            setDownloadingBulk(false);
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Centre de Bulletins</h1>
                    <p className="text-gray-500 mt-1">Générez et téléchargez les bulletins de notes par classe.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        icon={FileDown}
                        loading={downloadingBulk}
                        disabled={downloadingBulk || students.length === 0 || isAnyIndividualDownloading}
                        onClick={handleDownloadBulk}
                    >
                        Télécharger Tout
                    </Button>
                </div>
            </div>

            {/* Control Card */}
            <Card className="bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        label="Classe"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">Sélectionner une classe</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Période Active</label>
                        <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm text-gray-500 cursor-not-allowed">
                            {periods[0]?.name || 'Chargement...'}
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <Select
                            label="Format"
                            value={downloadFormat}
                            onChange={(e) => setDownloadFormat(e.target.value)}
                            options={[
                                { value: 'pdf', label: 'PDF (Recommandé)' },
                                { value: 'html', label: 'HTML (Web)' },
                                // { value: 'docx', label: 'Word (DOCX)' } // Backend support TBD
                            ]}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <Input
                            label="Rechercher un élève"
                            placeholder="Nom ou Matricule..."
                            icon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Students Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Élève</th>
                                <th className="px-6 py-4">Matricule</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-400 font-mono">{student.matricule}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={Download}
                                                    onClick={() => handleDownloadIndividual(student.id)}
                                                    loading={!!downloadingIndividuals[student.id]}
                                                    disabled={downloadingBulk || !!downloadingIndividuals[student.id]}
                                                >
                                                    Télécharger
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {students.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        {!selectedPeriod
                                            ? "Veuillez sélectionner un semestre pour afficher la liste."
                                            : "Aucun élève trouvé dans cette classe."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};

export default ReportCardGenerator;
