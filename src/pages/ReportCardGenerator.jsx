import { useState, useEffect } from 'react';
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
    const [downloadFormat, setDownloadFormat] = useState('pdf'); // 'pdf' or 'docx' or 'html'

    // Fetch classes and periods
    useEffect(() => {
        const init = async () => {
            if (!user?.establishment_id) return;
            try {
                const activeYearId = user.establishment?.active_academic_year?.id;

                const [classRes, periodRes] = await Promise.all([
                    api.get('/classes', {
                        params: {
                            establishment_id: user.establishment_id,
                            academic_year_id: activeYearId
                        }
                    }),
                    api.get('/periods', {
                        params: {
                            academic_year_id: activeYearId
                        }
                    })
                ]);

                setClasses(classRes.data);
                if (classRes.data.length > 0) setSelectedClass(classRes.data[0].id);

                setPeriods(periodRes.data);
                if (periodRes.data.length > 0) setSelectedPeriod(periodRes.data[0].id);

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
            toast.dismiss();
            toast.error("Erreur génération bulletin");
        }
    };

    const handleDownloadBulk = async () => {
        if (!selectedClass || !selectedPeriod) {
            toast.error("Veuillez sélectionner une classe et une période");
            return;
        }

        setDownloadingBulk(true);
        const toastId = toast.loading("Préparation de l'archive ZIP...");

        try {
            // We request a ZIP blob directly
            const response = await api.get(`/bulletins/class/${selectedClass}/period/${selectedPeriod}`, {
                params: {
                    format: downloadFormat
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const className = classes.find(c => c.id === selectedClass)?.name || 'Classe';
            link.setAttribute('download', `Bulletins_${className}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss(toastId);
            toast.success("Téléchargement lancé");
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Erreur lors du téléchargement");
        } finally {
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
                        disabled={downloadingBulk || students.length === 0}
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

                    <Select
                        label="Période"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="">Sélectionner une période</option>
                        {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>

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
                                                    disabled={downloadingBulk}
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
